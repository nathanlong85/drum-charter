import { redirect } from 'next/navigation';
import LibraryPageClient from '@/components/library/LibraryPageClient';
import { createClient } from '@/lib/supabase/server';

export default async function SnippetsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: snippets, error } = await supabase
    .from('groove_snippets')
    .select('id, title, tags, created_at, updated_at')
    .eq('user_id', user.id)
    .order('updated_at', { ascending: false });

  if (error) {
    console.error('Error fetching snippets:', error);
  }

  return <LibraryPageClient initialItems={snippets || []} type="snippet" />;
}
