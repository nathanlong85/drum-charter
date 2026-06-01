'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useReducer, useRef } from 'react';
import { DocumentEditorHeader } from '@/components/document/DocumentEditorHeader';
import { DocumentSaveStatus } from '@/components/document/DocumentSaveStatus';
import { GrooveGridEditor } from '@/components/groove/GrooveGridEditor';
import {
  deleteItemAction,
  duplicateItemAction,
  saveGrooveSnippetAction,
} from '@/lib/actions/item-actions';
import { useAutosave } from '@/lib/hooks/useAutosave';
import { snippetReducer } from '@/lib/state/snippet-reducer';
import type { GrooveSnippet } from '@/lib/types/groove';
import { EditorToolbar } from '../layout/EditorToolbar';

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

interface SnippetEditorProps {
  initialSnippet: GrooveSnippet;
}

export function SnippetEditor({ initialSnippet }: SnippetEditorProps) {
  const [state, dispatch] = useReducer(snippetReducer, initialSnippet);
  const router = useRouter();
  const isInitialRender = useRef(true);

  const { isSaving, error, triggerSave, settleAutosave, cancelAutosave } =
    useAutosave<GrooveSnippet>(async (snippet) => {
      await saveGrooveSnippetAction(snippet);
    }, 2000);

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
        <EditorToolbar
          type="snippet"
          id={state.id}
          isPublic={state.isPublic}
          onTogglePublic={() => dispatch({ type: 'UPDATE_PUBLIC', isPublic: !state.isPublic })}
          onDuplicate={async () => {
            try {
              await settleAutosave();
              const result = await duplicateItemAction(state.id, 'snippet');
              if (result.success && result.data && 'id' in result.data) {
                router.push(`/snippets/${result.data.id}`);
              }
            } catch (error) {
              console.error('Error duplicating snippet:', error);
              alert('Failed to duplicate snippet.');
            }
          }}
          onDelete={async () => {
            if (confirm('Are you sure you want to delete this snippet?')) {
              try {
                cancelAutosave();
                await settleAutosave();
                await deleteItemAction(state.id, 'snippet');
                router.push('/library/snippets');
              } catch (error) {
                console.error('Failed to delete snippet:', error);
                alert('Failed to delete snippet.');
              }
            }
          }}
        />

        <DocumentEditorHeader
          documentLabel="Snippet"
          title={state.title}
          onTitleChange={(title) => dispatch({ type: 'UPDATE_TITLE', title })}
          tags={state.tags}
          onTagsChange={(tags) => dispatch({ type: 'UPDATE_TAGS', tags })}
          tagSuggestions={COMMON_DRUM_TAGS}
          isSaving={isSaving}
          error={error}
          titlePlaceholder="Snippet Title"
        />

        {/* Main Workspace */}
        <section className="flex-1 p-8 pt-4">
          <div className="max-w-5xl mx-auto">
            <div className="bg-surface-container-low/30 rounded-3xl p-10 border border-outline-variant/10 shadow-inner relative overflow-hidden">
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

      <DocumentSaveStatus isSaving={isSaving} error={error} />
    </div>
  );
}
