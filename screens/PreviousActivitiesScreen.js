import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { auth, db } from '../firebaseConfig';
import { useState, useEffect } from 'react';

const ACTIVITY_EMOJIS = {
  1: '🪂', 2: '🔊', 3: '🪭', 4: '🏗️', 5: '🤸', 6: '⚡', 7: '💨',
};

const ACTIVITY_COLORS = {
  1: '#e74c3c', 2: '#9b59b6', 3: '#3498db',
  4: '#e67e22', 5: '#2ecc71', 6: '#f39c12', 7: '#1abc9c',
};

const getScoreLabel = (entry) => {
  switch (entry.activityId) {
    case 1: return `Drop Time: ${entry.totalScore}ms`;
    case 2: return `Loudest: ${entry.totalScore} dB`;
    case 3: return `Best Bend: ${entry.totalScore}°`;
    case 4: return `Stability: ${entry.totalScore}`;
    case 5: return `Grace Score: ${entry.totalScore}/100`;
    case 6: return `Reaction: ${entry.totalScore}ms`;
    case 7: return `Resting BPM: ${entry.totalScore}`;
    default: return `Score: ${entry.totalScore}`;
  }
};

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-AU', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
};

export default function PreviousActivitiesScreen({ navigation, route }) {
  const { teamName } = route?.params || {};
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const user = auth.currentUser;
      if (!user) return;

      const q = query(
        collection(db, 'leaderboard'),
        where('userId', '==', user.uid)
      );
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      setEntries(data);
    } catch (error) {
      console.error('History fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredEntries = filter === 'all'
    ? entries
    : entries.filter(e => e.activityId === parseInt(filter));

  const FILTERS = [
    { label: 'All', value: 'all' },
    { label: '🪂', value: '1' },
    { label: '🔊', value: '2' },
    { label: '🪭', value: '3' },
    { label: '🏗️', value: '4' },
    { label: '🤸', value: '5' },
    { label: '⚡', value: '6' },
    { label: '💨', value: '7' },
  ];

  return (
    <LinearGradient colors={['#4a90d9', '#1a3a5c']} style={styles.gradient}>
      <ScrollView contentContainerStyle={styles.container}>

        <Text style={styles.title}>📋 Previous Activities</Text>
        <Text style={styles.subtitle}>Your activity history — newest first</Text>

        {/* Filter row */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterScroll}
          contentContainerStyle={styles.filterRow}
        >
          {FILTERS.map(f => (
            <TouchableOpacity
              key={f.value}
              style={[styles.filterBtn, filter === f.value && styles.filterBtnActive]}
              onPress={() => setFilter(f.value)}
            >
              <Text style={[styles.filterText, filter === f.value && styles.filterTextActive]}>
                {f.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Loading */}
        {loading && <ActivityIndicator color="#fff" size="large" style={{ marginTop: 40 }} />}

        {/* Empty */}
        {!loading && filteredEntries.length === 0 && (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyEmoji}>📭</Text>
            <Text style={styles.emptyText}>No activities yet!</Text>
            <Text style={styles.emptySubtext}>Complete an activity to see your history here.</Text>
          </View>
        )}

        {/* Entries */}
        {!loading && filteredEntries.map((entry) => (
          <TouchableOpacity
            key={entry.id}
            style={styles.card}
            onPress={() => navigation.navigate('LeaderboardDetail', { entry, teamName })}
            activeOpacity={0.75}
          >
            {/* Left color bar */}
            <View style={[styles.colorBar, { backgroundColor: ACTIVITY_COLORS[entry.activityId] || '#4a90d9' }]} />

            {/* Emoji */}
            <View style={styles.emojiBox}>
              <Text style={styles.emoji}>{ACTIVITY_EMOJIS[entry.activityId] || '🔬'}</Text>
            </View>

            {/* Content */}
            <View style={styles.cardContent}>
              <Text style={styles.cardActivity}>{entry.activityName}</Text>
              <Text style={styles.cardScore}>{getScoreLabel(entry)}</Text>
              <Text style={styles.cardDate}>{formatDate(entry.createdAt)}</Text>
              {entry.reflection ? (
                <Text style={styles.cardReflection} numberOfLines={1}>
                  💬 "{entry.reflection}"
                </Text>
              ) : null}
            </View>

            <Text style={styles.tapHint}>→</Text>
          </TouchableOpacity>
        ))}

        {/* Stats summary */}
        {!loading && entries.length > 0 && (
          <View style={styles.statsBox}>
            <Text style={styles.statsTitle}>📊 Your Stats</Text>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{entries.length}</Text>
                <Text style={styles.statLabel}>Total Submissions</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>
                  {new Set(entries.map(e => e.activityId)).size}
                </Text>
                <Text style={styles.statLabel}>Activities Tried</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>
                  {entries.length > 0 ? ACTIVITY_EMOJIS[
                    Object.entries(
                      entries.reduce((acc, e) => {
                        acc[e.activityId] = (acc[e.activityId] || 0) + 1;
                        return acc;
                      }, {})
                    ).sort((a, b) => b[1] - a[1])[0]?.[0]
                  ] || '🔬' : '-'}
                </Text>
                <Text style={styles.statLabel}>Most Done</Text>
              </View>
            </View>
          </View>
        )}

        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>← Back to Home</Text>
        </TouchableOpacity>

      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  container: { alignItems: 'center', paddingTop: 60, paddingBottom: 40, paddingHorizontal: 20 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#fff', marginBottom: 4, textAlign: 'center' },
  subtitle: { fontSize: 13, color: '#b0d4f1', marginBottom: 16 },
  filterScroll: { width: '100%', marginBottom: 16 },
  filterRow: { flexDirection: 'row', gap: 8, paddingHorizontal: 4 },
  filterBtn: {
    paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)',
  },
  filterBtnActive: { backgroundColor: 'rgba(255,255,255,0.3)', borderColor: '#fff' },
  filterText: { fontSize: 14, color: '#b0d4f1' },
  filterTextActive: { color: '#fff', fontWeight: 'bold' },
  emptyBox: { marginTop: 60, alignItems: 'center' },
  emptyEmoji: { fontSize: 48, marginBottom: 12 },
  emptyText: { fontSize: 18, color: '#fff', fontWeight: 'bold', marginBottom: 8 },
  emptySubtext: { fontSize: 13, color: '#b0d4f1', textAlign: 'center' },
  card: {
    width: '100%', backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 16, marginBottom: 12,
    flexDirection: 'row', alignItems: 'center',
    overflow: 'hidden',
  },
  colorBar: { width: 6, alignSelf: 'stretch' },
  emojiBox: {
    width: 52, height: 52, justifyContent: 'center',
    alignItems: 'center', marginHorizontal: 8,
  },
  emoji: { fontSize: 28 },
  cardContent: { flex: 1, paddingVertical: 12, paddingRight: 8 },
  cardActivity: { fontSize: 14, fontWeight: 'bold', color: '#fff', marginBottom: 2 },
  cardScore: { fontSize: 13, color: '#ffe082', marginBottom: 2 },
  cardDate: { fontSize: 11, color: '#b0d4f1', marginBottom: 2 },
  cardReflection: { fontSize: 11, color: '#b0d4f1', fontStyle: 'italic' },
  tapHint: { fontSize: 16, color: 'rgba(255,255,255,0.3)', marginRight: 12 },
  statsBox: {
    width: '100%', backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 16, padding: 16, marginTop: 8, marginBottom: 16,
  },
  statsTitle: { fontSize: 14, fontWeight: 'bold', color: '#fff', marginBottom: 12, textAlign: 'center' },
  statsRow: { flexDirection: 'row', justifyContent: 'space-around' },
  statItem: { alignItems: 'center' },
  statNumber: { fontSize: 28, fontWeight: 'bold', color: '#ffe082' },
  statLabel: { fontSize: 11, color: '#b0d4f1', textAlign: 'center', marginTop: 2 },
  backButton: {
    width: '100%', backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 25, paddingVertical: 14, alignItems: 'center',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)',
  },
  backButtonText: { fontSize: 14, color: '#fff', letterSpacing: 1 },
});