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
