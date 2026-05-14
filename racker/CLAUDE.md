# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Racker** — Golf Practice OS

A minimal React Native Expo app for timed golf practice sessions. Designed for golfers to structure and track focused practice on the range with minimal friction.

- **Repository**: https://github.com/nguyenjustin93/racker.git
- **Tech Stack**: Expo SDK 55, React Native, React Navigation, TypeScript, AsyncStorage
- **App Model**: Three-screen workflow (PreSession → ActiveSession → PostSession) + History tab
- **Platform**: iOS/Android via Expo Go (no native build required for development)
- **Codebase Size**: ~1600 lines of TypeScript/TSX

## Development Commands

### Core Commands

```bash
# Start Expo development server
npm install
npx expo start

# Run on specific platform
npx expo start --android     # Android simulator
npx expo start --ios         # iOS simulator  
npx expo start --web         # Web browser (limited feature parity)

# Scan QR code with Expo Go app (preferred development method for iOS/Android)
```

No build step, linting, testing, or release automation currently in place. Direct source modification and reload via Expo hot reload.

## Architecture

### Navigation Structure (App.tsx)

Hybrid navigation: **Tab Navigator** (root) → **Session Stack** (nested in Session tab)

```
Root: BottomTabNavigator
├── Session Tab
│   └── SessionStack (native stack)
│       ├── PreSessionScreen
│       ├── ActiveSessionScreen
│       └── PostSessionScreen
└── History Tab
    └── HistoryScreen
```

- **Session Tab**: Creates and runs a practice session (workflow: configure → execute → review)
- **History Tab**: Views completed sessions (read-only, pulls from AsyncStorage)
- Gesture navigation disabled on ActiveSession and PostSession to prevent accidental navigation
- All screens use dark theme (`userInterfaceStyle: "dark"` in app.json)

### Data Model (src/types.ts)

Two-layer type system: **Runtime** (in-flight) vs. **Persisted** (storage)

#### Runtime Types (Session.ts)
- `Session`: Active session object with live state (activeBlockIndex, timing data, quick notes)
- `Block`: Individual practice blocks with suggested clubs and duration targets
- `PostSessionRecap`: Transient data during post-session review (ratings, ball flights, notes)

#### Persisted Types (PersistedSession.ts)
- Flattened JSON format for AsyncStorage, includes computed fields (duration in minutes, dates in ISO format)
- `PersistedBlock`: Completed block record with actual vs. target duration and feel rating
- `PersistedPostSessionRecap`: Ball flight selections and session notes
- Design: Separates "editing in-progress" from "immutable historical record"

#### Enums & Constants
- `BucketSize`: Small/Medium/Large (practice session length 30/50/70 min)
- `TemplateType`: Full Bag, Even Day, Odd Day, Focus Club (preset club groupings)
- `FeelRating`: Locked In, Solid, Okay, Struggled (post-block feedback)
- `BallFlight`: Draw, Fade, Straight, Push, Pull, Hook, Slice, High, Low (shot patterns)

### Screens (src/screens/)

#### PreSessionScreen.tsx (243 lines)
**Purpose**: Configure a new practice session before starting

**Flow**:
1. Select bucket size (duration preset)
2. Select template (club grouping preset)
3. Optional focus note (text input if "Focus Club" template selected)
4. Tap to start → navigates to ActiveSession with initialized Session object

**Key Details**:
- Creates blocks via `getBlocksForTemplate(template, bucketSize, focusClub)`
- Generates unique UUID for each session
- Saves to AsyncStorage via `saveActiveSession()` before navigation
- Uses ScrollView for vertical overflow on smaller screens

#### ActiveSessionScreen.tsx (488 lines)
**Purpose**: Execute a timed practice session with automatic block advancement

**Flow**:
1. Display current block (name, clubs, target duration)
2. Countdown timer (updates every 500ms)
3. Automatic advancement on timer expiry with haptic feedback
4. Quick note input per block (optional)
5. Manual early exit with truncation
6. Auto-advance to PostSession on final block completion

**Key Details**:
- **Timing**: Uses `blockStartRef` (Date.now()) + `blockElapsedRef` to track elapsed time per block
- **State Management**: Tracks session object, blockElapsed (current block), totalElapsed (session), blockNotes (per-block text)
- **Keep-Awake**: Uses `expo-keep-awake` hook to prevent screen sleep during practice
- **Haptics**: `expo-haptics` for light impact feedback on block transitions
- **App State Handling**: Syncs block timer on foreground resume (AppState listener) to handle backgrounding
- **Save Synchronization**: Saves updated session to AsyncStorage after each block advance
- **Note Persistence**: Notes applied to blocks during advanceBlock before navigation

#### PostSessionScreen.tsx (358 lines)
**Purpose**: Review and rate completed session, capture metadata

**Flow**:
1. Rate each completed block (Locked In/Solid/Okay/Struggled)
2. Multi-select ball flight misses (Draw, Fade, Straight, etc.)
3. Optional session-level note (text input)
4. Save → transforms runtime Session to PersistedSession and stores in AsyncStorage

**Key Details**:
- Transforms runtime Session object to PersistedSession (ISO dates, computed duration)
- Persisted blocks include both target and actual duration (as minutes) for comparison
- `handleSave()`: Creates new PersistedSession, appends to sessions array, clears active session
- Rating state indexed by block.id to support sparse ratings (user can skip blocks)

#### HistoryScreen.tsx (277 lines)
**Purpose**: Display all completed sessions with drill-down capability (if implemented)

