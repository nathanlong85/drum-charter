'use client';

import React from 'react';
import { GrooveSnippet } from '@/lib/types/groove';
import { GrooveGridEditor } from '@/components/groove/GrooveGridEditor';

interface SnippetViewProps {
  snippet: GrooveSnippet;
}

export function SnippetView({ snippet }: SnippetViewProps) {
  return (
    <div className="max-w-4xl mx-auto p-8 bg-white min-h-screen">
      <header className="mb-12 border-b-2 border-zinc-800 pb-6">
        <div className="flex justify-between items-start mb-4">
          <h1 className="text-4xl font-black uppercase tracking-tighter text-zinc-900 w-full">
            {snippet.title}
          </h1>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest">Type</p>
              <p className="text-sm font-bold text-zinc-900 uppercase">Snippet</p>
              <div className="text-[10px] font-medium text-zinc-400 uppercase tracking-widest mt-1">
                READ ONLY
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {snippet.tags.map((tag, idx) => (
            <span key={idx} className="bg-zinc-100 text-zinc-600 px-2 py-1 rounded text-xs font-medium">
              #{tag}
            </span>
          ))}
        </div>
      </header>

      <div className="space-y-12">
        <section className="bg-zinc-50 border border-zinc-200 rounded-xl p-6 pointer-events-none opacity-95">
          <GrooveGridEditor
            initialGrid={{
              timeSignature: snippet.timeSignature,
              resolution: snippet.resolution,
              measures: snippet.measures,
              instruments: snippet.instruments,
            }}
            onChange={() => {}} // No-op for read-only
          />
        </section>
      </div>

      <footer className="mt-16 pt-8 border-t border-zinc-100 text-center">
        <p className="text-[10px] font-mono text-zinc-400 uppercase tracking-[0.2em]">
          DrumCharter Public View
        </p>
        <p className="text-zinc-400 text-xs mt-2">
          Last updated {new Date(snippet.updatedAt).toLocaleString()}
        </p>
      </footer>
    </div>
  );
}
