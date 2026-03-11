[2026-03-10 14:59] - Updated by Junie
{
    "TYPE": "correction",
    "CATEGORY": "Grid metadata rules",
    "EXPECTATION": "Grids must include drum symbols and timeSignature; name and tags only apply when the grid is saved as a reusable Groove Snippet. Support multiple measures and selectable beat resolutions (quarter, eighth, sixteenth; default sixteenth). Also proceed with testing setup including Playwright.",
    "NEW INSTRUCTION": "WHEN defining grid JSON THEN include drum symbols and timeSignature; omit name/tags unless GrooveSnippet"
}

[2026-03-10 15:10] - Updated by Junie
{
    "TYPE": "correction",
    "CATEGORY": "Grid metadata rules",
    "EXPECTATION": "Grid JSON must include drum symbols and timeSignature; omit name/tags unless it's a reusable Groove Snippet. Grids must support multiple measures and selectable beat resolutions (quarter, eighth, sixteenth; default sixteenth). Proceed with testing setup including Playwright.",
    "NEW INSTRUCTION": "WHEN defining grid JSON THEN include drum symbols and timeSignature; omit name/tags unless GrooveSnippet"
}

[2026-03-10 15:32] - Updated by Junie
{
    "TYPE": "correction",
    "CATEGORY": "Doc access acknowledgement",
    "EXPECTATION": "Directly answer whether the linked documents were opened, and explain access limitations if not.",
    "NEW INSTRUCTION": "WHEN asked about reviewing user-provided documents THEN state explicitly if opened; if not, explain limitation and request upload"
}

[2026-03-10 15:34] - Updated by Junie
{
    "TYPE": "correction",
    "CATEGORY": "Doc access acknowledgement",
    "EXPECTATION": "Give a direct yes/no on whether the four linked documents were opened; if not, immediately explain the access limitation and request an upload or shareable link.",
    "NEW INSTRUCTION": "WHEN asked if user-provided docs were opened THEN answer yes/no; if no, explain limitation and request upload"
}

[2026-03-10 16:21] - Updated by Junie
{
    "TYPE": "positive",
    "CATEGORY": "Plan approval",
    "EXPECTATION": "The Supabase-based backend plan and explanation matched what the user wanted, and they are ready to proceed.",
    "NEW INSTRUCTION": "WHEN user affirms a proposed plan (e.g., 'Perfect') THEN proceed to next actionable step without re-asking"
}

[2026-03-10 16:22] - Updated by Junie
{
    "TYPE": "positive",
    "CATEGORY": "Auth setup approval",
    "EXPECTATION": "The user approved the database schema and wants Supabase Auth set up now.",
    "NEW INSTRUCTION": "WHEN user approves schema and requests auth THEN proceed with Supabase Auth setup steps"
}

[2026-03-10 16:42] - Updated by Junie
{
    "TYPE": "correction",
    "CATEGORY": "Cost transparency",
    "EXPECTATION": "The user expected explicit disclosure that Supabase is a hosted service with ongoing costs.",
    "NEW INSTRUCTION": "WHEN recommending external services THEN state hosting model, pricing, free tier, and self-hosting option"
}

[2026-03-10 17:06] - Updated by Junie
{
    "TYPE": "correction",
    "CATEGORY": "Apology expectation",
    "EXPECTATION": "The user wanted a clear, direct apology before any explanation when an oversight happened.",
    "NEW INSTRUCTION": "WHEN acknowledging a mistake or omission THEN give a direct apology first"
}

[2026-03-10 17:20] - Updated by Junie
{
    "TYPE": "correction",
    "CATEGORY": "Supabase setup and Next.js proxy",
    "EXPECTATION": "Use the official Supabase-provided Next.js auth/session files and follow Next.js 16 'proxy' convention instead of deprecated 'middleware'. Ensure env vars are wired correctly to avoid client creation errors.",
    "NEW INSTRUCTION": "WHEN integrating Supabase with Next.js 16 THEN use Supabase SSR examples and Next.js proxy"
}

[2026-03-11 00:37] - Updated by Junie
{
    "TYPE": "positive",
    "CATEGORY": "Approval and docs reminder",
    "EXPECTATION": "The plan matches what the user wanted and they appreciate that their informal input was correctly understood; they also expect project docs to be updated as work progresses.",
    "NEW INSTRUCTION": "WHEN implementing approved work or plans THEN update docs/PROJECT_PLAN.md with changes"
}

[2026-03-11 00:38] - Updated by Junie
{
    "TYPE": "positive",
    "CATEGORY": "Approval and docs update",
    "EXPECTATION": "The user is happy with the plan and appreciates that their informal input was correctly interpreted; they want project docs kept up to date.",
    "NEW INSTRUCTION": "WHEN proceeding with approved work THEN update docs/PROJECT_PLAN.md with changes"
}