**Flow**:
1. Load sessions from AsyncStorage on screen focus
2. Sort by recency (most recent first)
3. Display session summary: date, duration, template, block ratings with emoji, ball flights
4. Loading spinner during async load

**Key Details**:
- Uses `useFocusEffect()` hook to reload data each time History tab comes into focus
- Format helpers: `formatDate()` (relative + time), `formatDuration()` (readable hours/min)
- Feel emoji mapping for visual feedback (🔥 Locked In, 👍 Solid, 😐 Okay, 😤 Struggled)
- Each block displays feel rating emoji + name + club list + actual/target duration comparison

### Configuration & Presets (src/config/templates.ts)

**Purpose**: Centralized block templates and duration allocation

- `getBlocksForTemplate()`: Factory function that returns Block[] for a given template/bucket size
- **Full Bag** (7 blocks): Driver, Fairway, Long Irons, Mid Irons, Short Irons, Wedges, Putter
  - Durations prioritize short game (Wedges get most time)
  - Putter gets least time
- **Even Day** (4 blocks): Fairway, 4&6, 8&PW, Putter (focus on even-numbered irons)
- **Odd Day** (4 blocks): Driver, 5&7, 9&Wedges, Putter (focus on odd-numbered irons)
- **Focus Club** (1 block): Single club, user-specified name, full session time allocated

**Duration Allocation** (minutes):
- Small: ~30 min total
- Medium: ~50 min total
- Large: ~70 min total

Block durations are hardcoded per template/size, not dynamically calculated.

### Storage (src/storage/sessions.ts)

**Two-layer persistence** using React Native AsyncStorage:

1. **Active Session** (`racker_active_session` key)
   - Raw Session object stored as JSON
   - Cleared when session completed or abandoned
   - Used for recovery if app crashes mid-session

2. **Completed Sessions** (`racker_sessions` key)
   - Array of PersistedSession objects
   - New sessions prepended (most recent first)
   - No deletion/archival implemented

**Functions**:
- `saveActiveSession(session)` — persist in-flight Session
- `getActiveSession()` — retrieve in-flight Session or null
- `clearActiveSession()` — remove after session completion
- `saveSession(persisted)` — append PersistedSession to history
- `getSessions()` — retrieve all completed sessions

All async with console.error fallback (no exception throwing).

### Theme (src/theme.ts)

Single color palette (dark mode only):
- Primary: `#2D6A4F` (forest green)
- Accent: `#40916C` (lighter green)
- Background: `#F6F1E6` (off-white)
- Text: `#1B4332` (dark)

Colors not component-specific; applied per-screen in StyleSheet.

## Key Patterns & Conventions

### Session State Flow

```
PreSessionScreen (configure)
  → saveActiveSession()
  → ActiveSessionScreen (execute)
    → saveActiveSession() after each block
    → navigation.replace() to PostSessionScreen
  → PostSessionScreen (review)
    → PersistedSession + saveSession()
    → clearActiveSession()
    → navigation.replace() back to PreSessionScreen
```

- Session object passed via navigation params (not context/Redux)
- No global state manager; local React state + AsyncStorage
- Each screen owns its local mutations; parent (App.tsx) doesn't manage state

### Block Timing Logic

- **blockStartRef**: Captured at block start (Date.now())
- **blockElapsedRef**: In-memory elapsed time (not persisted; cleared on component unmount)
- **Tick interval**: 500ms update frequency (sufficient for UI responsiveness, not ultra-precise)
- **Timer override**: AppState listener resets blockStartRef on foreground to handle backgrounding

### Type Safety

- Strict TypeScript (`tsconfig.json` extends `expo/tsconfig.base` + `"strict": true`)
- Navigation param lists explicitly typed (SessionStackParamList, TabParamList)
- No `any` types; all event handlers typed via React.FC or function props
- No null-checking gaps; optional fields use `?:` with defaults

## Environment & Build

- **Expo SDK 55**: Latest stable as of project creation (Mar 2025)
- **React 19.2.0**: Latest major, may have breaking changes from 18.x
- **React Native 0.83.2**: Matches Expo SDK 55 compatibility
- **TypeScript 5.9.2**: Strict mode, no generated .d.ts
- **Compiled Output**: Metro bundler (Expo built-in), no webpack/tsc output step
- **Platform-Specific**: Uses Expo's unified platform layer; no ios/ or android/ folders (ignored in .gitignore)

## Extensibility Notes

### Adding Features

- **New template**: Add entry to TemplateType, duration matrix in templates.ts, getBlocksForTemplate case
- **New ball flight**: Add to BALL_FLIGHT_OPTIONS array in types.ts
- **New feel rating**: Add to FeelRating type and FEEL_OPTIONS in PostSessionScreen
- **New screen**: Create in src/screens/, add to navigation hierarchy in App.tsx
- **New storage layer**: Extend src/storage/sessions.ts (e.g., cloud sync, export formats)

### Performance Considerations

- **Interval Cleanup**: ActiveSessionScreen clears timer on unmount to prevent memory leak
- **AsyncStorage Scalability**: No pagination for history; assume <1000 sessions before slowdown
- **Re-renders**: useKeepAwake hook is one-time call; no dependency array issues
- **List Rendering**: HistoryScreen uses ScrollView, not FlatList; fine for <500 sessions

### Known Limitations

- No cloud sync; all data stored locally in AsyncStorage
- No ability to edit/delete completed sessions
- No export format (JSON/CSV) for session history
- No offline-first or sync queue
- Focus Club name input limited to simple string (no validation)
- Timer is not perfectly accurate (500ms tick + processing time drift)
