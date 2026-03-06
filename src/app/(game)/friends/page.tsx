'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';
import { ReferralCard } from '@/components/social/ReferralCard';
import { FriendsList } from '@/components/social/FriendsList';
import { GlassCard } from '@/components/ui/GlassCard';
import { NeonButton } from '@/components/ui/NeonButton';
import { ADSENSE_PUB_ID } from '@/lib/constants';
import type { Friend } from '@/types/user';

export default function FriendsPage() {
  const [referralCode, setReferralCode] = useState('');
  const [referralCount, setReferralCount] = useState(0);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [redeemCode, setRedeemCode] = useState('');
  const [redeeming, setRedeeming] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      const supabase = createClient();

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      // Fetch user profile for referral code
      const { data: profile } = await supabase
        .from('users')
        .select('referral_code, friend_count')
        .eq('id', user.id)
        .single();

      if (profile) {
        setReferralCode(profile.referral_code ?? '');
        setReferralCount(profile.friend_count ?? 0);
      }

      // Fetch friends with joined user data
      const { data: friendRows } = await supabase
        .from('friends')
        .select('id, user_id, friend_id, added_at')
        .eq('user_id', user.id);

      if (friendRows && friendRows.length > 0) {
        const friendIds = friendRows.map((f: { friend_id: string }) => f.friend_id);

        const { data: friendProfiles } = await supabase
          .from('users')
          .select('id, display_name, avatar_emoji, lifetime_score')
          .in('id', friendIds);

        const enrichedFriends: Friend[] = friendRows.map((fr: { id: string; user_id: string; friend_id: string; added_at: string }) => {
          const profile = friendProfiles?.find((p: { id: string }) => p.id === fr.friend_id);
          return {
            id: fr.id,
            user_id: fr.user_id,
            friend_id: fr.friend_id,
            display_name: profile?.display_name ?? 'Player',
            avatar_emoji: profile?.avatar_emoji ?? '\u{1F9E0}',
            lifetime_score: profile?.lifetime_score ?? 0,
            added_at: fr.added_at,
          };
        });

        setFriends(enrichedFriends);
      }
    } catch (err) {
      console.error('Failed to fetch friends data:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleRedeem() {
    if (!redeemCode.trim()) {
      toast.error('Please enter a referral code');
      return;
    }

    setRedeeming(true);
    try {
      const res = await fetch('/api/referral/redeem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: redeemCode.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error ?? 'Failed to redeem code');
        return;
      }

      toast.success(`Code redeemed! You got ${data.bonusGuesses} free guesses!`);
      setRedeemCode('');
      // Refresh data to show new friend
      fetchData();
    } catch {
      toast.error('Something went wrong');
    } finally {
      setRedeeming(false);
    }
  }

  if (loading) {
    return (
      <div className="max-w-lg mx-auto px-4 py-8">
        <div className="space-y-6">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="glass rounded-2xl p-6 animate-pulse h-32"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-8 space-y-8">
      {/* Page header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-1"
      >
        <h1 className="text-2xl font-bold text-soft-white">Friends</h1>
        <p className="text-sm text-muted-gray">
          Invite friends, earn rewards, compete together
        </p>
      </motion.div>

      {/* Referral card */}
      <ReferralCard referralCode={referralCode} referralCount={referralCount} />

      {/* Redeem a code */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <GlassCard>
          <div className="space-y-4">
            <div className="space-y-1">
              <h3 className="text-sm font-semibold text-soft-white">
                Redeem a Code
              </h3>
              <p className="text-xs text-muted-gray">
                Enter a friend&apos;s referral code to get 2 free guesses
              </p>
            </div>
            <div className="flex gap-3">
              <input
                type="text"
                value={redeemCode}
                onChange={(e) => setRedeemCode(e.target.value.toUpperCase())}
                placeholder="WW______"
                maxLength={8}
                className="flex-1 px-4 py-2.5 rounded-xl bg-deep-void/60 border border-card-bg-light/50 text-sm text-soft-white font-mono tracking-wider placeholder:text-muted-gray focus:outline-none focus:border-neon-violet/50 transition-colors uppercase"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleRedeem();
                }}
              />
              <NeonButton
                onClick={handleRedeem}
                variant="cyan"
                size="md"
                loading={redeeming}
                disabled={!redeemCode.trim()}
              >
                Redeem
              </NeonButton>
            </div>
          </div>
        </GlassCard>
      </motion.div>

      {/* Friends list */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="space-y-3"
      >
        <h3 className="text-sm font-semibold text-soft-white">
          Your Friends ({friends.length})
        </h3>
        <FriendsList friends={friends} />
      </motion.div>

      {/* AdBanner */}
      <div className="ad-container rounded-xl overflow-hidden">
        <ins
          className="adsbygoogle"
          style={{ display: 'block' }}
          data-ad-client={ADSENSE_PUB_ID}
          data-ad-slot="friends-bottom"
          data-ad-format="auto"
          data-full-width-responsive="true"
        />
      </div>
    </div>
  );
}
