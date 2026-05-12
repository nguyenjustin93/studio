# Architecture

How studio fits together at a high level.

## Top-level projects

- **racker/** — React Native habit tracker app. Built with Expo, TypeScript, AsyncStorage. Target: App Store production.
- **automations/** — B2B AI workflow automation client work. Each client has their own subdirectory.
- **landing/** — Marketing/landing pages for studio.

## Shared infrastructure

- Claude Code with MCP servers: filesystem, context7, github, notion, supabase
- Supabase project: `studio` — central database for Racker premium features and automation client data
- GitHub: `github.com/nguyenjustin93/studio` (monorepo)

## Data flow (planned)

- Racker → Supabase (premium tier user stats)
- Automations clients → Supabase (lead tracking, payments, workflow state)
- Notion → Source of truth for client SOPs and meeting notes
