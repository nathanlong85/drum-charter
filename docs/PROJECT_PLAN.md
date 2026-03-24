# DrumCharter Project Plan

DrumCharter is a web application tailored for drummers to create, manage, and share drum charts, practice exercises, and groove snippets. It aims to replace cumbersome word processor templates with a streamlined, interactive tool.

## Core Vision

- **Interactive Groove Grid**: A visual, editable grid for drum patterns.
- **Song Charts**: Structured song documents with headers, sections, sub-sections, and inline grooves.
- [x] **Comprehensive Library**: A central place for song charts, notebooks (routines/ideas), and snippets. `✓`
- [x] **High-Quality Output**: Optimized for printing and physical drum charts. `✓`
- [x] **Sharing & Collaboration**: Public/private visibility and public viewing routes. `✓`
- [x] **Notebooks (Ideas & Practice)**: `✓`
  - [x] Data structure for Notebooks (Title, Sections, Flexible Grids) `✓`
  - [x] Support for freeform notes and practice routines `✓`
  - [x] Library View integration `✓`
  - [x] CRUD operations in Supabase `✓`

---

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **Testing**:
  - **Unit/Logic**: Vitest
  - **Component/Integration**: React Testing Library
  - **E2E**: Playwright
- **Linting/Formatting**: ESLint 9 + Prettier
- **State Management**: React `useReducer` / `lodash.debounce` persistence

---

## V1 Feature Scope

- [x] **Project Foundation**:
  - [x] Next.js 16 Initial Setup `✓`
  - [x] Tailwind 4 Configuration `✓`
  - [x] Vitest & Prettier Setup `✓`
  - [x] Playwright Setup `✓`
- [x] **Groove Grid Core**:
  - [x] Data structure for Grids (JSON) `✓`
  - [x] Support for multiple resolutions (Quarter, 8th, 16th notes) `✓`
  - [x] Support for multiple measures `✓`
  - [x] Inline editing of drum hits (Toggle and Symbol Picker) `✓`
  - [x] Full Drum Symbols integration (Required and Optional) `✓`
