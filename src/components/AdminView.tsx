import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { firebaseService } from "../services/firebaseService";
import { LeaderboardEntry, CycleHistory } from "../types";
import { toast } from "react-hot-toast";

export default function AdminView() {
  const [topPlayers, setTopPlayers] = useState<LeaderboardEntry[]>([]);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const adminPassword = import.meta.env.VITE_ADMIN_PASSWORD;
  const [cycleHistory, setCycleHistory] = useState<CycleHistory[]>([]);

  const handleResetCycle = async () => {
    if (window.confirm("Reset cycle target to 2000 points?")) {
      await firebaseService.updateCurrentCycleTarget();
      toast.success("Cycle target reset to 2000 points");
    }
  };

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

  useEffect(() => {
    if (isAuthorized) {
      const unsubscribe = firebaseService.onCycleHistory(setCycleHistory);
      return () => unsubscribe();
    }
  }, [isAuthorized]);

  if (!isAuthorized) {
    return <div>Unauthorized</div>;
  }

  return (
    <motion.div
      className="max-w-4xl mx-auto p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <h1 className="font-game text-2xl mb-6 text-game-accent">
        Admin Dashboard
      </h1>

      <div className="mb-8 space-x-4">
        <motion.button
          className="bg-game-accent/20 px-4 py-2 rounded-lg hover:bg-game-accent/30
                     transition-colors duration-300"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleResetCycle}
        >
          Reset Cycle Target to 2000
        </motion.button>

        <motion.button
          className="bg-red-500/20 px-4 py-2 rounded-lg hover:bg-red-500/30
                     transition-colors duration-300"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={async () => {
            if (window.confirm("Deduct 1000 points from the leading player?")) {
              await firebaseService.deductPointsFromLeader();
              toast.success("Deducted 1000 points from leader");
            }
          }}
        >
          Deduct 1000 from Leader
        </motion.button>
      </div>

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

      <h2 className="font-game text-xl text-game-accent mt-12 mb-4">
        Cycle History
      </h2>
      <div className="space-y-6">
        {cycleHistory.map((cycle) => (
          <motion.div
            key={cycle.cycleNumber}
            className="bg-game-dark/40 rounded-xl p-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="flex justify-between items-center mb-4">
              <div className="font-game text-lg">
                Cycle #{cycle.cycleNumber}
              </div>
              <div className="text-sm text-game-light/50">
                {new Date(cycle.startTime).toLocaleDateString()}
              </div>
            </div>

            {Object.entries(cycle.winners).filter(([_, w]) => w).length > 0 ? (
              <div className="space-y-3">
                {Object.entries(cycle.winners)
                  .filter(([_, winner]) => winner)
                  .map(
                    ([place, winner]: [
                      string,
                      { username: string; address: string }
                    ]) => (
                      <div key={place} className="flex items-center gap-3">
                        <span>
                          {place === "first"
                            ? "🥇"
                            : place === "second"
                            ? "🥈"
                            : "🥉"}
                        </span>
                        <div>
                          <div className="font-game text-game-accent">
                            {winner.username}
                          </div>
                          <div className="text-xs text-game-light/50 font-mono">
                            {winner.address}
                          </div>
                        </div>
                      </div>
                    )
                  )}
              </div>
            ) : (
              <div className="text-game-light/50 italic">
                No winners this cycle
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
