'use client';

import { Library } from 'lucide-react';
import { GrooveGridEditor } from '@/components/groove/GrooveGridEditor';
import type { GrooveSnippet } from '@/lib/types/groove';
import { formatDateTime } from '@/lib/utils/format';

interface SnippetViewProps {
  snippet: GrooveSnippet;
}

export function SnippetView({ snippet }: SnippetViewProps) {
  return (
    <div className="max-w-4xl mx-auto p-10 bg-surface-container-lowest min-h-screen border-x border-outline-variant/10 shadow-2xl font-body antialiased">
      <header className="mb-16 border-b-4 border-primary pb-8">
        <div className="flex justify-between items-end mb-6">
          <div className="flex-1">
            <h1 className="text-5xl font-black uppercase tracking-tighter text-on-surface font-headline leading-tight">
              {snippet.title}
            </h1>
          </div>
          <div className="flex items-center gap-6 font-label">
            <div className="text-right">
              <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em] mb-1">
                Module Type
              </p>
              <p className="text-xl font-black text-on-surface uppercase leading-none tracking-tighter">
                SNIPPET
              </p>
            </div>
            <div className="h-8 w-[1px] bg-outline-variant/20" />
            <div className="text-right">
              <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-[0.3em] mb-1">
                Status
              </p>
              <p className="text-[10px] font-black text-primary uppercase leading-none tracking-widest bg-primary/10 px-2 py-1 rounded">
                Read Only
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2.5">
          {snippet.tags.map((tag, idx) => (
            <span
              key={idx}
              className="bg-surface-container-highest/50 text-primary px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-[0.2em] border border-outline-variant/10"
            >
              {tag}
            </span>
          ))}
        </div>
      </header>

      <div className="space-y-16">
        <section className="bg-surface-container-low/30 border border-outline-variant/10 rounded-2xl p-8 shadow-inner overflow-hidden relative">
          <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
            <Library className="w-24 h-24" aria-hidden="true" focusable={false} />
          </div>
          <GrooveGridEditor
            initialGrid={{
              timeSignature: snippet.timeSignature,
              resolution: snippet.resolution,
              measures: snippet.measures,
              instruments: snippet.instruments,
            }}
            readOnly={true}
          />
        </section>
      </div>

      <footer className="mt-24 pt-8 border-t border-outline-variant/10 text-center">
        <p className="text-on-surface-variant text-[9px] font-label font-black uppercase tracking-[0.3em] mb-2">
          DrumCharter Module v1.0
        </p>
        <p className="text-on-surface-variant text-[10px] font-label font-bold uppercase tracking-widest">
          Last updated {formatDateTime(snippet.updatedAt)}
        </p>
      </footer>
    </div>
  );
}
