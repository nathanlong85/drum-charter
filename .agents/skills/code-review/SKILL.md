---
name: code-review
description: 'GitHub Copilot-powered code review workflow. Trigger for any explicit review request AND autonomously when a task is ready for verification.'
---

# GitHub Copilot Code Review

This skill manages the iterative code review loop using GitHub Copilot. Since Copilot reviews are performed remotely on Pull Requests, this workflow focuses on PR management and feedback integration.

## Workflow

When implementation is complete and the task is ready for review:

### 1. Verification & Submission
- Ensure the branch is fully linted and tested locally.
- Push changes to the remote repository.
- Open a Pull Request (if not already existing) using `mcp_github_create_pull_request`.

### 2. Requesting Copilot Review
- Use `mcp_github_request_copilot_review` to trigger a review on the PR.
- If the tool is not available, notify the user to request the review manually via the GitHub UI.

### 3. Monitoring & Polling
- Poll the PR status using `mcp_github_pull_request_read`.
- Monitor both CI check results (`method="get_check_runs"`) and Copilot review comments (`method="get_review_comments"`).

### 4. Addressing Feedback
- **Iteration Tracking**: Report the current iteration number (e.g., "Starting Copilot Review Iteration 1").
- **Review Summary**: Provide a brief summary of all findings.
- **Implementation**: 
    - Fix all valid suggestions.
    - **Flag Conflicts**: If a suggestion is unnecessary or goes against project standards, inform the user and leave a reply on the GitHub comment using `mcp_github_add_reply_to_pull_request_comment`.
- **Verify & Push**: Lint and test fixes before pushing to the branch.

### 5. Loop Completion
- Repeat the process until the Copilot review returns no new relevant findings and all CI checks pass.

## Capabilities
- Automates the request for Copilot reviews.
- Simplifies polling for remote feedback.
- Provides a structured format for reporting and resolving issues.
