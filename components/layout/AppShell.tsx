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
  Settings,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import type { ReactNode } from 'react';
import { AuthStatus } from '@/components/auth/AuthStatus';
import { version } from '@/package.json';

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentTab = searchParams.get('tab');

  const navItems = [
    { name: 'Songs', href: '/library?tab=song', icon: Music, tab: 'song' },
    { name: 'Notebooks', href: '/library?tab=notebook', icon: FileText, tab: 'notebook' },
    { name: 'Snippets', href: '/library?tab=snippet', icon: Library, tab: 'snippet' },
    { name: 'Set Lists', href: '/library?tab=setlist', icon: ListMusic, tab: 'setlist' },
  ];

  return (
    <div className="min-h-screen bg-surface flex flex-col font-body">
      {/* Sidebar Navigation Shell */}
      <aside className="fixed left-0 top-0 h-full flex flex-col w-[72px] lg:w-[240px] bg-surface-container-low border-r border-outline-variant/10 z-50 transition-all duration-300">
        <div className="p-6 flex-1 flex flex-col">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-10 h-10 shrink-0 bg-primary flex items-center justify-center rounded-lg shadow-[0_0_15px_var(--color-primary-dim)]">
              <Music className="w-6 h-6 text-on-primary" />
            </div>
            <div className="hidden lg:block overflow-hidden">
              <h1 className="text-primary font-bold tracking-tighter text-xl font-headline truncate">
                DrumCharter
              </h1>
              <p className="text-on-surface-variant text-[10px] uppercase tracking-[0.2em] font-headline truncate">
                Pro Console
              </p>
            </div>
          </div>

          <nav className="space-y-2 font-headline text-sm tracking-tight">
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
                      ? 'bg-surface-container-highest text-primary shadow-[0_0_15px_rgba(0,0,0,0.2)]'
                      : 'text-on-surface-variant hover:bg-surface-container-highest hover:text-on-surface'
                  }`}
                >
                  <Icon className="w-5 h-5 shrink-0" />
                  <span className="hidden lg:block">{item.name}</span>
                </Link>
              );
            })}

            <div className="pt-10">
              <Link
                href="/manual"
                className="flex items-center gap-3 text-on-surface-variant p-3 hover:bg-surface-container-highest hover:text-on-surface rounded-lg transition-all duration-200"
              >
                <BookOpen className="w-5 h-5 shrink-0" />
                <span className="hidden lg:block">User Manual</span>
              </Link>
            </div>
          </nav>
        </div>

        <div className="mt-auto p-6 border-t border-outline-variant/10 flex flex-col gap-4">
          <div className="flex flex-col gap-1 px-1">
            <span className="text-[10px] font-headline font-black text-on-surface uppercase tracking-tight">
              DrumCharter
            </span>
            <span className="text-[10px] font-headline font-bold text-on-surface-variant/40 uppercase tracking-[0.2em]">
              v{version}
            </span>
          </div>
          <AuthStatus />
        </div>
      </aside>

      {/* Top App Bar Shell */}
      <header className="fixed top-0 right-0 left-[72px] lg:left-[240px] z-40 flex justify-between items-center px-6 h-16 bg-surface/80 backdrop-blur-xl border-b border-outline-variant/10 transition-all duration-300">
        <div className="flex items-center gap-6">
          <span className="text-primary font-black text-lg font-headline tracking-widest uppercase hidden md:inline-block">
            DrumCharter
          </span>
          <div className="hidden md:block h-4 w-[1px] bg-outline-variant/30"></div>
          <div className="flex items-center gap-2 text-primary font-headline text-[10px] tracking-[0.2em]">
            <Cloud className="w-4 h-4 animate-pulse" />
            {/* TODO: Wire this to actual sync status */}
            <span className="hidden sm:inline-block">SYNCED</span>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="relative group hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant w-4 h-4" />
            <input
              className="bg-surface-container-low border-none text-[10px] font-headline tracking-widest w-64 pl-10 pr-4 py-2 rounded-full focus:ring-1 focus:ring-primary/50 text-on-surface placeholder:text-on-surface-variant/50 outline-none"
              placeholder="SEARCH LIBRARY..."
              type="text"
              aria-label="Search library"
            />
          </div>
          <div className="flex items-center gap-4 text-on-surface-variant">
            <button
              className="hover:text-on-surface transition-colors"
              type="button"
              aria-label="Refresh data"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
            <button
              className="hover:text-on-surface transition-colors"
              type="button"
              aria-label="System settings"
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Workspace Canvas */}
      <main className="ml-[72px] lg:ml-[240px] pt-16 flex-1 transition-all duration-300 relative z-0">
        {children}
      </main>

      {/* System Status Bar */}
      <footer className="fixed bottom-0 right-0 left-[72px] lg:left-[240px] px-6 py-2 bg-background/90 backdrop-blur-md border-t border-outline-variant/10 flex justify-between items-center z-40 transition-all duration-300">
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
            v0.1.0-alpha
          </span>
        </div>
      </footer>
    </div>
  );
}
