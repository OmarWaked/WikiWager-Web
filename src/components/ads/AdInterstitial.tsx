'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AdBanner } from './AdBanner';
import { NeonButton } from '@/components/ui/NeonButton';

type RewardType = 'guess' | 'shield' | 'revenge' | null;

interface AdInterstitialProps {
  isOpen: boolean;
  onClose: () => void;
  rewardType?: RewardType;
}

const rewardLabels: Record<string, string> = {
  guess: 'Free Guess',
  shield: 'Free Shield',
  revenge: 'Free Revenge Token',
};

export function AdInterstitial({
  isOpen,
  onClose,
  rewardType = null,
}: AdInterstitialProps) {
  const [countdown, setCountdown] = useState(5);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setCountdown(5);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      return;
    }

    // Start countdown when modal opens
    setCountdown(5);
    timerRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isOpen]);

  // Lock body scroll
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const canClose = countdown <= 0;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 bg-deep-void/90 backdrop-blur-md"
          />

          {/* Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full max-w-sm glass rounded-2xl p-6 flex flex-col items-center gap-4"
          >
            {/* Reward message */}
            {rewardType && (
              <div className="text-center">
                <p className="text-gold-flash font-semibold text-lg">
                  Watch to earn a free {rewardLabels[rewardType] ?? rewardType}!
                </p>
              </div>
            )}

            {/* Ad slot */}
            <div className="w-full flex items-center justify-center min-h-[250px]">
              <AdBanner slot="interstitial" format="rectangle" />
            </div>

            {/* Close button / countdown */}
            {canClose ? (
              <NeonButton onClick={onClose} variant="violet" size="md">
                {rewardType ? 'Claim Reward' : 'Continue'}
              </NeonButton>
            ) : (
              <p className="text-muted-gray text-sm tabular-nums">
                Close in {countdown}s
              </p>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
