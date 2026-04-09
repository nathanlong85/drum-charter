# PAIR PROGRAMMING PROTOCOL

## 1. Work Initialization (Mandatory)

Before starting ANY new work on an issue or task:

1. **Proactive Skill Check**:
    * **Scan Available Skills**: Review the `<available_skills>` block in your system instructions to identify all specialized expertise relevant to the task (e.g., `web-audio-api` for sound, `accessibility` for UI, `vitest` for tests).
    * **Activate & Internalize**: Call `activate_skill` for every relevant skill. You MUST read the provided `<instructions>` in full before taking any action.
    * **Apply Expert Guidance**: Integrate the skill's specific best practices into your initial strategy and execution plan.
2. **Switch to Staging**: Ensure you are on the `staging` branch (`git checkout staging`).
3. **Pull Remote Changes**: Ensure `staging` is up-to-date with all remote changes (`git pull origin staging`).
4. **Branch**: Switch to a new, appropriately-named branch for the task (e.g., `git checkout -b feature/issue-number-description`).
5. **Project Status**: Mark the corresponding issue/task as "In Progress" on the project status board (e.g., using `gh project item-edit`).

## 2. Implementation Standards (MANDATORY)

- **Test-First Mandate**: Every code change is a failure if not accompanied by a test plan and verification logic.
- **Bug Reproduction**: You **MUST** reproduce reported bugs with a failing test before applying a fix.
- **Feature Verification**: Every feature requirement **MUST** be translated into a test case during implementation.
- **Surgical Logic**: Maintain high-signal changes only. Follow existing project patterns and standards.

## 3. Pre-Push & PR Protocol (Mandatory)

I am strictly FORBIDDEN from considering a task "Done" unless the following conditions are met:

1. **Clean Lint**: `pnpm lint` and `pnpm lint:md` must return ZERO errors AND ZERO warnings.
2. **Full Suite Pass**: `verify_done.sh` must have been run and returned a total pass.
3. **Iterative Copilot Loop**:
    * A Pull Request must be opened against `staging`.
    * A Copilot review must be requested and completed.
    * **ALL** relevant Copilot comments must be addressed or flagged for discussion.
    * All remote CI checks must pass.
4. **Checklist Reporting**: I must provide a "Definition of Done Checklist" in my response before final sign-off.

## 3. Commit Identity

All commits must be made exclusively on behalf of the configured git user. No co-author trailers.

## 4. PR Merging

Merging a PR into `staging` or `main` is a human-only task. I will never merge a PR myself.
