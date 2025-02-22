import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { firebaseService } from "../services/firebaseService";
import { PointsCycle } from "../types";
import { TrophyIcon, ClockIcon } from "@heroicons/react/24/outline";
import { useGame } from "../context/GameContext";

export default function CycleInfo() {
  const [cycle, setCycle] = useState<PointsCycle | null>(null);
  const [timeLeft, setTimeLeft] = useState<string>("");
  const {
    state: { ethAddress, hasPaidForCurrentCycle },
  } = useGame();

  // Subscribe to cycle updates
  useEffect(() => {
    const unsubscribe = firebaseService.onCurrentCycle(setCycle);
    return () => unsubscribe();
  }, []);

  // Timer effect
  useEffect(() => {
    if (!cycle) return;

    const timer = setInterval(() => {
      const end = new Date(cycle.endTime);
      const now = new Date();
      const diff = end.getTime() - now.getTime();

      if (diff <= 0) {
        setTimeLeft("Resetting...");
        firebaseService.initializeNewCycle();
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
    }, 1000);

    return () => clearInterval(timer);
  }, [cycle?.cycleNumber]);

  if (!cycle) return null;

  return (
    <motion.div
      className="bg-game-dark/40 rounded-xl p-6 border border-game-accent/20"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="font-game text-xl text-game-accent mb-1">
            Cycle #{cycle.cycleNumber}
            {ethAddress && (
              <span
                className={`ml-2 text-sm ${
                  hasPaidForCurrentCycle ? "text-green-500" : "text-red-500"
                }`}
              >
                {hasPaidForCurrentCycle ? "(Paid)" : "(Payment Required)"}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 text-game-light/70">
            <ClockIcon className="w-4 h-4" />
            <span>{timeLeft} remaining</span>
          </div>
        </div>
        <div className="text-right">
          <div className="text-sm text-game-light/50">Target Points</div>
          <div className="font-game text-2xl text-game-accent">
            {cycle.targetPoints.toLocaleString()}
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {cycle.winners && Object.entries(cycle.winners).length > 0 ? (
          Object.entries(cycle.winners).map(([place, winner]) => (
            <motion.div
              key={place}
              className="flex items-center justify-between bg-game-dark/30 rounded-lg p-3"
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">
                  {place === "first" ? "🥇" : place === "second" ? "🥈" : "🥉"}
                </span>
                <div>
                  <div className="font-game text-game-accent">
                    {winner.username}
                  </div>
                  <div className="text-xs text-game-light/50">
                    {new Date(winner.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              </div>
              <TrophyIcon className="w-5 h-5 text-game-accent" />
            </motion.div>
          ))
        ) : (
          <div className="text-center text-game-light/50 py-2">
            No winners yet - Be the first!
          </div>
        )}
      </div>
    </motion.div>
  );
}
