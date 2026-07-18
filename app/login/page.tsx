'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { useLocale } from '@/lib/i18n/context';
import { t } from '@/lib/i18n/translations';
import Alert from '@/components/Alert';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const { locale } = useLocale();

  const supabase = createClient();
  const router = useRouter();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        const errorMap: Record<string, string> = {
          'Invalid login credentials': t('login.errors.invalidCredentials', locale),
          'Email not confirmed': t('login.errors.emailNotConfirmed', locale),
          'Too many requests': t('login.errors.tooManyRequests', locale),
          'User not found': t('login.errors.userNotFound', locale),
        };
        const arabicError = errorMap[signInError.message] || signInError.message;
        setError(arabicError);
        setLoading(false);
        return;
      }

      if (data.session) {
        // Use window.location for a hard redirect to ensure session is picked up
        window.location.href = '/dashboard';
      } else {
        setError(t('login.errors.loginFailed', locale));
        setLoading(false);
      }
    } catch (err) {
      setError(t('login.errors.unexpected', locale));
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <main className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm">
          <div className="mb-8 text-center">
            <h1
              className="text-2xl font-bold text-primary"
              style={{ fontFamily: 'var(--font-heading), var(--font-heading-arabic)' }}
            >
              {t('login.brand', locale)}
            </h1>
            <p className="mt-1 text-sm text-primary/50">{t('login.subtitle', locale)}</p>
          </div>

          <div className="rounded-xl border border-primary/5 bg-white shadow-sm">
            <div className="flex gap-1.5 px-5 pt-4">
              <span className="h-3 w-3 rounded-full bg-cyan-400" />
              <span className="h-3 w-3 rounded-full bg-accent/70" />
              <span className="h-3 w-3 rounded-full bg-gray-300" />
            </div>

            <div className="p-5 pt-3">
              <form onSubmit={handleSignIn} className="space-y-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-primary/70">
                    {t('login.email', locale)}
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-lg border border-primary/10 bg-background px-4 py-2.5 text-sm text-ink outline-none transition-colors focus:border-primary/30 focus:ring-2 focus:ring-primary/5"
                    placeholder="name@factory.dz"
                    required
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-primary/70">
                    {t('login.password', locale)}
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full rounded-lg border border-primary/10 bg-background px-4 py-2.5 pl-10 text-sm text-ink outline-none transition-colors focus:border-primary/30 focus:ring-2 focus:ring-primary/5"
                      placeholder="••••••••"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-primary/30 transition-colors hover:text-primary/50"
                    >
                      {showPassword ? (
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                        </svg>
                      ) : (
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                <div className="text-right">
                  <Link
                    href="/forgot-password"
                    className="text-xs text-primary/50 underline transition-colors hover:text-primary/70"
                  >
                    {t('login.forgotPassword', locale)}
                  </Link>
                </div>

{error && (
  <Alert type="error" className="text-center">
    {error}
  </Alert>
)}

{message && (
  <Alert type="success" className="text-center">
    {message}
  </Alert>
)}

                <button
                  type="submit"
                  disabled={loading}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary/90 disabled:opacity-50"
                >
                  {loading ? t('login.loading', locale) : t('login.submit', locale)}
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
                  </svg>
                </button>
              </form>

              <div className="mt-4 flex items-center justify-center gap-2 text-xs">
                <span className="font-semibold text-primary underline">العربية</span>
                <span className="text-gray-300">|</span>
                <span className="text-primary/50">FRANÇAIS</span>
              </div>
            </div>
          </div>

          <p className="mt-4 text-center text-xs text-primary/50">
            {t('login.noAccount', locale)}{' '}
            <Link href="/signup" className="font-semibold text-primary underline">
              {t('login.createAccount', locale)}
            </Link>
          </p>

          <p className="mt-4 text-center text-xs text-primary/30">
            {t('login.footerCopyright', locale)}
          </p>
        </div>
      </main>

      <footer className="border-t border-primary/5 bg-white px-4 py-4">
        <div className="mx-auto flex max-w-sm items-center justify-between text-xs text-primary/40">
          <div className="flex gap-4">
            <a href="#" className="transition-colors hover:text-primary/60">{t('login.terms', locale)}</a>
            <a href="#" className="transition-colors hover:text-primary/60">{t('login.privacy', locale)}</a>
            <a href="#" className="transition-colors hover:text-primary/60">{t('login.support', locale)}</a>
          </div>
          <span className="font-semibold text-primary/60">{t('login.brand', locale)}</span>
        </div>
      </footer>
    </div>
  );
}
