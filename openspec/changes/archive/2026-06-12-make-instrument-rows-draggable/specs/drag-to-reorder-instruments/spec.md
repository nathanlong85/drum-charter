## ADDED Requirements

### Requirement: Grip handle replaces chevron buttons in edit mode

In instrument-edit mode (`isEditingInstruments === true`) and when the grid is not read-only, the instrument info panel SHALL display a vertical grip handle (GripVertical icon) instead of the ChevronUp and ChevronDown buttons.

#### Scenario: Grip handle visible in edit mode
- **WHEN** the user activates instrument-edit mode on a non-read-only grid
- **THEN** each instrument row SHALL display a GripVertical drag handle icon in the instrument info panel
- **AND** no ChevronUp or ChevronDown buttons SHALL be present

#### Scenario: Grip handle hidden outside edit mode
- **WHEN** instrument-edit mode is not active OR the grid is read-only
- **THEN** no grip handle SHALL be displayed in the instrument info panel

### Requirement: Instrument rows are draggable in edit mode

In instrument-edit mode, each instrument row SHALL be draggable via HTML5 drag-and-drop using the instrument info panel as the drag source.

#### Scenario: Drag starts from instrument panel
- **WHEN** the user begins dragging an instrument row in edit mode
- **THEN** the drag operation SHALL begin
- **AND** the dragged row SHALL render at reduced visual prominence (e.g., reduced opacity) to indicate it is being moved

#### Scenario: Drag disabled outside edit mode
- **WHEN** instrument-edit mode is not active OR the grid is read-only
- **THEN** the instrument rows SHALL NOT be draggable

### Requirement: Drop indicator shows insertion point

While an instrument row drag is in progress, the row currently under the cursor SHALL display a visual drop indicator so the user knows where the row will land.

#### Scenario: Drop indicator appears on hover target
- **WHEN** the user drags an instrument row over another instrument row
- **THEN** the target row SHALL display a prominent top-border or highlight to indicate the drop insertion point

#### Scenario: Drop indicator clears on drag end
- **WHEN** the drag operation ends (either by dropping or by cancellation)
- **THEN** all drop indicators SHALL be removed

### Requirement: Dropping an instrument row reorders the instruments

When the user releases a dragged instrument row onto a different row position, the instruments SHALL be reordered to place the dragged row at the new position.

#### Scenario: Successful reorder drop
- **WHEN** the user drags instrument at index `fromIndex` and drops it onto the row at index `toIndex`
- **THEN** the instruments array SHALL be updated such that the dragged instrument appears at `toIndex` and the surrounding instruments shift accordingly
- **AND** the groove grid SHALL immediately reflect the new order visually

#### Scenario: Drop onto same position is a no-op
- **WHEN** the user drags an instrument and drops it back onto its own row
- **THEN** the instruments array SHALL remain unchanged

#### Scenario: Drop cancellation is a no-op
- **WHEN** the user begins dragging an instrument row and cancels (e.g., presses Escape or releases outside a valid drop target)
- **THEN** the instruments array SHALL remain unchanged

### Requirement: REORDER_INSTRUMENTS reducer action

The groove reducer SHALL handle a `REORDER_INSTRUMENTS` action with `fromIndex: number` and `toIndex: number` fields that reorders the instruments array by moving the item at `fromIndex` to `toIndex`.

#### Scenario: Move instrument to earlier position
- **WHEN** `REORDER_INSTRUMENTS` is dispatched with `fromIndex: 3` and `toIndex: 1` on a grid with 5 instruments
- **THEN** the instrument previously at index 3 SHALL be at index 1
- **AND** instruments previously at indices 1 and 2 SHALL shift to indices 2 and 3 respectively

#### Scenario: Move instrument to later position
- **WHEN** `REORDER_INSTRUMENTS` is dispatched with `fromIndex: 0` and `toIndex: 4` on a grid with 5 instruments
- **THEN** the instrument previously at index 0 SHALL be at index 4
- **AND** instruments previously at indices 1–4 SHALL shift to indices 0–3 respectively

#### Scenario: fromIndex equals toIndex is a no-op
- **WHEN** `REORDER_INSTRUMENTS` is dispatched with `fromIndex` equal to `toIndex`
- **THEN** the instruments array SHALL be returned unchanged

#### Scenario: Out-of-bounds indices are ignored
- **WHEN** `REORDER_INSTRUMENTS` is dispatched with `fromIndex` or `toIndex` outside the valid range `[0, instruments.length - 1]`
- **THEN** the instruments array SHALL be returned unchanged
