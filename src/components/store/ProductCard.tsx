'use client';

import { useState } from 'react';
import { GlassCard } from '@/components/ui/GlassCard';
import { NeonButton } from '@/components/ui/NeonButton';
import { cn } from '@/lib/utils';

interface ProductCardProps {
  name: string;
  price: string;
  description: string;
  tag: string;
  icon: string;
  onBuy: () => void;
  onWatchAd?: () => void;
}

const tagStyles: Record<string, string> = {
  Popular: 'bg-electric-cyan/20 text-electric-cyan border-electric-cyan/30',
  'Best Value': 'bg-gold-flash/20 text-gold-flash border-gold-flash/30',
  Savings: 'bg-neon-violet/20 text-neon-violet-light border-neon-violet/30',
};

export function ProductCard({
  name,
  price,
  description,
  tag,
  icon,
  onBuy,
  onWatchAd,
}: ProductCardProps) {
  const [loading, setLoading] = useState(false);

  async function handleBuy() {
    setLoading(true);
    try {
      await onBuy();
    } finally {
      setLoading(false);
    }
  }

  return (
    <GlassCard className="flex flex-col items-center text-center gap-3 relative">
      {tag && (
        <span
          className={cn(
            'absolute -top-2.5 right-3 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full border',
            tagStyles[tag] || 'bg-neon-violet/20 text-neon-violet-light border-neon-violet/30',
          )}
        >
          {tag}
        </span>
      )}

      <span className="text-4xl">{icon}</span>

      <div>
        <h3 className="text-lg font-bold text-soft-white">{name}</h3>
        <p className="text-sm text-muted-gray mt-0.5">{description}</p>
      </div>

      <p className="text-xl font-bold text-electric-cyan">{price}</p>

      <NeonButton
        onClick={handleBuy}
        variant="violet"
        size="md"
        loading={loading}
        className="w-full"
      >
        Buy
      </NeonButton>

      {onWatchAd && (
        <button
          onClick={onWatchAd}
          className="text-xs text-muted-gray hover:text-electric-cyan transition-colors underline underline-offset-2"
        >
          Or watch ad for free
        </button>
      )}
    </GlassCard>
  );
}
