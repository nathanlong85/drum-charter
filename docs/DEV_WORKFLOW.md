# DrumCharter Development Workflow

This document summarizes the professional, local-first development process for the DrumCharter project.

## 🚀 The Agent Workflow

For agents (like Gemini CLI), the single source of truth for detailed implementation protocols is located in the **`.gemini/rules/`** directory.

### Core Protocols

1. **Work Initialization**: Branching, pulling, and status updates (see `WORKFLOW_PROTOCOL.md`).
2. **Implementation**: Technical standards and surgical changes (see `WORKFLOW_PROTOCOL.md`).
3. **Verification**: Linting, testing, and "Definition of Done" (see `WORKFLOW_PROTOCOL.md`).
4. **PR & Review**: The Copilot iterative loop (see `PR_REVIEW_PROTOCOL.md`).

## 🛠️ Infrastructure Overview

* **Frontend**: Next.js 16 on Port `3001`.
* **Database**: Supabase Local on Port `54321`.
* **Verification**: `verify_done.sh` must be run before any PR.

## Linting and CI

* **Lint (canonical)**: `pnpm lint` (Biome) and `pnpm lint:md` (markdownlint). ESLint is not used in CI.
* **Unit tests**: `pnpm test:run` and `pnpm test:coverage` (Vitest + v8 coverage).
* **E2E**: `pnpm test:e2e` requires Docker Supabase (`npx supabase start`), Playwright Chromium, and a healthy app on port `3001`. Offline PWA specs use `RUN_OFFLINE_E2E=true`.
* **Primary CI**: CircleCI (see `.circleci/config.yml`). GitHub Actions workflows are manual/secondary.

## 🤝 Human Collaboration

* **PR Review**: All code must pass automated CI and Copilot reviews before being presented to the human author for final sign-off.
* **Merging**: Merging into `staging` or `main` is a human-only action.

---
*For detailed behavioral expectations, refer to `.gemini/rules/BEHAVIORAL_GUIDELINES.md`.*
