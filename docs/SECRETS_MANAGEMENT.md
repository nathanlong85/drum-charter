# Secret Management Strategy

This document outlines the tiered approach for managing secrets in the DrumCharter project, as agreed upon by the development team and Junie.

## Tiers of Secrets

### 1. `.env.local` (Standard Local Development)

- **Purpose**: Non-sensitive local environment variables.
- **Examples**: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
- **Visibility**: Included in `.gitignore`. Targets the local Supabase container by default (port 54321).

### 2. `.env.junie` (Collaborative Secrets)

- **Purpose**: Secrets specifically required for Junie to perform tasks (e.g., database schema pulls, GitHub MCP interactions).
- **Examples**: `SUPABASE_ACCESS_TOKEN`, `GITHUB_PERSONAL_ACCESS_TOKEN`.
- **MCP Integration**: Secrets in this file are used to populate environment variables for MCP servers (defined in `.junie/mcp/mcp.json`), ensuring they are never hardcoded in configuration files.
- **Visibility**: Included in `.gitignore`. Populated by the user for Junie's use.

### 3. `.env.private` (User-Only Private Secrets)

- **Purpose**: Sensitive credentials that the user wishes to keep entirely private from Junie.
- **Examples**: Production database passwords, personal API keys for unrelated services.
- **Protocol**: Junie is formally committed to **never** read, log, or interact with this file.
- **Visibility**: Included in `.gitignore`.

### 4. GitHub Secrets (CI/CD)

- **Purpose**: Automated build and deployment pipelines.
- **Examples**: Vercel deployment tokens, Supabase project keys for automated testing.
- **Visibility**: Native GitHub encryption. "Write-only" for most users; not available to the local development environment or Junie directly.

## Protocol for Adding Secrets

1. If Junie requires a secret to complete a task, the user will be asked to add it to `.env.junie`.
2. Junie will acknowledge when the secret is no longer needed or if it should be rotated.
3. Any security-sensitive operations will be discussed and approved before execution.

## Git Safety

All files matching `.env*` are globally excluded via `.gitignore` to prevent accidental exposure in the repository.
