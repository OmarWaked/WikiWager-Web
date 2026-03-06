'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '@/stores/gameStore';
import { useUserStore } from '@/stores/userStore';
import { DailyStatusBar } from '@/components/game/DailyStatusBar';
import { InventoryBar } from '@/components/game/InventoryBar';
import { DifficultySelector } from '@/components/game/DifficultySelector';
import { GameView } from '@/components/game/GameView';
import { ResultView } from '@/components/game/ResultView';
import { DayComplete } from '@/components/game/DayComplete';
import { ScoreLocked } from '@/components/game/ScoreLocked';
import { NeonButton } from '@/components/ui/NeonButton';
import { GradientButton } from '@/components/ui/GradientButton';
import { formatNumber } from '@/lib/utils';

export default function PlayPage() {
  const gameState = useGameStore((s) => s.gameState);
  const startRound = useGameStore((s) => s.startRound);
  const lockInScore = useGameStore((s) => s.lockInScore);

  const fetchUser = useUserStore((s) => s.fetchUser);
  const subscribeToChanges = useUserStore((s) => s.subscribeToChanges);
  const unsubscribe = useUserStore((s) => s.unsubscribe);
  const user = useUserStore((s) => s.user);
  const isLoading = useUserStore((s) => s.isLoading);
  const canPlay = useUserStore((s) => s.canPlay);
  const getTriesRemaining = useUserStore((s) => s.getTriesRemaining);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  useEffect(() => {
    if (user) {
      subscribeToChanges();
    }
    return () => {
      unsubscribe();
    };
  }, [user?.id, subscribeToChanges, unsubscribe]);

  const triesRemaining = getTriesRemaining();
  const todayScore = user?.today_score ?? 0;
  const isScoreLocked = user?.score_locked
    ? new Date(user.score_locked).toDateString() === new Date().toDateString()
    : false;

  return (
    <div className="min-h-screen bg-deep-void">
      {/* Background decorations */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-[150px] -left-[50px] w-[400px] h-[400px] rounded-full bg-neon-violet/[0.08] blur-[100px]" />
        <div className="absolute top-[300px] -right-[100px] w-[300px] h-[300px] rounded-full bg-electric-cyan/[0.05] blur-[80px]" />
      </div>

      <main className="relative max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Loading user state */}
        {isLoading && !user && (
          <div className="flex flex-col items-center justify-center pt-32 gap-4">
            <div className="w-10 h-10 border-4 border-neon-violet/30 border-t-neon-violet rounded-full animate-spin" />
            <p className="text-sm text-muted-gray">Loading your profile...</p>
          </div>
        )}

        {/* Main content based on game state */}
        {(!isLoading || user) && (
          <>
            {gameState === 'idle' && (
              <motion.div
                className="space-y-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4 }}
              >
                <DailyStatusBar />
                <InventoryBar />

                {/* Hero section */}
                <div className="text-center space-y-4 py-4">
                  {/* Animated rings */}
                  <div className="relative flex justify-center">
                    <div className="relative w-[100px] h-[100px]">
                      {[0, 1].map((i) => (
                        <motion.div
                          key={i}
                          className="absolute inset-0 rounded-full border-2 border-neon-violet/15"
                          style={{
                            width: 70 + i * 20,
                            height: 70 + i * 20,
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                          }}
                          animate={{ scale: [0.9, 1.1, 0.9] }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            delay: i * 0.3,
                            ease: 'easeInOut',
                          }}
                        />
                      ))}
                      <motion.span
                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-4xl"
                        animate={{ scale: [0.95, 1.05, 0.95] }}
                        transition={{
                          duration: 1.5,
                          repeat: Infinity,
                          ease: 'easeInOut',
                        }}
                      >
                        🧠
                      </motion.span>
                    </div>
                  </div>

                  <h1 className="text-2xl font-bold text-soft-white">
                    Ready to Wager?
                  </h1>
                  <p className="text-sm text-muted-gray">
                    Guess the next Wikipedia page
                  </p>
                </div>

                <DifficultySelector />

                {/* Play button */}
                <div className="space-y-3">
                  <NeonButton
                    onClick={startRound}
                    variant="violet"
                    size="lg"
                    disabled={!canPlay()}
                    className="w-full"
                  >
                    <svg className="w-5 h-5 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Start Wager
                  </NeonButton>

                  {/* Can't play reasons */}
                  {!canPlay() && (
                    <div className="text-center">
                      {isScoreLocked ? (
                        <p className="text-sm text-gold-flash">
                          Score locked in for today! Come back tomorrow.
                        </p>
                      ) : triesRemaining <= 0 ? (
                        <p className="text-sm">
                          <span className="text-hot-coral">Out of tries!</span>{' '}
                          <a
                            href="/store"
                            className="text-electric-cyan font-semibold hover:underline"
                          >
                            Get More
                          </a>
                        </p>
                      ) : null}
                    </div>
                  )}
                </div>

                {/* Lock in button (show when score > 0 and low tries) */}
                {todayScore > 0 && triesRemaining <= 2 && !isScoreLocked && (
                  <GradientButton
                    onClick={lockInScore}
                    gradient="gold"
                    size="lg"
                    fullWidth
                  >
                    <svg className="w-5 h-5 mr-1.5" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Lock In {formatNumber(todayScore)} pts
                  </GradientButton>
                )}
              </motion.div>
            )}

            {gameState === 'loading' && (
              <div className="flex flex-col items-center justify-center pt-32 gap-5">
                <div className="w-12 h-12 border-4 border-neon-violet/30 border-t-neon-violet rounded-full animate-spin" />
                <p className="text-sm text-muted-gray">
                  Pulling from the depths of knowledge...
                </p>
              </div>
            )}

            {gameState === 'playing' && <GameView />}

            {gameState === 'showingResult' && <ResultView />}

            {gameState === 'dayComplete' && <DayComplete />}

            {gameState === 'locked' && <ScoreLocked />}
          </>
        )}
      </main>
    </div>
  );
}
