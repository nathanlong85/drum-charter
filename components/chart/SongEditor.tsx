'use client';

import type { ReactNode } from 'react';
import { DocumentSaveStatus } from '@/components/document/DocumentSaveStatus';
import { SnippetPickerModal } from '@/components/groove/SnippetPickerModal';
import type { SongChart } from '@/lib/types/groove';
import { EditorToolbar } from '../layout/EditorToolbar';
import { LiveModeView } from './LiveModeView';
import { SongEditorProvider, useSongEditor } from './SongEditorContext';
import { SongEditorHeader } from './SongEditorHeader';
import { SongEditorSections } from './SongEditorSections';

interface SongEditorProps {
  initialSong: SongChart;
  children?: ReactNode;
}

/**
 * Root component that provides the SongEditorContext.
 */
export function SongEditorRoot({ initialSong, children }: SongEditorProps) {
  return (
    <SongEditorProvider initialSong={initialSong}>
      <SongEditorLayout>{children}</SongEditorLayout>
    </SongEditorProvider>
  );
}

function SongEditorLayout({ children }: { children?: ReactNode }) {
  const { state, isLiveMode, setIsLiveMode, pickerConfig, setPickerConfig, handleSnippetSelect } =
    useSongEditor();

  if (isLiveMode) {
    return <LiveModeView chart={state} onExit={() => setIsLiveMode(false)} />;
  }

  return (
    <div data-testid="song-editor-root" className="min-h-screen bg-surface">
      <div data-testid="song-editor-container" className="flex flex-col h-full relative">
        {children || (
          <>
            <SongEditorToolbar />
            <SongEditorHeader />
            <SongEditorSections />
          </>
        )}
      </div>

      {pickerConfig && (
        <SnippetPickerModal onClose={() => setPickerConfig(null)} onSelect={handleSnippetSelect} />
      )}

      <SongEditorSaveStatus />
    </div>
  );
}

/**
 * Toolbar for song editor actions like duplication, deletion, and going live.
 */
export function SongEditorToolbar() {
  const { state, dispatch, handleDuplicate, handleDelete, setIsLiveMode } = useSongEditor();

  return (
    <EditorToolbar
      type="song"
      id={state.id}
      isPublic={state.isPublic}
      onTogglePublic={() => dispatch({ type: 'TOGGLE_PUBLIC' })}
      onDuplicate={handleDuplicate}
      onDelete={handleDelete}
      onGoLive={() => {
        window.scrollTo(0, 0);
        setIsLiveMode(true);
      }}
    />
  );
}

export { SongEditorHeader } from './SongEditorHeader';
export { SongEditorSections } from './SongEditorSections';

/**
 * Save status indicator (floating).
 */
export function SongEditorSaveStatus() {
  const { isSaving, error } = useSongEditor();
  return <DocumentSaveStatus isSaving={isSaving} error={error} />;
}

/**
 * Compound component for the Song Editor.
 */
const SongEditor = Object.assign(SongEditorRoot, {
  Header: SongEditorHeader,
  Toolbar: SongEditorToolbar,
  Sections: SongEditorSections,
  SaveStatus: SongEditorSaveStatus,
});

export default SongEditor;
