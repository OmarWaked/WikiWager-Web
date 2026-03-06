'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { NeonButton } from '@/components/ui/NeonButton';
import { AdInterstitial } from '@/components/ads/AdInterstitial';

interface RevengeModeOfferProps {
  isOpen: boolean;
  onClose: () => void;
  correctPageTitle: string;
  onBuyRevenge: () => void;
  onWatchAd: () => void;
  onUseToken: () => void;
  tokenCount?: number;
}

export function RevengeModeOffer({
  isOpen,
  onClose,
  correctPageTitle,
  onBuyRevenge,
  onWatchAd,
  onUseToken,
  tokenCount = 0,
}: RevengeModeOfferProps) {
  const [showAd, setShowAd] = useState(false);
  const [buyLoading, setBuyLoading] = useState(false);

  async function handleBuyRevenge() {
    setBuyLoading(true);
    try {
      await onBuyRevenge();
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
              {/* Sword icon */}
              <motion.div
                animate={{ rotate: [0, -10, 10, 0] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
                className="text-6xl"
              >
                🗡️
              </motion.div>

              <h2 className="text-2xl font-bold text-soft-white">
                Revenge Mode!
              </h2>

              <div className="glass rounded-xl px-4 py-3 w-full text-center">
                <p className="text-xs text-muted-gray uppercase tracking-wider mb-1">
                  The answer was
                </p>
                <p className="text-lg font-semibold text-electric-cyan">
                  {correctPageTitle}
                </p>
              </div>

              <p className="text-muted-gray text-center text-sm">
                Get another chance with one wrong option removed!
              </p>

              <div className="w-full space-y-3">
                {tokenCount > 0 && (
                  <NeonButton
                    onClick={onUseToken}
                    variant="cyan"
                    size="lg"
                    className="w-full"
                  >
                    Use Token ({tokenCount} remaining)
                  </NeonButton>
                )}

                <NeonButton
                  onClick={handleBuyRevenge}
                  variant="violet"
                  size="md"
                  loading={buyLoading}
                  className="w-full"
                >
                  Buy Revenge Token — $0.99
                </NeonButton>

                <NeonButton
                  onClick={handleWatchAd}
                  variant="gold"
                  size="md"
                  className="w-full"
                >
                  Watch Ad for Free Retry
                </NeonButton>

                <button
                  onClick={onClose}
                  className="w-full text-center text-sm text-muted-gray hover:text-soft-white transition-colors py-2"
                >
                  Accept Defeat
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AdInterstitial
        isOpen={showAd}
        onClose={handleAdClose}
        rewardType="revenge"
      />
    </>
  );
}
