import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { GameNavbar } from '@/components/game/GameNavbar';
import type { User } from '@/types/user';

export default async function GameLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser) {
    redirect('/login');
  }

  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('id', authUser.id)
    .single();

  const userProfile = profile as User | null;

  return (
    <div className="min-h-screen flex flex-col">
      <GameNavbar
        displayName={userProfile?.display_name ?? 'Player'}
        avatarEmoji={userProfile?.avatar_emoji ?? '\u{1F9E0}'}
      />
      <main className="flex-1">{children}</main>
    </div>
  );
}
