import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Video, ResizeMode } from 'expo-av';

const getGForceEffect = (gForce) => {
  const g = parseFloat(gForce);
  if (!g || g <= 0) return null;
  if (g < 1) return { label: 'Negligible effect', color: '#4caf50', emoji: '✅' };
  if (g < 5) return { label: 'No injury likely', color: '#4caf50', emoji: '✅' };
  if (g < 10) return { label: 'Possible bruising or strains', color: '#ffe082', emoji: '⚠️' };
  if (g < 30) return { label: 'Serious injuries possible (broken bones, concussions)', color: '#ff9800', emoji: '🦴' };
  if (g < 50) return { label: 'High risk of severe injury', color: '#f44336', emoji: '🚨' };
  return { label: 'Life-threatening injuries likely', color: '#b71c1c', emoji: '💀' };
};

const getDbRisk = (db) => {
  const d = parseFloat(db);
  if (!d || d <= 0) return null;
  if (d < 30)  return { label: 'No risk', color: '#4caf50', emoji: '✅' };
  if (d < 60)  return { label: 'Safe for long periods', color: '#4caf50', emoji: '✅' };
  if (d < 85)  return { label: 'Generally safe, long exposure can cause fatigue', color: '#ffe082', emoji: '⚠️' };
  if (d < 90)  return { label: 'Hearing damage possible after long exposure', color: '#ff9800', emoji: '🔶' };
  if (d < 100) return { label: 'Hearing damage likely after short exposure', color: '#ff9800', emoji: '🔶' };
  if (d < 110) return { label: 'Serious hearing damage in minutes', color: '#f44336', emoji: '🚨' };
  if (d < 120) return { label: 'Painful — immediate damage possible', color: '#f44336', emoji: '🚨' };
  if (d < 140) return { label: 'Immediate and severe hearing damage', color: '#b71c1c', emoji: '💀' };
  return { label: 'Instant, permanent hearing damage', color: '#b71c1c', emoji: '💀' };
};

