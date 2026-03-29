'use client';

import type React from 'react';
import type { DrumSymbol, GrooveGrid } from '@/lib/types/groove';
import { NoteCell } from './NoteCell';

interface SnippetPreviewProps {
  grid: GrooveGrid;
}

export const SnippetPreview: React.FC<SnippetPreviewProps> = ({ grid }) => {
  const { timeSignature, resolution, instruments } = grid;
  const notesPerBeat = resolution / timeSignature.beatValue;
  const totalNotesPerMeasure = timeSignature.beatsPerMeasure * notesPerBeat;

  return (
    <div className="space-y-1 w-full overflow-hidden">
      {instruments.map((instrument, _instIdx) => (
        <div key={instrument.id} className="flex gap-px h-6">
          <div className="w-20 shrink-0 flex items-center pr-2">
            <span className="text-[8px] font-headline font-black uppercase truncate text-on-surface-variant/60">
              {instrument.customName}
            </span>
          </div>
          <div className="flex flex-1 gap-px">
            {instrument.notes.map((note, noteIdx) => {
              const isMeasureStart = noteIdx % totalNotesPerMeasure === 0;
              const isBeatStart = noteIdx % notesPerBeat === 0;

              return (
                <div
                  key={noteIdx}
                  className={`flex-1 h-full min-w-[12px] border-l ${
                    isMeasureStart
                      ? 'border-primary/30'
                      : isBeatStart
                        ? 'border-outline-variant/20'
                        : 'border-outline-variant/5'
                  }`}
                >
                  <NoteCell
                    symbol={note as DrumSymbol}
                    onClick={() => {}}
                    onContextMenu={() => {}}
                    readOnly={true}
                  />
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};
