'use client';

import type React from 'react';
import { type DrumSymbol, symbolLabels } from '@/lib/types/groove';
import { Tooltip } from '../common/Tooltip';

interface NoteCellProps {
  symbol: DrumSymbol;
  velocity?: number;
  onClick: (e: React.MouseEvent) => void;
  onContextMenu: (e: React.MouseEvent) => void;
  onMouseDown?: (e: React.MouseEvent) => void;
  onMouseEnter?: (e: React.MouseEvent) => void;
  isBeat?: boolean;
  isMeasureBoundary?: boolean;
  isSelected?: boolean;
  readOnly?: boolean;
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

export const NoteCell: React.FC<NoteCellProps> = ({
  symbol,
  velocity,
  onClick,
  onContextMenu,
  onMouseDown,
  onMouseEnter,
  isBeat,
  isMeasureBoundary,
  isSelected,
  readOnly = false,
}) => {
  const iconPath = symbolToIcon[symbol];

  // Visual feedback for velocity (opacity)
  const getOpacity = () => {
    if (velocity !== undefined && velocity > 0) {
      return Math.max(0.2, velocity);
    }
    if (symbol.includes('accent')) return 1.0;
    if (symbol.includes('ghost')) return 0.4;
    return 0.8; // standard
  };

  const opacity = getOpacity();

  const content = (
    <div className="w-full h-full flex items-center justify-center pointer-events-none">
      {iconPath && (
        <div className="w-full h-full flex items-center justify-center pointer-events-none select-none animate-in zoom-in-50 duration-200">
          {/* biome-ignore lint/performance/noImgElement: intentional for E2E reliability (SVG transitions caused flakes) */}
          <img
            src={iconPath}
            alt={symbol}
            data-testid="note-cell-icon"
            style={{ opacity }}
            className="w-7 h-7 select-none pointer-events-none filter drop-shadow-sm"
          />
        </div>
      )}

      {/* Beat highlight dot */}
      {isBeat && symbol === 'none' && (
        <div className="w-1 h-1 rounded-full bg-on-surface-variant/10" />
      )}

      {/* Velocity indicator (mini bar if explicit velocity exists) */}
      {velocity !== undefined && velocity > 0 && (
        <div
          className="absolute bottom-0 left-0 h-0.5 bg-primary/40 transition-all"
          style={{ width: `${Math.min(1, velocity) * 100}%` }}
        />
      )}
    </div>
  );

  const containerClasses = `
    note-cell w-10 h-10 flex items-center justify-center border-r border-outline-variant/10 
    transition-all relative select-none
    ${readOnly ? 'cursor-default' : 'cursor-pointer hover:bg-primary/5'}
    ${isBeat ? 'bg-surface-container-high/40' : 'bg-surface-container-low/20'}
    ${isMeasureBoundary ? 'border-r-2 border-r-outline-variant/30' : ''}
    ${isSelected && !readOnly ? 'bg-primary/20 ring-1 ring-primary ring-inset z-10' : ''}
  `;

  if (readOnly || symbol === 'none') {
    return (
      <div
        onClick={readOnly ? undefined : onClick}
        onContextMenu={readOnly ? (e) => e.preventDefault() : onContextMenu}
        onMouseDown={readOnly ? undefined : onMouseDown}
        onMouseEnter={readOnly ? undefined : onMouseEnter}
        data-testid="note-cell"
        data-selected={isSelected ? 'true' : 'false'}
        className={containerClasses}
      >
        {content}
      </div>
    );
  }

  return (
    <Tooltip content={symbolLabels[symbol]} side="top">
      <button
        type="button"
        onClick={onClick}
        onContextMenu={onContextMenu}
        onMouseDown={onMouseDown}
        onMouseEnter={onMouseEnter}
        data-testid="note-cell"
        data-selected={isSelected ? 'true' : 'false'}
        className={`${containerClasses} appearance-none bg-transparent p-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset rounded-sm`}
        aria-label={symbolLabels[symbol]}
      >
        {content}
      </button>
    </Tooltip>
  );
};
