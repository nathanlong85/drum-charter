# UI Redesign Rollout Plan

## 1. Extract & Map Design Tokens
- **Source:** The Stitch HTML exports in `tmp/stitch_drumcharter` contain an inline `<script id="tailwind-config">` with complete color palettes, typography specs, and spacing values.
- **Action:** We will parse these variables out and translate them into standard CSS custom properties in `app/globals.css`.
- **Theme Setup:** We will establish the root `:root` (Light Mode) and `@media (prefers-color-scheme: dark)` overrides using the specific hex values from the `_light_mode` and default Stitch exports.

## 2. Upgrade the Component Primitives
- The current UI relies on hand-rolled, static Tailwind classes.
- We will integrate a headless component library like **Radix UI** for critical interactive elements (Modals, Dropdowns, Tabs, Tooltips).
- **Why?** This gives us professional-grade accessibility (focus management, ARIA roles, keyboard nav) while letting us freely apply the Stitch design tokens.

## 3. Iterative Page Refactoring
We will surgically implement the redesign page-by-page, matching the Stitch mockups:
1.  **Dashboard / Library View:** Update the navigation strategy (e.g., persistent sidebar), card styling, tabs, and "Empty States".
2.  **Song Chart & Notebook Editors:** Revamp the header, section blocks, and the critical **Groove Grid** interface. The Grid will receive high-contrast active states, better hit-type indications, and touch-friendly controls.
3.  **Live Mode:** Implement the high-visibility, "bulletproof" Live stage view as designed.
4.  **User Manual:** Apply the new typography and surface hierarchy for long-form reading.

## 4. Extrapolation & Consistency Check
- For features not explicitly mocked by Stitch (e.g., granular settings modals, edge-case error states, or the public sharing view), we will intelligently extrapolate the design language.
- Every component will be visually audited to ensure it feels cohesive, utilizing the shared design tokens from Step 1.

## 5. Verification
- Perform full-suite testing (Vitest, Playwright).
- Conduct a local CodeRabbit review.
- Visually verify Dark Mode and Light Mode transitions across all refactored pages.