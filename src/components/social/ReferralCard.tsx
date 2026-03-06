'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { GlassCard } from '@/components/ui/GlassCard';
import { NeonButton } from '@/components/ui/NeonButton';
import { toast } from 'sonner';

interface ReferralCardProps {
  referralCode: string;
  referralCount: number;
}

const REWARD_TIERS = [
  { count: 1, label: '1 friend', reward: '+2 guesses each' },
  { count: 5, label: '5 friends', reward: 'Social Butterfly badge' },
  { count: 10, label: '10 friends', reward: '+5 bonus guesses' },
  { count: 25, label: '25 friends', reward: 'Referral King badge' },
];

export function ReferralCard({ referralCode, referralCount }: ReferralCardProps) {
  const [copied, setCopied] = useState(false);

  const shareText = `Join me on WikiWager! Use code ${referralCode} for 2 free guesses \u{1F9E0} wikiwager.vercel.app/invite/${referralCode}`;

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(referralCode);
      setCopied(true);
      toast.success('Referral code copied!');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Failed to copy');
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'WikiWager',
          text: shareText,
        });
        return;
      } catch {
        // User cancelled or share failed — fall through to clipboard
      }
    }

    try {
      await navigator.clipboard.writeText(shareText);
      toast.success('Share link copied to clipboard!');
    } catch {
      toast.error('Failed to copy share link');
    }
  };

  const currentTierIndex = REWARD_TIERS.findIndex((t) => referralCount < t.count);
  const nextTier = currentTierIndex >= 0 ? REWARD_TIERS[currentTierIndex] : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <GlassCard className="relative overflow-hidden border border-neon-violet/20">
        {/* Gradient border glow */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-neon-violet/10 via-transparent to-electric-cyan/10 pointer-events-none" />

        <div className="relative space-y-5">
          {/* Header */}
          <div className="text-center space-y-1">
            <p className="text-xs font-mono text-muted-gray uppercase tracking-wider">
              Your Referral Code
            </p>
          </div>

          {/* Big code display */}
          <motion.button
            onClick={handleCopyCode}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full py-4 px-6 rounded-xl bg-deep-void/60 border border-neon-violet/30 hover:border-neon-violet/60 transition-colors group cursor-pointer"
          >
            <p className="text-3xl sm:text-4xl font-bold font-mono tracking-widest text-gradient-violet text-center">
              {referralCode}
            </p>
            <p className="text-xs text-muted-gray mt-2 group-hover:text-soft-white transition-colors">
              {copied ? 'Copied!' : 'Tap to copy'}
            </p>
          </motion.button>

          {/* Stats */}
          <div className="flex items-center justify-center gap-2">
            <span className="text-lg">{'\u{1F465}'}</span>
            <span className="text-sm font-semibold text-soft-white">
              {referralCount} friend{referralCount !== 1 ? 's' : ''} referred
            </span>
          </div>

          {/* Next reward tier */}
          {nextTier && (
            <div className="text-center">
              <p className="text-xs text-muted-gray">
                {nextTier.count - referralCount} more to unlock:{' '}
                <span className="text-electric-cyan font-medium">{nextTier.reward}</span>
              </p>
              <div className="mt-2 h-1.5 w-full bg-deep-void/60 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-neon-violet to-electric-cyan rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(100, (referralCount / nextTier.count) * 100)}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                />
              </div>
            </div>
          )}

          {/* Share button */}
          <NeonButton
            onClick={handleShare}
            variant="violet"
            size="lg"
            className="w-full"
          >
            <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
            Share Invite Link
          </NeonButton>
        </div>
      </GlassCard>
    </motion.div>
  );
}
