// src/app/layout.tsx

import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Providers } from '@/components/providers';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Job Funnel Tracker',
  description: 'Track your job applications like a conversion funnel',
};

const themeScript = `
  try {
    if (localStorage.getItem('job-funnel-theme') === 'dark') {
      document.documentElement.classList.add('dark');
    }
  } catch {}
`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className={`${inter.className} h-full`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
