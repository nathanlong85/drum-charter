# 🚀 Deployment Roadmap: DrumCharter

This document outlines the strategy for moving DrumCharter from a local-only development environment to a production-ready cloud infrastructure using **Vercel** and **Supabase**, staying entirely within their **Free Tiers**.

---

## 🏗️ Phase 1: Infrastructure Provisioning

### 1. Supabase Cloud (Backend & DB)

* **Goal**: Create a managed production database that mirrors your local setup.
* **Steps**:
  1. Sign up at [supabase.com](https://supabase.com) using your GitHub account.
  2. Create a new project named `drum-charter-prod`.
  3. **Database Migrations**: Use the Supabase CLI to push your local migrations to the new project:

     ```bash
     supabase link --project-ref <your-project-id>
     supabase db push
     ```

  4. **Edge Functions & Storage**: If any local assets (like drum samples) need to be in Supabase Storage, create a public bucket named `audio-samples`.

### 2. Vercel (Frontend & Hosting)

* **Goal**: Deploy the Next.js 16 application with automatic CI/CD and staging previews.
* **Steps**:
  1. Sign up at [vercel.com](https://vercel.com) and import the `nathanlong85/drum-charter` repository.
  2. **Framework Preset**: Select `Next.js`.
  3. **Build Settings**:
     * Build Command: `pnpm build`
     * Install Command: `pnpm install`
  4. **Environment Variables**: Populate the project settings with the keys from Phase 2.

---

## 🔑 Phase 2: Environment Variables

You will need to configure these in your Vercel Project Settings for both **Production** and **Preview** (Staging) environments.

| Variable Name | Source | Description |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase Settings | API URL for your cloud project |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY` | Supabase Settings | The `anon` / `public` key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Settings | **SECRET**: Used only for admin/server-side tasks |

---

## 🔄 Phase 3: The Staging Workflow (Vercel Previews)

Vercel provides a built-in staging environment for free:
1. **Production**: Every push to `main` updates the production site.
2. **Staging**: Every Pull Request (PR) or push to a feature branch generates a unique "Preview URL" (e.g., `drumcharter-git-feature-xyz.vercel.app`).
3. **Validation**: You can test your full PWA and offline features on these preview URLs before merging to `main`.

---

## ✅ Phase 4: Production Checklist

* [x] **Verify Migrations**: Ensure `supabase db push` completed without errors.
* [x] **SSL/HTTPS**: Vercel handles this automatically, which is required for our PWA features.
* [x] **Service Worker**: Ensure `next-pwa` (or Serwist) is correctly building in production mode.
* [x] **Database Types**: Run `pnpm supabase:gen-types` to ensure types match the cloud schema.
* [x] **Initial Deployment**: Successfully promoted `staging` to `main`.
