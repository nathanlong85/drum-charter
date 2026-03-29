'use client';

import * as Dialog from '@radix-ui/react-dialog';
import { Search, X } from 'lucide-react';
import type React from 'react';
import { useEffect, useState } from 'react';
import { SnippetPreview } from '@/components/groove/SnippetPreview';
import { supabaseService } from '@/lib/services/supabase-service';
import type { GrooveSnippet } from '@/lib/types/groove';

interface SnippetPickerModalProps {
  onClose: () => void;
  onSelect: (snippet: GrooveSnippet) => void;
}

export const SnippetPickerModal: React.FC<SnippetPickerModalProps> = ({ onClose, onSelect }) => {
  const [snippets, setSnippets] = useState<GrooveSnippet[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSnippets = async () => {
      try {
        setIsLoading(true);
        const data = await supabaseService.listGrooveSnippetsMapped();
        setSnippets(data);
      } catch (err) {
        console.error('Failed to fetch snippets:', err);
        setError('Failed to load snippets from library.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSnippets();
  }, []);

  const filteredSnippets = snippets.filter((s) => {
    const matchesSearch = s.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTags = s.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesSearch || matchesTags;
  });

  return (
    <Dialog.Root open onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200" />
        <Dialog.Content
          className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 bg-surface-container-low rounded-3xl shadow-3xl w-full max-w-4xl max-h-[85vh] border border-outline-variant/10 animate-in zoom-in-95 duration-200 overflow-hidden flex flex-col"
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <div className="flex items-center justify-between p-6 border-b border-outline-variant/10 bg-surface-container">
            <div className="flex flex-col">
              <Dialog.Title className="text-xl font-headline font-black text-on-surface uppercase tracking-tight">
                Insert Snippet
              </Dialog.Title>
              <p className="text-[10px] font-headline font-bold text-on-surface-variant/40 uppercase tracking-[0.2em] mt-1">
                Select a pattern from your library
              </p>
            </div>
            <Dialog.Close
              className="p-2 hover:bg-surface-container-highest text-on-surface-variant/60 hover:text-on-surface rounded-full transition-all"
              aria-label="Close"
            >
              <X size={20} />
            </Dialog.Close>
          </div>

          <div className="p-6 bg-surface-container-lowest/50 border-b border-outline-variant/5">
            <div className="relative">
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/40"
                size={18}
              />
              <input
                type="text"
                placeholder="Search by title or tag..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-surface-container-highest border border-transparent focus:border-primary/30 rounded-2xl text-on-surface placeholder:text-on-surface-variant/20 outline-none transition-all font-headline font-bold"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-surface-container-low">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-20 animate-pulse">
                <div className="w-12 h-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin mb-4" />
                <p className="text-[10px] font-headline font-black text-on-surface-variant/40 uppercase tracking-widest">
                  Accessing Library...
                </p>
              </div>
            ) : error ? (
              <div className="p-8 text-center bg-error/5 border border-error/10 rounded-2xl">
                <p className="text-error font-headline font-bold text-sm uppercase tracking-wider">
                  {error}
                </p>
              </div>
            ) : filteredSnippets.length === 0 ? (
              <div className="py-20 text-center">
                <p className="text-on-surface-variant/40 font-headline font-black uppercase tracking-widest text-sm">
                  No snippets found
                </p>
                <p className="text-[10px] font-body text-on-surface-variant/30 mt-2">
                  Try a different search term or create some snippets first.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6">
                {filteredSnippets.map((snippet) => (
                  <button
                    key={snippet.id}
                    type="button"
                    onClick={() => onSelect(snippet)}
                    aria-label={`Select snippet: ${snippet.title}`}
                    className="text-left group bg-surface-container-lowest border border-outline-variant/10 rounded-2xl overflow-hidden hover:border-primary/40 hover:shadow-xl hover:-translate-y-1 transition-all focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
                  >
                    <div className="p-4 border-b border-outline-variant/5 flex justify-between items-center group-hover:bg-primary/5 transition-colors">
                      <div>
                        <h3 className="text-lg font-headline font-black text-on-surface uppercase tracking-tight group-hover:text-primary transition-colors">
                          {snippet.title}
                        </h3>
                        <div className="flex gap-2 mt-1">
                          {snippet.tags.map((tag) => (
                            <span
                              key={tag}
                              className="text-[9px] font-headline font-bold text-on-surface-variant/40 uppercase tracking-widest"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="text-[9px] font-headline font-black text-primary px-3 py-1 bg-primary/10 rounded-full opacity-0 group-hover:opacity-100 transition-all uppercase tracking-widest">
                        Insert Pattern
                      </div>
                    </div>
                    <div className="p-6 pointer-events-none transform scale-[0.85] origin-top-left -mb-12">
                      <SnippetPreview
                        grid={{
                          timeSignature: snippet.timeSignature,
                          resolution: snippet.resolution,
                          measures: snippet.measures,
                          instruments: snippet.instruments,
                          playbackOptionalHits: snippet.playbackOptionalHits,
                        }}
                      />
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="p-6 border-t border-outline-variant/10 bg-surface-container flex justify-end">
            <Dialog.Close asChild>
              <button
                type="button"
                className="px-8 py-3 text-[10px] font-headline font-black uppercase tracking-widest text-on-surface-variant hover:bg-surface-container-highest rounded-xl transition-all border border-outline-variant/10"
              >
                Cancel
              </button>
            </Dialog.Close>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
