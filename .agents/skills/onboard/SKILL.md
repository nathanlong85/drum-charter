---
name: onboard
description: Apply when the user invokes /onboard or says they want to get up to speed or onboard the agent before starting. Input is exactly one of: (1) one or more GitHub issue/PR numbers (e.g., #123), (2) a file path to a handover/plan doc, or (3) pasted handover/plan content. Execute the workflow below. Do not run implementation or edit code until the user explicitly says to start.
---

# /onboard

**Constraint:** Do not run implementation, edit files, or execute code-changing tools until the user explicitly instructs you to start. Only read, analyze, and reply until then.

## 1. Parse the user message

Extract two things:

**A. Primary input (exactly one):**

- **GitHub Issues/PRs**: One or more GitHub-style issue/PR numbers (e.g. `#123`, `#123 #124`). Numbers may be comma- or space-separated or in a URL. Treat these as the requested issue(s)/PR(s) to load.
- **Path**: A file path (e.g. `doc/handover.md`, `projects/foo/handover.md`). Path may be in backticks or plain.
- **Pasted**: A substantial block of pasted text (handover, plan, or issue content). Use it as the sole context.

**B. Inline instructions (optional):**

Any additional sentence or phrase in the message that is not the number(s), path, or pasted block counts as **inline instructions**. Examples: "Focus on the acceptance criteria only", "Ignore the linked PR." Apply these instructions during the workflow.

If primary input is ambiguous or missing, reply: "Please provide exactly one: GitHub issue/PR number(s), a file path to a handover/plan, or paste the content."

## 2. Load content

### If input is GitHub Issue/PR numbers

1. **Resolve the set of items to fetch.**
   - If the user gave **exactly one** number: fetch that issue/PR. Check for **linked** issues or PRs mentioned in the description. If found and relevant, fetch those as well for context.
   - If the user gave **multiple** numbers: fetch all of them.
   - If inline instructions say not to look for or include linked items, only fetch the number(s) provided.

2. **Fetch.** Use `gh issue view <NUMBER>` or `gh pr view <NUMBER>`. If tools are unavailable, ask the user to paste the relevant content.

### If input is path

Read the file at that path (relative to repo root or absolute). If missing or unreadable, say so and ask for a valid path or pasted content.

### If input is pasted

Treat the pasted block as the sole source of context. Do not ask for more unless the content is empty.

## 3. Analyze

Using only the loaded content (and any inline instructions that affect scope), produce an internal pass over:

- Ambiguities or underspecified behavior
- Missing acceptance criteria or success conditions
- Design or architecture concerns
- Edge cases, error handling, or failure modes
- Inconsistencies or conflicts within the material

Do not skip this step. If nothing stands out, say "No concerns" in the next step; otherwise list them.

## 4. Reply structure

Output a single reply that includes all of the following, in order:

1. **Acknowledgment**: One sentence that you have read the provided context (name the source: issue/PR number(s), path, or "pasted content").
2. **Summary**: 2–4 sentences: goals, current state, and what comes next.
3. **Questions or concerns**: If there are any questions, unclear points, or design/risk/edge-case concerns, present them in an easy-to-answer way:
   - **If this environment has a questions UI** (e.g. `ask_user`): use it to pose each question so the user can answer via the UI.
   - **Otherwise**: list them as **numbered items** (1., 2., 3., …) and add one short line inviting the user to answer by number (e.g. "You can reply by number: 1: …, 2: …").
     If there are none, say "No concerns."
4. **Readiness**: One sentence that you understand and are ready to work when the user is ready.
5. **Explicit wait**: One sentence stating that you will not start implementation or edit any files until the user explicitly says to start.

Do not run any tool that modifies the codebase or runs builds/tests after sending this reply. Wait for the user's next message.

## 5. On the next user message

- If the user says to start (e.g. "go", "start", "let's go", "you can begin", "proceed"): you may now run implementation and edit tools.
- If the user answers questions or corrects something: in one short reply, update your understanding, restate readiness, and repeat that you are waiting for them to say to start. Do not begin implementation.
- If the user asks for clarification: answer. Do not begin implementation unless they also say to start.

## Examples of user input

- `/onboard #123` → Fetch issue #123; if it links to a PR, fetch that too.
- `/onboard #123 #124` → Fetch both.
- `/onboard doc/handover.md` → Read that file.
- User pastes handover text and says "onboard with this" → Use pasted text as context.

## Example reply shape

```
I've read [Issue #123 / the pasted content / doc/handover.md].

**Summary:** [2–4 sentences: goals, state, next steps.]

**Questions / concerns:**
1. [Question or concern 1]
2. [Question or concern 2]
You can reply by number (e.g. 1: …, 2: …).
(or: No concerns.)

I'm ready to work when you are. I won't start implementation or edit any files until you explicitly say to start.
```
