import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { colors } from '../theme';
import { PersistedSession } from '../types';
import { getSessions } from '../storage/sessions';

type TabParamList = {
  Session: undefined;
  History: undefined;
};

type Props = {
  navigation: BottomTabNavigationProp<TabParamList, 'History'>;
};

function formatDate(iso: string): string {
  const d = new Date(iso);
  const date = d.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
  const time = d.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
  return `${date} · ${time}`;
}

function feelEmoji(rating: string | null): string {
  switch (rating) {
    case 'Locked In': return '🔥 ';
    case 'Solid':     return '👍 ';
    case 'Okay':      return '😐 ';
    case 'Struggled': return '😤 ';
    default:          return '';
  }
}

function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

export default function HistoryScreen({ navigation }: Props) {
  const [sessions, setSessions] = useState<PersistedSession[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      setLoading(true);
      getSessions().then((data) => {
        if (active) {
          setSessions(data);
          setLoading(false);
        }
      });
      return () => {
        active = false;
      };
    }, [])
  );

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <Text style={styles.title}>History</Text>
        <TouchableOpacity
          onPress={() => navigation.navigate('Session')}
          style={styles.newButton}
          activeOpacity={0.7}
        >
          <Text style={styles.newButtonText}>+ New</Text>
        </TouchableOpacity>
      </View>

      {loading && (
        <ActivityIndicator color={colors.primary} style={styles.loader} />
      )}

      {!loading && sessions.length === 0 && (
        <Text style={styles.empty}>No sessions yet. Tap + New to start.</Text>
      )}

      {sessions.map((session) => (
        <View key={session.id} style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardDate}>{formatDate(session.date)}</Text>
            <Text style={styles.cardDuration}>
              {formatDuration(session.duration)}
            </Text>
          </View>

          <Text style={styles.cardMeta}>
            {session.template}
            {session.bucketSize ? ` · ${session.bucketSize}` : ''}
            {session.focusNote ? ` · ${session.focusNote}` : ''}
          </Text>

          <View style={styles.blockList}>
            {session.blocks.map((block) => (
              <View key={block.id} style={styles.blockRow}>
                <View style={styles.blockLeft}>
                  <Text style={styles.blockName}>
                    {feelEmoji(block.feelRating)}{block.name}
                  </Text>
                  <Text style={styles.blockClubs}>{block.clubs}</Text>
                  {block.quickNote ? (
                    <Text style={styles.blockQuickNote}>{block.quickNote}</Text>
                  ) : null}
                </View>
              </View>
            ))}
          </View>

          {session.recap.ballFlightMisses.length > 0 && (
            <View style={styles.tagsRow}>
              {session.recap.ballFlightMisses.map((f) => (
                <View key={f} style={styles.tag}>
                  <Text style={styles.tagText}>{f}</Text>
                </View>
              ))}
            </View>
          )}

          {session.recap.sessionNote ? (
            <Text style={styles.sessionNote}>{session.recap.sessionNote}</Text>
          ) : null}
        </View>
      ))}
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.text,
    letterSpacing: 2,
  },
  newButton: {
    backgroundColor: colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 8,
  },
  newButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.white,
    letterSpacing: 1,
  },
  loader: {
    marginTop: 40,
  },
  empty: {
    fontSize: 15,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 60,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  cardDate: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.text,
  },
  cardDuration: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
  cardMeta: {
    fontSize: 13,
    color: colors.textMuted,
    marginBottom: 16,
  },
  blockList: {
    gap: 10,
    marginBottom: 12,
  },
  blockRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  blockLeft: {
    flex: 1,
    marginRight: 8,
  },
  blockName: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },
  blockClubs: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 1,
  },
  blockQuickNote: {
    fontSize: 12,
    color: colors.textMuted,
    fontStyle: 'italic',
    marginTop: 3,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 4,
    marginBottom: 10,
  },
  tag: {
    backgroundColor: colors.surfaceLight,
    borderRadius: 6,
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  tagText: {
    fontSize: 12,
    color: colors.textMuted,
  },
  sessionNote: {
    fontSize: 14,
    color: colors.text,
    marginTop: 8,
    lineHeight: 20,
  },
});
