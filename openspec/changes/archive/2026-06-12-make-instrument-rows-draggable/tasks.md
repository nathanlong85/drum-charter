## 1. Reducer

- [x] 1.1 Add `REORDER_INSTRUMENTS` action type to the `GrooveAction` union in `lib/state/groove-reducer.ts`
- [x] 1.2 Implement the `REORDER_INSTRUMENTS` case in `grooveReducer` — moves item at `fromIndex` to `toIndex`, returns state unchanged when indices are equal or out of bounds
- [x] 1.3 Add unit tests for `REORDER_INSTRUMENTS` in `lib/state/__tests__/groove-reducer.test.ts`: move to earlier position, move to later position, same index no-op, out-of-bounds no-op

## 2. InstrumentRow Component

- [x] 2.1 Add optional props `onDragStart`, `onDragEnd`, `onDragOver`, `onDrop`, and `isDragOver` to `InstrumentRowProps` in `InstrumentRow.tsx`
- [x] 2.2 Replace ChevronUp/ChevronDown buttons with a `GripVertical` drag handle in the instrument info panel (only shown when `!readOnly && isEditing`)
- [x] 2.3 Make the instrument info panel `div` draggable (`draggable={isEditing && !readOnly}`) and wire `onDragStart` / `onDragEnd` callbacks
- [x] 2.4 Wire `onDragOver` (with `e.preventDefault()`) and `onDrop` on the row's outer `div`
- [x] 2.5 Apply reduced-opacity style to the dragged row when dragging is in progress (use a `data-dragging` or className toggle)
- [x] 2.6 Apply drop-indicator style (prominent top border using `border-t-2 border-primary`) to the row when `isDragOver` is true

## 3. GrooveGridEditor Wiring

- [x] 3.1 Add `dragFromIndex` and `dragOverIndex` local state (`useState<number | null>`) to `GridBody` in `GrooveGridEditor.tsx`
- [x] 3.2 Implement `handleInstrumentDragStart(instIdx)` — sets `dragFromIndex` to `instIdx`
- [x] 3.3 Implement `handleInstrumentDragEnd()` — resets `dragFromIndex` and `dragOverIndex` to `null`
- [x] 3.4 Implement `handleInstrumentDragOver(instIdx)` — sets `dragOverIndex` to `instIdx` (called from row's `onDragOver`)
- [x] 3.5 Implement `handleInstrumentDrop(toIndex)` — dispatches `REORDER_INSTRUMENTS` with `fromIndex` and `toIndex` if they differ, then resets both indices
- [x] 3.6 Pass the new drag handlers and `isDragOver` prop down to each `InstrumentRow`

## 4. Tests

- [x] 4.1 Update `components/groove/__tests__/InstrumentRow.test.tsx`: remove any tests asserting the presence of ChevronUp/ChevronDown buttons; add a test that verifies the grip handle appears when `isEditingInstruments` is true and a test that verifies no grip handle outside edit mode
- [x] 4.2 Add an integration-level test (or extend existing) in `InstrumentRow.test.tsx` verifying that `onDragStart` is called when dragging begins from the instrument panel in edit mode
- [x] 4.3 Verify `pnpm test:run` passes with zero failures

## 5. Quality

- [x] 5.1 Run `pnpm lint` and `pnpm lint:fix` — zero errors and zero warnings
- [x] 5.2 Run `pnpm build` — clean build with no TypeScript errors
