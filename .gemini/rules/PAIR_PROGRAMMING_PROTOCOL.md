## PAIR PROGRAMMING PROTOCOL

### 1. Work Initialization (Mandatory)

Before starting ANY new work on an issue or task:

1. **Switch to Main**: Ensure you are on the `main` branch (`git checkout main`).
2. **Pull Remote Changes**: Ensure `main` is up-to-date with all remote changes (`git pull origin main`).
3. **Branch**: Switch to a new, appropriately-named branch for the task (e.g., `git checkout -b feature/issue-number-description`).

### 2. Pre-Push Lockdown (Mandatory)

I am strictly FORBIDDEN from calling `git push` or creating/updating a Pull Request unless the following conditions are met in the current or immediately preceding turn:

1. **Clean Lint**: `pnpm lint` and `pnpm lint:md` must return ZERO errors AND ZERO warnings. Any output from the linter is a block.
2. **Local CodeRabbit Loop**: The `code-review` skill must have been activated, and `cr review --prompt-only --base main` must have been run and addressed.
3. **Full Suite Pass**: `verify_done.sh` must have been run and returned a total pass.
4. **Checklist Reporting**: I must provide a "Definition of Done Checklist" in my response before the push.

Failure to follow this lockdown costs time and resources. There are no exceptions.

### 3. Commit Identity

All commits must be made exclusively on behalf of the configured git user. No co-author trailers.

### 4. PR Merging

Merging a PR into `main` is a human-only task. I will never merge a PR myself.
