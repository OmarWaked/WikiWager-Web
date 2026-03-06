import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import Script from 'next/script';
import { Toast } from '@/components/ui/Toast';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'WikiWager - The Daily Wikipedia Game',
  description:
    'Think you know everything? Bet your brain on Wikipedia trivia.',
  openGraph: {
    title: 'WikiWager - The Daily Wikipedia Game',
    description:
      'Think you know everything? Bet your brain on Wikipedia trivia.',
    siteName: 'WikiWager',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'WikiWager - The Daily Wikipedia Game',
    description:
      'Think you know everything? Bet your brain on Wikipedia trivia.',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} bg-deep-void text-soft-white antialiased`}
      >
        {children}
        <Toast />
        <Script
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6274768808904329"
          strategy="afterInteractive"
          crossOrigin="anonymous"
        />
      </body>
    </html>
  );
}
