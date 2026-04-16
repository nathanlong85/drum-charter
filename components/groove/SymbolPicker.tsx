'use client';

import { X } from 'lucide-react';
import type React from 'react';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import {
  type DrumCategory,
  type DrumSymbol,
  getSymbolsForCategory,
  symbolLabels,
  symbolShortLabels,
} from '@/lib/types/groove';
import { Tooltip } from '../common/Tooltip';
import { NoteCell } from './NoteCell';

interface SymbolPickerProps {
  onSelect: (symbol: DrumSymbol) => void;
  onVelocityChange: (velocity: number) => void;
  currentVelocity: number;
  onClose: () => void;
  position: { top: number; left: number };
  category?: DrumCategory;
}

const symbolToIcon: Record<DrumSymbol, string | null> = {
  standard: '/icons/drum-symbols/standard_hit.svg',
  standard_opt: '/icons/drum-symbols/standard_hit_opt.svg',
  ghost: '/icons/drum-symbols/ghost_hit.svg',
  ghost_opt: '/icons/drum-symbols/ghost_hit_opt.svg',
  accent: '/icons/drum-symbols/accent_hit.svg',
  accent_opt: '/icons/drum-symbols/accent_hit_opt.svg',
  buzz: '/icons/drum-symbols/buzz_hit.svg',
  buzz_opt: '/icons/drum-symbols/buzz_hit_opt.svg',
  cross_stick: '/icons/drum-symbols/cross_stick_hit.svg',
  cross_stick_opt: '/icons/drum-symbols/cross_stick_hit_opt.svg',
  cymbal_bell: '/icons/drum-symbols/cymbal_bell_hit.svg',
  cymbal_bell_opt: '/icons/drum-symbols/cymbal_bell_hit_opt.svg',
  cymbal_choke: '/icons/drum-symbols/cymbal_choke_hit.svg',
  cymbal_choke_opt: '/icons/drum-symbols/cymbal_choke_hit_opt.svg',
  double: '/icons/drum-symbols/double_hit.svg',
  double_opt: '/icons/drum-symbols/double_hit_opt.svg',
  drag: '/icons/drum-symbols/drag_hit.svg',
  drag_opt: '/icons/drum-symbols/drag_hit_opt.svg',
  flam: '/icons/drum-symbols/flam_hit.svg',
  flam_opt: '/icons/drum-symbols/flam_hit_opt.svg',
  hi_hat_closed: '/icons/drum-symbols/hi_hat_closed_hit.svg',
  hi_hat_closed_opt: '/icons/drum-symbols/hi_hat_closed_hit_opt.svg',
  hi_hat_loose: '/icons/drum-symbols/hi_hat_loose_hit.svg',
  hi_hat_loose_opt: '/icons/drum-symbols/hi_hat_loose_hit_opt.svg',
  hi_hat_open: '/icons/drum-symbols/hi_hat_open_hit.svg',
  hi_hat_open_opt: '/icons/drum-symbols/hi_hat_open_hit_opt.svg',
  hi_hat_pedal_chick: '/icons/drum-symbols/hi_hat_pedal_chick.svg',
  hi_hat_pedal_chick_opt: '/icons/drum-symbols/hi_hat_pedal_chick_opt.svg',
  rim_shot: '/icons/drum-symbols/rim_shot_hit.svg',
  rim_shot_opt: '/icons/drum-symbols/rim_shot_hit_opt.svg',
  none: null,
};

const allSymbols = Object.keys(symbolToIcon) as DrumSymbol[];

