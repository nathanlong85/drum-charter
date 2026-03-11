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
