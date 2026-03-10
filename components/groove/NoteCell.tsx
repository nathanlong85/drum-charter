'use client';

import React from 'react';
import Image from 'next/image';
import { DrumSymbol } from '@/lib/types/groove';

interface NoteCellProps {
  symbol: DrumSymbol;
  onClick: () => void;
  onContextMenu: (e: React.MouseEvent) => void;
  isBeat?: boolean;
  isMeasureBoundary?: boolean;
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

export const NoteCell: React.FC<NoteCellProps> = ({
  symbol,
  onClick,
  onContextMenu,
  isBeat,
  isMeasureBoundary,
}) => {
  const iconPath = symbolToIcon[symbol];

  return (
    <div
      onClick={onClick}
      onContextMenu={onContextMenu}
      className={`
        w-8 h-8 flex items-center justify-center border-r border-gray-300 cursor-pointer
        hover:bg-blue-50 transition-colors
        ${isBeat ? 'bg-gray-50' : ''}
        ${isMeasureBoundary ? 'border-r-2 border-r-gray-800' : ''}
      `}
    >
      {iconPath && (
        <Image
          src={iconPath}
          alt={symbol}
          width={24}
          height={24}
          className="select-none pointer-events-none"
        />
      )}
    </div>
  );
};
