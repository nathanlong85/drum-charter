# UI Workflows

This document outlines the core user journeys and system interactions for DrumCharter. It serves as a source of truth for UI behavior and automated testing.

---

## 1. Authentication

### Workflow: Sign-In

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

### Workflow: Advanced Grid Editing (Multi-cell & Shortcuts)

- **Multi-select**: Click and drag across note cells to create a selection box. Selected cells are visually highlighted.
- **Bulk Action**: Pressing `Delete` clears all symbols from selected cells. Selecting a symbol from the picker applies it to all selected cells.
- **Clipboard**: `Ctrl+C` copies selected cells to a JSON string in the clipboard. `Ctrl+V` pastes starting at the currently focused cell.
- **Shortcuts**: `Shift+Click` on a cell toggles the "Optional" (ghost note) version of the current symbol.

### Workflow: Live Mode & Setlists

- **Enter Live Mode**: Click "Live Mode" (Expand icon) in a Song Chart or Setlist view.
- **Display**: UI switches to a high-contrast, fullscreen layout. Sidebar and editor controls are hidden.
- **Navigation**: `Page Down` / `Space` / `Right Arrow` advances to the next section or song. `Page Up` / `Backspace` / `Left Arrow` goes back.
- **Foot Switch Support**: The system listens for these standard keyboard events (emulated by most Bluetooth page turners) to trigger navigation.
- **Setlist Transition**: At the end of a song in a setlist, the next song's chart is automatically loaded into the Live Mode view.

### Workflow: Instrument Customization (Drum-Aware)

- **Trigger**: Click "Add Instrument" or the settings icon on an existing instrument row.
- **Action**: Opens a dialog to select a **Category** (e.g., Kick), a **Preset Variety** (e.g., High Tom), and an optional **Custom Name**.
- **Logic**: If adding a duplicate variety, the system auto-increments the name (e.g., "Crash" -> "Crash 2").
- **Constraint**: The **Category** restricts the set of symbols available in the `SymbolPicker`.

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
- **Audio State**: Samples are triggered based on the grid's note state, symbol, and preset variety.

### Workflow: Optional Hit Management

- **Trigger**: Toggle the "Optional Hits" switch in the playback toolbar.
- **Action**: Filters the audio scheduler.
- **Behavior**: If disabled, symbols marked as "Optional" (e.g., ghost notes, optional accents) will not trigger audio samples, allowing the user to focus on core rhythms.

### Workflow: Metronome Integration

- **Trigger**: Click the "Metronome" (Bell) icon in the editor toolbar.
- **Action**: Toggles `metronomeEnabled` state in `useAudioPlayback`.
- **Logic**: A click is scheduled on every beat (1/4 note).
- **Accent**: The first beat of every measure (Beat 1) uses a high-pitched click; other beats use a standard click.
- **Settings**: Users can adjust metronome volume via a popover slider.
- **Persistence**: In Songs, the metronome enabled/disabled state and volume are persisted in the song header.
