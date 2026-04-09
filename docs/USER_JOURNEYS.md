# User Journeys

This document outlines the core user journeys currently supported by DrumCharter, as well as journeys planned for future development.

## Current User Journeys

### 1. Authentication & Onboarding

* **User Account**: A user can sign up or sign in with an email and password to securely manage their charts across devices.
* **Onboarding**: New users can access the **User Manual** directly from the app to learn about the Groove Grid and editor features.

### 2. Library Management

* **Central Dashboard**: Users can manage all their Songs, Notebooks, and Snippets from a single, three-tabbed dashboard.
* **Organize with Tags**: Users can add tags (e.g., "#rock", "#practice", "#worship") to items for easy filtering and organization.
* **Search**: Users can quickly find items by searching for titles or tags in the library.
* **Duplicate/Template**: Users can duplicate existing items to use them as templates for new charts.
* **Cleanup**: Users can delete unwanted items, with changes reflected immediately in the UI.

### 3. Groove Editing (The Core Experience)

* **Interactive Sequencing**: Users can click cells in the Groove Grid to toggle drum hits with real-time audio feedback.
* **Articulation Control**: Users can use the **Symbol Picker** (Alt + Click) to specify articulations like Rim Shots, Cross Sticks, or Cymbal Chokes.
* **Advanced Ergonomics**:
  * **Multi-select**: Drag across cells to select a range for bulk operations.
  * **Bulk Edit**: Apply symbols or clear multiple selected cells at once.
  * **Clipboard**: Copy and paste cells within or across different grids.
* **Drum-Aware Rows**: Users can customize their kit by adding or removing instrument rows, choosing from various categories (Kick, Snare, Toms, etc.) and varieties.
* **Visual Playhead**: During playback, a visual playhead syncs with the audio to help users follow the rhythm.

### 4. Song Charting

* **Structured Documents**: Users can create full song charts with metadata (BPM, Time Signature) and a structured sequence of sections (Intro, Verse, Chorus, etc.).
* **Dynamic Sections**: Users can add, reorder, or delete sections and sub-sections, each with its own measure counts (e.g., "Chorus (8M)").
* **Inline Grooves**: Users can embed specific drum patterns directly within song sections.
* **Auto-save**: The editor automatically persists changes to the cloud with a debounced saving mechanism.

### 5. Notebooks (Practice & Ideation)

* **Flexible Layout**: Users can create "scratchpad" documents without a global BPM or Time Signature, ideal for practice routines or song ideas.
* **Exercise Collections**: Users can group multiple drills or variations into a single notebook for focused practice sessions.
* **Technical Journaling**: Users can record notes and tempo goals alongside drum patterns to track their progress over time.

### 6. Groove Snippets

* **Reusable Blocks**: Users can save short (usually 1-2 measure) patterns as standalone snippets.
* **Building a Library**: Users can tag snippets by style or type (e.g., "#fill", "#linear") to build a personal repository of reusable ideas.

### 7. Performance & Live Mode

* **Stage-Optimized View**: Users can enter **Live Mode** for a high-contrast, distraction-free view optimized for tablets and stage use.
* **Hands-Free Navigation**: Users can use Bluetooth foot switches or MIDI controllers to advance through song sections or setlists.
* **Setlist Management**: Users can organize songs into setlists for seamless transitions during a performance.
* **Visual Cues**: High-visibility section markers and measure countdowns help the drummer stay on track during live play.

### 8. Sharing & Collaboration

* **Public/Private Toggle**: Users can choose to keep their charts private or make them public with a single click.
* **Public Links**: Users can share unique URLs to their public charts, allowing others to view them in a read-only mode without logging in.
* **Print-Ready Charts**: Users can print their song charts or save them as PDFs with a layout optimized for physical paper.

### 9. Offline & PWA Support

* **Installable App**: Users can install DrumCharter as a Progressive Web App (PWA) on their desktop or mobile device.
* **Offline Access**: Users can view and play back their charts even without an active internet connection.

---

## Planned User Journeys

### 1. Enhanced Audio Realism

* **Sample Matrix**: Implementation of a full `PresetVariety + Symbol` audio mapping for high-fidelity playback (e.g., different samples for Snare Rim Shot vs. Snare Ghost Note).
* **Volume Scaling**: Intelligent scaling of audio samples based on articulations (Ghost notes vs. Accents) even when specific samples are missing.

### 2. Advanced Snippet Integration

* **Reference Snippets**: The ability to "link" or "paste" existing snippets into Song Charts and Notebooks, ensuring that updates to a snippet reflect across all documents that use it.

### 3. Social & Community (Future Exploration)

* **Community Library**: A public repository where users can discover and "star" charts or snippets created by other drummers.
* **Collaborative Editing**: Real-time collaborative editing of charts for bands and teachers.

### 4. Mobile-First Optimization

* **Mobile Editing**: While viewing is supported, further refinements to the mobile editing experience for "on-the-go" sketching.
