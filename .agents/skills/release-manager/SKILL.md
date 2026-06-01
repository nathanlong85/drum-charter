---
name: release-manager
description: Automates the promotion of code from the `staging` branch to the `main` branch (Production). Use this when the user is ready to deploy a stable staging build to production. It handles PR creation with a standardized timestamped naming convention and generates a summary of changes.
---

# 🚀 Release Manager

This skill manages the transition of code from `staging` to `main`. It ensures that every production deployment is traceable, summarized, and consistent with the project's "Vibe Coder" ritual.

## 🏙️ Deployment Conventions

### 1. PR Naming (The Standard)
Every deployment PR MUST follow this exact timestamped format:
`deploy: staging to main [YYYY-MM-DD-HH:mm]`
*Example: `deploy: staging to main [2026-04-01-17:45]`*

### 2. PR Body (The Summary)
The PR body must include a high-level summary of the changes since the last production deployment.
- Use `git log main..staging --oneline` to find the delta.
- Group changes into `Features`, `Fixes`, and `Chores`.

## 🛠️ The Workflow

1. **Verification**:
   - Ensure the `staging` branch is up-to-date and all CI checks are passing.
   - Verify that the `main` branch is also clean.

2. **PR Creation**:
   - Use `gh pr create` with the standardized title.
   - Link the PR to the "DrumCharter" project.
   - Assign the PR to `nathanlong85-ai`.

3. **Post-PR Ritual**:
   - Notify the user that the PR is ready for their final review and manual merge.
   - (Optional) Provide a link to the Vercel Preview URL for the `staging` branch.

## 🛡️ Safety Rules
- NEVER merge the PR yourself. Merging to `main` is a human-only task.
- Ensure no sensitive information is included in the PR summary.
- If there are merge conflicts between `main` and `staging`, ask the user to resolve them before proceeding.
