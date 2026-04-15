# Code Review Protocol

## Gemini Code Assist Review Workflow

We use Gemini Code Assist for our primary code review mechanism. We follow a remote-first, iterative feedback loop once a Pull Request is opened.

### 1. The Iterative Feedback Loop

Follow these steps for every code change:

1. **Completion**: Finish the implementation of the work (feature, bug, chore, or PR fix).
2. **Verification**: Ensure the changes are fully linted and tested. Aim for 100% coverage and ensure all user journeys are verified.
3. **PR Management**: Push the changes and open a Pull Request (if one does not already exist).
4. **Request Review (MANDATORY)**: You MUST ensure a Gemini Code Assist review is completed on the PR.
5. **Monitoring**: Poll for the completion of all CircleCI jobs and the Gemini Code Assist review.
6. **CI Remediation**: Address any CircleCI failures immediately.
7. **Address Findings**: Address **ALL** relevant Gemini Code Assist review comments.
    * **Agreement**: Apply fixes for all valid suggestions.
    * **Disagreement**: If a suggestion is unnecessary or conflicts with project plans/standards, notify the user and leave a detailed comment on the original Gemini Code Assist review comment explaining the rationale.
8. **Repeat**: Repeat steps 1–7 until:
    * Gemini Code Assist reviews come back clean (no new relevant findings).
    * **ALL CircleCI jobs are green/passing.** Even if no new Gemini Code Assist comments exist, you MUST poll until the remote CI confirms success.

### 2. The "Green CircleCI" Mandate

Verification is not complete until the CircleCI workflow returns a success state.
* Do not signal task completion or sign off based solely on local tests.
* If CircleCI fails, you MUST investigate the logs (using the CircleCI dashboard), fix the issue locally, and push again.
* Continue the loop until both Gemini Code Assist and CircleCI are satisfied.

### 3. Disagreement & Flagging Protocol

Proactively flag a Gemini Code Assist suggestion for final human decision if it:
* Conflicts with the project's specific architectural goals or established standards.
* Contradicts previously established user preferences or known requirements.
* Introduces unnecessary complexity ("over-engineering") or code smells.

### 4. Reporting Requirements

At the start of every iteration in the loop, you MUST explicitly state:
* **Iteration Number**: e.g., "Starting Gemini Code Assist Review Iteration 2".
* **Finding Summary**: Provide a brief summary of what is being addressed (e.g., "Found 3 suggestions regarding error handling and type safety").
* **Resolution Plan**: Briefly state which comments will be fixed and which will be flagged for discussion.
