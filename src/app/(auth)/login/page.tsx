'use client';

import { Suspense, useState, useRef, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { GlassCard } from '@/components/ui/GlassCard';
import { NeonButton } from '@/components/ui/NeonButton';

const COUNTRY_CODES = [
  { code: '+1', label: 'US +1', flag: '\u{1F1FA}\u{1F1F8}' },
  { code: '+44', label: 'UK +44', flag: '\u{1F1EC}\u{1F1E7}' },
  { code: '+91', label: 'IN +91', flag: '\u{1F1EE}\u{1F1F3}' },
  { code: '+61', label: 'AU +61', flag: '\u{1F1E6}\u{1F1FA}' },
  { code: '+49', label: 'DE +49', flag: '\u{1F1E9}\u{1F1EA}' },
  { code: '+33', label: 'FR +33', flag: '\u{1F1EB}\u{1F1F7}' },
  { code: '+81', label: 'JP +81', flag: '\u{1F1EF}\u{1F1F5}' },
  { code: '+86', label: 'CN +86', flag: '\u{1F1E8}\u{1F1F3}' },
  { code: '+55', label: 'BR +55', flag: '\u{1F1E7}\u{1F1F7}' },
  { code: '+52', label: 'MX +52', flag: '\u{1F1F2}\u{1F1FD}' },
];

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="text-5xl animate-pulse">{'\u{1F9E0}'}</div></div>}>
      <LoginContent />
    </Suspense>
  );
}

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/play';

  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [countryCode, setCountryCode] = useState('+1');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  const fullPhone = `${countryCode}${phoneNumber.replace(/\D/g, '')}`;

  async function handleSendCode() {
    if (!phoneNumber.trim()) {
      setError('Please enter your phone number.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const supabase = createClient();
      const { error: otpError } = await supabase.auth.signInWithOtp({
        phone: fullPhone,
      });

      if (otpError) {
        setError(otpError.message);
        return;
      }

      setStep('otp');
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyOtp() {
    const token = otp.join('');
    if (token.length !== 6) {
      setError('Please enter the full 6-digit code.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const supabase = createClient();
      const { error: verifyError } = await supabase.auth.verifyOtp({
        phone: fullPhone,
        token,
        type: 'sms',
      });

      if (verifyError) {
        setError(verifyError.message);
        return;
      }

      router.push(redirect);
    } catch {
      setError('Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  function handleOtpChange(index: number, value: string) {
    if (value.length > 1) {
      // Handle paste
      const digits = value.replace(/\D/g, '').slice(0, 6).split('');
      const newOtp = [...otp];
      digits.forEach((digit, i) => {
        if (index + i < 6) newOtp[index + i] = digit;
      });
      setOtp(newOtp);
      const nextIndex = Math.min(index + digits.length, 5);
      otpRefs.current[nextIndex]?.focus();
      return;
    }

    const digit = value.replace(/\D/g, '');
    const newOtp = [...otp];
    newOtp[index] = digit;
    setOtp(newOtp);

    if (digit && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  }

  function handleOtpKeyDown(index: number, e: React.KeyboardEvent) {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
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
          redirectTo: `${window.location.origin}/auth/callback`,
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

  // Auto-submit when all OTP digits are filled
  useEffect(() => {
    if (otp.every((d) => d !== '') && step === 'otp') {
      handleVerifyOtp();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [otp]);

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
          {step === 'phone' ? (
            <>
              {/* Phone Number Input */}
              <div>
                <label className="block text-sm font-medium text-soft-white mb-2">
                  Phone Number
                </label>
                <div className="flex gap-2">
                  <select
                    value={countryCode}
                    onChange={(e) => setCountryCode(e.target.value)}
                    className="bg-card-bg border border-card-bg-light rounded-xl px-3 py-3 text-soft-white text-sm focus:outline-none focus:border-neon-violet transition-colors"
                  >
                    {COUNTRY_CODES.map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.flag} {c.label}
                      </option>
                    ))}
                  </select>
                  <input
                    type="tel"
                    placeholder="(555) 123-4567"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="flex-1 bg-card-bg border border-card-bg-light rounded-xl px-4 py-3 text-soft-white placeholder-muted-gray focus:outline-none focus:border-neon-violet transition-colors"
                    autoFocus
                  />
                </div>
              </div>

              {error && (
                <p className="text-hot-coral text-sm">{error}</p>
              )}

              <NeonButton
                onClick={handleSendCode}
                loading={loading}
                variant="violet"
                size="lg"
                className="w-full"
              >
                Send Code
              </NeonButton>
            </>
          ) : (
            <>
              {/* OTP Input */}
              <div>
                <label className="block text-sm font-medium text-soft-white mb-2">
                  Enter the 6-digit code sent to {fullPhone}
                </label>
                <div className="flex gap-2 justify-center">
                  {otp.map((digit, i) => (
                    <input
                      key={i}
                      ref={(el) => { otpRefs.current[i] = el; }}
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      value={digit}
                      onChange={(e) => handleOtpChange(i, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(i, e)}
                      className="w-12 h-14 bg-card-bg border border-card-bg-light rounded-xl text-center text-xl font-bold text-soft-white focus:outline-none focus:border-neon-violet transition-colors"
                      autoFocus={i === 0}
                    />
                  ))}
                </div>
              </div>

              {error && (
                <p className="text-hot-coral text-sm">{error}</p>
              )}

              <NeonButton
                onClick={handleVerifyOtp}
                loading={loading}
                variant="violet"
                size="lg"
                className="w-full"
              >
                Verify
              </NeonButton>

              <button
                onClick={() => {
                  setStep('phone');
                  setOtp(['', '', '', '', '', '']);
                  setError('');
                }}
                className="text-sm text-muted-gray hover:text-soft-white transition-colors w-full text-center"
              >
                Use a different number
              </button>
            </>
          )}

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-card-bg-light" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-card-bg px-4 text-muted-gray">Or continue with</span>
            </div>
          </div>

          {/* Google OAuth */}
          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 bg-card-bg border border-card-bg-light rounded-xl px-4 py-3 text-soft-white hover:bg-card-bg-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Sign in with Google
          </button>

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
