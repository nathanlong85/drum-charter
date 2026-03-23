# Next-Browser Usage Guide

**⚠️ EXPERIMENTAL: This tool is currently in an early experimental phase. APIs are unstable and subject to breaking changes. Requires Node.js >= 20.**

`@vercel/next-browser` is a CLI tool designed for AI agents to inspect, debug, and interact with running Next.js applications. It translates visual browser data into structured text that agents can parse.

## Installation

### As an Agent Skill (Recommended)

To add `next-browser` capabilities to your agent, use the `skills` CLI:

```bash
npx skills add vercel-labs/agent-browser
```

Once added, you can typically invoke it within your agent's chat using `/agent-browser`.

### Global NPM Package (Standalone)

For manual scripting or standalone use without an agent:

```bash
# Install the CLI globally
pnpm add -g @vercel/next-browser

# Install the required browser engine
npx playwright install chromium
```

*Requires Node.js >= 20.*

## Common Commands

| Command | Description |
| :--- | :--- |
| `next-browser open <url>` | Launches the browser daemon and navigates to the URL. |
| `next-browser tree` | Returns the React component tree as structured text. |
| `next-browser tree <id>` | Inspects a specific component's props, hooks, and state. |
| `next-browser snapshot` | Returns an accessibility-tree-like snapshot of the page. |
| `next-browser click <ref>` | Clicks an element identified by a reference ID from a snapshot. |
| `next-browser ppr unlock` | Analyzes the current PPR shell to find what is blocking prerendering. |
| `next-browser errors` | Lists current build or runtime errors. |
| `next-browser perf <url>` | Profiles Core Web Vitals and React hydration timing. |

## Why use it?

- **React Inspection:** View component trees and state without a GUI.
- **PPR Debugging:** Quickly find dynamic holes blocking Partial Prerendering.
- **Headless Debugging:** See what's happening in the browser from your terminal-based agent.
