import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { LeaderboardEntry, GameStats } from "../types";
import { firebaseService } from "../services/firebaseService";
import {
  ChartBarIcon,
  TrophyIcon,
  ClockIcon,
  UsersIcon,
} from "@heroicons/react/24/outline";

const RANK_COLORS = {
  1: "from-yellow-400 to-yellow-600",
  2: "from-slate-300 to-slate-500",
  3: "from-amber-600 to-amber-800",
};

const RANK_BADGES = {
  1: "👑",
  2: "⭐",
  3: "✨",
  4: "💫",
  5: "🌟",
};

type TimePeriod = "all" | "today" | "week";

export default function Leaderboard() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [selectedEntry, setSelectedEntry] = useState<LeaderboardEntry | null>(
    null
  );
  const [gameStats, setGameStats] = useState<GameStats>({
    totalPlayers: 0,
    totalRegistered: 0,
    totalPoints: 0,
    averagePointsPerPlayer: 0,
    topPlayerToday: null,
    gamesPlayedToday: 0,
  });
  const [timePeriod, setTimePeriod] = useState<TimePeriod>("all");
  const [previousRanks, setPreviousRanks] = useState<Record<string, number>>(
    {}
  );
  const [sixthPlace, setSixthPlace] = useState<LeaderboardEntry | null>(null);

  useEffect(() => {
    const unsubscribe = firebaseService.onLeaderboardChange(
      setLeaderboard,
      timePeriod
    );
    const unsubscribeStats = firebaseService.onGameStatsChange(setGameStats);
    return () => {
      unsubscribe();
      unsubscribeStats();
    };
  }, [timePeriod]);

  useEffect(() => {
    const newRanks: Record<string, number> = {};
    leaderboard.forEach((entry) => {
      newRanks[entry.address] = entry.rank;
    });
    setPreviousRanks(newRanks);
  }, [leaderboard]);

  useEffect(() => {
    const fetchSixthPlace = async () => {
      const sixthPlacePlayer = await firebaseService.getSixthPlace();
      setSixthPlace(sixthPlacePlayer);
    };
    fetchSixthPlace();
  }, [leaderboard]);

  const getTrendIcon = (trend: "up" | "down" | "stable") => {
    switch (trend) {
      case "up":
        return "📈";
      case "down":
        return "📉";
      default:
        return "➡️";
    }
  };

  const getRankChangeEffect = (entry: LeaderboardEntry) => {
    const previousRank = previousRanks[entry.address] || entry.rank;
    if (previousRank < entry.rank) return "rank-down";
    if (previousRank > entry.rank) return "rank-up";
    return "";
  };

  return (
    <motion.div
      className="bg-game-secondary/10 backdrop-blur-lg rounded-3xl p-4 sm:p-6 border border-game-accent/20
                 shadow-[0_0_50px_rgba(34,211,238,0.1)]"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.3 }}
    >
      {/* Header with Time Period Selector */}
      <div className="relative mb-6">
        <motion.div
          className="absolute -top-4 left-1/2 -translate-x-1/2 bg-game-accent/20 px-4 py-1 
                     rounded-full backdrop-blur-sm border border-game-accent/30"
          animate={{ y: [0, -5, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <span className="font-game text-sm font-semibold text-game-accent">
            LIVE
          </span>
        </motion.div>

        <div className="flex items-center justify-between mb-4">
          <h2 className="font-game text-2xl font-bold">Leaderboard</h2>
          <div className="flex gap-2">
            {(["all", "today", "week"] as TimePeriod[]).map((period) => (
              <button
                key={period}
                onClick={() => setTimePeriod(period)}
                className={`px-3 py-1 rounded-lg font-game text-sm transition-colors
                          ${
                            timePeriod === period
                              ? "bg-game-accent text-game-dark"
                              : "bg-game-dark/40 hover:bg-game-dark/60"
                          }`}
              >
                {period.charAt(0).toUpperCase() + period.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Today's Highlights */}
        {gameStats.topPlayerToday && (
          <motion.div
            className="bg-game-dark/40 rounded-xl p-4 mb-4"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="text-sm text-game-light/70 mb-2">
              Today's Top Player
            </div>
            <div className="flex items-center justify-between">
              <div className="font-game">
                <div className="text-game-accent">
                  {gameStats.topPlayerToday.username}
                </div>
                <div className="text-xl font-bold">
                  {gameStats.topPlayerToday.points.toLocaleString()} pts
                </div>
              </div>
              <TrophyIcon className="w-8 h-8 text-game-accent" />
            </div>
          </motion.div>
        )}
      </div>

      {/* Leaderboard Entries */}
      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {leaderboard.map((entry, index) => (
            <motion.div
              key={entry.address}
              className={`relative group`}
              initial={{ opacity: 0, y: 20 }}
              animate={{
                y:
                  getRankChangeEffect(entry) === "rank-up"
                    ? [-4, 0]
                    : getRankChangeEffect(entry) === "rank-down"
                    ? [4, 0]
                    : 0,
                opacity: 1,
              }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.02 }}
              onClick={() => setSelectedEntry(entry)}
            >
              {/* Rank change indicator */}
              {getRankChangeEffect(entry) && (
                <motion.div
                  className={`absolute -left-4 ${
                    getRankChangeEffect(entry) === "rank-up"
                      ? "text-green-400"
                      : "text-red-400"
                  }`}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                >
                  {getRankChangeEffect(entry) === "rank-up" ? "↑" : "↓"}
                </motion.div>
              )}

              {/* Enhanced rank badge */}
              <motion.div
                className="absolute -left-2 -top-2 w-8 h-8 flex items-center justify-center"
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.2 + index * 0.1 }}
              >
                {RANK_BADGES[entry.rank as keyof typeof RANK_BADGES]}
              </motion.div>

              <motion.div
                className={`absolute inset-0 rounded-xl bg-gradient-to-r opacity-0 
                           group-hover:opacity-10 transition-opacity duration-300
                           ${
                             RANK_COLORS[
                               entry.rank as keyof typeof RANK_COLORS
                             ] || "from-game-primary/50 to-game-secondary/50"
                           }`}
              />
              <div
                className="relative flex items-center gap-4 p-4 bg-game-dark/40 rounded-xl
                             border border-game-accent/5 cursor-pointer"
              >
                <div className="font-game font-bold text-xl w-8">
                  #{entry.rank}
                </div>
                <div className="flex-1">
                  <div className="font-game text-sm text-game-light/80">
                    {entry.username}
                  </div>
                  <div className="text-xs text-game-light/50">
                    Games: {entry.gamesPlayed} | Avg:{" "}
                    {Math.round(entry.averagePoints)}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-game font-bold text-game-accent flex items-center gap-2">
                    {entry.points.toLocaleString()}
                    <span>{getTrendIcon(entry.trend)}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Just Missed Top 5 */}
        {sixthPlace && (
          <motion.div
            className="mt-6 pt-4 border-t border-game-accent/20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <div className="text-sm text-game-light/50 mb-2">
              Just Missed Top 5
            </div>
            <div className="bg-game-dark/20 rounded-xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="font-game text-xl opacity-50">6</div>
                <div>
                  <div className="font-game text-sm">{sixthPlace.username}</div>
                  <div className="text-xs text-game-light/50">
                    {sixthPlace.points.toLocaleString()} points
                  </div>
                </div>
              </div>
              <div className="text-sm text-game-light/50">
                {Math.abs(sixthPlace.points - leaderboard[4]?.points)} points
                away
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Stats Grid */}
      <div className="mt-6 pt-6 border-t border-game-accent/20">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <StatCard
            title="Active Players"
            value={gameStats.totalPlayers}
            icon={<ChartBarIcon className="w-5 h-5" />}
            subtitle="with points"
          />
          <StatCard
            title="Total Users"
            value={gameStats.totalRegistered}
            icon={<UsersIcon className="w-5 h-5" />}
            subtitle="registered"
          />
          <StatCard
            title="Total Points"
            value={gameStats.totalPoints}
            icon={<TrophyIcon className="w-5 h-5" />}
          />
          <StatCard
            title="Games Today"
            value={gameStats.gamesPlayedToday}
            icon={<ClockIcon className="w-5 h-5" />}
          />
        </div>
      </div>

      {/* Player Details Modal */}
      <AnimatePresence>
        {selectedEntry && (
          <motion.div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center 
                       justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedEntry(null)}
          >
            <motion.div
              className="bg-game-dark/90 p-6 rounded-2xl max-w-md w-full
                         border border-game-accent/20"
              initial={{ scale: 0.8, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="font-game text-xl font-bold text-game-accent mb-4">
                Player Details
              </h3>
              <div className="space-y-4">
                <DetailRow label="Username" value={selectedEntry.username} />
                <DetailRow label="Rank" value={`#${selectedEntry.rank}`} />
                <DetailRow
                  label="Points"
                  value={selectedEntry.points.toLocaleString()}
                />
                <DetailRow
                  label="Games Played"
                  value={selectedEntry.gamesPlayed.toString()}
                />
                <DetailRow
                  label="Average Points"
                  value={Math.round(
                    selectedEntry.averagePoints
                  ).toLocaleString()}
                />
                <DetailRow
                  label="Trend"
                  value={getTrendIcon(selectedEntry.trend)}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function StatCard({
  title,
  value,
  icon,
  subtitle,
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
  subtitle?: string;
}) {
  return (
    <div className="bg-game-dark/40 rounded-lg p-3 text-center">
      <div className="flex items-center justify-center gap-2 text-game-accent mb-1">
        {icon}
        <div className="text-xs text-game-light/50">
          {title}
          {subtitle && (
            <span className="block text-[10px] opacity-70">{subtitle}</span>
          )}
        </div>
      </div>
      <motion.div
        className="font-game font-bold"
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        {value.toLocaleString()}
      </motion.div>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-game-light/50 text-sm">{label}</div>
      <div className="font-game text-xl text-game-accent">{value}</div>
    </div>
  );
}
