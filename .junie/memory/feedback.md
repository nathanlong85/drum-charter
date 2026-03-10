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

