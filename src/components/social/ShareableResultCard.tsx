'use client';

import { motion } from 'framer-motion';
import { GlassCard } from '@/components/ui/GlassCard';
import { AvatarEmoji } from '@/components/ui/AvatarEmoji';
import { StreakBadge } from '@/components/ui/StreakBadge';
import { NeonButton } from '@/components/ui/NeonButton';
import { cn, formatNumber, generateShareText } from '@/lib/utils';
import { DIFFICULTIES } from '@/lib/constants';
import { toast } from 'sonner';
import type { Difficulty } from '@/types/game';

interface ShareableResultCardProps {
  dayNumber: number;
  score: number;
  streak: number;
  results: boolean[];
  difficulty: Difficulty;
  displayName: string;
  avatarEmoji: string;
  isLocked: boolean;
}

export function ShareableResultCard({
  dayNumber,
  score,
  streak,
  results,
  difficulty,
  displayName,
  avatarEmoji,
  isLocked,
}: ShareableResultCardProps) {
  const diffConfig = DIFFICULTIES[difficulty] ?? DIFFICULTIES.normal;
  const correctCount = results.filter(Boolean).length;

  const handleCopyResults = async () => {
    const text = generateShareText(dayNumber, score, streak, results, difficulty, isLocked);
    try {
      await navigator.clipboard.writeText(text);
      toast.success('Results copied to clipboard!');
    } catch {
      toast.error('Failed to copy results');
    }
  };

  const handleShare = async () => {
    const text = generateShareText(dayNumber, score, streak, results, difficulty, isLocked);

    if (navigator.share) {
      try {
        await navigator.share({
          title: `WikiWager Day #${dayNumber}`,
          text,
        });
        return;
      } catch {
        // User cancelled — fall through
      }
    }

    // Fallback to clipboard
    await handleCopyResults();
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
    >
      <GlassCard className="relative overflow-hidden border border-neon-violet/20">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-gradient-to-br from-neon-violet/5 via-transparent to-gold-flash/5 pointer-events-none" />

        <div className="relative space-y-5">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xl">{'\u{1F9E0}'}</span>
              <span className="text-sm font-bold text-gradient-violet">WikiWager</span>
            </div>
            <span className="text-xs font-mono text-muted-gray">
              Day #{dayNumber}
            </span>
          </div>

          {/* User info */}
          <div className="flex items-center gap-3">
            <AvatarEmoji emoji={avatarEmoji} size="md" ring />
            <div>
              <p className="text-sm font-semibold text-soft-white">{displayName}</p>
              <div className="flex items-center gap-2 mt-0.5">
                <span
                  className="text-xs font-medium px-2 py-0.5 rounded-md"
                  style={{
                    backgroundColor: `${diffConfig.color}15`,
                    color: diffConfig.color,
                  }}
                >
                  {diffConfig.icon} {diffConfig.label}
                </span>
              </div>
            </div>
          </div>

          {/* Score */}
          <div className="text-center space-y-2">
            <p className="text-5xl font-bold text-gradient-gold">
              {formatNumber(score)}
            </p>
            <p className="text-xs text-muted-gray uppercase tracking-wider">points</p>
          </div>

          {/* Streak */}
          <div className="flex justify-center">
            <StreakBadge streak={streak} size="lg" />
          </div>

          {/* Emoji grid (Wordle-style) */}
          <div className="flex justify-center gap-2">
            {results.map((isCorrect, i) => (
              <motion.span
                key={i}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: i * 0.1, type: 'spring', stiffness: 400 }}
                className={cn(
                  'w-8 h-8 rounded-lg flex items-center justify-center text-base',
                  isCorrect
                    ? 'bg-electric-cyan/20 border border-electric-cyan/40'
                    : 'bg-hot-coral/20 border border-hot-coral/40',
                )}
              >
                {isCorrect ? '\u{1F7E2}' : '\u{1F534}'}
              </motion.span>
            ))}
          </div>

          {/* Correct count */}
          <p className="text-center text-sm text-muted-gray">
            {correctCount}/{results.length} correct
          </p>

          {/* Lock badge */}
          {isLocked && (
            <div className="flex justify-center">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gold-flash/10 text-gold-flash text-xs font-semibold">
                {'\u{1F512}'} Score Locked
              </span>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <NeonButton
              onClick={handleCopyResults}
              variant="cyan"
              size="md"
              className="flex-1"
            >
              <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              Copy
            </NeonButton>
            <NeonButton
              onClick={handleShare}
              variant="violet"
              size="md"
              className="flex-1"
            >
              <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
              Share
            </NeonButton>
          </div>
        </div>
      </GlassCard>
    </motion.div>
  );
}
