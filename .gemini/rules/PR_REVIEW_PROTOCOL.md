# Pull Request & Review Protocol

This protocol defines the iterative review loop between the agent and GitHub Copilot.

## 1. Creating the PR
- **Title/Body**: Informative, link to issues (e.g., "Closes #60").
- **Self-Assign**: `gh pr edit <number> --add-assignee nathanlong85-ai`.

## 2. The Iterative Feedback Loop
Follow these steps for every PR:
1. **Verification**: Ensure changes are fully verified locally via `verify_done.sh`.
2. **Push & PR**: Open the PR against `staging`.
3. **Request Copilot Review (MANDATORY)**: Initiate review immediately using:

   ```bash
   gh auth switch --user nathanlong85 && gh pr edit <number> --add-reviewer "@copilot" && gh auth switch --user nathanlong85-ai
   ```

4. **Monitoring**: Poll for completion of CircleCI jobs and Copilot comments.
5. **Address Findings**: Fix all valid suggestions. If you disagree, flag it for the human.
6. **Repeat**: Until CircleCI is green and Copilot finds no new relevant issues.

## 3. The "Green CircleCI" Mandate
- **Verification is not complete until all jobs in the CircleCI workflow return success.**
- Investigate failures using the CircleCI dashboard or local replication.

## 4. Reporting Requirements
At the start of every iteration, state:
- **Iteration Number** (e.g., "Starting Copilot Review Iteration 2").
- **Finding Summary** (e.g., "3 suggestions regarding error handling").
- **Resolution Plan** (which fixes will be applied vs flagged).
