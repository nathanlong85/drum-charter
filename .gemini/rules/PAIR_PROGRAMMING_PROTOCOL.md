# PAIR PROGRAMMING PROTOCOL

## 1. Work Initialization (Mandatory)

Before starting ANY new work on an issue or task:

1. **Switch to Main**: Ensure you are on the `main` branch (`git checkout main`).
2. **Pull Remote Changes**: Ensure `main` is up-to-date with all remote changes (`git pull origin main`).
3. **Branch**: Switch to a new, appropriately-named branch for the task (e.g., `git checkout -b feature/issue-number-description`).
4. **Project Status**: Mark the corresponding issue/task as "In Progress" on the project status board (e.g., using `gh project item-edit`).

## 2. Testing Lockdown (Mandatory)

I am strictly FORBIDDEN from staging any `.ts` or `.tsx` file unless it is accompanied by its corresponding `.test.ts` or `.test.tsx` file.

1. **Verify Existing Tests**: Search for existing tests for the modified component/module.
2. **Add Coverage**: If tests exist, add cases for the new behavior.
3. **Create New Tests**: If no tests exist, I must create a new test file that follows the project's established testing patterns (e.g., using `@testing-library/react` and `vitest`).
4. **Failure State**: If I cannot write tests for a specific reason (e.g., untestable side-effect), I MUST explain this and seek user approval before committing.

## 3. Pre-Push & PR Protocol (Mandatory)

I am strictly FORBIDDEN from considering a task "Done" unless the following conditions are met:

1. **Clean Lint**: `pnpm lint` and `pnpm lint:md` must return ZERO errors AND ZERO warnings.
2. **Full Suite Pass**: `verify_done.sh` must have been run and returned a total pass.
3. **Iterative Copilot Loop**:
    * A Pull Request must be opened.
    * A Copilot review must be requested and completed.
    * **ALL** relevant Copilot comments must be addressed or flagged for discussion.
    * All remote CI checks must pass.
4. **Checklist Reporting**: I must provide a "Definition of Done Checklist" in my response before final sign-off.

## 3. Commit Identity

All commits must be made exclusively on behalf of the configured git user. No co-author trailers.

## 4. PR Merging

Merging a PR into `main` is a human-only task. I will never merge a PR myself.
