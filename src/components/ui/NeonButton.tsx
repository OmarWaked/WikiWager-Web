'use client';

import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

type NeonVariant = 'violet' | 'cyan' | 'gold' | 'coral';
type NeonSize = 'sm' | 'md' | 'lg';

interface NeonButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: NeonVariant;
  size?: NeonSize;
  disabled?: boolean;
  loading?: boolean;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
}

const variantStyles: Record<NeonVariant, { bg: string; glow: string; text: string }> = {
  violet: {
    bg: 'bg-gradient-to-r from-neon-violet to-neon-violet-light',
    glow: 'hover:glow-violet',
    text: 'text-white',
  },
  cyan: {
    bg: 'bg-gradient-to-r from-electric-cyan to-electric-cyan-light',
    glow: 'hover:glow-cyan',
    text: 'text-deep-void',
  },
  gold: {
    bg: 'bg-gradient-to-r from-gold-flash to-gold-flash-light',
    glow: 'hover:glow-gold',
    text: 'text-deep-void',
  },
  coral: {
    bg: 'bg-gradient-to-r from-hot-coral to-hot-coral-light',
    glow: 'hover:glow-coral',
    text: 'text-white',
  },
};

const sizeStyles: Record<NeonSize, string> = {
  sm: 'px-4 py-1.5 text-sm rounded-lg',
  md: 'px-6 py-2.5 text-base rounded-xl',
  lg: 'px-8 py-3.5 text-lg rounded-xl',
};

function Spinner() {
  return (
    <svg
      className="animate-spin h-5 w-5"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}

export function NeonButton({
  children,
  onClick,
  variant = 'violet',
  size = 'md',
  disabled = false,
  loading = false,
  className,
  type = 'button',
}: NeonButtonProps) {
  const styles = variantStyles[variant];

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      whileHover={!disabled && !loading ? { scale: 1.03 } : undefined}
      whileTap={!disabled && !loading ? { scale: 0.97 } : undefined}
      className={cn(
        'relative font-semibold transition-all duration-300 inline-flex items-center justify-center gap-2',
        styles.bg,
        styles.text,
        styles.glow,
        sizeStyles[size],
        (disabled || loading) && 'opacity-50 cursor-not-allowed',
        className,
      )}
    >
      {loading && <Spinner />}
      {children}
    </motion.button>
  );
}
