## Context

The groove grid renders instrument rows in `GrooveGridEditor.tsx`. Each instrument appears once per "grid block" (a block is a range of measures rendered as a horizontal row). In a 4-measure grid at 2 measures-per-row there are 2 blocks, each with all instruments. Instrument ordering is global state in the reducer.

Currently, `InstrumentRow.tsx` renders ChevronUp/ChevronDown buttons that dispatch `MOVE_INSTRUMENT { direction: 'up' | 'down' }` — a step-by-step approach that requires N-1 clicks to move a row N positions.

The existing `isDragging` / `setIsDragging` context state is already in use for note-cell range selection; instrument-row dragging must not interfere with it.

## Goals / Non-Goals

**Goals**
- Replace chevron buttons with a drag handle that lets users reorder instruments in a single gesture.
- Work across all grid blocks without duplicating drag logic.
- Stay zero new npm dependencies (HTML5 DnD only).
- Pass all existing tests; add new unit tests for the `REORDER_INSTRUMENTS` action.

**Non-Goals**
- Touch/mobile drag support (HTML5 DnD is mouse-only; a future change can add pointer-event-based drag if needed).
- Animated row transitions during drag.
- Undo/redo beyond what the reducer already provides.

## Decisions

### 1. HTML5 Drag and Drop API over a library

**Decision**: Use the native `draggable` attribute + `onDragStart` / `onDragOver` / `onDrop` / `onDragEnd` events.

**Rationale**: No new dependency; the interaction is simple (reorder a flat list); the app already uses no DnD library. The main limitation is no native mobile drag support, which is acceptable for this instrument editing context.

**Alternatives considered**:
- `@hello-pangea/dnd` / `react-beautiful-dnd`: Good API, animated drops, but adds ~30KB and a dependency; overkill for a flat list.
- `@dnd-kit/core`: More modern, pointer-based (works on mobile), but again a new dependency.

### 2. Drag state lives in `GrooveGridEditor` (not in `GrooveGridContext`)

**Decision**: Use two `useState` hooks local to `GrooveGridEditor` — `dragFromIndex: number | null` and `dragOverIndex: number | null` — rather than adding to context.

**Rationale**: Drag state is purely presentational/transient; it does not need to be shared with other consumers of the context. Keeping it local avoids polluting the context interface. The `GridBody` function already has access to both `state.instruments` and `dispatch`, so it can close over the local drag state and pass handlers down as props.

**Alternatives considered**: Adding drag state to `GrooveGridContext` — increases context surface area for a single-use interaction; rejected.

### 3. New `REORDER_INSTRUMENTS` reducer action

**Decision**: Add `{ type: 'REORDER_INSTRUMENTS'; fromIndex: number; toIndex: number }` to `GrooveAction`.

**Rationale**: The HTML5 DnD drop gives us a `fromIndex` and `toIndex` directly; dispatching `MOVE_INSTRUMENT` N times would be awkward and would create N entries in conceptual undo history. A single action that takes exact positions is cleaner and more testable.

**Retained**: `MOVE_INSTRUMENT` is kept as-is for any programmatic / keyboard-accessible use.

### 4. Drag handle replaces chevrons (not augments)

**Decision**: In edit mode, show a `GripVertical` icon as the drag handle and remove the ChevronUp/ChevronDown buttons entirely.

**Rationale**: The drag handle makes the up/down buttons redundant for mouse users. Keeping both creates a cluttered panel. Since the instrument label panel is 128px wide (`w-32`) there is limited horizontal space.

**Trade-off**: Keyboard / assistive-technology users lose the only explicit reorder affordance. A follow-up task can add keyboard support (e.g., shift+arrow while focused on the handle), but that is out of scope here.

### 5. Drop indicator: insert-line approach

**Decision**: When `dragOverIndex !== null`, render a highlighted border on top of the `dragOverIndex` row rather than a separate drop indicator element.

**Rationale**: The simplest visual signal with zero layout shift. A thin primary-colored border-top on the target row clearly communicates "drop here". No additional DOM nodes required.

## Risks / Trade-offs

- **[Risk] Note-cell drag conflicts**: The existing `isDragging` state tracks note-cell range selection drag. If a user starts a note-cell drag and accidentally exits the cell grid area into the instrument panel, browser events could confuse the two drag modes.
  → **Mitigation**: The row drag only activates via `draggable={true}` on the instrument info panel div + a `onDragStart` that calls `e.stopPropagation()`. Note-cell drag uses mouse events (`onMouseDown` / `onMouseEnter`), not the HTML5 DnD API, so they use separate event channels.

- **[Risk] Multi-block rendering**: The same instrument index appears in N grid blocks. A drag started in block 2 must still resolve correctly.
  → **Mitigation**: Drag events carry `instIdx` (the instrument's position in `state.instruments`), not a block-local index. The reducer `REORDER_INSTRUMENTS` operates on global instrument indices.

- **[Risk] `dragOverIndex` can momentarily show the wrong row during rapid mouse movement**.
  → **Mitigation**: `onDragOver` with `preventDefault()` fires continuously; the visual flicker is minimal and acceptable for this use case.

## Migration Plan

1. Add `REORDER_INSTRUMENTS` to the reducer and action union — no breaking change.
2. Update `InstrumentRow` props to accept `onDragStart: (instIdx: number) => void` and `onDrop: (toIndex: number) => void` and `isDragOver: boolean`.
3. Wire drag handlers in `GrooveGridEditor.GridBody`.
4. Remove chevron buttons; add grip handle.
5. Update / add unit tests.
6. No rollback complexity — purely additive UI change; the reducer action is additive.

## Open Questions

- None at this time.
