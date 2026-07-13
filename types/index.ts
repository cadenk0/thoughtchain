export type GameMode = "endless" | "bridge";

export interface ChainNode {
  word: string;
  rank?: number;        // 1-30 semantic rank
  rankLabel?: string;   // "1st", "5th", etc.
  rankTier?: "gold" | "silver" | "bronze" | "none";
  points?: number;      // 31 - rank (higher = better)
  timestamp?: number;
}

export interface LeaderboardEntry {
  rank: number;
  username: string;
  chainLength: number;
  totalPoints: number;
  duration: number;
  chain: string[];
  sessionId: string;
  submittedAt: string;
  gameMode: GameMode;
  // Bridge mode extras
  won?: boolean;       // reached the target
  bridgeScore?: number; // lower = better (steps * 10 - points)
  score?: number;      // legacy compat
}

export interface DailyPuzzle {
  dayId: string;
  date: string;
  puzzleNumber: number;
  // Endless mode
  seedWord: string;
  // Bridge mode
  startWord: string;
  targetWord: string;
}

export interface AssociationMap {
  [word: string]: string[];
}

export interface SubmitScorePayload {
  sessionId: string;
  dayId: string;
  chain: ChainNode[];
  username?: string;
  duration: number;
  gameMode: GameMode;
  won?: boolean;
}
