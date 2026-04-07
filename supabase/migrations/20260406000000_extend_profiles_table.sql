-- 1. Extend profiles table with display_name and preferences
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS display_name text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS preferences jsonb DEFAULT '{}'::jsonb;

-- 2. Create profile trigger function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, username, display_name, avatar_url, preferences)
  VALUES (
    new.id,
    new.raw_user_meta_data->>'username',
    new.raw_user_meta_data->>'full_name', -- Common metadata field for display name
    new.raw_user_meta_data->>'avatar_url',
    '{"theme": "system", "defaultTimeSignature": {"numerator": 4, "denominator": 4}}'::jsonb
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$;

-- 3. Create the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 4. Backfill existing users
INSERT INTO public.profiles (id, preferences)
SELECT id, '{"theme": "system", "defaultTimeSignature": {"numerator": 4, "denominator": 4}}'::jsonb
FROM auth.users
ON CONFLICT (id) DO UPDATE
SET preferences = EXCLUDED.preferences
WHERE profiles.preferences IS NULL OR profiles.preferences = '{}'::jsonb;
