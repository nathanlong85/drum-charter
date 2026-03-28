# Code Review Protocol

## GitHub Copilot Review Workflow

We have transitioned from CodeRabbit to GitHub Copilot for our primary code review mechanism. Since a local execution path for Copilot reviews is not yet available, we follow a remote-first, iterative feedback loop once a Pull Request is opened.

### 1. The Iterative Feedback Loop

Follow these steps for every code change:

1. **Completion**: Finish the implementation of the work (feature, bug, chore, or PR fix).
2. **Verification**: Ensure the changes are fully linted and tested. Aim for 100% coverage and ensure all user journeys are verified.
3. **PR Management**: Push the changes and open a Pull Request (if one does not already exist).
4. **Request Review**: Request a review from **Copilot** on the PR.
    * Use the `mcp_github_request_copilot_review` tool if available.
    * If the tool is unavailable or fails, notify the user to request it manually.
5. **Monitoring**: Poll for the completion of all CI check results and the Copilot review.
6. **CI Remediation**: Address any CI failures immediately.
7. **Address Findings**: Address **ALL** relevant Copilot review comments.
    * **Agreement**: Apply fixes for all valid suggestions.
    * **Disagreement**: If a suggestion is unnecessary or conflicts with project plans/standards, notify the user and leave a detailed comment on the original Copilot review comment explaining the rationale.
8. **Repeat**: Repeat steps 1–7 until:
    * Copilot reviews come back clean (no new relevant findings).
    * **ALL CI checks are green/passing.** Even if no new Copilot comments exist, you MUST poll until the remote CI confirms success.

### 2. The "Green CI" Mandate

Verification is not complete until the remote CI environment (GitHub Actions) returns a success state.
* Do not signal task completion or sign off based solely on local tests.
* If CI fails, you MUST investigate the logs (using `gh run view` or similar), fix the issue locally, and push again.
* Continue the loop until both Copilot and CI are satisfied.

Proactively flag a Copilot suggestion for final human decision if it:
* Conflicts with the project's specific architectural goals or established standards.
* Contradicts previously established user preferences or known requirements.
* Introduces unnecessary complexity ("over-engineering") or code smells.

### 3. Reporting Requirements

At the start of every iteration in the loop, you MUST explicitly state:
* **Iteration Number**: e.g., "Starting Copilot Review Iteration 2".
* **Finding Summary**: Provide a brief summary of what is being addressed (e.g., "Found 3 suggestions regarding error handling and type safety").
* **Resolution Plan**: Briefly state which comments will be fixed and which will be flagged for discussion.
