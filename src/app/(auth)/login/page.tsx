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

  const [authMethod, setAuthMethod] = useState<'phone' | 'email'>('phone');
  const [step, setStep] = useState<'input' | 'otp' | 'email-sent'>('input');

  // Phone state
  const [countryCode, setCountryCode] = useState('+1');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);

  // Email state
  const [email, setEmail] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  const fullPhone = `${countryCode}${phoneNumber.replace(/\D/g, '')}`;

  async function handleSendPhoneCode() {
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
          emailRedirectTo: `${window.location.origin}/auth/callback`,
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

  function switchMethod(method: 'phone' | 'email') {
    setAuthMethod(method);
    setStep('input');
    setError('');
    setOtp(['', '', '', '', '', '']);
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
          {/* Method toggle */}
          {step === 'input' && (
            <div className="flex rounded-xl bg-card-bg overflow-hidden border border-card-bg-light">
              <button
                onClick={() => switchMethod('phone')}
                className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
                  authMethod === 'phone'
                    ? 'bg-neon-violet/20 text-neon-violet-light border-b-2 border-neon-violet'
                    : 'text-muted-gray hover:text-soft-white'
                }`}
              >
                Phone
              </button>
              <button
                onClick={() => switchMethod('email')}
                className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
                  authMethod === 'email'
                    ? 'bg-neon-violet/20 text-neon-violet-light border-b-2 border-neon-violet'
                    : 'text-muted-gray hover:text-soft-white'
                }`}
              >
                Email
              </button>
            </div>
          )}

          {/* Phone Input */}
          {authMethod === 'phone' && step === 'input' && (
            <>
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

              {error && <p className="text-hot-coral text-sm">{error}</p>}

              <NeonButton
                onClick={handleSendPhoneCode}
                loading={loading}
                variant="violet"
                size="lg"
                className="w-full"
              >
                Send Code
              </NeonButton>
            </>
          )}

          {/* Email Input */}
          {authMethod === 'email' && step === 'input' && (
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
          )}

          {/* Email Sent Confirmation */}
          {step === 'email-sent' && (
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

          {/* Phone OTP Input */}
          {step === 'otp' && (
            <>
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

              {error && <p className="text-hot-coral text-sm">{error}</p>}

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
                  setStep('input');
                  setOtp(['', '', '', '', '', '']);
                  setError('');
                }}
                className="text-sm text-muted-gray hover:text-soft-white transition-colors w-full text-center"
              >
                Use a different number
              </button>
            </>
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
