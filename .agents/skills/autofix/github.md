# Git Platform Commands

GitHub CLI commands for the CodeRabbit Autofix skill.

## Prerequisites

**GitHub CLI (`gh`):**
- Install: `brew install gh` or [cli.github.com](https://cli.github.com/)
- Authenticate: `gh auth login`
- Verify: `gh auth status`

## Core Operations

### 1. Find Pull Request

```bash
gh pr list --head $(git branch --show-current) --state open --json number,title
```

Gets the PR number for the current branch.

### 2. Fetch Unresolved Threads

Use GitHub GraphQL `reviewThreads` (there is no REST `pulls/<pr-number>/threads` endpoint). This query supports pagination to ensure all threads are fetched:

```bash
gh api graphql \
  -F owner='{owner}' \
  -F repo='{repo}' \
  -F pr=<pr-number> \
  -F cursor=null \
  -f query='query($owner:String!, $repo:String!, $pr:Int!, $cursor:String) {
    repository(owner:$owner, name:$repo) {
      pullRequest(number:$pr) {
        reviewThreads(first:100, after:$cursor) {
          pageInfo {
            hasNextPage
            endCursor
          }
          nodes {
            isResolved
            comments(first:1) {
              nodes {
                databaseId
                body
                author { login }
              }
            }
          }
        }
      }
    }
  }'
```

**Pagination Loop**:
The GraphQL query should be executed in a loop.
1. Start with `$cursor` set to `null`.
2. Execute the query.
3. If `pageInfo.hasNextPage` is `true`, store `pageInfo.endCursor` and use it as the `$cursor` variable for the next iteration.
4. Continue until `hasNextPage` is `false`.
5. Accumulate all nodes into a single list before processing.

Filter criteria:
- `isResolved == false`
- root comment author is one of: `coderabbitai`, `coderabbit[bot]`, `coderabbitai[bot]`

Use the root comment body for the issue prompt.

### 3. Post Summary Comment


```bash
gh pr comment <pr-number> --body "$(cat <<'EOF'
## Fixes Applied Successfully

Fixed <file-count> file(s) based on <issue-count> unresolved review comment(s).

**Files modified:**
- `path/to/file-a.ts`
- `path/to/file-b.ts`

**Commit:** `<commit-sha>`

The latest autofix changes are on the `<branch-name>` branch.

EOF
)"
```

Post after the push step (if pushing) so branch state is final.

### 4. Acknowledge Review

```bash
# React with thumbs up to the CodeRabbit comment
gh api repos/{owner}/{repo}/issues/comments/<comment-id>/reactions \
  -X POST \
  -f content='+1'
```

Find the comment ID from step 2.

### 5. Create PR (if needed)

```bash
gh pr create --title '<title>' --body '<body>'
```

## Error Handling

**Missing `gh` CLI:**
- Inform user and provide install instructions
- Exit skill

**API failures:**
- Log error and continue
- Don't abort for comment posting failures

**Getting repo info:**
```bash
gh repo view --json owner,name,nameWithOwner
```
