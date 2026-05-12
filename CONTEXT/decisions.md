# Decisions Log

Why we built it this way. Append-only — never delete entries, only add.

## 2026-05-12 — Monorepo structure under studio/

Decision: Consolidate racker/, automations/, and landing/ under a single `studio/` workspace instead of separate repos.

Why: Solo founder, parallel tracks, shared tooling and context. Easier to keep Claude Code productive across all three.

## 2026-05-12 — MCP server stack

Decision: filesystem + context7 + github + notion + supabase.

Why: Covers local ops, live docs, repo operations, contextual workspace, and database. Skipped Slack (not used). Chose Notion over Linear for flexibility beyond issue tracking.

## 2026-05-12 — Contextual + self-learning framework

Decision: Add CONTEXT/, TASKS/, REFLECTIONS/ folders at repo root.

Why: Justin wants Claude Code to operate more autonomously and improve over time. Static context + reflection layer addresses both.
