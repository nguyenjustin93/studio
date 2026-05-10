import AsyncStorage from '@react-native-async-storage/async-storage';
import { Session, PersistedSession } from '../types';

const SESSIONS_KEY = 'racker_sessions';
const ACTIVE_SESSION_KEY = 'racker_active_session';

// ─── Active session (in-flight, raw Session object) ──────────────────────────

export async function saveActiveSession(session: Session): Promise<void> {
  try {
    await AsyncStorage.setItem(ACTIVE_SESSION_KEY, JSON.stringify(session));
  } catch (e) {
    console.error('Failed to save active session:', e);
  }
}

export async function getActiveSession(): Promise<Session | null> {
  try {
    const raw = await AsyncStorage.getItem(ACTIVE_SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as Session;
  } catch (e) {
    console.error('Failed to load active session:', e);
    return null;
  }
}

export async function clearActiveSession(): Promise<void> {
  try {
    await AsyncStorage.removeItem(ACTIVE_SESSION_KEY);
  } catch (e) {
    console.error('Failed to clear active session:', e);
  }
}

// ─── Completed sessions (persisted data model) ───────────────────────────────

export async function saveSession(session: PersistedSession): Promise<void> {
  try {
    const existing = await getSessions();
    const updated = [session, ...existing.filter((s) => s.id !== session.id)];
    await AsyncStorage.setItem(SESSIONS_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to save session:', e);
  }
}

export async function getSessions(): Promise<PersistedSession[]> {
  try {
    const raw = await AsyncStorage.getItem(SESSIONS_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as PersistedSession[];
  } catch (e) {
    console.error('Failed to load sessions:', e);
    return [];
  }
}
