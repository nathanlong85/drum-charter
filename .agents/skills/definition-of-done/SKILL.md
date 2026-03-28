---
name: definition-of-done
description: Verification workflow for the DrumCharter project. Use this skill when you believe a task is complete, before committing, or before presenting work to the user. It ensures all linting and tests pass.
---

# Definition Of Done

This skill automates the verification process for DrumCharter, ensuring that all code meets the project's quality standards before it's considered complete.

## Workflow

When you think you've finished a task (feature, bug fix, or documentation update), follow these steps in order:

### 1. Determine Verification Path

- **Documentation, Rules, or Skills ONLY**: If changes are limited to `.md` files, `.gemini/rules/`, or `.agents/skills/`, proceed to **Step 3 (Linting)**. You may skip Copilot Loop and Tests.
- **Code Changes**: Proceed to **Step 2 (Iterative Copilot Loop)**.

### 2. Iterative Copilot Feedback Loop (Code Changes Only)

Before final verification, you MUST complete the iterative feedback loop as defined in `CODE_REVIEW_PROTOCOL.md`.

1.  **Verification**: Ensure changes are fully linted and tested (aim for 100% coverage).
2.  **Push & PR**: Push changes and open/update a Pull Request.
3.  **Request Review**: Request a review from **Copilot** on the PR (use `mcp_github_request_copilot_review`).
4.  **Poll & Address**: Wait for Copilot and CI. Address ALL relevant comments or flag for discussion.
5.  **Repeat**: Repeat until the review is clean and CI passes.

### 3. Run Linting

Execute linting for all change types.

```bash
pnpm lint
pnpm lint:md
```

- **CRITICAL**: If `pnpm lint` modifies any code files (automatic fixes), you MUST treat this as a code change and run the **Full Automated Verification** (Step 4) and **Copilot Loop** (Step 2).

### 4. Full Automated Verification (Code Changes Only)

Execute the bundled verification script to ensure no regressions or formatting issues were introduced.

```bash
./.agents/skills/definition-of-done/scripts/verify_done.sh
```

### 5. Manual Checks

In addition to the automated checks, manually verify the following:

- **100% Test Coverage**: Ensure all new code paths have corresponding unit or E2E tests.
- **Project Plan Update**: If you completed a task from `docs/PROJECT_PLAN.md`, mark it as complete (`[x]`).
- **No Residual Debugging**: Ensure no `console.log` or temporary debugging code remains.
- **Type Safety**: Confirm that there are no new TypeScript errors (run `pnpm tsc` if unsure).

### 4. Reporting (MANDATORY)

Once all checks pass, you MUST report completion using this exact checklist format:

```markdown
### ✅ Definition of Done Checklist

- [ ] **Clean Lint**: ZERO errors and ZERO warnings.
- [ ] **Copilot Loop**: Remote iterative loop completed and addressed.
- [ ] **Unit Tests**: 100% pass rate.
- [ ] **E2E Tests**: 100% pass rate.
- [ ] **Green CI**: All remote GitHub Action checks passing.
- [ ] **Manual Checks**: Plan updated, no logs, types verified.
```

If any box cannot be checked, the task is NOT done.
