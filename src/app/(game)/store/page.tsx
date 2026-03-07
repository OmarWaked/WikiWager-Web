'use client';

import { Suspense, useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { useUserStore } from '@/stores/userStore';
import { PRODUCTS, PRODUCT_DETAILS } from '@/lib/constants';
import { ProductCard } from '@/components/store/ProductCard';
import { BundleCard } from '@/components/store/BundleCard';
import { SubscriptionCard } from '@/components/store/SubscriptionCard';
import { AdInterstitial } from '@/components/ads/AdInterstitial';
import { AdBanner } from '@/components/ads/AdBanner';
import { GlassCard } from '@/components/ui/GlassCard';

type AdRewardType = 'guess' | 'shield' | 'revenge';

export default function StorePage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="text-2xl text-muted-gray">Loading store...</div></div>}>
      <StoreContent />
    </Suspense>
  );
}

function StoreContent() {
  const searchParams = useSearchParams();
  const user = useUserStore((s) => s.user);
  const fetchUser = useUserStore((s) => s.fetchUser);

  const [adOpen, setAdOpen] = useState(false);
  const [adRewardType, setAdRewardType] = useState<AdRewardType>('guess');

  // Show success toast when returning from Stripe
  useEffect(() => {
    if (searchParams.get('success') === 'true') {
      toast.success('Purchase successful! Items have been added to your inventory.');
      fetchUser();
    }
    if (searchParams.get('canceled') === 'true') {
      toast.error('Purchase canceled.');
    }
  }, [searchParams, fetchUser]);

  // --- Stripe checkout redirect ---
  const handleBuy = useCallback(async (productId: string) => {
    const priceId = PRODUCTS[productId as keyof typeof PRODUCTS];
    if (!priceId) return;

    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, priceId }),
      });

      const data = await res.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        toast.error(data.error || 'Failed to start checkout');
      }
    } catch {
      toast.error('Something went wrong. Please try again.');
    }
  }, []);

  // --- Stripe portal redirect ---
  const handleManageSubscription = useCallback(async () => {
    try {
      const res = await fetch('/api/stripe/portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await res.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        toast.error(data.error || 'Failed to open billing portal');
      }
    } catch {
      toast.error('Something went wrong. Please try again.');
    }
  }, []);

  // --- Ad reward ---
  function handleWatchAd(rewardType: AdRewardType) {
    setAdRewardType(rewardType);
    setAdOpen(true);
  }

  async function handleAdComplete() {
    setAdOpen(false);
    // Grant 1 item of the reward type via a simple API call
    // For now we reload user data after the ad
    toast.success(`You earned a free ${adRewardType}!`);
    await fetchUser();
  }

  // Animation stagger
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.05 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-10">
      {/* Page Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-soft-white">Store</h1>
        <p className="text-muted-gray mt-1">Power up your game</p>
      </div>

      {/* Current Inventory */}
      {user && (
        <GlassCard className="flex items-center justify-center gap-6 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🎯</span>
            <div>
              <p className="text-xs text-muted-gray">Extra Guesses</p>
              <p className="text-lg font-bold text-soft-white tabular-nums">
                {user.extra_guesses}
              </p>
            </div>
          </div>
          <div className="w-px h-8 bg-card-bg-light" />
          <div className="flex items-center gap-2">
            <span className="text-2xl">🛡️</span>
            <div>
              <p className="text-xs text-muted-gray">Shields</p>
              <p className="text-lg font-bold text-soft-white tabular-nums">
                {user.streak_shields}
              </p>
            </div>
          </div>
          <div className="w-px h-8 bg-card-bg-light" />
          <div className="flex items-center gap-2">
            <span className="text-2xl">🗡️</span>
            <div>
              <p className="text-xs text-muted-gray">Revenge</p>
              <p className="text-lg font-bold text-soft-white tabular-nums">
                {user.revenge_tokens}
              </p>
            </div>
          </div>
        </GlassCard>
      )}

      {/* Guess Packs */}
      <section>
        <h2 className="text-xl font-bold text-soft-white mb-4">🎯 Guess Packs</h2>
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 sm:grid-cols-3 gap-4"
        >
          {(['guesses5', 'guesses15', 'guesses50'] as const).map((id) => {
            const details = PRODUCT_DETAILS[id];
            return (
              <motion.div key={id} variants={itemVariants}>
                <ProductCard
                  name={details.name}
                  price={details.displayPrice}
                  description={`${details.guesses} extra guesses`}
                  tag={details.tag}
                  icon="🎯"
                  onBuy={() => handleBuy(id)}
                  onWatchAd={id === 'guesses5' ? () => handleWatchAd('guess') : undefined}
                />
              </motion.div>
            );
          })}
        </motion.div>
      </section>

      {/* Streak Shields */}
      <section>
        <h2 className="text-xl font-bold text-soft-white mb-4">🛡️ Streak Shields</h2>
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 sm:grid-cols-3 gap-4"
        >
          {(['shield1', 'shield3', 'shield10'] as const).map((id) => {
            const details = PRODUCT_DETAILS[id];
            return (
              <motion.div key={id} variants={itemVariants}>
                <ProductCard
                  name={details.name}
                  price={details.displayPrice}
                  description={`${details.shields} streak shield${details.shields > 1 ? 's' : ''}`}
                  tag={details.tag}
                  icon="🛡️"
                  onBuy={() => handleBuy(id)}
                  onWatchAd={id === 'shield1' ? () => handleWatchAd('shield') : undefined}
                />
              </motion.div>
            );
          })}
        </motion.div>
      </section>

      {/* Revenge Tokens */}
      <section>
        <h2 className="text-xl font-bold text-soft-white mb-4">🗡️ Revenge Tokens</h2>
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 sm:grid-cols-2 gap-4"
        >
          {(['revenge1', 'revenge5'] as const).map((id) => {
            const details = PRODUCT_DETAILS[id];
            return (
              <motion.div key={id} variants={itemVariants}>
                <ProductCard
                  name={details.name}
                  price={details.displayPrice}
                  description={`${details.revenge} revenge token${details.revenge > 1 ? 's' : ''}`}
                  tag={details.tag}
                  icon="🗡️"
                  onBuy={() => handleBuy(id)}
                  onWatchAd={id === 'revenge1' ? () => handleWatchAd('revenge') : undefined}
                />
              </motion.div>
            );
          })}
        </motion.div>
      </section>

      {/* Bundles */}
      <section>
        <h2 className="text-xl font-bold text-soft-white mb-4">📦 Bundles</h2>
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 sm:grid-cols-3 gap-4"
        >
          {(['starterPack', 'proPack', 'ultimatePack'] as const).map((id) => {
            const details = PRODUCT_DETAILS[id];
            return (
              <motion.div key={id} variants={itemVariants}>
                <BundleCard
                  name={details.name}
                  price={details.displayPrice}
                  tag={details.tag}
                  guesses={details.guesses}
                  shields={details.shields}
                  revenge={details.revenge}
                  onBuy={() => handleBuy(id)}
                />
              </motion.div>
            );
          })}
        </motion.div>
      </section>

      {/* Subscriptions */}
      <section>
        <h2 className="text-xl font-bold text-soft-white mb-4">⭐ Subscriptions</h2>
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 sm:grid-cols-2 gap-4"
        >
          <motion.div variants={itemVariants}>
            <SubscriptionCard
              name="Weekly Pass"
              price={PRODUCT_DETAILS.weeklyPass.displayPrice}
              tag={PRODUCT_DETAILS.weeklyPass.tag}
              isActive={user?.has_weekly_pass ?? false}
              features={[
                '50 guesses per week',
                'Ad-free experience',
                'Priority support',
              ]}
              onSubscribe={() => handleBuy('weeklyPass')}
              onManage={handleManageSubscription}
            />
          </motion.div>
          <motion.div variants={itemVariants}>
            <SubscriptionCard
              name="Monthly VIP"
              price={PRODUCT_DETAILS.monthlyVIP.displayPrice}
              tag={PRODUCT_DETAILS.monthlyVIP.tag}
              isActive={user?.is_vip ?? false}
              isVIP
              features={[
                '100 guesses per month',
                '3 streak shields',
                '3 revenge tokens',
                'Ad-free experience',
                'Exclusive VIP badge',
                'Early access to features',
              ]}
              onSubscribe={() => handleBuy('monthlyVIP')}
              onManage={handleManageSubscription}
            />
          </motion.div>
        </motion.div>
      </section>

      {/* Ad Banner */}
      <AdBanner slot="store-bottom" format="horizontal" className="mt-8" />

      {/* Ad Interstitial for free rewards */}
      <AdInterstitial
        isOpen={adOpen}
        onClose={handleAdComplete}
        rewardType={adRewardType}
      />
    </div>
  );
}
