'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { secondsUntil, formatCountdown } from '@/lib/utils';

interface UseCountdownOptions {
  targetTime: string;
  onComplete?: () => void;
}

interface UseCountdownReturn {
  secondsRemaining: number;
  formatted: string;
  isComplete: boolean;
}

export function useCountdown({
  targetTime,
  onComplete,
}: UseCountdownOptions): UseCountdownReturn {
  const [secondsRemaining, setSecondsRemaining] = useState(() =>
    secondsUntil(targetTime),
  );
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  const isComplete = secondsRemaining <= 0;

  useEffect(() => {
    setSecondsRemaining(secondsUntil(targetTime));

    const interval = setInterval(() => {
      const remaining = secondsUntil(targetTime);
      setSecondsRemaining(remaining);

      if (remaining <= 0) {
        clearInterval(interval);
        onCompleteRef.current?.();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [targetTime]);

  const formatted = formatCountdown(Math.max(0, secondsRemaining));

  return { secondsRemaining, formatted, isComplete };
}
