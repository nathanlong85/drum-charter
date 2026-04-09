import type { User } from '@supabase/supabase-js';
import { Music } from 'lucide-react';
import Link from 'next/link';
import { Suspense } from 'react';
import { AuthStatus } from '@/components/auth/AuthStatus';
import { DashboardView } from '@/components/home/DashboardView';
import { MarketingHero } from '@/components/home/MarketingHero';
import { supabaseService } from '@/lib/services/supabase-service';
import { createClient } from '@/lib/supabase/server';
import type { RecentItem } from '@/lib/types/dashboard';
import type { UserProfile } from '@/lib/types/user';

async function DashboardContent({ user, profile }: { user: User; profile: UserProfile | null }) {
  const supabase = await createClient();
  let recentItems: RecentItem[] = [];

  try {
    // Fetch only top 3 of each to ensure we have enough for sorting,
    // and to avoid pulling unnecessary data.
    const [songs, notebooks, snippets] = await Promise.all([
      supabaseService.listSongCharts(supabase, 3),
      supabaseService.listNotebooks(supabase, 3),
      supabaseService.listGrooveSnippets(supabase, 3),
    ]);

    const getRecentItemSortTime = (item: RecentItem) => {
      const timestamp = item.updatedAt || item.createdAt;
      if (!timestamp) return 0;

      const parsed = Date.parse(timestamp);
      return Number.isNaN(parsed) ? 0 : parsed;
    };

    const items: RecentItem[] = [
      ...(songs || []).map((s) => ({
        id: s.id,
        type: 'song' as const,
        title: s.title,
        bpm: s.bpm ?? undefined,
        createdAt: s.created_at ?? null,
        updatedAt: s.updated_at ?? null,
      })),
      ...(notebooks || []).map((n) => ({
        id: n.id,
        type: 'notebook' as const,
        title: n.title,
        createdAt: n.created_at ?? null,
        updatedAt: n.updated_at ?? null,
      })),
      ...(snippets || []).map((s) => ({
        id: s.id,
        type: 'snippet' as const,
        title: s.title,
        createdAt: s.created_at ?? null,
        updatedAt: s.updated_at ?? null,
      })),
    ];

    // Sort by updated_at or created_at descending and take top 3 total
    recentItems = items
      .sort((a, b) => getRecentItemSortTime(b) - getRecentItemSortTime(a))
      .slice(0, 3);
  } catch (e) {
    console.error('Failed to fetch recent activity:', e);
  }

  return <DashboardView user={user} profile={profile} recentItems={recentItems} />;
}

