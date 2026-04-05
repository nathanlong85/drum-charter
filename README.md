# 🥁 DrumCharter

**Live App**: [https://drumcharter.vercel.app](https://drumcharter.vercel.app)

DrumCharter is a web application tailored for drummers to create, manage, and share drum charts, practice exercises, and groove snippets. It aims to replace cumbersome word processor templates with a streamlined, interactive tool.

## 🚀 Features

- **Interactive Groove Grid**: A visual, editable grid for drum patterns with context-aware symbol pickers.
- **Song Charts**: Structured documents with headers, dynamic sections, and inline grooves.
- **Practice Notebooks**: Flexible layouts for practice routines, sketches, and songwriting ideas.
- **High-Quality Output**: Optimized for printing physical drum charts and PDF generation.
- **Offline Support**: A robust Progressive Web App (PWA) that works without an internet connection.
- **Cloud Persistence**: Automatic syncing with Supabase for cross-device access.

---

## 📖 Documentation

Everything you need to know about the project structure, development, and administration.

| Document                                               | Description                                                                                |
| :----------------------------------------------------- | :----------------------------------------------------------------------------------------- |
| **[Admin & Dev Guide](docs/ADMIN_GUIDE.md)**           | **Start here.** Overview of the tech stack, how to run tests, and manage the local server. |
| **[Project Plan](docs/PROJECT_PLAN.md)**               | Current roadmap, V1/V2 features, and the live status of all tasks.                         |
| **[UI Workflows](docs/UI_WORKFLOWS.md)**               | Visual guide to the app's components and user flows.                                       |
| **[Development Workflow](docs/DEV_WORKFLOW.md)**       | Branching strategies, PR protocols, and local-first development rules.                     |
| **[Secrets Management](docs/SECRETS_MANAGEMENT.md)**   | Security protocols for handling API keys and environment variables.                        |
| **[Grid Specification](docs/DRUM_AWARE_GRID_SPEC.md)** | Technical breakdown of the drum-aware data model and playback engine.                      |

---

## 🛠️ Quick Start

1. **Clone the repo**
2. **Install dependencies**: `pnpm install`
3. **Start Supabase**: `npx supabase start` (Requires Docker)
4. **Run Dev Server**: `pnpm dev`
5. **Visit**: [http://localhost:3001](http://localhost:3001)

---

## 🤝 Contributing

This project uses a **strict pair programming protocol** with an AI agent. If you are an AI agent working on this repository, please read **[GEMINI.md](GEMINI.md)** first.

---

_Built with Next.js, Supabase, Tailwind CSS, and 🥁._
