'use client';

import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

type GradientVariant = 'violet' | 'cyan' | 'gold';
type GradientSize = 'sm' | 'md' | 'lg';

interface GradientButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  gradient?: GradientVariant;
  size?: GradientSize;
  disabled?: boolean;
  className?: string;
  fullWidth?: boolean;
}

const gradientStyles: Record<GradientVariant, string> = {
  violet: 'from-neon-violet via-neon-violet-light to-neon-violet',
  cyan: 'from-electric-cyan via-electric-cyan-light to-electric-cyan',
  gold: 'from-gold-flash via-gold-flash-light to-gold-flash',
};

const textColors: Record<GradientVariant, string> = {
  violet: 'text-white',
  cyan: 'text-deep-void',
  gold: 'text-deep-void',
};

const sizeStyles: Record<GradientSize, string> = {
  sm: 'px-4 py-1.5 text-sm rounded-lg',
  md: 'px-6 py-2.5 text-base rounded-xl',
  lg: 'px-8 py-3.5 text-lg rounded-xl',
};

export function GradientButton({
  children,
  onClick,
  gradient = 'violet',
  size = 'md',
  disabled = false,
  className,
  fullWidth = false,
}: GradientButtonProps) {
  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      whileHover={!disabled ? { scale: 1.03 } : undefined}
      whileTap={!disabled ? { scale: 0.97 } : undefined}
      className={cn(
        'font-semibold transition-all duration-300 bg-linear-to-r animate-gradient inline-flex items-center justify-center',
        gradientStyles[gradient],
        textColors[gradient],
        sizeStyles[size],
        fullWidth && 'w-full',
        disabled && 'opacity-50 cursor-not-allowed',
        className,
      )}
    >
      {children}
    </motion.button>
  );
}
