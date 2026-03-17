# DrumCharter: Use Cases & Examples

This document serves as a repository for the specific workflows and scenarios that drive the development of DrumCharter. These examples help define the data models and UI requirements.

## 1. Notebooks: Practice Routines & Drills
Notebooks are freeform collections of exercises and drills that don't fit the rigid structure of a Song Chart (no global BPM or Time Signature required).

### Use Case: Kick Speed Building
- **Scenario**: A drum teacher provides a specific set of exercises to improve kick speed.
- **Workflow**: Create a Notebook titled "Kick Speed Development." Add sections for "Single Stroke Burnouts," "Double Stroke Control," and "Heel-Up Endurance." Each section contains an inline Groove Grid with the specific pattern and bullet-point notes for tempo goals.
- **Why Not a Song?**: There is no set Title, BPM, or Time Signature for the whole document. Each exercise might be practiced at varying tempos.

### Use Case: Technical Skill Journal
- **Scenario**: Slowly collecting a set of exercises to practice a certain skill (e.g., "Linear Fills") over time.
- **Workflow**: A drummer keeps a "Linear Fills Notepad" that they add to whenever they discover or invent a new fill. This notebook is rotated into their practice session on specific days.

## 2. Notebooks: Songwriting & Idea Holding
A "scratchpad" for brainstorming before a song is fully formed.

### Use Case: Drum Part Brainstorming
- **Scenario**: Working on ideas for an existing song (e.g., a worship song) or a new original.
- **Workflow**: Create a Notebook for the song title. Use sections to sketch out "Verse 1 Groove Idea," "Bridge Build-up," and "Chorus Fill."
- **Benefit**: Keeps the "Song Library" focused on finished, performance-ready charts while providing a place for experimental work.

### Use Case: Ear Training / Transcription
- **Scenario**: Hearing a cool drum part on the radio and wanting to quickly jot it down from memory.
- **Workflow**: Open a Notebook and create a quick Groove Grid to capture the rhythm before it's forgotten.

### Use Case: Master List of Rudiments
- **Scenario**: A student wants to have a single place where they can find all 40 PAS rudiments with notation.
- **Workflow**: Create a Notebook titled "Snare Rudiments." Each rudiment is a section with a grid showing the sticking and notes for common pitfalls.
- **Organization**: Sections can be renamed to "Roll Rudiments," "Diddle Rudiments," etc.

## 3. Groove Snippets: Reusable Building Blocks
Single-measure patterns that can be tagged and searched.

### Use Case: Fill Repository
- **Scenario**: Collecting useful drum fills to use across multiple songs or routines.
- **Workflow**: Save individual fills as Snippets with tags like `#linear`, `#triplet`, or `#rock`.
- **Integration**: Eventually, these snippets can be "pasted" or referenced inside Song Charts and Notebooks.

## 4. Song Charts: Performance-Ready Documents
Structured documents for full songs with specific metadata.

### Use Case: Setlist Preparation
- **Scenario**: Preparing a chart for a specific performance.
- **Workflow**: Create a Song Chart with BPM, Time Signature, and a full sequence of sections (Intro, Verse, Chorus, etc.). This chart is optimized for printing and use on a tablet during a gig.

## 5. Guest Access: Low-Friction Entry
Allowing users to try the app and save data without an upfront commitment.

### Use Case: Instant Trial
- **Scenario**: A drummer finds the app and wants to quickly sketch a groove they just thought of.
- **Workflow**: Clicks "Continue as Guest" on the login page. Immediately redirected to the home page with full access to the Library and Notebook Editor. They create a "Morning Idea" notebook and save it.
- **Persistence**: The data is saved to Supabase under an anonymous user ID. If the drummer returns on the same browser, their "Morning Idea" is still there.
