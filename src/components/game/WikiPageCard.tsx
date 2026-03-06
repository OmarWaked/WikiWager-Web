'use client';

import { cn, truncate } from '@/lib/utils';
import type { WikiPage } from '@/types/game';

interface WikiPageCardProps {
  page: WikiPage;
}

export function WikiPageCard({ page }: WikiPageCardProps) {
  return (
    <div
      className={cn(
        'glass rounded-2xl p-6 space-y-4',
        'border border-neon-violet/30',
        'relative overflow-hidden',
      )}
    >
      {/* Subtle gradient border overlay */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-neon-violet/5 via-transparent to-electric-cyan/5 pointer-events-none" />

      <div className="relative space-y-4">
        {/* Description tag */}
        {page.description && (
          <p className="text-xs font-mono text-neon-violet uppercase tracking-[0.15em]">
            {page.description}
          </p>
        )}

        {/* Title */}
        <h2 className="text-2xl font-bold text-gradient-violet leading-tight">
          {page.title}
        </h2>

        {/* Extract */}
        <div className="relative">
          <p className="text-sm text-soft-white/80 leading-relaxed">
            {truncate(page.extract, 200)}
          </p>
          {page.extract.length > 200 && (
            <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-card-bg/80 to-transparent pointer-events-none" />
          )}
        </div>

        {/* Thumbnail */}
        {page.thumbnail && (
          <div className="flex justify-center">
            <img
              src={page.thumbnail}
              alt={page.title}
              className="max-w-48 rounded-xl object-cover border border-card-bg-light"
              loading="lazy"
            />
          </div>
        )}

        {/* Wikipedia attribution */}
        <div className="flex items-center gap-1.5 pt-1">
          <span className="text-xs">📖</span>
          <span className="text-xs font-mono text-muted-gray/60">Wikipedia</span>
        </div>
      </div>
    </div>
  );
}
