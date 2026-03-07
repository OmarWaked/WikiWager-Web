'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BOT_FIRST_NAMES, BOT_LAST_INITIALS } from '@/lib/bot-names';
import { AVATAR_EMOJIS } from '@/lib/constants';

// Generate a random activity message
function generateActivity(): { name: string; emoji: string; score: number; action: string } {
  const firstName = BOT_FIRST_NAMES[Math.floor(Math.random() * BOT_FIRST_NAMES.length)];
  const lastInitial = BOT_LAST_INITIALS[Math.floor(Math.random() * 26)];
  const emoji = AVATAR_EMOJIS[Math.floor(Math.random() * AVATAR_EMOJIS.length)];
  const score = Math.floor(Math.random() * 800 + 100); // 100-900 pts
  const actions = [
    `just scored ${score} pts!`,
    `locked in ${score} pts!`,
    `is on a streak!`,
    `just beat their personal best!`,
    `joined the game!`,
  ];
  const action = actions[Math.floor(Math.random() * actions.length)];
  return { name: `${firstName} ${lastInitial}.`, emoji, score, action };
}

export function LiveActivityTicker() {
  const [activity, setActivity] = useState(generateActivity);

  useEffect(() => {
    const interval = setInterval(() => {
      setActivity(generateActivity());
    }, 5000 + Math.random() * 3000); // 5-8 seconds
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="overflow-hidden h-8 flex items-center justify-center">
      <AnimatePresence mode="wait">
        <motion.div
          key={activity.name + activity.action}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -20, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="flex items-center gap-2 text-sm text-muted-gray"
        >
          <span>{activity.emoji}</span>
          <span className="font-medium text-soft-white/80">{activity.name}</span>
          <span>{activity.action}</span>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
