# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Workspace Structure

This is a monorepo-style workspace containing independent projects:

| Directory | Description |
|-----------|-------------|
| `racker/` | Golf Practice OS — React Native Expo app (active, production-ready) |
| `automations/` | Automation scripts and workflows (in development) |
| `landing/` | Landing page(s) (in development) |

Each project is self-contained with its own `package.json`, dependencies, and CLAUDE.md where applicable.

## Per-Project Guidance

- **racker**: See `racker/CLAUDE.md` for full architecture, commands, and conventions.
- **automations**: No CLAUDE.md yet — explore directory for context.
- **landing**: No CLAUDE.md yet — explore directory for context.

## Working in This Repo

- Always `cd` into the relevant subdirectory before running commands — there is no root-level build or package manager.
- Projects do not share dependencies or configuration.
