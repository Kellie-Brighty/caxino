import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";
import { useGame } from "../context/GameContext";
import { useState, useEffect } from "react";
import { firebaseService } from "../services/firebaseService";
import { GameStats, WinnerAlert } from "../types";
import {
  ChartBarIcon,
  TrophyIcon,
  UsersIcon,
  ClipboardIcon,
} from "@heroicons/react/24/outline";
import logo from "../assets/logo.png";

const SOCIAL_LINKS = [
  {
    name: "X (Twitter)",
    url: "http://x.com/caxinoclub",
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
  {
    name: "Telegram",
    url: "http://t.me/caxinoclub",
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.07-.2-.08-.06-.19-.04-.27-.02-.12.02-1.96 1.25-5.54 3.69-.52.36-1 .53-1.42.52-.47-.01-1.37-.26-2.03-.48-.82-.27-1.47-.42-1.42-.88.03-.24.29-.48.79-.74 3.08-1.34 5.15-2.23 6.19-2.66 2.95-1.23 3.56-1.44 3.97-1.45.09 0 .28.02.41.12.11.08.18.21.2.34.02.14.01.28 0 .33z" />
      </svg>
    ),
  },
];

// Floating elements data
const floatingNumbers = Array.from({ length: 15 }, (_, i) => ({
  id: i,
  number: Math.floor(Math.random() * 50) + 1,
  x: Math.random() * 100,
  y: Math.random() * 100,
  delay: Math.random() * 2,
}));

const particles = Array.from({ length: 20 }, (_, i) => ({
  id: i,
  size: Math.random() * 8 + 4,
  x: Math.random() * 100,
  y: Math.random() * 100,
  duration: Math.random() * 3 + 2,
  delay: Math.random() * 2,
}));

const CONTRACT_INFO = {
  address: "rPd1Y1zKFwGyewLthzjRX8SuzNzd4Fn6FN",
  dexscreener: "https://dexscreener.com/xrpl/434158494E4F0000000000000000000000000000.rPd1Y1zKFwGyewLthzjRX8SuzNzd4Fn6FN_xrp"
};

