'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { AVATAR_EMOJIS } from '@/lib/constants';
import { GlassCard } from '@/components/ui/GlassCard';
import { NeonButton } from '@/components/ui/NeonButton';

export default function ProfileSetupPage() {
  const router = useRouter();

  const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState('');
  const [avatarEmoji, setAvatarEmoji] = useState('\u{1F9E0}');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
  const [checkingUsername, setCheckingUsername] = useState(false);

  // Debounced username availability check
  useEffect(() => {
    if (!username.trim()) {
      setUsernameAvailable(null);
      return;
    }

    const timeout = setTimeout(async () => {
      setCheckingUsername(true);
      try {
        const supabase = createClient();
        const { data: authData } = await supabase.auth.getUser();
        const { data, error: checkError } = await supabase
          .from('users')
          .select('id')
          .eq('username', username.toLowerCase())
          .neq('id', authData.user?.id ?? '')
          .maybeSingle();

        if (checkError) {
          setUsernameAvailable(null);
          return;
        }

        setUsernameAvailable(data === null);
      } catch {
        setUsernameAvailable(null);
      } finally {
        setCheckingUsername(false);
      }
    }, 500);

    return () => clearTimeout(timeout);
  }, [username]);

  async function handleSubmit() {
    if (!displayName.trim()) {
      setError('Please enter a display name.');
      return;
    }

    if (username && usernameAvailable === false) {
      setError('That username is already taken.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const supabase = createClient();
      const { data: authData, error: authError } = await supabase.auth.getUser();

      if (authError || !authData.user) {
        setError('Not authenticated. Please sign in again.');
        router.push('/login');
        return;
      }

      const updates: Record<string, string> = {
        display_name: displayName.trim(),
        avatar_emoji: avatarEmoji,
      };

      if (username.trim()) {
        updates.username = username.trim().toLowerCase();
      }

      const { error: updateError } = await supabase
        .from('users')
        .update(updates)
        .eq('id', authData.user.id);

      if (updateError) {
        setError(updateError.message);
        return;
      }

      router.push('/play');
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Branding */}
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">{'\u{1F9E0}'}</div>
          <h1 className="text-3xl font-bold text-gradient-violet">WikiWager</h1>
          <p className="text-muted-gray mt-2">Set up your profile to get started</p>
        </div>

        <GlassCard className="space-y-6">
          {/* Avatar Emoji Picker */}
          <div>
            <label className="block text-sm font-medium text-soft-white mb-3">
              Choose Your Avatar
            </label>
            <div className="flex justify-center mb-4">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-card-bg to-card-bg-light flex items-center justify-center ring-2 ring-neon-violet/50 glow-violet">
                <span className="text-5xl">{avatarEmoji}</span>
              </div>
            </div>
            <div className="grid grid-cols-10 gap-1">
              {AVATAR_EMOJIS.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => setAvatarEmoji(emoji)}
                  className={`w-9 h-9 flex items-center justify-center rounded-lg text-lg transition-all ${
                    avatarEmoji === emoji
                      ? 'bg-neon-violet/30 ring-1 ring-neon-violet scale-110'
                      : 'hover:bg-card-bg-hover'
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          {/* Display Name */}
          <div>
            <label className="block text-sm font-medium text-soft-white mb-2">
              Display Name <span className="text-hot-coral">*</span>
            </label>
            <input
              type="text"
              placeholder="How should we call you?"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              maxLength={20}
              className="w-full bg-card-bg border border-card-bg-light rounded-xl px-4 py-3 text-soft-white placeholder-muted-gray focus:outline-none focus:border-neon-violet transition-colors"
              autoFocus
            />
          </div>

          {/* Username (optional) */}
          <div>
            <label className="block text-sm font-medium text-soft-white mb-2">
              Username <span className="text-muted-gray text-xs">(optional)</span>
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-gray">@</span>
              <input
                type="text"
                placeholder="coolplayer42"
                value={username}
                onChange={(e) => setUsername(e.target.value.replace(/[^a-zA-Z0-9_]/g, ''))}
                maxLength={20}
                className="w-full bg-card-bg border border-card-bg-light rounded-xl pl-8 pr-10 py-3 text-soft-white placeholder-muted-gray focus:outline-none focus:border-neon-violet transition-colors"
              />
              {username.trim() && (
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm">
                  {checkingUsername ? (
                    <span className="text-muted-gray">...</span>
                  ) : usernameAvailable ? (
                    <span className="text-electric-cyan">Available</span>
                  ) : usernameAvailable === false ? (
                    <span className="text-hot-coral">Taken</span>
                  ) : null}
                </span>
              )}
            </div>
          </div>

          {error && (
            <p className="text-hot-coral text-sm">{error}</p>
          )}

          <NeonButton
            onClick={handleSubmit}
            loading={loading}
            variant="violet"
            size="lg"
            className="w-full"
          >
            Start Playing
          </NeonButton>
        </GlassCard>
      </div>
    </div>
  );
}
