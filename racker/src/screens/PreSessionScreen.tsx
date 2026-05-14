import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { v4 as uuidv4 } from 'uuid';
import { colors } from '../theme';
import { BucketSize, TemplateType, Session } from '../types';
import { getBlocksForTemplate } from '../config/templates';
import { saveActiveSession, getActiveSession, clearActiveSession } from '../storage/sessions';

type RootStackParamList = {
  PreSession: undefined;
  ActiveSession: { session: Session };
  PostSession: { session: Session };
};

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'PreSession'>;
};

const BUCKET_OPTIONS: BucketSize[] = ['Small', 'Medium', 'Large'];
const TEMPLATE_OPTIONS: TemplateType[] = [
  'Full Bag',
  'Even Day',
  'Odd Day',
  'Focus Club',
];

export default function PreSessionScreen({ navigation }: Props) {
  const [bucketSize, setBucketSize] = useState<BucketSize>('Medium');
  const [template, setTemplate] = useState<TemplateType>('Full Bag');
  const [focusNote, setFocusNote] = useState('');
  const [recoveredSession, setRecoveredSession] = useState<Session | null>(null);

  useEffect(() => {
    getActiveSession().then((session) => {
      if (session) setRecoveredSession(session);
    });
  }, []);

  const handleResume = () => {
    if (!recoveredSession) return;
    setRecoveredSession(null);
    navigation.navigate('ActiveSession', { session: recoveredSession });
  };

  const handleDiscard = async () => {
    await clearActiveSession();
    setRecoveredSession(null);
  };

  const handleStart = async () => {
    const blocks = getBlocksForTemplate(
      template,
      bucketSize,
      template === 'Focus Club' ? focusNote : undefined
    );

    const session: Session = {
      id: uuidv4(),
      startedAt: Date.now(),
      bucketSize,
      template,
      focusNote: focusNote.trim() || undefined,
      blocks,
      activeBlockIndex: 0,
    };

    await saveActiveSession(session);
    navigation.navigate('ActiveSession', { session });
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.title}>Racker</Text>
      <Text style={styles.subtitle}>Golf Practice OS</Text>

      {recoveredSession && (
        <View style={styles.resumeCard}>
          <Text style={styles.resumeTitle}>Resume Session?</Text>
          <Text style={styles.resumeDetail}>
            {recoveredSession.template} · Block {recoveredSession.activeBlockIndex + 1} of {recoveredSession.blocks.length}
          </Text>
          <View style={styles.resumeActions}>
            <TouchableOpacity
              style={[styles.resumeButton, styles.resumeButtonDiscard]}
              onPress={handleDiscard}
              accessibilityLabel="Discard session"
              activeOpacity={0.7}
            >
              <Text style={styles.resumeButtonTextDiscard}>Discard</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.resumeButton, styles.resumeButtonResume]}
              onPress={handleResume}
              accessibilityLabel="Resume session"
              activeOpacity={0.8}
            >
              <Text style={styles.resumeButtonTextResume}>Resume</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.label}>Bucket Size</Text>
        <View style={styles.optionRow}>
          {BUCKET_OPTIONS.map((opt) => (
            <TouchableOpacity
              key={opt}
              style={[
                styles.option,
                bucketSize === opt && styles.optionSelected,
              ]}
              onPress={() => setBucketSize(opt)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.optionText,
                  bucketSize === opt && styles.optionTextSelected,
                ]}
              >
                {opt}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Template</Text>
        <View style={styles.templateGrid}>
          {TEMPLATE_OPTIONS.map((opt) => (
            <TouchableOpacity
              key={opt}
              style={[
                styles.templateOption,
                template === opt && styles.optionSelected,
              ]}
              onPress={() => setTemplate(opt)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.optionText,
                  template === opt && styles.optionTextSelected,
                ]}
              >
                {opt}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Focus Note (optional)</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. 7-iron, tempo work..."
          placeholderTextColor={colors.textMuted}
          value={focusNote}
          onChangeText={setFocusNote}
          multiline={false}
        />
      </View>

      <TouchableOpacity
        style={styles.startButton}
        onPress={handleStart}
        activeOpacity={0.8}
      >
        <Text style={styles.startButtonText}>TAP TO START</Text>
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
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
    letterSpacing: 2,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 40,
  },
  section: {
    marginBottom: 28,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textMuted,
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  optionRow: {
    flexDirection: 'row',
    gap: 10,
  },
  option: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  optionSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  optionText: {
    fontSize: 15,
    color: colors.text,
    fontWeight: '500',
  },
  optionTextSelected: {
    color: colors.white,
  },
  templateGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  templateOption: {
    flex: 1,
    minWidth: '45%',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
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
  startButton: {
    marginTop: 24,
    marginBottom: 40,
    backgroundColor: colors.primary,
    paddingVertical: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  startButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.white,
    letterSpacing: 2,
  },
  resumeCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.primary,
    padding: 16,
    marginBottom: 24,
  },
  resumeTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  resumeDetail: {
    fontSize: 13,
    color: colors.textMuted,
    marginBottom: 12,
  },
  resumeActions: {
    flexDirection: 'row',
    gap: 10,
  },
  resumeButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  resumeButtonDiscard: {
    backgroundColor: colors.surfaceLight,
    borderWidth: 1,
    borderColor: colors.border,
  },
  resumeButtonResume: {
    backgroundColor: colors.primary,
  },
  resumeButtonTextDiscard: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  resumeButtonTextResume: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.white,
  },
});
