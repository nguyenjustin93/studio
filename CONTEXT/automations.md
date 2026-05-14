# automations.md

## What It Is
B2B AI workflow automation for small businesses under the Cowork brand. Builds AI-native workflows where intelligence (not just logic routing) drives the automation. Starting vertical: real estate. Expansion path: mortgage brokers, adjacent professionals via referral network.

## Current State
- Pre-revenue, first client engaged
- One script shipped: `automations/create-intake-form.js` (Google Forms generator)
- No client subdirectories yet — structure defined, not built
- Supabase provisioned for future client data tracking

## Active Client — John (Real Estate)
- **Lead sources:** referrals + social media
- **CRM:** Follow Up Boss (FUB)
- **Volume:** 1-5 leads/week
- **Follow-up:** manual text sequences over a few days + occasional call
- **Biggest pain:** updating lead status/notes manually
- **Lost deal:** confirmed, due to slow/inconsistent follow-up
- **Tried:** Fyxer AI for email (didn't stick)
- **90-day goal:** 2 closed deals/month consistently
- **Status:** Zoom call ~May 22-23, SOP pending, no proposal sent yet

## Probable v1 Workflow (John)
1. New lead in FUB → AI drafts personalized text → sends via FUB
2. Automated follow-up sequence (day 1, 3, 7)
3. Lead replies → AI classifies intent → FUB stage updates automatically
4. Morning digest: daily briefing of hot leads, responses, follow-ups due
5. No reply after sequence → auto-tagged cold, moved to nurture

## Key Integration Points
- Follow Up Boss API (lead data, stage updates, texting)
- Claude API (intent classification, message drafting)
- Webhook receiver (catches FUB events, triggers AI layer)
- Supabase (logging, client data, future analytics)

## Repo Structure (intended)
```
automations/
├── clients/<client-name>/
│   ├── CONTEXT.md
│   ├── workflows/
│   ├── prompts/
│   └── monitoring/
├── templates/          ← reusable across clients
└── create-intake-form.js
```

## Priorities (in order)
1. Receive and analyze John's SOP (Notion: Clients/John)
2. Build visual workflow concept + morning digest mockup for Zoom call
3. Zoom call ~May 22-23 — validate workflow concept against live observation
4. Scope and build v1 workflow post-call
5. Deploy to John, monitor, iterate
6. Capture testimonial and case study at 30-day mark
7. First referral conversation from John's network

## Revenue Model
- Phase 1 (months 1-3): Custom builds — setup fee $1,500-3,000 + $200-500/month maintenance
- Phase 2 (month 4+): Productized templates — $99-299/month flat
- First client (John): discounted or testimonial exchange
- Target: $2,000-3,000 MRR by end of month 4

## Timeline
- Month 1 (by June 13): John's v1 workflow deployed, first invoice or testimonial
- Month 2 (by July 13): John stable, testimonial captured, one referral in pipeline
- Month 3 (by August 13): Second client delivered, templates extracted
- Month 4 (by September 13): 2-3 paying clients, $2,000-3,000 MRR

## Constraints
- Never propose before observing real workflow
- Never build without written scope agreement
- Always quantify pain (volume, time, deals) before pricing
- Reuse 70%+ of prior client build in each new build — document what's reusable in `templates/`

## Open Decisions
- Value-based vs subscription pricing model
- How deep to niche within real estate (buyers agents only, or all agents)
- When to bring in support help vs Claude Code handling builds
- Starter productized tier from day 1 vs service-only initially
