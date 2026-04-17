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
import type { GrooveSnippet, SongChart, SongSection, SongSubSection } from '@/lib/types/groove';

export type SongAction =
  | { type: 'SET_SONG'; song: SongChart }
  | { type: 'UPDATE_TITLE'; title: string }
  | { type: 'UPDATE_BPM'; bpm: number }
  | { type: 'UPDATE_MANUAL_ORDER'; manualOrder: string }
  | {
      type: 'UPDATE_TIME_SIGNATURE';
      beatsPerMeasure: number;
      beatValue: number;
    }
  | { type: 'UPDATE_TAGS'; tags: string[] }
  | { type: 'UPDATE_METRONOME'; enabled?: boolean; volume?: number }
  | { type: 'ADD_SECTION' }
  | { type: 'REMOVE_SECTION'; sectionId: string }
  | { type: 'UPDATE_SECTION'; sectionId: string; updates: Partial<SongSection> }
  | { type: 'ADD_SUBSECTION'; sectionId: string }
  | { type: 'REMOVE_SUBSECTION'; sectionId: string; subSectionId: string }
  | {
      type: 'UPDATE_SUBSECTION';
      sectionId: string;
      subSectionId: string;
      updates: Partial<SongSubSection>;
    }
  | {
      type: 'INSERT_SNIPPET';
      sectionId: string;
      subSectionId?: string;
      snippet: GrooveSnippet;
    }
  | { type: 'TOGGLE_PUBLIC' };

export function songReducer(state: SongChart, action: SongAction): SongChart {
  const timestamp = new Date().toISOString();

  switch (action.type) {
    case 'SET_SONG':
      return action.song;
    case 'UPDATE_TITLE':
      return {
        ...state,
        header: { ...state.header, title: action.title },
        updatedAt: timestamp,
      };
    case 'UPDATE_BPM':
      return {
        ...state,
        header: { ...state.header, bpm: action.bpm },
        updatedAt: timestamp,
      };
    case 'UPDATE_MANUAL_ORDER':
      return {
        ...state,
        header: { ...state.header, manualOrder: action.manualOrder.trim() || undefined },
        updatedAt: timestamp,
      };
    case 'UPDATE_TIME_SIGNATURE':
      return {
        ...state,
        header: {
          ...state.header,
          timeSignature: {
            beatsPerMeasure: action.beatsPerMeasure,
            beatValue: action.beatValue,
          },
        },
        updatedAt: timestamp,
      };
    case 'UPDATE_TAGS':
      return { ...state, tags: action.tags, updatedAt: timestamp };
    case 'UPDATE_METRONOME':
      return {
        ...state,
        header: {
          ...state.header,
          metronomeEnabled:
            action.enabled !== undefined ? action.enabled : state.header.metronomeEnabled,
          metronomeVolume:
            action.volume !== undefined ? action.volume : state.header.metronomeVolume,
        },
        updatedAt: timestamp,
      };
    case 'ADD_SECTION': {
      const newSection: SongSection = {
        id: crypto.randomUUID(),
        name: 'New Section',
        measuresCount: 4,
        notes: [],
        subSections: [],
      };
      return {
        ...state,
        sections: [...state.sections, newSection],
        updatedAt: timestamp,
      };
    }
    case 'REMOVE_SECTION':
      return {
        ...state,
        sections: state.sections.filter((s) => s.id !== action.sectionId),
        updatedAt: timestamp,
      };
    case 'UPDATE_SECTION':
      return {
        ...state,
        sections: state.sections.map((s) =>
          s.id === action.sectionId ? { ...s, ...action.updates } : s,
        ),
        updatedAt: timestamp,
      };
    case 'ADD_SUBSECTION':
      return {
        ...state,
        sections: state.sections.map((s) => {
          if (s.id !== action.sectionId) return s;
          const newSub: SongSubSection = {
            id: crypto.randomUUID(),
            name: 'New Subsection',
            measuresCount: 4,
            notes: [],
          };
          return { ...s, subSections: [...(s.subSections || []), newSub] };
        }),
        updatedAt: timestamp,
      };
    case 'REMOVE_SUBSECTION':
      return {
        ...state,
        sections: state.sections.map((s) => {
          if (s.id !== action.sectionId) return s;
          return {
            ...s,
            subSections: (s.subSections || []).filter((sub) => sub.id !== action.subSectionId),
          };
        }),
        updatedAt: timestamp,
      };
    case 'UPDATE_SUBSECTION':
      return {
        ...state,
        sections: state.sections.map((s) => {
          if (s.id !== action.sectionId) return s;
          return {
            ...s,
            subSections: (s.subSections || []).map((sub) =>
              sub.id === action.subSectionId ? { ...sub, ...action.updates } : sub,
            ),
          };
        }),
        updatedAt: timestamp,
      };
    case 'INSERT_SNIPPET': {
      const { timeSignature, resolution, measures, instruments, playbackOptionalHits } =
        action.snippet;
      const grid = {
        timeSignature,
        resolution,
        measures,
        instruments,
        playbackOptionalHits,
      };

      return {
        ...state,
        sections: state.sections.map((s) => {
          if (s.id !== action.sectionId) return s;

          if (action.subSectionId) {
            return {
              ...s,
              subSections: (s.subSections || []).map((sub) =>
                sub.id === action.subSectionId ? { ...sub, grid } : sub,
              ),
            };
          }

          return { ...s, grid };
        }),
        updatedAt: timestamp,
      };
    }
    case 'TOGGLE_PUBLIC':
      return { ...state, isPublic: !state.isPublic, updatedAt: timestamp };
    default:
      return state;
  }
}

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
