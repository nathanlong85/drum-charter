# CLI Reference: DrumCharter

This document tracks verified command patterns for CLI tools used in the
DrumCharter project. It serves as a "Source of Truth" to prevent trial-and-error
execution and ensure consistent environments.

## General Usage Rules

- **Before running ANY non-trivial CLI command**: Check this reference first.
- **If the command is missing**: Research official documentation, verify the
  syntax, execute it, and then add it to this file.
- **Environment Context**: Commands below are optimized for the current project
  structure and local development environment.

---

## Supabase CLI

The Supabase CLI manages our local Docker instance and synchronizes with the
remote production project.

### 1. Link to Remote Project

- **Goal**: Establish a connection between the local environment and a specific
  Supabase project.
- **Command**: `npx supabase link --project-ref <PROJECT_REF>`
- **Prerequisites**: Requires interactive password input unless
  `SUPABASE_DB_PASSWORD` is set.
- **Pitfalls**: Ensure you are using the `Project REF` (e.g.,
  `tpltsrzxjtnngsgqekma`), not the Project Name.

### 2. Generate TypeScript Types

- **Goal**: Pull the remote database schema and generate TypeScript definitions
  for end-to-end type safety.
- **Command**: `export SUPABASE_ACCESS_TOKEN=$(grep SUPABASE_ACCESS_TOKEN .env.junie | cut -d'=' -f2) && npx supabase gen types typescript --project-id <PROJECT_REF> > lib/supabase/database.types.ts`
- **Prerequisites**: Requires `.env.junie` with a valid
  `SUPABASE_ACCESS_TOKEN`.
- **Pitfalls**: Uses `--project-id` flag, which differs from other commands.

### 3. Synchronize Local Data (Seed)

- **Goal**: Dump data from the remote "public" schema to a local seed file for
  Docker initialization.
- **Command**: `export SUPABASE_ACCESS_TOKEN=$(grep SUPABASE_ACCESS_TOKEN .env.junie | cut -d'=' -f2) && npx supabase db dump --linked --data-only --schema "public" > supabase/seed.sql`
- **Prerequisites**: Requires the remote project to be linked.
- **Pitfalls**: `--data-only` must be paired with a specific schema (usually
  `public`) to avoid dumping system metadata.

### 4. Push Local Migrations

- **Goal**: Apply local SQL migration files to the remote production database.
- **Command**: `export SUPABASE_ACCESS_TOKEN=$(grep SUPABASE_ACCESS_TOKEN .env.junie | cut -d'=' -f2) && npx supabase db push --linked --yes`
- **Prerequisites**: Requires linked state and `.env.junie` token.
- **Pitfalls**: Do NOT use `--project-ref` or `--project-id` here; it relies on
  the `--linked` state.

---

## Git & History Management

Commands for maintaining a clean, correctly attributed repository history.

### 1. Rewrite Author Identity (Bulk)

- **Goal**: Update the name and email for all previous commits in the
  repository.
- **Command**: `FILTER_BRANCH_SQUELCH_WARNING=1 git filter-branch --force --env-filter 'CORRECT_NAME="Nathan Long" CORRECT_EMAIL="nathanlong85@gmail.com" export GIT_AUTHOR_NAME="$CORRECT_NAME" export GIT_AUTHOR_EMAIL="$CORRECT_EMAIL" export GIT_COMMITTER_NAME="$CORRECT_NAME" export GIT_COMMITTER_EMAIL="$CORRECT_EMAIL"' --tag-name-filter cat -- --branches --tags`
- **Prerequisites**: Working directory must be clean (stash changes first).
- **Pitfalls**: This is a destructive operation that changes commit hashes. A
  `git push --force` is required afterward.

---

## Playwright (E2E Testing)

Commands for running automated browser tests against the local development
environment.

### 1. Run Targeted E2E Tests

- **Goal**: Execute a specific test suite against the local Supabase/Next.js
  stack.
- **Command**: `npx playwright test <PATH_TO_SPEC> --project=chromium --timeout 180000 --workers 1`
- **Prerequisites**: Local Supabase (`supabase start`) and Next.js (`pnpm dev`)
  must be running.
- **Pitfalls**: Default timeouts may be too short for heavy database operations;
  use `--timeout` to increase stability.

---

## Slow Commands & Timeout Management

Junie's terminal environment has a default 60-second timeout for `bash`
commands. Some tools (e.g., full test suites, CodeRabbit scans, complex
Playwright tests) frequently exceed this.

### 1. The `timeout` Parameter

- **Usage**: When Junie executes a `bash` command, she can pass a `timeout`
  parameter (in seconds).
- **Maximum**: 3600 (1 hour).
- **Rule**: ALWAYS use an explicit high timeout (e.g., 300+) for the following
  "Slow Commands":
  - `npx playwright test ...`
  - `coderabbit review ...`
  - `npx vitest run` (in large modules)
  - `pnpm install` (initial or major updates)

### 2. Verified Slow Command Patterns

| Tool | Recommended Timeout | Notes |
| :--- | :--- | :--- |
| CodeRabbit Review | 300s | `coderabbit review --base main --prompt-only --plain` |
| Playwright (Full) | 600s | `npx playwright test --project=chromium` |
| Playwright (Single) | 180s | `npx playwright test <FILE> --project=chromium` |
| Vitest (Full) | 120s | `npx vitest run` |
| Supabase Start | 180s | Initial Docker image pulls can be slow. |
