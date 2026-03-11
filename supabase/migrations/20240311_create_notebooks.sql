-- Migration to create the notebooks table
CREATE TABLE IF NOT EXISTS public.notebooks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) DEFAULT auth.uid(),
    title TEXT NOT NULL,
    sections JSONB NOT NULL DEFAULT '[]'::jsonb,
    tags TEXT[] DEFAULT '{}'::text[],
    is_public BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.notebooks ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies
CREATE POLICY "Users can view own or public notebooks" 
ON public.notebooks FOR SELECT 
USING (auth.uid() = user_id OR is_public = true);

CREATE POLICY "Users can create their own notebooks" 
ON public.notebooks FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own notebooks" 
ON public.notebooks FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own notebooks" 
ON public.notebooks FOR DELETE 
USING (auth.uid() = user_id);

-- Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.notebooks;
