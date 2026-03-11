'use client';

import React from 'react';
import { Notebook, NotebookSection } from '@/lib/types/groove';
import { GrooveGridEditor } from '@/components/groove/GrooveGridEditor';

interface NotebookViewProps {
  notebook: Notebook;
}

export function NotebookView({ notebook }: NotebookViewProps) {
  return (
    <div className="max-w-4xl mx-auto p-8 bg-white min-h-screen">
      <header className="mb-12 border-b-2 border-zinc-800 pb-6">
        <div className="flex justify-between items-start mb-4">
          <h1 className="text-4xl font-black uppercase tracking-tighter text-zinc-900 w-full">
            {notebook.title}
          </h1>
          <div className="flex flex-col items-end gap-2">
            <div className="text-xs font-medium text-zinc-400 uppercase tracking-widest">
              READ ONLY
            </div>
          </div>
        </div>
        <div className="flex gap-2 items-center flex-wrap">
          {notebook.tags.map((tag, idx) => (
            <span key={idx} className="bg-zinc-100 text-zinc-600 px-2 py-1 rounded text-xs font-medium">
              #{tag}
            </span>
          ))}
        </div>
      </header>

      <div className="space-y-16">
        {notebook.sections.map((section) => (
          <div key={section.id} className="relative group">
            <div className="flex items-center gap-4 mb-4">
              <h2 className="text-xl font-bold uppercase text-zinc-800 bg-zinc-100 px-3 py-1 rounded border-none w-full max-w-md">
                {section.name}
              </h2>
            </div>

            <div className="ml-4 space-y-6">
              {section.grid && (
                <div className="mb-4 pointer-events-none opacity-90">
                  <GrooveGridEditor
                    initialGrid={section.grid}
                    onChange={() => {}} // No-op for read-only
                  />
                </div>
              )}

              {section.notes && section.notes.length > 0 && (
                <div className="w-full text-zinc-700 bg-zinc-50 p-4 rounded-lg min-h-[50px] text-sm whitespace-pre-wrap">
                  {section.notes.join('\n')}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <footer className="mt-24 pt-8 border-t border-zinc-100 text-center">
        <p className="text-zinc-400 text-sm">
          Last updated {new Date(notebook.updatedAt).toLocaleString()}
        </p>
      </footer>
    </div>
  );
}
