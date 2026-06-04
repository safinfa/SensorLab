import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image } from 'react-native';
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
          <Text style={styles.scoreLabel}>
            {entry.activityId === 5 ? 'Final Grace Score' : 'Average Reaction Time (ms)'}
          </Text>
          <Text style={styles.scoreNumber}>{entry.totalScore}</Text>
        </View>

        {/* Activity 2 — Sound Results */}
        {entry.activityId === 2 && entry.loudestSound && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Sound Results</Text>
            {entry.results?.map((r, i) => (
              <View key={i} style={styles.resultRow}>
                <Text style={styles.resultName}>{r.emoji} {r.sound}</Text>
                <View style={styles.resultRight}>
                  <Text style={styles.resultScore}>{r.actualDb} dB</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Activity 3 — Hand Fan Results */}
        {entry.activityId === 3 && entry.bestReading && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Best Reading</Text>
            <View style={styles.resultRow}>
              <Text style={styles.resultName}>Fan Design</Text>
              <View style={styles.resultRight}>
                <Text style={styles.resultScore}>{entry.bestReading.design}</Text>
              </View>
            </View>
            <View style={styles.resultRow}>
              <Text style={styles.resultName}>Material</Text>
              <View style={styles.resultRight}>
                <Text style={styles.resultScore}>{entry.bestReading.material}</Text>
              </View>
            </View>
            <View style={styles.resultRow}>
              <Text style={styles.resultName}>Distance</Text>
              <View style={styles.resultRight}>
                <Text style={styles.resultScore}>{entry.bestReading.distance}</Text>
              </View>
            </View>
            <View style={styles.resultRow}>
              <Text style={styles.resultName}>Bend Angle</Text>
              <View style={styles.resultRight}>
                <Text style={styles.resultScore}>{entry.bestReading.actualAngle}°</Text>
              </View>
            </View>
            <View style={styles.resultRow}>
              <Text style={styles.resultName}>Estimated Force</Text>
              <View style={styles.resultRight}>
                <Text style={styles.resultScore}>{entry.bestReading.estimatedForce} N</Text>
              </View>
            </View>
          </View>
        )}

        {/* Activity 4 — Earthquake Results */}
        {entry.activityId === 4 && entry.bestRound && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Best Round Results</Text>
            <View style={styles.resultRow}>
              <Text style={styles.resultName}>Round</Text>
              <View style={styles.resultRight}>
                <Text style={styles.resultScore}>Round {entry.bestRound.round}</Text>
              </View>
            </View>
            <View style={styles.resultRow}>
              <Text style={styles.resultName}>Distance Moved</Text>
              <View style={styles.resultRight}>
                <Text style={styles.resultScore}>{entry.bestRound.distanceMoved} cm</Text>
              </View>
            </View>
            <View style={styles.resultRow}>
              <Text style={styles.resultName}>Peak Shake</Text>
              <View style={styles.resultRight}>
                <Text style={styles.resultScore}>{entry.bestRound.maxShake}</Text>
              </View>
            </View>
            {entry.bestRound.beforePhotoUrl && (
              <View>
                <Text style={styles.sectionTitle}>Photos</Text>
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  <Image source={{ uri: entry.bestRound.beforePhotoUrl }} style={{ width: '48%', height: 100, borderRadius: 10 }} />
                  <Image source={{ uri: entry.bestRound.afterPhotoUrl }} style={{ width: '48%', height: 100, borderRadius: 10 }} />
                </View>
                <Text style={{ fontSize: 11, color: '#b0d4f1', textAlign: 'center', marginTop: 4 }}>Before / After</Text>
              </View>
            )}
          </View>
        )}

        {/* Activity 5 — Movement Breakdown */}
        {entry.activityId === 5 && entry.results && (
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

        {/* Activity 6 — Phase Breakdown */}
        {entry.activityId === 6 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Phase Breakdown</Text>
            <View style={styles.resultRow}>
              <Text style={styles.resultName}>Phase 1 — Dominant Hand</Text>
              <View style={styles.resultRight}>
                <Text style={styles.resultScore}>{entry.avgPhase1} ms</Text>
              </View>
            </View>
            <View style={styles.resultRow}>
              <Text style={styles.resultName}>Phase 2 — Non-Dominant Hand</Text>
              <View style={styles.resultRight}>
                <Text style={styles.resultScore}>{entry.avgPhase2} ms</Text>
              </View>
            </View>
            <View style={styles.resultRow}>
              <Text style={styles.resultName}>Phase 3 — Tracing Accuracy</Text>
              <View style={styles.resultRight}>
                <Text style={styles.resultScore}>{entry.avgPhase3}%</Text>
              </View>
            </View>
          </View>
        )}

        {/* Activity 7 — Breathing Breakdown */}
        {entry.activityId === 7 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Breathing Results</Text>
            <View style={styles.resultRow}>
              <Text style={styles.resultName}>😌 At Rest</Text>
              <View style={styles.resultRight}>
                <Text style={styles.resultScore}>{entry.results?.rest} BPM</Text>
              </View>
            </View>
            <View style={styles.resultRow}>
              <Text style={styles.resultName}>🏃 After Jogging</Text>
              <View style={styles.resultRight}>
                <Text style={styles.resultScore}>{entry.results?.afterExercise1} BPM</Text>
              </View>
            </View>
            <View style={styles.resultRow}>
              <Text style={styles.resultName}>⭐ After Star Jumps</Text>
              <View style={styles.resultRight}>
                <Text style={styles.resultScore}>{entry.results?.afterExercise2} BPM</Text>
              </View>
            </View>
          </View>
        )}

        {/* Prediction */}
        {entry.prediction ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Their Prediction</Text>
            <Text style={styles.reflectionText}>"{entry.prediction}"</Text>
          </View>
        ) : null}

        {/* Reflection */}
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
  resultName: { fontSize: 13, color: '#d0e8ff', flex: 1, flexWrap: 'wrap' },
  resultRight: { alignItems: 'flex-end', marginLeft: 8 },
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