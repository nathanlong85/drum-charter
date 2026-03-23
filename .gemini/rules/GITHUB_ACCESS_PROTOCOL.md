# 📂 GITHUB COMPONENT ACCESS PROTOCOL

These are the access protocols for accessing GitHub components. If there is a better way than what is listed here,
please let the user know and we will adjust these. Otherwise, please follow the instructions below.

## 📦 Pull Requests & Issues

- **Primary**: `mcp_GitHub_pull_request_read` and `mcp_GitHub_issue_read`.
- **Secondary**: `gh pr view` and `gh issue view`.
- **Comments**: Access via `mcp_GitHub_pull_request_read(method="get_comments")` or `gh pr view --comments`.

### Issue Creation Rules

- **Labels**: Always set at least one relevant label (e.g., `feature`, `documentation`, `chore`, `bug`).
- **Hierarchy**: If multiple issues are related, create them as **Sub-issues** of the parent issue using the `mcp_github_sub_issue_write` tool.
  - To do this, you must first create the child issue, then retrieve its **database ID** (not the issue number or GraphQL node ID) using `gh api repos/{owner}/{repo}/issues/{number} --jq .id`.
  - Then call `mcp_github_sub_issue_write(method="add", issue_number=PARENT_NUMBER, sub_issue_id=CHILD_DATABASE_ID)`.
  - Using a Markdown checklist in the parent description is **NOT** a substitute for actual GitHub Sub-issues.

### Pull Request Rules

- **Linking**: Always link the PR to the appropriate issue(s) (e.g., "Closes #ISSUE").
- **Assignee**: Always assign the PR to yourself (`nathanlong85-ai`).
- **Projects**: Always link the PR to the "DrumCharter" project (ID `PVT_kwHOAXHd784BRkBi`).

## 🧪 GitHub Actions & Logs

- **Primary**: Use the `gh` CLI.
- **Logs**: `gh run view <RUN_ID> --log` for completed runs. For in-progress runs, poll until completion (20s delay).
- **Status**: `gh run list --branch <BRANCH>` or `gh run view <RUN_ID>`.

## 📊 Projects (V2)

- **Primary**: Use GraphQL via `gh api graphql`.
- **Capabilities**: Can list project items, update fields, and move items across columns. Must use `ProjectV2` queries.

## 🛠️ General Repository Access

- **Files**: Use `mcp_GitHub_get_file_contents` or `git show <BRANCH>:<PATH>`.
- **Commits**: Use `mcp_GitHub_list_commits` or `git log`.
