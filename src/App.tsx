import { motion } from "framer-motion";
import { Toaster } from "react-hot-toast";
import GameBoard from "./components/GameBoard";
import Leaderboard from "./components/Leaderboard";
import WalletConnection from "./components/WalletConnection";
import { GameProvider, useGame } from "./context/GameContext";
import GameBackground from "./components/GameBackground";
import AllPlayers from "./components/AllPlayers";
import AdminView from "./components/AdminView";
import { Routes, Route, BrowserRouter as Router } from "react-router-dom";

function GameContent() {
  const {
    state: { isWalletConnected },
  } = useGame();

  return (
    <div className="relative min-h-screen bg-game-dark text-game-light p-4 overflow-hidden">
      <GameBackground />
      <Toaster position="top-right" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
      >
        {!isWalletConnected ? (
          <WalletConnection />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <GameBoard />
            </div>
            <div className="lg:mt-0 mt-8">
              <Leaderboard />
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <GameProvider>
        <div className="min-h-screen bg-game-dark text-white">
          <Routes>
            <Route path="/" element={<GameContent />} />
            <Route path="/rankings" element={<AllPlayers />} />
            <Route path="/admin" element={<AdminView />} />
          </Routes>
        </div>
      </GameProvider>
    </Router>
  );
}

export default App;
