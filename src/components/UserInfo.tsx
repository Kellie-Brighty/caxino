import { motion } from "framer-motion";
import { useGame } from "../context/GameContext";

export default function UserInfo() {
  const { state: { username, points, attempts } } = useGame();

  return (
    <motion.div
      className="bg-game-secondary/10 backdrop-blur-lg rounded-xl p-4 
                 border border-game-accent/20 mb-6"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm text-game-light/50">Welcome</div>
          <div className="font-game text-xl text-game-accent">{username}</div>
        </div>
        <div className="text-right">
          <div className="text-sm text-game-light/50">Your Points</div>
          <div className="font-game text-xl text-game-accent">{points.toLocaleString()}</div>
          <div className="text-xs text-game-light/50">Games Played: {attempts}</div>
        </div>
      </div>
    </motion.div>
  );
} 