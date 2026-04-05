# Project Structure & Standards

## 📖 Sources of Truth

* **Project Plan**: `docs/PROJECT_PLAN.md` (Read at session start, update after every task).
* **Workflow**: `docs/DEV_WORKFLOW.md`.
* **Secrets**: `docs/SECRETS_MANAGEMENT.md` (Never read `.env.private`).

## 🏗️ Technical Stack

* **Framework**: Next.js 16 (App Router, Server Components/Actions).
* **Backend**: Supabase (`@supabase/ssr`, strict RLS).
* **Styling**: Tailwind CSS 4 (Utility-first, CSS variables).
* **Testing**: Vitest (Unit/Integration), Playwright (E2E).

## 💻 Local Development

* **Next.js**: Runs on port `3001`.
* **Supabase**: Local Docker instance on `http://localhost:54321`.
* **Database**: Migrations in `supabase/migrations/`.
* **Default Branch**: `staging` is the default branch for active development. `main` is reserved for production releases.

## 🛠️ Engineering Excellence

* **Modular**: DRY, reusable code. Consolidate logic into clean abstractions.
* **Type Safety**: End-to-end TypeScript from DB to UI.
* **Performance**: Bundle size awareness, minimal re-renders, efficient DB queries.
* **Documentation**: High-quality TSDoc, READMEs, and CHANGELOGs.
