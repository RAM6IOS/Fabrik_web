'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

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
        // Translate common Supabase errors to Arabic
        const errorMap: Record<string, string> = {
          'Invalid login credentials': 'البريد الإلكتروني أو كلمة المرور غير صحيحة',
          'Email not confirmed': 'يرجى تأكيد بريدك الإلكتروني أولاً',
          'Too many requests': 'محاولات كثيرة، يرجى الانتظار قليلاً',
          'User not found': 'المستخدم غير موجود',
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
        setError('فشل تسجيل الدخول، يرجى المحاولة مرة أخرى');
        setLoading(false);
      }
    } catch (err) {
      setError('حدث خطأ غير متوقع، يرجى المحاولة مرة أخرى');
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
              فابريك
            </h1>
            <p className="mt-1 text-sm text-primary/50">نظام إدارة المصانع الذكي</p>
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
                    البريد الإلكتروني
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
                    كلمة المرور
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-lg border border-primary/10 bg-background px-4 py-2.5 text-sm text-ink outline-none transition-colors focus:border-primary/30 focus:ring-2 focus:ring-primary/5"
                    placeholder="••••••••"
                    required
                  />
                </div>

                <div className="text-right">
                  <Link
                    href="/forgot-password"
                    className="text-xs text-primary/50 underline transition-colors hover:text-primary/70"
                  >
                    نسيت كلمة المرور؟
                  </Link>
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
                  {loading ? 'جاري...' : 'تسجيل الدخول'}
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
            ليس لديك حساب؟{' '}
            <Link href="/signup" className="font-semibold text-primary underline">
              إنشاء حساب
            </Link>
          </p>

          <p className="mt-4 text-center text-xs text-primary/30">
            © 2024 فابريك لإدارة المصانع. جميع الحقوق محفوظة.
          </p>
        </div>
      </main>

      <footer className="border-t border-primary/5 bg-white px-4 py-4">
        <div className="mx-auto flex max-w-sm items-center justify-between text-xs text-primary/40">
          <div className="flex gap-4">
            <a href="#" className="transition-colors hover:text-primary/60">الشروط والأحكام</a>
            <a href="#" className="transition-colors hover:text-primary/60">سياسة الخصوصية</a>
            <a href="#" className="transition-colors hover:text-primary/60">الدعم الفني</a>
          </div>
          <span className="font-semibold text-primary/60">فابريك</span>
        </div>
      </footer>
    </div>
  );
}
