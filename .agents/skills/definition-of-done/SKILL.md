---
name: definition-of-done
description: Verification workflow for the DrumCharter project. Use this skill when you believe a task is complete, before committing, or before presenting work to the user. It ensures all linting and tests pass.
---

# Definition Of Done

This skill automates the verification process for DrumCharter, ensuring that all code meets the project's quality standards before it's considered complete.

## Workflow

When you think you've finished a task (feature, bug fix, or documentation update), follow these steps in order:

### 1. Determine Verification Path
- **Documentation, Rules, or Skills ONLY**: If changes are limited to `.md` files, `.gemini/rules/`, or `.agents/skills/`, proceed to **Step 3 (Linting)**. You may skip CodeRabbit and Tests.
- **Code Changes**: Proceed to **Step 2 (CodeRabbit)**.

### 2. CodeRabbit Feedback Loop (Code Changes Only)
Before final verification, you MUST complete the local CodeRabbit feedback loop as defined in `CODE_REVIEW_PROTOCOL.md`.
- Activate the `code-review` skill.
- Run `cr review --prompt-only --base main`.
- Address feedback following the "Structured Feedback Review" (3-run state machine).
- The loop is finished only when no `Critical` or `Major` issues remain or the 3-run limit is reached.

### 3. Run Linting
Execute linting for all change types.
```bash
pnpm lint
pnpm lint:md
```
- **CRITICAL**: If `pnpm lint` modifies any code files (automatic fixes), you MUST treat this as a code change and run the **Full Automated Verification** (Step 4) and **CodeRabbit Loop** (Step 2) even if you only intended to change documentation.

### 4. Full Automated Verification (Code Changes Only)
Execute the bundled verification script to ensure no regressions or formatting issues were introduced.
This script runs Biome linting, Markdown linting, Vitest unit tests, and Playwright E2E tests.

```bash
./.agents/skills/definition-of-done/scripts/verify_done.sh
```

### 5. Manual Checks
In addition to the automated checks, manually verify the following:

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
