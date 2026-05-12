# Active Tasks

What Claude Code is working on this session. Keep short — typically 1-3 items.

## In Progress

- **Session recovery not wired up** — Add `useEffect` to `PreSessionScreen.tsx` that calls `getActiveSession()` on mount. If an active session exists, show a "Resume Session?" prompt so users don't lose data after a crash. (`PreSessionScreen.tsx:35-59`, `storage/sessions.ts`)
