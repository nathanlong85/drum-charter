# Drum Charter Project Plan

## Project Overview
Drum Charter is a web application tailored for drummers to create, manage, and share drum charts, practice exercises, and groove snippets. It aims to replace cumbersome word processor templates with a streamlined, interactive tool.

### Core Vision
- **Interactive Groove Grid**: A visual, editable grid for drum patterns.
- **Song Charts**: Structured song documents with headers, sections, sub-sections, and inline grooves.
- [x] **Comprehensive Library**: A central place for song charts, notebooks (routines/ideas), and snippets. `✓`
- [ ] **High-Quality Output**: Optimized for printing and PDF export.
- [ ] **Sharing & Collaboration**: Public/private visibility and cloning capabilities.
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
- **State Management**: React `useReducer` / `Zustand` (as needed)

---

## V1 Feature Scope
- [ ] **Project Foundation**:
  - [x] Next.js 16 Initial Setup
  - [x] Tailwind 4 Configuration
  - [x] Vitest & Prettier Setup
  - [x] Playwright Setup
- [ ] **Groove Grid Core**:
  - [x] Data structure for Grids (JSON)
  - [x] Support for multiple resolutions (Quarter, 8th, 16th notes)
  - [x] Support for multiple measures
  - [x] Inline editing of drum hits (Toggle and Symbol Picker)
  - [x] Full Drum Symbols integration (Required and Optional):
    - [x] Analyze Drum Symbols Library (`Drum Symbols.xlsx`) `✓`
    - [x] Implement Symbol Picker in Grid UI `✓`
    - [x] Import and use SVG icons from `Drum Icons` `✓`
- [ ] **Song Charts**:
  - [x] Data structure for Song Charts (Header, Sections, Sub-sections) `✓`
  - [x] Section/Sub-section measure counts (e.g., "Chorus (6M)") `✓`
  - [x] Inline Groove Grid integration `✓`
  - [x] Bullet point notes per section `✓`
- [x] **Notebooks**:
  - [x] Flexible data structure (No global BPM/TimeSig) `✓`
  - [x] Support for sketches, routines, and songwriting ideas `✓`
  - [x] Inline Groove Grid integration `✓`
- [ ] **Groove Snippets**:
  - [ ] Metadata (Title, Tags, Time Signature)
  - [x] Library View integration `✓`
  - [ ] Create/Edit/Save Snippets
- [x] **Library View**:
  - [x] Three-tabbed dashboard (Songs, Notebooks, Snippets) `✓`
  - [x] Search and filter by tags/title `✓`
  - [x] Edit/Delete actions `✓`
- [ ] **Printing**:
  - [ ] Print-friendly layout for individual snippets

---

## Data Entities (Context)
Based on analyzed workflows:
- **Song Chart**: Title, BPM, Time Signature, Sections/Sub-sections (Structured).
- **Notebook**: Title, Sections (Freeform). No global BPM/TimeSig required.
- **Groove Snippet**: Title, Tags, Single Groove Grid (Reusable).

---

## Status Board (Kanban)

### 🔴 To Do
- [ ] Add support for multiple time signatures and resolutions
- [ ] Implement Notebook editor UI

### 🟡 In Progress
- [ ] Implement Notebook editor UI
- [ ] Implement Snippet editor UI

### 🟢 Done
- [x] Project Proposal Analysis
- [x] Initial Repository Structure decision (Unified)
- [x] Creation of `docs/PROJECT_PLAN.md` with Song Chart structure
- [x] Verification of Local Document Paths and Contents
- [x] Interactive Groove Grid UI with Symbol Picker
- [x] Implement `SongChart` UI components (Header, Sections, Sub-sections, Grid integration) `✓`
- [x] Implement persistence (save/load) for Snippets and Charts using Supabase (PostgreSQL) `✓`
- [x] Implement Auth (Login/Signup/Proxy) `✓`
- [x] Create basic library page with three tabs (Songs, Notebooks, Snippets) `✓`
- [x] Define `Notebook` TypeScript interfaces in `lib/types/groove.ts` `✓`
- [x] Create `docs/USE_CASES.md` documenting user workflows `✓`

---

## Instructions for Agents
- **Read Before Work**: This file MUST be read before any work is done to understand the current state and goals.
- **Update After Work**: This file MUST be updated after every task is completed to reflect the latest status, changes made, and next steps.
