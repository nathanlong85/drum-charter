# Pull Request & Review Protocol

This protocol defines the iterative review loop using Gemini Code Assist (the AI Agent).

## 1. Creating the PR
- **Title/Body**: Informative, link to issues (e.g., "Closes #60").
- **Self-Assign**: gh pr edit number --add-assignee nathanlong85-ai

## 2. The PR & Review Lifecycle (Mandatory)

Follow this exact sequence for every PR:

1.  **Preparation**: Commit, push, and open the PR when ready.
2.  **Initial Review**: Gemini Code Assist performs a review; the CI suite runs simultaneously.
3.  **Addressing Feedback**: Poll until review and CI are finished. Address all failures and **ALL** comments.
    -   Reply to **EVERY** comment: State what was done or why a fix was declined.
4.  **Verification**: Run `verify_done.sh` locally. If clean, push changes.
5.  **Re-request Review**: Post a PR comment: `/gemini review`.
6.  **Cycle Iteration**: While waiting for the re-review, the CI suite runs again.
7.  **Rinse & Repeat**: Repeat steps 3-6 until CI is clean and all comments are addressed and replied to.
    -   **Rule of Three**: Maximum of 3 Gemini review cycles (Initial + 2 re-requests) unless new code/requirements are added mid-cycle.
8.  **Handoff**: Stop polling. Notify the user that the PR is green, all comments are addressed, and it is ready for final review.
9.  **User Sovereignty**: **DO NOT MERGE.** Wait for the user to perform the final merge.
10. **Finality**: The user will notify you when merged.
11. **Cleanup**: Checkout `staging`, pull changes, and delete the local feature branch. Hurray! 🎉

## 3. Production Release Flow (Staging -> Main)

1.  **Trigger**: When instructed, use the `release-manager` skill to open a PR for merging `staging` into `main`.
2.  **No Polling**: Do not poll this PR. If issues arise, the user will notify you.
3.  **Merge**: The user merges to `main`.
4.  **Celebration**: Once the user confirms the merge, rejoice with party emojis! 🥳🎈✨
