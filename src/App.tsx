import React, { useState, useEffect } from 'react';
import {
  GameRoom,
  Player,
  GameSettings,
  RevealedRanking,
  PlayerVote,
} from './types/game';
import {
  createRoom,
  joinRoom,
  subscribeToRoom,
  subscribeToPlayers,
  submitSecretRanking,
  publishRevealedRankings,
  subscribeToRevealedRankings,
  submitVote,
  subscribeToVotes,
  calculateRoundAnalytics,
  getNextRound,
} from './services/gameService';
import { ensureAuthenticatedSession, testConnection, db } from './firebase';
import { sounds } from './utils/sound';
import { Navbar } from './components/Navbar';
import { HomeScreen } from './components/HomeScreen';
import { RoomLobby } from './components/RoomLobby';
import { RankingBoard } from './components/RankingBoard';
import { RevealSequence } from './components/RevealSequence';
import { RoundResults } from './components/RoundResults';
import { FinalResults } from './components/FinalResults';
import { doc, updateDoc, setDoc } from 'firebase/firestore';

const LOCAL_STORAGE_KEY = 'unranked_player_profile';

export default function App() {
  // Local Player Profile State
  const [player, setPlayer] = useState<Player>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // Fallback below
      }
    }
    const defaultId = 'p_' + Math.random().toString(36).substring(2, 9);
    return {
      id: defaultId,
      name: 'Player ' + Math.floor(100 + Math.random() * 900),
      avatar: '🍞',
      color: '#CCFF00',
      isHost: false,
      isReady: false,
      totalScore: 0,
      roundScore: 0,
      consensusPoints: 0,
      worstChoiceAwards: 0,
      specialAwards: 0,
      hasSubmittedRanking: false,
      hasVoted: false,
      lastActive: new Date().toISOString(),
    };
  });

  // Active Game State
  const [room, setRoom] = useState<GameRoom | null>(null);
  const [players, setPlayers] = useState<Player[]>([player]);
  const [revealedRankings, setRevealedRankings] = useState<RevealedRanking[]>([]);
  const [votes, setVotes] = useState<PlayerVote[]>([]);
  const [hasSubmittedRanking, setHasSubmittedRanking] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);
  const [isJoiningRoom, setIsJoiningRoom] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);

  // Modals
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(false);

  // Persist local player profile
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(player));
  }, [player]);

  // Authenticate session & test Firestore connection on mount
  useEffect(() => {
    ensureAuthenticatedSession()
      .then((authUser) => {
        if (authUser) {
          setPlayer((prev) => ({
            ...prev,
            id: authUser.uid,
          }));
        }
      })
      .catch((err) => console.warn('Auth initialization fallback:', err));

    testConnection().then((ok) => {
      if (!ok) {
        console.warn('Firestore offline check.');
      }
    });
  }, []);

  // Subscribe to Room and Subcollections when inside a room
  useEffect(() => {
    if (!room?.id) return;

    const unsubRoom = subscribeToRoom(
      room.id,
      (updatedRoom) => {
        setRoom(updatedRoom);
      },
      (err) => {
        console.warn('Room subscribe error:', err);
      }
    );

    const unsubPlayers = subscribeToPlayers(room.id, (updatedPlayers) => {
      setPlayers(updatedPlayers);
      // Sync local player flags
      const me = updatedPlayers.find((p) => p.id === player.id);
      if (me) {
        setHasSubmittedRanking(me.hasSubmittedRanking);
        setHasVoted(me.hasVoted);
      }
    });

    const unsubRevealed = subscribeToRevealedRankings(room.id, (rankings) => {
      setRevealedRankings(rankings);
    });

    const unsubVotes = subscribeToVotes(room.id, (newVotes) => {
      setVotes(newVotes);
    });

    return () => {
      unsubRoom();
      unsubPlayers();
      unsubRevealed();
      unsubVotes();
    };
  }, [room?.id, player.id]);

  // Host Action: Check if all players have submitted ranking, trigger reveal
  useEffect(() => {
    if (!room || room.phase !== 'RANKING') return;
    const isHost = player.id === room.hostId || player.isHost;
    if (!isHost) return;

    if (players.length > 0 && players.every((p) => p.hasSubmittedRanking)) {
      publishRevealedRankings(room.id, room.roundNumber, players);
    }
  }, [room, players, player]);

  // Trigger bot votes automatically when in REVEAL phase (single unified page)
  useEffect(() => {
    if (!room || (room.phase !== 'REVEAL' && room.phase !== 'VOTING')) return;
    const isHost = player.id === room.hostId || player.isHost;
    if (!isHost) return;

    const bots = players.filter((p) => p.id.startsWith('bot_'));
    bots.forEach((b) => {
      setTimeout(async () => {
        const targets = players.filter((p) => p.id !== b.id);
        const target = targets[Math.floor(Math.random() * targets.length)];
        if (target) {
          await submitVote(room.id, b, target.id, 'Unbelievable choices 🚨', room.roundNumber);
        }
      }, 1400);
    });
  }, [room?.phase, room?.roundNumber]);

  // 1. Create Room Handler
  const handleCreateRoom = async (totalRounds = 5, categories: string[] = []) => {
    try {
      setGlobalError(null);
      const hostP: Player = { ...player, isHost: true, isReady: true };
      setPlayer(hostP);
      const newRoom = await createRoom(hostP, totalRounds, categories);
      setRoom(newRoom);
      sounds.playVictoryFlourish();
    } catch (err: any) {
      console.error('Create room error:', err);
      setGlobalError(err.message || 'Failed to create room.');
    }
  };

  // 2. Join Room Handler
  const handleJoinRoom = async (code: string) => {
    setIsJoiningRoom(true);
    setGlobalError(null);
    try {
      const joinedRoom = await joinRoom(code, player);
      setRoom(joinedRoom);
      sounds.playBoing();
    } catch (err: any) {
      console.error('Join room error:', err);
      setGlobalError(err.message || 'Could not join room.');
    } finally {
      setIsJoiningRoom(false);
    }
  };

  // 3. Toggle Player Ready state
  const handleToggleReady = async () => {
    if (!room) return;
    const nextReady = !player.isReady;
    setPlayer((prev) => ({ ...prev, isReady: nextReady }));

    try {
      await updateDoc(doc(db, 'rooms', room.id, 'players', player.id), {
        isReady: nextReady,
        lastActive: new Date().toISOString(),
      });
    } catch (err) {
      console.warn('Update ready state error:', err);
    }
  };

  // 4. Update Game Settings (Host only)
  const handleUpdateSettings = async (settingsUpdate: Partial<GameSettings>) => {
    if (!room) return;
    const updatedSettings = { ...room.settings, ...settingsUpdate };
    setRoom((prev) => (prev ? { ...prev, settings: updatedSettings } : null));

    try {
      await updateDoc(doc(db, 'rooms', room.id), {
        settings: updatedSettings,
        totalRounds: updatedSettings.totalRounds,
        updatedAt: new Date().toISOString(),
      });
    } catch (err) {
      console.warn('Update settings error:', err);
    }
  };

  // 5. Add AI Test Bot Friend
  const handleAddBotPlayer = async () => {
    if (!room || players.length >= 6) return;
    const botNames = ['Barnaby Bot 🤖', 'Madame Chaos 🎭', 'Dr. Debacle 🧪', 'Captain Clueless ⛵'];
    const botEmojis = ['🤖', '🤡', '👽', '🦖'];
    const botColors = ['#CCFF00', '#A594F9', '#00F5D4', '#FF3366'];
    const idx = players.length - 1;

    const botId = 'bot_' + Math.random().toString(36).substring(2, 7);
    const botPlayer: Player = {
      id: botId,
      name: botNames[idx % botNames.length],
      avatar: botEmojis[idx % botEmojis.length],
      color: botColors[idx % botColors.length],
      isHost: false,
      isReady: true,
      totalScore: 0,
      roundScore: 0,
      consensusPoints: 0,
      worstChoiceAwards: 0,
      specialAwards: 0,
      hasSubmittedRanking: false,
      hasVoted: false,
      lastActive: new Date().toISOString(),
    };

    try {
      await setDoc(doc(db, 'rooms', room.id, 'players', botId), botPlayer);
      sounds.playBoing();
    } catch (err) {
      console.warn('Add bot error:', err);
    }
  };

  // 6. Start Game (Host only)
  const handleStartGame = async () => {
    if (!room) return;
    try {
      const firstRound = await getNextRound(
        0,
        room.settings.selectedCategories?.[0],
        room.settings.useAiRounds,
        room.settings.useSearchGrounding
      );

      for (const p of players) {
        await updateDoc(doc(db, 'rooms', room.id, 'players', p.id), {
          hasSubmittedRanking: false,
          hasVoted: false,
          roundScore: 0,
        });
      }

      await updateDoc(doc(db, 'rooms', room.id), {
        phase: 'RANKING',
        roundNumber: 1,
        currentRound: firstRound,
        revealStep: 0,
        updatedAt: new Date().toISOString(),
      });

      // If test bot players exist, simulate their secret ranking submission after 1.5s
      const bots = players.filter((p) => p.id.startsWith('bot_'));
      bots.forEach((b) => {
        setTimeout(async () => {
          const shuffled = (['A', 'B', 'C', 'D'] as ('A' | 'B' | 'C' | 'D')[]).sort(
            () => Math.random() - 0.5
          );
          await submitSecretRanking(room.id, b.id, 1, shuffled);
        }, 1500);
      });
    } catch (err) {
      console.error('Start game error:', err);
    }
  };

  // 7. Submit Secret Ranking
  const handleSubmitRanking = async (rankedIds: ('A' | 'B' | 'C' | 'D')[]) => {
    if (!room) return;
    setHasSubmittedRanking(true);
    await submitSecretRanking(room.id, player.id, room.roundNumber, rankedIds);
  };

  // 8. Proceed to Voting
  const handleProceedToVoting = async () => {
    if (!room) return;
    try {
      await updateDoc(doc(db, 'rooms', room.id), {
        phase: 'VOTING',
        updatedAt: new Date().toISOString(),
      });

      const bots = players.filter((p) => p.id.startsWith('bot_'));
      bots.forEach((b) => {
        setTimeout(async () => {
          const targets = players.filter((p) => p.id !== b.id);
          const target = targets[Math.floor(Math.random() * targets.length)];
          if (target) {
            await submitVote(room.id, b, target.id, 'Unbelievable choices 🚨', room.roundNumber);
          }
        }, 1200);
      });
    } catch (err) {
      console.warn('Proceed to voting error:', err);
    }
  };

  // 9. Cast Vote for Worst Choices
  const handleCastVote = async (targetPlayerId: string, reactionPhrase: string) => {
    if (!room) return;
    setHasVoted(true);
    await submitVote(room.id, player, targetPlayerId, reactionPhrase, room.roundNumber);
  };

  // 10. Proceed to Round Results & Tally Scores
  const handleProceedToRoundResults = async () => {
    if (!room || !room.currentRound) return;

    const { playerScoresEarned, worstChoicesWinners } = calculateRoundAnalytics(
      room.currentRound,
      revealedRankings,
      players,
      votes
    );

    for (const p of players) {
      const earned = playerScoresEarned[p.id] || { total: 0, worstChoices: 0 };
      await updateDoc(doc(db, 'rooms', room.id, 'players', p.id), {
        totalScore: p.totalScore + earned.total,
        roundScore: earned.total,
        worstChoiceAwards: p.worstChoiceAwards + (earned.worstChoices > 0 ? 1 : 0),
        lastActive: new Date().toISOString(),
      });
    }

    await updateDoc(doc(db, 'rooms', room.id), {
      phase: 'ROUND_RESULTS',
      worstChoicesWinnerId: worstChoicesWinners[0] || '',
      updatedAt: new Date().toISOString(),
    });
  };

  // 11. Advance to Next Round or Final Results
  const handleNextRound = async () => {
    if (!room) return;
    const nextRoundNum = room.roundNumber + 1;

    if (nextRoundNum > room.totalRounds) {
      await updateDoc(doc(db, 'rooms', room.id), {
        phase: 'FINAL_RESULTS',
        status: 'completed',
        updatedAt: new Date().toISOString(),
      });
      return;
    }

    const nextRoundData = await getNextRound(
      nextRoundNum - 1,
      room.settings.selectedCategories?.[nextRoundNum % (room.settings.selectedCategories.length || 1)],
      room.settings.useAiRounds,
      room.settings.useSearchGrounding
    );

    for (const p of players) {
      await updateDoc(doc(db, 'rooms', room.id, 'players', p.id), {
        hasSubmittedRanking: false,
        hasVoted: false,
        roundScore: 0,
      });
    }

    await updateDoc(doc(db, 'rooms', room.id), {
      phase: 'RANKING',
      roundNumber: nextRoundNum,
      currentRound: nextRoundData,
      revealStep: 0,
      updatedAt: new Date().toISOString(),
    });

    const bots = players.filter((p) => p.id.startsWith('bot_'));
    bots.forEach((b) => {
      setTimeout(async () => {
        const shuffled = (['A', 'B', 'C', 'D'] as ('A' | 'B' | 'C' | 'D')[]).sort(
          () => Math.random() - 0.5
        );
        await submitSecretRanking(room.id, b.id, nextRoundNum, shuffled);
      }, 1500);
    });
  };

  // 12. Rematch
  const handleRematch = async () => {
    if (!room) return;
    for (const p of players) {
      await updateDoc(doc(db, 'rooms', room.id, 'players', p.id), {
        totalScore: 0,
        roundScore: 0,
        worstChoiceAwards: 0,
        specialAwards: 0,
        hasSubmittedRanking: false,
        hasVoted: false,
        isReady: false,
      });
    }

    await updateDoc(doc(db, 'rooms', room.id), {
      phase: 'LOBBY',
      roundNumber: 0,
      currentRound: null,
      status: 'active',
      updatedAt: new Date().toISOString(),
    });
  };

  const roundAnalytics = room?.currentRound
    ? calculateRoundAnalytics(room.currentRound, revealedRankings, players, votes)
    : { playerScoresEarned: {}, worstChoicesWinners: [] };

  return (
    <div className="min-h-screen bg-[#FAF5E8] dark:bg-[#121118] text-[#141316] dark:text-[#FAF5E8] flex flex-col font-['Fredoka'] transition-colors">
      {/* Top Navigation */}
      <Navbar
        room={room}
        onOpenLeaderboard={() => setIsLeaderboardOpen(!isLeaderboardOpen)}
      />

      {/* Global Error Notification */}
      {globalError && (
        <div className="bg-[#FF4834] text-white font-bungee text-xs p-2.5 text-center flex items-center justify-center gap-2 border-b-2 border-[#141316]">
          <span>⚠️ {globalError}</span>
          <button
            onClick={() => setGlobalError(null)}
            className="underline ml-2 cursor-pointer font-bold bg-white text-[#141316] px-2 py-0.5 rounded"
          >
            DISMISS
          </button>
        </div>
      )}

      {/* Main View Router based on Game Phase */}
      <main className="flex-1">
        {!room ? (
          <HomeScreen
            player={player}
            onUpdatePlayer={(upd) => setPlayer((prev) => ({ ...prev, ...upd }))}
            onCreateRoom={handleCreateRoom}
            onJoinRoom={handleJoinRoom}
            isJoining={isJoiningRoom}
          />
        ) : room.phase === 'LOBBY' ? (
          <RoomLobby
            room={room}
            currentPlayer={player}
            players={players}
            onToggleReady={handleToggleReady}
            onUpdateSettings={handleUpdateSettings}
            onStartGame={handleStartGame}
            onAddBotPlayer={handleAddBotPlayer}
          />
        ) : room.phase === 'RANKING' && room.currentRound ? (
          <RankingBoard
            round={room.currentRound}
            roundNumber={room.roundNumber}
            totalRounds={room.totalRounds}
            currentPlayer={player}
            players={players}
            hasSubmitted={hasSubmittedRanking}
            onSubmitRanking={handleSubmitRanking}
            timerSeconds={room.settings.timerSeconds}
            onTimeExpired={() => {
              if (!hasSubmittedRanking) {
                handleSubmitRanking(['A', 'B', 'C', 'D']);
              }
            }}
          />
        ) : (room.phase === 'REVEAL' || room.phase === 'VOTING') && room.currentRound ? (
          <RevealSequence
            round={room.currentRound}
            revealedRankings={revealedRankings}
            currentPlayer={player}
            players={players}
            votes={votes}
            hasVoted={hasVoted}
            onCastVote={handleCastVote}
            onProceedToResults={handleProceedToRoundResults}
            isHost={player.id === room.hostId || player.isHost}
          />
        ) : room.phase === 'ROUND_RESULTS' && room.currentRound ? (
          <RoundResults
            round={room.currentRound}
            roundNumber={room.roundNumber}
            totalRounds={room.totalRounds}
            players={players}
            playerScoresEarned={roundAnalytics.playerScoresEarned}
            worstChoicesWinners={roundAnalytics.worstChoicesWinners}
            votes={votes}
            isHost={player.id === room.hostId || player.isHost}
            onNextRound={handleNextRound}
          />
        ) : room.phase === 'FINAL_RESULTS' ? (
          <FinalResults
            room={room}
            players={players}
            onRematch={handleRematch}
            onReturnToLobby={() => {
              setRoom(null);
            }}
          />
        ) : null}
      </main>
    </div>
  );
}
