import type { Metadata } from 'next';
import { Nunito } from 'next/font/google';
import './globals.css';
import React from 'react';
import OneSignalInit from '@/components/OneSignalInit';
import { createClient } from '@/lib/server';
import MainLayoutClient from './MainLayoutClient';

const nunito = Nunito({
  subsets: ['latin'],
  weight: ['400', '600', '700', '800'],
  variable: '--font-nunito',
});

export const metadata: Metadata = {
  title: 'CampusOlx',
  description: 'Your on-campus marketplace',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'CampusOlx',
  },
};

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
      </head>
      <body
        className={`${nunito.variable} font-sans bg-gray-50 antialiased min-h-screen`}
      >
        {process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID && <OneSignalInit />}
        <MainLayoutClient user={user}>
          {children}
        </MainLayoutClient>
      </body>
    </html>
  );
}