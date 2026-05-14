# Completed

Log of shipped work. Append entries with date and brief note.

## 2026-05-14

- **Session recovery** — Added `useEffect` to `PreSessionScreen.tsx` that calls `getActiveSession()` on mount. If a crashed/backgrounded session is found, shows an inline "Resume Session?" card (template + block progress) with Resume/Discard actions. Clears active session on discard; navigates directly to ActiveSession on resume. TypeScript strict passes.

## 2026-05-12

- Studio monorepo set up and pushed to GitHub
- Claude Code installed and authenticated
- Root CLAUDE.md written
- Racker CLAUDE.md auto-generated
- Real estate client intake form created via Google Forms API
- MCP servers wired up: filesystem, context7, github, notion, supabase
- Contextual + self-learning framework scaffolded
