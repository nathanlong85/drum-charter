# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Loading Required Local Rules

### Local Claude separated rules

**Always check and follow all rules in `.claude/rules/local/`** at session start, even though that directory is gitignored.

### Local CLAUDE.* monolith rules

@CLAUDE.local.md
@.claude/CLAUDE.local.md

## Commands

```bash
# Development
pnpm dev                # Start dev server on http://localhost:3001
npx supabase start      # Start local Supabase (requires Docker)
npx supabase stop
npx supabase db reset   # Wipe local data and re-run migrations/seeds

# Build & Deploy
pnpm build
pnpm start

# Linting (must be zero errors AND zero warnings before done)
pnpm lint               # Biome lint
pnpm lint:md            # Markdownlint
pnpm lint:fix           # Auto-fix Biome issues

# Unit tests (Vitest, jsdom, all files except tests/e2e/)
pnpm test:run           # Run once
pnpm test               # Watch mode
pnpm test:ui            # Browser dashboard

# E2E tests (Playwright, Chrome only, builds app first unless SKIP_BUILD=true)
pnpm test:e2e
SKIP_BUILD=true pnpm test:e2e   # Reuse running dev server
npx playwright show-report
npx playwright test --debug

# Database type generation (run after schema changes)
npx supabase gen types typescript --local > lib/supabase/database.types.ts
```

A single Vitest test file can be run with `pnpm vitest run path/to/test.ts`. A single Playwright spec: `npx playwright test tests/e2e/foo.spec.ts`.

## Architecture

### Stack
- **Next.js 16** (App Router, Server Components, Server Actions, `--webpack` flag required)
- **React 19**, **TypeScript 5**, **Tailwind CSS 4** (CSS variables, JIT)
- **Supabase** (`@supabase/ssr`, strict RLS) — local Docker on port 54321
- **Serwist** — PWA/service worker (disabled in dev unless `NEXT_PUBLIC_FORCE_SW=true`)
- **Biome** — linting and formatting (2-space indent, single quotes, 100-char lines)
- **Vitest** + **Playwright** — unit and E2E testing

### Directory layout

```text
app/                    # Next.js App Router
  (app)/                # Authenticated route group
    dashboard/
    library/            # Cross-content search/browse
    songs/              # Song chart editor routes
    notebooks/
    snippets/
    setlists/
    settings/
  public/               # Unauthenticated share routes
  auth/                 # Supabase auth callback
  login/
  layout.tsx            # Root layout (theme, fonts, PWA, service worker)
  globals.css / print.css

components/             # React components, organized by domain
  groove/               # GrooveGridEditor, InstrumentRow, NoteCell, SymbolPicker, etc.
  chart/                # SongEditor, SongChartView, LiveModeView
  notebook/
  setlist/
  library/
  common/               # Shared UI (ThemeProvider, OfflineStatus, etc.)
  layout/
  */  __tests__/        # Co-located unit tests

lib/
  types/groove.ts       # Core domain types (DrumSymbol, GrooveGrid, SongChart, etc.)
  state/groove-reducer.ts  # useReducer logic for the groove grid
  services/supabase-service.ts  # All Supabase CRUD (single data access layer)
  actions/item-actions.ts  # Next.js Server Actions (create/delete/share items)
  hooks/                # useAudioPlayback, useAutosave, useRemoteControl, useSupabaseStatus
  supabase/             # client.ts, server.ts, middleware.ts, database.types.ts
  utils/                # id.ts, format.ts, rowPresets.ts

supabase/
  migrations/           # SQL migrations (apply locally with `npx supabase db push`)
  seed.sql

tests/
  e2e/                  # Playwright specs + auth.setup.ts
  e2e/poms/             # Page Object Models
  unit/                 # Standalone unit tests not co-located with components
```

### Core data model (`lib/types/groove.ts`)
The central entity is `GrooveGrid` — an array of `DrumInstrument` rows, each holding a `notes[]` (indexed by beat) and `velocities[]`. Beat count is derived from `measures × resolution × beatsPerMeasure / beatValue`. Domain union types (`DrumSymbol`, `DrumCategory`) drive the symbol picker and audio engine. `SongChart`, `Notebook`, `Setlist`, and `GrooveSnippet` all embed `GrooveGrid` instances.

### Groove grid state
The groove grid uses React's `useReducer` (`lib/state/groove-reducer.ts`) wrapped in a React Context (`components/groove/GrooveGridContext.tsx`). The context also owns playback state via `useAudioPlayback`. Dispatch actions (`GrooveAction`) are the only way to mutate grid state — no direct state writes.

### Data flow
Server Actions (`lib/actions/item-actions.ts`) call `supabaseService` (`lib/services/supabase-service.ts`), which handles all serialisation between domain types and Supabase JSON columns. `migrateGrooveGrid` in the service handles backward-compatible data migration. `useAutosave` debounces client-side saves through the service.

### Auth & routing
`lib/supabase/middleware.ts` refreshes Supabase sessions on every request and injects `x-pathname` into headers. Public routes under `app/public/` are accessible without authentication; all `(app)/` routes expect a session (currently unenforced in middleware but protected via Server Actions).

### Branching & Git Workflow
Active development targets the `staging` branch. `main` is production-only. Feature branches: `feature/<issue-number>-description` → PR → `staging`. Merging to `staging` or `main` is a human action — never merge programmatically.

**⚠️ CRITICAL: Minimize CircleCI Builds**
Each push to `staging` triggers a full CircleCI run (lint, unit tests, build, 4x e2e shards). This has a quota limit. **Batch related commits into fewer pushes:**
- ❌ BAD: Push after each fix, file change, or lock file update → 4+ builds wasted
- ✅ GOOD: Stage multiple related changes, commit once, push once → 1 build

Make multiple commits if needed (for clarity), but push only once or twice per logical change set.

### Path alias
`@` resolves to the repository root (configured in `vitest.config.ts` and `tsconfig.json`).

### E2E test setup
Playwright uses a `setup` project (`tests/e2e/auth.setup.ts`) to create an authenticated session stored in `playwright/.auth/user.json`. All other specs declare a dependency on `setup`. Tests run against a built app by default; set `SKIP_BUILD=true` to target the running dev server.
