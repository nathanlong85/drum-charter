# DrumCharter Project Guidelines & Collaborative Protocols

## 📊 MESS-UP TALLY (PROTOCOL VIOLATIONS)
- **🔴 PROTOCOL #1 (Answer-First Rule)**: 5
- **🔴 PROTOCOL #2 (Stop-and-Wait)**: 12
- **🔴 PROTOCOL #3 (Drop and Listen)**: 3
- **🔴 PROTOCOL #2.1 (No "Silent Implementation")**: 4
- **🔴 Commit Identity Rule Violation**: 2
- **🔴 Protocol #2 (Stop-and-Wait) - Unauthorized Test Run**: 2
- **🔴 Definition of Done Violation (Unverified E2E)**: 2
- **🔴 Breaking CI (Invalid Action SHA/Version)**: 2
- **🔴 Missing Build Dependency (esbuild-wasm)**: 1
*(Note: Only show this section in responses when the tally changes.)*

## 🛑 THE HARD BRAKE: REVERSING THE MESS-UP TREND
These rules are mandatory to prevent further protocol violations and restore project stability.

1. **Strict De-bundling**: Never include a technical plan, a file update, or a test run in a response to a general question or a protocol-related discussion. Answer the question directly, stop, and wait for explicit approval.
2. **Sequential Instruction Processing**: If the user gives a multi-part instruction (e.g., "Do X, then do Y"), treat "then" as a hard dependency. Perform X, report completion, and wait for approval before starting Y.
3. **Local-First Verification, Zero-Crap Pushes**: Never push to the remote repository unless `pnpm lint`, `pnpm lint:md`, and the specific test file being worked on are all green. Commits are for progress protection; pushes are for verified work.
4. **Literal Stop-and-Wait**: "Waiting" is a complete halt of all project modifications. Do not update plans or metadata files in the background while waiting for a response.

## 🔴 STRICT PAIR PROGRAMMING PROTOCOL
These rules are the **Highest Priority** and must be strictly followed at all times. They take precedence over all other technical or project goals.

### 1. Direct Answers First (The "Answer-First" Rule)
- Every response must begin with a direct, concise answer to the user's question.
- **No "plan-packing"**: Do not bundle new technical plans or implementations into a response to a question.
- If an explanation is needed, give the explanation first, then ask if the user wants to see a plan to fix it.

### 2. Stop-and-Wait Protocol
- **Explicit Approval Required**: Never make any file or project changes unless the user has provided a clear, affirmative approval (e.g., "Go ahead," "Proceed," "Approved," "Yes, do that").
- **Step-by-Step Approval**: For multi-step tasks, seek approval for each individual step before moving on to the next.
- **No "Silent Implementation"**: Do not update project plans, changelogs, or metadata files in the background without explicit approval.

### 3. Drop and Listen
- When the user asks a question or flags a concern, immediately halt all other activity.
- The user's question is the single highest priority at that moment.
- Do not provide overwhelming context or unrelated technical updates when the user is focused on a specific issue.

### 4. CodeRabbit Review Protocol
- **Asynchronous Feedback**: Once a Pull Request is opened or a push is made to an existing PR, CodeRabbit will automatically scan the code.
- **Manual Check**: Only check for CodeRabbit feedback when explicitly asked (e.g., "Check CodeRabbit," "Is the review done?").
- **Review Status Check**:
    - If CodeRabbit is still performing a review (PR status is "Pending" or "In Progress"), notify the user and **do nothing else**. Wait for the next instruction to check again.
    - If the review is complete, proceed with the structured feedback review.
- **Structured Feedback Review**: Treat the PR review as a three-loop state machine:
    1. **Loop 1 (Initial)**: Address ALL unresolved comments regardless of severity.
    2. **Loop 2**: Address ONLY `Critical` and `Major` severity comments.
    3. **Loop 3 (Final)**: Address ONLY `Critical` and `Major` severity comments.
    4. **Termination**: If Loop 3 contains zero `Critical` or `Major` comments, the review cycle is complete.
- **Disagreement & Flagging Protocol**: Proactively flag a CodeRabbit suggestion for final decision if it:
    - Conflicts with project's specific architectural goals/standards.
    - Contradicts previously established user preference or known requirement.
    - Introduces unnecessary complexity or "code smells."