export default function WalletConnection() {
  const { setWalletConnection } = useGame();
  const [countdown, setCountdown] = useState(3);
  const [showStart, setShowStart] = useState(true);
  const [currentWinner, setCurrentWinner] = useState<WinnerAlert | null>(null);
  const [showWinner, setShowWinner] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [gameStats, setGameStats] = useState<GameStats>({
    totalPlayers: 0,
    totalRegistered: 0,
    totalPoints: 0,
    averagePointsPerPlayer: 0,
    topPlayerToday: null,
    gamesPlayedToday: 0,
  });

  useEffect(() => {
    const unsubscribe = firebaseService.onRecentWinner((winner) => {
      if (winner) {
        setCurrentWinner(winner);
        setShowWinner(true);
        setTimeout(() => setShowWinner(false), 5000);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const unsubscribe = firebaseService.onGameStatsChange(setGameStats);
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (isStarting) {
      new Audio("/sounds/start.mp3").play().catch(() => {});
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            setWalletConnection(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [isStarting, setWalletConnection]);

  const handleStartGame = () => {
    setShowStart(false);
    setIsStarting(true);
  };

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(CONTRACT_INFO.address);
    toast.success("Contract address copied!");
  };

  return (
    <motion.div
      className="relative max-w-4xl mx-auto text-center p-4 sm:p-8 md:p-12 min-h-[500px] sm:min-h-[600px]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {/* Logo with Social Links */}
      <motion.div
        className="mb-8 relative"
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <div className="flex items-center justify-center gap-6">
          {/* Social Links - Left */}
          <motion.div
            className="flex gap-3"
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            {SOCIAL_LINKS.slice(0, 1).map((link) => (
              <a
                key={link.name}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 bg-game-dark/40 rounded-full hover:bg-game-accent/20
                          transition-all duration-300 hover:scale-110"
              >
                <svg
                  className="w-7 h-7"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    d={
                      link.name === "X (Twitter)"
                        ? "M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"
                        : "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.07-.2-.08-.06-.19-.04-.27-.02-.12.02-1.96 1.25-5.54 3.69-.52.36-1 .53-1.42.52-.47-.01-1.37-.26-2.03-.48-.82-.27-1.47-.42-1.42-.88.03-.24.29-.48.79-.74 3.08-1.34 5.15-2.23 6.19-2.66 2.95-1.23 3.56-1.44 3.97-1.45.09 0 .28.02.41.12.11.08.18.21.2.34.02.14.01.28 0 .33z"
                    }
                  />
                </svg>
              </a>
            ))}
          </motion.div>

          <img
            src={logo}
            alt="Caxino Logo"
            className="w-32 h-32 rounded-full border-4 border-game-accent/20
                      shadow-[0_0_30px_rgba(34,211,238,0.2)]"
          />

          {/* Social Links - Right */}
          <motion.div
            className="flex gap-3"
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            {SOCIAL_LINKS.slice(1).map((link) => (
              <a
                key={link.name}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 bg-game-dark/40 rounded-full hover:bg-game-accent/20
                          transition-all duration-300 hover:scale-110"
              >
                <svg
                  className="w-7 h-7"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    d={
                      link.name === "X (Twitter)"
                        ? "M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"
                        : "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.07-.2-.08-.06-.19-.04-.27-.02-.12.02-1.96 1.25-5.54 3.69-.52.36-1 .53-1.42.52-.47-.01-1.37-.26-2.03-.48-.82-.27-1.47-.42-1.42-.88.03-.24.29-.48.79-.74 3.08-1.34 5.15-2.23 6.19-2.66 2.95-1.23 3.56-1.44 3.97-1.45.09 0 .28.02.41.12.11.08.18.21.2.34.02.14.01.28 0 .33z"
                    }
                  />
                </svg>
              </a>
            ))}
          </motion.div>
        </div>
      </motion.div>

      {/* Animated particles */}
      {particles.map((particle) => (
        <motion.div
          key={`particle-${particle.id}`}
          className="absolute rounded-full bg-game-accent/20"
          style={{ width: particle.size, height: particle.size }}
          initial={{ x: `${particle.x}%`, y: `${particle.y}%`, opacity: 0 }}
          animate={{
            y: [`${particle.y}%`, `${particle.y - 30}%`],
            opacity: [0, 0.8, 0],
            rotate: [0, 360],
          }}
          transition={{
            duration: particle.duration,
            delay: particle.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}

      {/* Floating numbers */}
      {floatingNumbers.map((num) => (
        <motion.div
          key={num.id}
          className="absolute text-game-accent/20 font-bold text-2xl pointer-events-none"
          initial={{ x: `${num.x}%`, y: `${num.y}%`, opacity: 0 }}
          animate={{
            y: [`${num.y}%`, `${num.y - 20}%`],
            opacity: [0, 0.5, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 3,
            delay: num.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          {num.number}
        </motion.div>
      ))}

      {/* Winner Alert */}
      <AnimatePresence>
        {showWinner && currentWinner && (
          <motion.div
            className="fixed top-4 right-4 bg-game-dark/90 px-6 py-4 rounded-lg backdrop-blur-sm
                       border border-game-accent/20 shadow-[0_0_20px_rgba(34,211,238,0.2)]"
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 100, opacity: 0 }}
          >
            <div className="font-game text-sm text-game-accent mb-1">
              New Winner! 🎉
            </div>
            <div className="font-game text-lg">{currentWinner.username}</div>
            <div className="font-game text-xl text-game-accent">
              +{currentWinner.points.toLocaleString()} pts
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Contract Info Section */}
      <motion.div 
        className="mb-8 bg-game-dark/40 rounded-xl p-4 border border-game-accent/20"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <motion.button
            className="flex items-center gap-2 px-4 py-2 bg-game-dark/60 rounded-lg
                       hover:bg-game-dark/80 transition-colors duration-300"
            onClick={handleCopyAddress}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <ClipboardIcon className="w-4 h-4" />
            <span className="font-mono text-sm">
              {CONTRACT_INFO.address.slice(0, 6)}...{CONTRACT_INFO.address.slice(-4)}
            </span>
          </motion.button>
          
          <motion.a
            href={CONTRACT_INFO.dexscreener}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 bg-game-accent/20 rounded-lg
                       hover:bg-game-accent/30 transition-colors duration-300"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <ChartBarIcon className="w-4 h-4" />
            <span>View Chart</span>
          </motion.a>
        </div>
      </motion.div>

      {/* Main content */}
      <motion.div
        className="relative z-10 backdrop-blur-lg bg-game-secondary/10 rounded-3xl p-8 border border-game-accent/20
                   shadow-[0_0_50px_rgba(34,211,238,0.1)]"
      >
        <motion.div
          className="absolute -top-6 left-1/2 -translate-x-1/2 bg-game-accent text-game-dark px-4 py-1 
                     rounded-full text-sm font-semibold tracking-wider"
          animate={{ y: [0, -5, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          PLAY & WIN
        </motion.div>

        <motion.h1
          className="font-game text-3xl sm:text-4xl md:text-5xl font-bold mb-2 bg-gradient-to-r from-game-accent to-game-primary 
                     text-transparent bg-clip-text"
          animate={{ scale: [1, 1.02, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          CAXINO
        </motion.h1>
        <p className="font-game text-xl text-game-light/80 mb-8">
          Where Numbers Meet Fortune
        </p>

        <AnimatePresence mode="wait">
          {showStart ? (
            <motion.button
              key="start"
              className="font-game group relative px-8 py-4 bg-game-primary rounded-xl font-bold text-lg
                         overflow-hidden transition-transform hover:scale-105"
              whileTap={{ scale: 0.98 }}
              onClick={handleStartGame}
              exit={{ scale: 0, opacity: 0 }}
            >
              <span className="relative z-10">Begin Your Journey</span>
              <motion.div
                className="absolute inset-0 bg-game-accent"
                initial={{ x: "-100%" }}
                whileHover={{ x: 0 }}
                transition={{ duration: 0.3 }}
              />
            </motion.button>
          ) : (
            <motion.div
              key="countdown"
              className="text-7xl font-bold text-game-accent"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
            >
              {countdown}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Enhanced Feature Highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-12">
          {[
            { icon: "🎯", text: "Guess 5 Numbers", subtext: "Test your luck" },
            { icon: "💎", text: "Win Points", subtext: "Climb the ranks" },
            { icon: "🏆", text: "Top Leaderboard", subtext: "Become a legend" },
          ].map((feature, index) => (
            <motion.div
              key={index}
              className="group bg-game-dark/40 rounded-lg p-4 cursor-pointer
                         hover:bg-game-dark/60 transition-colors duration-300"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: index * 0.2 }}
              whileHover={{ scale: 1.05 }}
            >
              <motion.div
                className="text-2xl mb-2"
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                {feature.icon}
              </motion.div>
              <div className="font-game text-sm font-semibold text-game-accent">
                {feature.text}
              </div>
              <div className="font-game text-xs text-game-light/50 mt-1 group-hover:text-game-light/70">
                {feature.subtext}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Game Stats */}
        <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <StatCard
            title="Active Players"
            value={gameStats.totalPlayers}
            icon={<UsersIcon className="w-5 h-5" />}
            subtitle="with points"
          />
          <StatCard
            title="Total Points"
            value={gameStats.totalPoints}
            icon={<TrophyIcon className="w-5 h-5" />}
          />
          <StatCard
            title="Average Points"
            value={gameStats.averagePointsPerPlayer}
            icon={<ChartBarIcon className="w-5 h-5" />}
            subtitle="per player"
          />
        </div>

        {/* Today's Top Player */}
        {gameStats.topPlayerToday && (
          <motion.div
            className="bg-game-dark/40 rounded-xl p-4 mb-8"
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

        {/* Connect Button */}
        <motion.button
          className="w-full py-6 bg-game-primary rounded-2xl font-bold text-xl font-game
                     relative overflow-hidden group"
          onClick={() => setWalletConnection(true)}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-game-accent/0 via-game-accent/20 to-game-accent/0"
            initial={{ x: -200, opacity: 0 }}
            animate={{ x: 400, opacity: 1 }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          Tap to play
        </motion.button>
      </motion.div>
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
    <div className="bg-game-dark/40 rounded-lg p-4 text-center">
      <div className="flex items-center justify-center gap-2 text-game-accent mb-2">
        {icon}
        <div className="text-sm text-game-light/50">
          {title}
          {subtitle && (
            <span className="block text-xs opacity-70">{subtitle}</span>
          )}
        </div>
      </div>
      <motion.div
        className="font-game text-xl font-bold"
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        {value.toLocaleString()}
      </motion.div>
    </div>
  );
}
