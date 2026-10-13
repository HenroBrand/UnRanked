export type GamePhase =
  | 'LOBBY'
  | 'ROUND_INTRO'
  | 'RANKING'
  | 'REVEAL'
  | 'VOTING'
  | 'ROUND_RESULTS'
  | 'FINAL_RESULTS';

export type HostMood =
  | 'neutral'
  | 'excited'
  | 'suspicious'
  | 'shocked'
  | 'disappointed'
  | 'laughing'
  | 'offended'
  | 'celebrating';

export interface RankingItem {
  id: 'A' | 'B' | 'C' | 'D';
  title: string;
  description: string;
  icon_suggestion: string;
}

export interface GameRound {
  id?: string;
  category: string;
  prompt: string;
  scale_labels: {
    rank_1: string; // e.g. "1. Completely Fine"
    rank_4: string; // e.g. "4. Culinary Crime"
  };
  items: RankingItem[];
  host_commentary: string;
  isReverse?: boolean; // When reverse psychology modifier is active
  isDoublePoints?: boolean; // When double trouble is active
}

export interface Player {
  id: string;
  name: string;
  avatar: string; // avatar key or emoji
  color: string; // CSS color string / hex
  isHost: boolean;
  isReady: boolean;
  totalScore: number;
  roundScore: number;
  consensusPoints: number;
  worstChoiceAwards: number;
  specialAwards: number;
  hasSubmittedRanking: boolean;
  hasVoted: boolean;
  lastActive: string;
}

export interface SecretRanking {
  playerId: string;
  roundNumber: number;
  rankedItemIds: ('A' | 'B' | 'C' | 'D')[];
  submittedAt: string;
}

export interface RevealedRanking {
  playerId: string;
  playerName: string;
  avatar: string;
  color: string;
  roundNumber: number;
  rankedItemIds: ('A' | 'B' | 'C' | 'D')[];
}

export interface PlayerVote {
  voterId: string;
  voterName: string;
  targetPlayerId: string;
  reactionPhrase: string;
  roundNumber: number;
}

export interface GameSettings {
  totalRounds: number;
  timerSeconds: number; // 0 for untimed, 30, 45, 60, 90
  selectedCategories: string[];
  useAiRounds: boolean;
  useSearchGrounding: boolean;
  modifiers: {
    doubleTrouble: boolean;
    hotSeat: boolean;
    chaosCard: boolean;
    speedRound: boolean;
    mysteryCategory: boolean;
    noMercy: boolean;
    finalBoss: boolean;
    reversePsychology: boolean;
  };
}

export interface GameRoom {
  id: string;
  code: string;
  hostId: string;
  hostName: string;
  phase: GamePhase;
  roundNumber: number;
  totalRounds: number;
  settings: GameSettings;
  currentRound: GameRound | null;
  revealStep: number; // 0: suspense, 1: rank 4, 2: rank 3, 3: rank 2, 4: rank 1, 5: all
  worstChoicesWinnerId?: string;
  status: 'active' | 'completed' | 'abandoned';
  updatedAt: string;
  createdAt: string;
}

export interface RoundDisagreementStats {
  mostControversialItem: {
    item: RankingItem;
    ranks: Record<string, number>;
    variance: number;
  };
  biggestDivergence: {
    playerA: string;
    playerB: string;
    divergence: number;
  } | null;
  consensusMatches: Record<string, number>;
  unanimousItem: RankingItem | null;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt?: string;
}
