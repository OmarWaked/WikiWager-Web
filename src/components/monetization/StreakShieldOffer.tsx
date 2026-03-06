'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { NeonButton } from '@/components/ui/NeonButton';
import { AdInterstitial } from '@/components/ads/AdInterstitial';

interface StreakShieldOfferProps {
  isOpen: boolean;
  onClose: () => void;
  streak: number;
  onBuyShield: () => void;
  onWatchAd: () => void;
}

export function StreakShieldOffer({
  isOpen,
  onClose,
  streak,
  onBuyShield,
  onWatchAd,
}: StreakShieldOfferProps) {
  const [showAd, setShowAd] = useState(false);
  const [buyLoading, setBuyLoading] = useState(false);

  async function handleBuyShield() {
    setBuyLoading(true);
    try {
      await onBuyShield();
    } finally {
      setBuyLoading(false);
    }
  }

  function handleWatchAd() {
    setShowAd(true);
  }

  function handleAdClose() {
    setShowAd(false);
    onWatchAd();
  }

  return (
    <>
      <AnimatePresence>
        {isOpen && !showAd && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 bg-deep-void/80 backdrop-blur-sm"
              onClick={onClose}
            />

            {/* Content */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 30 }}
              transition={{ type: 'spring', damping: 20, stiffness: 300 }}
              className="relative w-full max-w-sm glass rounded-2xl p-6 flex flex-col items-center gap-5"
            >
              {/* Shield icon */}
              <motion.div
                animate={{ scale: [1, 1.15, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="text-6xl"
              >
                🛡️
              </motion.div>

              <h2 className="text-2xl font-bold text-soft-white">
                Protect Your Streak!
              </h2>

              <div className="flex items-center gap-2">
                <span className="text-3xl">🔥</span>
                <span className="text-4xl font-bold text-gold-flash tabular-nums">
                  {streak}
                </span>
                <span className="text-muted-gray text-sm">day streak</span>
              </div>

              <p className="text-muted-gray text-center">
                Your <span className="text-soft-white font-semibold">{streak}-day streak</span> is at risk!
                Use a shield to protect it.
              </p>

              <div className="w-full space-y-3">
                <NeonButton
                  onClick={handleBuyShield}
                  variant="violet"
                  size="lg"
                  loading={buyLoading}
                  className="w-full"
                >
                  Buy Shield — $0.99
                </NeonButton>

                <NeonButton
                  onClick={handleWatchAd}
                  variant="cyan"
                  size="md"
                  className="w-full"
                >
                  Watch Ad for Free Shield
                </NeonButton>

                <button
                  onClick={onClose}
                  className="w-full text-center text-sm text-muted-gray hover:text-soft-white transition-colors py-2"
                >
                  No Thanks
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AdInterstitial
        isOpen={showAd}
        onClose={handleAdClose}
        rewardType="shield"
      />
    </>
  );
}
