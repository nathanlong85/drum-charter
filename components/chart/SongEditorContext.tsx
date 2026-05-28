'use client';

import { useRouter } from 'next/navigation';
import {
  createContext,
  type Dispatch,
  type ReactNode,
  useContext,
  useEffect,
  useReducer,
  useRef,
  useState,
} from 'react';
import {
  deleteItemAction,
  duplicateItemAction,
  saveSongChartAction,
} from '@/lib/actions/item-actions';
import { useAutosave } from '@/lib/hooks/useAutosave';
import { type SongAction, songReducer } from '@/lib/state/song-reducer';
import type { GrooveSnippet, SongChart } from '@/lib/types/groove';

export type { SongAction } from '@/lib/state/song-reducer';
export { songReducer } from '@/lib/state/song-reducer';

interface SongEditorContextType {
  state: SongChart;
  dispatch: Dispatch<SongAction>;
  isLiveMode: boolean;
  setIsLiveMode: (isLive: boolean) => void;
  pickerConfig: { sectionId: string; subSectionId?: string } | null;
  setPickerConfig: (config: { sectionId: string; subSectionId?: string } | null) => void;
  isSaving: boolean;
  error: string | null;
  handleDuplicate: () => Promise<void>;
  handleDelete: () => Promise<void>;
  handleSnippetSelect: (snippet: GrooveSnippet) => void;
}

const SongEditorContext = createContext<SongEditorContextType | null>(null);

export function SongEditorProvider({
  children,
  initialSong,
}: {
  children: ReactNode;
  initialSong: SongChart;
}) {
  const [state, dispatch] = useReducer(songReducer, initialSong);
  const [isLiveMode, setIsLiveMode] = useState(false);
  const [pickerConfig, setPickerConfig] = useState<{
    sectionId: string;
    subSectionId?: string;
  } | null>(null);
  const router = useRouter();
  const isInitialRender = useRef(true);

  const { isSaving, error, triggerSave, settleAutosave } = useAutosave<SongChart>(async (chart) => {
    await saveSongChartAction(chart);
  }, 2000);

  useEffect(() => {
    if (isInitialRender.current) {
      isInitialRender.current = false;
      return;
    }
    triggerSave(state);
  }, [state, triggerSave]);

  const handleSnippetSelect = (snippet: GrooveSnippet) => {
    if (pickerConfig) {
      dispatch({
        type: 'INSERT_SNIPPET',
        sectionId: pickerConfig.sectionId,
        subSectionId: pickerConfig.subSectionId,
        snippet,
      });
      setPickerConfig(null);
    }
  };

  const handleDuplicate = async () => {
    try {
      await settleAutosave();
      const result = await duplicateItemAction(state.id, 'song');
      if (result.success && result.data && 'id' in result.data) {
        router.push(`/songs/${result.data.id}`);
      }
    } catch (error) {
      console.error('Failed to duplicate song chart:', error);
      alert('Failed to duplicate song chart.');
    }
  };

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this song?')) {
      try {
        await settleAutosave();
        await deleteItemAction(state.id, 'song');
        router.push('/library/songs');
      } catch (error) {
        console.error('Failed to delete song chart:', error);
        alert('Failed to delete song chart.');
      }
    }
  };

  const value = {
    state,
    dispatch,
    isLiveMode,
    setIsLiveMode,
    pickerConfig,
    setPickerConfig,
    isSaving,
    error,
    handleDuplicate,
    handleDelete,
    handleSnippetSelect,
  };

  return <SongEditorContext.Provider value={value}>{children}</SongEditorContext.Provider>;
}

export function useSongEditor() {
  const context = useContext(SongEditorContext);
  if (!context) {
    throw new Error('useSongEditor must be used within a SongEditorProvider');
  }
  return context;
}
