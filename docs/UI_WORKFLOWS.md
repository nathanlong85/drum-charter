# UI Workflows

This document outlines the core user journeys and system interactions for DrumCharter. It serves as a source of truth for UI behavior and automated testing.

---

## 1. Authentication & Guest Access

### Workflow: Guest Login
- **Trigger**: Click "Continue as Guest" on the `/login` page.
- **Action**: Calls `supabase.auth.signInAnonymously()`.
- **Transition**: Redirects to `/library`.
- **State**: `is_anonymous` is true. UI shows a "Guest Mode" indicator.

### Workflow: Permanent Sign-In
- **Trigger**: Submit valid email and password on `/login`.
- **Action**: Calls `supabase.auth.signInWithPassword()`.
- **Transition**: Redirects to `/library`.

---

## 2. Library Management

### Workflow: Create New Item (Song, Notebook, or Snippet)
- **Trigger**: Click "New [Item Type]" in the Library Dashboard.
- **Action**: `LibraryDashboard` calls `supabaseService.save[ItemType]` with a new UUID and initial default state.
- **Transition**: Redirects to the editor route (e.g., `/songs/[id]`).
- **State**: The new item is saved to Supabase immediately.

### Workflow: Delete Item
- **Trigger**: Click "Delete" on an item card in the Library.
- **Action**: Calls `supabaseService.delete[ItemType]`.
- **UI State**: Item is removed from the list immediately (optimistic UI update).

---

## 3. Editing Experience (Real-time Persistence)

### Workflow: Dynamic Grid Editing
- **Trigger**: Click a note cell in `GrooveGridEditor`.
- **Action**: `grooveReducer` updates local `state`. `wrappedDispatch` ensures the parent component receives the latest state.
- **Persistence**: Any change triggers a **2s debounced** call to `supabaseService.save[ItemType]`.
- **State**: `isSaving` state is indicated in the editor header.

### Workflow: Section Management (Notebook/Song)
- **Trigger**: Click "Add Section" or "Delete Section".
- **Action**: `useReducer` updates the array of sections.
- **Persistence**: Triggers debounced save to Supabase.

---

## 4. Public Sharing & Viewing

### Workflow: Make Public
- **Trigger**: Toggle the "Public" switch in the Editor header.
- **Action**: Updates `is_public: true` in Supabase.
- **Transition**: Reveals a "Copy Public Link" button.

### Workflow: View Public Chart
- **Trigger**: Navigate to `/public/songs/[id]` (or Notebook/Snippet equivalent).
- **Access**: Accessible by non-authenticated users if `is_public` is true.
- **Restriction**: The UI is **Read-Only**. No edit controls are rendered.

---

## 5. Printing

### Workflow: Print Song Chart
- **Trigger**: Press `Ctrl+P` or click "Print" in the browser.
- **CSS**: `@media print` rules hide navigation, buttons, and settings.
- **Layout**: Renders the chart in a clean, high-contrast, black-and-white layout optimized for standard paper.

---

## 6. Audio Playback & Metronome

### Workflow: Playback Control
- **Trigger**: Click "Play" or "Stop" in `GrooveGridEditor`.
- **Action**: `useAudioPlayback` hook starts/stops the Web Audio API scheduler.
- **Visual State**: A visual playhead (active step highlight) moves across the grid in real-time.
- **Audio State**: Samples (Kick, Snare, Hi-Hat, etc.) are triggered based on the grid's note state and symbols.

### Workflow: Metronome Integration
- **Trigger**: Click the "Metronome" (Bell) icon in the editor toolbar.
- **Action**: Toggles `metronomeEnabled` state in `useAudioPlayback`.
- **Logic**: A click is scheduled on every beat (1/4 note). 
- **Accent**: The first beat of every measure (Beat 1) uses a high-pitched click; other beats use a standard click.
- **Settings**: Users can adjust metronome volume via a popover slider.
- **Persistence**: In Songs, the metronome enabled/disabled state and volume are persisted in the song header.
