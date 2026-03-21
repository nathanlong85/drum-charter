# DrumCharter Admin & Developer Guide

This guide is designed for developers and administrators who are new to the DrumCharter tech stack. It covers the core components, how to manage the development environment, and common maintenance tasks.

---

## 🏗️ The Tech Stack

| Component | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend Framework** | [Next.js 16](https://nextjs.org/) | Handles routing, server-side rendering, and UI components using React 19. |
| **Backend / DB** | [Supabase](https://supabase.com/) | Provides Authentication, PostgreSQL database, and Storage. We use a local Docker-based version for development. |
| **Styling** | [Tailwind CSS 4](https://tailwindcss.com/) | A utility-first CSS framework for rapid UI styling. |
| **Linting/Formatting** | [Biome](https://biomejs.dev/) | A fast, all-in-one tool for checking code quality and keeping formatting consistent. |
| **Unit Testing** | [Vitest](https://vitest.dev/) | Fast unit testing framework compatible with Vite. Used for testing logic and individual components. |
| **E2E Testing** | [Playwright](https://playwright.dev/) | "End-to-End" testing. It opens a real browser and clicks through the app like a user to ensure everything works together. |
| **PWA Support** | [Serwist](https://serwist.js.org/) | Makes the app "Progressive," allowing it to be installed on devices and work offline. |

---

## 🛠️ Development Operations

### 1. Starting the Local Backend (Supabase)
Before you can run the app, you need the backend services running.
- **Start**: `npx supabase start` (Requires Docker to be running).
- **Stop**: `npx supabase stop`
- **Check Status**: `npx supabase status`
- **Reset Database**: `npx supabase db reset` (Warning: This wipes all local data and re-runs migrations/seeds).

### 2. Running the Development Server
This is where you'll spend most of your time. It features "Hot Module Replacement," meaning the app updates instantly as you save files.
- **Command**: `pnpm dev`
- **Access**: [http://localhost:3001](http://localhost:3001)
- **Note**: We use port `3001` to avoid conflicts with Supabase services.

### 3. Running Linters (Code Quality)
Linters catch typos and enforce style rules.
- **Code Linting**: `pnpm lint`
- **Markdown Linting**: `pnpm lint:md`
- **Auto-Fix**: `pnpm lint:fix` (Attempts to fix formatting and simple errors automatically).

### 4. Running Unit Tests (Vitest)
Unit tests check small, isolated pieces of logic.
- **Run Once**: `pnpm test`
- **Watch Mode**: `npx vitest` (Re-runs tests as you change code).
- **UI Mode**: `pnpm test:ui` (Opens a nice browser dashboard for tests).

### 5. Running E2E Tests (Playwright)
E2E tests verify full user journeys (Login -> Create Song -> Save).
- **Run All**: `pnpm test:e2e`
- **Show Report**: `npx playwright show-report`
- **Debug Mode**: `npx playwright test --debug` (Opens a browser you can step through).

---

## 🚀 Production Management

Since the production environment is TBD, here is the general workflow for any Node.js environment (Vercel, AWS, Fly.io, etc.):

1. **Build**: `pnpm build`
   - This compiles the TypeScript/Next.js code into optimized JavaScript and CSS.
2. **Start**: `pnpm start`
   - This runs the compiled app. In production, you would typically use a process manager like **PM2** or a Docker container to keep this running.
3. **Environment Variables**:
   - Production requires specific variables (DB URLs, API Keys) usually stored in a `.env.production` file or the hosting provider's dashboard. Refer to `docs/SECRETS_MANAGEMENT.md`.

---

## 🧹 Maintenance & Troubleshooting

### Common Maintenance Tasks
- **Dependency Updates**: `pnpm update`
- **Database Migrations**: When the schema changes, new files appear in `supabase/migrations/`. Run `npx supabase db push` to apply them to a remote database.
- **Generating Types**: If you change the database schema, run:
  `npx supabase gen types typescript --local > lib/supabase/database.types.ts`

### Troubleshooting
- **"Port 3001 already in use"**: Run `lsof -i :3001` then `kill -9 <PID>` to clear it.
- **Supabase won't start**: Ensure Docker Desktop is running and healthy.
- **Styling isn't updating**: Tailwind 4 uses a JIT (Just-In-Time) engine. Sometimes restarting the `pnpm dev` server fixes caching issues.
- **Playwright Fails in CI**: Ensure the Supabase local instance has enough time to start (often handled by the `ci.yml` script).
