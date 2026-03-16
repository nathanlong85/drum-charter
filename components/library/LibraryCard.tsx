import type React from 'react';
import { formatDate } from '@/lib/utils/format';

interface LibraryCardProps {
  item: {
    id: string;
    title: string;
    type: 'song' | 'notebook' | 'snippet';
    bpm?: number;
    tags?: string[];
    createdAt: string;
  };
  onDelete: (id: string, type: 'song' | 'notebook' | 'snippet') => void;
  onDuplicate: (id: string, type: 'song' | 'notebook' | 'snippet') => void;
}

export const LibraryCard: React.FC<LibraryCardProps> = ({ item, onDelete, onDuplicate }) => {
  const typeLabels = {
    song: { label: 'Song', color: 'bg-blue-100 text-blue-800' },
    notebook: { label: 'Notebook', color: 'bg-purple-100 text-purple-800' },
    snippet: { label: 'Snippet', color: 'bg-amber-100 text-amber-800' },
  };

  return (
    <div className="group relative bg-white border border-zinc-200 rounded-lg p-5 shadow-sm hover:shadow-md transition-all hover:border-blue-200">
      <div className="flex justify-between items-start mb-3">
        <span
          className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full ${typeLabels[item.type].color}`}
        >
          {typeLabels[item.type].label}
        </span>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all z-10">
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onDuplicate(item.id, item.type);
            }}
            className="p-1.5 text-zinc-400 hover:text-blue-500 transition-all rounded-md hover:bg-blue-50"
            title="Duplicate"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2"
              />
            </svg>
          </button>
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onDelete(item.id, item.type);
            }}
            className="p-1.5 text-zinc-400 hover:text-red-500 transition-all rounded-md hover:bg-red-50"
            title="Delete"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </button>
        </div>
      </div>

      <h3 className="text-lg font-bold text-zinc-900 mb-1 line-clamp-1 pr-6 group-hover:text-blue-600 transition-colors">
        {item.title}
      </h3>

      <div className="flex flex-wrap gap-3 items-center text-sm text-zinc-500 mb-4">
        {item.bpm && (
          <div className="flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            {item.bpm} BPM
          </div>
        )}
        <div className="flex items-center gap-1">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          {formatDate(item.createdAt)}
        </div>
      </div>

      {item.tags && item.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-auto pt-2 border-t border-zinc-50">
          {item.tags.map((tag) => (
            <span key={tag} className="text-[11px] text-zinc-400 font-medium">
              #{tag}
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
