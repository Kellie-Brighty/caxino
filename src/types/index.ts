export interface Player {
  address: string;
  points: number;
  gamesPlayed: number;
  username: string;
  lastUpdated?: string;
  gameHistory?: Array<{
    points: number;
    timestamp: string;
  }>;
}

export interface GameState {
  userNumbers: number[];
  systemNumbers: number[];
  attempts: number;
  points: number;
  isGameStarted: boolean;
  isWalletConnected: boolean;
  username: string | null;
  walletAddress: string | null;
}

export interface LeaderboardEntry {
  username: string;
  address: string;
  points: number;
  rank: number;
  gamesPlayed: number;
  averagePoints: number;
  lastPlayed: string;
  trend: 'up' | 'down' | 'stable';
}

export interface GameStats {
  totalPlayers: number;        // Players with points
  totalRegistered: number;     // All registered users
  totalPoints: number;
  averagePointsPerPlayer: number;
  topPlayerToday: {
    username: string;
    points: number;
  } | null;
  gamesPlayedToday: number;
}

export type GameAction =
  // ... existing actions
  | { type: "RESTORE_SESSION"; payload: { username: string; walletAddress: string; isWalletConnected: boolean } }
  | { type: "SYNC_USER_DATA"; payload: { points: number; gamesPlayed: number; username: string } }; 