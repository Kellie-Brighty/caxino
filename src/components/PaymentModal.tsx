import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { toast } from "react-hot-toast";
import { EthService, ETH_PAYMENT_AMOUNT } from "../services/ethService";
import { firebaseService } from "../services/firebaseService";
import { useGame } from "../context/GameContext";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPaymentComplete: () => void;
}

export default function PaymentModal({
  isOpen,
  onClose,
  onPaymentComplete,
}: PaymentModalProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const {
    state: { ethAddress },
    dispatch,
  } = useGame();
  const RECEIVER_ADDRESS = "0x4B2cD2688Cc3a86AfF6254C8512B2fc969008093";

  const handlePayment = async () => {
    setIsProcessing(true);
    toast.dismiss(); // Clear any existing toasts
    try {
      const ethService = EthService.getInstance();

      // First ensure wallet is connected
      console.log("ethAddress", ethAddress);
      if (!ethAddress) {
        toast.loading("Connecting wallet...");
        const connectedAddress = await ethService.connectWallet();
        if (!connectedAddress) {
          throw new Error("Failed to connect wallet");
        }
      }

      const loadingToast = toast.loading("Processing payment...");
      const txHash = await ethService.makePayment(RECEIVER_ADDRESS);
      console.log("txHash", txHash);

      toast.loading("Verifying payment...", { id: loadingToast });

      await firebaseService.verifyPayment(ethAddress!, ethAddress!, txHash);

      // Get current cycle to verify payment was recorded
      const currentCycle = await firebaseService.getCurrentCycle();
      console.log("currentCycle", currentCycle);
      const hasValidPayment = await firebaseService.hasValidPaymentForCycle(
        ethAddress!,
        currentCycle.cycleNumber
      );

      if (!hasValidPayment) {
        throw new Error("Payment verification failed");
      }

      dispatch({ type: "SET_PAYMENT_STATUS", payload: true });
      toast.dismiss(loadingToast);
      toast.success("Payment successful!");
      onPaymentComplete();
      onClose();
    } catch (error: any) {
      console.error("Payment error:", error);
      toast.error(error.message || "Payment failed");
      setIsProcessing(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          // onClick={onClose}
        >
          <motion.div
            className="bg-game-dark/90 p-8 rounded-2xl w-[90%] max-w-md border border-game-accent/20"
            initial={{ scale: 0.8, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.8, y: 20 }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-game text-xl text-center mb-6">
              Payment Required
            </h3>
            <p className="text-center text-game-light/70 mb-6">
              Please make a payment of {ETH_PAYMENT_AMOUNT} ETH to continue
              playing in this cycle.
            </p>
            <motion.button
              className="w-full py-4 bg-game-primary text-white rounded-xl 
                       font-bold text-lg font-game relative overflow-hidden
                       disabled:opacity-50 disabled:cursor-not-allowed"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handlePayment}
              disabled={isProcessing}
            >
              {isProcessing ? "Processing..." : "Make Payment"}
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
