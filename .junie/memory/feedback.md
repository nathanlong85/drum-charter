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

