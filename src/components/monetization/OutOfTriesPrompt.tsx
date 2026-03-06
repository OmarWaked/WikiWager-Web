'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { NeonButton } from '@/components/ui/NeonButton';
import { CountdownTimer } from '@/components/ui/CountdownTimer';
import { AdInterstitial } from '@/components/ads/AdInterstitial';
import { formatNumber } from '@/lib/utils';

interface OutOfTriesPromptProps {
  isOpen: boolean;
  onClose: () => void;
  todayScore: number;
  nextResetTime?: string;
  onLockIn?: () => void;
}

export function OutOfTriesPrompt({
  isOpen,
  onClose,
  todayScore,
  nextResetTime,
  onLockIn,
}: OutOfTriesPromptProps) {
  const [showAd, setShowAd] = useState(false);

  function handleWatchAd() {
    setShowAd(true);
  }

  function handleAdClose() {
    setShowAd(false);
    onClose();
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
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ repeat: Infinity, duration: 2.5 }}
                className="text-6xl"
              >
                😵
              </motion.div>

              <h2 className="text-2xl font-bold text-soft-white">
                Out of Guesses!
              </h2>

              <div className="glass rounded-xl px-6 py-4 w-full text-center">
                <p className="text-xs text-muted-gray uppercase tracking-wider mb-1">
                  Today&apos;s Score
                </p>
                <p className="text-3xl font-bold text-gold-flash tabular-nums">
                  {formatNumber(todayScore)}
                </p>
              </div>

              <div className="w-full space-y-3">
                {onLockIn && (
                  <NeonButton
                    onClick={onLockIn}
                    variant="cyan"
                    size="lg"
                    className="w-full"
                  >
                    Lock In Your Score
                  </NeonButton>
                )}

                <Link href="/store" className="block">
                  <NeonButton
                    variant="violet"
                    size="md"
                    className="w-full"
                  >
                    Get More Guesses
                  </NeonButton>
                </Link>

                <NeonButton
                  onClick={handleWatchAd}
                  variant="gold"
                  size="md"
                  className="w-full"
                >
                  Watch Ad for 1 Free Guess
                </NeonButton>
              </div>

              {nextResetTime && (
                <div className="mt-2">
                  <CountdownTimer
                    targetTime={nextResetTime}
                    label="Next deposit in"
                  />
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AdInterstitial
        isOpen={showAd}
        onClose={handleAdClose}
        rewardType="guess"
      />
    </>
  );
}
