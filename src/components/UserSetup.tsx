import { motion } from "framer-motion";
import { useState } from "react";
import { toast } from "react-hot-toast";
import { useGame } from "../context/GameContext";
import { firebaseService } from "../services/firebaseService";
import { isValidXRPAddress } from "../utils/validation";
import { EthService, ETH_PAYMENT_AMOUNT } from "../services/ethService";

export default function UserSetup() {
  const { setGameStarted, dispatch } = useGame();
  const [username, setUsername] = useState("");
  const [walletAddress, setWalletAddress] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [_isProcessingPayment, setIsProcessingPayment] = useState(false);
  const RECEIVER_ADDRESS = "0x4B2cD2688Cc3a86AfF6254C8512B2fc969008093";

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
      // Connect ETH wallet first
      const ethService = EthService.getInstance();
      toast.loading("Connecting wallet...");
      const ethAddress = await ethService.connectWallet();

      setIsProcessingPayment(true);
      toast.loading("Processing payment...");
      const txHash = await ethService.makePayment(RECEIVER_ADDRESS);

      // First create the user
      toast.loading("Creating profile...");
      await firebaseService.createUser(
        username.trim(),
        walletAddress.trim(),
        ethAddress
      );

      // Then set user info in context
      dispatch({
        type: "SET_USER_INFO",
        payload: {
          username: username.trim(),
          walletAddress: walletAddress.trim(),
          ethAddress: ethAddress,
        },
      });

      // Verify payment on our backend
      toast.loading("Verifying payment...");
      await firebaseService.verifyPayment(
        walletAddress.trim(),
        ethAddress,
        txHash
      );

      // Force an immediate payment status check
      dispatch({ type: "SET_PAYMENT_STATUS", payload: true });

      toast.dismiss(); // Clear all loading toasts
      setGameStarted(true);
      toast.success("Profile set successfully!");
    } catch (error: any) {
      toast.dismiss(); // Clear all loading toasts
      console.error("Setup error:", error);
      toast.error(error.message || "Failed to set user info");
      setIsSubmitting(false);
      setIsProcessingPayment(false);
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

      <div className="text-center mt-4 text-game-light/50">
        Payment required: {ETH_PAYMENT_AMOUNT} ETH per cycle
      </div>
    </motion.div>
  );
}
