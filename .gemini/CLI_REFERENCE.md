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

## Commands
