# Supabase CLI Reference for DrumCharter

This document tracks the correct command patterns for the Supabase CLI in this environment to prevent "trial-and-error" execution.

## Database Management

### 1. Link to Remote Project
**Pattern**: `npx supabase link --project-ref <PROJECT_ID>`
*Note: Requires interactive password input unless `SUPABASE_DB_PASSWORD` is set.*

### 2. Push Local Migrations to Remote
**Pattern**: `export SUPABASE_ACCESS_TOKEN=$(grep SUPABASE_ACCESS_TOKEN .env.junie | cut -d'=' -f2) && npx supabase db push --linked --yes`
*Note: Do NOT use `--project-ref` or `--project-id` with `db push`; it uses the linked state.*

### 3. Generate TypeScript Types
**Pattern**: `export SUPABASE_ACCESS_TOKEN=$(grep SUPABASE_ACCESS_TOKEN .env.junie | cut -d'=' -f2) && npx supabase gen types typescript --project-id <PROJECT_ID> > lib/supabase/database.types.ts`

### 4. Database Dump (Diagnostic)
**Pattern**: `export SUPABASE_ACCESS_TOKEN=$(grep SUPABASE_ACCESS_TOKEN .env.junie | cut -d'=' -f2) && npx supabase db dump --linked > dump.sql`

## Troubleshooting Notes

- **Unknown Flags**: The Supabase CLI flags vary significantly between subcommands (e.g., `gen types` uses `--project-id`, but `db push` does not).
- **Authentication**: Always use the `.env.junie` token for non-interactive sessions to ensure the CLI can communicate with the platform.
- **Environment Context**: This CLI version (2.78.1) requires the `--linked` flag for most remote operations if `supabase link` was previously performed.
