import { motion } from "framer-motion";
import { ETH_PAYMENT_AMOUNT } from "../services/ethService";

const steps = [
  {
    number: "1",
    title: "Hold Required Amount",
    description: "You must hold 0.5% of the total supply to participate",
    icon: "💎"
  },
  {
    number: "2",
    title: "Connect & Pay",
    description: `Pay ${ETH_PAYMENT_AMOUNT} ETH to join the current cycle and contribute to the prize pool`,
    icon: "🔗"
  },
  {
    number: "3",
    title: "Play the Game",
    description: "Guess 5 numbers and try to match the AI's selection",
    icon: "🎮"
  },
  {
    number: "4",
    title: "Win & Earn",
    description: "Match the numbers to win a share of the prize pool when the cycle ends",
    icon: "🏆"
  }
];

export default function HowToPlay() {
  return (
    <motion.div 
      className="bg-game-dark/40 rounded-2xl p-6 border border-game-accent/20
                 backdrop-blur-sm mt-8 md:mt-12 mx-auto max-w-4xl"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <h2 className="text-2xl md:text-3xl font-game text-center text-game-accent mb-8">
        How to Play
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {steps.map((step, index) => (
          <motion.div
            key={step.number}
            className="bg-game-dark/30 rounded-xl p-6 border border-game-accent/10
                       relative overflow-hidden"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 flex items-center justify-center rounded-full
                            bg-game-accent/10 text-2xl">
                {step.icon}
              </div>
              <div>
                <div className="font-game text-lg text-game-accent mb-2">
                  {step.title}
                </div>
                <p className="text-game-light/70 text-sm">
                  {step.description}
                </p>
              </div>
            </div>
            <div className="absolute -bottom-4 -right-4 text-8xl font-bold
                          text-game-accent/5 pointer-events-none">
              {step.number}
            </div>
          </motion.div>
        ))}
      </div>

      <div className="mt-8 text-center text-game-light/50 text-sm">
        Play responsibly • All payments are final • Prize distribution occurs at cycle end
      </div>
    </motion.div>
  );
} 