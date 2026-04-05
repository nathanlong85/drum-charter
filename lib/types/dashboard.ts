export type RecentItemType = 'song' | 'notebook' | 'snippet';

export interface RecentItem {
  id: string;
  type: RecentItemType;
  title: string;
  createdAt: string | null;
  updatedAt: string | null;
  bpm?: number;
}
