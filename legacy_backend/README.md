# Legacy Backend (Reference Only)

This folder contains the original Python FastAPI backend for reference purposes only.

It is **not used at runtime** and is **not deployed to Vercel**.

The production application uses Next.js Route Handlers in `app/api/` instead:

- `app/api/health/route.ts`
- `app/api/evaluate/route.ts`

Deployment config files (e.g., `requirements.txt`, `.env`, test files, vector DB data) have been removed from this folder to ensure Vercel does not detect it as a deployable service. The Dockerfile is retained as reference only; it is excluded from Vercel deployment via `.vercelignore`.
