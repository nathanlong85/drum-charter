import { notFound, redirect } from 'next/navigation';
import NotebookEditor from '@/components/notebook/NotebookEditor';
import { createClient } from '@/lib/supabase/server';
import type { Notebook, NotebookSection } from '@/lib/types/groove';

interface NotebookPageProps {
  params: Promise<{ id: string }>;
}

export default async function NotebookPage({ params }: NotebookPageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: notebook, error } = await supabase
    .from('notebooks')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !notebook) {
    console.error('Error fetching notebook:', error);
    notFound();
  }

  // Ensure user owns the notebook
  if (notebook.user_id !== user.id) {
    redirect('/library');
  }

  // Transform database record to Notebook type if necessary
  // The database might have snake_case fields
  if (!notebook.created_at || !notebook.updated_at) {
    console.warn(`Notebook ${id} is missing timestamps:`, {
      created_at: notebook.created_at,
      updated_at: notebook.updated_at,
    });
  }

  const formattedNotebook: Notebook = {
    id: notebook.id,
    title: notebook.title,
    sections: (notebook.sections as unknown as NotebookSection[]) || [],
    tags: notebook.tags || [],
    userId: notebook.user_id,
    isPublic: notebook.is_public ?? false,
    createdAt: notebook.created_at || null,
    updatedAt: notebook.updated_at || null,
  };

  return (
    <main className="min-h-screen bg-zinc-50 py-12 px-6">
      <NotebookEditor initialNotebook={formattedNotebook} />
    </main>
  );
}
