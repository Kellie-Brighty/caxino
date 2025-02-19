import { createContext, useContext, useReducer, ReactNode, useEffect } from "react";
import { GameState } from "../types";
import { firebaseService } from "../services/firebaseService";

type GameAction =
  | { type: "SET_WALLET_CONNECTION"; payload: boolean }
  | { type: "SET_GAME_STARTED"; payload: boolean }
  | { type: "SET_USER_NUMBERS"; payload: number[] }
  | { type: "SET_SYSTEM_NUMBERS"; payload: number[] }
  | { type: "UPDATE_POINTS"; payload: number }
  | { type: "INCREMENT_ATTEMPTS" }
  | { type: "RESET_GAME" }
  | { type: "SET_USER_INFO"; payload: { username: string; walletAddress: string } }
  | { type: "RESTORE_SESSION"; payload: GameState }
  | { type: "SYNC_USER_DATA"; payload: { username: string; points: number; gamesPlayed: number } };

type GameContextType = {
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
  setWalletConnection: (status: boolean) => void;
  setGameStarted: (status: boolean) => void;
  setUserNumbers: (numbers: number[]) => void;
  generateSystemNumbers: () => void;
  calculatePoints: () => void;
  resetGame: () => void;
};

const initialState: GameState = {
  userNumbers: [],
  systemNumbers: [],
  attempts: 0,
  points: 0,
  isGameStarted: false,
  isWalletConnected: false,
  username: null,
  walletAddress: null,
};

const GameContext = createContext<GameContextType | undefined>(undefined);

function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case "SET_WALLET_CONNECTION":
      return { ...state, isWalletConnected: action.payload };
    case "SET_GAME_STARTED":
      return { ...state, isGameStarted: action.payload };
    case "SET_USER_NUMBERS":
      return { ...state, userNumbers: action.payload };
    case "SET_SYSTEM_NUMBERS":
      return { ...state, systemNumbers: action.payload };
    case "UPDATE_POINTS":
      return { ...state, points: state.points + action.payload };
    case "INCREMENT_ATTEMPTS":
      return { ...state, attempts: state.attempts + 1 };
    case "RESET_GAME":
      return {
        ...state,
        userNumbers: [],
        systemNumbers: [],
        isGameStarted: false,
      };
    case "SET_USER_INFO":
      return {
        ...state,
        username: action.payload.username,
        walletAddress: action.payload.walletAddress,
      };
    case "RESTORE_SESSION":
      return {
        ...state,
        username: action.payload.username,
        walletAddress: action.payload.walletAddress,
        isWalletConnected: action.payload.isWalletConnected
      };
    case "SYNC_USER_DATA":
      return {
        ...state,
        points: action.payload.points,
        username: action.payload.username,
        attempts: action.payload.gamesPlayed,
      };
    default:
      return state;
  }
}

export function GameProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(gameReducer, initialState);

  // Load session and sync with Firebase
  useEffect(() => {
    const savedSession = localStorage.getItem('gameSession');
    if (savedSession) {
      try {
        const session = JSON.parse(savedSession);
        dispatch({ type: "RESTORE_SESSION", payload: session });

        // Set up real-time sync for user data
        const unsubscribe = firebaseService.onUserStatsChange(
          session.walletAddress,
          (userData) => {
            dispatch({
              type: "SYNC_USER_DATA",
              payload: {
                points: userData.points,
                gamesPlayed: userData.gamesPlayed,
                username: userData.username,
                // Add any other fields you want to sync
              }
            });
          }
        );

        return () => unsubscribe();
      } catch (error) {
        console.error('Failed to restore session:', error);
      }
    }
  }, []);

  // Save session to localStorage
  useEffect(() => {
    if (state.username && state.walletAddress) {
      localStorage.setItem('gameSession', JSON.stringify({
        username: state.username,
        walletAddress: state.walletAddress,
        isWalletConnected: state.isWalletConnected
      }));
    }
  }, [state.username, state.walletAddress, state.isWalletConnected]);

  const setWalletConnection = (status: boolean) => {
    dispatch({ type: "SET_WALLET_CONNECTION", payload: status });
  };

  const setGameStarted = (status: boolean) => {
    dispatch({ type: "SET_GAME_STARTED", payload: status });
  };

  const setUserNumbers = (numbers: number[]) => {
    dispatch({ type: "SET_USER_NUMBERS", payload: numbers });
  };

  const generateSystemNumbers = () => {
    const numbers = Array.from(
      { length: 5 },
      () => Math.floor(Math.random() * 100) + 1
    );
    dispatch({ type: "SET_SYSTEM_NUMBERS", payload: numbers });
  };

  const calculatePoints = async () => {
    const matchingNumbers = state.userNumbers.filter((num) =>
      state.systemNumbers.includes(num)
    ).length;

    const pointsEarned = matchingNumbers === 5 ? 50 : matchingNumbers * 10;
    if (state.walletAddress) {
      await firebaseService.updatePoints(state.walletAddress, pointsEarned);
    }
    dispatch({ type: "UPDATE_POINTS", payload: pointsEarned });
    dispatch({ type: "INCREMENT_ATTEMPTS" });
  };

  const resetGame = () => {
    dispatch({ type: "RESET_GAME" });
  };

  const value = {
    state,
    dispatch,
    setWalletConnection,
    setGameStarted,
    setUserNumbers,
    generateSystemNumbers,
    calculatePoints,
    resetGame,
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGame() {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error("useGame must be used within a GameProvider");
  }
  return context;
}
