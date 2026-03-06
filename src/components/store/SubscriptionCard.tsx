'use client';

import { useState } from 'react';
import { GlassCard } from '@/components/ui/GlassCard';
import { NeonButton } from '@/components/ui/NeonButton';
import { cn } from '@/lib/utils';

interface SubscriptionCardProps {
  name: string;
  price: string;
  features: string[];
  tag: string;
  isActive: boolean;
  isVIP?: boolean;
  onSubscribe: () => void;
  onManage: () => void;
}

export function SubscriptionCard({
  name,
  price,
  features,
  tag,
  isActive,
  isVIP = false,
  onSubscribe,
  onManage,
}: SubscriptionCardProps) {
  const [loading, setLoading] = useState(false);

  async function handleSubscribe() {
    setLoading(true);
    try {
      await onSubscribe();
    } finally {
      setLoading(false);
    }
  }

  async function handleManage() {
    setLoading(true);
    try {
      await onManage();
    } finally {
      setLoading(false);
    }
  }

  return (
    <GlassCard
      className={cn(
        'flex flex-col items-center text-center gap-4 relative overflow-hidden',
        // Rainbow border animation
        'border border-transparent',
        isVIP
          ? 'shadow-[0_0_30px_rgba(255,215,0,0.15)] ring-1 ring-gold-flash/30'
          : 'ring-1 ring-neon-violet/20',
      )}
    >
      {/* Animated border gradient */}
      <div
        className={cn(
          'absolute inset-0 -z-10 rounded-2xl',
          'bg-gradient-to-r from-neon-violet via-electric-cyan to-gold-flash',
          'animate-gradient opacity-20',
        )}
      />

      {tag && (
        <span
          className={cn(
            'absolute -top-2.5 right-3 px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full border',
            isVIP
              ? 'bg-gold-flash/20 text-gold-flash border-gold-flash/30'
              : 'bg-electric-cyan/20 text-electric-cyan border-electric-cyan/30',
          )}
        >
          {tag}
        </span>
      )}

      {isActive && (
        <span className="absolute top-3 left-3 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full bg-electric-cyan/20 text-electric-cyan border border-electric-cyan/30">
          Current Plan
        </span>
      )}

      <div className="pt-2">
        <h3 className="text-xl font-bold text-soft-white">{name}</h3>
        <p
          className={cn(
            'text-2xl font-bold mt-1',
            isVIP ? 'text-gold-flash' : 'text-neon-violet-light',
          )}
        >
          {price}
        </p>
      </div>

      <ul className="space-y-2 text-sm text-left w-full">
        {features.map((feature, i) => (
          <li key={i} className="flex items-center gap-2 text-soft-white">
            <span className="text-electric-cyan">&#10003;</span>
            <span>{feature}</span>
          </li>
        ))}
      </ul>

      {isActive ? (
        <NeonButton
          onClick={handleManage}
          variant="cyan"
          size="md"
          loading={loading}
          className="w-full"
        >
          Manage
        </NeonButton>
      ) : (
        <NeonButton
          onClick={handleSubscribe}
          variant={isVIP ? 'gold' : 'violet'}
          size="md"
          loading={loading}
          className="w-full"
        >
          Subscribe
        </NeonButton>
      )}
    </GlassCard>
  );
}
