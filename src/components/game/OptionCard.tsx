'use client';

import { motion } from 'framer-motion';
import { cn, truncate } from '@/lib/utils';
import type { WikiPage } from '@/types/game';

interface OptionCardProps {
  page: WikiPage;
  index: number;
  isSelected: boolean;
  onSelect: (pageId: string) => void;
  disabled?: boolean;
}

const letters = ['A', 'B', 'C', 'D'];

const letterColors = [
  'bg-neon-violet',
  'bg-electric-cyan',
  'bg-gold-flash',
  'bg-hot-coral',
];

export function OptionCard({
  page,
  index,
  isSelected,
  onSelect,
  disabled = false,
}: OptionCardProps) {
  const letter = letters[index] ?? String.fromCharCode(65 + index);

  return (
    <motion.button
      onClick={() => !disabled && onSelect(page.id)}
      disabled={disabled}
      whileHover={!disabled ? { scale: 1.02 } : undefined}
      whileTap={!disabled ? { scale: 0.98 } : undefined}
      className={cn(
        'w-full glass rounded-2xl p-4 transition-all duration-300',
        'flex items-center gap-3.5 text-left',
        'border',
        isSelected
          ? 'border-neon-violet glow-violet'
          : 'border-transparent hover:border-muted-gray/30',
        disabled && 'opacity-50 cursor-not-allowed',
      )}
    >
      {/* Letter badge */}
      <div
        className={cn(
          'flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-full transition-colors duration-300',
          isSelected ? letterColors[index % letterColors.length] : 'bg-card-bg-light',
        )}
      >
        <span
          className={cn(
            'text-base font-bold',
            isSelected ? 'text-white' : 'text-muted-gray',
          )}
        >
          {letter}
        </span>
      </div>

      {/* Text content */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-soft-white truncate">
          {page.title}
        </p>
        {page.description && (
          <p className="text-xs text-muted-gray truncate mt-0.5">
            {truncate(page.description, 60)}
          </p>
        )}
      </div>

      {/* Thumbnail */}
      {page.thumbnail && (
        <img
          src={page.thumbnail}
          alt=""
          className="flex-shrink-0 w-12 h-12 rounded-lg object-cover"
          loading="lazy"
        />
      )}

      {/* Checkmark when selected */}
      {isSelected && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="flex-shrink-0"
        >
          <svg
            className="w-6 h-6 text-neon-violet"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
        </motion.div>
      )}
    </motion.button>
  );
}
