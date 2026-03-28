'use client';

import { GrooveGridEditor } from '@/components/groove/GrooveGridEditor';
import type { Notebook } from '@/lib/types/groove';
import { formatDateTime } from '@/lib/utils/format';

interface NotebookViewProps {
  notebook: Notebook;
}

export function NotebookView({ notebook }: NotebookViewProps) {
  return (
    <div className="max-w-4xl mx-auto p-10 bg-surface-container-lowest min-h-screen border-x border-outline-variant/10 shadow-2xl font-body antialiased">
      <header className="mb-16 border-b-4 border-primary pb-8">
        <div className="flex justify-between items-end mb-6">
          <div className="flex-1">
            <h1 className="text-5xl font-black uppercase tracking-tighter text-on-surface font-headline leading-tight">
              {notebook.title}
            </h1>
          </div>
          <div className="flex items-center gap-6 font-label">
            <div className="text-right">
              <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em] mb-1">
                Module Type
              </p>
              <p className="text-xl font-black text-on-surface uppercase leading-none tracking-tighter">
                NOTEBOOK
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
        <div className="flex gap-2 items-center flex-wrap">
          {notebook.tags.map((tag, idx) => (
            <span
              key={idx}
              className="bg-surface-container-highest/50 text-primary px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-[0.2em] border border-outline-variant/10"
            >
              #{tag}
            </span>
          ))}
        </div>
      </header>

      <div className="space-y-16">
        {notebook.sections.map((section) => (
          <div key={section.id} className="relative group">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-1 bg-primary" />
              <h2 className="text-xl font-headline font-black uppercase tracking-[0.2em] text-on-surface">
                {section.name}
              </h2>
              <div className="flex-1 h-[1px] bg-outline-variant/10" />
            </div>

            <div className="ml-4 space-y-12 pl-6 border-l-2 border-outline-variant/5">
              {section.grid && (
                <div className="mb-8 pointer-events-none opacity-90 p-6 bg-surface-container-low/30 rounded-2xl border border-outline-variant/5 shadow-inner">
                  <GrooveGridEditor
                    initialGrid={section.grid}
                    onChange={() => {}} // No-op for read-only
                  />
                </div>
              )}

              {section.notes && section.notes.length > 0 && (
                <div className="text-on-surface-variant bg-surface-container-low/30 p-8 rounded-2xl border border-outline-variant/5 shadow-inner leading-relaxed font-body text-lg italic whitespace-pre-wrap">
                  {section.notes}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <footer className="mt-24 pt-8 border-t border-outline-variant/10 text-center">
        <p className="text-on-surface-variant text-[9px] font-label font-black uppercase tracking-[0.3em] mb-2">
          DrumCharter Module v1.0
        </p>
        <p className="text-on-surface-variant text-[10px] font-label font-bold uppercase tracking-widest">
          Last updated {formatDateTime(notebook.updatedAt)}
        </p>
      </footer>
    </div>
  );
}
