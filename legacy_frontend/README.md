# Legacy Frontend (Reference Only)

This folder contains an earlier version of the Next.js frontend for reference purposes only.

It is **not used at runtime** and is **not deployed to Vercel**.

The production application lives at the repository root and uses the current `app/` and `components/` directories.

Deployment config files (e.g., `package.json`, `package-lock.json`, `next.config.js`, `tsconfig.json`, `tailwind.config.ts`, `postcss.config.js`, `.next/`, `node_modules/`) have been removed from this folder to ensure Vercel does not detect it as a deployable service. The Dockerfile is retained as reference only; it is excluded from Vercel deployment via `.vercelignore`.
