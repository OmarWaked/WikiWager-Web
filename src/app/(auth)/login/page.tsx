'use client';

import { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { GlassCard } from '@/components/ui/GlassCard';
import { NeonButton } from '@/components/ui/NeonButton';

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="text-5xl animate-pulse">{'\u{1F9E0}'}</div></div>}>
      <LoginContent />
    </Suspense>
  );
}

function LoginContent() {
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/play';

  const [step, setStep] = useState<'input' | 'email-sent'>('input');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSendEmailLink() {
    if (!email.trim()) {
      setError('Please enter your email address.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const supabase = createClient();
      const { error: otpError } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback?redirect=${encodeURIComponent(redirect)}`,
        },
      });

      if (otpError) {
        setError(otpError.message);
        return;
      }

      setStep('email-sent');
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleSignIn() {
    setLoading(true);
    setError('');

    try {
      const supabase = createClient();
      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback?redirect=${encodeURIComponent(redirect)}`,
        },
      });

      if (oauthError) {
        setError(oauthError.message);
      }
    } catch {
      setError('Google sign-in failed. Please try again.');
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
          <p className="text-muted-gray mt-2">Welcome back! Sign in to continue.</p>
        </div>

        <GlassCard className="space-y-6">
          {step === 'input' ? (
            <>
              {/* Google OAuth */}
              <button
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 bg-card-bg border border-card-bg-light rounded-xl px-4 py-3 text-soft-white hover:bg-card-bg-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Continue with Google
              </button>

              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-card-bg-light" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="bg-card-bg px-4 text-muted-gray">or</span>
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-soft-white mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendEmailLink()}
                  className="w-full bg-card-bg border border-card-bg-light rounded-xl px-4 py-3 text-soft-white placeholder-muted-gray focus:outline-none focus:border-neon-violet transition-colors"
                />
              </div>

              {error && <p className="text-hot-coral text-sm">{error}</p>}

              <NeonButton
                onClick={handleSendEmailLink}
                loading={loading}
                variant="violet"
                size="lg"
                className="w-full"
              >
                Send Magic Link
              </NeonButton>
            </>
          ) : (
            <div className="text-center space-y-4">
              <div className="text-5xl">{'\u{2709}\u{FE0F}'}</div>
              <h2 className="text-xl font-semibold text-soft-white">Check your inbox</h2>
              <p className="text-muted-gray text-sm">
                We sent a magic link to{' '}
                <span className="text-electric-cyan font-medium">{email}</span>.
                Click the link in the email to sign in.
              </p>
              <button
                onClick={() => {
                  setStep('input');
                  setError('');
                }}
                className="text-sm text-muted-gray hover:text-soft-white transition-colors"
              >
                Use a different email
              </button>
            </div>
          )}

          {/* Sign up link */}
          <p className="text-center text-sm text-muted-gray">
            New to WikiWager?{' '}
            <Link href="/signup" className="text-neon-violet-light hover:text-neon-violet transition-colors font-medium">
              Sign up
            </Link>
          </p>
        </GlassCard>
      </div>
    </div>
  );
}
