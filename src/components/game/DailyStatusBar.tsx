'use client';

import { useUserStore } from '@/stores/userStore';
import { GlassCard } from '@/components/ui/GlassCard';
import { StatBox } from '@/components/ui/StatBox';
import { StreakBadge } from '@/components/ui/StreakBadge';
import { CountdownTimer } from '@/components/ui/CountdownTimer';

export function DailyStatusBar() {
  const user = useUserStore((s) => s.user);
  const getTriesRemaining = useUserStore((s) => s.getTriesRemaining);

  if (!user) return null;

  const triesRemaining = getTriesRemaining();

  return (
    <GlassCard className="space-y-4">
      {/* Stat boxes row */}
      <div className="grid grid-cols-3 gap-3">
        <StatBox
          label="Today"
          value={user.today_score}
          icon="💰"
          color="gold"
        />
        <div className="flex flex-col items-center">
          <StatBox
            label="Streak"
            value={user.current_streak}
            icon="🔥"
            color={user.current_streak >= 5 ? 'coral' : 'cyan'}
            pulse={user.current_streak > 0}
          />
          {user.current_streak > 0 && (
            <div className="mt-1">
              <StreakBadge streak={user.current_streak} size="sm" />
            </div>
          )}
        </div>
        <StatBox
          label="Tries"
          value={triesRemaining}
          icon="🎯"
          color="violet"
          pulse={triesRemaining <= 1}
        />
      </div>

      {/* Countdown timer */}
      {user.next_reset_time && (
        <div className="pt-2 border-t border-neon-violet/10">
          <CountdownTimer
            targetTime={user.next_reset_time}
            label="Next guess deposit"
            onComplete={() => {
              // Refetch user to get updated guesses
              useUserStore.getState().fetchUser();
            }}
          />
        </div>
      )}
    </GlassCard>
  );
}
