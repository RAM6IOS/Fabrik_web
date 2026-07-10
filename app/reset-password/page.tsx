'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [expired, setExpired] = useState(false);
  const [countdown, setCountdown] = useState(14 * 60);

  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 0) {
          clearInterval(timer);
          setExpired(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}m ${s}s`;
  };

  const getPasswordStrength = (pw: string) => {
    if (pw.length === 0) return { level: 0, label: '', color: '' };
    if (pw.length < 6) return { level: 1, label: 'ضعيفة', color: 'bg-red-400' };
    if (pw.length < 8) return { level: 2, label: 'متوسطة', color: 'bg-yellow-400' };
    if (/[A-Z]/.test(pw) && /[0-9]/.test(pw) && pw.length >= 8)
      return { level: 4, label: 'قوية', color: 'bg-success' };
    return { level: 3, label: 'جيد', color: 'bg-accent' };
  };

  const strength = getPasswordStrength(password);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    if (password !== confirmPassword) {
      setError('كلمتا المرور غير متطابقتين');
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('يجب أن تكون كلمة المرور 6 أحرف على الأقل');
      setLoading(false);
      return;
    }

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password,
      });

      if (updateError) {
        const errorMap: Record<string, string> = {
          'New password should be different from the old password': 'كلمة المرور الجديدة يجب أن تختلف عن القديمة',
          'Password should be at least 6 characters': 'يجب أن تكون كلمة المرور 6 أحرف على الأقل',
        };
        const arabicError = errorMap[updateError.message] || updateError.message;
        setError(arabicError);
        setLoading(false);
        return;
      }

      setMessage('تم تحديث كلمة المرور بنجاح');
      setLoading(false);
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 2000);
    } catch (err) {
      setError('حدث خطأ غير متوقع، يرجى المحاولة مرة أخرى');
      setLoading(false);
    }
  };

  if (expired) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
        <div className="w-full max-w-sm text-center">
          <div className="rounded-xl border border-primary/5 bg-white p-8 shadow-sm">
            <h2
              className="text-xl font-bold text-primary"
              style={{ fontFamily: 'var(--font-heading), var(--font-heading-arabic)' }}
            >
              انتهت صلاحية الرابط
            </h2>
            <p className="mt-2 text-sm text-primary/50">
              صلاحية رابط إعادة تعيين كلمة المرور انتهت. يرجى طلب رابط جديد.
            </p>
            <button
              onClick={() => window.location.href = '/forgot-password'}
              className="mt-4 rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary/90"
            >
              طلب رابط جديد
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="rounded-xl border border-primary/5 bg-white shadow-sm">
          <div className="flex gap-1.5 px-5 pt-4">
            <span className="h-3 w-3 rounded-full bg-accent" />
            <span className="h-3 w-3 rounded-full bg-primary/30" />
            <span className="h-3 w-3 rounded-full bg-primary/15" />
          </div>

          <div className="p-5 pt-3">
            <div className="mb-5 text-center">
              <h1
                className="text-xl font-bold text-primary"
                style={{ fontFamily: 'var(--font-heading), var(--font-heading-arabic)' }}
              >
                تعيين كلمة المرور
              </h1>
              <p className="mt-1 text-sm text-primary/50">
                الرجاء إدخال كلمة مرور قوية لتأمين حسابك في فابريك.
              </p>
            </div>

            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label className="mb-1 block text-right text-sm font-medium text-primary/70">
                  كلمة المرور الجديدة
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
                {password.length > 0 && (
                  <div className="mt-2">
                    <div className="flex gap-1">
                      {[1, 2, 3, 4].map((i) => (
                        <div
                          key={i}
                          className={`h-1 flex-1 rounded-full transition-colors ${
                            i <= strength.level ? strength.color : 'bg-primary/10'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="mt-1 block text-xs text-primary/40">
                      {strength.label}
                    </span>
                  </div>
                )}
              </div>

              <div>
                <label className="mb-1 block text-right text-sm font-medium text-primary/70">
                  تأكيد كلمة المرور
                </label>
                <div className="relative">
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full rounded-lg border border-primary/10 bg-background px-4 py-2.5 pl-10 text-sm text-ink outline-none transition-colors focus:border-primary/30 focus:ring-2 focus:ring-primary/5"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-primary/30 transition-colors hover:text-primary/50"
                  >
                    {showConfirm ? (
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
                {loading ? 'جاري...' : 'تحديث كلمة المرور'}
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                </svg>
              </button>
            </form>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between px-1 font-mono text-xs text-primary/30">
          <span>SECURED_LINK_EXP: {formatTime(countdown)}</span>
          <span>FABRIC.OS V2.4</span>
        </div>
      </div>
    </div>
  );
}