- **No "Stale" Implementation**: Before starting any new work in a feature branch, MUST check the PR for any pending CodeRabbit or human feedback and address it first.

### 5. Technical Discipline
- **Commit & Push Discipline**: Commit locally as often as needed to protect progress. Only push to remote when the code is stable (passing all tests and linting) or when significant progress warrants remote protection.
- **Definition of Done**: Before presenting any task as complete, **all tests must be passing** and **all linting must come back clean**.
- **100% Test Coverage**: All new features and core logic must have corresponding unit (Vitest) and/or E2E (Playwright) tests. MUST evaluate the need for both E2E and unit tests for every single change.
- **Local-First Dev**: Always use the local Supabase Docker instance (`http://localhost:54321`) for development and testing.
- **Commit Identity**: All commits must be made exclusively on behalf of `Nathan Long <nathanlong85@gmail.com>`. No co-author trailers.
- **PR Merging**: Merging a PR into `main` is a human-only task. I will never merge a PR myself.

---

## 📂 GITHUB COMPONENT ACCESS PROTOCOL
Accessing GitHub data must follow these specific primary and secondary methods.

### 📦 Pull Requests & Issues
- **Primary**: `mcp_GitHub_pull_request_read` and `mcp_GitHub_issue_read`.
- **Secondary**: `gh pr view` and `gh issue view`.
- **Comments**: Access via `mcp_GitHub_pull_request_read(method="get_comments")` or `gh pr view --comments`.

### 🧪 GitHub Actions & Logs
- **Primary**: Use the `gh` CLI.
- **Logs**: `gh run view <RUN_ID> --log` for completed runs. For in-progress runs, poll until completion (20s delay).
- **Status**: `gh run list --branch <BRANCH>` or `gh run view <RUN_ID>`.

### 📊 Projects (V2)
- **Primary**: Use GraphQL via `gh api graphql`.
- **Capabilities**: Can list project items, update fields, and move items across columns. Must use `ProjectV2` queries.

### 🛠️ General Repository Access
- **Files**: Use `mcp_GitHub_get_file_contents` or `git show <BRANCH>:<PATH>`.
- **Commits**: Use `mcp_GitHub_list_commits` or `git log`.

---

## 🛠️ CLI & TERMINAL OPERATIONS
- **Source of Truth**: Always check `.junie/CLI_REFERENCE.md` before running ANY non-trivial CLI command.
- **Verification First**: If a command is not in the reference, research official docs first, then add the verified command to the reference BEFORE executing it.
- **Dry Run**: For high-risk commands (migrations, history rewrites), print the command and wait for explicit approval on that exact string.
- **Timeout Management**: ALWAYS use explicit high timeout (300-3600s) for slow commands (CodeRabbit, Playwright, full suites).
- **Suppress Noise**: Proactively suppress redundant environment warnings (e.g., unset `NO_COLOR`).

---

## 🏗️ PROJECT STRUCTURE & STANDARDS

### Project State
- **Primary Source of Truth**: `docs/PROJECT_PLAN.md` must be read at the start of every session.
- **Development Workflow**: Refer to `docs/DEV_WORKFLOW.md` for branching, testing, and feedback loop.
- **Secret Management**: Refer to `docs/SECRETS_MANAGEMENT.md` (Junie is forbidden from reading `.env.private`).

### Engineering Excellence
- **DRY & Modular**: Write clean, reusable code; avoid duplication.
- **Type Safety**: Prioritize TypeScript; ensure end-to-end type safety from DB to UI.
- **Performance**: Mindful of bundle sizes, re-renders, and DB query efficiency.
- **Documentation**: Maintain high-quality KDoc, READMEs, CHANGELOGs as part of the process.

### Technical Stack & Patterns
- **Next.js 16 (App Router)**: Follow patterns for Server Components and Server Actions.
- **Supabase**: Use `@supabase/ssr` and maintain strict RLS policies.
- **Tailwind CSS 4**: Use utility-first styling with CSS variables.
- **Testing**: Vitest for unit/integration, Playwright for E2E.
