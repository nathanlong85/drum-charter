'use client';

import { useState } from 'react';
import { LibraryCard } from './LibraryCard';
import { supabaseService } from '@/lib/services/supabase-service';
import { Notebook, GrooveSnippet, SongChart } from '@/lib/types/groove';
import { createClient } from '@/lib/supabase/client';

const supabase = createClient();

type ItemType = 'song' | 'notebook' | 'snippet';

interface LibraryDashboardProps {
  initialSongs: any[];
  initialNotebooks: any[];
  initialSnippets: any[];
}

export default function LibraryDashboard({
  initialSongs,
  initialNotebooks,
  initialSnippets,
}: LibraryDashboardProps) {
  const [activeTab, setActiveTab] = useState<ItemType>('song');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [songs, setSongs] = useState(initialSongs);
  const [notebooks, setNotebooks] = useState(initialNotebooks);
  const [snippets, setSnippets] = useState(initialSnippets);

  const allAvailableTags = Array.from(new Set([
    ...songs.flatMap(s => (s.tags || []).map((t: string) => t.trim().toLowerCase()).filter(Boolean)),
    ...notebooks.flatMap(n => (n.tags || []).map((t: string) => t.trim().toLowerCase()).filter(Boolean)),
    ...snippets.flatMap(s => (s.tags || []).map((t: string) => t.trim().toLowerCase()).filter(Boolean))
  ])).sort();

  const toggleTag = (tag: string) => {
    const normalizedTag = tag.trim().toLowerCase();
    setSelectedTags(prev => {
      const normalizedPrev = prev.map(t => t.trim().toLowerCase());
      return normalizedPrev.includes(normalizedTag) 
        ? normalizedPrev.filter(t => t !== normalizedTag) 
        : [...normalizedPrev, normalizedTag];
    });
  };

  const handleDelete = async (id: string, type: ItemType) => {
    if (!confirm(`Are you sure you want to delete this ${type}?`)) return;

    try {
      if (type === 'song') {
        await supabaseService.deleteSongChart(id);
        setSongs(songs.filter((s) => s.id !== id));
      } else if (type === 'notebook') {
        await supabaseService.deleteNotebook(id);
        setNotebooks(notebooks.filter((n) => n.id !== id));
      } else if (type === 'snippet') {
        await supabaseService.deleteGrooveSnippet(id);
        setSnippets(snippets.filter((s) => s.id !== id));
      }
    } catch (error) {
      console.error('Error deleting item:', error);
      alert('Failed to delete item.');
    }
  };

  const handleDuplicate = async (id: string, type: ItemType) => {
    try {
      let duplicated;
      if (type === 'song') {
        duplicated = await supabaseService.duplicateSongChart(id);
        setSongs([duplicated, ...songs]);
      } else if (type === 'notebook') {
        duplicated = await supabaseService.duplicateNotebook(id);
        setNotebooks([duplicated, ...notebooks]);
      } else if (type === 'snippet') {
        duplicated = await supabaseService.duplicateGrooveSnippet(id);
        setSnippets([duplicated, ...snippets]);
      }
      
      // Optional: redirect to the new item
      // window.location.href = `/${type}s/${duplicated.id}`;
    } catch (error) {
      console.error('Error duplicating item:', error);
      alert('Failed to duplicate item.');
    }
  };

  const filterItems = (items: any[]) => {
    return items.filter((item) => {
      const normalizedItemTags = (item.tags || [])
        .map((t: string) => t.trim().toLowerCase())
        .filter(Boolean);
        
      const titleMatch = (item.title || '').toLowerCase().includes(searchQuery.trim().toLowerCase());
      const queryTagMatch = normalizedItemTags.some((tag: string) =>
        tag.includes(searchQuery.trim().toLowerCase())
      );
      
      const selectedTagsMatch = selectedTags.length === 0 || 
        selectedTags.every(tag => 
          normalizedItemTags.includes(tag.trim().toLowerCase())
        );

      return (titleMatch || queryTagMatch) && selectedTagsMatch;
    });
  };

  const tabs = [
    { id: 'song', label: 'Song Charts', count: songs.length },
    { id: 'notebook', label: 'Notebooks', count: notebooks.length },
    { id: 'snippet', label: 'Snippets', count: snippets.length },
  ];

  const currentItems = 
    activeTab === 'song' ? filterItems(songs) :
    activeTab === 'notebook' ? filterItems(notebooks) :
    filterItems(snippets);

  const handleCreateNew = async () => {
    try {
      // Get current user to avoid RLS violation 42501
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        console.error('Authentication required to create items:', authError);
        alert('Please log in or continue as a guest to create items.');
        return;
      }

      const userId = user.id;
      console.log('Creating new item...', { activeTab, userId });

      if (activeTab === 'song') {
        const newSong: Partial<SongChart> = {
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
        };
        const saved = await supabaseService.saveSongChart(newSong as SongChart);
        if (saved && saved.id) {
          console.log('Created song:', saved.id);
          // Wait briefly for local sync before redirecting
          setTimeout(() => {
            window.location.href = `/songs/${saved.id}`;
          }, 500);
        } else {
          throw new Error('Song creation failed - no ID returned');
        }
      } else if (activeTab === 'notebook') {
        const newNotebook: Partial<Notebook> = {
          userId,
          title: 'Untitled Notebook',
          sections: [],
          tags: [],
          isPublic: false,
        };
        const saved = await supabaseService.saveNotebook(newNotebook as Notebook);
        if (saved && saved.id) {
          console.log('Created notebook:', saved.id);
          // Wait briefly for local sync before redirecting
          setTimeout(() => {
            window.location.href = `/notebooks/${saved.id}`;
          }, 500);
        } else {
          throw new Error('Notebook creation failed - no ID returned');
        }
      } else if (activeTab === 'snippet') {
        const newSnippet: Partial<GrooveSnippet> = {
          userId,
          title: 'Untitled Snippet',
          tags: [],
          isPublic: false,
          timeSignature: { beatsPerMeasure: 4, beatValue: 4 },
          resolution: 16,
          measures: 1,
          instruments: [
            { instrumentId: 'kick', label: 'Kick', notes: Array(16).fill('none') },
            { instrumentId: 'snare', label: 'Snare', notes: Array(16).fill('none') },
            { instrumentId: 'hihat', label: 'Hi-Hat', notes: Array(16).fill('none') },
          ],
        };
        const saved = await supabaseService.saveGrooveSnippet(newSnippet as GrooveSnippet);
        if (saved && saved.id) {
          console.log('Created snippet:', saved.id);
          // Wait briefly for local sync before redirecting
          setTimeout(() => {
            window.location.href = `/snippets/${saved.id}`;
          }, 500);
        } else {
          throw new Error('Snippet creation failed - no ID returned');
        }
      }
    } catch (error: any) {
      console.error('Error creating new item:', {
        message: error.message || error,
        details: error.details,
        hint: error.hint,
        code: error.code,
        fullError: error
      });
      alert('Failed to create new item. Check console for details.');
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex bg-zinc-100 p-1 rounded-lg">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as ItemType)}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
                  activeTab === tab.id
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-zinc-500 hover:text-zinc-700'
                }`}
              >
                {tab.label}
                <span className="ml-2 px-1.5 py-0.5 text-[10px] bg-zinc-200 text-zinc-600 rounded-full">
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-64">
            <form 
              role="search" 
              aria-label="Library search"
              onSubmit={(e) => e.preventDefault()}
            >
              <input
                type="text"
                placeholder="Search by title or tag..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                aria-label="Search library by title or tag"
                className="w-full pl-10 pr-4 py-2 bg-white border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
            </form>
            <svg
              className="absolute left-3 top-2.5 w-4 h-4 text-zinc-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>

        {allAvailableTags.length > 0 && (
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-[10px] font-black uppercase text-zinc-400 tracking-widest mr-2">Filter by Tags:</span>
            {allAvailableTags.map(tag => {
              const isActive = selectedTags.includes(tag);
              return (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  aria-pressed={isActive}
                  aria-label={`Filter by ${tag} tag`}
                  className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-tighter transition-all ${
                    isActive
                      ? 'bg-zinc-800 text-white shadow-md scale-105'
                      : 'bg-zinc-100 text-zinc-500 hover:bg-zinc-200'
                  }`}
                >
                  {tag}
                </button>
              );
            })}
            {selectedTags.length > 0 && (
              <button
                onClick={() => setSelectedTags([])}
                className="text-[10px] font-bold text-blue-600 hover:text-blue-800 uppercase tracking-widest ml-2"
              >
                Clear Filters
              </button>
            )}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <button
          onClick={handleCreateNew}
          className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-zinc-200 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-all group"
        >
          <div className="w-12 h-12 bg-zinc-100 rounded-full flex items-center justify-center mb-3 group-hover:bg-blue-100">
            <svg className="w-6 h-6 text-zinc-400 group-hover:text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
          </div>
          <span className="text-sm font-semibold text-zinc-500 group-hover:text-blue-600">
            New {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
          </span>
        </button>

        {currentItems.map((item) => (
          <LibraryCard
            key={item.id}
            item={{
              id: item.id,
              title: item.title,
              type: activeTab,
              bpm: item.bpm,
              tags: item.tags,
              createdAt: item.created_at || item.createdAt,
            }}
            onDelete={handleDelete}
            onDuplicate={handleDuplicate}
          />
        ))}
      </div>

      {currentItems.length === 0 && searchQuery && (
        <div className="text-center py-12">
          <p className="text-zinc-400">No results found for &quot;{searchQuery}&quot;</p>
        </div>
      )}
    </div>
  );
}
