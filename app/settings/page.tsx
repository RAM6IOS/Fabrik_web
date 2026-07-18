'use client';

import { useState, useEffect, useRef } from 'react';
import { useLocale } from '@/lib/i18n/context';
import { createClient } from '@/lib/supabase/client';
import { locales, localeConfig } from '@/lib/i18n/config';
import { t, getIndustryOptions } from '@/lib/i18n/translations';
import type { LocaleCode } from '@/types';
import { useRouter } from 'next/navigation';

type Tab = 'account' | 'users';

export default function SettingsPage() {
  const { locale, setLocale } = useLocale();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<Tab>('account');
  const [loading, setLoading] = useState(true);

  // Profile state
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [initialFullName, setInitialFullName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMessage, setProfileMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Language state
  const [languageSaving, setLanguageSaving] = useState(false);
  const [languageMessage, setLanguageMessage] = useState<{ ok: boolean; text: string } | null>(null);

  // Factory state
  const [factoryId, setFactoryId] = useState<string | null>(null);
  const [factoryName, setFactoryName] = useState('');
  const [industryType, setIndustryType] = useState('');
  const [address, setAddress] = useState('');
  const [contactInfo, setContactInfo] = useState('');
  const [factorySaving, setFactorySaving] = useState(false);
  const [factoryMessage, setFactoryMessage] = useState<{ ok: boolean; text: string } | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { router.push('/login'); return; }
      setEmail(user.email ?? '');

      const metaName = (user.user_metadata?.full_name as string) ?? '';
      if (metaName) {
        setFullName(metaName);
        setInitialFullName(metaName);
      }

      supabase
        .from('users')
        .select('full_name, avatar_url, factory_id')
        .eq('id', user.id)
        .single()
        .then(({ data: profile, error }) => {
          if (error || !profile) {
            setLoading(false);
            return;
          }
          setFullName(profile.full_name);
          setInitialFullName(profile.full_name);
          setAvatarUrl(profile.avatar_url);
          setFactoryId(profile.factory_id);

          supabase
            .from('factories')
            .select('name, industry_type, address, contact_info')
            .eq('id', profile.factory_id)
            .single()
            .then(({ data: factory }) => {
              setLoading(false);
              if (!factory) return;
              setFactoryName(factory.name);
              setIndustryType(factory.industry_type ?? '');
              setAddress(factory.address ?? '');
              setContactInfo(factory.contact_info ?? '');
            });
        });
    });
  }, [router]);

  // ── Avatar ──────────────────────────────────────────────────────────
  async function handleAvatarUpload(file: File) {
    if (!file) return;
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setProfileMessage({ ok: false, text: t('settings.errors.fileType', locale) });
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setProfileMessage({ ok: false, text: t('settings.errors.fileSize', locale) });
      return;
    }

    setAvatarUploading(true);
    setProfileMessage(null);

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const ext = file.name.split('.').pop() ?? 'png';
    const filePath = `${user.id}/${Date.now()}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, file, { upsert: true });

    if (uploadError) {
      setAvatarUploading(false);
      setProfileMessage({ ok: false, text: t('common.error', locale) });
      return;
    }

    const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(filePath);

    const { error: dbError } = await supabase
      .from('users')
      .update({ avatar_url: publicUrl })
      .eq('id', user.id);

    setAvatarUploading(false);
    if (dbError) {
      setProfileMessage({ ok: false, text: t('common.error', locale) });
    } else {
      setAvatarUrl(publicUrl);
      setProfileMessage({ ok: true, text: t('settings.profile.saved', locale) });
    }
  }

  // ── Profile ─────────────────────────────────────────────────────────
  async function handleProfileSave() {
    const trimmed = fullName.trim();
    if (!trimmed || trimmed === initialFullName) return;

    setProfileSaving(true);
    setProfileMessage(null);

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from('users')
      .update({ full_name: trimmed })
      .eq('id', user.id);

    await supabase.auth.updateUser({ data: { full_name: trimmed } });

    setProfileSaving(false);
    if (error) {
      setProfileMessage({ ok: false, text: t('common.error', locale) });
    } else {
      setInitialFullName(trimmed);
      setProfileMessage({ ok: true, text: t('settings.profile.saved', locale) });
    }
  }

  // ── Password ────────────────────────────────────────────────────────
  async function handlePasswordChange() {
    if (newPassword !== confirmPassword) {
      setPasswordMessage({ ok: false, text: t('settings.password.mismatch', locale) });
      return;
    }
    if (newPassword.length < 6) {
      setPasswordMessage({ ok: false, text: t('settings.password.tooShort', locale) });
      return;
    }

    setPasswordSaving(true);
    setPasswordMessage(null);

    const supabase = createClient();

    const { error: authError } = await supabase.auth.signInWithPassword({ email, password: currentPassword });
    if (authError) {
      setPasswordSaving(false);
      setPasswordMessage({ ok: false, text: t('settings.password.reauthFailed', locale) });
      return;
    }

    const { error: updateError } = await supabase.auth.updateUser({ password: newPassword });
    setPasswordSaving(false);

    if (updateError) {
      setPasswordMessage({ ok: false, text: t('common.error', locale) });
    } else {
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setPasswordMessage({ ok: true, text: t('settings.password.changed', locale) });
    }
  }

  // ── Language ────────────────────────────────────────────────────────
  async function handleLanguageChange(newLocale: LocaleCode) {
    if (newLocale === locale) return;
    setLanguageSaving(true);
    setLanguageMessage(null);
    await setLocale(newLocale);
    setLanguageMessage({ ok: true, text: t('settings.language.saved', locale) });
    setLanguageSaving(false);
  }

  // ── Factory ─────────────────────────────────────────────────────────
  async function handleFactorySave() {
    if (!factoryId) return;
    setFactorySaving(true);
    setFactoryMessage(null);
    const supabase = createClient();
    const { error } = await supabase
      .from('factories')
      .update({
        industry_type: industryType || null,
        address: address.trim() || null,
        contact_info: contactInfo.trim() || null,
      })
      .eq('id', factoryId);
    setFactorySaving(false);
    if (error) {
      setFactoryMessage({ ok: false, text: t('common.error', locale) });
    } else {
      setFactoryMessage({ ok: true, text: t('settings.factory.saved', locale) });
    }
  }

  const industryOptions = getIndustryOptions(locale);

  if (loading) {
    return (
      <>
        <header className="flex items-center justify-between border-b border-primary/5 bg-white px-4 py-3 md:px-8">
          <div />
        </header>
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="py-20 text-center text-sm text-primary/30">
            {t('common.loading', locale)}
          </div>
        </main>
      </>
    );
  }

  const userInitial = fullName.charAt(0) || '?';

  return (
    <>
      {/* ── Page Header ─────────────────────────────────────── */}
      <header className="flex items-center justify-between border-b border-primary/5 bg-white px-4 py-3 md:px-8">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
            {userInitial}
          </div>
          <div>
            <p
              className="text-sm font-semibold text-primary"
              style={{ fontFamily: 'var(--font-body)' }}
            >
              {fullName}
            </p>
            <p
              className="text-xs text-primary/40"
              style={{ fontFamily: 'var(--font-body)' }}
            >
              {factoryName}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative hidden sm:block">
            <input
              type="text"
              placeholder={t('common.searchPlaceholder', locale)}
              className="w-64 rounded-lg border border-primary/10 bg-background px-4 py-2 pr-10 text-sm text-primary placeholder:text-primary/30 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/30"
              style={{ fontFamily: 'var(--font-body)' }}
            />
            <svg
              className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-primary/30"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-4 md:p-8">
        {/* ── Tabs ───────────────────────────────────────────── */}
        <div className="sticky top-0 z-10 border-b-2 border-primary/8 bg-background">
          <div className="mx-auto flex max-w-3xl justify-center">
            <button
              id="tab-account"
              onClick={() => setActiveTab('account')}
              className={`border-b-2 px-5 py-2.5 text-sm font-medium transition-colors ${
                activeTab === 'account'
                  ? 'border-primary text-primary font-bold'
                  : 'border-transparent text-primary/40 hover:text-primary/60'
              }`}
            >
              {t('settings.personalAccount', locale)}
            </button>
            <button
              id="tab-users"
              onClick={() => setActiveTab('users')}
              className={`border-b-2 px-5 py-2.5 text-sm font-medium transition-colors ${
                activeTab === 'users'
                  ? 'border-primary text-primary font-bold'
                  : 'border-transparent text-primary/40 hover:text-primary/60'
              }`}
            >
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} className="ml-1 inline-block align-middle">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
              </svg>
              {t('settings.usersManagement.heading', locale)}
            </button>
          </div>
        </div>

        <div className="mx-auto mt-5 max-w-3xl space-y-4">
          {activeTab === 'account' && (
            <>
              {/* ── Profile Section ─────────────────────────────── */}
              <section className="overflow-hidden rounded-xl border border-primary/7 bg-white">
                <div className="flex items-center gap-2.5 border-b border-primary/7 bg-[#fafbfc] px-5 py-3.5 flex-row-reverse justify-start">
                  <span className="text-primary flex items-center">
                    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </span>
                  <h2 className="text-[15px] font-bold text-primary">{t('settings.profile.heading', locale)}</h2>
                </div>

                <div className="p-5">
                  {/* Fields + avatar */}
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                    {/* Name + Email */}
                    <div className="flex flex-1 flex-col gap-3 sm:flex-row">
                      <div className="flex-1">
                        <label className="mb-1.5 block text-right text-xs font-medium text-primary/40">{t('settings.profile.fullName', locale)}</label>
                        <input
                          id="profile-fullname"
                          type="text"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          className="w-full rounded-lg border border-primary/12 bg-white px-3 py-2 text-[13px] text-primary outline-none transition-colors focus:border-primary/30"
                          style={{ textAlign: 'right', direction: 'rtl' }}
                        />
                      </div>
                      <div className="flex-1">
                        <label className="mb-1.5 block text-right text-xs font-medium text-primary/40">{t('settings.profile.email', locale)}</label>
                        <div className="flex items-center gap-2 rounded-lg border border-primary/8 bg-[#f7f8f9] px-3 py-2" style={{ direction: 'rtl' }}>
                          <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="#9aa3ad" strokeWidth={1.8} className="shrink-0">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                          </svg>
                          <input
                            id="profile-email"
                            type="email"
                            value={email}
                            readOnly
                            className="flex-1 border-none bg-transparent text-[13px] text-primary/40 outline-none"
                            style={{ cursor: 'not-allowed', padding: 0 }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Avatar */}
                    <div className="flex flex-col items-center gap-1.5">
                      <div
                        className="relative flex h-[72px] w-[72px] cursor-pointer items-center justify-center overflow-hidden rounded-[10px] border-2 border-primary/10 bg-[#e8eaed] transition-colors hover:border-primary/20"
                        onClick={() => fileInputRef.current?.click()}
                        title={t('settings.profile.avatarChange', locale)}
                      >
                        {avatarUrl ? (
                          <img src={avatarUrl} alt="" className="h-full w-full rounded-[8px] object-cover" />
                        ) : (
                          <span className="text-[22px] font-bold" style={{ color: '#24344a66' }}>
                            {fullName.charAt(0) || '?'}
                          </span>
                        )}
                        {avatarUploading && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                            <svg className="animate-spin" width="20" height="20" fill="none" viewBox="0 0 24 24">
                              <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="4" opacity="0.25" />
                              <path fill="white" opacity="0.75" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                            </svg>
                          </div>
                        )}
                        <div className="absolute bottom-1 right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary">
                          <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" />
                          </svg>
                        </div>
                      </div>
                      <span className="text-[11px] text-primary/40">{t('settings.profile.avatarChange', locale)}</span>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleAvatarUpload(file);
                          e.target.value = '';
                        }}
                      />
                    </div>
                  </div>

                  {profileMessage && (
                    <p className={`mt-2 text-[13px] ${profileMessage.ok ? 'text-success' : 'text-red-500'}`}>
                      {profileMessage.text}
                    </p>
                  )}

                  <div className="mt-5">
                    <button
                      id="btn-save-profile"
                      onClick={handleProfileSave}
                      disabled={profileSaving}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-5 py-2 text-[13px] font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50 sm:w-auto"
                      style={{ direction: 'rtl' }}
                    >
                      <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                      {profileSaving ? t('common.saving', locale) : t('settings.profile.save', locale)}
                    </button>
                  </div>
                </div>
              </section>

              {/* ── Password Section ─────────────────────────────── */}
              <section className="overflow-hidden rounded-xl border border-primary/7 bg-white">
                <div className="flex items-center gap-2.5 border-b border-primary/7 bg-[#fafbfc] px-5 py-3.5 flex-row-reverse justify-start">
                  <span className="text-primary flex items-center">
                    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" />
                    </svg>
                  </span>
                  <h2 className="text-[15px] font-bold text-primary">{t('settings.password.heading', locale)}</h2>
                </div>

                <div className="p-5">
                  {/* Password fields */}
                  <div className="flex flex-col gap-3 sm:flex-row">
                    <div className="flex-1">
                      <label className="mb-1.5 block text-right text-xs font-medium text-primary/40">{t('settings.password.current', locale)}</label>
                      <div className="relative">
                        <input
                          id="password-current"
                          type={showCurrentPassword ? 'text' : 'password'}
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          className="w-full rounded-lg border border-primary/12 bg-white py-2 pl-9 pr-3 text-[13px] text-primary outline-none transition-colors focus:border-primary/30"
                          style={{ textAlign: 'right', direction: 'rtl' }}
                        />
                        <button
                          type="button"
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                          className="absolute left-2.5 top-1/2 -translate-y-1/2 text-primary/30 transition-colors hover:text-primary/50"
                        >
                          {showCurrentPassword ? (
                            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                            </svg>
                          ) : (
                            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                          )}
                        </button>
                      </div>
                    </div>
                    <div className="flex-1">
                      <label className="mb-1.5 block text-right text-xs font-medium text-primary/40">{t('settings.password.new', locale)}</label>
                      <div className="relative">
                        <input
                          id="password-new"
                          type={showNewPassword ? 'text' : 'password'}
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="w-full rounded-lg border border-primary/12 bg-white py-2 pl-9 pr-3 text-[13px] text-primary outline-none transition-colors focus:border-primary/30"
                          style={{ textAlign: 'right', direction: 'rtl' }}
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute left-2.5 top-1/2 -translate-y-1/2 text-primary/30 transition-colors hover:text-primary/50"
                        >
                          {showNewPassword ? (
                            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                            </svg>
                          ) : (
                            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                          )}
                        </button>
                      </div>
                    </div>
                    <div className="flex-1">
                      <label className="mb-1.5 block text-right text-xs font-medium text-primary/40">{t('settings.password.confirm', locale)}</label>
                      <div className="relative">
                        <input
                          id="password-confirm"
                          type={showConfirmPassword ? 'text' : 'password'}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="w-full rounded-lg border border-primary/12 bg-white py-2 pl-9 pr-3 text-[13px] text-primary outline-none transition-colors focus:border-primary/30"
                          style={{ textAlign: 'right', direction: 'rtl' }}
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute left-2.5 top-1/2 -translate-y-1/2 text-primary/30 transition-colors hover:text-primary/50"
                        >
                          {showConfirmPassword ? (
                            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                            </svg>
                          ) : (
                            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  {passwordMessage && (
                    <p className={`mt-2 text-[13px] ${passwordMessage.ok ? 'text-success' : 'text-red-500'}`}>
                      {passwordMessage.text}
                    </p>
                  )}

                  <div className="mt-5">
                    <button
                      id="btn-update-password"
                      onClick={handlePasswordChange}
                      disabled={passwordSaving}
                      className="rounded-lg bg-primary px-5 py-2 text-[13px] font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                      style={{ direction: 'rtl' }}
                    >
                      {passwordSaving ? t('common.saving', locale) : t('settings.password.change', locale)}
                    </button>
                  </div>
                </div>
              </section>

              {/* ── Bottom row: Factory + Language ─────── */}
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                {/* Factory card */}
                <section className="overflow-hidden rounded-xl border border-primary/7 bg-white sm:flex-1">
                  <div className="flex items-center gap-2.5 border-b border-primary/7 bg-[#fafbfc] px-5 py-3.5 flex-row-reverse justify-start">
                    <span className="text-primary flex items-center">
                      <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
                      </svg>
                    </span>
                    <h2 className="text-[15px] font-bold text-primary">{t('settings.factory.heading', locale)}</h2>
                  </div>
                  <div className="p-5">
                    <div className="flex flex-col gap-3 sm:flex-row">
                      <div className="flex-1">
                        <label className="mb-1.5 block text-right text-xs font-medium text-primary/40">{t('settings.factory.name', locale)}</label>
                        <input
                          type="text"
                          value={factoryName}
                          readOnly
                          className="w-full cursor-not-allowed rounded-lg border border-primary/12 bg-[#f4f5f7] px-3 py-2 text-[13px] text-primary/40 outline-none"
                          style={{ textAlign: 'right', direction: 'rtl' }}
                        />
                      </div>
                      <div className="flex-1">
                        <label className="mb-1.5 block text-right text-xs font-medium text-primary/40">{t('settings.factory.industry', locale)}</label>
                        <select
                          value={industryType}
                          onChange={(e) => setIndustryType(e.target.value)}
                          className="w-full cursor-pointer rounded-lg border border-primary/12 bg-white px-3 py-2 text-[13px] text-primary outline-none transition-colors focus:border-primary/30"
                          style={{ textAlign: 'right', direction: 'rtl' }}
                        >
                          <option value="" disabled>{t('settings.factory.industryPlaceholder', locale)}</option>
                          {industryOptions.map((opt) => (
                            <option key={opt} value={opt}>{opt}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="mt-3">
                      <label className="mb-1.5 block text-right text-xs font-medium text-primary/40">{t('settings.factory.address', locale)}</label>
                      <input
                        type="text"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        className="w-full rounded-lg border border-primary/12 bg-white px-3 py-2 text-[13px] text-primary outline-none transition-colors focus:border-primary/30"
                        style={{ textAlign: 'right', direction: 'rtl' }}
                      />
                    </div>
                    <div className="mt-3">
                      <label className="mb-1.5 block text-right text-xs font-medium text-primary/40">{t('settings.factory.contact', locale)}</label>
                      <input
                        type="text"
                        value={contactInfo}
                        onChange={(e) => setContactInfo(e.target.value)}
                        className="w-full rounded-lg border border-primary/12 bg-white px-3 py-2 text-[13px] text-primary outline-none transition-colors focus:border-primary/30"
                        style={{ textAlign: 'right', direction: 'rtl' }}
                      />
                    </div>
                    {factoryMessage && (
                      <p className={`mt-2 text-[13px] ${factoryMessage.ok ? 'text-success' : 'text-red-500'}`}>
                        {factoryMessage.text}
                      </p>
                    )}
                    <button
                      id="btn-save-factory"
                      onClick={handleFactorySave}
                      disabled={factorySaving}
                      className="mt-4 rounded-lg bg-primary px-5 py-2 text-[13px] font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                      style={{ direction: 'rtl' }}
                    >
                      {factorySaving ? t('common.saving', locale) : t('settings.factory.save', locale)}
                    </button>
                  </div>
                </section>

                {/* Language card */}
                <section className="overflow-hidden rounded-xl border border-primary/7 bg-white sm:w-[220px] sm:shrink-0">
                  <div className="flex items-center gap-2.5 border-b border-primary/7 bg-[#fafbfc] px-5 py-3.5 flex-row-reverse justify-start">
                    <span className="text-primary flex items-center">
                      <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 21l5.25-11.25L21 21m-9-3h7.5M3 5.621a48.474 48.474 0 016-.371m0 0c1.12 0 2.233.038 3.334.114M9 5.25V3m3.334 2.364C11.176 10.658 7.69 15.08 3 17.502m9.334-12.138c.896.061 1.785.147 2.666.257m-4.589 8.495a18.023 18.023 0 01-3.827-5.802" />
                      </svg>
                    </span>
                    <h2 className="text-[15px] font-bold text-primary">{t('settings.language.heading', locale)}</h2>
                  </div>
                  <div className="p-5">
                    <label className="mb-1.5 block text-right text-xs font-medium text-primary/40">{t('settings.interfaceLanguage', locale)}</label>
                    <div className="mt-1.5 flex gap-2">
                      {locales.map((code) => {
                        const config = localeConfig[code];
                        const isActive = locale === code;
                        return (
                          <button
                            key={code}
                            id={`lang-${code}`}
                            onClick={() => handleLanguageChange(code)}
                            disabled={languageSaving}
                            className={`flex-1 rounded-lg border px-3 py-2 text-[13px] font-medium transition-all ${
                              isActive
                                ? 'border-primary/20 bg-[#e8eaed] font-bold text-primary'
                                : 'border-primary/12 bg-white text-primary/40 hover:bg-[#f4f5f7]'
                            }`}
                          >
                            {config.label}
                          </button>
                        );
                      })}
                    </div>
                    {languageMessage && (
                      <p className="mt-2 text-xs text-success">
                        {languageMessage.text}
                      </p>
                    )}
                  </div>
                </section>
              </div>
            </>
          )}

          {activeTab === 'users' && (
            <section className="overflow-hidden rounded-xl border border-primary/7 bg-white">
              <div className="flex items-center gap-2.5 border-b border-primary/7 bg-[#fafbfc] px-5 py-3.5 flex-row-reverse justify-start">
                <span className="text-primary flex items-center">
                  <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                  </svg>
                </span>
                <h2 className="text-[15px] font-bold text-primary">{t('settings.usersManagement.heading', locale)}</h2>
              </div>
              <div className="p-5">
                <p className="text-sm text-primary/40">{t('settings.usersManagement.description', locale)}</p>
              </div>
            </section>
          )}
        </div>
      </main>
    </>
  );
}
