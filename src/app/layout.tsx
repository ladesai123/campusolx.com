import type { Metadata } from 'next';
import { Nunito } from 'next/font/google';
import './globals.css';
import React from 'react';
import OneSignalInit from '@/components/OneSignalInit';
import OneSignalTagUser from '@/components/OneSignalTagUser';
import { createClient } from '@/lib/server';
import MainLayoutClient from './MainLayoutClient';
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';

const nunito = Nunito({
  subsets: ['latin'],
  weight: ['400', '600', '700', '800'],
  variable: '--font-nunito',
});

export const metadata: Metadata = {
  title: 'CampusOlx - Buy, Sell & Reuse | SASTRA Student Marketplace',
  description: 'The exclusive marketplace for SASTRA students. Buy, sell, and reuse textbooks, electronics, lab equipment and more. Save money and give your items a new home on campus.',
  keywords: ['campus marketplace', 'student marketplace', 'SASTRA', 'buy sell', 'college marketplace', 'textbooks', 'electronics'],
  authors: [{ name: 'CampusOlx Team' }],
  creator: 'CampusOlx',
  publisher: 'CampusOlx',
  manifest: '/manifest.json',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://campusolx.com',
    title: 'CampusOlx - SASTRA Student Marketplace',
    description: 'Buy, sell & reuse items on campus. The exclusive marketplace for SASTRA students.',
    siteName: 'CampusOlx',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CampusOlx - SASTRA Student Marketplace',
    description: 'Buy, sell & reuse items on campus. The exclusive marketplace for SASTRA students.',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'CampusOlx',
  },
};

export function generateViewport() {
  return {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5,
    userScalable: true,
    themeColor: '#2563eb',
  }
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <html lang="en">
      <head>
        <meta name="theme-color" content="#ffffff" />
        <link rel="icon" href="/logo.png" type="image/png" />
      </head>
      <body
        className={`${nunito.variable} font-sans bg-gray-50 antialiased min-h-screen`}
      >
        <MainLayoutClient user={user}>
          {children}
        </MainLayoutClient>
  <Analytics />
  <SpeedInsights />
      </body>
    </html>
  );
}