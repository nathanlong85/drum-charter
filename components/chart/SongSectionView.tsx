'use client';

import type React from 'react';
import type { SongSection } from '@/lib/types/groove';
import { GrooveGridEditor } from '../groove/GrooveGridEditor';

interface SongSectionViewProps {
  section: SongSection;
}

export const SongSectionView: React.FC<SongSectionViewProps> = ({ section }) => {
  return (
    <div className="mb-12 last:mb-0 print:mb-8 break-inside-avoid-page">
      {/* Section Header: Level 0 Indent */}
      <h2 className="text-xl font-black text-on-surface font-headline mb-4">
        {section.name}
        <span className="ml-2 text-on-surface-variant font-label text-sm font-bold">
          ({section.measuresCount}M)
        </span>
      </h2>

      {/* Section Content: Level 1 Indent */}
      <div className="ml-6 space-y-6">
        {section.notes && section.notes.length > 0 && (
          <ul className="list-disc list-outside space-y-1 text-on-surface-variant font-body text-sm ml-4">
            {section.notes.map((note, idx) => (
              <li key={idx}>
                <span>{note}</span>
              </li>
            ))}
          </ul>
        )}

        {section.grid && (
          <div className="overflow-visible">
            <GrooveGridEditor initialGrid={section.grid} readOnly={true} cellSize={24} />
          </div>
        )}

        {section.subSections && section.subSections.length > 0 && (
          <div className="mt-8 space-y-10">
            {section.subSections.map((sub) => (
              <div key={sub.id} className="break-inside-avoid-page">
                {/* Subsection Header: Level 1 Indent */}
                <h3 className="text-base font-bold underline text-on-surface mb-4 font-headline flex items-center gap-2">
                  <span className="flex-1 min-w-0">{sub.name}</span>
                  <span className="text-on-surface-variant font-label text-[10px] no-underline shrink-0">
                    ({sub.measuresCount}M)
                  </span>
                </h3>

                {/* Subsection Content: Level 2 Indent */}
                <div className="ml-6 space-y-4">
                  {sub.notes && sub.notes.length > 0 && (
                    <ul className="list-disc list-outside space-y-1 text-on-surface-variant/80 font-body text-xs ml-4">
                      {sub.notes.map((note, idx) => (
                        <li key={idx}>
                          <span>{note}</span>
                        </li>
                      ))}
                    </ul>
                  )}

                  {sub.grid && (
                    <div className="overflow-visible">
                      <GrooveGridEditor initialGrid={sub.grid} readOnly={true} cellSize={24} />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
