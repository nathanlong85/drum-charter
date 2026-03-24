# DrumCharter: Design Guidelines for Stitch

The goal of this redesign is to transform DrumCharter from a functional tool into a professional-grade workspace for drummers. Think "Digital Audio Workstation (DAW)" meets "Modern Productivity App."

## 1. App Ecosystem & Information Model

DrumCharter allows users to manage their drum music via three distinct, yet unified, entity types:

* **Song Charts (Linear/Chronological):** Structured documents for charting full songs. They follow a clear timeline (Intro -> Verse -> Chorus) with metadata (BPM, Time Signature), section notes, and embedded "Groove Grids."
* **Notebooks (Topical/Modular):** Free-form collections of exercises, drills, or sketches. Unlike Song Charts, sections in a Notebook don't have a fixed order or global tempo—they are modular units for practice and ideation.
* **Groove Snippets (Atomic):** Standalone, reusable drum patterns (usually 1-2 measures). These are the "building blocks" that can be tagged, searched, and eventually referenced inside Songs and Notebooks.

## 2. Core Component: The Groove Grid
The "Groove Grid" is an interactive sequencer, not just a static table.
* **Visual Playhead:** During playback, the grid needs a high-visibility indicator of the current step.
* **Interactive States:** Clearly distinguish between "Standard," "Accent," and "Ghost" hits, and "Optional" status (ghosted out in UI).
* **Touch-Friendly Precision:** Drummers often use tablets (iPads) on music stands. Controls (Tempo, Play/Stop, Symbol Picker) must be large and accessible while maintaining a clean, professional aesthetic.

## 3. Navigation & Layout Strategy
* **DAW-Like Navigation:** A persistent sidebar or high-utility header is preferred over a generic top nav. The user should be able to jump between Libraries (Songs, Notebooks, Snippets), the User Manual, and Set Lists with minimal clicks.
* **The Library Experience:** All three entity types share a unified "Library" card design to ensure the app feels like a single ecosystem.
* **Live Mode:** A specialized, high-contrast, distraction-free layout for stage use. Features large text, fullscreen support, and "Next/Previous" controls optimized for foot switches.

## 4. Visual Requirements
* **Sleek & Modern:** Avoid "skeuomorphic" drum kit graphics. Lean into a clean, flat, yet deep aesthetic (shadows, elevation, subtle gradients).
* **Light & Dark Modes:** Both modes must feel identical in layout. The "Dark Mode" should feel cinematic and high-utility (DAW-inspired).
* **Empty States:** Design helpful "First-Use" states for empty libraries (e.g., "Ready to chart your first groove?").
* **Design Tokens:** Define a clear set of CSS variables for:
  * **Colors:** Primary (Brand), Surface (Backgrounds), Border, Overlay, and Success/Error.
  * **Spacing:** A consistent 4px or 8px based scale.
  * **Elevation:** Define levels for cards, modals, and tooltips.

## 5. User Personas
* **The Student:** Needs clarity, easy navigation, and a readable manual.
* **The Performer:** Needs a bulletproof "Live Mode" with massive visual cues.
* **The Composer:** Needs a fast, ergonomic editor with powerful shortcuts and a clean "scratchpad" (Notebooks).

## 6. Technical Context for Implementation
* **Auto-Save:** Include visual indicators for "Saving..." and "All changes saved."
* **PWA Status:** Clear indicators for "Online" vs. "Offline" (local-first) modes.
* **Accessibility:** Design with screen readers and keyboard navigation in mind (focus rings, ARIA labels).
