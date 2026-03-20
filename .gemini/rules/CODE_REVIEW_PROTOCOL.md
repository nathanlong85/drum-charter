## Code Review Protocol

### 1. CodeRabbit Review Protocol
- **Feedback Review Loop**:
  - CodeRabbit is our primary feedback mechanism for this project.
  - Do not automatically trigger feedback loops. Only trigger when explicitly asked.
  - Do not automatically check for remote CodeRabbit feedback. Only check when explicitly asked.
  - Unless otherwise specified, always trigger a local CodeRabbit review loop when asked (see below) as they are more reliable and don't require polling for feedback comments.
- **Disagreement & Flagging Protocol**: Proactively flag a CodeRabbit suggestion for final decision if it:
  - Conflicts with the project's specific architectural goals/standards.
  - Contradicts previously established user preference or known requirement.
  - Introduces unnecessary complexity or "code smells."

#### 1.1 Local CodeRabbit Feedback Review Loop
- **Local Review Loop**: Always use the `code-review` agent skill (running `cr review --prompt-only --base main`) locally to perform the review loops.
- **Code Quality**: Always lint and ensure all related tests pass before kicking off the next run in the review loop.
- **Structured Feedback Review**: Treat the PR review as a three-run state machine. **During these runs, you do NOT need to stop and ask for approval for individual steps (pushing, committing, editing, or starting the next run) unless the loop itself is finished or a critical conflict arises.**
  1. **Run 1 (Initial)**: Address ALL unresolved comments regardless of severity. If there is no feedback, terminate the review loop.
  2. **Run 2**: Address ONLY `Critical` and `Major` severity comments. If there is no `Critical` or `Major` feedback, terminate the review loop.
  3. **Run 3 (Final)**: Address ONLY `Critical` and `Major` severity comments. If there is no `Critical` or `Major` feedback, terminate the review loop.
  4. **Post-Termination**: Once the loop has been terminated, the review cycle is complete. Push the final verified state and notify the user.

#### 1.2 Remote CodeRabbit Feedback Review Loop
- **Asynchronous Feedback**: Once a Pull Request is opened or a push is made to an existing PR, CodeRabbit will automatically scan the code.
- **Manual Check**: Only check for remote CodeRabbit feedback when explicitly asked (e.g., "Check CodeRabbit," "Is the review done?").
- **Review Status Check**:
  - If CodeRabbit is still performing a review (PR status is "Pending" or "In Progress"), notify the user and **do nothing else**. Wait for the next instruction to check again.
  - If the review is complete, proceed with the structured feedback review.
