drop extension if exists "pg_net";


  create table "public"."groove_snippets" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" uuid not null,
    "title" text not null,
    "tags" text[] default '{}'::text[],
    "grid_data" jsonb not null,
    "is_public" boolean default false,
    "created_at" timestamp with time zone default timezone('utc'::text, now()),
    "updated_at" timestamp with time zone default timezone('utc'::text, now())
      );


alter table "public"."groove_snippets" enable row level security;


  create table "public"."profiles" (
    "id" uuid not null,
    "username" text,
    "avatar_url" text,
    "updated_at" timestamp with time zone default timezone('utc'::text, now())
      );


alter table "public"."profiles" enable row level security;


  create table "public"."song_charts" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" uuid not null,
    "title" text not null,
    "bpm" integer,
    "time_signature" jsonb not null,
    "sections" jsonb not null,
    "tags" text[] default '{}'::text[],
    "is_public" boolean default false,
    "created_at" timestamp with time zone default timezone('utc'::text, now()),
    "updated_at" timestamp with time zone default timezone('utc'::text, now())
      );


alter table "public"."song_charts" enable row level security;

CREATE UNIQUE INDEX groove_snippets_pkey ON public.groove_snippets USING btree (id);

CREATE UNIQUE INDEX profiles_pkey ON public.profiles USING btree (id);

CREATE UNIQUE INDEX profiles_username_key ON public.profiles USING btree (username);

CREATE UNIQUE INDEX song_charts_pkey ON public.song_charts USING btree (id);

alter table "public"."groove_snippets" add constraint "groove_snippets_pkey" PRIMARY KEY using index "groove_snippets_pkey";

alter table "public"."profiles" add constraint "profiles_pkey" PRIMARY KEY using index "profiles_pkey";

alter table "public"."song_charts" add constraint "song_charts_pkey" PRIMARY KEY using index "song_charts_pkey";

alter table "public"."groove_snippets" add constraint "groove_snippets_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."groove_snippets" validate constraint "groove_snippets_user_id_fkey";

alter table "public"."profiles" add constraint "profiles_id_fkey" FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."profiles" validate constraint "profiles_id_fkey";

alter table "public"."profiles" add constraint "profiles_username_key" UNIQUE using index "profiles_username_key";

alter table "public"."song_charts" add constraint "song_charts_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."song_charts" validate constraint "song_charts_user_id_fkey";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.rls_auto_enable()
 RETURNS event_trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'pg_catalog'
AS $function$
DECLARE
  cmd record;
BEGIN
  FOR cmd IN
    SELECT *
    FROM pg_event_trigger_ddl_commands()
    WHERE command_tag IN ('CREATE TABLE', 'CREATE TABLE AS', 'SELECT INTO')
      AND object_type IN ('table','partitioned table')
  LOOP
     IF cmd.schema_name IS NOT NULL AND cmd.schema_name IN ('public') AND cmd.schema_name NOT IN ('pg_catalog','information_schema') AND cmd.schema_name NOT LIKE 'pg_toast%' AND cmd.schema_name NOT LIKE 'pg_temp%' THEN
      BEGIN
        EXECUTE format('alter table if exists %s enable row level security', cmd.object_identity);
        RAISE LOG 'rls_auto_enable: enabled RLS on %', cmd.object_identity;
      EXCEPTION
        WHEN OTHERS THEN
          RAISE LOG 'rls_auto_enable: failed to enable RLS on %', cmd.object_identity;
      END;
     ELSE
        RAISE LOG 'rls_auto_enable: skip % (either system schema or not in enforced list: %.)', cmd.object_identity, cmd.schema_name;
     END IF;
  END LOOP;
END;
$function$
;

grant delete on table "public"."groove_snippets" to "anon";

grant insert on table "public"."groove_snippets" to "anon";

grant references on table "public"."groove_snippets" to "anon";

grant select on table "public"."groove_snippets" to "anon";

grant trigger on table "public"."groove_snippets" to "anon";

grant truncate on table "public"."groove_snippets" to "anon";

grant update on table "public"."groove_snippets" to "anon";

grant delete on table "public"."groove_snippets" to "authenticated";

grant insert on table "public"."groove_snippets" to "authenticated";

grant references on table "public"."groove_snippets" to "authenticated";

grant select on table "public"."groove_snippets" to "authenticated";

grant trigger on table "public"."groove_snippets" to "authenticated";

grant truncate on table "public"."groove_snippets" to "authenticated";

