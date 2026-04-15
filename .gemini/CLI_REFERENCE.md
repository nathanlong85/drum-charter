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

### List ProjectV2 boards for a user

```bash
gh api graphql -f query='
query($login:String!) {
  user(login:$login) {
    projectsV2(first: 10) {
      nodes {
        id
        title
        number
        url
      }
    }
  }
}' -F login='nathanlong85'
```

### List ProjectV2 boards for an organization

```bash
gh api graphql -f query='
query($login:String!) {
  organization(login:$login) {
    projectsV2(first: 10) {
      nodes {
        id
        title
        number
        url
      }
    }
  }
}' -F login='your-org-name'
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
                optionId
                field {
                  ... on ProjectV2FieldCommon {
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

### Testing

- **Run Unit/Integration Tests**: `pnpm test:run` (Use `run` to avoid interactive watch mode).
- **Run Specific Test File**: `pnpm vitest run <path_to_test>` (Always use `run`).
- **Run E2E Tests**: `pnpm test:e2e`
- **Run Specific E2E Test File**: `pnpm playwright test <path_to_test> --project=chromium`
- **Run E2E in UI Mode**: `pnpm playwright test --ui`

### Linting & Formatting

- **Lint All**: `pnpm lint`
- **Lint Markdown**: `pnpm lint:md`
- **Fix All (Safe)**: `pnpm lint:fix`
- **Format All**: `pnpm format`

### Development

- **Start Dev Server**: `pnpm dev`
- **Build Project**: `pnpm build`

### Git & Source Control

- **Sync Main**: `git checkout main && git pull origin main`
- **Create Feature Branch**: `git checkout -b <type>/<issue-number>-<description>`
- **Check Status & Diff**: `git status && git diff HEAD`

---

## CircleCI (CI/CD)

- **List Pipelines**: `circleci pipeline list <project-slug-or-id>` (Slug: `gh/nathanlong85/drum-charter`)
- **Check Secrets**: `circleci project secret list <vcs-type> <org-name> <project-name>` (e.g., `circleci project secret list github nathanlong85 drum-charter`)
- **Open Project**: `circleci open` (Opens dashboard in browser)
- **Status via API (curl)**:

  ```bash
  curl --request GET \
    --url "https://circleci.com/api/v2/pipeline?org-slug=gh/<org>" \
    --header "Circle-Token: $CIRCLE_TOKEN"
  ```
