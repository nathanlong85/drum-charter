# Next-Browser Usage Guide

`@vercel/next-browser` is an experimental CLI tool designed for AI agents to inspect, debug, and interact with running Next.js applications. It translates visual browser data into structured text that agents can parse.

## Installation

The recommended way to use `next-browser` is by adding it as an agent skill:

```bash
npx skills add vercel-labs/next-browser
```

Once added, you can typically invoke it within your agent's chat using `/next-browser`.

### Manual Installation (Alternative)

For manual scripting or standalone use:

```bash
# Install the CLI globally (or as a dev dependency)
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
