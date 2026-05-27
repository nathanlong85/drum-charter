import type { GrooveSnippet, Notebook, NotebookSection } from '../types/groove';
import { generateId } from '../utils/id';

type NotebookSectionUpdates = Partial<Omit<NotebookSection, 'id'>>;

export type NotebookAction =
  | { type: 'SET_NOTEBOOK'; notebook: Notebook }
  | { type: 'UPDATE_TITLE'; title: string }
  | { type: 'UPDATE_TAGS'; tags: string[] }
  | { type: 'UPDATE_PUBLIC'; isPublic: boolean }
  | { type: 'ADD_SECTION' }
  | { type: 'REMOVE_SECTION'; sectionId: string }
  | { type: 'UPDATE_SECTION'; sectionId: string; updates: NotebookSectionUpdates }
  | { type: 'UPDATE_SECTION_BPM'; sectionId: string; bpm: number }
  | { type: 'INSERT_SNIPPET'; sectionId: string; snippet: GrooveSnippet };

export function notebookReducer(state: Notebook, action: NotebookAction): Notebook {
  const timestamp = new Date().toISOString();

  switch (action.type) {
    case 'SET_NOTEBOOK':
      return action.notebook;
    case 'UPDATE_TITLE':
      return { ...state, title: action.title, updatedAt: timestamp };
    case 'UPDATE_TAGS':
      return { ...state, tags: action.tags, updatedAt: timestamp };
    case 'UPDATE_PUBLIC':
      return { ...state, isPublic: action.isPublic, updatedAt: timestamp };
    case 'ADD_SECTION': {
      const newSection: NotebookSection = {
        id: generateId(),
        name: 'New Section',
        notes: '',
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
    case 'UPDATE_SECTION_BPM':
      return {
        ...state,
        sections: state.sections.map((s) =>
          s.id === action.sectionId ? { ...s, bpm: action.bpm } : s,
        ),
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
        sections: state.sections.map((s) => (s.id === action.sectionId ? { ...s, grid } : s)),
        updatedAt: timestamp,
      };
    }
    default:
      return state;
  }
}
