'use client';

import { motion } from 'framer-motion';
import { GlassCard } from '@/components/ui/GlassCard';
import { AvatarEmoji } from '@/components/ui/AvatarEmoji';
import { NeonButton } from '@/components/ui/NeonButton';
import { cn, formatNumber } from '@/lib/utils';
import { DIFFICULTIES } from '@/lib/constants';
import type { Challenge, ChallengeStatus } from '@/types/challenge';
import type { Difficulty } from '@/types/game';

interface ChallengeCardProps {
  challenge: Challenge;
  currentUserId: string;
  onAccept?: (id: string) => void;
  onDecline?: (id: string) => void;
}

const statusConfig: Record<ChallengeStatus, { label: string; color: string; bg: string }> = {
  pending:   { label: 'Pending',   color: 'text-gold-flash',     bg: 'bg-gold-flash/10' },
  active:    { label: 'Active',    color: 'text-electric-cyan',   bg: 'bg-electric-cyan/10' },
  completed: { label: 'Completed', color: 'text-neon-violet',     bg: 'bg-neon-violet/10' },
  declined:  { label: 'Declined',  color: 'text-muted-gray',      bg: 'bg-muted-gray/10' },
  expired:   { label: 'Expired',   color: 'text-muted-gray',      bg: 'bg-muted-gray/10' },
};

export function ChallengeCard({
  challenge,
  currentUserId,
  onAccept,
  onDecline,
}: ChallengeCardProps) {
  const isOpponent = challenge.opponent_id === currentUserId;
  const isPending = challenge.status === 'pending';
  const isCompleted = challenge.status === 'completed';
  const diffConfig = DIFFICULTIES[challenge.difficulty as Difficulty] ?? DIFFICULTIES.normal;
  const status = statusConfig[challenge.status] ?? statusConfig.pending;

  // Determine winner for completed challenges
  const challengerWon =
    isCompleted &&
    (challenge.challenger_score ?? 0) >= (challenge.opponent_score ?? 0);
  const winnerId = challengerWon ? challenge.challenger_id : challenge.opponent_id;
  const isTie =
    isCompleted && challenge.challenger_score === challenge.opponent_score;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <GlassCard className="relative overflow-hidden border border-card-bg-light/50">
        {/* Status badge */}
        <div className="flex items-center justify-between mb-4">
          <span
            className={cn(
              'text-xs font-semibold px-2.5 py-1 rounded-full',
              status.bg,
              status.color,
            )}
          >
            {status.label}
          </span>
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

        {/* VS layout */}
        <div className="flex items-center gap-3">
          {/* Challenger */}
          <div className="flex-1 text-center space-y-2">
            <div className="flex justify-center">
              <AvatarEmoji
                emoji={challenge.challenger_avatar}
                size="lg"
                ring={isCompleted && challengerWon && !isTie}
                vip={isCompleted && challengerWon && !isTie}
              />
            </div>
            <p className="text-sm font-semibold text-soft-white truncate">
              {challenge.challenger_name}
            </p>
            {isCompleted && challenge.challenger_score != null && (
              <p className="text-lg font-bold text-gradient-gold">
                {formatNumber(challenge.challenger_score)}
              </p>
            )}
          </div>

          {/* VS divider */}
          <div className="flex flex-col items-center gap-1">
            <span className="text-xs font-bold text-muted-gray">VS</span>
            <div className="w-px h-8 bg-card-bg-light/50" />
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-gold-flash/10">
              <span className="text-xs">{'\u{1F4B0}'}</span>
              <span className="text-xs font-bold text-gold-flash">
                {formatNumber(challenge.wager_amount)}
              </span>
            </div>
          </div>

          {/* Opponent */}
          <div className="flex-1 text-center space-y-2">
            <div className="flex justify-center">
              <AvatarEmoji
                emoji={challenge.opponent_avatar}
                size="lg"
                ring={isCompleted && !challengerWon && !isTie}
                vip={isCompleted && !challengerWon && !isTie}
              />
            </div>
            <p className="text-sm font-semibold text-soft-white truncate">
              {challenge.opponent_name}
            </p>
            {isCompleted && challenge.opponent_score != null && (
              <p className="text-lg font-bold text-gradient-gold">
                {formatNumber(challenge.opponent_score)}
              </p>
            )}
          </div>
        </div>

        {/* Winner display */}
        {isCompleted && (
          <div className="mt-4 text-center">
            {isTie ? (
              <p className="text-sm font-semibold text-gold-flash">
                {'\u{1F91D}'} It&apos;s a tie!
              </p>
            ) : (
              <p className="text-sm font-semibold text-electric-cyan">
                {'\u{1F3C6}'}{' '}
                {winnerId === currentUserId
                  ? 'You won!'
                  : `${challengerWon ? challenge.challenger_name : challenge.opponent_name} wins!`}
              </p>
            )}
          </div>
        )}

        {/* Accept/Decline for pending challenges where user is opponent */}
        {isPending && isOpponent && (
          <div className="mt-4 flex gap-3">
            <NeonButton
              onClick={() => onDecline?.(challenge.id)}
              variant="coral"
              size="sm"
              className="flex-1"
            >
              Decline
            </NeonButton>
            <NeonButton
              onClick={() => onAccept?.(challenge.id)}
              variant="cyan"
              size="sm"
              className="flex-1"
            >
              Accept
            </NeonButton>
          </div>
        )}
      </GlassCard>
    </motion.div>
  );
}
