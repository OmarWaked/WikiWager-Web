'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { NeonButton } from '@/components/ui/NeonButton';
import { DAILY_REWARDS } from '@/lib/constants';
import { cn } from '@/lib/utils';

interface DailyRewardModalProps {
  isOpen: boolean;
  onClose: () => void;
  loginStreak: number; // 1–7
  onClaim: () => void;
}

export function DailyRewardModal({
  isOpen,
  onClose,
  loginStreak,
  onClaim,
}: DailyRewardModalProps) {
  // loginStreak is 1-indexed, clamped to 1–7
  const currentDay = Math.min(Math.max(loginStreak, 1), 7);

  return (
    <AnimatePresence>
      {isOpen && (
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
            className="relative w-full max-w-md glass rounded-2xl p-6 flex flex-col items-center gap-5"
          >
            {/* Gift icon */}
            <motion.div
              animate={{ rotate: [0, -5, 5, -5, 0] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="text-6xl"
            >
              🎁
            </motion.div>

            <h2 className="text-2xl font-bold text-soft-white">
              Daily Reward!
            </h2>

            {/* 7-day grid */}
            <div className="grid grid-cols-7 gap-2 w-full">
              {DAILY_REWARDS.map((reward) => {
                const isPast = reward.day < currentDay;
                const isCurrent = reward.day === currentDay;
                const isFuture = reward.day > currentDay;
                const isJackpot = reward.day === 7;

                return (
                  <motion.div
                    key={reward.day}
                    animate={
                      isCurrent
                        ? {
                            boxShadow: [
                              '0 0 0px rgba(124,58,237,0)',
                              '0 0 20px rgba(124,58,237,0.5)',
                              '0 0 0px rgba(124,58,237,0)',
                            ],
                          }
                        : undefined
                    }
                    transition={isCurrent ? { repeat: Infinity, duration: 2 } : undefined}
                    className={cn(
                      'flex flex-col items-center justify-center rounded-xl p-2 border transition-all',
                      isCurrent &&
                        'bg-neon-violet/20 border-neon-violet/50 ring-2 ring-neon-violet/30',
                      isPast && 'bg-electric-cyan/10 border-electric-cyan/20',
                      isFuture && 'bg-card-bg border-card-bg-light opacity-40',
                      isJackpot && isCurrent && 'bg-gold-flash/20 border-gold-flash/50 ring-2 ring-gold-flash/30',
                    )}
                  >
                    <span className="text-[10px] text-muted-gray font-medium">
                      Day {reward.day}
                    </span>

                    {isPast ? (
                      <span className="text-lg text-electric-cyan">&#10003;</span>
                    ) : (
                      <span className="text-lg">
                        {isJackpot ? '🏆' : '🎯'}
                      </span>
                    )}

                    <span
                      className={cn(
                        'text-[9px] font-medium mt-0.5 text-center leading-tight',
                        isCurrent ? 'text-soft-white' : 'text-muted-gray',
                        isJackpot && isCurrent && 'text-gold-flash font-bold',
                      )}
                    >
                      {isJackpot ? 'JACKPOT!' : reward.label}
                    </span>
                  </motion.div>
                );
              })}
            </div>

            {/* Today's reward detail */}
            <div className="glass rounded-xl px-4 py-3 w-full text-center">
              <p className="text-xs text-muted-gray uppercase tracking-wider mb-1">
                Today&apos;s Reward (Day {currentDay})
              </p>
              <p className="text-lg font-bold text-electric-cyan">
                {DAILY_REWARDS[currentDay - 1].label}
              </p>
            </div>

            <NeonButton
              onClick={onClaim}
              variant={currentDay === 7 ? 'gold' : 'violet'}
              size="lg"
              className="w-full"
            >
              {currentDay === 7 ? 'Claim JACKPOT!' : 'Claim'}
            </NeonButton>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
