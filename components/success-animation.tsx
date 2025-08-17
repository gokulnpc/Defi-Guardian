"use client";

import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, Sparkles, X, Copy, Check } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

interface SuccessAnimationProps {
  isVisible: boolean;
  onComplete?: () => void;
  message?: string;
  transactionHash?: string;
  transactionType?:
    | "coverage"
    | "claim"
    | "vote"
    | "approval"
    | "general"
    | "stake";
}

export function SuccessAnimation({
  isVisible,
  onComplete,
  message,
  transactionHash,
  transactionType = "general",
}: SuccessAnimationProps) {
  // Default messages based on transaction type
  const getDefaultMessage = () => {
    switch (transactionType) {
      case "coverage":
        return "Your policy NFT will be issued on Hedera shortly! 🎉";
      case "claim":
        return "Claim opened successfully! 📋";
      case "vote":
        return "Vote submitted successfully! ✅";
      case "approval":
        return "Approval successful! ✅";
      case "stake":
        return "PYUSD staked successfully! Your shares are being synced to Hedera! 🎉";
      default:
        return "Transaction Successful!";
    }
  };

  const displayMessage = message || getDefaultMessage();

  // Additional subtitle for coverage purchases
  const getSubtitle = () => {
    if (transactionType === "coverage") {
      return "Your coverage is being processed and will be active soon.";
    }
    if (transactionType === "stake") {
      return "Your staking position is active and earning rewards!";
    }
    return null;
  };

  const [showConfetti, setShowConfetti] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setShowConfetti(true);
      const timer = setTimeout(() => {
        setShowConfetti(false);
        if (onComplete) {
          onComplete();
        }
      }, 30000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onComplete]);

  const handleClose = () => {
    setShowConfetti(false);
    if (onComplete) {
      onComplete();
    }
  };

  const handleCopyHash = async () => {
    if (transactionHash) {
      try {
        await navigator.clipboard.writeText(transactionHash);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error("Failed to copy transaction hash:", err);
      }
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
        >
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 50, opacity: 0 }}
            className="bg-white rounded-2xl p-8 shadow-2xl max-w-md w-full mx-4 text-center relative overflow-hidden"
          >
            {/* Close Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              className="absolute top-4 right-4 h-8 w-8 p-0 hover:bg-gray-100 z-10"
            >
              <X className="w-4 h-4" />
            </Button>

            {/* Confetti Animation */}
            <AnimatePresence>
              {showConfetti && (
                <>
                  {[...Array(20)].map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{
                        x: Math.random() * 400 - 200,
                        y: -100,
                        rotate: 0,
                        scale: 0,
                      }}
                      animate={{
                        x: Math.random() * 400 - 200,
                        y: 400,
                        rotate: 360,
                        scale: [0, 1, 0],
                      }}
                      exit={{ scale: 0 }}
                      transition={{
                        duration: 2,
                        delay: i * 0.1,
                        ease: "easeOut",
                      }}
                      className="absolute pointer-events-none"
                      style={{
                        left: "50%",
                        top: "50%",
                        width: "8px",
                        height: "8px",
                        background: [
                          "#FF6B6B",
                          "#4ECDC4",
                          "#45B7D1",
                          "#96CEB4",
                          "#FFEAA7",
                          "#DDA0DD",
                          "#98D8C8",
                        ][i % 7],
                        borderRadius: "50%",
                      }}
                    />
                  ))}
                </>
              )}
            </AnimatePresence>

            {/* Success Icon */}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="mx-auto mb-4 w-16 h-16 bg-green-100 rounded-full flex items-center justify-center"
            >
              <CheckCircle className="w-8 h-8 text-green-600" />
            </motion.div>

            {/* Success Message */}
            <motion.h3
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-xl font-semibold text-gray-900 mb-2"
            >
              {displayMessage}
            </motion.h3>

            {/* Subtitle for coverage purchases */}
            {getSubtitle() && (
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="text-sm text-gray-600 mb-4"
              >
                {getSubtitle()}
              </motion.p>
            )}

            {/* Transaction Hash */}
            {transactionHash && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="mb-4"
              >
                <p className="text-sm text-gray-600 mb-2">Transaction Hash:</p>
                <div className="relative bg-gray-100 rounded-lg p-3">
                  <p className="text-xs font-mono text-gray-700 break-all pr-8">
                    {transactionHash}
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCopyHash}
                    className="absolute top-1 right-1 h-6 w-6 p-0 hover:bg-gray-200"
                    title="Copy transaction hash"
                  >
                    {copied ? (
                      <Check className="w-3 h-3 text-green-600" />
                    ) : (
                      <Copy className="w-3 h-3 text-gray-600" />
                    )}
                  </Button>
                </div>
                {copied && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="text-xs text-green-600 mt-1"
                  >
                    Copied to clipboard!
                  </motion.p>
                )}
              </motion.div>
            )}

            {/* Sparkles Icon */}
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.8, type: "spring", stiffness: 200 }}
              className="flex justify-center"
            >
              <Sparkles className="w-6 h-6 text-yellow-500" />
            </motion.div>

            {/* Auto-close indicator */}
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: "100%" }}
              transition={{ duration: 30, ease: "linear" }}
              className="absolute bottom-0 left-0 h-1 bg-green-500"
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
