import { redirect } from 'next/navigation';
import LibraryPageClient from '@/components/library/LibraryPageClient';
import { createClient } from '@/lib/supabase/server';

export default async function SongsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: songs, error } = await supabase
    .from('song_charts')
    .select('id, title, bpm, tags, created_at, updated_at')
    .eq('user_id', user.id)
    .order('updated_at', { ascending: false });

  if (error) {
    console.error('Error fetching songs:', error);
  }

  return <LibraryPageClient initialItems={songs || []} type="song" />;
}