grant update on table "public"."groove_snippets" to "authenticated";

grant delete on table "public"."groove_snippets" to "service_role";

grant insert on table "public"."groove_snippets" to "service_role";

grant references on table "public"."groove_snippets" to "service_role";

grant select on table "public"."groove_snippets" to "service_role";

grant trigger on table "public"."groove_snippets" to "service_role";

grant truncate on table "public"."groove_snippets" to "service_role";

grant update on table "public"."groove_snippets" to "service_role";

grant delete on table "public"."profiles" to "anon";

grant insert on table "public"."profiles" to "anon";

grant references on table "public"."profiles" to "anon";

grant select on table "public"."profiles" to "anon";

grant trigger on table "public"."profiles" to "anon";

grant truncate on table "public"."profiles" to "anon";

grant update on table "public"."profiles" to "anon";

grant delete on table "public"."profiles" to "authenticated";

grant insert on table "public"."profiles" to "authenticated";

grant references on table "public"."profiles" to "authenticated";

grant select on table "public"."profiles" to "authenticated";

grant trigger on table "public"."profiles" to "authenticated";

grant truncate on table "public"."profiles" to "authenticated";

grant update on table "public"."profiles" to "authenticated";

grant delete on table "public"."profiles" to "service_role";

grant insert on table "public"."profiles" to "service_role";

grant references on table "public"."profiles" to "service_role";

grant select on table "public"."profiles" to "service_role";

grant trigger on table "public"."profiles" to "service_role";

grant truncate on table "public"."profiles" to "service_role";

grant update on table "public"."profiles" to "service_role";

grant delete on table "public"."song_charts" to "anon";

grant insert on table "public"."song_charts" to "anon";

grant references on table "public"."song_charts" to "anon";

grant select on table "public"."song_charts" to "anon";

grant trigger on table "public"."song_charts" to "anon";

grant truncate on table "public"."song_charts" to "anon";

grant update on table "public"."song_charts" to "anon";

grant delete on table "public"."song_charts" to "authenticated";

grant insert on table "public"."song_charts" to "authenticated";

grant references on table "public"."song_charts" to "authenticated";

grant select on table "public"."song_charts" to "authenticated";

grant trigger on table "public"."song_charts" to "authenticated";

grant truncate on table "public"."song_charts" to "authenticated";

grant update on table "public"."song_charts" to "authenticated";

grant delete on table "public"."song_charts" to "service_role";

grant insert on table "public"."song_charts" to "service_role";

grant references on table "public"."song_charts" to "service_role";

grant select on table "public"."song_charts" to "service_role";

grant trigger on table "public"."song_charts" to "service_role";

grant truncate on table "public"."song_charts" to "service_role";

grant update on table "public"."song_charts" to "service_role";


  create policy "Users can delete own groove snippets."
  on "public"."groove_snippets"
  as permissive
  for delete
  to public
using ((auth.uid() = user_id));



  create policy "Users can insert their own groove snippets."
  on "public"."groove_snippets"
  as permissive
  for insert
  to public
with check ((auth.uid() = user_id));



  create policy "Users can update own groove snippets."
  on "public"."groove_snippets"
  as permissive
  for update
  to public
using ((auth.uid() = user_id));



  create policy "Users can view public or own groove snippets."
  on "public"."groove_snippets"
  as permissive
  for select
  to public
using (((is_public = true) OR (auth.uid() = user_id)));



  create policy "Public profiles are viewable by everyone."
  on "public"."profiles"
  as permissive
  for select
  to public
using (true);



  create policy "Users can insert their own profile."
  on "public"."profiles"
  as permissive
  for insert
  to public
with check ((auth.uid() = id));



  create policy "Users can update own profile."
  on "public"."profiles"
  as permissive
  for update
  to public
using ((auth.uid() = id));



  create policy "Users can delete own song charts."
  on "public"."song_charts"
  as permissive
  for delete
  to public
using ((auth.uid() = user_id));



  create policy "Users can insert their own song charts."
  on "public"."song_charts"
  as permissive
  for insert
  to public
with check ((auth.uid() = user_id));



  create policy "Users can update own song charts."
  on "public"."song_charts"
  as permissive
  for update
  to public
using ((auth.uid() = user_id));



  create policy "Users can view public or own song charts."
  on "public"."song_charts"
  as permissive
  for select
  to public
using (((is_public = true) OR (auth.uid() = user_id)));



