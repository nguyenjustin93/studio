# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Who I Am

- **Name**: Justin Nguyen
- **Location**: Centreville, VA
- **Role**: Solo founder + night-shift IT helpdesk
- **Age**: 28

## What This Studio Is

A unified development environment for building and shipping AI-powered products. 
Primary focus is B2B AI workflow automation for small businesses. 
Racker is the first shipped product; automations and landing pages are next.

## How I Work

- Systems thinker, milestone-based execution
- Direct, no-fluff communication — skip preamble, get to the point
- Use discomfort and urgency as forcing functions
- AI pair programming is the primary build method

## Stack

- **Automation**: Cowork, Claude API
- **Apps**: React Native, Expo, Supabase, RevenueCat, Stripe
- **AI**: Claude Code, Claude.ai, Cursor

## Workspace Structure

This is a monorepo-style workspace containing independent projects:

| Directory | Description |
|-----------|-------------|
| `racker/` | Golf Practice OS — React Native Expo app (active, production-ready) |
| `automations/` | Client automation workflows (active — first client engaged) |
| `landing/` | Landing page(s) (not started — empty directory) |

Each project is self-contained with its own `package.json`, dependencies, and CLAUDE.md where applicable.

## Per-Project Guidance

- **racker**: See `racker/CLAUDE.md` for full architecture, commands, and conventions.
- **automations**: See `automations/CLAUDE.md` for purpose, structure, and current client work.
- **landing**: No CLAUDE.md yet — empty directory, not started.

## Working in This Repo

- Always `cd` into the relevant subdirectory before running commands — there is no root-level build or package manager.
- Projects do not share dependencies or configuration.

## Session Workflow

### At session start

Before beginning any task, read the following files to establish context:

1. `CONTEXT/current-state.md` — what exists right now
2. `CONTEXT/conventions.md` — coding patterns and rules to follow
3. `CONTEXT/decisions.md` — past decisions and why they were made
4. `REFLECTIONS/patterns.md` — patterns that have worked
5. `REFLECTIONS/antipatterns.md` — patterns to avoid
6. `TASKS/active.md` — what's in progress
7. `TASKS/backlog.md` — what's next if active is empty

If working in a specific subdirectory (racker/, automations/, landing/), also read that directory's `CLAUDE.md` for project-specific context.

### During work

- Follow the conventions in `CONTEXT/conventions.md` unless explicitly instructed otherwise
- If a decision is made that affects architecture or future work, append it to `CONTEXT/decisions.md` with the date
- If the current state changes meaningfully (new feature shipped, new infrastructure added), update `CONTEXT/current-state.md`

### At session end

When the user signals the session is wrapping up (e.g. "good session", "let's stop here", "wrap it up"), perform a reflection:

1. Create a new file in `REFLECTIONS/session-notes/` named `YYYY-MM-DD.md` (or append to it if it already exists for today)
2. Write a brief reflection covering:
   - What was worked on this session
   - What approach was taken
   - What worked well
   - What was difficult or failed
   - Any generalizable patterns worth noting
3. If a pattern truly proved itself (worked across multiple sessions or is clearly worth preserving), add it to `REFLECTIONS/patterns.md`
4. If something failed badly enough to warrant avoidance, add it to `REFLECTIONS/antipatterns.md`
5. Move any completed work from `TASKS/active.md` to `TASKS/completed.md` with today's date
6. Commit the reflection and task updates with a message like `Session reflection YYYY-MM-DD`

## Self-Learning Discipline

The reflection layer only works if it's actually maintained. Be honest in reflections — note what didn't work, not just what did. Patterns added to `REFLECTIONS/patterns.md` should be rare and proven, not speculative. Quality over quantity.
