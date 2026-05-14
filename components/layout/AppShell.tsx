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
import { usePathname, useRouter } from 'next/navigation';
import { type ReactNode, useCallback, useState, useTransition } from 'react';
import { AuthStatus, type AuthStatusProps } from '@/components/auth/AuthStatus';
import { Tooltip, TooltipProvider } from '@/components/common/Tooltip';
import { useSupabaseStatus } from '@/lib/hooks/useSupabaseStatus';
import packageJson from '@/package.json';

const { version } = packageJson;

interface AppShellProps extends AuthStatusProps {
  children: ReactNode;
}

export function AppShell({ children, initialUser, initialProfile }: AppShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const supabaseStatus = useSupabaseStatus();
  const [globalSearch, setGlobalSearch] = useState('');

  const handleRefresh = useCallback(() => {
    startTransition(() => {
      router.refresh();
    });
  }, [router]);

  const handleGlobalSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!globalSearch.trim()) return;

    // Determine target based on current pathname to make search context-aware
    let target = '/library/songs';
    if (pathname.includes('/library/notebooks')) target = '/library/notebooks';
    else if (pathname.includes('/library/snippets')) target = '/library/snippets';
    else if (pathname.includes('/library/setlists')) target = '/library/setlists';

    // Redirect to determined library tab with search param
    router.push(`${target}?search=${encodeURIComponent(globalSearch.trim())}`);
    setGlobalSearch('');
  };

  const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: Library, tab: 'dashboard' },
    { name: 'Songs', href: '/library/songs', icon: Music, tab: 'song' },
    { name: 'Notebooks', href: '/library/notebooks', icon: FileText, tab: 'notebook' },
    { name: 'Snippets', href: '/library/snippets', icon: Library, tab: 'snippet' },
    { name: 'Set Lists', href: '/library/setlists', icon: ListMusic, tab: 'setlist' },
  ];

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-surface flex flex-col font-body antialiased">
        {/* Sidebar Navigation Shell (Desktop) */}
        <aside className="fixed left-0 top-0 h-full hidden md:flex flex-col w-[72px] lg:w-[240px] bg-surface-container-low border-r border-outline-variant/10 z-50 transition-all duration-300 no-print">
          <div className="p-6 flex-1 flex flex-col">
            <Link
              href="/dashboard"
              className="flex items-center gap-3 mb-10 group hover:opacity-80 transition-opacity"
              aria-label="DrumCharter Dashboard"
            >
              <div className="w-10 h-10 shrink-0 bg-primary flex items-center justify-center rounded-lg shadow-[0_0_15px_var(--color-primary-dim)] transition-transform group-hover:scale-105">
                <Music className="w-6 h-6 text-on-primary" />
              </div>
              <div className="hidden lg:block overflow-hidden">
                <h1 className="text-primary font-bold tracking-tighter text-xl font-headline truncate uppercase">
                  DrumCharter
                </h1>
                <p className="text-on-surface-variant text-[10px] uppercase tracking-[0.2em] font-label truncate opacity-60">
                  Drum Charting for Professionals
                </p>
              </div>
            </Link>

            <nav className="space-y-1 font-label text-sm tracking-tight">
              {navItems.map((item) => {
                const isActive = pathname.startsWith(item.href);
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

          <div className="mt-auto p-6 border-t border-outline-variant/10 flex flex-col gap-0.5 bg-surface-container-lowest/30">
            <span className="text-[10px] font-headline font-black text-on-surface uppercase tracking-tight px-1">
              DrumCharter
            </span>
            <span className="text-[10px] font-label font-bold text-on-surface-variant/30 uppercase tracking-[0.2em] px-1">
              v{version}
            </span>
          </div>
        </aside>

        {/* Top App Bar Shell */}
        <header className="fixed top-0 right-0 left-0 md:left-[72px] lg:left-[240px] z-40 flex justify-between items-center px-6 h-16 bg-surface/80 backdrop-blur-xl border-b border-outline-variant/10 transition-all duration-300 no-print">
          <div className="flex items-center gap-6">
            <Link
              href="/dashboard"
              className="text-primary font-black text-lg font-headline tracking-widest uppercase hidden md:inline-block hover:opacity-80 transition-opacity"
              aria-label="DrumCharter Dashboard"
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

          <div className="flex items-center gap-4 lg:gap-8">
            <form onSubmit={handleGlobalSearch} className="relative group hidden lg:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/40 w-4 h-4" />
              <input
                className="bg-surface-container-low border-none text-[10px] font-label font-bold tracking-widest w-64 pl-10 pr-4 py-2.5 rounded-full focus:ring-1 focus:ring-primary/30 text-on-surface placeholder:text-on-surface-variant/30 outline-none transition-all"
                placeholder="SEARCH SONGS, SNIPPETS..."
                type="text"
                aria-label="Search library"
                data-testid="global-search-input"
                value={globalSearch}
                onChange={(e) => setGlobalSearch(e.target.value)}
              />
            </form>

            <div className="flex items-center gap-3 text-on-surface-variant/60">
              <Tooltip content="Refresh data" side="bottom">
                <button
                  onClick={handleRefresh}
                  className="hover:text-primary transition-colors p-2.5 hover:bg-surface-container-highest/50 rounded-full disabled:opacity-50 disabled:cursor-not-allowed group"
                  type="button"
                  aria-label="Refresh data"
                  disabled={isPending}
                >
                  <RefreshCw
                    className={`w-4 h-4 ${isPending ? 'animate-spin' : ''} group-active:scale-90 transition-transform`}
                  />
                </button>
              </Tooltip>

              <div className="h-6 w-px bg-outline-variant/20 mx-1"></div>

              <AuthStatus initialUser={initialUser} initialProfile={initialProfile} />
            </div>
          </div>
        </header>

        {/* Main Workspace Canvas */}
        <main className="md:ml-[72px] lg:ml-[240px] pt-16 pb-16 md:pb-0 flex-1 transition-all duration-300 relative">
          {children}
        </main>

        {/* Bottom Navigation (Mobile Only) */}
        <nav
          data-testid="bottom-nav"
          className="fixed bottom-0 left-0 right-0 h-16 bg-surface/90 backdrop-blur-xl border-t border-outline-variant/10 flex items-center justify-around md:hidden z-50 no-print"
        >
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex flex-col items-center gap-1 p-2 transition-all duration-200 ${
                  isActive ? 'text-primary' : 'text-on-surface-variant/60'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'scale-110' : ''}`} />
                <span className="text-[8px] font-headline font-black uppercase tracking-widest">
                  {item.name}
                </span>
              </Link>
            );
          })}
        </nav>

        {/* System Status Bar (Desktop Only) */}
        <footer className="fixed bottom-0 right-0 left-[72px] lg:left-[240px] px-6 py-2 bg-background/90 backdrop-blur-md border-t border-outline-variant/10 hidden md:flex justify-between items-center z-40 transition-all duration-300 no-print">
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
