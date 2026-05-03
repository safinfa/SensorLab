import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function LeaderboardDetailScreen({ navigation, route }) {
  const { entry, teamName } = route?.params || {};

  if (!entry) return null;

  const RANK_COLORS = ['#FFD700', '#C0C0C0', '#CD7F32'];
  const getRankColor = (rank) => rank <= 3 ? RANK_COLORS[rank - 1] : '#d0e8ff';

  return (
    <LinearGradient colors={['#4a90d9', '#1a3a5c']} style={styles.gradient}>
      <ScrollView contentContainerStyle={styles.container}>

        {/* Rank Badge */}
        <View style={[styles.rankBadge, { borderColor: getRankColor(entry.rank) }]}>
          <Text style={[styles.rankText, { color: getRankColor(entry.rank) }]}>
            #{entry.rank}
          </Text>
        </View>

        {/* Team Info */}
        <Text style={styles.teamName}>{entry.teamName}</Text>
        <Text style={styles.activityName}>{entry.activityName}</Text>

        {/* Final Score */}
        <View style={styles.scoreBox}>
          <Text style={styles.scoreLabel}>Final Grace Score</Text>
          <Text style={styles.scoreNumber}>{entry.totalScore} / 100</Text>
        </View>

        {/* Movement Breakdown */}
        {entry.results && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Movement Breakdown</Text>
            {entry.results.map((r, i) => (
              <View key={i} style={styles.resultRow}>
                <Text style={styles.resultName}>{r.movement}</Text>
                <View style={styles.resultRight}>
                  <Text style={styles.resultScore}>{r.graceScore}/100</Text>
                  <Text style={styles.resultVibration}>vibration: {r.avgVibration}</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Prediction */}
        {entry.prediction ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Their Prediction</Text>
            <Text style={styles.reflectionText}>"{entry.prediction}"</Text>
          </View>
        ) : null}

        {/* Reflection / Comment */}
        {entry.reflection ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Their Reflection</Text>
            <Text style={styles.reflectionText}>"{entry.reflection}"</Text>
          </View>
        ) : null}

        {/* Date */}
        {entry.createdAt ? (
          <Text style={styles.dateText}>
            Submitted: {new Date(entry.createdAt).toLocaleDateString()}
          </Text>
        ) : null}

        {/* Back Button */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>← Back to Leaderboard</Text>
        </TouchableOpacity>

      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  container: { alignItems: 'center', paddingTop: 60, paddingBottom: 40, paddingHorizontal: 24 },
  rankBadge: {
    width: 80, height: 80, borderRadius: 40,
    borderWidth: 3, justifyContent: 'center', alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)', marginBottom: 16,
  },
  rankText: { fontSize: 28, fontWeight: 'bold' },
  teamName: { fontSize: 24, fontWeight: 'bold', color: '#fff', marginBottom: 4, textAlign: 'center' },
  activityName: { fontSize: 13, color: '#d0e8ff', marginBottom: 24, textAlign: 'center' },
  scoreBox: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 20, padding: 20,
    alignItems: 'center', width: '100%', marginBottom: 20,
  },
  scoreLabel: { fontSize: 13, color: '#d0e8ff', marginBottom: 4 },
  scoreNumber: { fontSize: 48, fontWeight: 'bold', color: '#ffe082' },
  section: {
    width: '100%', backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 16, padding: 16, marginBottom: 16,
  },
  sectionTitle: { fontSize: 14, fontWeight: 'bold', color: '#fff', marginBottom: 10 },
  resultRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 8,
    paddingBottom: 8, borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  resultName: { fontSize: 13, color: '#d0e8ff' },
  resultRight: { alignItems: 'flex-end' },
  resultScore: { fontSize: 14, fontWeight: 'bold', color: '#ffe082' },
  resultVibration: { fontSize: 11, color: '#b0d4f1' },
  reflectionText: { fontSize: 14, color: '#e0f0ff', fontStyle: 'italic', lineHeight: 22 },
  dateText: { fontSize: 12, color: 'rgba(255,255,255,0.4)', marginBottom: 24 },
  backButton: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 25, paddingVertical: 14, paddingHorizontal: 50,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)',
  },
  backButtonText: { fontSize: 14, color: '#fff', letterSpacing: 1 },
});