import type { Metadata, Viewport } from 'next';
import { Inter, Space_Grotesk } from 'next/font/google';
import { OfflineStatus } from '@/components/common/OfflineStatus';
import ServiceWorkerRegistration from '@/components/common/ServiceWorkerRegistration';
import './globals.css';
import './print.css';

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
});

const spaceGrotesk = Space_Grotesk({
  variable: '--font-space-grotesk',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'DrumCharter',
  description: 'Interactive Drum Charts and Notebooks',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'DrumCharter',
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  themeColor: '#000000',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${spaceGrotesk.variable} antialiased font-body bg-background text-on-background`}
      >
        <ServiceWorkerRegistration />
        {children}
        <OfflineStatus />
      </body>
    </html>
  );
}
