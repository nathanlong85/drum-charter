'use client';

import type React from 'react';
import type { SongSection } from '@/lib/types/groove';
import { GrooveGridEditor } from '../groove/GrooveGridEditor';

interface SongSectionViewProps {
  section: SongSection;
}

export const SongSectionView: React.FC<SongSectionViewProps> = ({ section }) => {
  return (
    <div className="mb-12 last:mb-0 print:mb-8">
      <div className="flex items-center gap-4 mb-6">
        <h2 className="text-xl font-black uppercase tracking-tighter text-on-surface bg-surface-container-highest px-4 py-2 rounded-lg border-l-4 border-primary shadow-sm font-headline print:bg-transparent print:p-0 print:border-none print:shadow-none">
          {section.name}
          <span className="ml-3 text-on-surface-variant font-label tracking-widest text-xs font-bold">
            [{section.measuresCount}M]
          </span>
        </h2>
      </div>

      <div className="ml-6 border-l border-outline-variant/10 pl-6 space-y-8">
        {section.grid && (
          <div className="mb-6">
            <GrooveGridEditor initialGrid={section.grid} readOnly={true} />
          </div>
        )}

        {section.notes && section.notes.length > 0 && (
          <ul className="list-none space-y-2 text-on-surface-variant font-body text-sm leading-relaxed">
            {section.notes.map((note, idx) => (
              <li key={idx} className="flex gap-3">
                <span className="text-primary mt-1.5 shrink-0 block w-1.5 h-1.5 rounded-full bg-primary/40" />
                <span>{note}</span>
              </li>
            ))}
          </ul>
        )}

        {section.subSections && section.subSections.length > 0 && (
          <div className="mt-8 space-y-10">
            {section.subSections.map((sub) => (
              <div key={sub.id} className="relative">
                <div className="absolute -left-6 top-0 bottom-0 w-[2px] bg-primary/20" />
                <h3 className="text-base font-black uppercase tracking-widest text-on-surface mb-4 font-headline flex items-center gap-3">
                  <span className="w-2 h-2 rounded-full bg-primary" />
                  {sub.name}
                  <span className="text-on-surface-variant font-label text-[10px] tracking-widest">
                    ({sub.measuresCount}M)
                  </span>
                </h3>

                {sub.grid && (
                  <div className="mb-4">
                    <GrooveGridEditor initialGrid={sub.grid} readOnly={true} />
                  </div>
                )}

                {sub.notes && sub.notes.length > 0 && (
                  <ul className="list-none space-y-1.5 text-on-surface-variant/80 font-body text-xs ml-5">
                    {sub.notes.map((note, idx) => (
                      <li key={idx} className="flex gap-2">
                        <span className="text-primary mt-1 shrink-0 block w-1 h-1 rounded-full bg-primary/20" />
                        <span>{note}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
