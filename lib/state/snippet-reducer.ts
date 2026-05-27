import type { GrooveGrid, GrooveSnippet } from '../types/groove';

export type SnippetAction =
  | { type: 'SET_SNIPPET'; snippet: GrooveSnippet }
  | { type: 'UPDATE_TITLE'; title: string }
  | { type: 'UPDATE_TAGS'; tags: string[] }
  | { type: 'UPDATE_PUBLIC'; isPublic: boolean }
  | { type: 'UPDATE_GRID'; grid: GrooveGrid }
  | { type: 'UPDATE_BPM'; bpm: number };

export function snippetReducer(state: GrooveSnippet, action: SnippetAction): GrooveSnippet {
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
