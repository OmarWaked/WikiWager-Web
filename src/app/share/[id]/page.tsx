import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { ShareableResultCard } from '@/components/social/ShareableResultCard';
import { formatNumber } from '@/lib/utils';
import type { Difficulty } from '@/types/game';

interface SharePageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: SharePageProps): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createClient();

  const { data: result } = await supabase
    .from('shared_results')
    .select('*, users!shared_results_user_id_fkey(display_name, avatar_emoji)')
    .eq('id', id)
    .single();

  if (!result) {
    return { title: 'WikiWager - Shared Result' };
  }

  const user = result.users as { display_name: string; avatar_emoji: string } | null;
  const name = user?.display_name ?? 'Player';
  const score = result.score ?? 0;
  const streak = result.streak ?? 0;
  const day = result.day_number ?? 0;
  const difficulty = result.difficulty ?? 'normal';
  const avatar = user?.avatar_emoji ?? '\u{1F9E0}';

  const ogUrl = `/api/og?type=result&score=${score}&streak=${streak}&name=${encodeURIComponent(name)}&avatar=${encodeURIComponent(avatar)}&difficulty=${difficulty}&day=${day}`;

  return {
    title: `${name} scored ${formatNumber(score)} on WikiWager Day #${day}`,
    description: `${name} got ${formatNumber(score)} points with a ${streak}-day streak on WikiWager. Can you beat this score?`,
    openGraph: {
      title: `${name} scored ${formatNumber(score)} on WikiWager!`,
      description: `Day #${day} | ${formatNumber(score)} pts | ${streak} streak. Can you beat this score?`,
      images: [{ url: ogUrl, width: 1200, height: 630, alt: 'WikiWager Result' }],
      siteName: 'WikiWager',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${name} scored ${formatNumber(score)} on WikiWager!`,
      description: `Day #${day} | ${formatNumber(score)} pts | ${streak} streak. Can you beat this score?`,
      images: [ogUrl],
    },
  };
}

export default async function SharePage({ params }: SharePageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: result } = await supabase
    .from('shared_results')
    .select('*, users!shared_results_user_id_fkey(display_name, avatar_emoji)')
    .eq('id', id)
    .single();

  if (!result) {
    notFound();
  }

  const user = result.users as { display_name: string; avatar_emoji: string } | null;

  // Parse emoji_grid from the stored result
  const emojiGrid: boolean[] = result.emoji_grid ?? [];
  const difficulty = (result.difficulty ?? 'normal') as Difficulty;

  return (
    <div className="min-h-screen bg-deep-void flex flex-col">
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full space-y-8">
          {/* Result card */}
          <ShareableResultCard
            dayNumber={result.day_number ?? 0}
            score={result.score ?? 0}
            streak={result.streak ?? 0}
            results={emojiGrid}
            difficulty={difficulty}
            displayName={user?.display_name ?? 'Player'}
            avatarEmoji={user?.avatar_emoji ?? '\u{1F9E0}'}
            isLocked={result.is_locked ?? false}
          />

          {/* CTA */}
          <div className="text-center space-y-4">
            <p className="text-lg font-semibold text-soft-white">
              Can you beat this score?
            </p>
            <Link
              href="/signup"
              className="inline-flex items-center justify-center w-full py-4 px-8 rounded-xl bg-gradient-to-r from-neon-violet to-neon-violet-light text-white text-lg font-bold transition-all hover:scale-[1.02] hover:glow-violet active:scale-[0.98]"
            >
              {'\u{1F3AE}'} Play Now
            </Link>
            <p className="text-xs text-muted-gray">
              {'\u{1F9E0}'} WikiWager — The Daily Wikipedia Game
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