- [ ] **Drum-Aware Grid Architecture** (Next Phase):
  - [x] **Data Model Overhaul**: Transition from flat `instrumentId` to a structured `DrumInstrument` (Category, Preset Variety, Custom Name). `✓`
  - [x] **Symbol Filtering**: Restrict available symbols in the `SymbolPicker` based on the drum category (e.g., Snare vs. Kick). `✓`
  - [ ] **Sample Matrix**: Implement a `PresetVariety + Symbol` audio mapping for high-fidelity playback. Include **Volume Fallback** logic (e.g., scale `standard.wav` volume for Ghost/Accent if specific files are missing). (#30)
  - [x] **Dynamic Instrument Management**: Support adding custom varieties based on presets with auto-incrementing default names. `✓`
  - [x] **Optional Hit Control**: Add a toggle to enable/disable playback of optional hits during practice. `✓`
- [x] **Song Charts**:
  - [x] Data structure for Song Charts (Header, Sections, Sub-sections) `✓`
  - [x] Section/Sub-section measure counts (e.g., "Chorus (6M)") `✓`
  - [x] Inline Groove Grid integration `✓`
  - [x] Bullet point notes per section `✓`
  - [x] Implement Song editor UI (Dynamic sections, Auto-save) `✓`
- [x] **Notebooks**:
  - [x] Flexible data structure (No global BPM/TimeSig) `✓`
  - [x] Support for sketches, routines, and songwriting ideas `✓`
  - [x] Implement Notebook editor UI (Dynamic sections, Auto-save) `✓`
- [x] **Groove Snippets**:
  - [x] Metadata (Title, Tags, Time Signature) `✓`
  - [x] Create/Edit/Save Snippets `✓`
- [x] **Library View**:
  - [x] Three-tabbed dashboard (Songs, Notebooks, Snippets) `✓`
  - [x] Search and filter by tags/title `✓`
  - [x] Edit/Delete actions `✓`
- [x] **Printing & Sharing**:
  - [x] Print-friendly CSS (@media print) `✓`
  - [x] Public viewing routes (/public/songs/[id]) `✓`
  - [x] Public/Private visibility toggle `✓`

---

## V2 Feature Scope (In Planning)

- [x] **Advanced Grid Ergonomics**:
  - [x] **Multi-cell Interaction**: Implement selection box (drag-to-select), multi-cell clear, and multi-cell symbol application. (#35) `✓`
  - [x] **Grid Clipboard**: Support copy/pasting single or multiple cells within and across grids. (#35) `✓`
  - [x] **Modifier Clicks**: Support `Shift + Click` for optional hits and other keyboard + click combos for rapid articulation entry. (#36) `✓`
  - [x] **Quick Clear**: Add "Clear Grid" and "Clear Row" functions for rapid resets. (#34) `✓`
- [x] **Performance & Live Mode**:
  - [x] **Live Mode UI**: High-contrast, fullscreen-optimized view for stage use. (#37) `✓`
  - [x] **Remote Control Integration**: Support for Bluetooth foot switches and MIDI controllers for hands-free page turning. (#39) `✓`
  - [x] **Setlist Management**: Create, reorder, and save lists of songs for seamless performance transitions. (#38) `✓`
  - [x] **Continuous Playback**: Auto-advance to the next song in a setlist after the current one finishes or on a manual trigger. (#38) `✓`
  - [x] **Section Markers**: High-visibility markers and measure countdowns for stage use. (#49) `✓`
- [x] **Documentation**:
  - [x] **User Manual**: Comprehensive in-app and standalone guide for users. (#48) `✓`

---

## Status Board (Kanban)

### 🔵 In Progress

- [ ] [Epic] Apply UI Redesign from Stitch Exports (#70)
- [ ] [Epic] Drum-Aware Grid Architecture (#26)
  - [ ] [Task] Refined Audio Engine & Sample Matrix (#30)
  - [ ] [Task] Drum Sample Sourcing (#31)

### 🟢 Done

- [x] [Epic] Upgrade to Next.js 16.2 & AI Agent Optimization (#52) `✓`
  - [x] [Task] Upgrade next and eslint-config-next to 16.2.1 (#53) `✓`
  - [x] [Task] Setup AGENTS.md and CLAUDE.md for AI Optimization (#54) `✓`
  - [x] [Task] Enable browser-to-terminal logging in Next.js config (#55) `✓`
  - [x] [Task] Document next-browser usage for the project (#56) `✓`
- [x] [Chore] Expand E2E test coverage for all core UI flows (#22) `✓`
- [x] [Task] PNG Fallback Icons for PWA (#13) `✓`
- [x] [Feature] Section Markers: Clear visual indicators for song sections in Live Mode (#49) `✓`
- [x] [Documentation] Create Comprehensive User Manual (#48) `✓`
- [x] [Feature] Remote Control Support (Foot Switch/MIDI) (#39) `✓`
- [x] [Feature] Setlist Management (#38) `✓`
- [x] [Feature] Keyboard Modifiers for Rapid Editing (#36) `✓`
- [x] [Feature] Multi-cell Selection & Copy/Paste (#35) `✓`
- [x] [Feature] Quick Clear Grid/Row functionality (#34) `✓`
- [x] [Task] Optional Hit Playback Toggle (#32) `✓`
- [x] [Chore] Comprehensive Codebase Audit and Standardization (#24) `✓`
- [x] [Task] Context-Aware Symbol Picker (#29) `✓`
- [x] [Task] Instrument Customization UI (#28) `✓`
- [x] [Task] Data Model Update (JSON) & Migration (#27) `✓`
- [x] [Chore] Standardize PWA architecture and Enable HTTPS/Offline Verification (#18) `✓`
- [x] [Feature] Dark Mode Support (#4) `✓`
- [x] [Chore] GitHub Actions CI Pipeline (Linting, Unit Tests, E2E) (#20) `✓`
- [x] [Chore] CI Security Hardening (SHA pinning, least-privilege permissions, pinned Supabase CLI) (#20) `✓`
- [x] [Fix] Resolve Playwright CI failure (missing `dotenv`) and optimize Supabase startup (#20) `✓`
- [x] [Feature] Offline Support (PWA) (#5) `✓`
- [x] [Feature] Audio Playback: Metronome Support (#2) `✓`
- [x] GitHub Formalization (Issues, Kanban, Templates) `✓`
- [x] Local-First Development Environment (Supabase Docker) `✓`
- [x] Schema Baselining & Migration Repair `✓`
- [x] Synchronized Local Seed Data `✓`
- [x] Audio Playback MVP (Kick, Snare, Hi-Hat) with sample-accurate Web Audio API scheduler `✓`
- [x] Full Drum Kit Overhaul (17 sounds, Symbol Mapping) `✓`
- [x] Fix: RLS Violation (42501) on item creation `✓`
- [x] Fix: Audio Decoding and Supabase Error Visibility `✓`
- [x] Visual Playhead synchronization and BPM management for all entity types `✓`
- [x] Public routes and read-only views for Notebooks and Snippets `✓`
- [x] Clone/Duplicate Item logic and UI `✓`
- [x] v0.1.1-alpha: Management Layer (Duplicate, Sharing) `✓`
- [x] v0.1.0-alpha: Core Editors & Testing Baseline `✓`
- [x] Print-Friendly Layout & @media print styles `✓`
- [x] Public Sharing & Public Routes (Songs) `✓`
- [x] Library Navigation and AuthStatus improvements `✓`
- [x] Guest Mode (Anonymous Sign-In) `✓`
- [x] Landing Page Redesign (Hero, Demo, Features) `✓`
- [x] Snippet Editor UI `✓`
- [x] Interactive Song Editor UI `✓`
- [x] Dynamic Time Signatures & Resolution `✓`
- [x] Notebook Editor UI `✓`
- [x] Supabase Connection & Schema `✓`
- [x] Groove Grid Engine `✓`
- [x] Project Documentation & Use Cases `✓`
- [x] Document CLI usage patterns in `.junie/CLI_REFERENCE.md` `✓`
- [x] Fix: Create missing `notebooks` table in Supabase via CLI migration `✓`
- [x] Restore full type safety for Notebook operations in `supabaseService` `✓`
- [x] Supabase TypeScript Type Generation and Service Refactor `✓`
- [x] Initialize CHANGELOG.md (v0.1.0-alpha) `✓`
- [x] Implement Unit Tests for all core editors (Song, Notebook, Snippet) `✓`
- [x] Move dev server and Playwright to Port 3001 `✓`
- [x] Fix "Error creating new item" in Library and add creation flow unit tests `✓`
- [x] Rebrand to DrumCharter and landing page redesign `✓`
- [x] [E2E] Stabilization (timeouts, persistence anchors) `✓`
- [x] Implement Anonymous Sign-In (Guest Mode) `✓`
- [x] Groove Grid Core (Resolutions, Measures, Symbols) `✓`

---

## Project Rules & Collaborative Protocols

To ensure high-quality collaboration and maintain the stability of the DrumCharter codebase, the following protocols are strictly enforced. **These take precedence over all other instructions and are now formally located in `GEMINI.md` and `.gemini/rules/`.**

---

## Instructions for Agents

- **Read Before Work**: This file MUST be read before any work is done.
- **Update After Work**: This file MUST be updated after every task is completed.
