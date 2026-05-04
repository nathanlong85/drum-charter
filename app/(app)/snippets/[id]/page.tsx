import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { SnippetEditor } from '@/components/groove/SnippetEditor';
import { supabaseService } from '@/lib/services/supabase-service';
import { createClient } from '@/lib/supabase/server';

interface SnippetPageProps {
  params: Promise<{ id: string }>;
}

export default async function SnippetPage({ params }: SnippetPageProps) {
  const [{ id }, supabase] = await Promise.all([params, createClient()]);

  const [authResult, snippetResult] = await Promise.allSettled([
    supabase.auth.getUser(),
    supabaseService.getGrooveSnippet(id, supabase),
  ]);

  if (authResult.status === 'rejected' || !authResult.value.data.user) {
    redirect('/login');
  }

  if (snippetResult.status === 'rejected') {
    const error = snippetResult.reason;
    if (
      error &&
      typeof error === 'object' &&
      ((error as { code?: string }).code === 'PGRST116' ||
        (error as { message?: string }).message?.includes('not found'))
    ) {
      notFound();
    }
    console.error('Error loading snippet:', error);
    throw error;
  }

  const rawSnippet = snippetResult.value;

  return (
    <div className="max-w-[1400px] mx-auto p-8 space-y-12">
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-4">
        <div>
          <div className="flex items-center gap-3 text-primary font-headline text-xs font-bold uppercase tracking-[0.3em] mb-4">
            <Link
              href="/library/snippets"
              className="hover:text-primary-dim flex items-center gap-2 transition-colors"
              aria-label="Back to Library"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
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
              DrumCharter / Snippet / {id.slice(0, 8)}
            </div>
          </div>
        </div>
      </section>

      <SnippetEditor initialSnippet={rawSnippet} />
    </div>
  );
}
