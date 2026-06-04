import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'react-native';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { useState, useEffect } from 'react';

const ACTIVITIES = [
  { id: 2, name: 'Sound Pollution Hunter' },
  { id: 3, name: 'Hand Fan Challenge' },
  { id: 4, name: 'Earthquake Resistant Structure' },
  { id: 5, name: 'Stretch Speed & Gracefulness' },
  { id: 6, name: 'Reaction Board Challenge' },
  { id: 7, name: 'Breathing Pace Trainer' },
];

const RANK_COLORS = ['#FFD700', '#C0C0C0', '#CD7F32'];
const RANK_EMOJI = ['🥇', '🥈', '🥉'];

export default function LeaderboardScreen({ navigation, route }) {
  const { teamName } = route?.params || {};
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedActivity, setSelectedActivity] = useState(5);

  useEffect(() => {
    fetchLeaderboard();
  }, [selectedActivity]);

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      const q = query(
        collection(db, 'leaderboard'),
        where('activityId', '==', selectedActivity),
        orderBy('totalScore', 'desc')
      );
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map((doc, index) => ({
        id: doc.id,
        rank: index + 1,
        ...doc.data(),
      }));
      setEntries(data);
    } catch (error) {
      console.error('Leaderboard fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRankColor = (rank) => {
    if (rank <= 3) return RANK_COLORS[rank - 1];
    return '#d0e8ff';
  };

  const getRankEmoji = (rank) => {
    if (rank <= 3) return RANK_EMOJI[rank - 1];
    return `#${rank}`;
  };

  return (
    <LinearGradient colors={['#4a90d9', '#1a3a5c']} style={styles.gradient}>
      <ScrollView contentContainerStyle={styles.container}>

        {/* Logo */}
        <Image source={require('../assets/logo.png')} style={styles.logo} resizeMode="contain" />

        <Text style={styles.title}>🏆 Leaderboard</Text>
        <Text style={styles.subtitle}>See where you are today!</Text>

        {/* Activity Selector */}
        <View style={styles.selectorBox}>
          {ACTIVITIES.map((act) => (
            <TouchableOpacity
              key={act.id}
              style={[styles.selectorBtn, selectedActivity === act.id && styles.selectorBtnActive]}
              onPress={() => setSelectedActivity(act.id)}
            >
              <Text style={[styles.selectorText, selectedActivity === act.id && styles.selectorTextActive]}>
                {act.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Loading */}
        {loading && <ActivityIndicator color="#fff" size="large" style={{ marginTop: 40 }} />}

        {/* Empty State */}
        {!loading && entries.length === 0 && (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyText}>No entries yet!</Text>
            <Text style={styles.emptySubtext}>Be the first to complete this activity.</Text>
          </View>
        )}

        {/* Leaderboard Entries */}
        {!loading && entries.map((entry) => (
          <TouchableOpacity
            key={entry.id}
            style={[styles.card, entry.rank <= 3 && { borderColor: getRankColor(entry.rank), borderWidth: 2 }]}
            onPress={() => navigation.navigate('LeaderboardDetail', { entry, teamName })}
            activeOpacity={0.75}
          >
            <View style={styles.rankBox}>
              <Text style={[styles.rankText, { color: getRankColor(entry.rank) }]}>
                {getRankEmoji(entry.rank)}
              </Text>
            </View>
            <View style={styles.cardContent}>
              <Text style={styles.cardTeam}>{entry.teamName}</Text>
              <Text style={styles.cardScore}>Score: {entry.totalScore} / 100</Text>
              {entry.reflection ? (
                <Text style={styles.cardComment} numberOfLines={2}>
                  💬 "{entry.reflection}"
                </Text>
              ) : null}
            </View>
            <Text style={styles.tapHint}>tap to expand →</Text>
          </TouchableOpacity>
        ))}

        {/* Back Button */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.navigate('Home', { teamName })}
        >
          <Text style={styles.backButtonText}>Back to Home</Text>
        </TouchableOpacity>

      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  container: { alignItems: 'center', paddingTop: 50, paddingBottom: 40, paddingHorizontal: 20 },
  logo: { width: 150, height: 100, marginBottom: 8 },
  title: { fontSize: 26, fontWeight: 'bold', color: '#fff', marginBottom: 4 },
  subtitle: { fontSize: 13, color: '#d0e8ff', marginBottom: 20 },
  selectorBox: {
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 16,
    padding: 12,
    marginBottom: 20,
  },
  selectorBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 4,
  },
  selectorBtnActive: {
    backgroundColor: 'rgba(255,255,255,0.25)',
  },
  selectorText: { fontSize: 13, color: '#b0d4f1', textAlign: 'center' },
  selectorTextActive: { color: '#fff', fontWeight: 'bold' },
  emptyBox: { marginTop: 40, alignItems: 'center' },
  emptyText: { fontSize: 18, color: '#fff', fontWeight: 'bold', marginBottom: 8 },
  emptySubtext: { fontSize: 13, color: '#d0e8ff' },
  card: {
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  rankBox: { width: 48, alignItems: 'center', marginRight: 12 },
  rankText: { fontSize: 22, fontWeight: 'bold' },
  cardContent: { flex: 1 },
  cardTeam: { fontSize: 15, fontWeight: 'bold', color: '#fff', marginBottom: 2 },
  cardScore: { fontSize: 13, color: '#ffe082', marginBottom: 4 },
  cardComment: { fontSize: 12, color: '#b0d4f1', fontStyle: 'italic' },
  tapHint: { fontSize: 11, color: 'rgba(255,255,255,0.4)', marginLeft: 8 },
  backButton: {
    marginTop: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 25,
    paddingVertical: 14,
    paddingHorizontal: 50,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  backButtonText: { fontSize: 14, color: '#fff', letterSpacing: 1 },
});