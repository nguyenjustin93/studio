# Conventions

Coding patterns, naming rules, and structural conventions used across studio.

## Tool Selection

For any task, use the right Claude tool:

- **Thinking, planning, deciding** → Claude Chat
- **File operations, knowledge work, communications** → Claude Cowork
- **Code, terminal, git** → Claude Code

See `CONTEXT/tools-and-workflow.md` for detailed rules.

## General

- Direct, no-fluff communication style mirrors how Justin writes
- Prefer clarity over cleverness
- Comments explain *why*, not *what*

## File structure

- Each top-level project (`racker/`, `automations/`, `landing/`) is self-contained
- Each project has its own `CLAUDE.md` with project-specific context
- Shared context lives in `/CONTEXT/` at the repo root

## TypeScript / React Native (Racker)

- Functional components only
- AsyncStorage for local persistence
- TypeScript strict mode
- Screen-level files in `screens/`, reusable in `components/`

## Automations

- Each client gets a subdirectory: `automations/clients/<client-name>/`
- Client subdirectories contain their own `CONTEXT.md` with client-specific info
- Reusable workflow templates live in `automations/templates/`

## Naming

- Files: kebab-case for scripts, PascalCase for React components
- Functions: camelCase
- Constants: UPPER_SNAKE_CASE

## Git

- Commit messages: imperative mood, present tense ("Add intake form generator" not "Added")
- Small, focused commits
