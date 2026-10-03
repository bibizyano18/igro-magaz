<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Commands

- `npm run dev` — dev server
- `npm run build` / `npm start` — production build / serve
- `npm run lint` — ESLint (flat config, `eslint.config.mjs`)
- No `typecheck` script — run `npx tsc --noEmit` for type checking
- No test framework — do not assume `npm test` exists

## Architecture

- Next.js 16 App Router; all routes live under `app/`
- Path alias `@/*` maps to repo root (`./*`), not `src/`
- `app/ui/` holds shared components; `FeatureCard` is a **named** export
- Styling: plain CSS classes in `app/globals.css` (e.g. `.container`, `.title`, `.section`). Tailwind v4 is installed but components do **not** use Tailwind utility classes — follow the existing plain-CSS convention
- All user-facing copy is in Russian — maintain this for new content
- `next-env.d.ts` and `.next/types/` are generated — never edit manually
