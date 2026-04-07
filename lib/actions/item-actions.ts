'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { supabaseService } from '@/lib/services/supabase-service';
import { createClient } from '@/lib/supabase/server';
import {
  createDefaultDrumInstruments,
  type GrooveSnippet,
  type Notebook,
  type Setlist,
  type SongChart,
} from '@/lib/types/groove';

/**
 * Server Action for creating new items.
 */
export async function createItemAction(
  type: 'song' | 'notebook' | 'snippet' | 'setlist',
  defaultTimeSig?: { numerator: number; denominator: number },
) {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error('Unauthorized');
  }

  const userId = user.id;
  let savedId: string | undefined;
  let routePrefix: string | undefined;

  const timeSignature = {
    beatsPerMeasure: defaultTimeSig?.numerator || 4,
    beatValue: defaultTimeSig?.denominator || 4,
  };

  try {
    if (type === 'song') {
      const newSong: SongChart = {
        id: crypto.randomUUID(),
        userId,
        header: {
          title: 'Untitled Song',
          timeSignature,
          metronomeEnabled: false,
          metronomeVolume: 0.5,
        },
        sections: [],
        tags: [],
        isPublic: false,
        createdAt: null,
        updatedAt: null,
      };
      const saved = await supabaseService.saveSongChart(newSong, supabase);
      savedId = saved?.id;
      routePrefix = 'songs';
    } else if (type === 'notebook') {
      const newNotebook: Notebook = {
        id: crypto.randomUUID(),
        userId,
        title: 'Untitled Notebook',
        sections: [],
        tags: [],
        isPublic: false,
        createdAt: null,
        updatedAt: null,
      };
      const saved = await supabaseService.saveNotebook(newNotebook, supabase);
      savedId = saved?.id;
      routePrefix = 'notebooks';
    } else if (type === 'snippet') {
      const resolution = 16;
      const measures = 1;
      const newSnippet: GrooveSnippet = {
        id: crypto.randomUUID(),
        userId,
        title: 'Untitled Snippet',
        bpm: 100,
        measures,
        timeSignature,
        resolution,
        instruments: createDefaultDrumInstruments({
          timeSignature,
          resolution,
          measures,
        }),
        isPublic: false,
        tags: [],
        createdAt: null,
        updatedAt: null,
      };
      const saved = await supabaseService.saveGrooveSnippet(newSnippet, supabase);
      savedId = saved?.id;
      routePrefix = 'snippets';
    } else if (type === 'setlist') {
      const newSetlist: Setlist = {
        id: crypto.randomUUID(),
        userId,
        title: 'Untitled Setlist',
        songs: [],
        isPublic: false,
        createdAt: null,
        updatedAt: null,
      };
      const saved = await supabaseService.saveSetlist(newSetlist, supabase);
      savedId = saved?.id;
      routePrefix = 'setlists';
    }

    if (savedId && routePrefix) {
      revalidatePath('/library');
      revalidatePath('/');
    } else {
      throw new Error('Failed to create item');
    }
  } catch (error) {
    console.error('Error in createItemAction:', error);
    return { error: 'Failed to create item' };
  }

  if (savedId && routePrefix) {
    redirect(`/${routePrefix}/${savedId}`);
  }
}

/**
 * Server Action for saving (autosaving) items.
 */
export async function saveGrooveSnippetAction(snippet: GrooveSnippet) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || user.id !== snippet.userId) {
    throw new Error('Unauthorized');
  }

  try {
    const saved = await supabaseService.saveGrooveSnippet(snippet, supabase);
    revalidatePath(`/snippets/${snippet.id}`);
    return { success: true, data: saved };
  } catch (error) {
    console.error('Error in saveGrooveSnippetAction:', error);
    throw error;
  }
}

export async function saveSongChartAction(song: SongChart) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || user.id !== song.userId) {
    throw new Error('Unauthorized');
  }

  try {
    const saved = await supabaseService.saveSongChart(song, supabase);
    revalidatePath(`/songs/${song.id}`);
    return { success: true, data: saved };
  } catch (error) {
    console.error('Error in saveSongChartAction:', error);
    throw error;
  }
}

export async function saveNotebookAction(notebook: Notebook) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || user.id !== notebook.userId) {
    throw new Error('Unauthorized');
  }

  try {
    const saved = await supabaseService.saveNotebook(notebook, supabase);
    revalidatePath(`/notebooks/${notebook.id}`);
    return { success: true, data: saved };
  } catch (error) {
    console.error('Error in saveNotebookAction:', error);
    throw error;
  }
}

export async function saveSetlistAction(setlist: Setlist) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || user.id !== setlist.userId) {
    throw new Error('Unauthorized');
  }

  try {
    const saved = await supabaseService.saveSetlist(setlist, supabase);
    revalidatePath(`/setlists/${setlist.id}`);
    revalidatePath(`/public/setlists/${setlist.id}`);
    return { success: true, data: saved };
  } catch (error) {
    console.error('Error in saveSetlistAction:', error);
    throw error;
  }
}

/**
 * Server Action for duplicating items.
 */
export async function duplicateItemAction(
  id: string,
  type: 'song' | 'notebook' | 'snippet' | 'setlist',
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Unauthorized');
  }

  try {
    let duplicated;
    if (type === 'song') {
      duplicated = await supabaseService.duplicateSongChart(id, supabase);
    } else if (type === 'notebook') {
      duplicated = await supabaseService.duplicateNotebook(id, supabase);
    } else if (type === 'snippet') {
      duplicated = await supabaseService.duplicateGrooveSnippet(id, supabase);
    } else if (type === 'setlist') {
      duplicated = await supabaseService.duplicateSetlist(id, supabase);
    }

    revalidatePath('/library');
    revalidatePath('/');
    return { success: true, data: duplicated };
  } catch (error) {
    console.error('Error in duplicateItemAction:', error);
    throw error;
  }
}

/**
 * Server Action for deleting items.
 */
export async function deleteItemAction(
  id: string,
  type: 'song' | 'notebook' | 'snippet' | 'setlist',
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Unauthorized');
  }

  try {
    if (type === 'song') {
      await supabaseService.deleteSongChart(id, supabase);
    } else if (type === 'notebook') {
      await supabaseService.deleteNotebook(id, supabase);
    } else if (type === 'snippet') {
      await supabaseService.deleteGrooveSnippet(id, supabase);
    } else if (type === 'setlist') {
      await supabaseService.deleteSetlist(id, supabase);
    }

    revalidatePath('/library');
    revalidatePath('/');
    return { success: true };
  } catch (error) {
    console.error('Error in deleteItemAction:', error);
    throw error;
  }
}

/**
 * Server Action for listing snippets.
 */
export async function listGrooveSnippetsAction() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Unauthorized');
  }

  try {
    return await supabaseService.listGrooveSnippetsMapped(supabase);
  } catch (error) {
    console.error('Error in listGrooveSnippetsAction:', error);
    throw error;
  }
}
