import { redirect } from 'next/navigation';
import LibraryPageClient from '@/components/library/LibraryPageClient';
import { createClient } from '@/lib/supabase/server';

export default async function NotebooksPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: notebooks, error } = await supabase
    .from('notebooks')
    .select('id, title, tags, created_at, updated_at')
    .eq('user_id', user.id)
    .order('updated_at', { ascending: false });

  if (error) {
    console.error('Error fetching notebooks:', error);
  }

  return <LibraryPageClient initialItems={notebooks || []} type="notebook" />;
}
