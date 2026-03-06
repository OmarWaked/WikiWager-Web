'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { secondsUntil, formatCountdown } from '@/lib/utils';

interface CountdownTimerProps {
  targetTime: string;
  label?: string;
  onComplete?: () => void;
}

export function CountdownTimer({ targetTime, label, onComplete }: CountdownTimerProps) {
  const [remaining, setRemaining] = useState(() => secondsUntil(targetTime));

  useEffect(() => {
    setRemaining(secondsUntil(targetTime));

    const interval = setInterval(() => {
      const seconds = secondsUntil(targetTime);
      setRemaining(seconds);

      if (seconds <= 0) {
        clearInterval(interval);
        onComplete?.();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [targetTime, onComplete]);

  const isUrgent = remaining > 0 && remaining <= 60;

  return (
    <div className="flex flex-col items-center gap-1">
      {label && (
        <span className="text-xs text-muted-gray uppercase tracking-wider">{label}</span>
      )}
      <span
        className={cn(
          'text-3xl font-mono font-bold tabular-nums tracking-wider',
          remaining <= 0
            ? 'text-muted-gray'
            : isUrgent
              ? 'text-hot-coral animate-neon-pulse'
              : 'text-electric-cyan',
        )}
      >
        {formatCountdown(remaining)}
      </span>
    </div>
  );
}
