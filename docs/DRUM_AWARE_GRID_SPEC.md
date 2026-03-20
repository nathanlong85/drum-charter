# Technical Specification: Drum-Aware Grid

This document defines the data relationships and logic for the specialized drum grid architecture.

## 1. Drum Categories & Symbol Mapping

Only specific symbols are applicable to each drum category.

| Category | Applicable Symbols |
| :--- | --- |
| **Kick** | Standard, Accent |
| **Snare** | Standard, Accent, Buzz, Cross Stick, Rim Shot, Doubles, Flams, Ghost Notes |
| **Tom** | Standard, Accent, Doubles, Flams, Ghost Notes |
| **Crash** | Standard, Accent, Doubles, Flams, Ghost Notes, Cymbal Bell, Cymbal Choke |
| **Ride** | Standard, Accent, Doubles, Flams, Ghost Notes, Cymbal Bell, Cymbal Choke |
| **Hi-Hat** | Hi Hat Closed, Hi Hat Loose, Hi Hat Open, Hi Hat Pedal Chick |
| **Misc** | Standard, Accent, Ghost Notes, Flams |

## 2. Pre-set Varieties

Preset varieties are defined by the system. Custom-named instruments must be based on one of these presets to inherit their sound samples.

| Category | Pre-set Varieties |
| :--- | --- |
| **Kick** | Kick |
| **Snare** | Snare |
| **Tom** | High Tom, Mid Tom, Floor Tom |
| **Crash** | Crash, Splash |
| **Ride** | Ride |
| **Hi-Hat** | Hi-Hat |
| **Misc** | Tambourine, Woodblock, Cowbell |

## 3. Data Model (Proposed)

The grid JSON structure will transition from a flat `instrumentId` to a structured object.

```typescript
interface DrumInstrument {
  id: string; // Unique UUID for the track
  category: DrumCategory; // Kick, Snare, etc.
  presetVariety: string; // Floor Tom, Splash, etc.
  customName: string; // User-defined label (e.g., "Trash 2")
  notes: DrumSymbol[];
  velocities: number[];
}
```

## 4. UI Interaction State (Selection & Copy/Paste)

To support multi-cell operations, the editor state needs to track selection.

```typescript
interface GridSelection {
  start: { row: number; col: number } | null;
  end: { row: number; col: number } | null;
  isDragging: boolean;
}
```

- **Drag-to-Select**: On `MouseDown`, set `start`. On `MouseMove`, update `end`. On `MouseUp`, finalize selection.
- **Visuals**: A blue overlay semi-transparently covers selected cells.
- **Copy**: Serialize the selected sub-grid to a standard JSON format in the clipboard.
- **Paste**: On `Paste`, merge the clipboard JSON into the current grid starting at the target cell.

## 5. Keyboard Modifiers

| Key Combo | Action |
| :--- | :--- |
| **Shift + Click** | Toggle "Optional" state of current cell. |
| **Alt + Click** | Open `SymbolPicker` directly (skipping toggle). |
| **Delete** | Clear symbol from current (or selected) cells. |
| **Cmd/Ctrl + C** | Copy selected range to clipboard. |
| **Cmd/Ctrl + V** | Paste range from clipboard. |

## 6. Audio Logic

Samples are determined by the combination of `presetVariety` and `DrumSymbol`.

- **Path Pattern**: `/audio/samples/[category]/[variety]/[symbol].wav`
- **Optional Hits**: A global toggle will filter the audio scheduler to skip "Optional" articulations (Ghost Notes, etc.) when enabled.
