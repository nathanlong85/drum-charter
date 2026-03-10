'use client';

import React from 'react';
import { SongSection, GrooveGrid } from '@/lib/types/groove';
import { GrooveGridEditor } from '../groove/GrooveGridEditor';

interface SongSectionViewProps {
  section: SongSection;
  onGridChange?: (grid: GrooveGrid) => void;
}

export const SongSectionView: React.FC<SongSectionViewProps> = ({
  section,
  onGridChange,
}) => {
  return (
    <div className="mb-8 last:mb-0">
      <div className="flex items-center gap-4 mb-2">
        <h2 className="text-xl font-bold uppercase text-gray-800 bg-gray-100 px-3 py-1 rounded">
          {section.name}
          <span className="ml-2 text-gray-500 font-medium">({section.measuresCount}M)</span>
        </h2>
      </div>

      <div className="ml-4">
        {section.grid && (
          <div className="mb-4">
            <GrooveGridEditor 
              initialGrid={section.grid} 
              onChange={onGridChange}
            />
          </div>
        )}

        {section.notes && section.notes.length > 0 && (
          <ul className="list-disc list-inside text-gray-700 mb-4 space-y-1">
            {section.notes.map((note, idx) => (
              <li key={idx}>{note}</li>
            ))}
          </ul>
        )}

        {section.subSections && section.subSections.length > 0 && (
          <div className="mt-4 space-y-6">
            {section.subSections.map((sub) => (
              <div key={sub.id} className="border-l-4 border-gray-200 pl-4">
                <h3 className="text-lg font-semibold text-gray-700 mb-2">
                  {sub.name} <span className="text-gray-400 font-normal">({sub.measuresCount}M)</span>
                </h3>
                
                {sub.grid && (
                  <div className="mb-3">
                    <GrooveGridEditor initialGrid={sub.grid} />
                  </div>
                )}

                {sub.notes && sub.notes.length > 0 && (
                  <ul className="list-disc list-inside text-gray-600 text-sm space-y-1">
                    {sub.notes.map((note, idx) => (
                      <li key={idx}>{note}</li>
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
