# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.2.1-alpha] - 2026-03-21

### Added
- **Quick Clear Grid/Row**: Added a "Clear Grid" button to the main toolbar and "Clear Row" buttons to individual instruments (visible in edit mode) for rapid resets.
- **Multi-cell Selection**: Implemented drag-to-select functionality in the Groove Editor, allowing users to highlight a range of cells across multiple instruments.
- **Batch Editing**: Selected cells can now be updated simultaneously using the Symbol Picker or Velocity controls.
- **Keyboard Modifiers**:
  - **Shift + Click**: Quickly toggle the 'Optional' state of a drum hit.
  - **Alt + Click**: Open the Symbol Picker directly, skipping the standard note toggle.
  - **Delete/Backspace**: Clear the current selection or a single focused cell.
- **Grid Clipboard**: Added support for copying selected grid data as JSON (`Cmd/Ctrl + C`) and pasting it at a target location (`Cmd/Ctrl + V`).
- **Ergonomics E2E Suite**: Added a comprehensive Playwright test suite (`tests/e2e/grid-ergonomics.spec.ts`) covering all new selection and rapid editing features.

### Changed
- **Reducer Enhancements**: Updated `grooveReducer` with `CLEAR_GRID`, `CLEAR_ROW`, `TOGGLE_OPTIONAL`, `SET_SELECTION_SYMBOLS`, `SET_SELECTION_VELOCITY`, and `PASTE_SELECTION` actions.
- **NoteCell API**: Updated `NoteCell` and `InstrumentRow` to support mouse event propagation and selection state rendering.

## [0.2.0-alpha] - 2026-03-20

### Added
- **Context-Aware Symbol Picker**: The `SymbolPicker` now dynamically filters available drum symbols based on the instrument category (Kick, Snare, Hi-Hat, etc.), as defined in the `DRUM_AWARE_GRID_SPEC.md`.
- **Improved Picker UI**: Redesigned the `SymbolPicker` with a category-aware header, clear symbol labels, organized grid layout, and entry animations.
- **Velocity Presets**: Enhanced the `SymbolPicker` with one-tap velocity presets (Ghost, Standard, Accent) for faster editing.
- **Drum-Aware Data Model**: Transitioned the Groove Grid from a flat `instrumentId` to a structured `DrumInstrument` object, including `category`, `presetVariety`, and `customName`.
- **Runtime Migration Layer**: Implemented a robust migration system in `supabaseService` to automatically upgrade legacy JSON grid data to the new format upon retrieval.
- **Enhanced Type Safety**: Updated `GrooveAction`, `GrooveGrid`, and all editor components to use the new `DrumInstrument` and `DrumCategory` types.
- **UUID for Tracks**: Each instrument track now has a unique `id` for more reliable state tracking and UI rendering.

### Changed
- **Audio Engine Refinement**: Updated `useAudioPlayback` to use `category` and `presetVariety` for sample mapping, improving fallback logic and accuracy.
- **Editor UI Updates**: Standardized default instrument creation across `SongEditor`, `NotebookEditor`, and `SnippetEditor` to use the new structured model.
- **Ghost Note Velocity**: Standardized Ghost Note velocity to 20% (0.2) across the application and E2E tests for better musical dynamics.

## [0.1.12-alpha] - 2026-03-18

### Added
- **E2E Test Coverage Expansion**: Initiated a major expansion of the Playwright E2E test suite to cover all core user journeys (Search, CRUD, Metadata, Sections, Symbols, Playback, Sharing, and Printing).
- **Tracking Infrastructure**: Created GitHub issue #22 to track the multi-phase implementation of expanded E2E coverage.

## [0.1.11-alpha] - 2026-03-17

### Added
- **Dark Mode Support**: Implemented comprehensive dark mode across the entire application using Tailwind 4 and CSS variables.
- **Theme-Aware Components**: Updated `GrooveGridEditor`, `NoteCell`, `InstrumentRow`, and `SymbolPicker` to automatically adapt to the user's system preference.
- **Automatic Symbol Contrast**: Implemented CSS inversion logic for drum symbols to ensure high visibility on both light and dark backgrounds.
- **Enhanced Global Styles**: Refined `app/globals.css` with a robust set of theme variables (`muted`, `border`, `input`, `ring`) for consistent UI scaling.
- **Home Page Modernization**: Updated the landing page and hero section with theme-aware transitions and high-contrast typography.

## [0.1.10-alpha] - 2026-03-17

### Added
- **GitHub Actions CI Pipeline**: Implemented a comprehensive CI workflow (`.github/workflows/ci.yml`) that runs on every push and PR to `main`.
- **Automated Quality Checks**: The CI pipeline includes:
  - **Linting**: Runs Biome for code and Markdownlint for documentation.
  - **Unit Tests**: Executes the full Vitest suite.
  - **E2E Tests**: Sets up a local Supabase instance and runs the Playwright test suite.
- **Improved Workspace Configuration**: Added a `pnpm-workspace.yaml` with the required `packages` field to ensure compatibility with `pnpm` v10 and GitHub Actions.
- **Optimized CI Performance**: Reduced `supabase start` time in CI by excluding non-essential containers (Studio, Inbucket, Realtime, Edge Runtime, PostgREST).
- **Hardened CI Pipeline**: Implemented security best practices for GitHub Actions:
  - Added top-level `permissions` block to scope `GITHUB_TOKEN` to least privilege (`contents: read`, `pull-requests: write`).
  - Used stable major version tags for GitHub Actions (Checkout, Setup-node, Setup-pnpm, Setup-cli).
  - Pinned Supabase CLI version to `2.81.2` for deterministic and reproducible E2E runs.
- **Fixed CI Dependencies**: Resolved `MODULE_NOT_FOUND` error in Playwright tests by adding `dotenv` as a devDependency.

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
