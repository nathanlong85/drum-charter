---
name: definition-of-done
description: Verification workflow for the DrumCharter project. Use this skill when you believe a task is complete, before committing, or before presenting work to the user. It ensures all linting and tests pass.
---

# Definition Of Done

This skill automates the verification process for DrumCharter, ensuring that all code meets the project's quality standards before it's considered complete.

## Workflow

When you think you've finished a task (feature, bug fix, or documentation update), follow these steps:

### 1. Run Automated Verification
Execute the bundled verification script. This script runs Biome linting, Markdown linting, Vitest unit tests, and Playwright E2E tests.

```bash
./.gemini/skills/definition-of-done/scripts/verify_done.sh
```

### 2. Manual Checks
In addition to the automated script, manually verify the following:

- **100% Test Coverage**: Ensure all new code paths have corresponding unit or E2E tests.
- **Project Plan Update**: If you completed a task from `docs/PROJECT_PLAN.md`, mark it as complete (`[x]`).
- **No Residual Debugging**: Ensure no `console.log` or temporary debugging code remains.
- **Type Safety**: Confirm that there are no new TypeScript errors (run `pnpm tsc` if unsure).

### 3. Reporting
Once all checks pass, report to the user that the task is "Done" and provide a brief summary of what was verified.

## Resources

### scripts/
- `verify_done.sh`: Automates linting and testing (Biome, Markdownlint, Vitest, Playwright).
