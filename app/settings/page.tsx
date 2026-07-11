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
      setProfileMessage({ ok: false, text: 'يُسمح فقط بملفات JPG و PNG و WebP' });
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setProfileMessage({ ok: false, text: 'حجم الصورة يجب أن لا يتجاوز 2 ميغابايت' });
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
  const isRtl = locale === 'ar';

  if (loading) {
    return (
      <>
        <header className="flex items-center justify-between border-b border-primary/5 bg-white px-8 py-3">
          <div />
        </header>
        <main className="flex-1 overflow-y-auto p-8">
          <div className="text-center text-sm text-primary/30" style={{ padding: '80px 0' }}>
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
      <header className="flex items-center justify-between border-b border-primary/5 bg-white px-8 py-3">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
              {userInitial}
            </div>
            <div>
              <p
                className="text-sm font-semibold text-primary"
                style={{ fontFamily: 'var(--font-body-arabic), var(--font-body)' }}
              >
                {fullName}
              </p>
              <p
                className="text-xs text-primary/40"
                style={{ fontFamily: 'var(--font-body-arabic), var(--font-body)' }}
              >
                {factoryName}
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <input
              type="text"
              placeholder="بحث..."
              className="w-64 rounded-lg border border-primary/10 bg-background px-4 py-2 pr-10 text-sm text-primary placeholder:text-primary/30 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/30"
              style={{ fontFamily: 'var(--font-body-arabic), var(--font-body)' }}
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

      <main className="flex-1 overflow-y-auto p-8">
          {/* ── Tabs ───────────────────────────────────────────── */}
          <div style={styles.tabsWrapper}>
        <div style={styles.container}>
            <button
              id="tab-account"
              onClick={() => setActiveTab('account')}
              style={{
                ...styles.tab,
                ...(activeTab === 'account' ? styles.tabActive : {}),
              }}
            >
              الحساب الشخصي
            </button>
            <button
              id="tab-users"
              onClick={() => setActiveTab('users')}
              style={{
                ...styles.tab,
                ...(activeTab === 'users' ? styles.tabActive : {}),
              }}
            >
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} style={{ display: 'inline', verticalAlign: 'middle', marginLeft: 5 }}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
              </svg>
              {t('settings.usersManagement.heading', locale)}
            </button>
            </div>
          </div>

        <div style={{ ...styles.container, marginTop: 20 }}>

          {activeTab === 'account' && (
            <div style={styles.sectionsWrapper}>

              {/* ── Profile Section ─────────────────────────────── */}
              <section style={styles.card}>
                <div style={styles.cardHeader}>
                  <span style={styles.cardHeaderIcon}>
                    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </span>
                  <h2 style={styles.cardTitle}>{t('settings.profile.heading', locale)}</h2>
                </div>

                <div style={styles.cardBody}>
                  {/* Fields row + avatar */}
                  <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                    {/* Name + Email fields */}
                    <div style={{ flex: 1, display: 'flex', gap: 12 }}>
                      {/* Full Name */}
                      <div style={{ flex: 1 }}>
                        <label style={styles.label}>{t('settings.profile.fullName', locale)}</label>
                        <input
                          id="profile-fullname"
                          type="text"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          style={styles.input}
                        />
                      </div>
                      {/* Email */}
                      <div style={{ flex: 1 }}>
                        <label style={styles.label}>{t('settings.profile.email', locale)}</label>
                        <div style={styles.emailWrapper}>
                          <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="#9aa3ad" strokeWidth={1.8} style={{ flexShrink: 0 }}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                          </svg>
                          <input
                            id="profile-email"
                            type="email"
                            value={email}
                            readOnly
                            style={{ ...styles.input, border: 'none', outline: 'none', flex: 1, background: 'transparent', cursor: 'not-allowed', padding: 0 }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Avatar */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                      <div
                        style={styles.avatarBox}
                        onClick={() => fileInputRef.current?.click()}
                        title={t('settings.profile.avatarChange', locale)}
                      >
                        {avatarUrl ? (
                          <img src={avatarUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 8 }} />
                        ) : (
                          <span style={{ fontSize: 22, fontWeight: 700, color: '#24344a66' }}>
                            {fullName.charAt(0) || '?'}
                          </span>
                        )}
                        {avatarUploading && (
                          <div style={styles.avatarOverlay}>
                            <svg className="animate-spin" width="20" height="20" fill="none" viewBox="0 0 24 24">
                              <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="4" opacity="0.25" />
                              <path fill="white" opacity="0.75" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                            </svg>
                          </div>
                        )}
                        <div style={styles.avatarEditBadge}>
                          <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" />
                          </svg>
                        </div>
                      </div>
                      <span style={{ fontSize: 11, color: '#9aa3ad' }}>{t('settings.profile.avatarChange', locale)}</span>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        style={{ display: 'none' }}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleAvatarUpload(file);
                          e.target.value = '';
                        }}
                      />
                    </div>
                  </div>

                  {profileMessage && (
                    <p style={{ fontSize: 13, color: profileMessage.ok ? '#2F8F80' : '#e53e3e', marginTop: 8 }}>
                      {profileMessage.text}
                    </p>
                  )}

                  <div style={{ marginTop: 20 }}>
                    <button
                      id="btn-save-profile"
                      onClick={handleProfileSave}
                      disabled={profileSaving}
                      style={styles.btnPrimary}
                    >
                      <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} style={{ display: 'inline', verticalAlign: 'middle', marginLeft: 6 }}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                      {profileSaving ? t('common.saving', locale) : t('settings.profile.save', locale)}
                    </button>
                  </div>
                </div>
              </section>

              {/* ── Password Section ─────────────────────────────── */}
              <section style={styles.card}>
                <div style={styles.cardHeader}>
                  <span style={styles.cardHeaderIcon}>
                    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" />
                    </svg>
                  </span>
                  <h2 style={styles.cardTitle}>{t('settings.password.heading', locale)}</h2>
                </div>

                <div style={styles.cardBody}>
                  {/* Three password fields in one row */}
                  <div style={{ display: 'flex', gap: 12 }}>
                    <div style={{ flex: 1 }}>
                      <label style={styles.label}>{t('settings.password.current', locale)}</label>
                      <div style={{ position: 'relative' }}>
                        <input
                          id="password-current"
                          type={showCurrentPassword ? 'text' : 'password'}
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          style={{ ...styles.input, paddingLeft: 36 }}
                        />
                        <button
                          type="button"
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                          style={{
                            position: 'absolute',
                            left: 10,
                            top: '50%',
                            transform: 'translateY(-50%)',
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            padding: 0,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#9aa3ad',
                          }}
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
                    <div style={{ flex: 1 }}>
                      <label style={styles.label}>{t('settings.password.new', locale)}</label>
                      <div style={{ position: 'relative' }}>
                        <input
                          id="password-new"
                          type={showNewPassword ? 'text' : 'password'}
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          style={{ ...styles.input, paddingLeft: 36 }}
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          style={{
                            position: 'absolute',
                            left: 10,
                            top: '50%',
                            transform: 'translateY(-50%)',
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            padding: 0,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#9aa3ad',
                          }}
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
                    <div style={{ flex: 1 }}>
                      <label style={styles.label}>{t('settings.password.confirm', locale)}</label>
                      <div style={{ position: 'relative' }}>
                        <input
                          id="password-confirm"
                          type={showConfirmPassword ? 'text' : 'password'}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          style={{ ...styles.input, paddingLeft: 36 }}
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          style={{
                            position: 'absolute',
                            left: 10,
                            top: '50%',
                            transform: 'translateY(-50%)',
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            padding: 0,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#9aa3ad',
                          }}
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
                    <p style={{ fontSize: 13, color: passwordMessage.ok ? '#2F8F80' : '#e53e3e', marginTop: 8 }}>
                      {passwordMessage.text}
                    </p>
                  )}

                  <div style={{ marginTop: 20 }}>
                    <button
                      id="btn-update-password"
                      onClick={handlePasswordChange}
                      disabled={passwordSaving}
                      style={styles.btnPrimary}
                    >
                      {passwordSaving ? t('common.saving', locale) : t('settings.password.change', locale)}
                    </button>
                  </div>
                </div>
              </section>

              {/* ── Bottom row: Factory Settings + Language ─────── */}
              <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>

                {/* Factory card (left / larger) */}
                <section style={{ ...styles.card, flex: 1, marginBottom: 0 }}>
                  <div style={styles.cardHeader}>
                    <span style={styles.cardHeaderIcon}>
                      <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
                      </svg>
                    </span>
                    <h2 style={styles.cardTitle}>{t('settings.factory.heading', locale)}</h2>
                  </div>
                  <div style={styles.cardBody}>
                    <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
                      <div style={{ flex: 1 }}>
                        <label style={styles.label}>{t('settings.factory.name', locale)}</label>
                        <input
                          type="text"
                          value={factoryName}
                          readOnly
                          style={{ ...styles.input, cursor: 'not-allowed', background: '#f4f5f7', color: '#9aa3ad' }}
                        />
                      </div>
                      <div style={{ flex: 1 }}>
                        <label style={styles.label}>{t('settings.factory.industry', locale)}</label>
                        <select
                          value={industryType}
                          onChange={(e) => setIndustryType(e.target.value)}
                          style={{ ...styles.input, cursor: 'pointer' }}
                        >
                          <option value="" disabled>{t('settings.factory.industryPlaceholder', locale)}</option>
                          {industryOptions.map((opt) => (
                            <option key={opt} value={opt}>{opt}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div style={{ marginBottom: 12 }}>
                      <label style={styles.label}>{t('settings.factory.address', locale)}</label>
                      <input
                        type="text"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        style={styles.input}
                      />
                    </div>
                    <div style={{ marginBottom: 12 }}>
                      <label style={styles.label}>{t('settings.factory.contact', locale)}</label>
                      <input
                        type="text"
                        value={contactInfo}
                        onChange={(e) => setContactInfo(e.target.value)}
                        style={styles.input}
                      />
                    </div>
                    {factoryMessage && (
                      <p style={{ fontSize: 13, color: factoryMessage.ok ? '#2F8F80' : '#e53e3e', marginBottom: 8 }}>
                        {factoryMessage.text}
                      </p>
                    )}
                    <button
                      id="btn-save-factory"
                      onClick={handleFactorySave}
                      disabled={factorySaving}
                      style={styles.btnPrimary}
                    >
                      {factorySaving ? t('common.saving', locale) : t('settings.factory.save', locale)}
                    </button>
                  </div>
                </section>

                {/* Language card (right / smaller) */}
                <section style={{ ...styles.card, width: 220, flexShrink: 0, marginBottom: 0 }}>
                  <div style={styles.cardHeader}>
                    <span style={styles.cardHeaderIcon}>
                      <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 21l5.25-11.25L21 21m-9-3h7.5M3 5.621a48.474 48.474 0 016-.371m0 0c1.12 0 2.233.038 3.334.114M9 5.25V3m3.334 2.364C11.176 10.658 7.69 15.08 3 17.502m9.334-12.138c.896.061 1.785.147 2.666.257m-4.589 8.495a18.023 18.023 0 01-3.827-5.802" />
                      </svg>
                    </span>
                    <h2 style={styles.cardTitle}>{t('settings.language.heading', locale)}</h2>
                  </div>
                  <div style={styles.cardBody}>
                    <label style={styles.label}>لغة الواجهة</label>
                    <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
                      {locales.map((code) => {
                        const config = localeConfig[code];
                        const isActive = locale === code;
                        return (
                          <button
                            key={code}
                            id={`lang-${code}`}
                            onClick={() => handleLanguageChange(code)}
                            disabled={languageSaving}
                            style={{
                              ...styles.langBtn,
                              ...(isActive ? styles.langBtnActive : {}),
                            }}
                          >
                            {config.label}
                          </button>
                        );
                      })}
                    </div>
                    {languageMessage && (
                      <p style={{ fontSize: 12, color: '#2F8F80', marginTop: 8 }}>
                        {languageMessage.text}
                      </p>
                    )}
                  </div>
                </section>
              </div>

            </div>
          )}

          {activeTab === 'users' && (
            <div style={styles.sectionsWrapper}>
              <section style={styles.card}>
                <div style={styles.cardHeader}>
                  <span style={styles.cardHeaderIcon}>
                    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                    </svg>
                  </span>
                  <h2 style={styles.cardTitle}>{t('settings.usersManagement.heading', locale)}</h2>
                </div>
                <div style={styles.cardBody}>
                  <p style={{ color: '#9aa3ad', fontSize: 14 }}>{t('settings.usersManagement.description', locale)}</p>
                </div>
              </section>
            </div>
          )}

        </div>
      </main>
    </>
  );
}

