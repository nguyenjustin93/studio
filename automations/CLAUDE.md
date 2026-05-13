# automations/CLAUDE.md

## Purpose

B2B AI workflow automation client work. Build lightweight, high-leverage automations for small businesses — replacing manual repetitive tasks with AI-powered pipelines.

## Structure

```
automations/
  clients/<client-name>/   # one directory per client
    CONTEXT.md             # client background, goals, agreed scope
    *.js / *.ts            # client-specific scripts
  templates/               # reusable scripts and building blocks
```

## Current Clients

**Real estate (cousin)**
- Status: intake form sent and completed, Zoom call in ~10 days
- Probable v1 workflow: Follow Up Boss leads → AI text classification → morning digest email
- Stack: Follow Up Boss API, Claude API, Google APIs (Gmail/Sheets)

## Stack

- **Runtime**: Node.js
- **AI**: Claude API
- **Google**: Gmail, Sheets, Forms via Google APIs
- **Database**: Supabase (if persistence needed)
- **CRM**: Follow Up Boss API

## Status

Pre-revenue. First client engaged. No retainer or contract signed yet — scoping happens on the Zoom call.
