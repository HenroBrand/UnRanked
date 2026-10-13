import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  collection,
  onSnapshot,
  getDocs,
  deleteDoc,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import {
  GameRoom,
  Player,
  SecretRanking,
  RevealedRanking,
  PlayerVote,
  GameRound,
  RoundDisagreementStats,
} from '../types/game';
import { CURATED_ROUNDS } from '../data/categories';

// Generate short readable 5-character alphanumeric room codes
export function generateRoomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // No ambiguous 0/O or 1/I
  let code = '';
  for (let i = 0; i < 5; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// 1. Create a multiplayer room
export async function createRoom(
  hostPlayer: Player,
  totalRounds = 5,
  categories: string[] = []
): Promise<GameRoom> {
  const code = generateRoomCode();
  const roomId = code.toLowerCase();

  const newRoom: GameRoom = {
    id: roomId,
    code,
    hostId: hostPlayer.id,
    hostName: hostPlayer.name,
    phase: 'LOBBY',
    roundNumber: 0,
    totalRounds,
    settings: {
      totalRounds,
      timerSeconds: 60,
      selectedCategories: categories,
      useAiRounds: true,
      useSearchGrounding: false,
      modifiers: {
        doubleTrouble: false,
        hotSeat: false,
        chaosCard: false,
        speedRound: false,
        mysteryCategory: false,
        noMercy: false,
        finalBoss: true,
        reversePsychology: false,
      },
    },
    currentRound: null,
    revealStep: 0,
    status: 'active',
    updatedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  };

  const roomPath = `rooms/${roomId}`;
  try {
    await setDoc(doc(db, 'rooms', roomId), newRoom);
    await setDoc(doc(db, 'rooms', roomId, 'players', hostPlayer.id), hostPlayer);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, roomPath);
  }

  return newRoom;
}

// 2. Join a room with code validation
export async function joinRoom(code: string, player: Player): Promise<GameRoom> {
  const cleanCode = code.trim().toUpperCase();
  const roomId = cleanCode.toLowerCase();
  const roomPath = `rooms/${roomId}`;

  let roomSnap;
  try {
    roomSnap = await getDoc(doc(db, 'rooms', roomId));
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, roomPath);
  }

  if (!roomSnap || !roomSnap.exists()) {
    throw new Error(`Room with code "${cleanCode}" was not found.`);
  }

  const roomData = roomSnap.data() as GameRoom;

  // Check players count
  const playersPath = `rooms/${roomId}/players`;
  let existingPlayers;
  try {
    existingPlayers = await getDocs(collection(db, 'rooms', roomId, 'players'));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, playersPath);
  }

  if (existingPlayers.size >= 6) {
    throw new Error('This room has reached the maximum capacity of 6 players.');
  }

  // Register player in room
  try {
    await setDoc(doc(db, 'rooms', roomId, 'players', player.id), {
      ...player,
      isHost: roomData.hostId === player.id,
      lastActive: new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `rooms/${roomId}/players/${player.id}`);
  }

  return roomData;
}

// 3. Listen to Room changes
export function subscribeToRoom(
  roomId: string,
  onUpdate: (room: GameRoom) => void,
  onError?: (err: Error) => void
): () => void {
  const roomPath = `rooms/${roomId}`;
  return onSnapshot(
    doc(db, 'rooms', roomId),
    (snap) => {
      if (snap.exists()) {
        onUpdate(snap.data() as GameRoom);
      }
    },
    (error) => {
      if (onError) onError(error);
      handleFirestoreError(error, OperationType.GET, roomPath);
    }
  );
}

// 4. Listen to Players in Room
export function subscribeToPlayers(
  roomId: string,
  onUpdate: (players: Player[]) => void
): () => void {
  const playersPath = `rooms/${roomId}/players`;
  return onSnapshot(
    collection(db, 'rooms', roomId, 'players'),
    (snap) => {
      const list: Player[] = [];
      snap.forEach((d) => list.push(d.data() as Player));
      onUpdate(list);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, playersPath);
    }
  );
}

