import { describe, expect, it } from 'vitest';
import type { Notebook } from '../../types/groove';
import { notebookReducer } from '../notebook-reducer';

const baseNotebook: Notebook = {
  id: 'nb-1',
  title: 'Practice',
  tags: [],
  userId: 'user-1',
  isPublic: false,
  createdAt: null,
  updatedAt: null,
  sections: [],
};

describe('notebookReducer', () => {
  it('updates title', () => {
    const next = notebookReducer(baseNotebook, { type: 'UPDATE_TITLE', title: 'Ideas' });
    expect(next.title).toBe('Ideas');
  });

  it('adds a section', () => {
    const next = notebookReducer(baseNotebook, { type: 'ADD_SECTION' });
    expect(next.sections).toHaveLength(1);
  });

  it('removes a section', () => {
    const withSection = notebookReducer(baseNotebook, { type: 'ADD_SECTION' });
    const sectionId = withSection.sections[0].id;
    const next = notebookReducer(withSection, { type: 'REMOVE_SECTION', sectionId });
    expect(next.sections).toHaveLength(0);
  });

  it('updates section fields', () => {
    const withSection = notebookReducer(baseNotebook, { type: 'ADD_SECTION' });
    const sectionId = withSection.sections[0].id;
    const next = notebookReducer(withSection, {
      type: 'UPDATE_SECTION',
      sectionId,
      updates: { name: 'Warm-up', notes: 'Start slow' },
    });
    expect(next.sections[0].name).toBe('Warm-up');
    expect(next.sections[0].notes).toBe('Start slow');
  });
});
