import { redirect } from 'next/navigation';
import LibraryPageClient from '@/components/library/LibraryPageClient';
import { createClient } from '@/lib/supabase/server';

export default async function SetlistsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: setlists, error } = await supabase
    .from('setlists')
    .select('id, title, created_at, updated_at')
    .eq('user_id', user.id)
    .order('updated_at', { ascending: false });

  if (error) {
    console.error('Error fetching setlists:', error);
  }

  return <LibraryPageClient initialItems={setlists || []} type="setlist" />;
}
