import { motion } from "framer-motion";
import { useState } from "react";
import { toast } from "react-hot-toast";
import { useGame } from "../context/GameContext";
import { firebaseService } from "../services/firebaseService";
import { isValidXRPAddress } from "../utils/validation";

export default function UserSetup() {
  const { setGameStarted, dispatch } = useGame();
  const [username, setUsername] = useState("");
  const [walletAddress, setWalletAddress] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!username.trim() || !walletAddress.trim()) {
      toast.error("Please fill in all fields");
      setIsSubmitting(false);
      return;
    }

    // Basic wallet address validation
    if (!/^[0-9a-zA-Z]{20,}$/.test(walletAddress)) {
      toast.error("Please enter a valid wallet address");
      setIsSubmitting(false);
      return;
    }

    if (!isValidXRPAddress(walletAddress)) {
      toast.error("Please enter a valid XRP wallet address");
      setIsSubmitting(false);
      return;
    }

    try {
      await firebaseService.createUser(username.trim(), walletAddress.trim());
      dispatch({
        type: "SET_USER_INFO",
        payload: {
          username: username.trim(),
          walletAddress: walletAddress.trim(),
        },
      });
      setGameStarted(true);
      toast.success("Profile set successfully!");
    } catch (error) {
      toast.error("Failed to set user info");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      className="bg-game-secondary/10 backdrop-blur-lg rounded-3xl p-8 border border-game-accent/20
                 shadow-[0_0_50px_rgba(34,211,238,0.1)] max-w-md mx-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <h2 className="font-game text-2xl text-center mb-6">
        Set Up Your Profile
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block font-game text-sm mb-2">Username</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full bg-game-dark/50 rounded-lg px-4 py-3 font-game
                     border border-game-accent/20 focus:border-game-accent
                     transition-colors duration-300 outline-none"
            placeholder="Enter your username"
          />
        </div>

        <div>
          <label className="block font-game text-sm mb-2">Wallet Address</label>
          <input
            type="text"
            value={walletAddress}
            onChange={(e) => setWalletAddress(e.target.value)}
            className="w-full bg-game-dark/50 rounded-lg px-4 py-3 font-game
                     border border-game-accent/20 focus:border-game-accent
                     transition-colors duration-300 outline-none"
            placeholder="Enter your wallet address"
          />
        </div>

        <motion.button
          type="submit"
          className="w-full py-4 bg-game-primary text-white rounded-xl 
                   font-bold text-lg font-game relative overflow-hidden
                   disabled:opacity-50 disabled:cursor-not-allowed"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          disabled={isSubmitting}
        >
          {isSubmitting ? "Setting Up..." : "Start Playing"}
        </motion.button>
      </form>
    </motion.div>
  );
}
