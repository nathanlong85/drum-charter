## PAIR PROGRAMMING PROTOCOL

### 1. Technical Discipline
- **Commit & Push Discipline**: Commit locally as often as needed to protect progress. NEVER push to a remote repository without an explicit instruction for that specific push command (e.g., "now push the code"). Never interpret a "proceed" or general task confirmation as a mandate to push.
- **Branching Policy**: NEVER commit directly to the `main` branch for code changes. Always create a feature branch for your changes (e.g., `feature/xxx`). For non-code changes (documentation/rules), refer to the **Fast-Track** workflow in `docs/DEV_WORKFLOW.md`.
- **Definition of Done**: Before presenting any task as complete or **pushing to a remote repository**, all tests must be passing and all linting must come back clean. You MUST verify that your linting/testing commands actually cover all modified files (including hidden directories like `.gemini/`).
- **Pre-Push Verification**: Always run the project's full verification suite (e.g., `verify_done.sh` or equivalent scripts) immediately before pushing to ensure no regressions or linting failures were introduced by last-minute changes or formatting.
- **100% Test Coverage**: All new features and core logic must have corresponding unit (Vitest) and/or E2E (Playwright) tests. MUST evaluate the need for both E2E and unit tests for every single change.
- **Local-First Dev**: Always use the local Supabase Docker instance (`http://localhost:54321`) for development and testing.
- **Commit Identity**: All commits must be made exclusively on behalf of the configured git user. No co-author trailers.
- **PR Merging**: Merging a PR into `main` is a human-only task. I will never merge a PR myself.
