---
name: onboard
description: Apply when the user invokes /onboard. Input is (1) GitHub issue/PR numbers, (2) a file path, or (3) pasted content. Execute the workflow below and WAIT for instruction.
---

# /onboard

**Constraint:** Do not edit files or implement code until the user explicitly says to start.

## 1. Parse & Load
- **GitHub Issues/PRs**: Fetch using `gh issue view <NUM>` or `gh pr view <NUMBER>`.
- **File Path**: Read using `read_file`.
- **Pasted**: Use as sole context.

## 2. Analyze
Perform an internal pass for:
- Ambiguities or underspecified behavior.
- Missing acceptance criteria.
- Design/Architecture concerns or edge cases.
- Inconsistencies or conflicts.

## 3. Reply Structure
1. **Acknowledgment**: Confirm source (Issue #, path, or "pasted content").
2. **Summary**: 2–4 sentences on goals, state, and next steps.
3. **Questions/Concerns**: Use `ask_user` for each question. If UI unavailable, use numbered items. Say "No concerns" if none.
4. **Wait**: Explicitly state you are ready but waiting for a "start" command before making changes.

## 4. Execution
- Wait for user instruction (e.g., "go", "start", "proceed").
- Do not begin implementation until confirmed.
