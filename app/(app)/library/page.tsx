import { redirect } from 'next/navigation';
import { Suspense } from 'react';
import LibraryDashboard from '@/components/library/LibraryDashboard';
import { createClient } from '@/lib/supabase/server';

export default async function LibraryPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Fetch data in parallel
  const [songsRes, notebooksRes, snippetsRes, setlistsRes] = await Promise.all([
    supabase
      .from('song_charts')
      .select('id, title, bpm, tags, created_at, updated_at')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false }),
    supabase
      .from('notebooks')
      .select('id, title, tags, created_at, updated_at')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false }),
    supabase
      .from('groove_snippets')
      .select('id, title, tags, created_at, updated_at')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false }),
    supabase
      .from('setlists')
      .select('id, title, created_at, updated_at')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false }),
  ]);

  return (
    <div className="max-w-[1400px] mx-auto p-8 space-y-12">
      {/* Hero Header Section */}
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-4">
        <div>
          <h2 className="text-5xl lg:text-7xl font-headline font-black tracking-tighter text-on-surface uppercase mb-2">
            My Library
          </h2>
          <p className="text-on-surface-variant font-headline text-xs tracking-[0.3em] uppercase max-w-md">
            Orchestrating rhythm through modular architectural design systems.
          </p>
        </div>
      </section>

      <Suspense fallback={<div className="animate-pulse bg-surface-container h-96 rounded-3xl" />}>
        <LibraryDashboard
          initialSongs={songsRes.data || []}
          initialNotebooks={notebooksRes.data || []}
          initialSnippets={snippetsRes.data || []}
          initialSetlists={setlistsRes.data || []}
        />
      </Suspense>
    </div>
  );
}