[2026-03-11 00:51] - Updated by Junie
{
    "TYPE": "preference",
    "CATEGORY": "Data reset timing",
    "EXPECTATION": "They want the option to wipe test data later near a stable release, not during the baseline schema setup.",
    "NEW INSTRUCTION": "WHEN running baseline schema migrations THEN do not delete data; keep reset separate"
}

[2026-03-11 12:00] - Updated by Junie
{
    "TYPE": "preference",
    "CATEGORY": "Docs maintenance",
    "EXPECTATION": "Keep USE_CASES.md and PROJECT_PLAN.md updated continuously as the single sources of project state.",
    "NEW INSTRUCTION": "WHEN completing work or updating scope THEN update USE_CASES.md and PROJECT_PLAN.md immediately"
}

[2026-03-11 12:02] - Updated by Junie
{
    "TYPE": "positive",
    "CATEGORY": "Plan approval",
    "EXPECTATION": "They approved the Notebook Editor UI plan and want us to proceed without re-asking, keeping docs updated.",
    "NEW INSTRUCTION": "WHEN user replies 'Perfect' to a plan THEN proceed to next step and update docs"
}

[2026-03-11 12:07] - Updated by Junie
{
    "TYPE": "correction",
    "CATEGORY": "Auth access/onboarding",
    "EXPECTATION": "They want an immediate way to view the Library or progress—either clear sign-up steps or temporary access (guest/demo credentials) without prior account setup.",
    "NEW INSTRUCTION": "WHEN library is auth-protected THEN provide signup steps and temporary demo access options"
}

[2026-03-11 12:08] - Updated by Junie
{
    "TYPE": "positive",
    "CATEGORY": "Plan approval",
    "EXPECTATION": "Proceed with implementing Supabase Anonymous sign-in and a 'Continue as Guest' option to access the Library without credentials.",
    "NEW INSTRUCTION": "WHEN user gives brief affirmation to a plan THEN proceed to next steps and update docs"
}

[2026-03-11 12:10] - Updated by Junie
{
    "TYPE": "correction",
    "CATEGORY": "Landing page UX",
    "EXPECTATION": "The home page should be a proper landing page with clear value props and CTAs, not a sample song chart.",
    "NEW INSTRUCTION": "WHEN implementing the home route (/) THEN show a real landing with CTA and guest access"
}

[2026-03-11 12:15] - Updated by Junie
{
    "TYPE": "positive",
    "CATEGORY": "Plan approval",
    "EXPECTATION": "They approved the proposed next 2–3 features and want us to proceed without re-asking, keeping docs updated.",
    "NEW INSTRUCTION": "WHEN user replies 'Perfect' to a plan THEN proceed to next steps and update docs"
}

[2026-03-11 12:23] - Updated by Junie
{
    "TYPE": "correction",
    "CATEGORY": "Tests required, runtime error",
    "EXPECTATION": "They expect tests for all generated code and no crashes; the GrooveGridEditor should handle undefined or uninitialized state.",
    "NEW INSTRUCTION": "WHEN submitting new code THEN include unit/integration tests covering initialization and edge cases"
}

[2026-03-11 12:24] - Updated by Junie
{
    "TYPE": "correction",
    "CATEGORY": "Tests and runtime error",
    "EXPECTATION": "All new code must include tests, and GrooveGridEditor must handle undefined or uninitialized state to avoid crashes.",
    "NEW INSTRUCTION": "WHEN destructuring component state THEN guard against undefined and use safe defaults"
}

[2026-03-11 12:25] - Updated by Junie
{
    "TYPE": "correction",
    "CATEGORY": "Tests and runtime error",
    "EXPECTATION": "All new code must include tests, and GrooveGridEditor must handle undefined or uninitialized state to avoid crashes.",
    "NEW INSTRUCTION": "WHEN component state may be undefined THEN use safe defaults and add tests"
}

[2026-03-11 12:33] - Updated by Junie
{
    "TYPE": "correction",
    "CATEGORY": "Missing SVG asset",
    "EXPECTATION": "Drum symbol SVGs must resolve without 404s; the grid editor’s context menu should only reference existing icons (e.g., hi_hat_loose_opt.svg) in the correct path.",
    "NEW INSTRUCTION": "WHEN referencing drum symbol SVGs THEN verify files exist in /public/icons/drum-symbols with exact filenames"
}

