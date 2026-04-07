export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  defaultTimeSignature: {
    numerator: number;
    denominator: number;
  };
  defaultKitId?: string;
}

export interface UserProfile {
  id: string;
  username: string | null;
  display_name: string | null;
  avatar_url: string | null;
  preferences: UserPreferences;
  updated_at: string | null;
}

export const DEFAULT_PREFERENCES: UserPreferences = {
  theme: 'system',
  defaultTimeSignature: {
    numerator: 4,
    denominator: 4,
  },
};
