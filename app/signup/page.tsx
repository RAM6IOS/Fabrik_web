'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useLocale } from '@/lib/i18n/context';
import { t } from '@/lib/i18n/translations';
import Alert from '@/components/Alert';

export default function SignupPage() {
  const [factoryName, setFactoryName] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const { locale } = useLocale();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);
    setMessage('');
    setError('');

    try {
      const res = await fetch('/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, factory_name: factoryName, full_name: fullName }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || t('signup.errors.registrationFailed', locale));
      }

      setMessage(t('signup.success', locale));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : t('signup.errors.serverError', locale));
    }
    setLoading(false);
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
              {t('signup.brand', locale)}
            </h1>
          </div>

          <div className="rounded-xl border border-primary/5 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-center text-lg font-bold text-primary">
              {t('signup.title', locale)}
            </h2>

            <div className="mb-6 flex items-center justify-center gap-1">
              <span className="h-2 w-2 rounded-full bg-primary/20" />
              <span className="h-0.5 w-6 bg-primary/20" />
              <span className="h-2 w-2 rounded-full bg-primary/20" />
              <span className="h-0.5 w-6 bg-primary/20" />
              <span className="h-2 w-2 rounded-full bg-primary/20" />
              <span className="h-0.5 w-6 bg-primary/20" />
              <span className="h-2 w-2 rounded-full bg-accent" />
            </div>

            <form onSubmit={handleSignUp} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-primary/70">
                  {t('signup.factoryName', locale)}
                </label>
                <input
                  type="text"
                  value={factoryName}
                  onChange={(e) => setFactoryName(e.target.value)}
                  className="w-full rounded-lg border border-primary/10 bg-background px-4 py-2.5 text-sm text-ink outline-none transition-colors focus:border-primary/30 focus:ring-2 focus:ring-primary/5"
                  placeholder={t('signup.factoryPlaceholder', locale)}
                  required
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-primary/70">
                  {t('signup.fullName', locale)}
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full rounded-lg border border-primary/10 bg-background px-4 py-2.5 text-sm text-ink outline-none transition-colors focus:border-primary/30 focus:ring-2 focus:ring-primary/5"
                  placeholder={t('signup.fullNamePlaceholder', locale)}
                  required
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-primary/70">
                  {t('signup.email', locale)}
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-lg border border-primary/10 bg-background px-4 py-2.5 text-sm text-ink outline-none transition-colors focus:border-primary/30 focus:ring-2 focus:ring-primary/5"
                  placeholder="example@factory.dz"
                  required
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-primary/70">
                  {t('signup.password', locale)}
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-lg border border-primary/10 bg-background px-4 py-2.5 pr-4 text-sm text-ink outline-none transition-colors focus:border-primary/30 focus:ring-2 focus:ring-primary/5"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-primary/30 transition-colors hover:text-primary/60"
                  >
                    {showPassword ? (
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                      </svg>
                    ) : (
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    )}
                  </button>
                </div>
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
                {loading ? t('signup.loading', locale) : t('signup.submit', locale)}
              </button>
            </form>

            <p className="mt-4 text-center text-xs text-primary/50">
              {t('signup.hasAccount', locale)}{' '}
              <Link href="/login" className="font-semibold text-primary underline">
                {t('signup.login', locale)}
              </Link>
            </p>
          </div>
        </div>
      </main>

      <footer className="border-t border-primary/5 bg-white px-4 py-4">
        <div className="mx-auto flex max-w-sm items-center justify-between text-xs text-primary/40">
          <div className="flex gap-4">
            <a href="#" className="transition-colors hover:text-primary/60">{t('signup.terms', locale)}</a>
            <a href="#" className="transition-colors hover:text-primary/60">{t('signup.privacy', locale)}</a>
            <a href="#" className="transition-colors hover:text-primary/60">{t('signup.support', locale)}</a>
          </div>
          <span>{t('signup.footerCopyright', locale)}</span>
        </div>
      </footer>
    </div>
  );
}
