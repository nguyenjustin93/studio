# Racker — Golf Practice OS

A minimal React Native Expo app for timed golf practice sessions. Three screens, no auth, no paywall.

## Features

- **Pre-session**: Choose bucket size (Small/Medium/Large), template (Full Bag/Even Day/Odd Day/Focus Club), optional focus note, then tap to start
- **Active session**: Blocks advance automatically on timer with haptic feedback. Progress bar, session timer, quick note
- **Post-session**: Rate each block (Locked In/Solid/Okay/Struggled), multi-select ball flight, optional note, save to AsyncStorage

## Run

```bash
npm install
npx expo start
```

Scan the QR code with Expo Go (iOS/Android) to run on device.

## Stack

- Expo SDK 55
- React Navigation (native stack)
- AsyncStorage for persistence
- Expo Haptics for block transitions
