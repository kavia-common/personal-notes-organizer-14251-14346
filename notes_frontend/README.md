# Ocean Notes (Qwik) ⚡️

A modern, ocean-themed notes application built with Qwik + QwikCity.
Create, view, edit, and organize your personal notes with a clean UI.

- Qwik Docs: https://qwik.dev/
- Vite: https://vitejs.dev/

## Quick Start

1) Install dependencies
   npm install

2) Configure backend API
   - Copy .env.example to .env and set PUBLIC_NOTES_API_BASE to your backend API base.
   - Example: PUBLIC_NOTES_API_BASE=/api

3) Run in dev (SSR)
   npm start

4) Build and Preview
   npm run build
   npm run preview

## Features

- Sidebar navigation and top navigation bar
- Notes list and editor with smooth transitions
- CRUD integration via HTTP API (prepared)
- Ocean Professional theme (blue primary, amber accents)
- Future-ready auth interface placeholders

## Project Structure

- src/components: TopBar, Sidebar, NoteList, NoteEditor
- src/lib/api.ts: HTTP API utilities (PUBLIC_INTERFACE)
- src/lib/auth.ts: Auth placeholders (PUBLIC_INTERFACE)
- src/routes/index.tsx: Main app shell and UI orchestration
- src/global.css: Theme variables and UI styles

## Environment

Create .env (see .env.example):

PUBLIC_NOTES_API_BASE=/api

The orchestrator will ensure environment variables are provided in deployment environments.

## Notes

- Auth is currently a placeholder. Replace src/lib/auth.ts with your provider integration.
- All public interfaces are documented and tagged with PUBLIC_INTERFACE.
