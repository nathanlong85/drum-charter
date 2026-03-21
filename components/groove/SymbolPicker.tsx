'use client';

import Image from 'next/image';
import type React from 'react';
import { type DrumCategory, type DrumSymbol, getSymbolsForCategory } from '@/lib/types/groove';

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

const symbolLabels: Partial<Record<DrumSymbol, string>> = {
  none: 'None',
  standard: 'Standard',
  standard_opt: 'Opt Std',
  ghost: 'Ghost',
  ghost_opt: 'Opt Ghost',
  accent: 'Accent',
  accent_opt: 'Opt Accent',
  buzz: 'Buzz',
  buzz_opt: 'Opt Buzz',
  cross_stick: 'X-Stick',
  cross_stick_opt: 'Opt X-Stick',
  cymbal_bell: 'Bell',
  cymbal_bell_opt: 'Opt Bell',
  cymbal_choke: 'Choke',
  cymbal_choke_opt: 'Opt Choke',
  double: 'Double',
  double_opt: 'Opt Double',
  flam: 'Flam',
  flam_opt: 'Opt Flam',
  hi_hat_closed: 'Closed',
  hi_hat_closed_opt: 'Opt Closed',
  hi_hat_loose: 'Loose',
  hi_hat_loose_opt: 'Opt Loose',
  hi_hat_open: 'Open',
  hi_hat_open_opt: 'Opt Open',
  hi_hat_pedal_chick: 'Pedal',
  hi_hat_pedal_chick_opt: 'Opt Pedal',
  rim_shot: 'Rim Shot',
  rim_shot_opt: 'Opt Rim',
};

const allSymbols: DrumSymbol[] = [
  'none',
  'standard',
  'standard_opt',
  'ghost',
  'ghost_opt',
  'accent',
  'accent_opt',
  'buzz',
  'buzz_opt',
  'cross_stick',
  'cross_stick_opt',
  'cymbal_bell',
  'cymbal_bell_opt',
  'cymbal_choke',
  'cymbal_choke_opt',
  'double',
  'double_opt',
  'flam',
  'flam_opt',
  'hi_hat_closed',
  'hi_hat_closed_opt',
  'hi_hat_loose',
  'hi_hat_loose_opt',
  'hi_hat_open',
  'hi_hat_open_opt',
  'hi_hat_pedal_chick',
  'hi_hat_pedal_chick_opt',
  'rim_shot',
  'rim_shot_opt',
];

export const SymbolPicker: React.FC<SymbolPickerProps> = ({
  onSelect,
  onVelocityChange,
  currentVelocity,
  onClose,
  position,
  category,
}) => {
  const filteredSymbols = category ? getSymbolsForCategory(category) : allSymbols;

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} data-testid="symbolpicker-backdrop" />
      <div
        className="fixed z-50 bg-white dark:bg-gray-900 border-2 border-zinc-800 dark:border-zinc-700 shadow-2xl rounded-lg p-4 flex flex-col gap-4 min-w-[280px] animate-in zoom-in-95 duration-100"
        style={{ top: position.top, left: position.left }}
      >
        <div className="flex justify-between items-center border-b border-gray-100 dark:border-zinc-800 pb-2">
          <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
            {category || 'Select Symbol'}
          </span>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
          >
            ✕
          </button>
        </div>

        <div className="grid grid-cols-4 gap-2">
          {filteredSymbols.map((sym) => (
            <button
              key={sym}
              onClick={() => {
                onSelect(sym);
              }}
              className="group flex flex-col items-center gap-1 p-2 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-md transition-all border border-transparent hover:border-blue-200 dark:hover:border-blue-800"
              title={sym.replace(/_/g, ' ')}
              aria-label={sym.replace(/_/g, ' ')}
            >
              <div className="w-8 h-8 flex items-center justify-center">
                {sym === 'none' ? (
                  <span className="text-xl text-zinc-300 group-hover:text-blue-400">∅</span>
                ) : (
                  <Image
                    src={symbolToIcon[sym]!}
                    alt={sym}
                    width={24}
                    height={24}
                    className="dark:invert opacity-70 group-hover:opacity-100 transition-opacity"
                  />
                )}
              </div>
              <span className="text-[8px] font-bold uppercase tracking-tighter text-zinc-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 truncate w-full text-center">
                {symbolLabels[sym] || sym}
              </span>
            </button>
          ))}
        </div>

        <div className="border-t border-gray-100 dark:border-zinc-800 pt-4 flex flex-col gap-2">
          <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-zinc-400">
            <span>Velocity</span>
            <span className="font-mono text-blue-600 dark:text-blue-400">
              {Math.round(currentVelocity * 100)}%
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="1.2"
            step="0.05"
            value={currentVelocity}
            onChange={(e) => onVelocityChange(parseFloat(e.target.value))}
            className="w-full h-1.5 bg-gray-100 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-blue-600"
          />
          <div className="flex justify-between mt-1 gap-1">
            {[
              { label: 'GHOST', val: 0.2 },
              { label: 'STD', val: 0.7 },
              { label: 'ACCENT', val: 1.2 },
            ].map((btn) => (
              <button
                key={btn.label}
                onClick={() => onVelocityChange(btn.val)}
                className={`flex-1 text-[9px] font-black py-1 rounded transition-colors ${
                  Math.abs(currentVelocity - btn.val) < 0.01
                    ? 'bg-zinc-800 text-white'
                    : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                }`}
              >
                {btn.label}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-2 bg-zinc-900 hover:bg-zinc-800 text-white text-[10px] font-black uppercase tracking-widest rounded-md transition-colors shadow-lg shadow-zinc-200 dark:shadow-none"
        >
          Done
        </button>
      </div>
    </>
  );
};
