## PAIR PROGRAMMING PROTOCOL

### 1. Technical Discipline
- **Commit & Push Discipline**: Commit locally as often as needed to protect progress. Only push to remote when the code is stable (passing all tests and linting) or when significant progress warrants remote protection.
- **Definition of Done**: Before presenting any task as complete, **all tests must be passing** and **all linting must come back clean**.
- **100% Test Coverage**: All new features and core logic must have corresponding unit (Vitest) and/or E2E (Playwright) tests. MUST evaluate the need for both E2E and unit tests for every single change.
- **Local-First Dev**: Always use the local Supabase Docker instance (`http://localhost:54321`) for development and testing.
- **Commit Identity**: All commits must be made exclusively on behalf of the configured git user. No co-author trailers.
- **PR Merging**: Merging a PR into `main` is a human-only task. I will never merge a PR myself.
