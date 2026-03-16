'use client';

import { debounce } from 'lodash';
import { useCallback, useEffect, useReducer, useRef, useState } from 'react';
import { TagInput } from '@/components/common/TagInput';
import { GrooveGridEditor } from '@/components/groove/GrooveGridEditor';
import { supabaseService } from '@/lib/services/supabase-service';
import type { GrooveGrid, GrooveSnippet } from '@/lib/types/groove';

const COMMON_DRUM_TAGS = [
  'funk',
  'jazz',
  'rock',
  'metal',
  'latin',
  'afro-cuban',
  'shuffle',
  'linear',
  'rudiment',
  'paradiddle',
  'fill',
  'groove',
  'independence',
  'double-kick',
  'ghost-notes',
  'displacement',
  'polyrhythm',
];

type SnippetAction =
  | { type: 'SET_SNIPPET'; snippet: GrooveSnippet }
  | { type: 'UPDATE_TITLE'; title: string }
  | { type: 'UPDATE_TAGS'; tags: string[] }
  | { type: 'UPDATE_PUBLIC'; isPublic: boolean }
  | { type: 'UPDATE_GRID'; grid: GrooveGrid }
  | { type: 'UPDATE_BPM'; bpm: number };

function snippetReducer(state: GrooveSnippet, action: SnippetAction): GrooveSnippet {
  switch (action.type) {
    case 'SET_SNIPPET':
      return action.snippet;
    case 'UPDATE_TITLE':
      return {
        ...state,
        title: action.title,
        updatedAt: new Date().toISOString(),
      };
    case 'UPDATE_TAGS':
      return {
        ...state,
        tags: action.tags,
        updatedAt: new Date().toISOString(),
      };
    case 'UPDATE_PUBLIC':
      return {
        ...state,
        isPublic: action.isPublic,
        updatedAt: new Date().toISOString(),
      };
    case 'UPDATE_GRID':
      return {
        ...state,
        ...action.grid,
        updatedAt: new Date().toISOString(),
      };
    case 'UPDATE_BPM':
      return { ...state, bpm: action.bpm, updatedAt: new Date().toISOString() };
    default:
      return state;
  }
}

interface SnippetEditorProps {
  initialSnippet: GrooveSnippet;
}

export default function SnippetEditor({ initialSnippet }: SnippetEditorProps) {
  const [state, dispatch] = useReducer(snippetReducer, initialSnippet);
  const [isSaving, setIsSaving] = useState(false);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const debouncedSave = useCallback(
    debounce(async (snippet: GrooveSnippet) => {
      if (!isMountedRef.current) return;
      setIsSaving(true);
      try {
        await supabaseService.saveGrooveSnippet(snippet);
      } catch (error) {
        console.error('Failed to auto-save snippet:', error);
      } finally {
        if (isMountedRef.current) {
          setIsSaving(false);
        }
      }
    }, 2000),
    [],
  );

  const isInitialRender = useRef(true);

  useEffect(() => {
    if (isInitialRender.current) {
      isInitialRender.current = false;
      return;
    }

    setIsSaving(true);
    debouncedSave(state);
  }, [state, debouncedSave]);

  // Separate cleanup effect that only runs on unmount
  useEffect(() => {
    return () => {
      debouncedSave.flush();
      debouncedSave.cancel();
    };
  }, [debouncedSave]);

  return (
    <div className="max-w-4xl mx-auto p-8 bg-white min-h-screen">
      <header className="mb-12 border-b-2 border-zinc-800 pb-6">
        <div className="flex justify-between items-start mb-4">
          <input
            type="text"
            value={state.title}
            onChange={(e) => dispatch({ type: 'UPDATE_TITLE', title: e.target.value })}
            className="text-4xl font-black uppercase tracking-tighter text-zinc-900 bg-transparent border-none focus:ring-0 w-full placeholder-zinc-300"
            placeholder="Snippet Title"
          />
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-4 no-print mr-4">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isPublicSnippet"
                  checked={state.isPublic}
                  onChange={(e) =>
                    dispatch({
                      type: 'UPDATE_PUBLIC',
                      isPublic: e.target.checked,
                    })
                  }
                  className="rounded border-zinc-300 text-blue-600 focus:ring-blue-500 h-4 w-4"
                />
                <label
                  htmlFor="isPublicSnippet"
                  className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest cursor-pointer"
                >
                  Public
                </label>
                {state.isPublic && (
                  <a
                    href={`/public/snippets/${state.id}`}
                    target="_blank"
                    className="text-[10px] font-bold text-blue-600 hover:underline uppercase tracking-widest ml-1"
                    rel="noopener"
                  >
                    View
                  </a>
                )}
              </div>
            </div>
            {isSaving ? (
              <span className="text-xs font-mono text-blue-500 animate-pulse bg-blue-50 px-2 py-1 rounded">
                SAVING...
              </span>
            ) : (
              <span className="text-xs font-mono text-emerald-500 bg-emerald-50 px-2 py-1 rounded">
                SAVED
              </span>
            )}
            <div className="text-right">
              <button
                onClick={async () => {
                  try {
                    const duplicated = await supabaseService.duplicateGrooveSnippet(state.id);
                    window.location.href = `/snippets/${duplicated.id}`;
                  } catch (_error) {
                    alert('Failed to duplicate snippet.');
                  }
                }}
                className="text-[10px] font-bold text-zinc-500 hover:text-blue-600 uppercase tracking-widest no-print mb-1 block"
              >
                DUPLICATE
              </button>
              <p className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest">Type</p>
              <p className="text-sm font-bold text-zinc-900 uppercase">Snippet</p>
            </div>
          </div>
        </div>

        <div className="mt-4">
          <TagInput
            tags={state.tags}
            onChange={(tags) => dispatch({ type: 'UPDATE_TAGS', tags })}
            suggestions={COMMON_DRUM_TAGS}
            placeholder="Add genre, style, or technique tag..."
          />
        </div>
      </header>

      <div className="space-y-12">
        <section className="bg-zinc-50 border border-zinc-200 rounded-xl p-6">
          <GrooveGridEditor
            initialGrid={{
              timeSignature: state.timeSignature,
              resolution: state.resolution,
              measures: state.measures,
              instruments: state.instruments,
            }}
            onChange={(grid) => dispatch({ type: 'UPDATE_GRID', grid })}
            bpm={state.bpm}
            onBpmChange={(bpm) => dispatch({ type: 'UPDATE_BPM', bpm })}
          />
        </section>
      </div>

      <footer className="mt-16 pt-8 border-t border-zinc-100 text-center">
        <p className="text-[10px] font-mono text-zinc-400 uppercase tracking-[0.2em]">
          DrumCharter Snippet Editor v1.0
        </p>
      </footer>
    </div>
  );
}
