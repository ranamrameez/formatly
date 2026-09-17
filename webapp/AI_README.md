# Web App AI Guide

## Stack

- React 19
- TypeScript
- Vite
- Oxlint

## Current State

The web client is the first browser surface. Keep browser UI, client state, and web-only adapters inside `webapp/`. Processing behavior should move behind shared interfaces as the API is implemented.

## Product Responsibilities

- Let users select documents and images in batches.
- Convert files into supported output formats.
- Compress documents and show the resulting size reduction.
- Show per-file and batch progress with retryable errors.
- Preview generated output and download individual files or the complete batch.
- Keep the experience usable with keyboard navigation and clear status messages.

## Local Commands

```powershell
npm install
npm run dev
npm run lint
npm run build
```

## AI Contribution Rules

- Follow the existing React and TypeScript structure before introducing new abstractions.
- Keep components focused and preserve the public scripts in `package.json`.
- Do not place server secrets or filesystem-only Python behavior in browser code.
- Add loading, empty, success, and error states for user-facing workflows.
- Update this file when the web architecture or commands change.

## CI Contract

The web workflow runs only when files under `webapp/` change. It installs dependencies from the lockfile when present, then runs lint and the production build.
