
  create table "public"."notebooks" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" uuid not null default auth.uid(),
    "title" text not null,
    "sections" jsonb not null default '[]'::jsonb,
    "tags" text[] default '{}'::text[],
    "is_public" boolean default false,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
      );


alter table "public"."notebooks" enable row level security;

CREATE UNIQUE INDEX notebooks_pkey ON public.notebooks USING btree (id);

alter table "public"."notebooks" add constraint "notebooks_pkey" PRIMARY KEY using index "notebooks_pkey";

alter table "public"."notebooks" add constraint "notebooks_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) not valid;

alter table "public"."notebooks" validate constraint "notebooks_user_id_fkey";

grant delete on table "public"."notebooks" to "anon";

grant insert on table "public"."notebooks" to "anon";

grant references on table "public"."notebooks" to "anon";

grant select on table "public"."notebooks" to "anon";

grant trigger on table "public"."notebooks" to "anon";

grant truncate on table "public"."notebooks" to "anon";

grant update on table "public"."notebooks" to "anon";

grant delete on table "public"."notebooks" to "authenticated";

grant insert on table "public"."notebooks" to "authenticated";

grant references on table "public"."notebooks" to "authenticated";

grant select on table "public"."notebooks" to "authenticated";

grant trigger on table "public"."notebooks" to "authenticated";

grant truncate on table "public"."notebooks" to "authenticated";

grant update on table "public"."notebooks" to "authenticated";

grant delete on table "public"."notebooks" to "service_role";

grant insert on table "public"."notebooks" to "service_role";

grant references on table "public"."notebooks" to "service_role";

grant select on table "public"."notebooks" to "service_role";

grant trigger on table "public"."notebooks" to "service_role";

grant truncate on table "public"."notebooks" to "service_role";

grant update on table "public"."notebooks" to "service_role";


  create policy "Users can create their own notebooks"
  on "public"."notebooks"
  as permissive
  for insert
  to public
with check ((auth.uid() = user_id));



  create policy "Users can delete own notebooks"
  on "public"."notebooks"
  as permissive
  for delete
  to public
using ((auth.uid() = user_id));



  create policy "Users can update own notebooks"
  on "public"."notebooks"
  as permissive
  for update
  to public
using ((auth.uid() = user_id));



  create policy "Users can view own or public notebooks"
  on "public"."notebooks"
  as permissive
  for select
  to public
using (((auth.uid() = user_id) OR (is_public = true)));



