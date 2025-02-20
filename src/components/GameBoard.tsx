import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";
import { useGame } from "../context/GameContext";
import { useSwipeable } from "react-swipeable";
import UserSetup from "./UserSetup";
import { GAME_SOUNDS, playSound } from "../utils/sounds";
import UserInfo from "./UserInfo";
import { useNavigate } from "react-router-dom";
import logo from "../assets/logo.jpg";
import { firebaseService } from "../services/firebaseService";
import CycleInfo from "./CycleInfo";

// Background particles
const particles = Array.from({ length: 15 }, (_, i) => ({
  id: i,
  size: Math.random() * 6 + 3,
  x: Math.random() * 100,
  y: Math.random() * 100,
  duration: Math.random() * 3 + 2,
  delay: Math.random() * 2,
}));

export default function GameBoard() {
  const navigate = useNavigate();
  const {
    state: {
      isGameStarted,
      userNumbers,
      points,
      systemNumbers,
      username,
      walletAddress,
    },
    setGameStarted,
    setUserNumbers,
    generateSystemNumbers,
    calculatePoints,
    resetGame,
    setWalletConnection,
  } = useGame();

  const [currentNumber, setCurrentNumber] = useState<string>("");
  const [showResult, setShowResult] = useState(false);
  const [showMobileControls, setShowMobileControls] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [submitCooldown, setSubmitCooldown] = useState(0);
  const SUBMIT_COOLDOWN_TIME = 20000; // 20 seconds in milliseconds

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => {
      if (currentNumber && parseInt(currentNumber) > 1) {
        setCurrentNumber((prev) => (parseInt(prev) - 1).toString());
      }
    },
    onSwipedRight: () => {
      if (currentNumber && parseInt(currentNumber) < 50) {
        setCurrentNumber((prev) => (parseInt(prev) + 1).toString());
      }
    },
  });

  const handleStartGame = () => {
    setGameStarted(true);
    setUserNumbers([]);
    generateSystemNumbers();
    playSound(GAME_SOUNDS.START);
  };

  const handleNumberInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const lastInputTime = localStorage.getItem('lastInputTime');
    const now = Date.now();
    if (lastInputTime && now - parseInt(lastInputTime) < 100) {
      return;
    }
    localStorage.setItem('lastInputTime', now.toString());

    if (value === "" || (/^\d+$/.test(value) && parseInt(value) <= 100)) {
      setCurrentNumber(value);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && currentNumber) {
      handleAddNumber();
    }
  };

  const handleAddNumber = () => {
    const num = parseInt(currentNumber);
    const lastSubmitTime = localStorage.getItem('lastSubmitTime');
    const now = Date.now();
    if (lastSubmitTime && now - parseInt(lastSubmitTime) < SUBMIT_COOLDOWN_TIME) {
      toast.error("You're submitting too fast!");
      return;
    }
    setSubmitCooldown(SUBMIT_COOLDOWN_TIME);
    const interval = setInterval(() => {
      setSubmitCooldown(prev => Math.max(0, prev - 100));
    }, 100);
    setTimeout(() => clearInterval(interval), SUBMIT_COOLDOWN_TIME);

    if (num > 0 && num <= 100) {
      if (userNumbers.length >= 5) {
        toast.error("You can only select 5 numbers!");
        return;
      }
      const lastNumberTime = localStorage.getItem('lastNumberTime');
      if (lastNumberTime && now - parseInt(lastNumberTime) < 800) {
        toast.error("Please slow down!");
        return;
      }
      localStorage.setItem('lastNumberTime', now.toString());

      if (userNumbers.includes(num)) {
        toast.error("Number already selected!");
        return;
      }
      const submitPattern = localStorage.getItem('submitPattern') || '[]';
      const patterns = JSON.parse(submitPattern);
      patterns.push({time: now, number: num});
      if (patterns.length > 10) patterns.shift();
      localStorage.setItem('submitPattern', JSON.stringify(patterns));
      
      if (patterns.length > 5) {
        const intervals = patterns.slice(1).map((p: any, i: number) => 
          p.time - patterns[i].time
        );
        const avgInterval = intervals.reduce((a: number, b: number) => a + b, 0) / intervals.length;
        const allSimilar = intervals.every(int => Math.abs(int - avgInterval) < 50);
        if (allSimilar) {
          toast.error("Suspicious activity detected!");
          return;
        }
      }

      setUserNumbers([...userNumbers, num]);
      setCurrentNumber("");
      playSound(GAME_SOUNDS.POP);
    }
  };

  const handleSubmit = () => {
    if (userNumbers.length !== 5) {
      toast.error("Please select 5 numbers!");
      return;
    }
    if (submitCooldown > 0) {
      toast.error(`Please wait ${Math.ceil(submitCooldown / 1000)} seconds before submitting again`);
      return;
    }

    const lastGameTime = localStorage.getItem('lastGameTime');
    const now = Date.now();
    if (lastGameTime && now - parseInt(lastGameTime) < SUBMIT_COOLDOWN_TIME) {
      toast.error("Please wait before starting a new game");
      return;
    }
    localStorage.setItem('lastGameTime', now.toString());

    setSubmitCooldown(SUBMIT_COOLDOWN_TIME);
    const interval = setInterval(() => {
      setSubmitCooldown(prev => Math.max(0, prev - 1000));
    }, 1000);
    setTimeout(() => clearInterval(interval), SUBMIT_COOLDOWN_TIME);

    setShowResult(true);
    calculatePoints();
    if (points > 0 && username && walletAddress) {
      firebaseService.addWinner(username, points);
      firebaseService.checkAndUpdateWinners(username, walletAddress, points);
    }
    setTimeout(() => {
      setShowResult(false);
      resetGame();
    }, 5000);
  };

  return (
    <motion.div
      className="relative space-y-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      {...swipeHandlers}
    >
      {!username ? (
        <UserSetup />
      ) : (
        <>
          <UserInfo />

          {/* Cycle Info */}
          <motion.div
            className="mb-6"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <CycleInfo />
          </motion.div>

          {/* Floating Logo */}
          <motion.div
            className="fixed top-4 right-4 z-50"
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            whileHover={{ scale: 1.1, rotate: 360 }}
            transition={{ duration: 0.5 }}
          >
            <img
              src={logo}
              alt="Caxino Logo"
              className="w-16 h-16 rounded-full border-2 border-game-accent/20
                         shadow-[0_0_20px_rgba(34,211,238,0.2)]"
            />
          </motion.div>

          {/* Navigation Buttons */}
          <div className="flex gap-4">
            {/* Existing Back Button */}
            <motion.button
              className="font-game text-sm px-4 py-2 
                         bg-game-dark/60 backdrop-blur-sm rounded-lg border border-game-accent/20
                         hover:bg-game-accent/20 transition-colors duration-300
                         flex items-center gap-2"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setWalletConnection(false)}
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              Back to Home
            </motion.button>

            {/* Rankings Button */}
            <motion.button
              className="font-game text-sm px-4 py-2 
                          bg-game-dark/60 backdrop-blur-sm rounded-lg border border-game-accent/20
                          hover:bg-game-accent/20 transition-colors duration-300
                          flex items-center gap-2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/rankings")}
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 8v8m-4-5v5M8 12v4m-4 4h18"
                />
              </svg>
              View All Rankings
            </motion.button>
          </div>

          {/* Background particles */}
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

          {/* Game Stats Bar */}
          <motion.div
            className="bg-game-dark/60 backdrop-blur-sm rounded-lg p-4 flex flex-col sm:flex-row justify-between items-center gap-4"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
          >
            <div className="font-game">
              <div className="text-game-light/50 text-sm">Current Points</div>
              <motion.div
                className="text-2xl font-bold text-game-accent"
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                {points}
              </motion.div>
            </div>
            <div className="font-game">
              <div className="text-game-light/50 text-sm">Numbers Selected</div>
              <div className="text-xl font-bold text-game-accent">
                {userNumbers.length}/5
              </div>
            </div>
          </motion.div>

          {/* Main Game Area */}
          <motion.div
            className="bg-game-secondary/10 backdrop-blur-lg rounded-3xl p-8 border border-game-accent/20
                       shadow-[0_0_50px_rgba(34,211,238,0.1)]"
            animate={{
              boxShadow: isGameStarted
                ? "0 0 70px rgba(34,211,238,0.2)"
                : "0 0 50px rgba(34,211,238,0.1)",
            }}
          >
            {!isGameStarted ? (
              <motion.div
                className="text-center"
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
              >
                <h2 className="font-game text-3xl font-bold mb-4 text-game-accent">
                  Ready to Play?
                </h2>
                <p className="text-game-light/80 mb-6">
                  Select 5 numbers between 1 and 100
                </p>
                <motion.button
                  className="font-game px-8 py-4 bg-game-primary rounded-xl font-bold text-lg
                             hover:bg-game-accent transition-colors duration-300"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleStartGame}
                >
                  Start New Game
                </motion.button>
              </motion.div>
            ) : (
              <div className="space-y-6">
                {/* Number Input */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <motion.input
                    type="text"
                    value={currentNumber}
                    onChange={handleNumberInput}
                    onKeyPress={handleKeyPress}
                    className="w-full sm:flex-1 bg-game-dark/50 rounded-lg px-4 py-3 font-game
                              border border-game-accent/20 focus:border-game-accent
                              transition-colors duration-300 outline-none"
                    placeholder="Enter a number (1-100)"
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                  />
                  <div className="relative">
                    <motion.button
                      className="w-full sm:w-auto px-6 py-3 bg-game-primary rounded-lg font-game
                                 hover:bg-game-accent transition-colors duration-300 relative overflow-hidden"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleAddNumber}
                      initial={{ x: 20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      disabled={submitCooldown > 0}
                    >
                      Add
                      {submitCooldown > 0 && (
                        <motion.div
                          className="absolute bottom-0 left-0 h-1 bg-game-accent"
                          initial={{ width: "100%" }}
                          animate={{ width: "0%" }}
                          transition={{ duration: SUBMIT_COOLDOWN_TIME / 1000, ease: "linear" }}
                        />
                      )}
                    </motion.button>
                    {submitCooldown > 0 && (
                      <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs text-game-light/50">
                        {Math.ceil(submitCooldown / 1000)}s
                      </div>
                    )}
                  </div>
                </div>

                {/* Selected Numbers */}
                <div className="flex flex-wrap justify-center sm:justify-start gap-3 my-6">
                  <AnimatePresence mode="popLayout">
                    {userNumbers.map((num, index) => (
                      <motion.div
                        key={index}
                        className="w-16 h-16 flex items-center justify-center 
                                 bg-game-primary rounded-lg font-bold font-game
                                 shadow-lg shadow-game-primary/20"
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        exit={{ scale: 0, rotate: 180 }}
                        whileHover={{ scale: 1.1 }}
                      >
                        {num}
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>

                {/* Submit Button */}
                <motion.button
                  className="w-full py-4 bg-game-accent text-game-dark rounded-xl 
                             font-bold text-lg font-game relative overflow-hidden
                             disabled:opacity-50 disabled:cursor-not-allowed"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleSubmit}
                  disabled={userNumbers.length !== 5 || submitCooldown > 0}
                >
                  <div className="relative">
                    Submit Numbers
                    {submitCooldown > 0 && (
                      <>
                        <motion.div
                          className="absolute bottom-0 left-0 h-1 bg-game-primary"
                          initial={{ width: "100%" }}
                          animate={{ width: "0%" }}
                          transition={{ duration: SUBMIT_COOLDOWN_TIME / 1000, ease: "linear" }}
                        />
                        <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs text-game-light/50">
                          {Math.ceil(submitCooldown / 1000)}s
                        </div>
                      </>
                    )}
                  </div>
                </motion.button>
              </div>
            )}
          </motion.div>

          {/* Results Overlay */}
          <AnimatePresence>
            {showResult && (
              <motion.div
                className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center 
                           justify-center z-50"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <motion.div
                  className="bg-game-dark/90 p-8 rounded-2xl max-w-md w-full
                             border border-game-accent/20"
                  initial={{ scale: 0.8, y: 20 }}
                  animate={{ scale: 1, y: 0 }}
                  exit={{ scale: 0.8, y: 20 }}
                >
                  <h3 className="font-game text-2xl font-bold text-game-accent mb-4">
                    Results
                  </h3>
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div>
                      <div className="text-game-light/50 mb-2 font-game">
                        Your Numbers
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {userNumbers.map((num, i) => (
                          <motion.span
                            key={i}
                            className="inline-block bg-game-primary px-2 py-1 rounded"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: i * 0.1 }}
                          >
                            {num}
                          </motion.span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <div className="text-game-light/50 mb-2 font-game">
                        Winning Numbers
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {systemNumbers.map((num, i) => (
                          <motion.span
                            key={i}
                            className="inline-block bg-game-accent text-game-dark px-2 py-1 rounded"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: i * 0.1 + 0.5 }}
                          >
                            {num}
                          </motion.span>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Mobile Number Controls */}
          {isMobile && isGameStarted && (
            <motion.div
              className="fixed bottom-4 left-0 right-0 px-4 z-20"
              initial={{ y: 100 }}
              animate={{ y: 0 }}
            >
              <div className="bg-game-dark/90 backdrop-blur-sm rounded-xl p-4 border border-game-accent/20">
                <div className="flex justify-between items-center gap-4">
                  <motion.button
                    className="w-12 h-12 bg-game-primary rounded-lg flex items-center justify-center"
                    whileTap={{ scale: 0.9 }}
                    onClick={() => {
                      if (currentNumber && parseInt(currentNumber) > 1) {
                        setCurrentNumber((prev) =>
                          (parseInt(prev) - 1).toString()
                        );
                      }
                    }}
                  >
                    <span className="text-2xl">-</span>
                  </motion.button>
                  <div className="font-game text-xl text-game-accent">
                    {currentNumber || "0"}
                  </div>
                  <motion.button
                    className="w-12 h-12 bg-game-primary rounded-lg flex items-center justify-center"
                    whileTap={{ scale: 0.9 }}
                    onClick={() => {
                      if (currentNumber && parseInt(currentNumber) < 100) {
                        setCurrentNumber((prev) =>
                          (parseInt(prev) + 1).toString()
                        );
                      }
                    }}
                  >
                    <span className="text-2xl">+</span>
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Mobile Quick Actions */}
          {isMobile && (
            <motion.button
              className="fixed right-4 bottom-24 z-20 w-12 h-12 bg-game-accent rounded-full
                         flex items-center justify-center shadow-lg"
              whileTap={{ scale: 0.9 }}
              onClick={() => setShowMobileControls(!showMobileControls)}
            >
              <span className="text-2xl">⚡</span>
            </motion.button>
          )}

          {/* Mobile Menu */}
          <AnimatePresence>
            {showMobileControls && (
              <motion.div
                className="fixed inset-0 bg-black/80 backdrop-blur-sm z-30
                           flex items-center justify-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowMobileControls(false)}
              >
                <motion.div
                  className="bg-game-dark/90 p-6 rounded-2xl w-[90%] max-w-md
                              border border-game-accent/20"
                  initial={{ scale: 0.8, y: 20 }}
                  animate={{ scale: 1, y: 0 }}
                  exit={{ scale: 0.8, y: 20 }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="space-y-4">
                    <button
                      className="w-full py-3 bg-game-primary rounded-lg font-game
                                   text-sm"
                      onClick={handleStartGame}
                    >
                      New Game
                    </button>
                    <button
                      className="w-full py-3 bg-game-accent/20 rounded-lg font-game
                                   text-sm"
                      onClick={() => setWalletConnection(false)}
                    >
                      Back to Home
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </motion.div>
  );
}
