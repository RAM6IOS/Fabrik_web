import { cookies } from 'next/headers';
import { COOKIE_NAME, DEFAULT_LOCALE, isValidLocale } from '@/lib/i18n/config';
import { t } from '@/lib/i18n/translations';
import type { LocaleCode } from '@/types';

export default async function Home() {
  const cookieStore = await cookies();
  const localeCookie = cookieStore.get(COOKIE_NAME)?.value;
  const locale: LocaleCode = localeCookie && isValidLocale(localeCookie) ? localeCookie : DEFAULT_LOCALE;

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header locale={locale} />
      <HeroSection locale={locale} />
      <FeaturesSection locale={locale} />
      <OfflineSection locale={locale} />
      <CTASection locale={locale} />
      <Footer locale={locale} />
    </div>
  );
}

function Header({ locale }: { locale: LocaleCode }) {
  return (
    <header className="sticky top-0 z-50 border-b border-primary/5 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div
          className="text-xl font-bold text-primary"
          style={{ fontFamily: 'var(--font-heading), var(--font-heading-arabic)' }}
        >
          {t('landing.brand', locale)}
        </div>

        <nav className="hidden items-center gap-8 sm:flex">
          {[
            { key: 'landing.nav.about' as const, href: '#', active: true },
            { key: 'landing.nav.features' as const, href: '#features', active: false },
            { key: 'landing.nav.pricing' as const, href: '#', active: false },
          ].map((link) => (
            <a
              key={link.key}
              href={link.href}
              className={`relative text-sm font-medium transition-colors ${
                link.active
                  ? 'text-primary'
                  : 'text-primary/60 hover:text-primary'
              }`}
            >
              {t(link.key, locale)}
              {link.active && (
                <span className="absolute -bottom-1 left-0 right-0 h-0.5 rounded-full bg-accent" />
              )}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <a
            href="/login"
            className="text-sm font-medium text-primary/60 transition-colors hover:text-primary"
          >
            {t('landing.nav.login', locale)}
          </a>
          <a
            href="/signup"
            className="rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary/90"
          >
            {t('landing.nav.startNow', locale)}
          </a>
        </div>
      </div>
    </header>
  );
}

function HeroSection({ locale }: { locale: LocaleCode }) {
  return (
    <section className="relative overflow-hidden px-4 pt-16 pb-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-3xl text-center">
          <h1
            className="text-4xl font-bold tracking-tight text-primary sm:text-5xl lg:text-6xl"
            style={{ fontFamily: 'var(--font-heading), var(--font-heading-arabic)' }}
          >
            {t('landing.hero.headline', locale)}
          </h1>
          <p className="mt-4 text-lg leading-relaxed text-primary/60 sm:text-xl">
            {t('landing.hero.desc1', locale)}{' '}
            {t('landing.hero.desc2', locale)}
          </p>
        </div>

        <div className="mt-14 grid gap-5 sm:grid-cols-3">
          <StatusCard
            locale={locale}
            id="FB-9821#"
            status={t('landing.hero.statusPending', locale)}
            statusColor="bg-gray-400"
            title={t('landing.hero.order1Title', locale)}
            progress={0}
            progressColor="bg-gray-200"
            barColor="bg-gray-300"
          />
          <StatusCard
            locale={locale}
            id="FB-9045#"
            status={t('landing.hero.statusInProgress', locale)}
            statusColor="bg-accent"
            title={t('landing.hero.order2Title', locale)}
            progress={65}
            progressColor="bg-accent/15"
            barColor="bg-accent"
          />
          <div className="hidden sm:block">
            <StatusCard
              locale={locale}
              id="FB-8982#"
              status={t('landing.hero.statusCompleted', locale)}
              statusColor="bg-success"
              title={t('landing.hero.order3Title', locale)}
              progress={100}
              progressColor="bg-success/15"
              barColor="bg-success"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

function StatusCard({
  locale,
  id,
  status,
  statusColor,
  title,
  progress,
  progressColor,
  barColor,
}: {
  locale: LocaleCode;
  id: string;
  status: string;
  statusColor: string;
  title: string;
  progress: number;
  progressColor: string;
  barColor: string;
}) {
  return (
    <div className="rounded-2xl border border-primary/5 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
      <div className="mb-3 flex items-center justify-between">
        <span
          className="text-xs font-medium text-primary/40"
          style={{ fontFamily: 'var(--font-mono)' }}
        >
          {id}
        </span>
        <div className="flex items-center gap-1.5">
          <span className={`h-2 w-2 rounded-full ${statusColor}`} />
          <span className="text-xs font-medium text-primary/50">{status}</span>
        </div>
      </div>
      <h3 className="mb-3 text-sm font-semibold text-primary">{title}</h3>
      <div className="text-xs text-primary/40">{t('landing.hero.progressLabel', locale)}: {progress}%</div>
      <div className={`mt-1.5 h-1.5 w-full rounded-full ${progressColor}`}>
        <div
          className={`h-full rounded-full ${barColor} transition-all`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}

function FeaturesSection({ locale }: { locale: LocaleCode }) {
  const features = [
    {
      titleKey: 'landing.features.planning.title' as const,
      descKey: 'landing.features.planning.desc' as const,
      icon: (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
        </svg>
      ),
    },
    {
      titleKey: 'landing.features.tracking.title' as const,
      descKey: 'landing.features.tracking.desc' as const,
      icon: (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
        </svg>
      ),
    },
    {
      titleKey: 'landing.features.maintenance.title' as const,
      descKey: 'landing.features.maintenance.desc' as const,
      icon: (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17l-5.49 5.49a1.5 1.5 0 01-2.12 0l-.87-.87a1.5 1.5 0 010-2.12l5.49-5.49m5.66-5.66L11.42 15.17m5.66-5.66a4.5 4.5 0 10-6.36 6.36l6.36-6.36z" />
        </svg>
      ),
    },
  ];

  return (
    <section id="features" className="bg-white px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <h2
          className="mb-14 text-center text-3xl font-bold text-primary sm:text-4xl"
          style={{ fontFamily: 'var(--font-heading), var(--font-heading-arabic)' }}
        >
          {t('landing.why.title', locale)}
        </h2>

        <div className="grid gap-6 sm:grid-cols-3">
          {features.map((f) => (
            <div
              key={f.titleKey}
              className="rounded-2xl border border-primary/5 bg-white p-6 transition-shadow hover:shadow-md"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-white">
                {f.icon}
              </div>
              <h3 className="mb-2 text-lg font-bold text-primary">{t(f.titleKey, locale)}</h3>
              <p className="leading-relaxed text-primary/60">{t(f.descKey, locale)}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function OfflineSection({ locale }: { locale: LocaleCode }) {
  return (
    <section className="bg-primary px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col items-center gap-10 lg:flex-row">
          <div className="flex-1">
            <div className="mb-4 flex items-center gap-3">
              <svg className="h-7 w-7 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-6.364 0a5 5 0 010-7.072m0 0L3 3m2.965 5.965a9 9 0 010 7.072m0 0L3 21" />
              </svg>
              <h2
                className="text-3xl font-bold text-white sm:text-4xl"
                style={{ fontFamily: 'var(--font-heading), var(--font-heading-arabic)' }}
              >
                {t('landing.offline.title', locale)}
              </h2>
            </div>
            <p className="mb-6 leading-relaxed text-white/70">
              {t('landing.offline.desc', locale)}
            </p>
            <ul className="space-y-3">
              {([t('landing.offline.bullet1', locale), t('landing.offline.bullet2', locale)]).map((item) => (
                <li key={item} className="flex items-center gap-2 text-white">
                  <svg className="h-5 w-5 shrink-0 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="flex-1">
            <div className="overflow-hidden rounded-2xl border border-white/10 shadow-2xl">
              <div className="aspect-[4/3] bg-gradient-to-br from-primary/50 to-primary/80" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function CTASection({ locale }: { locale: LocaleCode }) {
  return (
    <section className="bg-background px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="rounded-2xl border border-primary/10 bg-white p-8 text-center sm:p-12 lg:p-16">
          <h2
            className="mb-3 text-3xl font-bold text-primary sm:text-4xl"
            style={{ fontFamily: 'var(--font-heading), var(--font-heading-arabic)' }}
          >
            {t('landing.cta.title', locale)}
          </h2>
          <p className="mb-8 text-lg text-primary/60">
            {t('landing.cta.desc', locale)}
          </p>
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <a
              href="/signup"
              className="rounded-xl bg-accent px-8 py-3 font-semibold text-primary transition-colors hover:bg-accent/90"
            >
              {t('landing.cta.demo', locale)}
            </a>
            <a
              href="#"
              className="rounded-xl border-2 border-accent bg-white px-8 py-3 font-semibold text-primary transition-colors hover:bg-accent/5"
            >
              {t('landing.cta.expert', locale)}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

function Footer({ locale }: { locale: LocaleCode }) {
  return (
    <footer className="border-t border-primary/5 bg-white px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 sm:flex-row">
        <div className="flex items-center gap-4">
          <span
            className="text-lg font-bold text-primary"
            style={{ fontFamily: 'var(--font-heading), var(--font-heading-arabic)' }}
          >
            {t('landing.footer.brand', locale)}
          </span>
          <span className="text-xs text-primary/40">
            {t('landing.footer.copyright', locale)}
          </span>
        </div>
        <div className="flex gap-6 text-sm text-primary/60">
          <a href="#" className="transition-colors hover:text-primary">{t('landing.footer.contact', locale)}</a>
          <a href="#" className="transition-colors hover:text-primary">{t('landing.footer.terms', locale)}</a>
          <a href="#" className="transition-colors hover:text-primary">{t('landing.footer.privacy', locale)}</a>
        </div>
      </div>
    </footer>
  );
}
