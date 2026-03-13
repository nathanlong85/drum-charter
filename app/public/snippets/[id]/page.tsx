'use client';

import { supabaseService } from '@/lib/services/supabase-service';
import { notFound } from 'next/navigation';
import { SnippetView } from '@/components/groove/SnippetView';
import { GrooveSnippet } from '@/lib/types/groove';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function PublicSnippetPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [snippet, setSnippet] = useState<GrooveSnippet | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSnippet = async () => {
      const { id } = await params;
      try {
        const data = await supabaseService.getGrooveSnippet(id);
        
        if (!data || !data.isPublic) {
          setLoading(false);
          return;
        }

        setSnippet(data);
      } catch (error) {
        console.error('Error fetching public snippet:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSnippet();
  }, [params]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 font-mono text-zinc-400 uppercase tracking-widest animate-pulse">
        Loading Snippet...
      </div>
    );
  }

  if (!snippet) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-zinc-50 py-12 px-6 print:bg-white print:p-0">
      <div className="max-w-4xl mx-auto bg-white shadow-xl shadow-zinc-200 rounded-2xl overflow-hidden print:shadow-none print:rounded-none">
        <div className="bg-zinc-900 text-white px-8 py-4 flex justify-between items-center no-print">
          <h2 className="text-xs font-mono uppercase tracking-[0.2em]">DrumCharter Public View</h2>
          <button 
            onClick={() => window.print()} 
            className="text-xs font-bold border border-white/20 px-3 py-1 rounded hover:bg-white/10 transition-all"
          >
            PRINTER FRIENDLY
          </button>
        </div>
        <SnippetView snippet={snippet} />
      </div>
      <footer className="max-w-4xl mx-auto mt-8 text-center no-print">
        <p className="text-sm text-zinc-400">
          Capture your own groove snippets at <Link href="/" className="text-blue-600 font-bold hover:underline">DrumCharter.com</Link>
        </p>
      </footer>
    </main>
  );
}
