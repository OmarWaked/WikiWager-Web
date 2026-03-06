import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

interface InvitePageProps {
  params: Promise<{ code: string }>;
}

export async function generateMetadata({ params }: InvitePageProps): Promise<Metadata> {
  const { code } = await params;
  const supabase = await createClient();

  const { data: codeData } = await supabase
    .from('referral_codes')
    .select('owner_id')
    .eq('code', code.toUpperCase())
    .single();

  let ownerName = 'A friend';
  if (codeData) {
    const { data: owner } = await supabase
      .from('users')
      .select('display_name')
      .eq('id', codeData.owner_id)
      .single();
    if (owner) ownerName = owner.display_name;
  }

  const ogUrl = `/api/og?type=invite&name=${encodeURIComponent(ownerName)}&code=${encodeURIComponent(code)}`;

  return {
    title: `${ownerName} invited you to WikiWager!`,
    description: 'Join WikiWager and get 2 free guesses. Think you know everything? Bet your brain on Wikipedia trivia.',
    openGraph: {
      title: `${ownerName} invited you to WikiWager!`,
      description: 'Join and get 2 free guesses to play the daily Wikipedia trivia game.',
      images: [{ url: ogUrl, width: 1200, height: 630, alt: 'WikiWager Invite' }],
      siteName: 'WikiWager',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${ownerName} invited you to WikiWager!`,
      description: 'Join and get 2 free guesses to play the daily Wikipedia trivia game.',
      images: [ogUrl],
    },
  };
}

export default async function InvitePage({ params }: InvitePageProps) {
  const { code } = await params;
  const supabase = await createClient();

  // Look up the referral code
  const { data: codeData } = await supabase
    .from('referral_codes')
    .select('owner_id, code')
    .eq('code', code.toUpperCase())
    .single();

  if (!codeData) {
    notFound();
  }

  // Fetch owner profile
  const { data: owner } = await supabase
    .from('users')
    .select('display_name, avatar_emoji')
    .eq('id', codeData.owner_id)
    .single();

  const ownerName = owner?.display_name ?? 'A friend';
  const ownerAvatar = owner?.avatar_emoji ?? '\u{1F9E0}';

  return (
    <div className="min-h-screen bg-deep-void flex flex-col">
      {/* Hero */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full space-y-8 text-center">
          {/* Avatar */}
          <div className="flex justify-center">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-card-bg to-card-bg-light flex items-center justify-center ring-4 ring-neon-violet/30 glow-violet">
              <span className="text-5xl">{ownerAvatar}</span>
            </div>
          </div>

          {/* Invite message */}
          <div className="space-y-3">
            <h1 className="text-3xl sm:text-4xl font-bold text-soft-white">
              {ownerName} invited you to{' '}
              <span className="text-gradient-violet">WikiWager!</span>
            </h1>
            <p className="text-muted-gray text-lg">
              Join and get <span className="text-electric-cyan font-semibold">2 free guesses</span> to play
            </p>
          </div>

          {/* CTA */}
          <Link
            href={`/signup?ref=${encodeURIComponent(codeData.code)}`}
            className="inline-flex items-center justify-center w-full py-4 px-8 rounded-xl bg-gradient-to-r from-neon-violet to-neon-violet-light text-white text-lg font-bold transition-all hover:scale-[1.02] hover:glow-violet active:scale-[0.98]"
          >
            {'\u{1F3AE}'} Play Now
          </Link>

          {/* Game preview */}
          <div className="glass rounded-2xl p-6 space-y-4 text-left">
            <h3 className="text-sm font-semibold text-gradient-violet uppercase tracking-wider">
              What is WikiWager?
            </h3>
            <p className="text-sm text-muted-gray leading-relaxed">
              WikiWager is a daily Wikipedia trivia game where you read article excerpts and
              guess which Wikipedia page they belong to. Compete with friends, climb the
              leaderboard, and prove you know everything!
            </p>
          </div>

          {/* How it works */}
          <div className="glass rounded-2xl p-6 space-y-5 text-left">
            <h3 className="text-sm font-semibold text-gradient-violet uppercase tracking-wider">
              How It Works
            </h3>
            <div className="space-y-4">
              {[
                {
                  step: '1',
                  emoji: '\u{1F4D6}',
                  title: 'Read the Excerpt',
                  desc: 'We show you a snippet from a random Wikipedia article.',
                },
                {
                  step: '2',
                  emoji: '\u{1F914}',
                  title: 'Guess the Page',
                  desc: 'Pick the correct Wikipedia page from multiple choices.',
                },
                {
                  step: '3',
                  emoji: '\u{1F3C6}',
                  title: 'Compete & Win',
                  desc: 'Build streaks, climb leaderboards, and challenge friends.',
                },
              ].map((item) => (
                <div key={item.step} className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-neon-violet/10 flex items-center justify-center shrink-0">
                    <span className="text-lg">{item.emoji}</span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-soft-white">{item.title}</p>
                    <p className="text-xs text-muted-gray mt-0.5">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer branding */}
          <p className="text-xs text-muted-gray">
            {'\u{1F9E0}'} WikiWager — The Daily Wikipedia Game
          </p>
        </div>
      </main>
    </div>
  );
}
