'use client';

import React from 'react';
import Image from 'next/image';
import { DrumSymbol } from '@/lib/types/groove';

interface SymbolPickerProps {
  onSelect: (symbol: DrumSymbol) => void;
  onClose: () => void;
  position: { top: number; left: number };
}

const symbols: DrumSymbol[] = [
  'none',
  'standard', 'standard_opt',
  'ghost', 'ghost_opt',
  'accent', 'accent_opt',
  'buzz', 'buzz_opt',
  'cross_stick', 'cross_stick_opt',
  'cymbal_bell', 'cymbal_bell_opt',
  'cymbal_choke', 'cymbal_choke_opt',
  'double', 'double_opt',
  'flam', 'flam_opt',
  'hi_hat_closed', 'hi_hat_closed_opt',
  'hi_hat_loose', 'hi_hat_loose_opt',
  'hi_hat_open', 'hi_hat_open_opt',
  'hi_hat_pedal_chick', 'hi_hat_pedal_chick_opt',
  'rim_shot', 'rim_shot_opt',
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
  onClose,
  position,
}) => {
  return (
    <>
      <div 
        className="fixed inset-0 z-40" 
        onClick={onClose} 
      />
      <div
        className="fixed z-50 bg-white border border-gray-300 shadow-xl rounded p-2 grid grid-cols-6 gap-1"
        style={{ top: position.top, left: position.left }}
      >
        {symbols.map((sym) => (
          <button
            key={sym}
            onClick={() => {
              onSelect(sym);
              onClose();
            }}
            className="w-10 h-10 flex items-center justify-center hover:bg-blue-100 rounded transition-colors border border-transparent hover:border-blue-200"
            title={sym.replace(/_/g, ' ')}
          >
            {sym === 'none' ? (
              <span className="text-xs text-gray-400">∅</span>
            ) : (
              <Image
                src={symbolToIcon[sym]!}
                alt={sym}
                width={28}
                height={28}
              />
            )}
          </button>
        ))}
      </div>
    </>
  );
};
