import { motion } from "framer-motion";
import { useEffect, useState } from "react";

const gameIcons = [
  "🎲",
  "🎮",
  "🎯",
  "🎪",
  "🎨",
  "🎭",
  "🎪",
  "🎫",
  "🎰",
  "🎲",
  "🎳",
  "🎯",
  "🎱",
  "🎮",
  "🕹️",
  "🎲",
  "🎮",
  "🎯",
  "🎪",
  "🎨",
];

export default function GameBackground() {
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const updateDimensions = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };
    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    return () => window.removeEventListener("resize", updateDimensions);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Grid Lines */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#22d3ee30_1px,transparent_1px),linear-gradient(to_bottom,#22d3ee30_1px,transparent_1px)] bg-[size:2rem_2rem]" />

      {/* Floating Game Icons */}
      {dimensions.width &&
        gameIcons.map((icon, i) => (
          <motion.div
            key={i}
            className="absolute text-7xl opacity-30 hover:opacity-60 transition-opacity duration-300"
            initial={{
              x: Math.random() * dimensions.width,
              y: Math.random() * dimensions.height,
              rotate: Math.random() * 360,
            }}
            animate={{
              x: [
                Math.random() * dimensions.width,
                Math.random() * dimensions.width,
              ],
              y: [
                Math.random() * dimensions.height,
                Math.random() * dimensions.height,
              ],
              rotate: [0, 360],
              scale: [1, 1.4, 1],
            }}
            transition={{
              duration: Math.random() * 25 + 25,
              repeat: Infinity,
              ease: "linear",
            }}
          >
            {icon}
          </motion.div>
        ))}

      {/* Glowing Orbs */}
      <motion.div
        className="absolute w-[500px] h-[500px] rounded-full bg-game-primary/30 blur-[120px]"
        animate={{
          x: [0, 600, 0],
          y: [0, 300, 0],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "linear",
        }}
      />
      <motion.div
        className="absolute right-0 w-[600px] h-[600px] rounded-full bg-game-accent/30 blur-[120px]"
        animate={{
          x: [0, -400, 0],
          y: [0, 400, 0],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "linear",
        }}
      />

      {/* Cyber Lines */}
      <div className="absolute inset-0">
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute h-[2px] w-full bg-gradient-to-r from-transparent via-game-accent/30 to-transparent"
            initial={{ y: Math.random() * dimensions.height }}
            animate={{
              y: [
                Math.random() * dimensions.height,
                Math.random() * dimensions.height,
              ],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: Math.random() * 15 + 15,
              repeat: Infinity,
              ease: "linear",
            }}
          />
        ))}
      </div>

      {/* Matrix-like Digital Rain */}
      <div className="absolute inset-0">
        {[...Array(10)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-[2px] h-20 bg-gradient-to-b from-transparent via-game-accent/40 to-transparent"
            initial={{
              x: Math.random() * dimensions.width,
              y: -100,
            }}
            animate={{
              y: [dimensions.height + 100],
            }}
            transition={{
              duration: Math.random() * 5 + 5,
              repeat: Infinity,
              ease: "linear",
              delay: Math.random() * 5,
            }}
          />
        ))}
      </div>

      {/* Vignette Effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-game-dark/90 via-transparent to-game-dark/90" />
      <div className="absolute inset-0 bg-gradient-to-b from-game-dark/90 via-transparent to-game-dark/90" />
    </div>
  );
}
