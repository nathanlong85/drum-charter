'use client';

import { Copy, Files as DuplicateIcon, ExternalLink, Play, Printer, Trash2 } from 'lucide-react';
import type React from 'react';

interface EditorToolbarProps {
  type: 'song' | 'snippet' | 'notebook' | 'setlist';
  id: string;
  isPublic: boolean;
  onTogglePublic: () => void;
  onDuplicate?: () => void;
  onDelete: () => void;
  onGoLive?: () => void;
}

export const EditorToolbar: React.FC<EditorToolbarProps> = ({
  type,
  id,
  isPublic,
  onTogglePublic,
  onDuplicate,
  onDelete,
  onGoLive,
}) => {
  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/public/${type}s/${id}`);
      alert('Public link copied to clipboard!');
    } catch (_err) {
      alert(`Failed to copy link. Here it is: ${window.location.origin}/public/${type}s/${id}`);
    }
  };

  const btnClass =
    'flex items-center gap-2 bg-surface-container-highest text-on-surface-variant px-3 md:px-4 py-2 rounded-lg font-bold hover:bg-surface-bright transition-all text-[10px] md:text-[11px] uppercase tracking-widest shadow-sm';
  const primaryBtnClass =
    'flex items-center gap-2 bg-primary text-on-primary px-4 md:px-6 py-2 rounded-lg font-black hover:bg-primary-dim transition-all text-[11px] md:text-xs shadow-lg shadow-primary/20 uppercase tracking-tighter';
  const deleteBtnClass =
    'flex items-center gap-2 bg-surface-container-highest text-error px-3 md:px-4 py-2 rounded-lg font-bold hover:bg-error/10 transition-all text-[10px] md:text-[11px] uppercase tracking-widest shadow-sm';
  const toggleBtnClass = (active: boolean) =>
    `flex items-center gap-2 px-3 md:px-4 py-2 rounded-lg font-bold transition-all text-[10px] md:text-[11px] uppercase tracking-widest shadow-sm ${
      active
        ? 'bg-primary/10 text-primary border border-primary/20'
        : 'bg-surface-container-highest text-on-surface-variant/50 border border-transparent'
    }`;

  return (
    <div className="sticky top-16 right-0 p-3 md:p-4 no-print flex flex-wrap justify-between items-center gap-3 z-30 bg-surface/80 backdrop-blur-md border-b border-outline-variant/10 shadow-sm">
      {/* Secondary Actions Group */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={onTogglePublic}
          className={toggleBtnClass(isPublic)}
          data-testid="toggle-public-button"
          title={isPublic ? 'Make Private' : 'Make Public'}
          role="switch"
          aria-checked={isPublic}
        >
          <div
            className={`w-1.5 h-1.5 rounded-full ${isPublic ? 'bg-primary animate-pulse' : 'bg-on-surface-variant/30'}`}
          />
          <span>{isPublic ? 'Public' : 'Private'}</span>
        </button>

        <div className="w-[1px] h-4 bg-outline-variant/20 mx-1 hidden sm:block" />

        {isPublic && (
          <>
            <button
              onClick={copyLink}
              className={btnClass}
              title="Copy Public Link"
              aria-label="Copy Public Link"
            >
              <Copy size={14} className="md:w-4 md:h-4" />
              <span className="hidden sm:inline">Copy Link</span>
            </button>
            <a
              href={`/public/${type}s/${id}`}
              target="_blank"
              className={btnClass}
              rel="noopener noreferrer"
              title="View Public Page"
              aria-label="View Public Page"
            >
              <ExternalLink size={14} className="md:w-4 md:h-4" />
              <span className="hidden sm:inline">View Public</span>
            </a>
          </>
        )}
        {onDuplicate && (
          <button
            onClick={onDuplicate}
            className={btnClass}
            title="Duplicate This Item"
            aria-label="Duplicate This Item"
          >
            <DuplicateIcon size={14} className="md:w-4 md:h-4" />
            <span className="hidden sm:inline">Duplicate</span>
          </button>
        )}
        <button
          onClick={onDelete}
          className={deleteBtnClass}
          title="Delete This Item"
          aria-label="Delete This Item"
        >
          <Trash2 size={14} className="md:w-4 md:h-4" />
          <span className="hidden sm:inline">Delete</span>
        </button>
      </div>

      {/* Primary Actions Group */}
      <div className="flex items-center gap-2 md:gap-3">
        {onGoLive && (
          <button
            onClick={onGoLive}
            data-testid="go-live-button"
            className={primaryBtnClass}
            title="Start Live Mode"
            aria-label="Start Live Mode"
          >
            <Play size={16} className="fill-current" />
            <span>GO LIVE</span>
          </button>
        )}
        <button
          onClick={() => window.print()}
          className={`${btnClass} text-on-surface !bg-surface-container-highest hover:!bg-surface-bright`}
          title="Print Version"
          aria-label="Print Version"
        >
          <Printer size={14} className="md:w-4 md:h-4" />
          <span className="hidden sm:inline">PRINT</span>
        </button>
      </div>
    </div>
  );
};
