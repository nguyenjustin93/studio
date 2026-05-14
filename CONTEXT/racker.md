# racker.md

## What It Is
React Native + Expo habit/session tracking app. Users plan a session (Pre), execute block-by-block with a timer (Active), reflect (Post), review history (History). Initial positioning: Golf Practice OS. Long-term: generalizable deliberate practice tool.

## Current State
- 4 screens functional: Pre → Active → Post → History
- Stack: React Native, Expo SDK 55, TypeScript strict, AsyncStorage
- No backend yet — local-only persistence
- Dev preview on Netlify, target App Store production
- Source: `studio/racker/`

## Active Task
Session recovery — add `getActiveSession()` check on `PreSessionScreen` mount with "Resume?" prompt. See `TASKS/active.md`.

## Priorities (in order)
1. Fix high-priority bugs (session recovery, advanceBlock race, timer reset, silent AsyncStorage failures)
2. App Store readiness (`app.json`, `eas.json`, crash reporting via Sentry)
3. Supabase Auth + user identity layer
4. Cloud sync (offline-first, sync queue)
5. Premium tier (stats screen, habit tracking, RevenueCat/Stripe)

## Key Files
- `racker/CLAUDE.md` — full architecture and conventions
- `racker/src/screens/` — all 4 screens
- `racker/src/storage/sessions.ts` — AsyncStorage operations
- `racker/src/types.ts` — shared types (needs userId, synced flag added before Supabase)
- `racker/app.json` — needs bundleIdentifier, versionCode, privacyPolicyUrl

## Revenue Model
- Free tier: local-only session tracking
- Premium tier: $4.99/month — cloud sync, stats, habit tracking
- RevenueCat for subscription management, Stripe for web payments

## Timeline
- Month 1 (by June 13): Bug fixes, App Store config, Sentry, TestFlight build
- Month 2 (by July 13): Supabase Auth, cloud sync, premium infrastructure
- Month 3 (by August 13): Habit tracking, App Store submission, public launch
- Month 4 (by September 13): Real users, premium revenue, iteration

## Constraints
- iOS and Android parity required
- TypeScript strict must pass (`tsc --noEmit`) before any PR
- Accessibility labels required on all interactive elements
- Never break existing local-only user data during Supabase migration

## Open Decisions
- Golf-specific vs general deliberate practice positioning
- Analytics stack: Firebase Analytics vs Amplitude vs PostHog vs Supabase-native
- Annual pricing option for premium tier
- AI coaching insights — month 5-6 or later
