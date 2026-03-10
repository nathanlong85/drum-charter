# Drum Charter Project Plan

## Project Overview
Drum Charter is a web application tailored for drummers to create, manage, and share drum charts, practice exercises, and groove snippets. It aims to replace cumbersome word processor templates with a streamlined, interactive tool.

### Core Vision
- **Interactive Groove Grid**: A visual, editable grid for drum patterns.
- **Song Charts**: Structured song documents with headers, sections, sub-sections, and inline grooves.
- **Comprehensive Library**: A central place for practice routines, song charts, and snippets.
- **High-Quality Output**: Optimized for printing and PDF export.
- **Sharing & Collaboration**: Public/private visibility and cloning capabilities.

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
- [ ] **Groove Snippets**:
  - [ ] Metadata (Title, Tags, Time Signature)
  - [ ] Basic Library View
  - [ ] Create/Edit/Save Snippets
- [ ] **Printing**:
  - [ ] Print-friendly layout for individual snippets

---

## Song Chart Structure (Context)
Based on analyzed templates and examples:
- **Header**: Title, BPM, Time Signature, Song Section list.
- **Section**: Name, Total Measures (e.g., "Intro (4M)"), Groove Grid (optional), Bullet notes.
- **Sub-Section**: Nested within sections, has its own measure count, Groove Grid, and notes.
- **Groove Grid**: Resolution-aware (1 e + a), supports multiple drum symbols.

---

## Status Board (Kanban)

### 🔴 To Do
- [ ] Define `GrooveGrid` TypeScript interfaces in `lib/types/groove.ts`
- [ ] Implement initial `GrooveGrid` React component
- [ ] Add support for multiple time signatures and resolutions
- [ ] Create basic library page to list saved snippets

### 🟡 In Progress
- [ ] Implement persistence (save/load) for Snippets and Charts `*`

### 🟢 Done
- [x] Project Proposal Analysis
- [x] Initial Repository Structure decision (Unified)
- [x] Creation of `docs/PROJECT_PLAN.md` with Song Chart structure
- [x] Verification of Local Document Paths and Contents
- [x] Interactive Groove Grid UI with Symbol Picker
- [x] Implement `SongChart` UI components (Header, Sections, Sub-sections, Grid integration) `✓`

---

## Instructions for Agents
- **Read Before Work**: This file MUST be read before any work is done to understand the current state and goals.
- **Update After Work**: This file MUST be updated after every task is completed to reflect the latest status, changes made, and next steps.