[2026-03-11 13:21] - Updated by Junie
{
    "TYPE": "positive",
    "CATEGORY": "Next steps approval",
    "EXPECTATION": "They’re happy with progress and want immediate proposals for the next features to implement, moving quickly.",
    "NEW INSTRUCTION": "WHEN user says 'Nice' and asks what's next THEN propose 2–3 actionable next features and proceed updating docs"
}

[2026-03-11 13:24] - Updated by Junie
{
    "TYPE": "preference",
    "CATEGORY": "Proactive prompting",
    "EXPECTATION": "The assistant should proactively check what's next and prompt the user to proceed without being asked.",
    "NEW INSTRUCTION": "WHEN completing a task or status update THEN consult docs, propose next 2–3 tasks, prompt proceed"
}

[2026-03-11 13:30] - Updated by Junie
{
    "TYPE": "correction",
    "CATEGORY": "Create flow error",
    "EXPECTATION": "Creating a new item should succeed; on failure, show detailed error info instead of {}. The landing page should not have duplicate 'My Library' links.",
    "NEW INSTRUCTION": "WHEN catching errors in UI actions THEN log error.message and Supabase error details"
}

[2026-03-11 13:35] - Updated by Junie
{
    "TYPE": "correction",
    "CATEGORY": "Missing create-flow tests",
    "EXPECTATION": "They expected automated tests for the 'create new item' flow as a core feature, covering success, failure, error display, and redirect behavior.",
    "NEW INSTRUCTION": "WHEN implementing create/new item flows THEN add unit and E2E tests for success, failure, and redirect"
}

[2026-03-11 13:37] - Updated by Junie
{
    "TYPE": "correction",
    "CATEGORY": "Missing create-flow tests",
    "EXPECTATION": "They expected automated tests for the 'create new item' flow and a direct answer explaining why they were absent.",
    "NEW INSTRUCTION": "WHEN asked why required tests are missing THEN apologize, state cause, and commit fix with ETA"
}

[2026-03-11 13:45] - Updated by Junie
{
    "TYPE": "correction",
    "CATEGORY": "Quality vs speed expectation",
    "EXPECTATION": "Do not use the user's phrasing to justify shortcuts; maintain full quality and thoroughness (including tests) even when moving fast.",
    "NEW INSTRUCTION": "WHEN user mentions moving fast or plowing through THEN reaffirm quality, include tests, and avoid defensive phrasing"
}

[2026-03-11 13:45] - Updated by Junie
{
    "TYPE": "correction",
    "CATEGORY": "Quality vs speed phrasing",
    "EXPECTATION": "Do not use the user's 'plow through features' phrasing to justify shortcuts; maintain full quality and thoroughness, including tests.",
    "NEW INSTRUCTION": "WHEN user mentions speed or 'plow through features' THEN reaffirm full quality and tests; avoid defensive tone or justifications"
}

[2026-03-11 13:48] - Updated by Junie
{
    "TYPE": "correction",
    "CATEGORY": "Approval gating",
    "EXPECTATION": "They want direct answers to questions and no implementation work started unless they explicitly approve.",
    "NEW INSTRUCTION": "WHEN user asks a question or no explicit approval is given THEN answer directly and await explicit approval before implementing changes"
}

[2026-03-11 13:50] - Updated by Junie
{
    "TYPE": "correction",
    "CATEGORY": "Speed vs quality; proactive next steps",
    "EXPECTATION": "Keep momentum by proactively proposing next tasks, while maintaining full quality and completeness.",
    "NEW INSTRUCTION": "WHEN completing a task or status update THEN propose 2–3 next tasks immediately"
}

[2026-03-11 13:51] - Updated by Junie
{
    "TYPE": "positive",
    "CATEGORY": "Plan approval",
    "EXPECTATION": "The user approved the proposed next steps and wants work to begin immediately without re-asking.",
    "NEW INSTRUCTION": "WHEN user says 'please proceed' after a plan THEN start next actionable step and update docs"
}

[2026-03-11 14:13] - Updated by Junie
{
    "TYPE": "positive",
    "CATEGORY": "Plan approval",
    "EXPECTATION": "They approved the proposed plan and want us to proceed immediately without re-asking, keeping docs updated.",
    "NEW INSTRUCTION": "WHEN user approves a proposed plan THEN proceed to next steps and update docs"
}

[2026-03-11 14:14] - Updated by Junie
{
    "TYPE": "positive",
    "CATEGORY": "Plan approval",
    "EXPECTATION": "The user approved the proposed next steps and wants immediate execution without re-asking.",
    "NEW INSTRUCTION": "WHEN user gives brief approval (e.g., 'Please proceed') THEN start next actionable step and update docs"
}

