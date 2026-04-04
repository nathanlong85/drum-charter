# Onboard — examples

Extra input patterns and reply shapes for the agent. For full workflow, see [SKILL.md](SKILL.md).

## User input patterns (when to apply)

| User says                                         | Input type           | Action                                               |
| ------------------------------------------------- | -------------------- | ---------------------------------------------------- |
| `/onboard #123`                                   | Single issue/PR      | Fetch #123. If it has linked items, fetch those too. |
| `/onboard #123 Focus on AC`                       | Issue + instructions | Fetch #123, emphasize AC in analysis.                |
| `/onboard #123 #124`                              | Multiple items       | Fetch both.                                          |
| `/onboard doc/handover.md`                        | Path                 | Read file at that path.                              |
| User pastes handover and says "onboard with this" | Pasted               | Use pasted text as context.                          |

## Reply shape (required elements)

Every reply after loading content must include, in this order:

1. One sentence: what you read (e.g. "I've read Issue #123 and linked PR #125.").
2. **Summary:** 2–4 sentences.
3. **Questions / concerns:** bullets or "No concerns."
4. One sentence: ready when they are.
5. One sentence: you will not start until they say to start.

Do not run implementation or edit tools in the same turn as this reply.
