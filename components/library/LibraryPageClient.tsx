'use client';

import { Filter, Plus, Search } from 'lucide-react';
import { useState } from 'react';
import {
  createItemAction,
  deleteItemAction,
  duplicateItemAction,
} from '@/lib/actions/item-actions';
import { LibraryCard } from './LibraryCard';

type ItemType = 'song' | 'notebook' | 'snippet' | 'setlist';

export interface LibraryItemData {
  id: string;
  title: string;
  bpm?: number | null;
  tags?: string[] | null;
  created_at?: string | null;
  updated_at?: string | null;
  createdAt?: string | null;
}

interface LibraryPageClientProps {
  initialItems: LibraryItemData[];
  type: ItemType;
}

export default function LibraryPageClient({ initialItems, type }: LibraryPageClientProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [items, setItems] = useState(initialItems);
  const [isCreating, setIsCreating] = useState(false);

  const allAvailableTags = Array.from(
    new Set([
      ...items.flatMap((item) =>
        (item.tags || []).map((t: string) => t.trim().toLowerCase()).filter(Boolean),
      ),
    ]),
  ).sort();

  const toggleTag = (tag: string) => {
    const normalizedTag = tag.trim().toLowerCase();
    setSelectedTags((prev) => {
      const normalizedPrev = prev.map((t) => t.trim().toLowerCase());
      return normalizedPrev.includes(normalizedTag)
        ? normalizedPrev.filter((t) => t !== normalizedTag)
        : [...normalizedPrev, normalizedTag];
    });
  };

  const handleDelete = async (id: string, type: ItemType) => {
    if (!confirm(`Are you sure you want to delete this ${type}?`)) {
      return;
    }

    try {
      const result = await deleteItemAction(id, type);
      if (result.success) {
        setItems((prev) => prev.filter((item) => item.id !== id));
      }
    } catch (error) {
      console.error('Error deleting item:', error);
      alert('Failed to delete item.');
    }
  };

  const handleDuplicate = async (id: string, type: ItemType) => {
    try {
      const result = await duplicateItemAction(id, type);
      if (result.success && result.data) {
        const row = result.data as any;
        const duplicated: LibraryItemData = {
          id: row.id,
          title: row.title,
          bpm: row.bpm || undefined,
          tags: row.tags || [],
          createdAt: row.created_at || new Date().toISOString(),
        };
        setItems((prev) => [duplicated, ...prev]);
      }
    } catch (error) {
      console.error('Error duplicating item:', error);
      alert('Failed to duplicate item.');
    }
  };

  const filterItems = (items: LibraryItemData[]) => {
    return items.filter((item) => {
      const normalizedItemTags = (item.tags || [])
        .map((t: string) => t.trim().toLowerCase())
        .filter(Boolean);

      const titleMatch = (item.title || '')
        .toLowerCase()
        .includes(searchQuery.trim().toLowerCase());
      const queryTagMatch = normalizedItemTags.some((tag: string) =>
        tag.includes(searchQuery.trim().toLowerCase()),
      );

      const selectedTagsMatch =
        selectedTags.length === 0 || selectedTags.every((tag) => normalizedItemTags.includes(tag));

      return (titleMatch || queryTagMatch) && selectedTagsMatch;
    });
  };

  const currentItems = filterItems(items);

  const handleCreateNew = async () => {
    try {
      setIsCreating(true);
      await createItemAction(type);
    } catch (error) {
      if (error instanceof Error && error.message === 'NEXT_REDIRECT') {
        throw error;
      }
      console.error('Failed to create item:', error);
      alert('Failed to create item. Please try again.');
      setIsCreating(false);
    }
  };

  return (
    <div className="space-y-10 antialiased font-body animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex gap-4 w-full md:w-auto">
          <div className="relative group flex-1 md:flex-none">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/40 w-4 h-4 transition-colors group-focus-within:text-primary" />
            <input
              type="text"
              placeholder={`SEARCH ${type.toUpperCase()}S...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              data-testid="search-library-input"
              className="bg-surface-container-low border border-outline-variant/10 text-[10px] font-label font-bold tracking-[0.2em] w-full md:w-64 pl-12 pr-6 py-3.5 rounded-full focus:ring-1 focus:ring-primary/40 text-on-surface placeholder:text-on-surface-variant/30 outline-none transition-all shadow-sm"
            />
          </div>
          <button
            onClick={handleCreateNew}
            disabled={isCreating}
            data-testid="create-new-button"
            className="bg-primary text-on-primary font-headline text-[11px] font-black tracking-[0.2em] uppercase px-8 py-3.5 rounded-full shadow-[0_8px_25px_var(--color-primary-dim)] hover:translate-y-[-2px] hover:shadow-[0_12px_30px_var(--color-primary-dim)] transition-all flex items-center gap-3 active:translate-y-[1px] disabled:opacity-50"
          >
            <Plus className="w-5 h-5 stroke-[3px]" />
            NEW {type.toUpperCase()}
          </button>
        </div>
      </div>

      {allAvailableTags.length > 0 && (
        <div className="flex flex-wrap gap-2.5 items-center p-4 bg-surface-container-lowest/50 rounded-2xl border border-outline-variant/5">
          <Filter className="w-3.5 h-3.5 text-primary/60 mr-2" />
          {allAvailableTags.map((tag) => {
            const isActive = selectedTags.includes(tag);
            return (
              <button
                key={tag}
                onClick={() => toggleTag(tag)}
                aria-label={`Filter by ${tag} tag`}
                data-testid={`tag-filter-${tag}`}
                className={`px-4 py-1.5 rounded-lg text-[9px] font-label font-black uppercase tracking-[0.25em] transition-all duration-300 ${
                  isActive
                    ? 'bg-primary text-on-primary shadow-md scale-105'
                    : 'bg-surface-container-highest/50 text-on-surface-variant/60 hover:bg-surface-container-highest hover:text-on-surface border border-outline-variant/10'
                }`}
              >
                {tag}
              </button>
            );
          })}
          {selectedTags.length > 0 && (
            <button
              onClick={() => setSelectedTags([])}
              className="text-[9px] font-label font-black text-error hover:text-error-dim uppercase tracking-[0.25em] ml-4 hover:underline underline-offset-4"
            >
              RESET FILTERS
            </button>
          )}
        </div>
      )}

      {/* Grid */}
      <section className="space-y-8">
        <div className="flex items-center gap-4">
          <div className="w-8 h-[2px] bg-primary/20" />
          <h3 className="font-headline font-black text-sm tracking-[0.3em] uppercase text-on-surface-variant/40">
            {type}s Index
          </h3>
          <div className="flex-1 h-[1px] bg-outline-variant/10" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <button
            onClick={handleCreateNew}
            disabled={isCreating}
            className="aspect-[4/3] bg-surface-container-lowest flex flex-col items-center justify-center p-8 rounded-2xl border-2 border-dashed border-outline-variant/20 hover:border-primary/40 hover:bg-surface-container-low transition-all group shadow-sm active:scale-[0.98] disabled:opacity-50"
          >
            <div className="w-16 h-16 bg-surface-container-highest/50 rounded-full flex items-center justify-center mb-6 group-hover:bg-primary/10 group-hover:text-primary transition-all duration-500 text-on-surface-variant/30">
              <Plus className="w-8 h-8 stroke-[1.5px] group-hover:rotate-90 transition-transform duration-500" />
            </div>
            <span className="text-[10px] font-label font-black tracking-[0.3em] uppercase text-on-surface-variant/40 group-hover:text-primary transition-colors">
              ADD NEW {type.toUpperCase()}
            </span>
          </button>

          {currentItems.map((item) => (
            <LibraryCard
              key={item.id}
              item={{
                id: item.id,
                title: item.title,
                type: type,
                bpm: item.bpm ?? undefined,
                tags: item.tags ?? undefined,
                createdAt: item.created_at || item.createdAt || '',
              }}
              onDelete={handleDelete}
              onDuplicate={handleDuplicate}
            />
          ))}
        </div>
      </section>

      {currentItems.length === 0 && (searchQuery || selectedTags.length > 0) && (
        <div className="text-center py-20 bg-surface-container rounded-xl">
          <p className="text-on-surface-variant font-headline tracking-widest text-sm uppercase">
            {searchQuery
              ? `No results found for "${searchQuery}"`
              : 'No results found for selected tags'}
          </p>
        </div>
      )}
    </div>
  );
}
