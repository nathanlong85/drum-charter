import { supabaseService } from '@/lib/services/supabase-service';
import SnippetEditor from '@/components/groove/SnippetEditor';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';

interface SnippetPageProps {
  params: { id: string };
}

export default async function SnippetPage({ params }: SnippetPageProps) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  console.log(`[SnippetPage] Loading snippet: ${id} (User: ${user?.id || 'Anonymous'})`);

  try {
    const rawSnippet = await supabaseService.getGrooveSnippet(id);
    
    if (!rawSnippet) {
      console.error(`[SnippetPage] Snippet not found in DB: ${id}`);
      notFound();
    }

    console.log(`[SnippetPage] Snippet found: ${rawSnippet.title} (Owner: ${rawSnippet.userId}, Public: ${rawSnippet.isPublic})`);

    return (
      <div className="min-h-screen bg-zinc-50">
        <nav className="bg-white border-b border-zinc-200 py-4 px-8">
          <div className="max-w-4xl mx-auto flex justify-between items-center">
            <Link 
              href="/library" 
              className="text-sm font-bold text-zinc-500 hover:text-zinc-900 flex items-center gap-2 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              BACK TO LIBRARY
            </Link>
            <div className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest">
              DrumCharter / Snippet / {id.slice(0, 8)}
            </div>
          </div>
        </nav>

        <main className="py-8">
          <SnippetEditor initialSnippet={rawSnippet} />
        </main>
      </div>
    );
  } catch (error) {
    console.error('Error loading snippet:', error);
    notFound();
  }
}
