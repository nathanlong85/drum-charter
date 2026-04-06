import {
  Activity,
  Clock,
  Copy,
  FileText,
  Hash,
  Library,
  ListMusic,
  Music,
  Trash2,
} from 'lucide-react';
import type React from 'react';
import { formatDate } from '@/lib/utils/format';

interface LibraryCardProps {
  item: {
    id: string;
    title: string;
    type: 'song' | 'notebook' | 'snippet' | 'setlist';
    bpm?: number;
    tags?: string[];
    createdAt: string;
  };
  onDelete?: (id: string, type: 'song' | 'notebook' | 'snippet' | 'setlist') => void;
  onDuplicate?: (id: string, type: 'song' | 'notebook' | 'snippet' | 'setlist') => void;
}

export const LibraryCard: React.FC<LibraryCardProps> = ({ item, onDelete, onDuplicate }) => {
  const typeIcons = {
    song: Music,
    notebook: FileText,
    snippet: Library,
    setlist: ListMusic,
  };
  const Icon = typeIcons[item.type];

  return (
    <div
      data-testid="library-card"
      className="group relative bg-surface-container-lowest rounded-2xl p-6 hover:bg-surface-container-low transition-all duration-300 cursor-pointer overflow-hidden border border-outline-variant/10 hover:border-primary/20 hover:shadow-2xl shadow-sm"
    >
      <div className="absolute top-0 left-0 w-1.5 h-full bg-primary/20 group-hover:bg-primary transition-colors" />

      <div className="flex justify-between items-start mb-8">
        <div className="flex items-center gap-2 text-on-surface-variant/60">
          <Icon className="w-4 h-4 text-primary/60 group-hover:text-primary transition-colors" />
          <span className="text-[10px] font-label tracking-[0.3em] uppercase font-black">
            {item.type}
          </span>
        </div>

        {(onDuplicate || onDelete) && (
          <div className="flex gap-2 z-10 opacity-100 translate-y-0 md:opacity-0 md:group-hover:opacity-100 md:group-focus-within:opacity-100 md:translate-y-2 md:group-hover:translate-y-0 md:group-focus-within:translate-y-0 transition-all duration-300">
            {onDuplicate && (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onDuplicate(item.id, item.type);
                }}
                className="p-2 text-on-surface-variant/40 hover:text-primary focus-visible:text-primary transition-all rounded-lg hover:bg-primary/10 focus-visible:bg-primary/10 border border-transparent hover:border-primary/20 focus-visible:border-primary/20 outline-none"
                title="Duplicate"
                data-testid={`duplicate-${item.type}-${item.id}`}
                aria-label={`Duplicate ${item.type}: ${item.title}`}
                type="button"
              >
                <Copy className="w-4 h-4" />
              </button>
            )}
            {onDelete && (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onDelete(item.id, item.type);
                }}
                className="p-2 text-on-surface-variant/40 hover:text-error focus-visible:text-error transition-all rounded-lg hover:bg-error/10 focus-visible:bg-error/10 border border-transparent hover:border-error/20 focus-visible:border-error/20 outline-none"
                title="Delete"
                data-testid={`delete-${item.type}-${item.id}`}
                aria-label={`Delete ${item.type}: ${item.title}`}
                type="button"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        )}
      </div>

      <h3 className="text-xl font-headline font-black text-on-surface mb-3 line-clamp-2 leading-tight group-hover:text-primary transition-colors uppercase tracking-tight">
        {item.title}
      </h3>

      <div className="flex flex-wrap gap-4 items-center mb-8">
        {item.bpm && (
          <div className="flex items-center gap-2 text-primary text-[10px] font-black font-label tracking-widest uppercase bg-primary/5 px-2 py-1 rounded-md">
            <Activity className="w-3.5 h-3.5" />
            {item.bpm} BPM
          </div>
        )}
        <div className="flex items-center gap-2 text-on-surface-variant/40 text-[9px] font-label font-bold uppercase tracking-[0.2em]">
          <Clock className="w-3.5 h-3.5 opacity-50" />
          {formatDate(item.createdAt)}
        </div>
      </div>

      {item.tags && item.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-auto">
          {item.tags.map((tag) => (
            <span
              key={tag}
              className="flex items-center gap-1.5 text-[9px] font-label font-black tracking-[0.2em] uppercase px-3 py-1.5 rounded-lg bg-surface-container-highest/50 text-on-surface-variant/60 border border-outline-variant/10 group-hover:border-primary/20 transition-colors"
            >
              <Hash className="w-3 h-3 text-primary/40" />
              {tag}
            </span>
          ))}
        </div>
      )}

      <a href={`/${item.type}s/${item.id}`} className="absolute inset-0 z-0 pointer-events-auto">
        <span className="sr-only">Open {item.title}</span>
      </a>
    </div>
  );
};
