# GitHub Protocol & Verified Commands

This document serves as the absolute source of truth for GitHub-related operations. These commands have been verified in the environment.

## 📌 Static Information

- **Owner**: `nathanlong85`
- **Repo**: `drum-charter`
- **Full Repo**: `nathanlong85/drum-charter`
- **Project Name**: `DrumCharter`
- **Project ID (Database ID)**: `PVT_kwHOAXHd784BRkBi` (Project #2)
- **User (Nathan)**: `nathanlong85`
- **AI Agent User**: `nathanlong85-ai`

---

## 🛡️ Workflow Safeguards

### 1. The "hold" Label Rule

- **Mandate**: NEVER pick up or work on an issue that has the `hold` label.
- **Protocol**:
  1. Before starting work, always check the issue's labels.
  2. If a `hold` label is present, you MUST NOT proceed.
  3. If explicitly asked to work on a `hold` issue, you MUST question the request and ask for the label to be removed first.

### 2. PR Self-Assignment

- **Mandate**: Always assign any PR you open to yourself (`nathanlong85-ai`).
- **Command**: `gh pr edit <number> --add-assignee nathanlong85-ai`

---

## 🛠️ Verified Commands

### 1. Issue & Project Management

- **Create Issue & Link to Project**:

  ```bash
  gh issue create --title "Title" --body "Body" --project "DrumCharter" --assignee "nathanlong85-ai"
  ```

- **List Issues with Labels**:

  ```bash
  gh issue list --limit 20 --json number,title,labels --jq '.[] | {number, title, labels: [.labels[].name]}'
  ```

- **Check Labels for a Specific Issue**:

  ```bash
  gh issue view <number> --json labels --jq '.labels[].name'
  ```

### 2. Pull Request Management

- **Create PR & Assign Self**:

  ```bash
  gh pr create --title "Title" --body "Closes #IssueNumber" --base main --assignee "nathanlong85-ai"
  ```

- **Self-Assign Existing PR**:

  ```bash
  gh pr edit <number> --add-assignee nathanlong85-ai
  ```

- **Check PR Mergeability**:

  ```bash
  gh pr view <number> --json mergeable,mergeStateStatus
  ```

### 3. Review & Comments

- **Trigger Copilot Review (MANDATORY for every PR)**:

  - **Constraint**: The AI account (`nathanlong85-ai`) may lack permissions to trigger the GitHub Copilot App directly.
  - **Protocol**:
    1. Temporarily switch to the user account.
    2. Trigger the review.
    3. Switch back to the AI account immediately.

  - **Command**:

    ```bash
    gh auth switch --user nathanlong85 && gh pr edit <number> --add-reviewer "@copilot" && gh auth switch --user nathanlong85-ai
    ```

  - **Verification**: Copilot typically does not appear in `reviewRequests` but will appear in `latestReviews` (visible via `gh pr view --json latestReviews`) once it begins its review.

- **Check Review Comments (General/Top-level)**:

  - **Primary (`gh` CLI)**:

    ```bash
    gh pr view <number> --json reviews,comments
    ```

  - **Backup (MCP Tool)**: Use `mcp_github_pull_request_read(method="get_reviews")` and `mcp_github_pull_request_read(method="get_comments")`.

- **Check Review Comments (Line-level/Threaded)**:

  - **Primary (API)**:

    ```bash
    gh api repos/nathanlong85/drum-charter/pulls/<number>/comments --jq '.[] | {user: .user.login, body: .body, path: .path, line: .line, id: .id}'
    ```

  - **Backup (MCP Tool)**: Use `mcp_github_pull_request_read(method="get_review_comments")`.

- **Reply to a Review Comment (Threaded)**:

  - **Primary (API)**:

    ```bash
    gh api -X POST repos/nathanlong85/drum-charter/pulls/<number>/comments/<comment_id>/replies -f body="Your reply here"
    ```

  - **Backup (MCP Tool)**: Use `mcp_github_add_reply_to_pull_request_comment(owner, repo, pullNumber, commentId, body)`.

- **Post a General PR Comment**:

  - **Primary (`gh` CLI)**:

    ```bash
    gh pr comment <number> --body "Your comment here"
    ```

  - **Backup (MCP Tool)**: Use `mcp_github_add_issue_comment(owner, repo, issue_number, body)`.

### 4. CI/CD Status & Diagnosis

- **List Latest CI Runs**:

  ```bash
  gh run list --workflow CI --limit 5 --json databaseId,status,conclusion,createdAt
  ```

- **View Job IDs for a Run**:

  ```bash
  gh run view <run-id>
  ```

- **Fetch Logs for a Specific Job** (e.g., E2E, Unit, Lint):

  ```bash
  gh run view --job <job-id> --log
  ```

- **Identify Failure Reason in Logs** (Grep for common error patterns):

  ```bash
  gh run view --job <job-id> --log | grep -E "Error:|Fail:|✘" -A 5
  ```

---

## 🔄 Dynamic Information Retrieval

- **Get PR Number for current branch**:

  ```bash
  gh pr view --json number --jq '.number'
  ```

- **Get latest CI Run ID**:

  ```bash
  gh run list --workflow CI --limit 1 --json databaseId --jq '.[0].databaseId'
  ```
