# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.1-alpha] - 2026-03-11

### Added
- Created missing `notebooks` table in Supabase via CLI migration to restore database integrity.
- Implemented full TypeScript type safety for Notebook operations in `supabaseService` by removing `any` workarounds.
- Public read-only routes for Notebooks (`/public/notebooks/[id]`) and Snippets (`/public/snippets/[id]`) with optimized layouts.
- Integrated public visibility toggles and shareable link UI into all item editors.
- Documented stable Supabase CLI patterns in `.junie/CLI_REFERENCE.md` to ensure predictable project management.
- Clone/Duplicate functionality for Song Charts, Notebooks, and Snippets from both the Library and individual editors.
- Full TypeScript integration for Supabase database tables (`song_charts`, `groove_snippets`, `profiles`, `notebooks`).
- Automated unit tests for database duplication logic.

## [0.1.0-alpha] - 2026-03-11

### Added
- Core Editor UI for Song Charts, Practice Notebooks, and Groove Snippets.
- Interactive Groove Grid Editor with support for dynamic time signatures and resolutions.
- Real-time auto-save with debounced persistence to Supabase.
- Guest Mode using Supabase Anonymous Sign-In.
- Print-friendly layout optimization for Song Charts.
- Public read-only routes for Song Charts (`/public/songs/[id]`).
- Comprehensive unit and integration test suite using Vitest.
- Baseline E2E tests with Playwright.
- TypeScript types generated directly from the Supabase database schema.

### Fixed
- Critical `TypeError` in `GrooveGridEditor` when initializing from partial state.
- Missing and broken SVG icon references in `SymbolPicker`.
- Redundant "My Library" navigation links on the landing page.
- "Empty object" error logging in `LibraryDashboard` during item creation.

### Security
- Established tiered Secret Management strategy with `.env.junie` and `.env.private` protocols.
- Documented "Stop-and-Wait" protocol for collaborative development.
