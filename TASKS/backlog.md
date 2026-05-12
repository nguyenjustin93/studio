# Backlog

Prioritized list of upcoming work. Top item is next.

## High Priority

#### Bugs / Issues

- **Session recovery not wired up** — `PreSessionScreen.tsx` has no `useEffect` checking `getActiveSession()` on mount. A crash during a 70-minute session loses all data silently. Fix: check for active session on mount, show "Resume?" prompt. (`PreSessionScreen.tsx:35-59`, `storage/sessions.ts`)

- **`advanceBlock` race condition** — the 500ms tick interval and the manual "Skip" button both call `advanceBlock()` with no re-entrance guard. Tapping skip just as the timer fires can advance two blocks. Fix: add an in-flight flag or debounce. (`ActiveSessionScreen.tsx:61-102, 204`)

- **App-backgrounding timer reset is incorrect** — on foreground resume, `blockStartRef.current` is reset using `blockElapsedRef.current * 1000` but `blockElapsedRef` is in seconds (not milliseconds), so the math is off by 1000x when the app was backgrounded mid-block. Verify units and add a test case. (`ActiveSessionScreen.tsx:127-129`)

- **AsyncStorage failures are fully silent** — every `try/catch` in `storage/sessions.ts` logs to `console.error` and swallows the error. A quota failure or I/O error loses session data with no user feedback. Fix: propagate errors to callers or surface an alert. (`storage/sessions.ts`, all functions)

#### App Store Readiness

- **`app.json` missing required fields** — no `ios.bundleIdentifier`, `android.package`, `android.versionCode`, `ios.buildNumber`, or `privacyPolicyUrl`. These block App Store / Play Store submission. (`app.json`)

- **No EAS Build config (`eas.json`)** — no preview or production build profiles defined. Cannot produce a signed `.ipa` / `.apk` without this. Add at minimum `preview` and `production` profiles.

- **No crash reporting** — no Sentry, Firebase Crashlytics, or equivalent. Production crashes are invisible. Add `@sentry/react-native` and instrument before first TestFlight build.

#### Premium Tier Groundwork

- **No user identity layer** — no `User` type, no Supabase Auth integration, no `AuthContext`. This is the prerequisite for all cloud features. Design the `User` type and add `src/api/supabase.ts` + `src/context/AuthContext.tsx`.

- **Supabase schema design** — define and document the tables needed: `users`, `sessions`, `blocks`, `sync_queue`, `habits`, `habit_completions`. Include RLS policies. No tables exist yet.

---

## Medium Priority

#### Bugs / Issues

- **Timer drift on long sessions** — the 500ms tick + processing overhead accumulates to 10-20 seconds of drift on 70-minute sessions. The elapsed time is computed correctly from `Date.now() - blockStartRef.current`, so the countdown display is accurate, but auto-advance fires on a coarse 500ms boundary. Reduce tick to 100ms or use `requestAnimationFrame` for precision. (`ActiveSessionScreen.tsx:104-123`)

- **No confirmation on "End Session"** — a single tap on the end-session button abandons the current block immediately. A misfire ends a live session. Add a confirmation modal or require a hold gesture. (`ActiveSessionScreen.tsx:316-320`)

- **Focus Club allows empty club name** — if user selects Focus Club template but leaves the focus note blank, the block silently defaults to the string `"Focus Club"`. Add a non-empty validation guard and disable the Start button until a name is entered. (`PreSessionScreen.tsx:44`, `templates.ts:91`)

- **Tap on disabled Save button gives no feedback** — `PostSessionScreen` disables Save until all blocks are rated, but a tap on the disabled button produces no toast or message. Add a brief inline hint. (`PostSessionScreen.tsx:206-212`)

#### App Store Readiness

- **Accessibility labels missing throughout** — no `accessibilityLabel` or `accessibilityRole` on interactive elements (timer display, block rating chips, skip/next buttons, tab bar items). Required for App Store accessibility compliance and VoiceOver support. All screen files + `App.tsx`.

- **No analytics** — no session-started / session-completed / block-advanced events tracked. Add a lightweight analytics layer (Firebase Analytics or Amplitude) so engagement and drop-off are measurable post-launch. Hook into `PostSessionScreen.tsx:101` and `ActiveSessionScreen.tsx:115`.

- **Active session recovery UX missing** — even if the storage check is added (High priority bug above), the UX for resuming a crashed session needs design: where does the user land? Does the timer restart? Define the recovery flow.

#### Premium Tier Groundwork

- **Sync queue architecture** — define the offline-first sync pattern: `SyncQueue` type, `src/storage/sync.ts` with `queueSync()` / `syncToCloud()` / `handleConflict()`, and integration points in `PostSessionScreen.tsx` (after `saveSession()`) and `App.tsx` (on foreground resume). Design before implementing Supabase calls.

- **`PersistedSession` missing fields for stats** — current model has no `userId`, `synced` flag, or `tags`. `PersistedBlock` has no `quickNote` field persisted (notes are applied to blocks at advance time but worth verifying round-trip). Extend the types before the Supabase schema is finalized so the two stay in sync. (`src/types.ts`)

- **Habit tracking scaffolding** — define `Habit` type, `HabitsScreen.tsx` shell, and `src/logic/habits.ts` with `checkHabitCompletion()`. No Supabase calls yet — just the local-first version that works against `PersistedSession[]`. Gate behind a premium flag.

---

## Low Priority

#### Bugs / Issues

- **`navigation.getParent() as any` cast** — fragile; if navigation structure changes this silently breaks. Type the parent navigator properly. (`PostSessionScreen.tsx:105-107`)

#### App Store Readiness

- **No app-review prompt** — no in-app rating request after a positive session. Add `expo-store-review` trigger after session 5 or after a "Locked In" recap. Low lift, measurable impact on App Store rating.

- **Hardcoded UI strings** — app name, section labels, block names, and date format strings are scattered across screen files. Extract to a `src/constants/strings.ts` for easier maintenance and future i18n. (All screen files, `templates.ts`)

- **No onboarding or help** — first-time users have no explanation of bucket sizes, templates, or the session flow. Add a dismissable first-launch walkthrough or a "?" help modal on PreSessionScreen.

- **No TypeScript build step in CI** — `strict: true` is set in `tsconfig.json` but there's no `tsc --noEmit` check in any CI or pre-commit hook. Type errors can ship silently. Add a `tsc` check as a pre-build step once EAS is configured.

#### Premium Tier Groundwork

- **Habit notifications** — once habit tracking exists locally, add `expo-notifications` for daily/weekly practice reminders and streak celebrations. Requires notification permissions in `app.json`.

- **Stats/trends screen** — shell for a future "Progress" tab showing feel-rating trends, most-practiced templates, and session frequency over time. Purely local initially; Supabase-backed once sync is live.
