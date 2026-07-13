'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { useLocale } from '@/lib/i18n/context';
import { t } from '@/lib/i18n/translations';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const { locale } = useLocale();

  const supabase = createClient();

  const handleResetRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (resetError) {
        const errorMap: Record<string, string> = {
          'Invalid email': t('forgotPassword.errors.invalidEmail', locale),
          'User not found': t('forgotPassword.errors.noAccount', locale),
          'Too many requests': t('forgotPassword.errors.tooManyRequests', locale),
        };
        const arabicError = errorMap[resetError.message] || resetError.message;
        setError(arabicError);
        setLoading(false);
        return;
      }

      setMessage(t('forgotPassword.success', locale));
      setLoading(false);
    } catch (err) {
      setError(t('forgotPassword.errors.unexpected', locale));
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="flex items-center justify-between border-b border-primary/5 bg-white px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-primary" />
            <span className="h-2.5 w-2.5 rounded-full bg-primary/60" />
            <span className="h-2.5 w-2.5 rounded-full bg-primary/30" />
          </div>
          <span
            className="text-lg font-bold text-primary"
            style={{ fontFamily: 'var(--font-heading), var(--font-heading-arabic)' }}
          >
            {t('forgotPassword.brand', locale)}
          </span>
        </div>
        <span className="text-sm text-primary/40">{t('forgotPassword.subtitle', locale)}</span>
      </header>

      <main className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm">
          <div className="rounded-xl border border-primary/5 bg-white shadow-sm">
            <div className="p-6 pt-5">
              <div className="mb-1 text-right">
                <h1
                  className="text-xl font-bold text-primary"
                  style={{ fontFamily: 'var(--font-heading), var(--font-heading-arabic)' }}
                >
                  {t('forgotPassword.title', locale)}
                </h1>
              </div>
              <p className="mb-6 text-right text-sm text-primary/50">
                {t('forgotPassword.description', locale)}
              </p>

              <form onSubmit={handleResetRequest} className="space-y-4">
                <div>
                  <label className="mb-1 block text-right text-sm font-medium text-primary/70">
                    {t('forgotPassword.email', locale)}
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-lg border border-primary/10 bg-background px-4 py-3 text-sm text-ink outline-none transition-colors focus:border-primary/30 focus:ring-2 focus:ring-primary/5"
                    placeholder="name@factory.com"
                    required
                  />
                </div>

                {error && (
                  <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-center text-xs text-red-600">
                    {error}
                  </div>
                )}

                {message && (
                  <div className="rounded-lg border border-success/20 bg-success/5 px-4 py-2.5 text-center text-xs text-success">
                    {message}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary/90 disabled:opacity-50"
                >
                  {loading ? t('forgotPassword.loading', locale) : t('forgotPassword.submit', locale)}
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </button>
              </form>

              <div className="mt-6 text-center">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-1 text-sm text-primary/50 transition-colors hover:text-primary/70"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                  </svg>
                  {t('forgotPassword.backToLogin', locale)}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>

      <div className="flex gap-4 px-6 pb-4">
        <div className="h-24 flex-1 rounded-lg bg-primary/5" />
        <div className="h-24 flex-1 rounded-lg bg-primary/5" />
        <div className="h-24 flex-1 rounded-lg bg-primary/5" />
      </div>

      <footer className="border-t border-primary/5 bg-white px-6 py-4">
        <div className="flex items-center justify-between text-xs text-primary/40">
          <div className="flex gap-4">
            <a href="#" className="transition-colors hover:text-primary/60">{t('forgotPassword.terms', locale)}</a>
            <a href="#" className="transition-colors hover:text-primary/60">{t('forgotPassword.privacy', locale)}</a>
            <a href="#" className="transition-colors hover:text-primary/60">{t('forgotPassword.support', locale)}</a>
          </div>
          <span>{t('forgotPassword.footerCopyright', locale)}</span>
        </div>
      </footer>
    </div>
  );
}
