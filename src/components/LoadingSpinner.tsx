import { motion } from 'framer-motion';

export default function LoadingSpinner() {
  return (
    <motion.div
      className="w-8 h-8 border-4 border-game-primary border-t-transparent 
                 rounded-full"
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
    />
  );
} 