// ── Inline Styles ────────────────────────────────────────────────────
const styles: Record<string, React.CSSProperties> = {
  pageHeader: {
    background: 'white',
    borderBottom: '1px solid rgba(36,52,74,0.08)',
    padding: '20px 32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  pageTitle: {
    fontSize: 22,
    fontWeight: 700,
    color: '#24344A',
    margin: 0,
    textAlign: 'right',
  },
  pageSubtitle: {
    fontSize: 13,
    color: '#9aa3ad',
    margin: '4px 0 0',
    textAlign: 'right',
  },
  main: {
    flex: 1,
    overflowY: 'auto',
    padding: '24px 32px',
    background: '#EDEFF2',
  },
  container: {
    maxWidth: 820,
    margin: '0 auto',
  },
  tabsWrapper: {
    display: 'flex',
    justifyContent: 'center',
    borderBottom: '2px solid rgba(36,52,74,0.08)',
    marginBottom: 0,
    position: 'sticky',
    top: 0,
    background: '#EDEFF2',
    zIndex: 10,
    padding: '0 32px',
  },
  tab: {
    padding: '10px 20px',
    fontSize: 14,
    fontWeight: 500,
    color: '#9aa3ad',
    background: 'transparent',
    border: 'none',
    borderBottom: '2px solid transparent',
    marginBottom: -2,
    cursor: 'pointer',
    transition: 'color 0.15s, border-color 0.15s',
  },
  tabActive: {
    color: '#24344A',
    borderBottom: '2px solid #24344A',
    fontWeight: 700,
  },
  sectionsWrapper: {
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
  },
  card: {
    background: 'white',
    borderRadius: 12,
    border: '1px solid rgba(36,52,74,0.07)',
    overflow: 'hidden',
    marginBottom: 0,
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '14px 20px',
    borderBottom: '1px solid rgba(36,52,74,0.07)',
    background: '#fafbfc',
    flexDirection: 'row-reverse',
    justifyContent: 'flex-start',
  },
  cardHeaderIcon: {
    color: '#24344A',
    display: 'flex',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: 700,
    color: '#24344A',
    margin: 0,
  },
  cardBody: {
    padding: '20px',
  },
  label: {
    display: 'block',
    fontSize: 12,
    fontWeight: 500,
    color: '#9aa3ad',
    marginBottom: 6,
    textAlign: 'right',
  },
  input: {
    width: '100%',
    padding: '9px 12px',
    fontSize: 13,
    border: '1px solid rgba(36,52,74,0.12)',
    borderRadius: 8,
    background: 'white',
    color: '#24344A',
    outline: 'none',
    boxSizing: 'border-box',
    textAlign: 'right',
    direction: 'rtl',
    transition: 'border-color 0.15s',
  },
  emailWrapper: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '9px 12px',
    fontSize: 13,
    border: '1px solid rgba(36,52,74,0.08)',
    borderRadius: 8,
    background: '#f7f8f9',
    color: '#9aa3ad',
    direction: 'rtl',
  },
  avatarBox: {
    width: 72,
    height: 72,
    borderRadius: 10,
    background: '#e8eaed',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    position: 'relative',
    overflow: 'hidden',
    border: '2px solid rgba(36,52,74,0.1)',
    transition: 'border-color 0.15s',
  },
  avatarOverlay: {
    position: 'absolute',
    inset: 0,
    background: 'rgba(0,0,0,0.4)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarEditBadge: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    width: 20,
    height: 20,
    borderRadius: '50%',
    background: '#24344A',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnPrimary: {
    padding: '9px 20px',
    fontSize: 13,
    fontWeight: 600,
    color: 'white',
    background: '#24344A',
    border: 'none',
    borderRadius: 8,
    cursor: 'pointer',
    transition: 'opacity 0.15s',
    direction: 'rtl',
  },
  langBtn: {
    flex: 1,
    padding: '8px 12px',
    fontSize: 13,
    fontWeight: 500,
    color: '#9aa3ad',
    background: 'white',
    border: '1.5px solid rgba(36,52,74,0.12)',
    borderRadius: 8,
    cursor: 'pointer',
    transition: 'all 0.15s',
  },
  langBtnActive: {
    background: '#e8eaed',
    color: '#24344A',
    fontWeight: 700,
    border: '1.5px solid rgba(36,52,74,0.2)',
  },
  btnLogout: {
    padding: '9px 18px',
    fontSize: 13,
    fontWeight: 600,
    color: '#e53e3e',
    background: 'white',
    border: '1.5px solid #e53e3e',
    borderRadius: 8,
    cursor: 'pointer',
    transition: 'all 0.15s',
    direction: 'rtl',
  },
};
