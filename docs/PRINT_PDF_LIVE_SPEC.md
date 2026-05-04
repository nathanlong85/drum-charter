# Specification: Drum Chart Layout (Print, PDF, Live Mode)

This specification defines the formatting and layout standards for DrumCharter song charts, snippets, and notebooks, optimized for both physical paper and stage performance.

## 1. Top-Level Metadata (Header)
The song header must be separated from the main body by a 2px horizontal separator.
- **Title**: Large, bold, left-aligned (e.g., `text-5xl`).
- **BPM**: Displayed as `BPM: [Value]`.
- **Time Signature**: Displayed as `Time: [Top]/[Bottom]`.
- **Order**: A comma-separated list of all sections (e.g., `Intro, Verse 1, Chorus...`).
  - *Logic*: Auto-generated from the sections list with a manual override field.

## 2. Structural Hierarchy & Indentation
Indentation is critical for visual organization and must follow these levels:
- **Level 0 (No Indent)**: Section Headers (e.g., `Chorus (8M)`).
- **Level 1 (Indented)**:
  - Section Content (Notes, Grids, Snippets).
  - Subsection Headers (e.g., `First half (8M)`).
- **Level 2 (Double Indent)**:
  - Subsection Content (Notes, Grids, Snippets).

## 3. Typography & Styles
- **Section Headers**: Bold (e.g., `font-black`).
- **Subsection Headers**: Underlined.
- **Notes**: Bullet points using high-contrast markers.
- **High Contrast**: All print/PDF output must use a white background with black text/borders, regardless of the user's active theme.

## 4. Groove Grid & Snippet Formatting
- **Uniform Measure Sizing**: Measures must maintain a fixed width (e.g., 160px for 4/4 at 16th resolution) regardless of the total count in the grid.
- **Grid Wrapping**:
  - Grids should fit a maximum of **2 measures** horizontally.
  - If a grid has more than 2 measures, it must wrap into a new row of measures below the first.
- **Content Scaling**: Grid symbols and labels must remain at a consistent size across all views.

## 5. Page Management (Print/PDF)
- **Break Prevention**: Sections and subsections must never be split across pages. Use `break-inside: avoid`.
- **Readability vs. Compactness**: Prioritize readability over saving space. If a section is too long for the remaining space on a page, it should start on a new page.

## 6. Live Mode (Performance View)
- **High-Visibility**: Massive typography and high-contrast colors (Primary on dark/low-surface backgrounds).
- **Single-Section Focus**: Display only the current section with an "Up Next" preview for the following section.
- **Hands-Free Navigation**: Support for foot pedals and MIDI triggers to advance or regress sections.
