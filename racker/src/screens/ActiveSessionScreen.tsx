import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  AppState,
  AppStateStatus,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as Haptics from 'expo-haptics';
import { useKeepAwake } from 'expo-keep-awake';
import { colors } from '../theme';
import { Session } from '../types';
import { saveActiveSession } from '../storage/sessions';

type RootStackParamList = {
  PreSession: undefined;
  ActiveSession: { session: Session };
  PostSession: { session: Session };
};

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'ActiveSession'>;
  route: { params: { session: Session } };
};

export default function ActiveSessionScreen({ navigation, route }: Props) {
  useKeepAwake();
  const { session: initialSession } = route.params;
  const [session, setSession] = useState(initialSession);
  const [blockElapsed, setBlockElapsed] = useState(0);
  const [totalElapsed, setTotalElapsed] = useState(0);
  const [blockNotes, setBlockNotes] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    for (const b of initialSession.blocks) {
      if (b.quickNote) initial[b.id] = b.quickNote;
    }
    return initial;
  });
  const [quickNoteExpanded, setQuickNoteExpanded] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const blockStartRef = useRef(Date.now());
  const blockElapsedRef = useRef(0);

  const currentBlock = session.blocks[session.activeBlockIndex];
  const isLastBlock = session.activeBlockIndex >= session.blocks.length - 1;

  const currentBlockNote = currentBlock ? (blockNotes[currentBlock.id] ?? '') : '';

  const applyNotesToBlocks = useCallback(
    (blocks: typeof session.blocks, notes: Record<string, string>) =>
      blocks.map((b) => {
        const note = notes[b.id]?.trim();
        return note ? { ...b, quickNote: note } : b;
      }),
    []
  );

  const advanceBlock = useCallback(() => {
    const idx = session.activeBlockIndex;
    const block = session.blocks[idx];
    const now = Date.now();
    const actualDurationSeconds = Math.floor((now - blockStartRef.current) / 1000);
    const updatedBlocks = [...session.blocks];
    const note = blockNotes[block.id]?.trim();
    updatedBlocks[idx] = {
      ...block,
      completedAt: now,
      actualDurationSeconds,
      ...(note ? { quickNote: note } : {}),
    };

    if (isLastBlock) {
      const endedAt = now;
      const finalSession: Session = {
        ...session,
        blocks: applyNotesToBlocks(updatedBlocks, blockNotes),
        endedAt,
      };
      setSession(finalSession);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      navigation.replace('PostSession', { session: finalSession });
    } else {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      const nextSession: Session = {
        ...session,
        blocks: updatedBlocks,
        activeBlockIndex: idx + 1,
      };
      setSession(nextSession);
      saveActiveSession(nextSession).catch(console.error);
      setQuickNoteExpanded(false);
      setBlockElapsed(0);
      blockElapsedRef.current = 0;
      blockStartRef.current = now;
    }
  }, [session, isLastBlock, blockNotes, applyNotesToBlocks, navigation]);

  useEffect(() => {
    const tick = () => {
      const now = Date.now();
      const blockTime = Math.floor((now - blockStartRef.current) / 1000);
      const totalTime = Math.floor((now - session.startedAt) / 1000);

      blockElapsedRef.current = blockTime;
      setBlockElapsed(blockTime);
      setTotalElapsed(totalTime);

      if (currentBlock && blockTime >= currentBlock.durationMinutes * 60) {
        advanceBlock();
      }
    };

    intervalRef.current = setInterval(tick, 500);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [session.activeBlockIndex, currentBlock?.durationMinutes, advanceBlock]);

  useEffect(() => {
    const sub = AppState.addEventListener('change', (state: AppStateStatus) => {
      if (state === 'active') {
        blockStartRef.current = Date.now() - blockElapsedRef.current * 1000;
      }
    });
    return () => sub.remove();
  }, []);

  const handleEndEarly = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    const now = Date.now();
    const actualDurationSeconds = Math.floor((now - blockStartRef.current) / 1000);
    const updatedBlocks = session.blocks.map((b, i) => {
      if (i < session.activeBlockIndex) return b;
      if (i === session.activeBlockIndex) {
        return { ...b, completedAt: b.completedAt ?? now, actualDurationSeconds: b.actualDurationSeconds ?? actualDurationSeconds };
      }
      return b;
    });
    const completedCount = updatedBlocks.filter((b) => b.completedAt).length;
    const blocksToKeep = applyNotesToBlocks(
      updatedBlocks.slice(0, Math.max(1, completedCount)),
      blockNotes
    );

    navigation.replace('PostSession', {
      session: {
        ...session,
        blocks: blocksToKeep,
        endedAt: now,
      },
    });
  };

  const handleRestartOrPrevious = () => {
    const idx = session.activeBlockIndex;
    const alreadyReset = blockElapsedRef.current <= 0;

    if (!alreadyReset) {
      // First tap restarts the current block timer.
      blockStartRef.current = Date.now();
      blockElapsedRef.current = 0;
      setBlockElapsed(0);
      return;
    }

    if (idx === 0) {
      return;
    }

    // If timer is already reset, move back and reopen the previous block.
    const updatedBlocks = [...session.blocks];
    const previousBlock = updatedBlocks[idx - 1];
    updatedBlocks[idx - 1] = {
      ...previousBlock,
      completedAt: undefined,
      actualDurationSeconds: undefined,
    };

    const previousSession: Session = {
      ...session,
      blocks: updatedBlocks,
      activeBlockIndex: idx - 1,
    };

    setSession(previousSession);
    saveActiveSession(previousSession).catch(console.error);
    setQuickNoteExpanded(false);
    blockStartRef.current = Date.now();
    blockElapsedRef.current = 0;
    setBlockElapsed(0);
  };

  const handleSkipOrNext = () => {
    advanceBlock();
  };

  const blockProgress = currentBlock
    ? Math.min(1, blockElapsed / (currentBlock.durationMinutes * 60))
    : 0;

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  if (!currentBlock) return null;

  const clubsLabel = (currentBlock.suggestedClubs ?? []).join(' · ');
  const showClubs = clubsLabel.length > 0 && clubsLabel !== currentBlock.name;

  return (
    <View style={styles.container}>
      <View style={styles.main}>
        <Text style={styles.totalTimer}>{formatTime(totalElapsed)}</Text>
        <Text style={styles.totalLabel}>total session</Text>

        <Text style={styles.blockName}>{currentBlock.name}</Text>
        {showClubs && (
          <Text style={styles.clubs}>{clubsLabel}</Text>
        )}

        <View style={styles.progressContainer}>
          <View style={styles.progressTrack}>
            <View
              style={[styles.progressFill, { width: `${blockProgress * 100}%` }]}
            />
          </View>
          <Text style={styles.progressTime}>
            {formatTime(blockElapsed)} / {formatTime(currentBlock.durationMinutes * 60)}
          </Text>
        </View>

        {quickNoteExpanded ? (
          <TextInput
            style={styles.quickNote}
            placeholder="Quick note…"
            placeholderTextColor={colors.textMuted}
            value={currentBlockNote}
            onChangeText={(text) =>
              setBlockNotes((prev) => ({ ...prev, [currentBlock.id]: text }))
            }
            onBlur={() => setQuickNoteExpanded(false)}
            autoFocus
          />
        ) : (
          <View>
            <TouchableOpacity
              onPress={() => setQuickNoteExpanded(true)}
              style={styles.quickNoteToggle}
              activeOpacity={0.7}
            >
              <Text style={styles.quickNoteToggleText}>+ Quick Note</Text>
            </TouchableOpacity>
            {currentBlockNote.trim() ? (
              <Text style={styles.quickNotePreview}>{currentBlockNote.trim()}</Text>
            ) : null}
          </View>
        )}
      </View>

      <View style={styles.footer}>
        <View style={styles.navButtonsRow}>
          <TouchableOpacity
            style={styles.navButton}
            onPress={handleRestartOrPrevious}
            activeOpacity={0.8}
          >
            <Text style={styles.navButtonText}>Restart/Previous Block</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.navButton}
            onPress={handleSkipOrNext}
            activeOpacity={0.8}
          >
            <Text style={styles.navButtonText}>Skip/Next Block</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.blockIndicators}>
          {session.blocks.map((b, i) => {
            const isDone = i < session.activeBlockIndex;
            const isActive = i === session.activeBlockIndex;
            return (
              <View key={b.id} style={styles.blockIndicatorItem}>
                <View style={[
                  styles.indicatorDot,
                  isDone && styles.indicatorDotDone,
                  isActive && styles.indicatorDotActive,
                ]}>
                  {isDone && <Text style={styles.indicatorCheck}>✓</Text>}
                </View>
                <Text
                  style={[
                    styles.indicatorLabel,
                    isActive && styles.indicatorLabelActive,
                  ]}
                  numberOfLines={2}
                >
                  {b.name}
                </Text>
              </View>
            );
          })}
        </View>
        <TouchableOpacity
          style={styles.endButton}
          onPress={handleEndEarly}
          activeOpacity={0.8}
        >
          <Text style={styles.endButtonText}>TAP TO END</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },
  main: {
    flex: 1,
  },
  blockName: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  clubs: {
    fontSize: 16,
    color: colors.textMuted,
    textAlign: 'center',
    marginBottom: 32,
  },
  progressContainer: {
    marginBottom: 24,
  },
  progressTrack: {
    height: 6,
    backgroundColor: colors.surface,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 3,
  },
  progressTime: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 6,
    textAlign: 'center',
  },
  totalTimer: {
    fontSize: 48,
    fontWeight: '700',
    color: colors.primary,
    textAlign: 'center',
    fontVariant: ['tabular-nums'],
  },
  totalLabel: {
    fontSize: 12,
    color: colors.textMuted,
    textAlign: 'center',
    marginBottom: 24,
  },
  quickNote: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontSize: 15,
    color: colors.text,
  },
  quickNoteToggle: {
    paddingVertical: 8,
    paddingHorizontal: 0,
  },
  quickNoteToggleText: {
    fontSize: 14,
    color: colors.textMuted,
  },
  quickNotePreview: {
    fontSize: 13,
    color: colors.textMuted,
    fontStyle: 'italic',
    marginTop: 4,
    paddingHorizontal: 0,
  },
  footer: {
    paddingTop: 24,
  },
  navButtonsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 18,
  },
  navButton: {
    flex: 1,
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.white,
    textAlign: 'center',
  },
  blockIndicators: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    marginBottom: 20,
  },
  blockIndicatorItem: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  indicatorDot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  indicatorDotDone: {
    backgroundColor: colors.surfaceLight,
    borderColor: colors.border,
  },
  indicatorDotActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  indicatorCheck: {
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: '700',
    lineHeight: 14,
  },
  indicatorLabel: {
    fontSize: 11,
    color: colors.textMuted,
    textAlign: 'center',
  },
  indicatorLabelActive: {
    color: colors.primary,
    fontWeight: '700',
  },
  endButton: {
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.primary,
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: 'center',
  },
  endButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primary,
    letterSpacing: 2,
  },
});
