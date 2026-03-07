'use client';

import { useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { GlassCard } from '@/components/ui/GlassCard';
import { NeonButton } from '@/components/ui/NeonButton';

export default function SignupPage() {
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
          emailRedirectTo: `${window.location.origin}/auth/callback?redirect=${encodeURIComponent('/profile-setup')}`,
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

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Branding */}
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">{'\u{1F9E0}'}</div>
          <h1 className="text-3xl font-bold text-gradient-violet">WikiWager</h1>
          <p className="text-muted-gray mt-2">Create your account and start playing!</p>
        </div>

        <GlassCard className="space-y-6">
          {step === 'input' ? (
            <>
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
                  autoFocus
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
                Click the link in the email to create your account.
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

          {/* Login link */}
          <p className="text-center text-sm text-muted-gray">
            Already have an account?{' '}
            <Link href="/login" className="text-neon-violet-light hover:text-neon-violet transition-colors font-medium">
              Sign in
            </Link>
          </p>
        </GlassCard>
      </div>
    </div>
  );
}
