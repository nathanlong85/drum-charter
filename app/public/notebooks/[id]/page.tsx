import { notFound } from 'next/navigation';
import Link from 'next/link';
import PrintButton from '@/components/common/PrintButton';
import { NotebookView } from '@/components/notebook/NotebookView';
import { supabaseService } from '@/lib/services/supabase-service';
import { createClient } from '@/lib/supabase/server';
import type { Notebook } from '@/lib/types/groove';

interface PublicNotebookPageProps {
  params: Promise<{ id: string }>;
}

export default async function PublicNotebookPage({ params }: PublicNotebookPageProps) {
  const { id } = await params;
  const supabase = await createClient();

  let notebook: Notebook;
  try {
    notebook = await supabaseService.getNotebook(id, supabase);
  } catch (error: unknown) {
    if (
      error &&
      typeof error === 'object' &&
      ((error as { code?: string }).code === 'PGRST116' ||
        (error as { message?: string }).message?.includes('not found'))
    ) {
      notFound();
    }
    console.error('Error loading public notebook:', error);
    throw error;
  }

  if (!notebook.isPublic) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-zinc-50 py-12 px-6 print:bg-white print:p-0">
      <div className="max-w-4xl mx-auto bg-white shadow-xl shadow-zinc-200 rounded-2xl overflow-hidden print:shadow-none print:rounded-none">
        <div className="bg-zinc-900 text-white px-8 py-4 flex justify-between items-center no-print">
          <h2 className="text-xs font-mono uppercase tracking-[0.2em]">DrumCharter Public View</h2>
          <PrintButton />
        </div>
        <NotebookView notebook={notebook} />
      </div>
      <footer className="max-w-4xl mx-auto mt-8 text-center no-print">
        <p className="text-sm text-zinc-400">
          Create your own practice notebooks at{' '}
          <Link href="/" className="text-blue-600 font-bold hover:underline">
            DrumCharter.com
          </Link>
        </p>
      </footer>
    </main>
  );
}
