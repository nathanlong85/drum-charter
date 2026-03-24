'use client';

import { Filter, LayoutGrid, Plus, Search } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { supabaseService } from '@/lib/services/supabase-service';
import { createClient } from '@/lib/supabase/client';
import {
  createDefaultDrumInstruments,
  type GrooveSnippet,
  type Notebook,
  type Setlist,
  type SongChart,
} from '@/lib/types/groove';
import { LibraryCard } from './LibraryCard';

const supabase = createClient();

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

interface LibraryDashboardProps {
  initialSongs: LibraryItemData[];
  initialNotebooks: LibraryItemData[];
  initialSnippets: LibraryItemData[];
  initialSetlists: LibraryItemData[];
}

interface SupabaseErrorLike {
  message: string;
  details?: string;
  hint?: string;
  code?: string;
}

function isSupabaseError(error: unknown): error is SupabaseErrorLike {
  return (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof (error as Record<string, unknown>).message === 'string'
  );
}

export default function LibraryDashboard({
  initialSongs,
  initialNotebooks,
  initialSnippets,
  initialSetlists,
}: LibraryDashboardProps) {
  const searchParams = useSearchParams();
  const router = useRouter();

  const queryTab = searchParams.get('tab') as ItemType | null;
  const [activeTab, setActiveTab] = useState<ItemType>(queryTab || 'song');

  useEffect(() => {
    if (queryTab && queryTab !== activeTab) {
      setActiveTab(queryTab);
    }
  }, [queryTab, activeTab]);

  const handleTabChange = (tab: ItemType) => {
    setActiveTab(tab);
    router.push(`/library?tab=${tab}`);
  };

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [songs, setSongs] = useState(initialSongs);
  const [notebooks, setNotebooks] = useState(initialNotebooks);
  const [snippets, setSnippets] = useState(initialSnippets);
  const [setlists, setSetlists] = useState(initialSetlists);

  const allAvailableTags = Array.from(
    new Set([
      ...songs.flatMap((s) =>
        (s.tags || []).map((t: string) => t.trim().toLowerCase()).filter(Boolean),
      ),
      ...notebooks.flatMap((n) =>
        (n.tags || []).map((t: string) => t.trim().toLowerCase()).filter(Boolean),
      ),
      ...snippets.flatMap((s) =>
        (s.tags || []).map((t: string) => t.trim().toLowerCase()).filter(Boolean),
      ),
      ...setlists.flatMap((s) =>
        (s.tags || []).map((t: string) => t.trim().toLowerCase()).filter(Boolean),
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
    if (!confirm(`Are you sure you want to delete this ${type}?`)) return;

    try {
      if (type === 'song') {
        await supabaseService.deleteSongChart(id);
        setSongs((prev) => prev.filter((s) => s.id !== id));
      } else if (type === 'notebook') {
        await supabaseService.deleteNotebook(id);
        setNotebooks((prev) => prev.filter((n) => n.id !== id));
      } else if (type === 'snippet') {
        await supabaseService.deleteGrooveSnippet(id);
        setSnippets((prev) => prev.filter((s) => s.id !== id));
      } else if (type === 'setlist') {
        await supabaseService.deleteSetlist(id);
        setSetlists((prev) => prev.filter((s) => s.id !== id));
      }
    } catch (error) {
      if (isSupabaseError(error)) {
        console.error('Error deleting item:', {
          message: error.message,
          details: error.details,
          code: error.code,
        });
      } else {
        console.error('Error deleting item:', error);
      }
      alert('Failed to delete item.');
    }
  };

  const handleDuplicate = async (id: string, type: ItemType) => {
    try {
      let duplicated: LibraryItemData;
      if (type === 'song') {
        duplicated = await supabaseService.duplicateSongChart(id);
        setSongs((prev) => [duplicated, ...prev]);
      } else if (type === 'notebook') {
        duplicated = await supabaseService.duplicateNotebook(id);
        setNotebooks((prev) => [duplicated, ...prev]);
      } else if (type === 'snippet') {
        duplicated = await supabaseService.duplicateGrooveSnippet(id);
        setSnippets((prev) => [duplicated, ...prev]);
      } else if (type === 'setlist') {
        duplicated = await supabaseService.duplicateSetlist(id);
        setSetlists((prev) => [duplicated, ...prev]);
      } else {
        throw new Error(`Unsupported type for duplication: ${type}`);
      }
    } catch (error) {
      if (isSupabaseError(error)) {
        console.error('Error duplicating item:', {
          message: error.message,
          details: error.details,
          code: error.code,
        });
      } else {
        console.error('Error duplicating item:', error);
      }
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

  const tabs = [
    { id: 'song', label: 'Song Charts', count: songs.length },
    { id: 'notebook', label: 'Notebooks', count: notebooks.length },
    { id: 'snippet', label: 'Snippets', count: snippets.length },
    { id: 'setlist', label: 'Setlists', count: setlists.length },
  ];

  const currentItems =
    activeTab === 'song'
      ? filterItems(songs)
      : activeTab === 'notebook'
        ? filterItems(notebooks)
        : activeTab === 'snippet'
          ? filterItems(snippets)
          : filterItems(setlists);

  const handleCreateNew = async () => {
    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        console.error('Authentication required to create items:', authError);
        alert('Please log in or continue as a guest to create items.');
        return;
      }

      const userId = user.id;

      if (activeTab === 'song') {
        const newSong: SongChart = {
          id: crypto.randomUUID(),
          userId,
          header: {
            title: 'Untitled Song',
            timeSignature: { beatsPerMeasure: 4, beatValue: 4 },
            metronomeEnabled: false,
            metronomeVolume: 0.5,
          },
          sections: [],
          tags: [],
          isPublic: false,
          createdAt: null,
          updatedAt: null,
        };
        const saved = await supabaseService.saveSongChart(newSong);
        if (saved?.id) window.location.assign(`/songs/${saved.id}`);
      } else if (activeTab === 'notebook') {
        const newNotebook: Notebook = {
          id: crypto.randomUUID(),
          userId,
          title: 'Untitled Notebook',
          sections: [],
          tags: [],
          isPublic: false,
          createdAt: null,
          updatedAt: null,
        };
        const saved = await supabaseService.saveNotebook(newNotebook);
        if (saved?.id) window.location.assign(`/notebooks/${saved.id}`);
      } else if (activeTab === 'snippet') {
        const newSnippet: GrooveSnippet = {
          id: crypto.randomUUID(),
          userId,
          title: 'Untitled Snippet',
          tags: [],
          isPublic: false,
          timeSignature: { beatsPerMeasure: 4, beatValue: 4 },
          resolution: 16,
          measures: 1,
          instruments: createDefaultDrumInstruments({
            timeSignature: { beatsPerMeasure: 4, beatValue: 4 },
            resolution: 16,
            measures: 1,
          }),
          createdAt: null,
          updatedAt: null,
        };
        const saved = await supabaseService.saveGrooveSnippet(newSnippet);
        if (saved?.id) window.location.assign(`/snippets/${saved.id}`);
      } else if (activeTab === 'setlist') {
        const newSetlist: Setlist = {
          id: crypto.randomUUID(),
          userId,
          title: 'Untitled Setlist',
          songs: [],
          isPublic: false,
          createdAt: null,
          updatedAt: null,
        };
        const saved = await supabaseService.saveSetlist(newSetlist);
        if (saved?.id) window.location.assign(`/setlists/${saved.id}`);
      }
    } catch (error) {
      if (isSupabaseError(error)) {
        console.error('Error creating new item:', error);
        alert(`Failed to create item: ${error.message}`);
      }
    }
  };

  return (
    <div className="space-y-8">
      {/* Controls Bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex gap-2 p-1 bg-surface-container-low rounded-xl">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id as ItemType)}
              data-testid={`tab-${tab.id}`}
              className={`px-4 py-2 text-sm font-headline font-bold uppercase tracking-widest rounded-lg transition-all ${
                activeTab === tab.id
                  ? 'bg-surface-container-highest text-primary shadow-[0_4px_12px_rgba(0,0,0,0.2)]'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              {tab.label}
              <span className="ml-2 opacity-50 text-[10px]">{tab.count}</span>
            </button>
          ))}
        </div>

        <div className="flex gap-4">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant w-4 h-4" />
            <input
              type="text"
              placeholder="FILTER LIST..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-surface-container border-none text-[10px] font-headline tracking-widest w-full md:w-64 pl-10 pr-4 py-3 rounded-full focus:ring-1 focus:ring-primary/50 text-on-surface placeholder:text-on-surface-variant/50 outline-none"
            />
          </div>
          <button
            onClick={handleCreateNew}
            className="bg-gradient-to-br from-primary to-primary-dim text-on-primary font-headline text-[11px] font-bold tracking-widest uppercase px-6 py-3 rounded-full shadow-[0_4px_20px_rgba(129,236,255,0.3)] hover:opacity-90 transition-all flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            New {activeTab}
          </button>
        </div>
      </div>

      {allAvailableTags.length > 0 && (
        <div className="flex flex-wrap gap-2 items-center">
          <Filter className="w-4 h-4 text-on-surface-variant mr-1" />
          {allAvailableTags.map((tag) => {
            const isActive = selectedTags.includes(tag);
            return (
              <button
                key={tag}
                onClick={() => toggleTag(tag)}
                className={`px-3 py-1 rounded-full text-[10px] font-headline font-bold uppercase tracking-widest transition-all ${
                  isActive
                    ? 'bg-primary/20 text-primary border border-primary/50'
                    : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
                }`}
              >
                {tag}
              </button>
            );
          })}
          {selectedTags.length > 0 && (
            <button
              onClick={() => setSelectedTags([])}
              className="text-[10px] font-headline font-bold text-error hover:text-error-dim uppercase tracking-widest ml-2"
            >
              Clear Filters
            </button>
          )}
        </div>
      )}

      {/* Grid */}
      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <LayoutGrid className="w-5 h-5 text-primary" />
          <h3 className="font-headline font-bold text-lg tracking-tight">
            Active {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}s
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <button
            onClick={handleCreateNew}
            className="aspect-[4/3] bg-surface-container flex flex-col items-center justify-center p-8 rounded-xl border border-dashed border-outline-variant/30 hover:border-primary/50 hover:bg-surface-container-high transition-all group"
          >
            <div className="w-12 h-12 bg-surface-container-highest rounded-full flex items-center justify-center mb-4 group-hover:bg-primary/10 group-hover:text-primary transition-colors text-on-surface-variant">
              <Plus className="w-6 h-6" />
            </div>
            <span className="text-xs font-headline font-bold tracking-widest uppercase text-on-surface-variant group-hover:text-primary transition-colors">
              Create New
            </span>
          </button>

          {currentItems.map((item) => (
            <LibraryCard
              key={item.id}
              item={{
                id: item.id,
                title: item.title,
                type: activeTab,
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

      {currentItems.length === 0 && searchQuery && (
        <div className="text-center py-20 bg-surface-container rounded-xl">
          <p className="text-on-surface-variant font-headline tracking-widest text-sm uppercase">
            No results found for &quot;{searchQuery}&quot;
          </p>
        </div>
      )}
    </div>
  );
}
