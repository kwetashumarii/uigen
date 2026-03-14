# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run setup        # Install deps + generate Prisma client + run migrations (first-time setup)
npm run dev          # Dev server at http://localhost:3000 (Turbopack)
npm run dev:daemon   # Dev server in background, logs to logs.txt
npm run build        # Production build
npm run lint         # ESLint
npm run test         # Vitest test suite
npm run db:reset     # Reset Prisma database
```

Run a single test file: `npx vitest run src/lib/__tests__/file-system.test.ts`

**Note:** All npm scripts include `NODE_OPTIONS='--require ./node-compat.cjs'` to fix Node.js 25+ Web Storage SSR compatibility by removing non-functional localStorage/sessionStorage globals during SSR.

## Environment

Create `.env` with `ANTHROPIC_API_KEY=your_key`. If omitted, the app falls back to a mock provider that returns placeholder responses.

## Architecture

UIGen is a Next.js 15 App Router app where users describe React components in natural language, Claude generates them with tool use, and they render live in an iframe preview.

**Core data flow:**
1. User message → `/api/chat` (POST, streaming) → Claude with `str_replace_editor` + `file_manager` tools
2. Claude calls tools to create/edit files in the virtual file system
3. Virtual FS state updates → `PreviewFrame` (iframe) transforms JSX via Babel standalone + resolves imports via esm.sh CDN
4. For authenticated users, project state (messages + FS) serializes to JSON and persists via Prisma/SQLite

**Key architectural pieces:**

- **Virtual file system** (`src/lib/file-system.ts`): In-memory only, no disk writes. Serializable to/from JSON for persistence.
- **AI tools** (`src/lib/tools/`): `str_replace_editor` handles view/create/str_replace on virtual files; `file_manager` handles rename/delete.
- **Preview** (`src/components/preview/PreviewFrame.tsx`): iframe with Babel JSX transform + dynamic import maps pointing to esm.sh. Components render client-side.
- **State** (`src/lib/contexts/`): `FileSystemProvider` holds virtual FS; `ChatProvider` wraps Vercel AI SDK's `useChat`.
- **Auth**: JWT sessions via `jose` in httpOnly cookies. Middleware at `src/middleware.ts` protects project routes.

**Path alias:** `@/*` → `src/*`

**Database:** SQLite via Prisma. Schema has `User` and `Project` (messages + FS data stored as JSON strings). Prisma client is generated to `src/generated/prisma` (not the default `node_modules/.prisma/client`), so imports use `@/generated/prisma` instead of `@prisma/client`.

**Testing:** Vitest with jsdom. Tests live in `__tests__` folders alongside source files.

**UI components:** Shadcn (New York style) in `src/components/ui/`, configured via `components.json`.

**Styling:** Tailwind CSS v4 (note: v4 has breaking changes from v3, including new configuration format and PostCSS plugin usage).
