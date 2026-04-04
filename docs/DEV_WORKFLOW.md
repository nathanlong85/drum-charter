# DrumCharter Development Workflow

This document outlines the professional, local-first development process for the DrumCharter project. Following these steps ensures code quality, prevents production data pollution, and maintains a clean git history.

## 1. Local-First Infrastructure

All development and testing must happen in an isolated local environment.

* **Frontend Server**: `pnpm dev --port 3001` (avoiding port 3000 conflicts with other local services).
* **Supabase Local**: `npx supabase start` (running on `http://localhost:54321`).
* **Database Schema**: Synchronized via managed migrations in `supabase/migrations/`.

## 2. Feature & Bugfix Workflow

We use a strict branching and PR-based feedback loop for all code changes.

### Step 2.1: Branching

Always create a new branch from `staging` for any new task:

```bash
git checkout staging
git pull origin staging
git checkout -b feature/your-feature-name
```

### Step 2.2: Implementation & Testing

* Implement changes using the **General Guidelines** (Simplicity First, Surgical Changes).
* Write or update unit/E2E tests for every change.
* **Verification Rule**: No task is complete until **all tests are passing** and **all linting is clean**.
* Verify changes locally (using high timeouts where necessary per CLI reference):
  * Lint: `pnpm lint` & `pnpm lint:md`
  * Unit: `pnpm test:run`
  * E2E: `pnpm exec playwright test --project=chromium`

### Step 2.3: Verification

Ensure changes are fully verified locally before pushing:
* Lint: `pnpm lint` & `pnpm lint:md`
* Unit: `pnpm test:run`
* E2E: `pnpm exec playwright test --project=chromium`

### Step 2.4: Committing

Attribute all commits to the user only:

```bash
git add .
git commit -m "feat/fix: descriptive message"
```

## 3. Documentation & Rule Updates (Fast-Track)

For non-code changes (e.g., updates to `.gemini/rules/*.md`, `docs/*.md`, or `CHANGELOG.md`), a simplified workflow is used.

1. **Edit**: Changes are made locally.
2. **Lint**: Run `pnpm lint:md`.
3. **Commit & Push**: Push once verified.

## 4. Pull Request & Code Review

We leverage automated and human feedback before any code is merged into `staging`.

### Step 4.1: Push & Open PR

Push your branch to GitHub and open a Pull Request against the `staging` branch. Always include a detailed Markdown description.

### Step 4.2: Copilot Review Loop

* **Request Review**: Trigger a review from **Copilot** on the PR.
* **Iterative Feedback**:
  * Poll for Copilot comments and CI check results.
  * Address **ALL** relevant findings or flag conflicts for human decision.
  * Repeat until the review is clean and all CI checks pass.

### Step 4.3: Human Quality Gate

* **Discussion**: Nate (the human) will review the code and provide qualitative feedback.
* **Final Approval**: Nate merges the PR into `staging` once satisfied.

## 5. Production Release (Staging to Main)

Once features are stable on `staging` and verified in the staging environment, they are promoted to `main`.

* **Responsibility**: Merging into `main` is a human-only task, usually automated via the `release-manager` skill which creates the PR.
* **Squash Merge**: Features are squashed into `staging`. The promotion from `staging` to `main` is typically a merge commit or fast-forward to preserve history.
* **Author Attribution**: Ensure the commit is correctly attributed to the human author.

## 6. Security & Secret Management

* **.env.junie**: Used for collaborative secrets (e.g., Supabase CLI tokens) shared with Junie.
* **.env.private**: Reserved for human-only secrets. Junie is strictly forbidden from reading this file.
* **GitHub Secrets**: Used for CI/CD automation.
