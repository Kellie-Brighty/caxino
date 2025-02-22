import { motion } from "framer-motion";
import { ArrowTopRightOnSquareIcon } from "@heroicons/react/24/outline";

export default function MetaMaskBrowserPrompt() {
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  const isAndroid = /Android/i.test(navigator.userAgent);
  const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);

  if (!isMobile) return null;

  const handleOpenMetaMask = (e: React.MouseEvent) => {
    e.preventDefault();
    const currentURL = window.location.href;
    let metamaskURL;

    if (isAndroid) {
      // Android deep link
      metamaskURL = `metamask://dapp/${currentURL}`;
    } else if (isIOS) {
      // iOS deep link
      metamaskURL = `metamask://dapp?url=${encodeURIComponent(currentURL)}`;
    } else {
      return; // Not mobile or unsupported platform
    }

    // Try to open MetaMask app
    window.location.href = metamaskURL;

    // Fallback to app store if MetaMask isn't installed
    setTimeout(() => {
      if (isAndroid) {
        window.location.href = 'https://play.google.com/store/apps/details?id=io.metamask';
      } else if (isIOS) {
        window.location.href = 'https://apps.apple.com/us/app/metamask-blockchain-wallet/id1438144202';
      }
    }, 1500); // Give enough time for app to open
  };

  return (
    <motion.div
      className="fixed bottom-4 left-4 right-4 bg-game-accent text-game-dark p-4 rounded-xl 
                 shadow-lg z-50 border-2 border-game-dark"
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 100, opacity: 0 }}
    >
      <div className="flex items-start gap-3">
        <div className="mt-1 text-xl">📱</div>
        <div>
          <h3 className="font-game text-sm font-bold mb-1">
            Open in MetaMask Browser
          </h3>
          <p className="text-xs opacity-80 mb-2">
            For the best experience, open this site in your MetaMask mobile browser
          </p>
          <motion.button
            onClick={handleOpenMetaMask}
            className="inline-flex items-center gap-2 bg-game-dark/20 px-3 py-1.5 
                     rounded-lg text-xs font-semibold"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Open in MetaMask
            <ArrowTopRightOnSquareIcon className="w-4 h-4" />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
} 