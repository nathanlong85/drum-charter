import type { Metadata, Viewport } from 'next';
import { Inter, Space_Grotesk } from 'next/font/google';
import { cookies } from 'next/headers';
import { OfflineStatus } from '@/components/common/OfflineStatus';
import ServiceWorkerRegistration from '@/components/common/ServiceWorkerRegistration';
import { ThemeProvider } from '@/components/common/ThemeProvider';
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

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const theme = (cookieStore.get('theme')?.value as any) || 'system';

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          // biome-ignore lint/security/noDangerouslySetInnerHtml: Intentional for early theme application to avoid FOUC
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  const theme = document.cookie.split('; ').find(row => row.startsWith('theme='))?.split('=')[1] || 'system';
                  const dark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
                  if (dark) {
                    document.documentElement.classList.add('dark');
                  } else {
                    document.documentElement.classList.remove('dark');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body
        className={`${inter.variable} ${spaceGrotesk.variable} antialiased font-body bg-background text-on-background`}
      >
        <ThemeProvider initialTheme={theme}>
          <ServiceWorkerRegistration />
          {children}
          <OfflineStatus />
        </ThemeProvider>
      </body>
    </html>
  );
}
