'use client';

import Image from 'next/image';
import type React from 'react';
import type { DrumSymbol } from '@/lib/types/groove';

interface NoteCellProps {
  symbol: DrumSymbol;
  velocity?: number;
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
  velocity,
  onClick,
  onContextMenu,
  isBeat,
  isMeasureBoundary,
}) => {
  const iconPath = symbolToIcon[symbol];

  // Visual feedback for velocity (opacity)
  // If velocity is provided, we use it.
  // If not, we infer a default opacity based on symbol type.
  const getOpacity = () => {
    if (velocity !== undefined && velocity > 0) {
      // Scale velocity (0.1 - 1.0) to opacity
      return Math.max(0.2, velocity);
    }
    if (symbol.includes('accent')) return 1.0;
    if (symbol.includes('ghost')) return 0.4;
    return 0.8; // standard
  };

  const opacity = getOpacity();

  return (
    <div
      onClick={onClick}
      onContextMenu={onContextMenu}
      data-testid="note-cell"
      className={`
        w-8 h-8 flex items-center justify-center border-r border-gray-300 dark:border-gray-700 cursor-pointer
        hover:bg-blue-50 dark:hover:bg-blue-900 transition-colors relative
        ${isBeat ? 'bg-gray-50 dark:bg-gray-900' : ''}
        ${isMeasureBoundary ? 'border-r-2 border-r-gray-800 dark:border-r-gray-200' : ''}
      `}
    >
      {iconPath && (
        <Image
          src={iconPath}
          alt={symbol}
          width={24}
          height={24}
          style={{ opacity }}
          className={`select-none pointer-events-none transition-opacity ${isBeat ? 'dark:invert' : ''}`}
        />
      )}
      {/* Velocity indicator (mini bar if explicit velocity exists) */}
      {velocity !== undefined && velocity > 0 && (
        <div
          className="absolute bottom-0 left-0 h-0.5 bg-blue-500 transition-all"
          style={{ width: `${velocity * 100}%` }}
        />
      )}
    </div>
  );
};
