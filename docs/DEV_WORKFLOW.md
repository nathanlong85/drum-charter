# DrumCharter Development Workflow

This document outlines the professional, local-first development process for the DrumCharter project. Following these steps ensures code quality, prevents production data pollution, and maintains a clean git history.

## 1. Local-First Infrastructure
All development and testing must happen in an isolated local environment.

- **Frontend Server**: `pnpm dev --port 3001` (avoiding port 3000 conflicts with other local services).
- **Supabase Local**: `npx supabase start` (running on `http://localhost:54321`).
- **Database Schema**: Synchronized via managed migrations in `supabase/migrations/`.

## 2. Feature & Bugfix Workflow
We use a strict branching and PR-based feedback loop.

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
- Verify changes locally (using high timeouts where necessary per CLI reference):
  - Unit: `npx vitest run`
  - E2E: `npx playwright test --project=chromium`

### Step 2.3: Committing
Attribute all commits to the user only:
```bash
git add .
git commit -m "feat/fix: descriptive message"
```

## 3. Pull Request & Code Review
We leverage automated and human feedback before any code is merged into `main`.

### Step 3.1: Push & Open PR
Push your branch to GitHub and open a Pull Request. Always include a detailed Markdown description.

### Step 3.2: CodeRabbit Review Protocol
- **Asynchronous Feedback**: Once a Pull Request is opened or a push is made to an existing PR, CodeRabbit will automatically scan the code.
- **Manual Check**: Junie will only check for CodeRabbit feedback when you explicitly ask (e.g., "Check CodeRabbit," "Is the review done?").
- **Review Status Check**:
    - If the review is still "Pending" or "In Progress," Junie will notify you and **do nothing else**, waiting for your next instruction to check again.
    - If complete, Junie will perform a structured review of all unresolved (`isResolved: false`) and current (`isOutdated: false`) comments.
- **No "False Completeness"**: Junie will only report "All addressed" when there are zero active comments AND the PR status is no longer `CHANGES_REQUESTED`.
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
