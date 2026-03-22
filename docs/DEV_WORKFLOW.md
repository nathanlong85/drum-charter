# DrumCharter Development Workflow

This document outlines the professional, local-first development process for the DrumCharter project. Following these steps ensures code quality, prevents production data pollution, and maintains a clean git history.

## 1. Local-First Infrastructure

All development and testing must happen in an isolated local environment.

- **Frontend Server**: `pnpm dev --port 3001` (avoiding port 3000 conflicts with other local services).
- **Supabase Local**: `npx supabase start` (running on `http://localhost:54321`).
- **Database Schema**: Synchronized via managed migrations in `supabase/migrations/`.

## 2. Feature & Bugfix Workflow

We use a strict branching and PR-based feedback loop for all code changes.

### Step 2.1: Branching

Always create a new branch from `main` for any new task:

```bash
git checkout main
git pull origin main
git checkout -b feature/your-feature-name
```

### Step 2.2: Implementation & Testing

- Implement changes using the **Karpathy Guidelines** (Simplicity First, Surgical Changes).
- Write or update unit/E2E tests for every change.
- **Verification Rule**: No task is complete until **all tests are passing** and **all linting is clean**.
- Verify changes locally (using high timeouts where necessary per CLI reference):
  - Lint: `npm run lint` & `npm run lint:md`
  - Lint Fix: `npm run lint:fix` (Uses Biome)
  - Unit: `npx vitest run`
  - E2E: `npx playwright test --project=chromium`

### Step 2.3: Local Code Review

Run `coderabbit review --base main --no-color` (Expected runtime: ~300s) to catch issues early and ensure all CodeRabbit standards are met before pushing.

### Step 2.4: Committing

Attribute all commits to the user only:

```bash
git add .
git commit -m "feat/fix: descriptive message"
```

## 3. Documentation & Rule Updates (Fast-Track)

For non-code changes (e.g., updates to `.gemini/rules/*.md`, `docs/*.md`, or `CHANGELOG.md`), a simplified workflow is used to maintain speed without sacrificing quality.

1. **Edit**: Changes are made locally (on a feature branch or `main` as directed).
2. **Lint**: Run `npm run lint:md` to ensure formatting is correct.
3. **Review**: Present the `git diff` of the changes for human review.
4. **Commit**: Only commit once the human gives explicit approval (e.g., "looks good" or "approve").
5. **Push**: NEVER push to the remote repository until explicitly instructed (e.g., "Now push this to main").

## 4. Pull Request & Code Review

We leverage automated and human feedback before any code is merged into `main`.

### Step 3.1: Push & Open PR

Push your branch to GitHub and open a Pull Request. Always include a detailed Markdown description.

### Step 3.2: CodeRabbit Review Protocol

- **Asynchronous Feedback**: Once a Pull Request is opened or a push is made to an existing PR, CodeRabbit will automatically scan the code.
- **Manual Check**: Junie will only check for CodeRabbit feedback when you explicitly ask (e.g., "Check CodeRabbit," "Is the review done?").
- **Three-Loop Feedback Guardrails**:
  - **Loop 1**: Address all severities (`Critical` to `Trivial/Nitpick`).
  - **Loops 2-3**: Address only `Critical` and `Major` severities.
  - **Termination**: The task is complete if Loop 3 returns zero `Critical`/`Major` items.
- **Disagreement Protocol**: Junie will flag any suggestions that conflict with project goals or established preferences for human decision.
- **No "False Completeness"**: Junie will only report "All addressed" when the current loop's required severities are empty AND the PR status is no longer `CHANGES_REQUESTED`.
- **Approval Before Fixes**: Junie will summarize all findings and seek your explicit approval before applying any fixes.

### Step 3.3: Human Quality Gate

- **Discussion**: Nate (the human) will review the code and provide qualitative feedback.
- **Final Approval**: Address any human-requested changes until Nate gives the final approval.

## 4. Merging

- **Responsibility**: Merging is a human-only task.
- **Squash Merge**: All features are squashed into a single commit on `main` to keep the history clean.
- **Author Attribution**: Ensure the squashed commit is correctly attributed to the human author.

## 5. Security & Secret Management

- **.env.junie**: Used for collaborative secrets (e.g., Supabase CLI tokens) shared with Junie.
- **.env.private**: Reserved for human-only secrets. Junie is strictly forbidden from reading this file.
- **GitHub Secrets**: Used for CI/CD automation.
