import { type ClassValue, clsx } from 'clsx';

// Simple class merger (no twMerge to keep deps minimal)
export function cn(...inputs: (string | undefined | null | false)[]) {
  return inputs.filter(Boolean).join(' ');
}

// Format large numbers (1200 → "1.2K", 1500000 → "1.5M")
export function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString();
}

// Format date as YYYY-MM-DD
export function todayString(): string {
  return new Date().toISOString().split('T')[0];
}

// Generate referral code from user ID
export function generateReferralCode(userId: string): string {
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    const char = userId.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  const code = Math.abs(hash).toString(36).toUpperCase().padStart(6, '0').slice(0, 6);
  return `WW${code}`;
}

// Calculate points for a round
export function calculatePoints(streak: number, difficultyMultiplier: number): number {
  return Math.floor(100 * Math.pow(1.5, streak)) * difficultyMultiplier;
}

// Seconds until a target time
export function secondsUntil(target: string | Date): number {
  const targetDate = typeof target === 'string' ? new Date(target) : target;
  return Math.max(0, Math.floor((targetDate.getTime() - Date.now()) / 1000));
}

// Format seconds as HH:MM:SS
export function formatCountdown(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

// Truncate text
export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength - 3) + '...';
}

// Generate share text (Wordle-style)
export function generateShareText(
  dayNumber: number,
  score: number,
  streak: number,
  results: boolean[],
  difficulty: string,
  locked: boolean,
): string {
  const grid = results.map(r => r ? '🟢' : '🔴').join('');
  const correct = results.filter(Boolean).length;
  const lines = [
    `🧠 WikiWager Day #${dayNumber}`,
    `💰 ${formatNumber(score)} pts | 🔥 ${streak} streak`,
    `✅ ${correct}/${results.length} correct`,
  ];
  if (difficulty !== 'normal') lines.push(`⚡ ${difficulty.charAt(0).toUpperCase() + difficulty.slice(1)} Mode`);
  if (locked) lines.push('🔒 Locked In!');
  lines.push(grid);
  lines.push('');
  lines.push('Can you beat me? wikiwager.vercel.app');
  return lines.join('\n');
}
