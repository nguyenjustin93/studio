# tools-and-workflow.md

Defines which Claude tool handles what work in Studio. Read this when uncertain which tool to use for a task.

## Three Tools, Three Lanes

### Claude Chat
- **Purpose:** Strategy, thinking, planning, complex reasoning
- **Where:** claude.ai or Claude desktop app (Chat mode)
- **Use for:** Weekly strategy sessions, decision-making, brainstorming, drafting documents that need iteration
- **Don't use for:** File execution, code execution, repetitive workflows

### Claude Cowork
- **Purpose:** Autonomous desktop knowledge work
- **Where:** Claude desktop app (Cowork mode)
- **Use for:** Updating CONTEXT/ files, managing Notion, analyzing client docs, drafting communications, calendar management, file organization
- **Don't use for:** Writing application code, terminal commands, git operations
- **Active connectors:** Google Calendar, Google Drive, Chrome, Filesystem

### Claude Code
- **Purpose:** Autonomous coding and repo execution
- **Where:** Terminal (`claude` command from studio/)
- **Use for:** Building Racker features, building automation workflows, tests, git operations, tasks from TASKS/active.md
- **Don't use for:** Non-code documentation updates, files outside the repo
- **Active MCP servers:** Filesystem, Context7, GitHub, Notion, Supabase

## Decision Rules

When deciding which tool to use, ask in order:

1. **Am I still thinking, not executing?** → Claude Chat
2. **Does it require writing code or terminal access?** → Claude Code
3. **Does it require working across files and apps without code?** → Claude Cowork

## Common Workflows

### Updating context files after a meaningful change
- **Old way:** Claude Code via terminal
- **New way:** Cowork — "Update CONTEXT/automations.md with [change]. Commit and push."

### Drafting client communication
- **Step 1 (Chat):** Talk through strategy and tone
- **Step 2 (Cowork):** "Draft this email based on [strategy]. Save to Gmail drafts."

### Building a Racker feature
- Stays in Claude Code — code execution requires terminal access

### Weekly context sync
- **Step 1 (Chat):** Strategy conversation about what changed
- **Step 2 (Cowork):** Read CONTEXT/, update what's stale, commit, push, update Notion

### Reading and analyzing a client SOP
- Cowork — it can read the document, cross-reference other files, and draft synthesis

## Mistakes to Avoid

1. Defaulting to Claude Code for everything because it was first
2. Switching between tools mid-task (pick one and finish)
3. Asking Cowork or Code to "think about" something — that's Chat's job

## Update This File When

- A new Claude tool launches that changes the lanes
- New MCP servers or connectors get added
- A workflow proves itself across multiple weeks and deserves to be documented
