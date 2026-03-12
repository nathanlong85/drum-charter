-- Add metronome fields to song_charts
ALTER TABLE public.song_charts 
ADD COLUMN IF NOT EXISTS metronome_enabled BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS metronome_volume DOUBLE PRECISION DEFAULT 0.5;
