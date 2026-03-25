'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useReducer, useRef } from 'react';
import { TagInput } from '@/components/common/TagInput';
import { GrooveGridEditor } from '@/components/groove/GrooveGridEditor';
import { useAutosave } from '@/lib/hooks/useAutosave';
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

export function SnippetEditor({ initialSnippet }: SnippetEditorProps) {
  const [state, dispatch] = useReducer(snippetReducer, initialSnippet);
  const router = useRouter();
  const isInitialRender = useRef(true);

  const { isSaving, error, triggerSave, settleAutosave } = useAutosave<GrooveSnippet>(
    async (snippet) => {
      await supabaseService.saveGrooveSnippet(snippet);
    },
    2000,
  );

  useEffect(() => {
    if (isInitialRender.current) {
      isInitialRender.current = false;
      return;
    }
    triggerSave(state);
  }, [state, triggerSave]);

  return (
    <div data-testid="snippet-editor-root" className="min-h-screen bg-surface">
      <div data-testid="snippet-editor-container" className="flex flex-col h-full relative">
        {/* Top Actions */}
        <div className="sticky top-0 right-0 p-4 no-print flex justify-end gap-2 z-50 bg-surface/80 backdrop-blur-md border-b border-outline-variant/10">
          {state.isPublic && (
            <>
              <button
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(
                      `${window.location.origin}/public/snippets/${state.id}`,
                    );
                    // TODO: Replace with toast
                    console.log('Public link copied to clipboard!');
                  } catch (_err) {
                    alert(
                      `Failed to copy link. Here it is: ${window.location.origin}/public/snippets/${state.id}`,
                    );
                  }
                }}
                className="flex items-center gap-2 bg-surface-container-highest text-on-surface-variant px-4 py-2 rounded-lg font-bold hover:bg-surface-bright transition-all text-[10px] uppercase tracking-widest"
              >
                Copy Link
              </button>
              <a
                href={`/public/snippets/${state.id}`}
                target="_blank"
                className="flex items-center gap-2 bg-surface-container-highest text-on-surface-variant px-4 py-2 rounded-lg font-bold hover:bg-surface-bright transition-all text-[10px] uppercase tracking-widest"
                rel="noopener noreferrer"
              >
                View Public
              </a>
            </>
          )}
          <button
            onClick={async () => {
              try {
                await settleAutosave();
                const duplicated = await supabaseService.duplicateGrooveSnippet(state.id);
                router.push(`/snippets/${duplicated.id}`);
              } catch (error) {
                console.error('Failed to duplicate snippet:', error);
                alert('Failed to duplicate snippet.');
              }
            }}
            className="flex items-center gap-2 bg-surface-container-highest text-on-surface-variant px-4 py-2 rounded-lg font-bold hover:bg-surface-bright transition-all text-[10px] uppercase tracking-widest"
          >
            Duplicate
          </button>
          <button
            onClick={async () => {
              if (confirm('Are you sure you want to delete this snippet?')) {
                try {
                  await settleAutosave();
                  await supabaseService.deleteGrooveSnippet(state.id);
                  router.push('/library');
                } catch (error) {
                  console.error('Failed to delete snippet:', error);
                  alert('Failed to delete snippet.');
                }
              }
            }}
            className="flex items-center gap-2 bg-surface-container-highest text-error px-4 py-2 rounded-lg font-bold hover:bg-error/10 transition-all text-[10px] uppercase tracking-widest"
          >
            Delete
          </button>
          <div className="w-[1px] h-8 bg-outline-variant/20 mx-2" />
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 bg-surface-container-highest text-on-surface px-4 py-2 rounded-lg font-bold hover:bg-surface-bright transition-all text-sm shadow-lg"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
              />
            </svg>
            PRINT
          </button>
        </div>

        {/* Snippet Header Section */}
        <section className="p-8 pb-4 pt-16 md:pt-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-2 w-full max-w-2xl">
              <div className="flex items-center gap-4 text-primary font-headline uppercase tracking-[0.2em] text-xs font-bold">
                <span>Snippet</span>
                <span className="w-1 h-1 rounded-full bg-primary/40"></span>
                <span className="text-on-surface-variant flex gap-2 items-center">
                  {error ? (
                    <span className="text-error">{error}</span>
                  ) : isSaving ? (
                    <span className="animate-pulse">Saving...</span>
                  ) : (
                    <span>Saved</span>
                  )}
                </span>
                <span className="w-1 h-1 rounded-full bg-primary/40"></span>
                <button
                  onClick={() => dispatch({ type: 'UPDATE_PUBLIC', isPublic: !state.isPublic })}
                  data-testid="toggle-public-button"
                  className={state.isPublic ? 'text-green-400' : 'text-on-surface-variant'}
                >
                  {state.isPublic ? 'PUBLIC' : 'PRIVATE'}
                </button>
              </div>
              <input
                type="text"
                value={state.title}
                onChange={(e) => dispatch({ type: 'UPDATE_TITLE', title: e.target.value })}
                className="text-5xl lg:text-6xl font-headline font-bold tracking-tighter text-on-surface bg-transparent border-none focus:ring-0 w-full p-0"
                placeholder="Snippet Title"
              />

              <div className="mt-4">
                <TagInput
                  tags={state.tags}
                  onChange={(tags) => dispatch({ type: 'UPDATE_TAGS', tags })}
                  suggestions={COMMON_DRUM_TAGS}
                  placeholder="+ ADD TAG"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Main Workspace */}
        <section className="flex-1 p-8 pt-4">
          <div className="max-w-5xl mx-auto">
            <div className="bg-surface-container rounded-3xl p-10 border border-outline-variant/10 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/30 to-transparent"></div>
              <GrooveGridEditor
                initialGrid={{
                  timeSignature: state.timeSignature,
                  resolution: state.resolution,
                  measures: state.measures,
                  instruments: state.instruments,
                  playbackOptionalHits: state.playbackOptionalHits,
                }}
                onChange={(grid) => dispatch({ type: 'UPDATE_GRID', grid })}
                bpm={state.bpm}
                onBpmChange={(bpm) => dispatch({ type: 'UPDATE_BPM', bpm })}
              />
            </div>
          </div>
        </section>

        <footer className="mt-24 pb-12 text-center">
          <p className="text-[10px] font-headline font-bold text-on-surface-variant/40 uppercase tracking-[0.3em]">
            DrumCharter Snippet Module v1.0
          </p>
        </footer>
      </div>

      {/* Floating Save Status */}
      <div
        className="fixed bottom-8 right-8 z-50 pointer-events-none"
        data-testid="floating-save-status"
      >
        {isSaving && (
          <div className="bg-surface-container-highest/80 backdrop-blur-md border border-outline-variant/20 px-4 py-2 rounded-full shadow-2xl animate-in fade-in slide-in-from-bottom-4 flex items-center gap-2">
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
            <span className="text-[10px] font-headline font-black text-primary uppercase tracking-[0.2em]">
              Saving...
            </span>
          </div>
        )}
        {error && (
          <div className="bg-error/10 backdrop-blur-md border border-error/20 px-4 py-2 rounded-full shadow-2xl animate-in fade-in slide-in-from-bottom-4 flex items-center gap-2">
            <div className="w-2 h-2 bg-error rounded-full"></div>
            <span className="text-[10px] font-headline font-black text-error uppercase tracking-[0.2em]">
              {error}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
