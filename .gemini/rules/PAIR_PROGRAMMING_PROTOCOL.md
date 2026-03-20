## PAIR PROGRAMMING PROTOCOL

### 1. Technical Discipline
- **Commit & Push Discipline**: Commit locally as often as needed to protect progress. You ARE permitted to push to remote feature branches (never to `main`) and open Pull Requests once you have verified your changes using the `definition-of-done` skill.
- **Branching Policy**: NEVER commit directly to the `main` branch for code changes. Always create a feature branch for your changes (e.g., `feature/xxx`). For non-code changes (documentation/rules), refer to the **Fast-Track** workflow in `docs/DEV_WORKFLOW.md`.
- **Definition of Done**: Before presenting any task as complete or **pushing to a remote repository**, you MUST verify your work using the **`definition-of-done` skill**. This ensures all linting is clean, all tests are passing (covering 100% of new code), and the local CodeRabbit feedback loop has been completed.
- **Pre-Push Verification**: ALWAYS run the `definition-of-done` skill before pushing. This will execute the CodeRabbit review loop followed by the project's full verification suite via `./.agents/skills/definition-of-done/scripts/verify_done.sh`. Do not push if any checks fail.
- **100% Test Coverage**: All new features and core logic must have corresponding unit (Vitest) and/or E2E (Playwright) tests. MUST evaluate the need for both E2E and unit tests for every single change.
- **Local-First Dev**: Always use the local Supabase Docker instance (`http://localhost:54321`) for development and testing.
- **Commit Identity**: All commits must be made exclusively on behalf of the configured git user. No co-author trailers.
- **PR Merging**: Merging a PR into `main` is a human-only task. I will never merge a PR myself.
