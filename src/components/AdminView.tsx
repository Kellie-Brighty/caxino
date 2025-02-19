import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { firebaseService } from "../services/firebaseService";
import { LeaderboardEntry } from "../types";

export default function AdminView() {
  const [topPlayers, setTopPlayers] = useState<LeaderboardEntry[]>([]);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const adminPassword = import.meta.env.VITE_ADMIN_PASSWORD;

  useEffect(() => {
    const password = prompt("Enter admin password");
    if (password === adminPassword) {
      setIsAuthorized(true);
      const unsubscribe = firebaseService.onLeaderboardChange((entries) => {
        setTopPlayers(entries.slice(0, 3));
      });
      return unsubscribe;
    }
  }, [adminPassword]);

  if (!isAuthorized) {
    return <div>Unauthorized</div>;
  }

  return (
    <motion.div
      className="max-w-4xl mx-auto p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <h1 className="font-game text-2xl mb-6 text-game-accent">Admin Dashboard</h1>
      
      <div className="space-y-4">
        {topPlayers.map((player, index) => (
          <motion.div
            key={player.address}
            className="bg-game-dark/40 rounded-xl p-4"
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: index * 0.1 }}
          >
            <div className="flex justify-between items-center">
              <div>
                <div className="font-game text-game-accent">
                  {player.username}
                </div>
                <div className="text-sm text-game-light/50 mt-1 font-mono">
                  {player.address}
                </div>
              </div>
              <div className="text-xl font-game">
                {player.points.toLocaleString()} pts
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
} 