'use client';

import { useState, useEffect } from 'react';

interface PlayersOnlineCounterProps {
  className?: string;
  compact?: boolean;
}

export function PlayersOnlineCounter({ className = '', compact = false }: PlayersOnlineCounterProps) {
  const [count, setCount] = useState(() => Math.floor(380 + Math.random() * 100));

  useEffect(() => {
    const interval = setInterval(() => {
      setCount(prev => {
        // Small random drift: +-1-5 players
        const drift = Math.floor(Math.random() * 11) - 5;
        return Math.max(300, Math.min(600, prev + drift));
      });
    }, 30000 + Math.random() * 30000); // 30-60 seconds
    return () => clearInterval(interval);
  }, []);

  if (compact) {
    return (
      <div className={`flex items-center gap-1.5 text-xs text-muted-gray ${className}`}>
        <span className="w-2 h-2 rounded-full bg-electric-cyan animate-pulse" />
        <span>{count.toLocaleString()} online</span>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2 text-sm text-muted-gray ${className}`}>
      <span className="w-2.5 h-2.5 rounded-full bg-electric-cyan animate-pulse" />
      <span>
        <span className="font-semibold text-electric-cyan">{count.toLocaleString()}</span> players online
      </span>
    </div>
  );
}
