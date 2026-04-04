'use client';

import {
  BookOpen,
  Cloud,
  FileText,
  Library,
  ListMusic,
  Music,
  RefreshCw,
  Search,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { type ReactNode, useCallback, useTransition } from 'react';
import { AuthStatus } from '@/components/auth/AuthStatus';
import { Tooltip, TooltipProvider } from '@/components/common/Tooltip';
import { useSupabaseStatus } from '@/lib/hooks/useSupabaseStatus';
import packageJson from '@/package.json';

const { version } = packageJson;

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const currentTab = searchParams.get('tab');
  const supabaseStatus = useSupabaseStatus();

  const handleRefresh = useCallback(() => {
    startTransition(() => {
      router.refresh();
    });
  }, [router]);

  const navItems = [
    { name: 'Songs', href: '/library?tab=song', icon: Music, tab: 'song' },
    { name: 'Notebooks', href: '/library?tab=notebook', icon: FileText, tab: 'notebook' },
    { name: 'Snippets', href: '/library?tab=snippet', icon: Library, tab: 'snippet' },
    { name: 'Set Lists', href: '/library?tab=setlist', icon: ListMusic, tab: 'setlist' },
  ];

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-surface flex flex-col font-body antialiased">
        {/* Sidebar Navigation Shell */}
        <aside className="fixed left-0 top-0 h-full flex flex-col w-[72px] lg:w-[240px] bg-surface-container-low border-r border-outline-variant/10 z-50 transition-all duration-300 no-print">
          <div className="p-6 flex-1 flex flex-col">
            <Link
              href="/"
              className="flex items-center gap-3 mb-10 group hover:opacity-80 transition-opacity"
              aria-label="DrumCharter Home"
            >
              <div className="w-10 h-10 shrink-0 bg-primary flex items-center justify-center rounded-lg shadow-[0_0_15px_var(--color-primary-dim)] transition-transform group-hover:scale-105">
                <Music className="w-6 h-6 text-on-primary" />
              </div>
              <div className="hidden lg:block overflow-hidden">
                <h1 className="text-primary font-bold tracking-tighter text-xl font-headline truncate uppercase">
                  DrumCharter
                </h1>
                <p className="text-on-surface-variant text-[10px] uppercase tracking-[0.2em] font-label truncate opacity-60">
                  Pro Console
                </p>
              </div>
            </Link>

            <nav className="space-y-1 font-label text-sm tracking-tight">
              {navItems.map((item) => {
                const isActive =
                  pathname === '/library' &&
                  (currentTab === item.tab || (!currentTab && item.tab === 'song'));
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    data-active={isActive}
                    aria-current={isActive ? 'page' : undefined}
                    className={`flex items-center gap-3 rounded-lg p-3 transition-all duration-200 ${
                      isActive
                        ? 'bg-surface-container-highest text-primary shadow-[0_0_15px_rgba(0,0,0,0.1)]'
                        : 'text-on-surface-variant hover:bg-surface-container-highest/50 hover:text-on-surface'
                    }`}
                  >
                    <Icon className="w-5 h-5 shrink-0" />
                    <span className="hidden lg:block font-bold uppercase tracking-wider text-[11px]">
                      {item.name}
                    </span>
                    <span className="sr-only">{item.name}</span>
                  </Link>
                );
              })}

              <div className="pt-8">
                <Link
                  href="/manual"
                  className="flex items-center gap-3 text-on-surface-variant/60 p-3 hover:bg-surface-container-highest/50 hover:text-on-surface rounded-lg transition-all duration-200"
                >
                  <BookOpen className="w-5 h-5 shrink-0" />
                  <span className="hidden lg:block font-bold uppercase tracking-wider text-[11px]">
                    User Manual
                  </span>
                  <span className="sr-only">User Manual</span>
                </Link>
              </div>
            </nav>
          </div>

          <div className="mt-auto p-6 border-t border-outline-variant/10 flex flex-col gap-4 bg-surface-container-lowest/30">
            <div className="flex flex-col gap-0.5 px-1">
              <span className="text-[10px] font-headline font-black text-on-surface uppercase tracking-tight">
                DrumCharter
              </span>
              <span className="text-[10px] font-label font-bold text-on-surface-variant/30 uppercase tracking-[0.2em]">
                v{version}
              </span>
            </div>
            <AuthStatus />
          </div>
        </aside>

        {/* Top App Bar Shell */}
        <header className="fixed top-0 right-0 left-[72px] lg:left-[240px] z-40 flex justify-between items-center px-6 h-16 bg-surface/80 backdrop-blur-xl border-b border-outline-variant/10 transition-all duration-300 no-print">
          <div className="flex items-center gap-6">
            <Link
              href="/"
              className="text-primary font-black text-lg font-headline tracking-widest uppercase hidden md:inline-block hover:opacity-80 transition-opacity"
              aria-label="DrumCharter Home"
            >
              DrumCharter
            </Link>
            <div className="hidden md:block h-4 w-[1px] bg-outline-variant/20"></div>
            <div className="flex items-center gap-2 text-primary/60 font-label text-[10px] tracking-[0.25em] font-bold">
              <Cloud
                className={`w-4 h-4 ${supabaseStatus === 'connected' ? 'animate-pulse' : ''}`}
              />
              <span className="hidden sm:inline-block uppercase">
                {supabaseStatus === 'connected'
                  ? 'Live Sync Ready'
                  : supabaseStatus === 'connecting'
                    ? 'Connecting…'
                    : 'Offline'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="relative group hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/40 w-4 h-4" />
              <input
                className="bg-surface-container-low border-none text-[10px] font-label font-bold tracking-widest w-64 pl-10 pr-4 py-2.5 rounded-full focus:ring-1 focus:ring-primary/30 text-on-surface placeholder:text-on-surface-variant/30 outline-none transition-all"
                placeholder="SEARCH LIBRARY..."
                type="text"
                aria-label="Search library"
              />
            </div>
            <div className="flex items-center gap-4 text-on-surface-variant/60">
              <Tooltip content="Refresh data" side="bottom">
                <span className="flex">
                  <button
                    onClick={handleRefresh}
                    className="hover:text-primary transition-colors p-2 hover:bg-surface-container-highest/50 rounded-full disabled:opacity-50 disabled:cursor-not-allowed"
                    type="button"
                    aria-label="Refresh data"
                    disabled={isPending}
                  >
                    <RefreshCw className={`w-4 h-4 ${isPending ? 'animate-spin' : ''}`} />
                  </button>
                </span>
              </Tooltip>
            </div>
          </div>
        </header>

        {/* Main Workspace Canvas */}
        <main className="ml-[72px] lg:ml-[240px] pt-16 flex-1 transition-all duration-300 relative">
          {children}
        </main>

        {/* System Status Bar */}
        <footer className="fixed bottom-0 right-0 left-[72px] lg:left-[240px] px-6 py-2 bg-background/90 backdrop-blur-md border-t border-outline-variant/10 flex justify-between items-center z-40 transition-all duration-300 no-print">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]"></div>
              <span className="text-[9px] font-headline font-bold text-on-surface-variant tracking-widest uppercase">
                System Online
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 text-primary">
            <span className="text-[9px] font-headline font-bold tracking-widest uppercase">
              v{version}
            </span>
          </div>
        </footer>
      </div>
    </TooltipProvider>
  );
}
