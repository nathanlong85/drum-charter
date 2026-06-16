## Why

Reordering groove grid instruments via the up/down chevron buttons is tedious — it requires multiple clicks to move a row more than one position, and the small buttons add visual clutter to an already compact editing panel. Replacing this with drag-to-reorder gives users a direct-manipulation interface that matches how most modern editors handle row reordering.

## What Changes

- **Remove** the ChevronUp/ChevronDown buttons from the instrument info panel in edit mode.
- **Add** a vertical grip handle (GripVertical icon) to the instrument info panel in edit mode, replacing the chevrons.
- **Add** drag-and-drop reordering to instrument rows using the HTML5 DnD API — no new library required.
- **Add** a `REORDER_INSTRUMENTS` action to the groove reducer, replacing the directional `MOVE_INSTRUMENT` dispatch for this interaction (the `MOVE_INSTRUMENT` action itself is retained for backward compatibility and programmatic use).
- **Update** visual feedback: the dragged row shows a reduced-opacity style; the drop target row shows a visual indicator line showing where the row will land.

## Capabilities

### New Capabilities

- `drag-to-reorder-instruments`: Allows users in instrument-edit mode to drag instrument rows to any new position in the grid. A grip handle replaces the up/down chevrons. Drag state is managed locally within `GrooveGridEditor`; reordering dispatches `REORDER_INSTRUMENTS` to the reducer.

### Modified Capabilities

<!-- None — no existing specs to delta. -->

## Impact

- `components/groove/InstrumentRow.tsx`: Remove chevron buttons; add grip handle; add HTML5 DnD drag attributes (`draggable`, `onDragStart`, `onDragEnd`).
- `components/groove/GrooveGridEditor.tsx`: Add `onDragOver` / `onDrop` handlers on instrument rows to handle the reorder drop.
- `lib/state/groove-reducer.ts`: Add `REORDER_INSTRUMENTS` action (`{ type: 'REORDER_INSTRUMENTS'; fromIndex: number; toIndex: number }`).
- `lib/types/groove.ts` (if GrooveAction union is declared there): Extend the `GrooveAction` union with the new action type.
- Unit tests: `components/groove/__tests__/InstrumentRow.test.tsx` — update tests to expect the grip handle and remove chevron-button tests.
- Unit tests: `lib/state/__tests__/groove-reducer.test.ts` — add tests for `REORDER_INSTRUMENTS`.
- No new npm dependencies.
- No database schema changes.
- No breaking changes to the public `GrooveGridEditor` API.
