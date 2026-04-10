import type { User } from '@supabase/supabase-js';
import { Suspense } from 'react';
import { DashboardView } from '@/components/home/DashboardView';
import { supabaseService } from '@/lib/services/supabase-service';
import { createClient } from '@/lib/supabase/server';
import type { RecentItem } from '@/lib/types/dashboard';
import type { UserProfile } from '@/lib/types/user';

async function DashboardContent({ user, profile }: { user: User; profile: UserProfile | null }) {
  const supabase = await createClient();
  let recentItems: RecentItem[] = [];

  try {
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

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null; // Layout handles redirection
  }

  const profile = await supabaseService.getProfile(user.id, supabase);

  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardContent user={user} profile={profile} />
    </Suspense>
  );
}
