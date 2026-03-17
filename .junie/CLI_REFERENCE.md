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
- **Option Safety**: Only use CLI options that are explicitly known to exist for
  a command. If unsure, consult the command's `--help` or official documentation
  first. Do NOT assume an option (like `--timeout`) exists for a tool unless
  verified.
- **Suppress Noise**: When running tests or CLI commands that emit redundant
  environment warnings (e.g., Node's `NO_COLOR` vs `FORCE_COLOR` conflict),
  proactively suppress them by unsetting `NO_COLOR` (e.g.,
  `unset NO_COLOR && npx playwright test`).

---

## The `timeout` Parameter (Agent Level)

Junie's terminal environment has a default 60-second timeout for `bash`
commands. This is an **agent-level parameter** passed to the `bash` tool,
NOT a CLI option for the commands themselves.

- **Usage**: When Junie executes a `bash` command, she must pass the `timeout`
  parameter (in seconds) in the tool call, NOT as part of the command string.
- **Example (Correct)**: `bash({ command: "pnpm install", timeout: 300 })`
- **Example (Incorrect)**: `bash({ command: "pnpm install --timeout 300" })`
- **Example (Incorrect)**: `bash({ command: "coderabbit review --timeout 300" })`
- **Maximum**: 3600 (1 hour).
- **Rule**: ALWAYS use an explicit high `timeout` parameter for "Slow Commands".

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

## CodeRabbit (Local Code Review)

Commands for running AI-powered code reviews using the CodeRabbit CLI. Use the `code-review` agent skill as the primary guide for this workflow.

### 1. Run Structured Local Review Loop

- **Goal**: Address code quality issues in a 3-loop state machine using the local `coderabbit` CLI.
- **Protocol**:
    - **Loop 1**: Address **ALL** findings (Critical, Major, Minor, Trivial).
    - **Loop 2**: Address ONLY **Critical** and **Major** findings.
    - **Loop 3**: Address ONLY **Critical** and **Major** findings.
- **Command**: `coderabbit review --base main --prompt-only`
- **Recommended Timeout**: 3600s (Agent-level `timeout` parameter)
- **Prerequisites**: Must be logged in (`coderabbit auth login`). Current branch must have changes relative to `main`.
- **Pitfalls**: Ensure `main` is up-to-date before running the review to avoid stale diffs. Do NOT use `--timeout` as a CLI flag; it is an agent-level `bash` tool parameter.

---

## Slow Commands & Timeout Management

Some tools frequently exceed the 60s default. Use the agent-level `timeout`
parameter for these.

### 1. Verified Slow Command Patterns

| Tool | Recommended Timeout | Notes |
| :--- | :--- | :--- |
| CodeRabbit Review | 3600s | `coderabbit review --base main --prompt-only` |
| Playwright (Full) | 600s | `npx playwright test --project=chromium` |
| Playwright (Single) | 180s | `npx playwright test <FILE> --project=chromium` |
| Vitest (Full) | 120s | `npx vitest run` |
| Supabase Start | 180s | Initial Docker image pulls can be slow. |
| Sleep (>60s) | [Duration] + 10s | e.g., `sleep 70` needs `timeout: 80` |
