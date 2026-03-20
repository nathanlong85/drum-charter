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

## 4. Audio Logic

Samples are determined by the combination of `presetVariety` and `DrumSymbol`.

- **Path Pattern**: `/audio/samples/[category]/[variety]/[symbol].wav`
- **Optional Hits**: A global toggle will filter the audio scheduler to skip "Optional" articulations (Ghost Notes, etc.) when enabled.
