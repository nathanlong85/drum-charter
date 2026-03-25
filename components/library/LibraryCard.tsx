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
  onDelete: (id: string, type: 'song' | 'notebook' | 'snippet' | 'setlist') => void;
  onDuplicate: (id: string, type: 'song' | 'notebook' | 'snippet' | 'setlist') => void;
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
      className="group relative bg-surface-container rounded-xl p-6 hover:bg-surface-container-high hover:-translate-y-1 transition-all cursor-pointer overflow-hidden border border-transparent hover:border-outline-variant/30"
    >
      <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-primary to-primary-container opacity-0 group-hover:opacity-100 transition-opacity" />

      <div className="flex justify-between items-start mb-6">
        <div className="flex items-center gap-2 text-on-surface-variant">
          <Icon className="w-4 h-4 text-primary" />
          <span className="text-[10px] font-headline tracking-[0.2em] uppercase font-bold">
            {item.type}
          </span>
        </div>

        <div className="flex gap-2 z-10">
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onDuplicate(item.id, item.type);
            }}
            className="p-1.5 text-on-surface-variant hover:text-primary transition-all rounded-md hover:bg-primary/10"
            title="Duplicate"
            data-testid={`duplicate-${item.type}-${item.id}`}
            aria-label={`Duplicate ${item.type}: ${item.title}`}
            type="button"
          >
            <Copy className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onDelete(item.id, item.type);
            }}
            className="p-1.5 text-on-surface-variant hover:text-error transition-all rounded-md hover:bg-error/10"
            title="Delete"
            data-testid={`delete-${item.type}-${item.id}`}
            aria-label={`Delete ${item.type}: ${item.title}`}
            type="button"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <h3 className="text-xl font-headline font-bold text-on-surface mb-2 line-clamp-1 group-hover:text-primary transition-colors">
        {item.title}
      </h3>

      <div className="flex flex-wrap gap-4 items-center mb-6">
        {item.bpm && (
          <div className="flex items-center gap-1.5 text-primary text-xs font-bold font-headline">
            <Activity className="w-3.5 h-3.5" />
            {item.bpm} BPM
          </div>
        )}
        <div className="flex items-center gap-1.5 text-on-surface-variant text-[10px] font-headline uppercase tracking-wider">
          <Clock className="w-3 h-3" />
          {formatDate(item.createdAt)}
        </div>
      </div>

      {item.tags && item.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-auto">
          {item.tags.map((tag) => (
            <span
              key={tag}
              className="flex items-center gap-1 text-[10px] font-headline font-bold tracking-widest uppercase px-2.5 py-1 rounded-md bg-surface-container-highest text-on-surface-variant"
            >
              <Hash className="w-3 h-3 text-primary/70" />
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
