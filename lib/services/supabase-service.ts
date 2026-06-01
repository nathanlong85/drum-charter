import * as notebooks from './notebooks';
import * as profiles from './profiles';
import * as setlists from './setlists';
import * as snippets from './snippets';
import * as songs from './songs';

export { fetchWithRetry } from './fetch-with-retry';
export { migrateGrooveGrid } from './migrations/groove-grid';

export const supabaseService = {
  ...songs,
  ...notebooks,
  ...snippets,
  ...setlists,
  ...profiles,
};
