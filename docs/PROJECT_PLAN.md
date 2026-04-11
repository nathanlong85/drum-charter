# DrumCharter Project Plan

DrumCharter is a web application tailored for drummers to create, manage, and share drum charts, practice exercises, and groove snippets. It aims to replace cumbersome word processor templates with a streamlined, interactive tool.

## Core Vision

- **Interactive Groove Grid**: A visual, editable grid for drum patterns.
- **Song Charts**: Structured song documents with headers, sections, sub-sections, and inline grooves.
- [x] **Comprehensive Library**: A central place for song charts, notebooks (routines/ideas), and snippets. `✓`
- [x] **High-Quality Output**: Optimized for printing and physical drum charts. `✓`
- [x] **Sharing & Collaboration**: Public/private visibility and public viewing routes. `✓`
- [x] **Notebooks (Ideas & Practice)**: `✓`

---

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **Testing**: Vitest, Playwright, React Testing Library
- **Linting/Formatting**: Biome

---

## V1 Feature Scope

- [x] **Project Foundation**: Next.js 16, Tailwind 4, Vitest, Playwright. `✓`
- [x] **Groove Grid Core**: Resolutions, Measures, Inline editing, Symbols. `✓`
- [ ] **Drum-Aware Grid Architecture** (Next Phase):
  - [x] **Data Model Overhaul**: Transition to `DrumInstrument` structure. `✓`
  - [x] **Symbol Filtering**: Category-based symbol restrictions. `✓`
  - [ ] **Sample Matrix**: Implement high-fidelity playback mapping. (#30)
  - [x] **Dynamic Instrument Management**: Custom varieties support. `✓`
  - [x] **Optional Hit Control**: Playback toggle. `✓`
- [x] **Song Charts**: Headers, Sections, Inline Grids, Editor UI. `✓`
- [x] **Notebooks**: Flexible structure, Practice routines, Editor UI. `✓`
- [x] **Groove Snippets**: Metadata, Create/Edit flow. `✓`
- [x] **Library View**: Dashboard, Search/Filter, CRUD actions. `✓`
- [x] **Printing & Sharing**: Print-friendly CSS, Public routes, Visibility toggle. `✓`

---

## V2 Feature Scope (In Planning)

- [x] **Advanced Grid Ergonomics**: Row presets, Multi-cell interaction, Clipboard, Modifiers. `✓`
- [x] **Performance & Live Mode**: High-contrast UI, Remote control, Setlists, Auto-advance. `✓`
- [x] **Documentation**: In-app User Manual. `✓`

---

## Status Board (Kanban)

### 🟢 Done (Recent)

- [x] [Arch/UX] Modernize Web App (Phase 4): Enhanced testing infrastructure with **Visual Regression Tests** for Dashboard, Library, and GrooveGrid. Expanded Vitest component coverage for \`AppShell\` and \`LibraryHeader\`. (#120) \`✓\`
- [x] [Arch/UX] Modernize Web App (Phase 3): Implemented React 19 \`useOptimistic\` for instant library item mutations. Audited and improved WCAG accessibility (focus rings on cards and inputs). Eliminated data waterfalls in \`AppLayout\` and Live Mode views using \`Promise.all\`. (#120) \`✓\`
- [x] [Arch/UX] Modernize Web App (Phase 2): Refactored Library into nested route segments (\`/library/songs\`, etc.) for better caching and RSC alignment. Implemented mobile-first bottom tab bar in \`AppShell\`. Updated all E2E tests for new routing structure. (#120) \`✓\`
- [x] [Arch/UX] Modernize Web App (Phase 1): Unified Dashboard and AppShell into \`(app)\` group. Implemented server-side logout for cookie reliability. Updated global navigation to favor the new authenticated workspace structure (#120) \`✓\`
- [x] [UX] Universal Header User Menu: Moved user profile from sidebar to top-right header for global accessibility and consistency. Grouped with data refresh controls. Resolved redundant component instances (#117) \`✓\`
- [x] [Fix] Sign Out Reliability: Fixed non-functional "Sign Out" button by ensuring proper client-side redirection and session clearance. Added E2E verification (#116) `✓`
- [x] [Arch] Remove Guest Mode & Migrate Tests: Ripped out Supabase Anonymous Sign-in and "Continue as Guest" flow. Enforced strict route protection for app workspace. Refactored full Playwright E2E suite to use standard test user authentication, resolving data collisions and flakiness (#116) `✓`
- [x] [Fix] Auth Status & User Menu Reliability: Resolved "stuck loading" state in AuthStatus by ensuring `setLoading(false)` on auth change and passing server-side props on Home and Setlist pages. Enhanced menu button visibility and interactivity (#105) `✓`
- [x] [Chore] Architectural Refactor & Test Modernization: Decomposed monolithic components (`SongEditor`, `GrooveGridEditor`), parallelized data waterfalls, and migrated E2E tests to Page Object Model (POM). `✓`
- [x] [Feature] Authenticated Dashboard (Mission Control): Streamlined access to recent activity and creation tools for logged-in users (#96) `✓`
- [x] [Chore] Architectural Refactor: Separate Custom Skills from Vendor Skills (#103) `✓`
- [x] [UX] User Profile Dropdown: Compact Radix UI menu for AuthStatus and removed legacy Settings icon (#97) `✓`
- [x] [Infra] Automated Deployment Pipeline: Dual-environment (Staging/Prod) sync with GitHub Actions and Vercel. (#91, #92) `✓`
- [x] [Feature] Enhance AppShell Refresh Button: Data re-validation (router.refresh), tooltip, and loading state visuals (#94) `✓`
- [x] [Navigation] Universal 'Home' Logo Linking: Ensure all logo instances in AppShell act as home links (#98) `✓`
- [x] [Feature] Quick Row Presets: Per-instrument dropdown for rapid pattern entry and row muting (#89) `✓`
- [x] [Feature] Groove Snippet Integration: Seamlessly insert pattern snippets into Song Charts and Notebooks (#63) `✓`
- [x] [Fix] Offline Support Reliability: Enabled and stabilized offline reload check in PWA tests and integrated into CI (#81, #86) `✓`
- [x] [Fix] Song Editor Layout: Resolved clumped action buttons with a new responsive EditorToolbar component (#62) `✓`

*Older items archived in `docs/ARCHIVE_PLAN.md`*

---

## Project Rules & Collaborative Protocols

Formal protocols are located in **`.gemini/rules/`** and aggregated in **`GEMINI.md`**.

## Known Issues
- None.
