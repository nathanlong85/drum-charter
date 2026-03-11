import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import LibraryDashboard from '@/components/library/LibraryDashboard';
import { AuthStatus } from '@/components/auth/AuthStatus';

export default async function LibraryPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Fetch data in parallel
  const [songsRes, notebooksRes, snippetsRes] = await Promise.all([
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
  ]);

  return (
    <main className="min-h-screen bg-zinc-50 py-12 px-6">
      <div className="max-w-6xl mx-auto">
        <header className="flex justify-between items-end mb-12">
          <div>
            <h1 className="text-4xl font-black text-zinc-900 tracking-tight mb-2">My Library</h1>
            <p className="text-zinc-500">Manage your songs, sketches, and practice routines.</p>
          </div>
          <AuthStatus />
        </header>

        <LibraryDashboard
          initialSongs={songsRes.data || []}
          initialNotebooks={notebooksRes.data || []}
          initialSnippets={snippetsRes.data || []}
        />
      </div>
    </main>
  );
}
