import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors } from '../theme';
import {
  Session,
  FeelRating,
  BALL_FLIGHT_OPTIONS,
  BallFlight,
  PersistedBlock,
  PersistedPostSessionRecap,
  PersistedSession,
} from '../types';
import { saveSession, clearActiveSession } from '../storage/sessions';

type SessionStackParamList = {
  PreSession: undefined;
  ActiveSession: { session: Session };
  PostSession: { session: Session };
};

type Props = {
  navigation: NativeStackNavigationProp<SessionStackParamList, 'PostSession'>;
  route: { params: { session: Session } };
};

const FEEL_OPTIONS: FeelRating[] = [
  'Locked In',
  'Solid',
  'Okay',
  'Struggled',
];

export default function PostSessionScreen({ navigation, route }: Props) {
  const { session: initialSession } = route.params;
  const [blockRatings, setBlockRatings] = useState<
    Record<string, FeelRating | null>
  >({});
  const [ballFlights, setBallFlights] = useState<BallFlight[]>([]);
  const [sessionNote, setSessionNote] = useState('');

  const toggleBallFlight = (f: BallFlight) => {
    setBallFlights((prev) =>
      prev.includes(f) ? prev.filter((x) => x !== f) : [...prev, f]
    );
  };

  const handleSave = async () => {
    const now = new Date().toISOString();
    const startTime = new Date(initialSession.startedAt).toISOString();
    const endTime = initialSession.endedAt
      ? new Date(initialSession.endedAt).toISOString()
      : now;
    const durationMinutes = Math.round(
      ((initialSession.endedAt ?? Date.now()) - initialSession.startedAt) / 60000
    );

    const persistedBlocks: PersistedBlock[] = initialSession.blocks
      .filter((b) => b.completedAt)
      .map((b, i) => ({
        id: b.id,
        name: b.name,
        clubs: (b.suggestedClubs ?? []).join(' · '),
        order: i,
        targetDuration: b.durationMinutes,
        actualDuration: b.actualDurationSeconds != null
          ? b.actualDurationSeconds / 60
          : b.durationMinutes,
        feelRating: blockRatings[b.id] ?? null,
        ...(b.quickNote ? { quickNote: b.quickNote } : {}),
      }));

    const recap: PersistedPostSessionRecap = {
      sessionId: initialSession.id,
      ballFlightMisses: ballFlights,
      sessionNote: sessionNote.trim(),
      savedAt: now,
    };

    const persistedSession: PersistedSession = {
      id: initialSession.id,
      date: startTime,
      template: initialSession.template,
      bucketSize: initialSession.bucketSize,
      focusNote: initialSession.focusNote ?? '',
      startTime,
      endTime,
      duration: durationMinutes,
      completed: true,
      blocks: persistedBlocks,
      recap,
    };

    await saveSession(persistedSession);
    await clearActiveSession();

    // Reset session stack to home, then switch to History tab
    const parentNav = navigation.getParent() as any;
    navigation.reset({ index: 0, routes: [{ name: 'PreSession' }] });
    parentNav?.navigate('History');
  };

  const completedBlocks = initialSession.blocks.filter((b) => b.completedAt);
  const allRated = completedBlocks.every((b) => blockRatings[b.id] != null);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.title}>Session Recap</Text>
      <Text style={styles.subtitle}>
        {completedBlocks.length} block
        {completedBlocks.length !== 1 ? 's' : ''} completed
      </Text>

      {completedBlocks.map((block) => (
        <View
          key={block.id}
          style={[
            styles.blockCard,
            blockRatings[block.id] == null && styles.blockCardUnrated,
          ]}
        >
          <Text style={styles.blockName}>{block.name}</Text>
          <Text style={styles.blockClubs}>
            {(block.suggestedClubs ?? []).join(' · ')}
          </Text>
          <View style={styles.feelRow}>
            {FEEL_OPTIONS.map((feel) => (
              <TouchableOpacity
                key={feel}
                style={[
                  styles.feelOption,
                  blockRatings[block.id] === feel && styles.feelSelected,
                ]}
                onPress={() =>
                  setBlockRatings((r) => ({ ...r, [block.id]: feel }))
                }
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.feelText,
                    blockRatings[block.id] === feel && styles.feelTextSelected,
                  ]}
                >
                  {feel}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      ))}

      <View style={styles.section}>
        <Text style={styles.label}>Ball Flight (multi-select)</Text>
        <View style={styles.ballFlightGrid}>
          {BALL_FLIGHT_OPTIONS.map((f) => (
            <TouchableOpacity
              key={f}
              style={[
                styles.ballFlightOption,
                ballFlights.includes(f) && styles.ballFlightSelected,
              ]}
              onPress={() => toggleBallFlight(f)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.ballFlightText,
                  ballFlights.includes(f) && styles.ballFlightTextSelected,
                ]}
              >
                {f}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Session Note (optional)</Text>
        <TextInput
          style={[styles.input, styles.inputMultiline]}
          placeholder="How did it feel overall?"
          placeholderTextColor={colors.textMuted}
          value={sessionNote}
          onChangeText={setSessionNote}
          multiline
          numberOfLines={3}
        />
      </View>

      {!allRated && (
        <Text style={styles.ratingWarning}>Rate each block to save</Text>
      )}
      <TouchableOpacity
        style={[styles.saveButton, !allRated && styles.saveButtonDisabled]}
        onPress={allRated ? handleSave : undefined}
        activeOpacity={allRated ? 0.8 : 1}
      >
        <Text style={styles.saveButtonText}>Save Session</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textMuted,
    textAlign: 'center',
    marginBottom: 32,
  },
  blockCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  blockName: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  blockClubs: {
    fontSize: 14,
    color: colors.textMuted,
    marginBottom: 14,
  },
  feelRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  feelOption: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  feelSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  feelText: {
    fontSize: 13,
    color: colors.text,
  },
  feelTextSelected: {
    color: colors.white,
    fontWeight: '600',
  },
  section: {
    marginBottom: 24,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textMuted,
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  ballFlightGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  ballFlightOption: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  ballFlightSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  ballFlightText: {
    fontSize: 14,
    color: colors.text,
  },
  ballFlightTextSelected: {
    color: colors.white,
    fontWeight: '600',
  },
  input: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 14,
    paddingHorizontal: 16,
    fontSize: 16,
    color: colors.text,
  },
  inputMultiline: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  blockCardUnrated: {
    borderColor: '#C0392B',
    borderWidth: 2,
  },
  ratingWarning: {
    fontSize: 13,
    color: '#C0392B',
    textAlign: 'center',
    marginBottom: 10,
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: colors.primary,
    paddingVertical: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    opacity: 0.4,
  },
  saveButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.white,
    letterSpacing: 1,
  },
});
