# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.9-alpha] - 2026-03-13

### Added
- **PWA Support**: Implemented Progressive Web App capabilities using `@serwist/next`.
- **Offline Mode**: Added a service worker with custom caching strategies for Supabase REST API and metronome audio samples.
- **Offline Indicator**: Created an `OfflineStatus` component that alerts users when their internet connection is lost.
- **E2E Testing**: Added Playwright tests to verify offline detection and PWA manifest integration.

## [0.1.8-alpha] - 2026-03-12

### Added
- **Metronome Support**: Integrated professional-grade metronome with Beat 1 accent.
- **Synthesized Click Samples**: High-accuracy oscillator-based clicks for the metronome.
- **Audio Persistence**: Metronome settings (enabled/volume) are now persisted in Song Charts.

## [0.1.7-alpha] - 2026-03-12

### Added
- **Protocol Consolidation**: Moved the "STRICT PAIR PROGRAMMING PROTOCOL" to the top of `.junie/guidelines.md` for maximum visibility and priority.
- **Documentation**: Deleted `.junie/STRICT_PAIR_PROGRAMMING.md` and updated `docs/PROJECT_PLAN.md`.

## [0.1.6-alpha] - 2026-03-12

### Added
- **GitHub Formalization**: Added GitHub Issue Templates (YAML) for bug reports and feature requests.
- **Velocity & Accent Support**: Implemented a four-state toggle (**Standard -> Accent -> Ghost -> None**) for grid notes with visual indicators and exponential gain audio transitions.
- **Improved E2E Coverage**: Stabilized the Playwright suite and added full coverage for public sharing routes against the local environment.
- **Rebranding**: Standardized the application name to **DrumCharter** across all documentation and the landing page.

### Fixed
- **Audio Sample Mapping**: Corrected drum sample mapping to support symbol-specific hits (e.g., Rim Shot, Bell, Flams).
- **Git Attribution**: Rewrote historical commits to correctly attribute authorship to `Nathan Long <nathanlong85@gmail.com>` and removed co-author tags.

## [0.1.5-alpha] - 2026-03-12

### Added
- **Isolated Local Development**: Established a local Supabase environment using Docker, enabling safe development and testing without affecting the production database.
- **Local Test Configuration**: Added `.env.test` and updated `playwright.config.ts` to automatically switch to the local instance during E2E test runs.
- **Database Baselining**: Created a formal, single "Source of Truth" migration by pulling and merging the remote schema.
- **Local Seed Data**: Synchronized the local database with a dump of the remote public data to provide a consistent testing baseline.

### Fixed
- **Migration History**: Repaired divergent migration history on the remote server and removed redundant/loose SQL files.
- **Anonymous Sign-In**: Enabled anonymous authentication in the local Supabase configuration (`config.toml`).

### Changed
- **Strict Protocol Update**: Updated `.junie/STRICT_PAIR_PROGRAMMING.md` with "Drop and Listen" and "No Overwhelming Context" rules to improve focus and collaboration.

## [0.1.4-alpha] - 2026-03-11

### Added
- **Full Drum Kit**: Expanded the audio engine to support 17 distinct drum sounds (including rim shots, flams, cross-sticks, and toms).
- **Symbol-Based Audio Mapping**: The playback engine now intelligently maps drum symbols (e.g., `rim_shot`, `flam`) to specific audio samples.
- **High-Fidelity Synthesis**: Generated a comprehensive set of 17 synthesized drum samples to replace low-quality placeholders.

### Fixed
- **RLS Violation (42501)**: Resolved critical item creation failures by explicitly passing `user_id` to Supabase from the `LibraryDashboard`.
- **Audio Sample Integrity**: Updated `tests/verify-samples.test.ts` to cover the full 17-sample kit.

## [0.1.3-alpha] - 2026-03-11

### Fixed
- **Audio Decoding**: Fixed `Unable to decode audio data` by ensuring valid synthesized WAV samples are generated/provided.
- **Supabase Error Visibility**: Improved error logging in the Library and Editor to surface detailed Supabase error objects instead of empty strings.
- **Item Creation**: Fixed silent item creation failure by correcting `user_id` fallback in the service layer, preventing RLS/FK violations.

### Added
- **Audio Integrity Test**: Added `tests/verify-samples.test.ts` to ensure audio assets are valid RIFF/WAVE files during testing.

## [0.1.2-alpha] - 2026-03-11

### Added
- **Audio Playback MVP**: Real-time audio engine using Web Audio API to play drum patterns with high-quality samples (Kick, Snare, Hi-Hat).
- **BPM Management**: Persistent BPM control for all entity types (Songs, Notebooks, Snippets) to synchronize audio and visual grids.
- **Visual Playhead**: Real-time visual feedback on the grid while audio is playing.

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
