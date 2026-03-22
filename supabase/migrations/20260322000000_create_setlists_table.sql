CREATE TABLE "public"."setlists" (
    "id" uuid NOT NULL DEFAULT gen_random_uuid(),
    "user_id" uuid NOT NULL,
    "title" text NOT NULL,
    "songs" jsonb NOT NULL DEFAULT '[]'::jsonb,
    "is_public" boolean DEFAULT false,
    "created_at" timestamp with time zone DEFAULT timezone('utc'::text, now()),
    "updated_at" timestamp with time zone DEFAULT timezone('utc'::text, now()),
    CONSTRAINT "songs_is_array_check" CHECK (jsonb_typeof(songs) = 'array')
);

ALTER TABLE "public"."setlists" ENABLE ROW LEVEL SECURITY;

CREATE UNIQUE INDEX setlists_pkey ON public.setlists USING btree (id);
ALTER TABLE "public"."setlists" ADD CONSTRAINT "setlists_pkey" PRIMARY KEY USING INDEX "setlists_pkey";

ALTER TABLE "public"."setlists" ADD CONSTRAINT "setlists_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

CREATE POLICY "Users can delete own setlists."
ON "public"."setlists"
AS PERMISSIVE
FOR DELETE
TO public
USING ((auth.uid() = user_id));

CREATE POLICY "Users can insert their own setlists."
ON "public"."setlists"
AS PERMISSIVE
FOR INSERT
TO public
WITH CHECK ((auth.uid() = user_id));

CREATE POLICY "Users can update own setlists."
ON "public"."setlists"
AS PERMISSIVE
FOR UPDATE
TO public
USING ((auth.uid() = user_id))
WITH CHECK ((auth.uid() = user_id));

CREATE POLICY "Users can view public or own setlists."
ON "public"."setlists"
AS PERMISSIVE
FOR SELECT
TO public
USING (((is_public = true) OR (auth.uid() = user_id)));

-- Permissions
GRANT DELETE ON TABLE "public"."setlists" TO "authenticated";
GRANT INSERT ON TABLE "public"."setlists" TO "authenticated";
GRANT SELECT ON TABLE "public"."setlists" TO "authenticated";
GRANT UPDATE ON TABLE "public"."setlists" TO "authenticated";
GRANT SELECT ON TABLE "public"."setlists" TO "service_role";
GRANT INSERT ON TABLE "public"."setlists" TO "service_role";
GRANT UPDATE ON TABLE "public"."setlists" TO "service_role";
GRANT DELETE ON TABLE "public"."setlists" TO "service_role";
