# DrumCharter Project Plan

DrumCharter is a web application tailored for drummers to create, manage, and share drum charts, practice exercises, and groove snippets. It aims to replace cumbersome word processor templates with a streamlined, interactive tool.

### Core Vision
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

## Status Board (Kanban)

### 🟢 Done
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
- [x] Implement Anonymous Sign-In (Guest Mode) `✓`
- [x] Groove Grid Core (Resolutions, Measures, Symbols) `✓`

### 🟡 In Progress
- [ ] [Feature] Multi-layer Velocity Support (#3)

### 🔵 Backlog (GitHub Issues)
- [ ] [Feature] Dark Mode Support (#4)
- [ ] [Feature] Offline Support (PWA) (#5)
- [ ] [Feature] Snippet Tagging & Metadata UI (#6)
- [ ] [E2E] Stabilization (timeouts, persistence anchors)

---

## Project Rules & Collaborative Protocols

To ensure high-quality collaboration and maintain the stability of the DrumCharter codebase, the following protocols are strictly enforced. **These take precedence over all other instructions and are now formally located in `.junie/guidelines.md`.**

### 1. Stop-and-Wait Protocol
- **No Silent Implementation**: Never bundle code fixes, refactors, or new features into a response unless the previous turn was an explicit approval to do so.
- **Explicit Approval Tokens**: Only messages containing clear, affirmative approval (e.g., "Go ahead," "Proceed," "Approved," "Yes, do that") are treated as a green light to make project changes.
- **Step-by-Step Approval**: For multi-step tasks, seek approval for each individual step before moving on to the next.

### 2. Communication Rules
- **Direct Answers First**: If a user asks a question, the entire response must focus on the answer and discussion. Zero code edits or file changes should occur in that turn.
- **Drop and Listen**: When the user stops a task or flags an issue, immediately halt all other activity and address that concern.
- **No Overwhelming Context**: Do not bundle unrelated technical updates or plans into a response to a specific question.
- **Answer-First**: Start every response with a direct, concise answer to the user's question.

### 3. Technical & Mode Rules
- **100% Test Coverage**: All new features and core logic must have corresponding unit (Vitest) and/or E2E (Playwright) tests.
- **Local-First Dev**: Always use the local Supabase Docker instance for development and testing.
- **Commit Identity**: All commits must be made exclusively on behalf of `Nathan Long <nathanlong85@gmail.com>`. No co-author trailers.

---

## Instructions for Agents
- **Read Before Work**: This file MUST be read before any work is done.
- **Update After Work**: This file MUST be updated after every task is completed.
