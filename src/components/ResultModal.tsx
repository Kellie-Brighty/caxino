import { motion } from "framer-motion";
import { useGame } from "../context/GameContext";

export default function ResultModal({ onClose }: { onClose: () => void }) {
  const { state: { userNumbers, systemNumbers, points } } = useGame();
  
  const matchingNumbers = userNumbers.filter(num => systemNumbers.includes(num));
  const isWinner = matchingNumbers.length > 0;

  return (
    <motion.div
      className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="bg-game-dark/90 p-8 rounded-2xl max-w-md w-full border border-game-accent/20"
        initial={{ scale: 0.8, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.8, y: 20 }}
      >
        <div className="text-center space-y-6">
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 0.5 }}
          >
            {isWinner ? '🎉' : '😢'}
          </motion.div>
          
          <h2 className="font-game text-2xl font-bold text-game-accent">
            {isWinner ? 'Congratulations!' : 'Better Luck Next Time!'}
          </h2>

          <div className="space-y-4">
            <div>
              <div className="text-sm text-game-light/50 mb-2">Your Numbers</div>
              <div className="flex flex-wrap gap-2 justify-center">
                {userNumbers.map((num, i) => (
                  <motion.div
                    key={i}
                    className={`w-10 h-10 rounded-lg flex items-center justify-center font-game
                              ${matchingNumbers.includes(num) 
                                ? 'bg-game-accent text-game-dark' 
                                : 'bg-game-dark/40'}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                  >
                    {num}
                  </motion.div>
                ))}
              </div>
            </div>

            <div>
              <div className="text-sm text-game-light/50 mb-2">Winning Numbers</div>
              <div className="flex flex-wrap gap-2 justify-center">
                {systemNumbers.map((num, i) => (
                  <motion.div
                    key={i}
                    className={`w-10 h-10 rounded-lg flex items-center justify-center font-game
                              ${userNumbers.includes(num) 
                                ? 'bg-game-accent text-game-dark' 
                                : 'bg-game-primary/40'}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: (i * 0.1) + 0.5 }}
                  >
                    {num}
                  </motion.div>
                ))}
              </div>
            </div>

            <motion.div
              className="mt-6 p-4 bg-game-dark/40 rounded-xl"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.5 }}
            >
              <div className="text-sm text-game-light/50">Points Earned</div>
              <div className="font-game text-3xl font-bold text-game-accent">
                +{points}
              </div>
              <div className="text-sm text-game-light/50 mt-2">
                {matchingNumbers.length} matching numbers
              </div>
            </motion.div>
          </div>

          <motion.button
            className="w-full py-4 bg-game-primary text-white rounded-xl font-bold text-lg font-game"
            onClick={onClose}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Play Again
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
} 