[2026-03-11 14:48] - Updated by Junie
{
    "TYPE": "positive",
    "CATEGORY": "Next steps prompt",
    "EXPECTATION": "After acknowledging progress, they want proactive proposals for the next 2–3 actionable tasks.",
    "NEW INSTRUCTION": "WHEN user asks what's next THEN propose 2–3 actionable next tasks and await approval"
}

[2026-03-11 14:57] - Updated by Junie
{
    "TYPE": "preference",
    "CATEGORY": "Sequencing/approval gating",
    "EXPECTATION": "They want a direct response about when to do a Supabase schema pull and project formalization before starting on features 1 and 2.",
    "NEW INSTRUCTION": "WHEN user requests a response before starting features THEN answer the question first and await confirmation"
}

[2026-03-11 15:00] - Updated by Junie
{
    "TYPE": "preference",
    "CATEGORY": "Sequencing flexibility",
    "EXPECTATION": "Cross-cutting tasks (docs, tests, infra, cleanup) shouldn’t be tied only to the next three features; start them whenever it makes sense.",
    "NEW INSTRUCTION": "WHEN proposing timing for docs, tests, infra, or cleanup tasks THEN propose starting immediately if beneficial; do not tie to next features"
}

[2026-03-11 15:02] - Updated by Junie
{
    "TYPE": "preference",
    "CATEGORY": "Sequencing flexibility",
    "EXPECTATION": "Cross-cutting tasks (docs, tests, infra, cleanup) should start whenever beneficial, not only during the next 2–3 features.",
    "NEW INSTRUCTION": "WHEN planning or scheduling cross-cutting work THEN start immediately if beneficial; do not tie to next features"
}

[2026-03-11 15:29] - Updated by Junie
{
    "TYPE": "preference",
    "CATEGORY": "Secret management approach",
    "EXPECTATION": "They want a more robust long-term method for managing secrets than the current approach.",
    "NEW INSTRUCTION": "WHEN introducing or updating environment secrets THEN propose a long-term secret management solution and avoid committing secrets"
}

[2026-03-11 15:34] - Updated by Junie
{
    "TYPE": "positive",
    "CATEGORY": "Approval gating",
    "EXPECTATION": "They appreciated that we waited for explicit approval before proceeding, and now they want us to continue without re-asking.",
    "NEW INSTRUCTION": "WHEN user says 'go ahead' or gives approval THEN proceed to next actionable step and update docs"
}

[2026-03-11 15:38] - Updated by Junie
{
    "TYPE": "positive",
    "CATEGORY": "Approval gating praise",
    "EXPECTATION": "They appreciated that we waited for explicit approval before proceeding and now want us to continue.",
    "NEW INSTRUCTION": "WHEN user says 'go ahead' or gives approval THEN proceed to next actionable step and update docs"
}

[2026-03-11 15:41] - Updated by Junie
{
    "TYPE": "correction",
    "CATEGORY": "Bug triage focus",
    "EXPECTATION": "Pause proposing next features and focus on diagnosing the notebooks table issue with concrete steps the user can take.",
    "NEW INSTRUCTION": "WHEN user flags a blocking issue THEN stop feature plans and request logs, errors, and schema details"
}

[2026-03-11 15:43] - Updated by Junie
{
    "TYPE": "correction",
    "CATEGORY": "Bug triage focus",
    "EXPECTATION": "Pause feature planning and provide concrete diagnostic steps to investigate the notebooks table issue, asking for specific logs, errors, and schema details.",
    "NEW INSTRUCTION": "WHEN user flags a blocking issue THEN stop feature plans and request logs, errors, and schema details"
}

[2026-03-11 15:44] - Updated by Junie
{
    "TYPE": "correction",
    "CATEGORY": "Bug triage focus",
    "EXPECTATION": "Pause feature planning and provide concrete diagnostic steps for the notebooks table issue, requesting specific logs, errors, and schema details.",
    "NEW INSTRUCTION": "WHEN user flags a notebooks table issue THEN provide step-by-step diagnostics and request logs, errors, and schema details"
}

[2026-03-11 16:00] - Updated by Junie
{
    "TYPE": "correction",
    "CATEGORY": "Missing notebooks table",
    "EXPECTATION": "They expected a 'notebooks' table to exist in Supabase after our claimed implementation, but it is absent.",
    "NEW INSTRUCTION": "WHEN a feature depends on a DB table THEN add migration and confirm table exists in Supabase"
}

[2026-03-11 16:22] - Updated by Junie
{
    "TYPE": "preference",
    "CATEGORY": "Commit authorship",
    "EXPECTATION": "Commits should be pushed on behalf of the user only, without assistant attribution; apply to rewritten commits and be added to guidelines.",
    "NEW INSTRUCTION": "WHEN creating, amending, or rewriting git commits THEN attribute commits solely to the user; do not add co-authors"
}

