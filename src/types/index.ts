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
  ethAddress: string | null;
  hasPaidForCurrentCycle: boolean;
  currentPayment: PaymentInfo | null;
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

export interface WinnerAlert {
  username: string;
  points: number;
  timestamp: string;
}

export interface CycleHistory {
  cycleNumber: number;
  startTime: string;
  endTime: string;
  targetPoints: number;
  winners: {
    first?: { username: string; address: string; timestamp: string };
    second?: { username: string; address: string; timestamp: string };
    third?: { username: string; address: string; timestamp: string };
  };
  completed: boolean;
}

export interface PointsCycle {
  targetPoints: number;
  startTime: string;
  endTime: string;
  cycleNumber: number;
  winners: {
    first?: { username: string; address: string; timestamp: string };
    second?: { username: string; address: string; timestamp: string };
    third?: { username: string; address: string; timestamp: string };
  };
}

export interface PaymentInfo {
  txHash: string;
  amount: string;
  timestamp: string;
  cycleNumber: number;
}

export type GameAction =
  | { type: "SET_WALLET_CONNECTION"; payload: boolean }
  | { type: "SET_GAME_STARTED"; payload: boolean }
  | { type: "SET_USER_INFO"; payload: { username: string; walletAddress: string; ethAddress: string } }
  | { type: "RESTORE_SESSION"; payload: GameState }
  | { type: "SYNC_USER_DATA"; payload: { points: number; gamesPlayed: number; username: string } }
  | { type: "SET_PAYMENT_STATUS"; payload: boolean }; 