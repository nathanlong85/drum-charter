import type { GrooveSnippet, SongChart, SongSection, SongSubSection } from '../types/groove';
import { generateId } from '../utils/id';

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
        header: { ...state.header, manualOrder: action.manualOrder || undefined },
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
        id: generateId(),
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
            id: generateId(),
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
