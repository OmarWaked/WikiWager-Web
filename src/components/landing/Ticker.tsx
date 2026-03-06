'use client';

export function Ticker() {
  const items = [
    '⭐ Daily Players',
    '🔥 Highest Streak: 47',
    '👑 Global Leaderboard',
    '💎 Referral Rewards',
    '🏆 Weekly Tournaments',
    '📚 Real Wikipedia',
    '⏰ New Puzzles Daily',
    '🎯 Streak Multiplier',
  ];

  const tickerContent = items.join('   •   ');

  return (
    <section className="relative py-4 overflow-hidden border-y border-neon-violet/10">
      {/* Gradient fade edges */}
      <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-deep-void to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-deep-void to-transparent z-10 pointer-events-none" />

      <div className="flex animate-ticker whitespace-nowrap">
        <span className="text-sm font-medium tracking-wide text-neon-violet-light/70 px-4">
          {tickerContent}   •   {tickerContent}   •   
        </span>
        <span className="text-sm font-medium tracking-wide text-neon-violet-light/70 px-4" aria-hidden>
          {tickerContent}   •   {tickerContent}   •   
        </span>
      </div>
    </section>
  );
}
