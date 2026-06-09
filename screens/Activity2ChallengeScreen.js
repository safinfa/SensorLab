import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Audio } from 'expo-av';
import * as Haptics from 'expo-haptics';
import { useState, useEffect, useRef } from 'react';

const SOUNDS = [
  { id: 1, name: 'Dropping a Book', emoji: '📚', instruction: 'Place your phone nearby and drop a book on the table.' },
  { id: 2, name: 'Talking Normally', emoji: '🗣️', instruction: 'Speak in your normal talking voice towards the phone.' },
  { id: 3, name: 'Walking', emoji: '👟', instruction: 'Walk normally past the phone for 3 seconds.' },
  { id: 4, name: 'Stamping', emoji: '🦶', instruction: 'Stamp your foot firmly on the floor near the phone.' },
];

const RECORD_DURATION = 3000;

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

export default function Activity2ChallengeScreen({ navigation, route }) {
  const { teamName, prediction } = route?.params || {};

  const [currentSound, setCurrentSound] = useState(0);
  const [phase, setPhase] = useState('predict');
  const [predictedDb, setPredictedDb] = useState('');
  const [currentDb, setCurrentDb] = useState(0);
  const [peakDb, setPeakDb] = useState(0);
  const [results, setResults] = useState([]);
  const [countdown, setCountdown] = useState(3);

  const recordingRef = useRef(null);
  const meteringIntervalRef = useRef(null);
  const countdownRef = useRef(null);
  const peakDbRef = useRef(0);
  const resultsRef = useRef([]);

  useEffect(() => {
    Audio.requestPermissionsAsync();
    return () => {
      stopRecording();
      clearInterval(meteringIntervalRef.current);
      clearInterval(countdownRef.current);
    };
  }, []);

  const convertToDb = (metering) => {
    if (metering === undefined || metering === null) return 0;
    const normalized = Math.max(0, metering + 160);
    const scaled = Math.pow(normalized / 160, 3) * 100;
    return Math.min(120, Math.round(scaled));
  };

  const getDbColor = (db) => {
    if (db < 40) return '#4caf50';
    if (db < 70) return '#ffeb3b';
    if (db < 90) return '#ff9800';
    return '#f44336';
  };

  const getDbLabel = (db) => {
    if (db < 40) return '🤫 Very Quiet';
    if (db < 70) return '🗣️ Normal';
    if (db < 90) return '📢 Loud';
    return '🔴 Very Loud!';
  };

  const startCountdown = () => {
    setPhase('ready');
    setCountdown(3);
    let count = 3;
    countdownRef.current = setInterval(() => {
      count -= 1;
      setCountdown(count);
      if (count === 0) {
        clearInterval(countdownRef.current);
        startRecording();
      }
    }, 1000);
  };

  const startRecording = async () => {
    try {
      setPhase('recording');
      peakDbRef.current = 0;
      setPeakDb(0);
      setCurrentDb(0);
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });
      const { recording } = await Audio.Recording.createAsync({
        ...Audio.RecordingOptionsPresets.HIGH_QUALITY,
        isMeteringEnabled: true,
      });
      recordingRef.current = recording;
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      meteringIntervalRef.current = setInterval(async () => {
        if (recordingRef.current) {
          const status = await recordingRef.current.getStatusAsync();
          if (status.metering !== undefined) {
            const db = convertToDb(status.metering);
            setCurrentDb(db);
            if (db > peakDbRef.current) {
              peakDbRef.current = db;
              setPeakDb(db);
            }
          }
        }
      }, 100);
      setTimeout(() => { stopRecording(); }, RECORD_DURATION);
    } catch (error) {
      Alert.alert('Microphone Error', 'Could not access microphone. Please allow microphone permission.');
      setPhase('predict');
    }
  };

  const stopRecording = async () => {
    clearInterval(meteringIntervalRef.current);
    if (recordingRef.current) {
      try {
        await recordingRef.current.stopAndUnloadAsync();
        recordingRef.current = null;
      } catch (e) {}
    }
    const finalPeak = peakDbRef.current;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setPeakDb(finalPeak);
    setPhase('result');
  };

  const saveAndNext = () => {
    const result = {
      sound: SOUNDS[currentSound].name,
      emoji: SOUNDS[currentSound].emoji,
      predictedDb: parseFloat(predictedDb) || 0,
      actualDb: peakDbRef.current,
      notes: getDbLabel(peakDbRef.current),
    };
    const newResults = [...resultsRef.current, result];
    resultsRef.current = newResults;
    setResults(newResults);
    setPredictedDb('');
    setPeakDb(0);
    peakDbRef.current = 0;
    setCurrentDb(0);
    if (currentSound + 1 < SOUNDS.length) {
      setCurrentSound(prev => prev + 1);
      setPhase('predict');
    } else {
      setPhase('done');
    }
  };

  return (
    <LinearGradient colors={['#4a90d9', '#1a3a5c']} style={styles.gradient}>
      <ScrollView contentContainerStyle={styles.container} scrollEnabled={phase === 'done'}>

        {/* PREDICT PHASE */}
        {phase === 'predict' && (
          <View style={styles.centeredBox}>
            <Text style={styles.progress}>Sound {currentSound + 1} of {SOUNDS.length}</Text>
            <View style={styles.progressBarBg}>
              <View style={[styles.progressBarFill, { width: `${((currentSound) / SOUNDS.length) * 100}%` }]} />
            </View>
            <Text style={styles.soundEmoji}>{SOUNDS[currentSound].emoji}</Text>
            <Text style={styles.title}>{SOUNDS[currentSound].name}</Text>
            <Text style={styles.instruction}>{SOUNDS[currentSound].instruction}</Text>
            <Text style={styles.label}>Your Predicted dB Level:</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. 60"
              placeholderTextColor="#aaa"
              value={predictedDb}
              onChangeText={setPredictedDb}
              keyboardType="numeric"
            />
            <TouchableOpacity style={styles.button} onPress={startCountdown}>
              <Text style={styles.buttonText}>Start Recording</Text>
            </TouchableOpacity>
            {resultsRef.current.length > 0 && (
              <View style={styles.prevBox}>
                <Text style={styles.prevTitle}>Previous Results:</Text>
                {resultsRef.current.map((r, i) => (
                  <Text key={i} style={styles.prevItem}>
                    {r.emoji} {r.sound}: {r.actualDb} dB
                  </Text>
                ))}
              </View>
            )}
          </View>
        )}

        {/* READY PHASE */}
        {phase === 'ready' && (
          <View style={styles.centeredBox}>
            <Text style={styles.title}>{SOUNDS[currentSound].name}</Text>
            <Text style={styles.instruction}>{SOUNDS[currentSound].instruction}</Text>
            <Text style={styles.countdownNumber}>{countdown === 0 ? 'GO!' : countdown}</Text>
            <Text style={styles.subtitle}>Get ready to make the sound!</Text>
          </View>
        )}

        {/* RECORDING PHASE */}
        {phase === 'recording' && (
          <View style={styles.centeredBox}>
            <Text style={styles.title}>🎙️ Recording...</Text>
            <Text style={styles.instruction}>{SOUNDS[currentSound].instruction}</Text>
            <Text style={styles.soundEmoji}>{SOUNDS[currentSound].emoji}</Text>
            <View style={styles.meterBox}>
              <Text style={styles.meterLabel}>Live dB Level</Text>
              <View style={styles.meterBarBg}>
                <View style={[styles.meterBarFill, {
                  width: `${Math.min(100, currentDb)}%`,
                  backgroundColor: getDbColor(currentDb),
                }]} />
              </View>
              <Text style={[styles.meterValue, { color: getDbColor(currentDb) }]}>
                {currentDb} dB — {getDbLabel(currentDb)}
              </Text>
            </View>
            <Text style={styles.peakText}>Peak: {peakDb} dB</Text>
          </View>
        )}

        {/* RESULT PHASE */}
        {phase === 'result' && (
          <View style={styles.centeredBox}>
            <Text style={styles.title}>✅ Recording Complete!</Text>
            <Text style={styles.soundEmoji}>{SOUNDS[currentSound].emoji}</Text>
            <Text style={styles.soundName}>{SOUNDS[currentSound].name}</Text>
            <View style={styles.resultBox}>
              <View style={styles.resultRow}>
                <Text style={styles.resultLabel}>Your Prediction</Text>
                <Text style={styles.resultValue}>{predictedDb || '?'} dB</Text>
              </View>
              <View style={styles.resultRow}>
                <Text style={styles.resultLabel}>Actual Peak</Text>
                <Text style={[styles.resultValue, { color: getDbColor(peakDb) }]}>{peakDb} dB</Text>
              </View>
              <View style={styles.resultRow}>
                <Text style={styles.resultLabel}>Level</Text>
                <Text style={styles.resultValue}>{getDbLabel(peakDb)}</Text>
              </View>
              {/* Risk to Hearing */}
              {(() => {
                const risk = getDbRisk(peakDb);
                return risk ? (
                  <View style={styles.resultRow}>
                    <Text style={styles.resultLabel}>Risk to Hearing</Text>
                    <Text style={[styles.resultValue, { color: risk.color, flex: 1, textAlign: 'right' }]}>
                      {risk.emoji} {risk.label}
                    </Text>
                  </View>
                ) : null;
              })()}
            </View>
            <TouchableOpacity style={styles.button} onPress={saveAndNext}>
              <Text style={styles.buttonText}>
                {currentSound + 1 < SOUNDS.length ? 'Next Sound →' : 'See Results'}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* DONE PHASE */}
        {phase === 'done' && (
          <View style={styles.centeredBox}>
            <Text style={styles.title}>🎉 All Done!</Text>
            <Text style={styles.subtitle}>Here are your sound measurements:</Text>

            {resultsRef.current.length > 0 && (() => {
              const loudest = resultsRef.current.reduce((max, r) => r.actualDb > max.actualDb ? r : max, resultsRef.current[0]);
              const risk = getDbRisk(loudest.actualDb);
              return (
                <View style={styles.loudestCard}>
                  <Text style={styles.loudestTitle}>🏆 Loudest Sound</Text>
                  <Text style={styles.loudestValue}>{loudest.emoji} {loudest.sound}</Text>
                  <Text style={styles.loudestDb}>{loudest.actualDb} dB</Text>
                  {risk && (
                    <Text style={[styles.loudestRisk, { color: risk.color }]}>
                      {risk.emoji} {risk.label}
                    </Text>
                  )}
                </View>
              );
            })()}

            {resultsRef.current.map((r, i) => {
              const risk = getDbRisk(r.actualDb);
              return (
                <View key={i} style={styles.summaryCard}>
                  <Text style={styles.summaryTitle}>{r.emoji} {r.sound}</Text>
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Predicted:</Text>
                    <Text style={styles.summaryValue}>{r.predictedDb} dB</Text>
                  </View>
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Actual:</Text>
                    <Text style={[styles.summaryValue, { color: getDbColor(r.actualDb) }]}>{r.actualDb} dB</Text>
                  </View>
                  <View style={styles.meterBarBg}>
                    <View style={[styles.meterBarFill, {
                      width: `${Math.min(100, r.actualDb)}%`,
                      backgroundColor: getDbColor(r.actualDb),
                    }]} />
                  </View>
                  {risk && (
                    <View style={styles.riskBox}>
                      <Text style={[styles.riskText, { color: risk.color }]}>
                        {risk.emoji} {risk.label}
                      </Text>
                    </View>
                  )}
                </View>
              );
            })}

            <TouchableOpacity
              style={styles.button}
              onPress={() => navigation.navigate('Activity2Reflection', {
                teamName, prediction, results: resultsRef.current,
              })}
            >
              <Text style={styles.buttonText}>Continue to Reflection</Text>
            </TouchableOpacity>
          </View>
        )}

      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  container: { flexGrow: 1, paddingTop: 60, paddingBottom: 40, paddingHorizontal: 24 },
  centeredBox: { width: '100%', alignItems: 'center' },
  progress: { fontSize: 13, color: '#ffe082', fontWeight: 'bold', marginBottom: 8 },
  progressBarBg: {
    width: '100%', height: 6, backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 3, overflow: 'hidden', marginBottom: 24,
  },
  progressBarFill: { height: '100%', backgroundColor: '#4caf50', borderRadius: 3 },
  soundEmoji: { fontSize: 60, marginBottom: 12 },
  title: { fontSize: 22, fontWeight: 'bold', color: '#fff', marginBottom: 8, textAlign: 'center' },
  subtitle: { fontSize: 14, color: '#d0e8ff', marginBottom: 16, textAlign: 'center' },
  soundName: { fontSize: 16, color: '#d0e8ff', marginBottom: 16 },
  instruction: { fontSize: 14, color: '#e0f0ff', textAlign: 'center', marginBottom: 20, lineHeight: 22 },
  label: { fontSize: 13, fontWeight: '600', color: '#e0f0ff', marginBottom: 8, alignSelf: 'flex-start' },
  input: {
    width: '100%', backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 16, padding: 14, fontSize: 14, color: '#fff',
    marginBottom: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)',
  },
  countdownNumber: { fontSize: 80, fontWeight: 'bold', color: '#ffe082', marginVertical: 20 },
  meterBox: { width: '100%', alignItems: 'center', marginBottom: 16 },
  meterLabel: { fontSize: 14, color: '#d0e8ff', marginBottom: 8 },
  meterBarBg: {
    width: '100%', height: 24, backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 12, overflow: 'hidden', marginBottom: 8,
  },
  meterBarFill: { height: '100%', borderRadius: 12 },
  meterValue: { fontSize: 16, fontWeight: 'bold' },
  peakText: { fontSize: 18, fontWeight: 'bold', color: '#ffe082', marginBottom: 8 },
  resultBox: {
    width: '100%', backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 16, padding: 16, marginBottom: 20,
  },
  resultRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    paddingVertical: 8, borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  resultLabel: { fontSize: 13, color: '#d0e8ff' },
  resultValue: { fontSize: 14, fontWeight: 'bold', color: '#fff' },
  loudestCard: {
    width: '100%', backgroundColor: 'rgba(255,215,0,0.15)',
    borderRadius: 20, padding: 20, alignItems: 'center',
    marginBottom: 16, borderWidth: 2, borderColor: '#FFD700',
  },
  loudestTitle: { fontSize: 14, fontWeight: 'bold', color: '#FFD700', marginBottom: 4 },
  loudestValue: { fontSize: 18, color: '#fff', marginBottom: 4 },
  loudestDb: { fontSize: 36, fontWeight: 'bold', color: '#ffe082', marginBottom: 8 },
  loudestRisk: { fontSize: 13, fontWeight: 'bold', textAlign: 'center' },
  summaryCard: {
    width: '100%', backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 16, padding: 16, marginBottom: 12,
  },
  summaryTitle: { fontSize: 15, fontWeight: 'bold', color: '#fff', marginBottom: 8 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  summaryLabel: { fontSize: 13, color: '#d0e8ff' },
  summaryValue: { fontSize: 13, fontWeight: 'bold', color: '#ffe082' },
  riskBox: {
    marginTop: 8, padding: 8,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 8, alignItems: 'center',
  },
  riskText: { fontSize: 12, fontWeight: 'bold', textAlign: 'center' },
  prevBox: {
    width: '100%', backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 16, padding: 14, marginTop: 20,
  },
  prevTitle: { fontSize: 13, fontWeight: 'bold', color: '#fff', marginBottom: 8 },
  prevItem: { fontSize: 12, color: '#b0d4f1', marginBottom: 4 },
  button: {
    backgroundColor: 'rgba(255,255,255,0.85)', borderRadius: 25,
    paddingVertical: 14, paddingHorizontal: 50, alignItems: 'center', marginTop: 8,
  },
  buttonText: { fontSize: 15, fontWeight: 'bold', color: '#1a3a5c', letterSpacing: 1 },
});