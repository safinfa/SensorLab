import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Modal, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { useState, useEffect } from 'react';

const ACTIVITIES = [
  { id: 1, name: 'Parachute Drop Challenge' },
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
  const [dropdownOpen, setDropdownOpen] = useState(false);

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

  const getScoreLabel = (entry) => {
    switch (selectedActivity) {
      case 1: return `Best Drop Time: ${entry.totalScore}ms`;
      case 2: return `Loudest: ${entry.totalScore} dB`;
      case 3: return `Best Bend: ${entry.totalScore}°`;
      case 4: return `Stability Score: ${entry.totalScore}`;
      case 5: return `Grace Score: ${entry.totalScore} / 100`;
      case 6: return `Avg Reaction: ${entry.totalScore} ms`;
      case 7: return `Resting Rate: ${entry.totalScore} BPM`;
      default: return `Score: ${entry.totalScore}`;
    }
  };

  const selectedActivityName = ACTIVITIES.find(a => a.id === selectedActivity)?.name || '';

  return (
    <LinearGradient colors={['#4a90d9', '#1a3a5c']} style={styles.gradient}>
      <ScrollView contentContainerStyle={styles.container}>

        <Image source={require('../assets/logo.png')} style={styles.logo} resizeMode="contain" />
        <Text style={styles.title}>🏆 Leaderboard</Text>
        <Text style={styles.subtitle}>See where you are today!</Text>

        {/* Dropdown */}
        <TouchableOpacity
          style={styles.dropdownButton}
          onPress={() => setDropdownOpen(true)}
          activeOpacity={0.8}
        >
          <Text style={styles.dropdownButtonText}>{selectedActivityName}</Text>
          <Text style={styles.dropdownArrow}>▼</Text>
        </TouchableOpacity>

        {/* Dropdown Modal */}
        <Modal
          visible={dropdownOpen}
          transparent
          animationType="fade"
          onRequestClose={() => setDropdownOpen(false)}
        >
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setDropdownOpen(false)}
          >
            <View style={styles.dropdownList}>
              <Text style={styles.dropdownListTitle}>Select Activity</Text>
              {ACTIVITIES.map((act) => (
                <TouchableOpacity
                  key={act.id}
                  style={[styles.dropdownItem, selectedActivity === act.id && styles.dropdownItemActive]}
                  onPress={() => {
                    setSelectedActivity(act.id);
                    setDropdownOpen(false);
                  }}
                >
                  <Text style={[styles.dropdownItemText, selectedActivity === act.id && styles.dropdownItemTextActive]}>
                    {act.id}. {act.name}
                  </Text>
                  {selectedActivity === act.id && <Text style={styles.dropdownCheck}>✓</Text>}
                </TouchableOpacity>
              ))}
            </View>
          </TouchableOpacity>
        </Modal>

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
            {/* Rank */}
            <View style={styles.rankBox}>
              <Text style={[styles.rankText, { color: getRankColor(entry.rank) }]}>
                {getRankEmoji(entry.rank)}
              </Text>
            </View>

            {/* Profile Picture */}
            {entry.profilePictureUrl ? (
              <Image source={{ uri: entry.profilePictureUrl }} style={styles.cardAvatar} />
            ) : (
              <View style={styles.cardAvatarPlaceholder}>
                <Text style={styles.cardAvatarInitial}>
                  {(entry.teamName || 'T')[0].toUpperCase()}
                </Text>
              </View>
            )}

            {/* Content */}
            <View style={styles.cardContent}>
              <Text style={styles.cardTeam}>{entry.teamName}</Text>
              <Text style={styles.cardScore}>{getScoreLabel(entry)}</Text>
              {entry.reflection ? (
                <Text style={styles.cardComment} numberOfLines={1}>
                  💬 "{entry.reflection}"
                </Text>
              ) : null}
            </View>

            <Text style={styles.tapHint}>tap →</Text>
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
  dropdownButton: {
    width: '100%', backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 16, paddingVertical: 14, paddingHorizontal: 20,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)',
  },
  dropdownButtonText: { fontSize: 15, color: '#fff', fontWeight: 'bold', flex: 1 },
  dropdownArrow: { fontSize: 12, color: '#d0e8ff', marginLeft: 8 },
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center', alignItems: 'center', paddingHorizontal: 24,
  },
  dropdownList: {
    width: '100%', backgroundColor: '#1a3a5c',
    borderRadius: 20, overflow: 'hidden',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)',
  },
  dropdownListTitle: {
    fontSize: 13, color: '#b0d4f1', fontWeight: 'bold',
    textAlign: 'center', paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.1)',
    letterSpacing: 1, textTransform: 'uppercase',
  },
  dropdownItem: {
    paddingVertical: 14, paddingHorizontal: 20,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.08)',
  },
  dropdownItemActive: { backgroundColor: 'rgba(255,255,255,0.15)' },
  dropdownItemText: { fontSize: 14, color: '#d0e8ff', flex: 1 },
  dropdownItemTextActive: { color: '#fff', fontWeight: 'bold' },
  dropdownCheck: { fontSize: 16, color: '#4caf50', marginLeft: 8 },
  emptyBox: { marginTop: 40, alignItems: 'center' },
  emptyText: { fontSize: 18, color: '#fff', fontWeight: 'bold', marginBottom: 8 },
  emptySubtext: { fontSize: 13, color: '#d0e8ff' },
  card: {
    width: '100%', backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 16, padding: 12, marginBottom: 12,
    flexDirection: 'row', alignItems: 'center',
  },
  rankBox: { width: 36, alignItems: 'center', marginRight: 8 },
  rankText: { fontSize: 20, fontWeight: 'bold' },
  cardAvatar: {
    width: 44, height: 44, borderRadius: 22,
    marginRight: 10, borderWidth: 2, borderColor: 'rgba(255,255,255,0.4)',
  },
  cardAvatarPlaceholder: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center', alignItems: 'center',
    marginRight: 10, borderWidth: 2, borderColor: 'rgba(255,255,255,0.3)',
  },
  cardAvatarInitial: { fontSize: 18, fontWeight: 'bold', color: '#fff' },
  cardContent: { flex: 1 },
  cardTeam: { fontSize: 14, fontWeight: 'bold', color: '#fff', marginBottom: 2 },
  cardScore: { fontSize: 12, color: '#ffe082', marginBottom: 2 },
  cardComment: { fontSize: 11, color: '#b0d4f1', fontStyle: 'italic' },
  tapHint: { fontSize: 11, color: 'rgba(255,255,255,0.4)', marginLeft: 4 },
  backButton: {
    marginTop: 20, backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 25, paddingVertical: 14, paddingHorizontal: 50,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)',
  },
  backButtonText: { fontSize: 14, color: '#fff', letterSpacing: 1 },
});