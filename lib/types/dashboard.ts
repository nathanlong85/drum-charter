export type RecentItemType = 'song' | 'notebook' | 'snippet';

export interface RecentItem {
  id: string;
  type: RecentItemType;
  title: string;
  createdAt: string;
  updatedAt?: string;
  bpm?: number;
}