// 5. Submit Secret Ranking
export async function submitSecretRanking(
  roomId: string,
  playerId: string,
  roundNumber: number,
  rankedItemIds: ('A' | 'B' | 'C' | 'D')[]
): Promise<void> {
  const ranking: SecretRanking = {
    playerId,
    roundNumber,
    rankedItemIds,
    submittedAt: new Date().toISOString(),
  };

  const secretPath = `rooms/${roomId}/secretRankings/${playerId}`;
  try {
    await setDoc(doc(db, 'rooms', roomId, 'secretRankings', playerId), ranking);
    // Mark player as submitted
    await updateDoc(doc(db, 'rooms', roomId, 'players', playerId), {
      hasSubmittedRanking: true,
      lastActive: new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, secretPath);
  }
}

// 6. Reveal rankings (authoritative step triggered by Host or upon all submits)
export async function publishRevealedRankings(
  roomId: string,
  roundNumber: number,
  players: Player[]
): Promise<void> {
  const secretPath = `rooms/${roomId}/secretRankings`;
  try {
    const secretsSnap = await getDocs(collection(db, 'rooms', roomId, 'secretRankings'));
    const secretMap = new Map<string, ('A' | 'B' | 'C' | 'D')[]>();

    secretsSnap.forEach((d) => {
      const data = d.data() as SecretRanking;
      if (data.roundNumber === roundNumber) {
        secretMap.set(data.playerId, data.rankedItemIds);
      }
    });

    // Write to revealedRankings collection
    for (const p of players) {
      const items = secretMap.get(p.id) || ['A', 'B', 'C', 'D']; // Fallback if timed out
      const revealed: RevealedRanking = {
        playerId: p.id,
        playerName: p.name,
        avatar: p.avatar,
        color: p.color,
        roundNumber,
        rankedItemIds: items,
      };
      await setDoc(doc(db, 'rooms', roomId, 'revealedRankings', p.id), revealed);
    }

    // Set room reveal step to 0 and phase to REVEAL
    await updateDoc(doc(db, 'rooms', roomId), {
      phase: 'REVEAL',
      revealStep: 0,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, secretPath);
  }
}

// 7. Subscribe to Revealed Rankings
export function subscribeToRevealedRankings(
  roomId: string,
  onUpdate: (rankings: RevealedRanking[]) => void
): () => void {
  const revealedPath = `rooms/${roomId}/revealedRankings`;
  return onSnapshot(
    collection(db, 'rooms', roomId, 'revealedRankings'),
    (snap) => {
      const list: RevealedRanking[] = [];
      snap.forEach((d) => list.push(d.data() as RevealedRanking));
      onUpdate(list);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, revealedPath);
    }
  );
}

// 8. Submit Vote for Worst Choices
export async function submitVote(
  roomId: string,
  voter: Player,
  targetPlayerId: string,
  reactionPhrase: string,
  roundNumber: number
): Promise<void> {
  const vote: PlayerVote = {
    voterId: voter.id,
    voterName: voter.name,
    targetPlayerId,
    reactionPhrase,
    roundNumber,
  };

  const votePath = `rooms/${roomId}/votes/${voter.id}`;
  try {
    await setDoc(doc(db, 'rooms', roomId, 'votes', voter.id), vote);
    await updateDoc(doc(db, 'rooms', roomId, 'players', voter.id), {
      hasVoted: true,
      lastActive: new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, votePath);
  }
}

// 9. Subscribe to Votes
export function subscribeToVotes(
  roomId: string,
  onUpdate: (votes: PlayerVote[]) => void
): () => void {
  const votesPath = `rooms/${roomId}/votes`;
  return onSnapshot(
    collection(db, 'rooms', roomId, 'votes'),
    (snap) => {
      const list: PlayerVote[] = [];
      snap.forEach((d) => list.push(d.data() as PlayerVote));
      onUpdate(list);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, votesPath);
    }
  );
}

// 10. Calculate Consensus & Disagreement Statistics
export function calculateRoundAnalytics(
  round: GameRound,
  rankings: RevealedRanking[],
  players: Player[],
  votes: PlayerVote[]
): {
  playerScoresEarned: Record<string, { consensus: number; worstChoices: number; special: number; total: number }>;
  worstChoicesWinners: string[];
  analytics: RoundDisagreementStats;
} {
  // Rank index for item X in rankedItemIds: rank = index + 1 (1 to 4)
  const itemRanks: Record<string, number[]> = { A: [], B: [], C: [], D: [] };
  const playerItemRanks: Record<string, Record<string, number>> = {};

  rankings.forEach((r) => {
    playerItemRanks[r.playerId] = {};
    r.rankedItemIds.forEach((itemId, idx) => {
      const rank = idx + 1;
      itemRanks[itemId].push(rank);
      playerItemRanks[r.playerId][itemId] = rank;
    });
  });

  // Calculate medians
  const medians: Record<string, number> = {};
  ['A', 'B', 'C', 'D'].forEach((id) => {
    const list = [...(itemRanks[id] || [])].sort((a, b) => a - b);
    if (list.length === 0) {
      medians[id] = 2.5;
      return;
    }
    const mid = Math.floor(list.length / 2);
    medians[id] = list.length % 2 !== 0 ? list[mid] : Math.round((list[mid - 1] + list[mid]) / 2);
  });

  // Tally Votes for Worst Choices
  const voteTallies: Record<string, number> = {};
  votes.forEach((v) => {
    voteTallies[v.targetPlayerId] = (voteTallies[v.targetPlayerId] || 0) + 1;
  });

  let maxVotes = 0;
  Object.values(voteTallies).forEach((v) => {
    if (v > maxVotes) maxVotes = v;
  });

  const worstChoicesWinners: string[] = [];
  if (maxVotes > 0) {
    Object.entries(voteTallies).forEach(([pid, count]) => {
      if (count === maxVotes) worstChoicesWinners.push(pid);
    });
  }

  // Calculate scores per player
  const playerScoresEarned: Record<string, { consensus: number; worstChoices: number; special: number; total: number }> = {};

  players.forEach((p) => {
    let consensus = 0;
    const pRanks = playerItemRanks[p.id] || {};
    ['A', 'B', 'C', 'D'].forEach((id) => {
      if (pRanks[id] === medians[id]) {
        consensus += 1;
      }
    });

    const worstChoices = worstChoicesWinners.includes(p.id) ? 3 : 0;
    const special = consensus === 4 ? 1 : 0; // Perfect consensus bonus
    const total = consensus + worstChoices + special;

    playerScoresEarned[p.id] = {
      consensus,
      worstChoices,
      special,
      total,
    };
  });

  // Disagreement analysis
  let highestVariance = -1;
  let mostControversialId = 'A';
  ['A', 'B', 'C', 'D'].forEach((id) => {
    const vals = itemRanks[id] || [];
    if (vals.length < 2) return;
    const mean = vals.reduce((a, b) => a + b, 0) / vals.length;
    const variance = vals.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / vals.length;
    if (variance > highestVariance) {
      highestVariance = variance;
      mostControversialId = id;
    }
  });

  const controversialItem = round.items.find((i) => i.id === mostControversialId) || round.items[0];

  return {
    playerScoresEarned,
    worstChoicesWinners,
    analytics: {
      mostControversialItem: {
        item: controversialItem,
        ranks: Object.fromEntries(players.map((p) => [p.name, playerItemRanks[p.id]?.[mostControversialId] || 2])),
        variance: highestVariance,
      },
      biggestDivergence: null,
      consensusMatches: Object.fromEntries(players.map((p) => [p.name, playerScoresEarned[p.id]?.consensus || 0])),
      unanimousItem: null,
    },
  };
}

// 11. Fetch next round (uses AI generator with fallback to curated library)
export async function getNextRound(
  roundIndex: number,
  categoryName?: string,
  useAi = true,
  useSearchGrounding = false
): Promise<GameRound> {
  const category = categoryName || CURATED_ROUNDS[roundIndex % CURATED_ROUNDS.length].category;

  if (useAi) {
    try {
      const endpoint = useSearchGrounding ? '/api/search-grounded-round' : '/api/generate-round';
      const body = useSearchGrounding
        ? { queryTopic: category }
        : { category, customPrompt: 'absurd high-stakes social and daily dilemma' };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.items && data.items.length === 4) {
          return data;
        }
      }
    } catch (err) {
      console.warn('AI round generation failed, falling back to curated round library:', err);
    }
  }

  // Curated fallback
  const curated = CURATED_ROUNDS[roundIndex % CURATED_ROUNDS.length];
  return JSON.parse(JSON.stringify(curated));
}