export const SymbolPicker: React.FC<SymbolPickerProps> = ({
  onSelect,
  onVelocityChange,
  currentVelocity,
  onClose,
  position,
  category,
}) => {
  const pickerRef = useRef<HTMLDivElement>(null);
  const [adjustedPos, setAdjustedPos] = useState<{ top: number; left: number }>(position);
  const filteredSymbols = category ? getSymbolsForCategory(category) : allSymbols;

  useLayoutEffect(() => {
    if (pickerRef.current) {
      const rect = pickerRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      let top = position.top;
      let left = position.left;

      // Adjust horizontal
      if (left + rect.width > viewportWidth) {
        left = Math.max(10, viewportWidth - rect.width - 20);
      }

      // Adjust vertical
      if (top + rect.height > viewportHeight) {
        top = Math.max(10, viewportHeight - rect.height - 20);
      }

      setAdjustedPos({ top, left });
    }
  }, [position, category]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/5 backdrop-blur-[1px]"
        data-testid="symbolpicker-backdrop"
      />
      <div
        ref={pickerRef}
        className="fixed z-50 bg-surface-container-low border border-outline-variant/20 shadow-2xl rounded-2xl p-4 flex flex-col gap-4 min-w-[280px] animate-in zoom-in-95 duration-100"
        style={{ top: adjustedPos.top, left: adjustedPos.left }}
        data-testid="symbol-picker"
      >
        <div className="flex justify-between items-center border-b border-outline-variant/10 pb-2">
          <span className="text-[10px] font-headline font-black uppercase tracking-widest text-on-surface-variant">
            {category || 'Select Symbol'}
          </span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="text-on-surface-variant/40 hover:text-error transition-colors"
          >
            <X size={14} />
          </button>
        </div>

        <div className="grid grid-cols-4 gap-2">
          {filteredSymbols.map((sym, idx) => (
            <Tooltip key={sym} content={symbolLabels[sym]} side="top">
              <button
                type="button"
                onClick={() => {
                  onSelect(sym);
                }}
                className="group flex flex-col items-center gap-1 p-2 hover:bg-primary/10 rounded-xl transition-all border border-transparent hover:border-primary/20 w-full"
                aria-label={symbolLabels[sym]}
              >
                <div className="w-8 h-8 flex items-center justify-center bg-surface-container-highest rounded-lg border border-outline-variant/10 group-hover:border-primary/30 transition-all pointer-events-none">
                  {sym === 'none' ? (
                    <span className="text-xl text-on-surface-variant/20 group-hover:text-primary">
                      ∅
                    </span>
                  ) : (
                    <NoteCell
                      symbol={sym}
                      index={idx}
                      onClick={() => {}}
                      onContextMenu={(e) => e.preventDefault()}
                      readOnly
                    />
                  )}
                </div>
                <span className="text-[8px] font-headline font-bold uppercase tracking-tighter text-on-surface-variant/60 group-hover:text-primary truncate w-full text-center">
                  {symbolShortLabels[sym]}
                </span>
              </button>
            </Tooltip>
          ))}
        </div>

        <div className="border-t border-outline-variant/10 pt-4 flex flex-col gap-3">
          <div className="flex justify-between items-center text-[10px] font-headline font-black uppercase tracking-widest text-on-surface-variant">
            <span>Velocity</span>
            <span className="text-primary">{Math.round(currentVelocity * 100)}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="1.2"
            step="0.05"
            value={currentVelocity}
            onChange={(e) => onVelocityChange(parseFloat(e.target.value))}
            className="w-full h-1.5 bg-surface-container-highest rounded-lg appearance-none cursor-pointer accent-primary"
          />
          <div className="flex justify-between mt-1 gap-1 p-1 bg-surface-container-highest rounded-xl">
            {[
              { label: 'GHOST', val: 0.3 },
              { label: 'STD', val: 0.7 },
              { label: 'ACCENT', val: 1.0 },
            ].map((btn) => (
              <button
                key={btn.label}
                onClick={() => onVelocityChange(btn.val)}
                data-testid={`velocity-btn-${btn.label.toLowerCase()}`}
                className={`flex-1 text-[9px] font-headline font-black py-1.5 rounded-lg transition-all ${
                  Math.abs(currentVelocity - btn.val) < 0.05
                    ? 'bg-primary text-on-primary shadow-lg shadow-primary/20'
                    : 'text-on-surface-variant/60 hover:text-primary hover:bg-surface-bright'
                }`}
              >
                {btn.label}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 bg-primary/10 hover:bg-primary/20 text-primary text-[10px] font-headline font-black uppercase tracking-widest rounded-xl transition-all"
        >
          Done
        </button>
      </div>
    </>
  );
};
