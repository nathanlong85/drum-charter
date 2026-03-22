## 🏗️ PROJECT STRUCTURE & STANDARDS

### Project State

- **Primary Source of Truth**: `docs/PROJECT_PLAN.md` must be read at the start of every session and updated as needed to keep the plan current and fresh.
- **Development Workflow**: Refer to `docs/DEV_WORKFLOW.md` for branching, testing, and feedback loop.
- **Secret Management**: Refer to `docs/SECRETS_MANAGEMENT.md` (Gemini is forbidden from reading `.env.private`).

### Engineering Excellence

- **DRY & Modular**: Write clean, reusable code; avoid duplication.
- **Type Safety**: Prioritize TypeScript; ensure end-to-end type safety from DB to UI.
- **Performance**: Mindful of bundle sizes, re-renders, and DB query efficiency.
- **Documentation**: Maintain high-quality TSDoc, READMEs, CHANGELOGs as part of the process.

### Local Development Environment

- **Local-First Dev**: Always use the local Supabase Docker instance (`http://localhost:54321`) for development and testing.
- **Frontend Server**: Next.js runs on port `3001` (to avoid conflicts with other local services).
- **Database Schema**: Synchronized via managed migrations in `supabase/migrations/`.

### Technical Stack & Patterns

- **Next.js 16 (App Router)**: Follow patterns for Server Components and Server Actions.
- **Supabase**: Use `@supabase/ssr` and maintain strict RLS policies.
- **Tailwind CSS 4**: Use utility-first styling with CSS variables.
- **Testing**: Vitest for unit/integration, Playwright for E2E.
