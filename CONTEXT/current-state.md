# Current State

What exists right now. Update this as things ship.

Last updated: 2026-05-14

## Operating model

- Three-tool model adopted: Claude Chat (strategy), Claude Cowork (knowledge work), Claude Code (coding/git)
- Wispr Flow integrated into daily workflow for voice-driven brain dumps to Chat
- Cowork handles context file updates, Notion management, calendar, and client comms
- See `CONTEXT/tools-and-workflow.md` for decision rules

## Studio infrastructure

- Monorepo live at github.com/nguyenjustin93/studio
- Claude Code v2.1.138 operational
- MCP servers connected: filesystem, context7, github, notion, supabase, Google Calendar, Google Drive
- Contextual framework (this folder) initialized and scaffolded
- Session workflow wired into CLAUDE.md (start/end ritual, reflection log)
- Self-learning discipline documented in CLAUDE.md

## Racker

- 4 screens: Pre → Active → Post → History
- Stack: React Native, Expo, TypeScript, Supabase (replaced Firebase 2026-05-12)
- Status: Stable, dev preview on Netlify, production target App Store
- Backend: Supabase wired in — replaces Firebase across the stack
- Backlog populated in Notion

## Automations

- First client engaged (real estate, family member)
- Intake form sent and completed (`automations/create-intake-form.js` built and run)
- Zoom call scheduled ~10 days out
- Probable v1 workflow: Follow Up Boss + AI text classification + morning digest
- Status: pre-revenue, active

## Landing

- Directory exists, no content yet
