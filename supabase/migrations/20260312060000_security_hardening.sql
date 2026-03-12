-- 1. Revoke excessive grants from anon role
REVOKE ALL ON TABLE public.profiles FROM anon;
REVOKE ALL ON TABLE public.song_charts FROM anon;
REVOKE ALL ON TABLE public.groove_snippets FROM anon;
REVOKE ALL ON TABLE public.notebooks FROM anon;

-- Restore minimal SELECT grant to anon for public viewing
GRANT SELECT ON TABLE public.profiles TO anon;
GRANT SELECT ON TABLE public.song_charts TO anon;
GRANT SELECT ON TABLE public.groove_snippets TO anon;
GRANT SELECT ON TABLE public.notebooks TO anon;

-- 2. Harden RLS policies with WITH CHECK for UPDATE
-- song_charts
DROP POLICY IF EXISTS "Users can update own song charts." ON public.song_charts;
CREATE POLICY "Users can update own song charts."
ON public.song_charts
FOR UPDATE
TO public
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- groove_snippets
DROP POLICY IF EXISTS "Users can update own groove snippets." ON public.groove_snippets;
CREATE POLICY "Users can update own groove snippets."
ON public.groove_snippets
FOR UPDATE
TO public
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- notebooks
DROP POLICY IF EXISTS "Users can update own notebooks." ON public.notebooks;
CREATE POLICY "Users can update own notebooks"
ON public.notebooks
FOR UPDATE
TO public
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- profiles
DROP POLICY IF EXISTS "Users can update own profile." ON public.profiles;
CREATE POLICY "Users can update own profile."
ON public.profiles
FOR UPDATE
TO public
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);
