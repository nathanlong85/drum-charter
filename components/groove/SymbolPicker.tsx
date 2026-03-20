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

const symbols: DrumSymbol[] = [
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

export const SymbolPicker: React.FC<SymbolPickerProps> = ({
  onSelect,
  onVelocityChange,
  currentVelocity,
  onClose,
  position,
  category,
}) => {
  const filteredSymbols = category ? getSymbolsForCategory(category) : symbols;

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div
        className="fixed z-50 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 shadow-xl rounded p-3 flex flex-col gap-3 min-w-[240px]"
        style={{ top: position.top, left: position.left }}
      >
        <div className="grid grid-cols-5 gap-1">
          {filteredSymbols.map((sym) => (
            <button
              key={sym}
              onClick={() => {
                onSelect(sym);
                // Don't close immediately to allow velocity adjustment
              }}
              className="w-10 h-10 flex items-center justify-center hover:bg-blue-100 dark:hover:bg-blue-900 rounded transition-colors border border-transparent hover:border-blue-200 dark:hover:border-blue-800"
              title={sym.replace(/_/g, ' ')}
              aria-label={sym.replace(/_/g, ' ')}
            >
              {sym === 'none' ? (
                <span className="text-xs text-gray-400 dark:text-gray-500">∅</span>
              ) : (
                <Image
                  src={symbolToIcon[sym]!}
                  alt={sym}
                  width={28}
                  height={28}
                  className="dark:invert"
                />
              )}
            </button>
          ))}
        </div>

        <div className="border-t border-gray-200 dark:border-gray-700 pt-3 flex flex-col gap-1">
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
            <span>Velocity</span>
            <span className="font-mono">{Math.round(currentVelocity * 100)}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={currentVelocity}
            onChange={(e) => onVelocityChange(parseFloat(e.target.value))}
            className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-600 dark:accent-blue-400"
          />
          <div className="flex justify-between mt-1">
            <button
              onClick={() => onVelocityChange(0.3)}
              className="text-[10px] px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded text-gray-600 dark:text-gray-300"
            >
              Ghost
            </button>
            <button
              onClick={() => onVelocityChange(0.7)}
              className="text-[10px] px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded text-gray-600 dark:text-gray-300"
            >
              Std
            </button>
            <button
              onClick={() => onVelocityChange(1.0)}
              className="text-[10px] px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded text-gray-600 dark:text-gray-300"
            >
              Accent
            </button>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded transition-colors"
        >
          Done
        </button>
      </div>
    </>
  );
};
