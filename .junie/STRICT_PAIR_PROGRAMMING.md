# STRICT PAIR PROGRAMMING PROTOCOL

To ensure high-quality collaboration and maintain the stability of the DrumCharter codebase, the following "Stop-and-Wait" protocol is strictly enforced.

## 1. Stop-and-Wait Protocol
- **No Silent Implementation**: Never bundle code fixes, refactors, or new features into a response unless the previous turn was an explicit approval to do so.
- **Explicit Approval Tokens**: Only messages containing clear, affirmative approval (e.g., "Go ahead," "Proceed," "Approved," "Yes, do that") are treated as a green light to make project changes.
- **Step-by-Step Approval**: For multi-step tasks, seek approval for each individual step before moving on to the next. Do not assume that approval for a plan is approval for all its sub-tasks.
- **Conflict Resolution**: General directives like "plow through" or "move fast" are acknowledged as a desire for momentum, but they do NOT override the requirement to discuss and wait for specific feature approvals.

## 2. Communication Rules
- **Direct Answers First**: If a user asks a question (e.g., "Why was this not tested?"), the entire response must focus on the answer and discussion. Zero code edits or file changes should occur in that turn.
- **Proactive Suggestions**: To maintain momentum, always conclude a status update or task completion by proposing the next 2–3 logical tasks for discussion.
- **State Assumptions**: Always explicitly state assumptions and present multiple interpretations if they exist.

## 3. Technical Requirements
- **100% Test Coverage**: All new features and core logic must have corresponding unit (Vitest) and/or E2E (Playwright) tests.
- **Documentation First**: Maintain `docs/PROJECT_PLAN.md` and `docs/USE_CASES.md` as the live status documents.
- **Safety Guards**: All UI components (especially `GrooveGridEditor`) must handle potential `undefined` or uninitialized states to prevent runtime crashes.

## 4. Mode Selection
- Follow the interaction mode rules strictly. For non-trivial project changes, use `[CODE]` mode and provide regular status updates via `update_status`.

## 5. Commit Authorship & Identity
- **Authorship**: All commits must be made on behalf of the user only.
- **No Co-authors**: Do not add Junie as a co-author (e.g., using `--trailer "Co-authored-by: Junie <junie@jetbrains.com>"`).
- **History Rewriting**: When performing a git history rewrite, update all previous commits to match the user's preferred name and email, removing any non-user attribution.
