# Core Concepts & Tech Stack

## 🏗️ Technical Stack

* **Framework**: Next.js 16 (App Router, Server Components/Actions).
* **Language**: TypeScript 5.
* **Styling**: Tailwind CSS 4 (Utility-first, CSS variables).
* **Backend**: Supabase (`@supabase/ssr`, strict RLS).
* **Testing**: Vitest (Unit/Integration), Playwright (E2E).
* **Linting/Formatting**: Biome (Linting/Formatting), Markdownlint (Docs).

## 📌 Project Identity

* **Owner**: `nathanlong85`
* **Repo**: `drum-charter`
* **Full Repo**: `nathanlong85/drum-charter`
* **Project Name**: `DrumCharter`
* **Project ID (Database ID)**: `PVT_kwHOAXHd784BRkBi` (Project #2)
* **User (Nathan)**: `nathanlong85`
* **AI Agent User**: `nathanlong85-ai`

## 📖 Sources of Truth

* **Project Plan**: `docs/PROJECT_PLAN.md` (Read at session start, update after every task).
* **Workflow**: `docs/DEV_WORKFLOW.md`.
* **Secrets**: `docs/SECRETS_MANAGEMENT.md` (Never read `.env.private`).

## 💻 Environment & Branching

* **Next.js**: Runs on port `3001`.
* **Supabase**: Local Docker instance on `http://localhost:54321`.
* **Default Branch**: `staging` is for active development. `main` is for production releases.
* **Release Flow**: `feature/issue` -> `staging` -> `main` (via Human).

## 🚀 Next.js Mandate
**ALWAYS read docs before coding.** Before any Next.js work, find and read the relevant doc in `node_modules/next/dist/docs/`. Your training data is outdated — the docs are the source of truth.
