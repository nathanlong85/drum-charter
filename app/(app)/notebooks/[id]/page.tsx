import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { NotebookEditor } from '@/components/notebook/NotebookEditor';
import { supabaseService } from '@/lib/services/supabase-service';
import { createClient } from '@/lib/supabase/server';

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

  let formattedNotebook;
  try {
    formattedNotebook = await supabaseService.getNotebook(id, supabase);
  } catch (error: unknown) {
    if (
      error &&
      typeof error === 'object' &&
      ((error as { code?: string }).code === 'PGRST116' ||
        (error as { message?: string }).message?.includes('not found'))
    ) {
      notFound();
    }
    console.error('Error loading notebook:', error);
    throw error;
  }

  return (
    <div className="max-w-[1400px] mx-auto p-8 space-y-12">
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-4">
        <div>
          <div className="flex items-center gap-3 text-primary font-headline text-xs font-bold uppercase tracking-[0.3em] mb-4">
            <Link
              href="/library"
              className="hover:text-primary-dim flex items-center gap-2 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="3"
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              BACK TO LIBRARY
            </Link>
            <div className="text-on-surface-variant/40 hidden sm:block">
              DrumCharter / Notebook / {id.slice(0, 8)}
            </div>
          </div>
        </div>
      </section>

      <NotebookEditor initialNotebook={formattedNotebook} />
    </div>
  );
}
