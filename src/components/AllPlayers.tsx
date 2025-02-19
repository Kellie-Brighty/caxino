import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { LeaderboardEntry } from "../types";
import { firebaseService } from "../services/firebaseService";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  TrophyIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  MinusIcon,
} from "@heroicons/react/24/outline";

const ITEMS_PER_PAGE = 10;

export default function AllPlayers() {
  const [players, setPlayers] = useState<LeaderboardEntry[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPlayer, setSelectedPlayer] = useState<LeaderboardEntry | null>(
    null
  );

  useEffect(() => {
    const unsubscribe = firebaseService.onAllPlayersChange((allPlayers) => {
      setPlayers(allPlayers);
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const totalPages = Math.ceil(players.length / ITEMS_PER_PAGE);
  const currentPlayers = players.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const getTrendIcon = (trend: "up" | "down" | "stable") => {
    switch (trend) {
      case "up":
        return <ArrowTrendingUpIcon className="w-5 h-5 text-green-400" />;
      case "down":
        return <ArrowTrendingDownIcon className="w-5 h-5 text-red-400" />;
      default:
        return <MinusIcon className="w-5 h-5 text-gray-400" />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <motion.div
          className="w-12 h-12 border-4 border-game-accent rounded-full border-t-transparent"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
      </div>
    );
  }

  return (
    <motion.div
      className="max-w-4xl mx-auto p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="bg-game-secondary/10 backdrop-blur-lg rounded-3xl p-6 border border-game-accent/20">
        <h2 className="font-game text-2xl mb-6 flex items-center gap-2">
          <TrophyIcon className="w-6 h-6 text-game-accent" />
          Global Rankings
        </h2>

        {/* Players Table */}
        <div className="space-y-4">
          {currentPlayers.map((player) => (
            <motion.div
              key={player.address}
              className={`${
                player.points > 0 ? "bg-game-dark/40" : "bg-game-dark/20"
              } 
                rounded-xl p-4 cursor-pointer hover:bg-game-dark/60 transition-colors duration-300`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ scale: 1.02 }}
              onClick={() => setSelectedPlayer(player)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="font-game text-xl w-8">{player.rank}</div>
                  <div>
                    <div className="font-game text-game-accent">
                      {player.username}
                    </div>
                    <div
                      className={`text-sm ${
                        player.points > 0
                          ? "text-game-light/50"
                          : "text-game-light/30"
                      }`}
                    >
                      {player.points.toLocaleString()} points
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  {getTrendIcon(player.trend)}
                  <div className="text-right">
                    <div className="text-sm text-game-light/50">Games</div>
                    <div className="font-game">{player.gamesPlayed}</div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Pagination */}
        <div className="mt-6 flex items-center justify-between">
          <button
            className="px-4 py-2 bg-game-dark/40 rounded-lg font-game text-sm
                       disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={() => setCurrentPage((p) => p - 1)}
            disabled={currentPage === 1}
          >
            <ChevronLeftIcon className="w-5 h-5" />
          </button>
          <div className="font-game text-sm">
            Page {currentPage} of {totalPages}
          </div>
          <button
            className="px-4 py-2 bg-game-dark/40 rounded-lg font-game text-sm
                       disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={() => setCurrentPage((p) => p + 1)}
            disabled={currentPage === totalPages}
          >
            <ChevronRightIcon className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Player Details Modal */}
      <AnimatePresence>
        {selectedPlayer && (
          <motion.div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center 
                       justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedPlayer(null)}
          >
            <motion.div
              className="bg-game-dark/90 p-6 rounded-2xl max-w-md w-full
                         border border-game-accent/20"
              initial={{ scale: 0.8, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="font-game text-xl text-game-accent mb-6">
                Player Details
              </h3>
              <div className="space-y-4">
                <DetailRow label="Username" value={selectedPlayer.username} />
                <DetailRow label="Rank" value={`#${selectedPlayer.rank}`} />
                <DetailRow
                  label="Points"
                  value={selectedPlayer.points.toLocaleString()}
                />
                <DetailRow
                  label="Games Played"
                  value={selectedPlayer.gamesPlayed.toString()}
                />
                <DetailRow
                  label="Average Points"
                  value={Math.round(
                    selectedPlayer.averagePoints
                  ).toLocaleString()}
                />
                <DetailRow
                  label="Last Played"
                  value={new Date(
                    selectedPlayer.lastPlayed
                  ).toLocaleDateString()}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center">
      <div className="text-game-light/50">{label}</div>
      <div className="font-game">{value}</div>
    </div>
  );
}
