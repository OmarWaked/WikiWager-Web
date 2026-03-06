'use client';

import { useUserStore } from '@/stores/userStore';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface InventoryItemProps {
  icon: string;
  count: number;
  label: string;
}

function InventoryItem({ icon, count, label }: InventoryItemProps) {
  return (
    <Link
      href="/store"
      className={cn(
        'flex items-center gap-1.5 px-3 py-1.5 rounded-lg',
        'glass transition-all duration-200',
        'hover:border-neon-violet/30 hover:bg-card-bg-hover',
        'text-sm',
      )}
    >
      <span className="text-base">{icon}</span>
      <span className="font-mono font-semibold text-soft-white tabular-nums">
        {count}
      </span>
      <span className="text-xs text-muted-gray hidden sm:inline">{label}</span>
    </Link>
  );
}

export function InventoryBar() {
  const user = useUserStore((s) => s.user);

  if (!user) return null;

  const hasItems =
    user.streak_shields > 0 || user.revenge_tokens > 0 || user.extra_guesses > 0;

  if (!hasItems) return null;

  return (
    <div className="flex items-center justify-center gap-2 flex-wrap">
      {user.streak_shields > 0 && (
        <InventoryItem icon="🛡️" count={user.streak_shields} label="Shields" />
      )}
      {user.revenge_tokens > 0 && (
        <InventoryItem icon="🗡️" count={user.revenge_tokens} label="Revenge" />
      )}
      {user.extra_guesses > 0 && (
        <InventoryItem icon="🎯" count={user.extra_guesses} label="Extra" />
      )}
    </div>
  );
}