export default function LeaderboardDetailScreen({ navigation, route }) {
  const { entry, teamName } = route?.params || {};

  if (!entry) return null;

  const RANK_COLORS = ['#FFD700', '#C0C0C0', '#CD7F32'];
  const getRankColor = (rank) => rank <= 3 ? RANK_COLORS[rank - 1] : '#d0e8ff';

  return (
    <LinearGradient colors={['#4a90d9', '#1a3a5c']} style={styles.gradient}>
      <ScrollView contentContainerStyle={styles.container}>

        {/* Profile Picture */}
        {entry.profilePictureUrl ? (
          <Image source={{ uri: entry.profilePictureUrl }} style={styles.detailAvatar} />
        ) : (
          <View style={styles.detailAvatarPlaceholder}>
            <Text style={styles.detailAvatarInitial}>
              {(entry.teamName || 'T')[0].toUpperCase()}
            </Text>
          </View>
        )}

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
            {entry.activityId === 1 ? 'Best Drop Time (ms)' :
             entry.activityId === 5 ? 'Final Grace Score' :
             entry.activityId === 6 ? 'Average Reaction Time (ms)' :
             entry.activityId === 7 ? 'Resting Breathing Rate (BPM)' :
             entry.activityId === 4 ? 'Stability Score' :
             entry.activityId === 3 ? 'Best Bend Angle (°)' :
             entry.activityId === 2 ? 'Loudest Sound Recorded (dB)' :
             'Score'}
          </Text>
          <Text style={styles.scoreNumber}>{entry.totalScore}</Text>
        </View>

        {/* Activity 1 — Parachute Results */}
        {entry.activityId === 1 && entry.bestDesign && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🏆 Best Parachute Design</Text>
            <View style={styles.resultRow}>
              <Text style={styles.resultName}>Design</Text>
              <View style={styles.resultRight}>
                <Text style={styles.resultScore}>{entry.bestDesign.design}</Text>
              </View>
            </View>
            <View style={styles.resultRow}>
              <Text style={styles.resultName}>Drop Time</Text>
              <View style={styles.resultRight}>
                <Text style={styles.resultScore}>{entry.bestDesign.dropTime}s</Text>
              </View>
            </View>
            <View style={styles.resultRow}>
              <Text style={styles.resultName}>Final Velocity</Text>
              <View style={styles.resultRight}>
                <Text style={styles.resultScore}>{entry.bestDesign.finalVelocity} m/s</Text>
              </View>
            </View>
            <View style={styles.resultRow}>
              <Text style={styles.resultName}>Acceleration</Text>
              <View style={styles.resultRight}>
                <Text style={styles.resultScore}>{entry.bestDesign.acceleration} m/s²</Text>
              </View>
            </View>
            <View style={styles.resultRow}>
              <Text style={styles.resultName}>Net Force</Text>
              <View style={styles.resultRight}>
                <Text style={styles.resultScore}>{entry.bestDesign.netForce} N</Text>
              </View>
            </View>
            <View style={styles.resultRow}>
              <Text style={styles.resultName}>Drag Force</Text>
              <View style={styles.resultRight}>
                <Text style={styles.resultScore}>{entry.bestDesign.dragForce} N</Text>
              </View>
            </View>
            <View style={styles.resultRow}>
              <Text style={styles.resultName}>G-Force</Text>
              <View style={styles.resultRight}>
                <Text style={styles.resultScore}>{entry.bestDesign.gForce} g</Text>
              </View>
            </View>
            {(() => {
              const effect = getGForceEffect(entry.bestDesign.gForce);
              return effect ? (
                <View style={styles.resultRow}>
                  <Text style={styles.resultName}>Likely Effect</Text>
                  <View style={[styles.resultRight, { flex: 1 }]}>
                    <Text style={[styles.resultScore, { color: effect.color, textAlign: 'right' }]}>
                      {effect.emoji} {effect.label}
                    </Text>
                  </View>
                </View>
              ) : null;
            })()}

            {/* Drop Location */}
            {entry.location && (
              <View style={styles.locationBox}>
                <Text style={styles.locationTitle}>📍 Drop Location</Text>
                <Text style={styles.locationAddress}>{entry.location.address}</Text>
                <Text style={styles.locationCoords}>
                  {entry.location.latitude?.toFixed(4)}, {entry.location.longitude?.toFixed(4)}
                </Text>
              </View>
            )}

            {/* Best drop video */}
            {entry.bestDesign.videoUrl ? (
              <View style={styles.videoBox}>
                <Text style={styles.videoTitle}>🎬 Best Drop Video</Text>
                <Video
                  source={{ uri: entry.bestDesign.videoUrl }}
                  style={styles.video}
                  useNativeControls
                  resizeMode={ResizeMode.CONTAIN}
                  shouldPlay={false}
                />
              </View>
            ) : (
              <View style={styles.noVideoBox}>
                <Text style={styles.noVideoText}>📹 No video recorded for this drop</Text>
              </View>
            )}
          </View>
        )}

        {/* Activity 2 — Sound Results */}
        {entry.activityId === 2 && entry.loudestSound && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🔊 Sound Results</Text>
            {entry.results?.map((r, i) => {
              const risk = getDbRisk(r.actualDb);
              return (
                <View key={i}>
                  <View style={styles.resultRow}>
                    <Text style={styles.resultName}>{r.emoji} {r.sound}</Text>
                    <View style={styles.resultRight}>
                      <Text style={styles.resultScore}>{r.actualDb} dB</Text>
                    </View>
                  </View>
                  {risk && (
                    <View style={[styles.resultRow, { marginTop: -4 }]}>
                      <Text style={styles.resultName}>Risk to Hearing</Text>
                      <View style={[styles.resultRight, { flex: 1 }]}>
                        <Text style={[styles.resultScore, { color: risk.color, textAlign: 'right' }]}>
                          {risk.emoji} {risk.label}
                        </Text>
                      </View>
                    </View>
                  )}
                </View>
              );
            })}
            {(() => {
              const risk = getDbRisk(entry.loudestSound?.actualDb);
              return risk ? (
                <View style={styles.riskSummaryBox}>
                  <Text style={styles.riskSummaryTitle}>
                    🔊 Loudest Recorded: {entry.loudestSound?.actualDb} dB
                  </Text>
                  <Text style={[styles.riskSummaryLabel, { color: risk.color }]}>
                    {risk.emoji} {risk.label}
                  </Text>
                </View>
              ) : null;
            })()}
          </View>
        )}

        {/* Activity 3 — Hand Fan Results */}
        {entry.activityId === 3 && entry.bestReading && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🪭 Best Reading</Text>
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
            {entry.bestReading.photoUrl ? (
              <View style={styles.photoProofBox}>
                <Text style={styles.photoProofTitle}>📸 Angle Proof Photo</Text>
                <Image
                  source={{ uri: entry.bestReading.photoUrl }}
                  style={styles.photoProof}
                  resizeMode="cover"
                />
              </View>
            ) : (
              <View style={styles.noVideoBox}>
                <Text style={styles.noVideoText}>📸 No photo taken for this reading</Text>
              </View>
            )}
            {entry.results && entry.results.some(r => r.photoUrl) && (
              <View style={{ marginTop: 12 }}>
                <Text style={styles.sectionTitle}>📸 All Reading Photos</Text>
                {entry.results.filter(r => r.photoUrl).map((r, i) => (
                  <View key={i} style={{ marginBottom: 12 }}>
                    <Text style={styles.resultName}>
                      {r.material} @ {r.distance} — {r.actualAngle}°
                    </Text>
                    <Image
                      source={{ uri: r.photoUrl }}
                      style={styles.photoProof}
                      resizeMode="cover"
                    />
                  </View>
                ))}
              </View>
            )}
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
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>← Back to Leaderboard</Text>
        </TouchableOpacity>

      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  container: { alignItems: 'center', paddingTop: 60, paddingBottom: 40, paddingHorizontal: 24 },
  detailAvatar: {
    width: 90, height: 90, borderRadius: 45,
    borderWidth: 3, borderColor: '#fff', marginBottom: 12,
  },
  detailAvatarPlaceholder: {
    width: 90, height: 90, borderRadius: 45,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 3, borderColor: '#fff', marginBottom: 12,
  },
  detailAvatarInitial: { fontSize: 36, fontWeight: 'bold', color: '#fff' },
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
  scoreLabel: { fontSize: 13, color: '#d0e8ff', marginBottom: 4, textAlign: 'center' },
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
  videoBox: { marginTop: 12, width: '100%' },
  videoTitle: { fontSize: 14, fontWeight: 'bold', color: '#fff', marginBottom: 8, textAlign: 'center' },
  video: { width: '100%', height: 220, borderRadius: 12, backgroundColor: '#000' },
  noVideoBox: {
    marginTop: 12, padding: 12,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12, alignItems: 'center',
  },
  noVideoText: { fontSize: 13, color: '#b0d4f1', fontStyle: 'italic' },
  photoProofBox: { marginTop: 12, width: '100%' },
  photoProofTitle: { fontSize: 14, fontWeight: 'bold', color: '#fff', marginBottom: 8, textAlign: 'center' },
  photoProof: { width: '100%', height: 200, borderRadius: 12, marginTop: 4 },
  riskSummaryBox: {
    marginTop: 12, padding: 12,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12, alignItems: 'center',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)',
  },
  riskSummaryTitle: { fontSize: 13, color: '#fff', fontWeight: 'bold', marginBottom: 4 },
  riskSummaryLabel: { fontSize: 13, fontWeight: 'bold', textAlign: 'center' },

  // Location
  locationBox: {
    marginTop: 12, marginBottom: 8, padding: 12,
    backgroundColor: 'rgba(76,175,80,0.1)',
    borderRadius: 12, alignItems: 'center',
    borderWidth: 1, borderColor: 'rgba(76,175,80,0.3)',
  },
  locationTitle: { fontSize: 13, fontWeight: 'bold', color: '#4caf50', marginBottom: 4 },
  locationAddress: { fontSize: 13, color: '#fff', textAlign: 'center', marginBottom: 2 },
  locationCoords: { fontSize: 11, color: '#b0d4f1' },

  reflectionText: { fontSize: 14, color: '#e0f0ff', fontStyle: 'italic', lineHeight: 22 },
  dateText: { fontSize: 12, color: 'rgba(255,255,255,0.4)', marginBottom: 24 },
  backButton: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 25, paddingVertical: 14, paddingHorizontal: 50,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)',
  },
  backButtonText: { fontSize: 14, color: '#fff', letterSpacing: 1 },
});