function DashboardSkeleton() {
  return (
    <div className="pt-32 pb-24 px-6 max-w-7xl mx-auto animate-pulse">
      <div className="h-12 w-64 bg-outline-variant/10 rounded-xl mb-12" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-8">
          <div className="h-64 bg-outline-variant/5 rounded-3xl" />
          <div className="h-48 bg-outline-variant/5 rounded-3xl" />
        </div>
        <div className="lg:col-span-2">
          <div className="h-full min-h-[400px] bg-outline-variant/5 rounded-3xl" />
        </div>
      </div>
    </div>
  );
}

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <main className="min-h-screen bg-surface font-body selection:bg-primary/30 selection:text-primary transition-colors overflow-x-hidden">
        {/* Dynamic Header */}
        <header className="fixed top-0 left-0 right-0 z-50 bg-surface/80 backdrop-blur-xl border-b border-outline-variant/10 transition-all duration-300">
          <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
            <Link
              href="/"
              className="flex items-center gap-3 group transition-transform hover:scale-105 outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-lg p-1"
            >
              <div className="w-10 h-10 bg-primary flex items-center justify-center rounded-xl shadow-[0_0_20px_var(--color-primary-dim)] group-hover:scale-110 transition-transform duration-500">
                <Music className="w-6 h-6 text-on-primary" />
              </div>
              <div className="flex flex-col leading-none">
                <span className="text-xl font-headline font-black tracking-tighter text-on-surface uppercase">
                  DrumCharter
                </span>
                <span className="text-[9px] font-headline font-bold tracking-[0.3em] text-primary uppercase mt-0.5">
                  Sonic Architect
                </span>
              </div>
            </Link>
            <div className="flex items-center gap-8">
              <nav className="hidden md:flex items-center gap-8 text-[10px] font-headline font-black uppercase tracking-[0.2em] text-on-surface-variant">
                <a href="#features" className="hover:text-primary transition-colors">
                  Features
                </a>
                <a href="#demo" className="hover:text-primary transition-colors">
                  Live Engine
                </a>
                <Link href="/manual" className="hover:text-primary transition-colors">
                  Manual
                </Link>
              </nav>
              <div className="h-6 w-px bg-outline-variant/20 hidden md:block"></div>
              <AuthStatus />
            </div>
          </div>
        </header>

        <MarketingHero />

        {/* Footer */}
        <footer className="py-20 bg-surface px-6">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-12">
            <div className="flex flex-col items-center md:items-start gap-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-primary/20 flex items-center justify-center rounded-lg">
                  <Music className="w-5 h-5 text-primary" />
                </div>
                <span className="text-lg font-headline font-black tracking-tighter text-on-surface uppercase">
                  DrumCharter
                </span>
              </div>
              <p className="text-xs font-headline font-bold text-on-surface-variant/40 uppercase tracking-[0.3em]">
                © {new Date().getFullYear()} Sonic Architect Console v1.0-alpha
              </p>
            </div>

            <nav className="flex gap-12 text-[10px] font-headline font-black uppercase tracking-[0.2em] text-on-surface-variant">
              <Link href="/manual#privacy" className="hover:text-primary transition-colors">
                Privacy
              </Link>
              <Link href="/manual#terms" className="hover:text-primary transition-colors">
                Terms
              </Link>
              <a
                href="https://github.com/nathanlong85/drum-charter"
                target="_blank"
                className="hover:text-primary transition-colors"
                rel="noopener noreferrer"
              >
                Source
              </a>
            </nav>
          </div>
        </footer>
      </main>
    );
  }

  const profile = await supabaseService.getProfile(user.id, supabase);

  return (
    <main className="min-h-screen bg-surface font-body selection:bg-primary/30 selection:text-primary transition-colors overflow-x-hidden">
      {/* Dynamic Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-surface/80 backdrop-blur-xl border-b border-outline-variant/10 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-3 group transition-transform hover:scale-105 outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-lg p-1"
          >
            <div className="w-10 h-10 bg-primary flex items-center justify-center rounded-xl shadow-[0_0_20px_var(--color-primary-dim)] group-hover:scale-110 transition-transform duration-500">
              <Music className="w-6 h-6 text-on-primary" />
            </div>
            <div className="flex flex-col leading-none">
              <span className="text-xl font-headline font-black tracking-tighter text-on-surface uppercase">
                DrumCharter
              </span>
              <span className="text-[9px] font-headline font-bold tracking-[0.3em] text-primary uppercase mt-0.5">
                Sonic Architect
              </span>
            </div>
          </Link>
          <div className="flex items-center gap-8">
            <nav className="hidden md:flex items-center gap-8 text-[10px] font-headline font-black uppercase tracking-[0.2em] text-on-surface-variant">
              <Link href="/manual" className="hover:text-primary transition-colors">
                Manual
              </Link>
            </nav>
            <div className="h-6 w-px bg-outline-variant/20 hidden md:block"></div>
            <AuthStatus initialUser={user} initialProfile={profile} />
          </div>
        </div>
      </header>

      <Suspense fallback={<DashboardSkeleton />}>
        <DashboardContent user={user} profile={profile} />
      </Suspense>

      {/* Footer */}
      <footer className="py-20 bg-surface px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-12">
          <div className="flex flex-col items-center md:items-start gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary/20 flex items-center justify-center rounded-lg">
                <Music className="w-5 h-5 text-primary" />
              </div>
              <span className="text-lg font-headline font-black tracking-tighter text-on-surface uppercase">
                DrumCharter
              </span>
            </div>
            <p className="text-xs font-headline font-bold text-on-surface-variant/40 uppercase tracking-[0.3em]">
              © {new Date().getFullYear()} Sonic Architect Console v1.0-alpha
            </p>
          </div>

          <nav className="flex gap-12 text-[10px] font-headline font-black uppercase tracking-[0.2em] text-on-surface-variant">
            <Link href="/manual#privacy" className="hover:text-primary transition-colors">
              Privacy
            </Link>
            <Link href="/manual#terms" className="hover:text-primary transition-colors">
              Terms
            </Link>
            <a
              href="https://github.com/nathanlong85/drum-charter"
              target="_blank"
              className="hover:text-primary transition-colors"
              rel="noopener noreferrer"
            >
              Source
            </a>
          </nav>
        </div>
      </footer>
    </main>
  );
}
