import type { Metadata } from "next";
import { Space_Grotesk, Cairo, IBM_Plex_Sans, IBM_Plex_Sans_Arabic, IBM_Plex_Mono } from "next/font/google";
import { cookies } from 'next/headers';
import { COOKIE_NAME, DEFAULT_LOCALE, getDir, isValidLocale } from '@/lib/i18n/config';
import LocaleInit from '@/lib/i18n/locale-init';
import "./globals.css";

const headingFont = Space_Grotesk({
  variable: "--font-heading",
  subsets: ["latin"],
  display: "swap",
});

const headingArabicFont = Cairo({
  variable: "--font-heading-arabic",
  subsets: ["arabic"],
  display: "swap",
});

const bodyFont = IBM_Plex_Sans({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const bodyArabicFont = IBM_Plex_Sans_Arabic({
  variable: "--font-body-arabic",
  subsets: ["arabic"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const monoFont = IBM_Plex_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "منصة إدارة الإنتاج",
  description: "نظام إدارة المصانع والإنتاج",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const localeCookie = cookieStore.get(COOKIE_NAME)?.value;
  const locale = localeCookie && isValidLocale(localeCookie) ? localeCookie : DEFAULT_LOCALE;
  const dir = getDir(locale);

  return (
    <html
      lang={locale}
      dir={dir}
      className={`${headingFont.variable} ${headingArabicFont.variable} ${bodyFont.variable} ${bodyArabicFont.variable} ${monoFont.variable} h-full`}
    >
      <head>
        <LocaleInit />
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
