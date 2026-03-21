# CLI Reference: DrumCharter

## General Guidelines
This document tracks verified command patterns for CLI tools used in the
DrumCharter project. It serves as a "Source of Truth" to prevent trial-and-error
execution and ensure consistent environments.

- **Environment Context**: Commands below are optimized for the current project
  structure and local development environment.
- **Option Safety**: Only use CLI options that are explicitly known to exist for
  a command. If unsure, consult the command's `--help` or official documentation
  first. Do NOT assume an option (like `--timeout`) exists for a tool unless
  verified.
- **Suppress Noise**: When running tests or CLI commands that emit redundant
  environment warnings (e.g., Node's `NO_COLOR` vs `FORCE_COLOR` conflict),
  proactively suppress them by unsetting `NO_COLOR` (e.g.,
  `unset NO_COLOR && npx playwright test`).

---

## GitHub ProjectV2 (GraphQL)

Use these queries with the `gh api graphql` command to interact with GitHub
ProjectV2 boards. Replace variables (`$owner`, `$repo`, `$login`, `$number`, `$id`)
as needed.

### List ProjectV2 boards for a repository

```bash
gh api graphql -f query='
query($owner:String!, $repo:String!) {
  repository(owner:$owner, name:$repo) {
    projectsV2(first: 10) {
      nodes {
        id
        title
        number
        url
      }
    }
  }
}' -F owner='nathanlong85' -F repo='drum-charter'
```

### Get a specific ProjectV2 by number (User Level)

```bash
gh api graphql -f query='
query($login:String!, $number:Int!) {
  user(login:$login) {
    projectV2(number:$number) {
      id
      title
      url
    }
  }
}' -F login='nathanlong85' -F number=2
```

### List items and field values in a project

This query retrieves the first 20 items (Issues/PRs) and their status/priority field values.

```bash
gh api graphql -f query='
query($id:ID!) {
  node(id:$id) {
    ... on ProjectV2 {
      items(first: 20) {
        nodes {
          id
          content {
            ... on Issue {
              title
              number
            }
            ... on PullRequest {
              title
              number
            }
          }
          fieldValues(first: 10) {
            nodes {
              ... on ProjectV2ItemFieldSingleSelectValue {
                name
                field {
                  ... on ProjectV2SingleSelectField {
                    name
                  }
                }
              }
            }
          }
        }
      }
    }
  }
}' -f id='PVT_kwHOAXHd784BRkBi'
```

---

## Commands
