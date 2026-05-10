export type BucketSize = 'Small' | 'Medium' | 'Large';
export type TemplateType = 'Full Bag' | 'Even Day' | 'Odd Day' | 'Focus Club';
export type FeelRating = 'Locked In' | 'Solid' | 'Okay' | 'Struggled';

export type Block = {
  id: string;
  name: string;
  suggestedClubs: string[];
  durationMinutes: number;
  completedAt?: number;
  actualDurationSeconds?: number;
  quickNote?: string;
};

export type PostSessionRecap = {
  blockRatings: Record<string, FeelRating>;
  ballFlights: string[];
  sessionNote?: string;
};

export type Session = {
  id: string;
  startedAt: number;
  endedAt?: number;
  bucketSize: BucketSize;
  template: TemplateType;
  focusNote?: string;
  blocks: Block[];
  activeBlockIndex: number;
  recap?: PostSessionRecap;
};

// ─── Persisted types (stored in AsyncStorage) ───────────────────────────────

export type PersistedBlock = {
  id: string;
  name: string;
  clubs: string;
  order: number;
  targetDuration: number;  // minutes
  actualDuration: number;  // minutes
  feelRating: string | null;
  quickNote?: string;
};

export type PersistedPostSessionRecap = {
  sessionId: string;
  ballFlightMisses: string[];
  sessionNote: string;
  savedAt: string;  // ISO
};

export type PersistedSession = {
  id: string;
  date: string;        // ISO
  template: string;
  bucketSize: string;
  focusNote: string;
  startTime: string;   // ISO
  endTime: string;     // ISO
  duration: number;    // minutes
  completed: boolean;
  blocks: PersistedBlock[];
  recap: PersistedPostSessionRecap;
};

// ─── Ball flight ─────────────────────────────────────────────────────────────

export const BALL_FLIGHT_OPTIONS = [
  'Draw',
  'Fade',
  'Straight',
  'Push',
  'Pull',
  'Hook',
  'Slice',
  'High',
  'Low',
] as const;

export type BallFlight = (typeof BALL_FLIGHT_OPTIONS)[number];
