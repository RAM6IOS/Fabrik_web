import type { Metadata } from "next";
import { Cairo, IBM_Plex_Sans_Arabic, IBM_Plex_Mono } from "next/font/google";
import { cookies } from 'next/headers';
import { COOKIE_NAME, DEFAULT_LOCALE, getDir, isValidLocale } from '@/lib/i18n/config';
import LocaleInit from '@/lib/i18n/locale-init';
import "./globals.css";

const headingFont = Cairo({
  variable: "--font-heading",
  subsets: ["arabic", "latin"],
  display: "swap",
  weight: ["700"],
});

const bodyFont = IBM_Plex_Sans_Arabic({
  variable: "--font-body",
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

const monoFont = IBM_Plex_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400"],
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
      className={`${headingFont.variable} ${bodyFont.variable} ${monoFont.variable} h-full`}
    >
      <head>
        <LocaleInit />
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
