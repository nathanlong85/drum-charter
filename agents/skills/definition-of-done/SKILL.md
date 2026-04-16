---
name: definition-of-done
description: Verification workflow for the DrumCharter project. Use this skill when you believe a task is complete, before committing, or before presenting work to the user. It ensures all linting and tests pass.
---

# Definition Of Done

This skill automates the verification process for DrumCharter, ensuring that all code meets the project's quality standards before it's considered complete.

## Workflow

### 0. Implementation (MANDATORY)

- **Test-First Mandate**: No code changes are allowed without an accompanying test plan and verification logic.
- **Bug Reproduction**: You **MUST** reproduce reported bugs with a failing test before applying a fix.
- **Feature Verification**: Every feature requirement **MUST** be translated into a test case during implementation.
- **No Test = Failure**: Any code modification that is not covered by an automated test is a failure to meet the Senior Engineer standard.

### 1. Determine Verification Path

- **Documentation, Rules, or Skills ONLY**: If changes are limited to `.md` files, `.gemini/rules/`, or `agents/skills/`, proceed to **Step 3 (Linting)**. You may skip Gemini Loop and Tests.
- **Code Changes**: Proceed to **Step 2 (Iterative Gemini Code Assist Loop)**.

### 2. Iterative Gemini Code Assist Feedback Loop (Code Changes Only)

Before final verification, you MUST complete the iterative feedback loop as defined in `PR_REVIEW_PROTOCOL.md`.

1. **Verification**: Ensure changes are fully linted and tested locally (aim for 100% coverage).
2. **Push & PR**: Push changes and open/update a Pull Request against `staging`.
3. **Initial Review**: Gemini Code Assist will perform an initial review once the PR is open.
4. **Poll & Address**: Poll for the completion of CircleCI jobs and the Gemini Code Assist review. Address ALL failures and ALL comments.
   - Reply to **EVERY** comment: State what was done or why a fix was declined.
5. **Local Check**: Run `verify_done.sh` locally. If clean, push changes.
6. **Re-request Review**: Post a PR comment: `/gemini review`.
7. **Repeat**: Repeat steps 4-6 until the review is clean and CircleCI passes.
   - **Rule of Three**: Maximum of 3 Gemini review cycles (Initial + 2 re-requests) unless new requirements are added.

### 3. Run Linting

Execute linting for all change types.

```bash
pnpm lint
pnpm lint:md
```

### 4. Full Automated Verification (Code Changes Only)

Execute the bundled verification script to ensure no regressions or formatting issues were introduced.

```bash
./agents/skills/definition-of-done/scripts/verify_done.sh
```

### 5. Manual Checks

In addition to the automated checks, manually verify the following:

- **100% Test Coverage**: Ensure all new code paths have corresponding unit or E2E tests.
- **Project Plan Update**: If you completed a task from `docs/PROJECT_PLAN.md`, mark it as complete (`[x]`).
- **No Residual Debugging**: Ensure no `console.log` or temporary debugging code remains.
- **Type Safety**: Confirm that there are no new TypeScript errors.

### 4. Reporting (MANDATORY)

Once all checks pass, you MUST report completion using this exact checklist format:

```markdown
### ✅ Definition of Done Checklist

- [ ] **Clean Lint**: ZERO errors and ZERO warnings.
- [ ] **Gemini Review**: Remote iterative loop completed and all comments addressed.
- [ ] **Unit Tests**: 100% pass rate.
- [ ] **E2E Tests**: 100% pass rate.
- [ ] **Green CircleCI**: All remote CircleCI workflow jobs passing.
- [ ] **Local Verification**: `verify_done.sh` passed with 100% success.
- [ ] **Manual Checks**: Plan updated, no logs, types verified.
```

If any box cannot be checked, the task is NOT done.
