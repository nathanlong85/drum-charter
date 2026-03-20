---
name: definition-of-done
description: Verification workflow for the DrumCharter project. Use this skill when you believe a task is complete, before committing, or before presenting work to the user. It ensures all linting and tests pass.
---

# Definition Of Done

This skill automates the verification process for DrumCharter, ensuring that all code meets the project's quality standards before it's considered complete.

## Workflow

When you think you've finished a task (feature, bug fix, or documentation update), follow these steps in order:

### 1. CodeRabbit Feedback Loop
Before final verification, you MUST complete the local CodeRabbit feedback loop as defined in `CODE_REVIEW_PROTOCOL.md`.
- Activate the `code-review` skill.
- Run `cr review --prompt-only --base main`.
- Address feedback following the "Structured Feedback Review" (3-run state machine).
- The loop is finished only when no `Critical` or `Major` issues remain or the 3-run limit is reached.

### 2. Run Automated Verification
Once the CodeRabbit loop is complete, execute the bundled verification script to ensure no regressions or formatting issues were introduced.
This script runs Biome linting, Markdown linting, Vitest unit tests, and Playwright E2E tests.

```bash
./.agents/skills/definition-of-done/scripts/verify_done.sh
```

### 3. Manual Checks
In addition to the automated script, manually verify the following:

- **100% Test Coverage**: Ensure all new code paths have corresponding unit or E2E tests.
- **Project Plan Update**: If you completed a task from `docs/PROJECT_PLAN.md`, mark it as complete (`[x]`).
- **No Residual Debugging**: Ensure no `console.log` or temporary debugging code remains.
- **Type Safety**: Confirm that there are no new TypeScript errors (run `pnpm tsc` if unsure).

### 4. Reporting
Once all checks pass, report to the user that the task is "Done" and provide a brief summary of:
- CodeRabbit loop results.
- Verification script outcome.
- Any manual checks performed.

## Resources

### scripts/
- `verify_done.sh`: Automates linting and testing (Biome, Markdownlint, Vitest, Playwright).
