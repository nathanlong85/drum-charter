# Workflow Protocol

This document outlines the mandatory process for initialization, implementation, and verification.

## 1. Work Initialization (Mandatory)

1. **Switch & Pull**: `git checkout staging && git pull origin staging`.
2. **Branch**: `git checkout -b feature/issue-number-description`.
3. **Project Status**: Mark corresponding issue as "In Progress" on the project board.
4. **Skill Activation**: Activate and read ALL relevant skills for the task (e.g., `vitest`, `accessibility`).

## 2. Implementation Standards (MANDATORY)

- **Test-Driven First**: No code changes are allowed without an accompanying test plan. If it's a bug fix, **you MUST reproduce it with a test first**. If it's a feature, **you MUST define the success criteria in code (tests) before or during implementation**.
- **No Test = Incomplete**: Any directive that results in code changes without tests is a failure to meet the Senior Engineer standard.
- **Surgical Changes**: Touch only what you must. Match existing style.
- **Simplicity**: Minimum code to solve the problem. No speculative abstractions.
- **Goal-Driven**: Define success criteria. Verify behavioral correctness via automated tests before considering a sub-task done.

## 3. Verification & Definition of Done

> [!IMPORTANT]
> **CIRCLECI MIGRATION**: We have migrated our CI/CD from GitHub Actions to CircleCI to utilize its more generous free tier. All automated checks now run on CircleCI.

Work is ONLY "Done" when the following are met:

1. **Clean Lint**: `pnpm lint` and `pnpm lint:md` must return ZERO errors AND ZERO warnings.
2. **Full Suite Pass**: `verify_done.sh` must return a total pass.
3. **Automated Verification**: `pnpm test:run` (Unit) and `pnpm test:e2e` (E2E) must pass.
4. **CircleCI Pass**: All CircleCI workflow jobs must be PASSING.
5. **Copilot Loop**: The PR review from `@copilot` must be clean (all findings addressed).
6. **Checklist Reporting**: Provide a "Definition of Done Checklist" before final sign-off.

## 4. Committing

- **Attribution**: Commits must be made exclusively on behalf of the configured git user.
- **Message Style**: Clear, concise, focusing on "why" rather than "what". Matches existing project style.
- **No Co-authoring**: Do not add co-author trailers.
