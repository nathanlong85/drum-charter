# Pull Request & Review Protocol

This protocol defines the iterative review loop using Gemini Code Assist (the AI Agent).

## 1. Creating the PR
- **Title/Body**: Informative, link to issues (e.g., "Closes #60").
- **Self-Assign**: \`gh pr edit <number> --add-assignee nathanlong85-ai\`.

## 2. The Iterative Feedback Loop
Follow these steps for every PR:
1. **Verification**: Ensure changes are fully verified locally via \`verify_done.sh\`.
2. **Push & PR**: Open the PR against \`staging\`.
3. **Gemini Self-Review (MANDATORY)**: Perform a final self-review using Gemini Code Assist (the current agent) to ensure adherence to all project standards and best practices.
4. **Monitoring**: Poll for completion of CircleCI jobs.
5. **Address Findings**: Fix all self-identified issues or any flagged by the user.
6. **Repeat**: Until CircleCI is green and all checks are complete.

## 3. The "Green CircleCI" Mandate
- **Verification is not complete until all jobs in the CircleCI workflow return success.**
- Investigate failures using the CircleCI dashboard or local replication.

## 4. Reporting Requirements
At the start of every iteration, state:
- **Iteration Number** (e.g., "Starting Gemini Review Iteration 2").
- **Finding Summary** (e.g., "3 items regarding error handling").
- **Resolution Plan** (which fixes will be applied vs flagged).
