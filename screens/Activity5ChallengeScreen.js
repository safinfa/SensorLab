import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Accelerometer } from 'expo-sensors';
import * as Speech from 'expo-speech';
import { useState, useEffect, useRef } from 'react';

const MOVEMENTS = [
  { id: 1, name: 'Movement 1', description: 'Slowly spin your hand in a full circle, keeping your arm extended. Repeat smoothly.' },
  { id: 2, name: 'Movement 2', description: 'Slowly move your hand up and down in a straight line. Keep it controlled and steady.' },
  { id: 3, name: 'Movement 3', description: 'Slowly move your hand side to side in a straight line. Keep it as smooth as possible.' },
];

const RECORDING_DURATION = 10;

export default function Activity5ChallengeScreen({ navigation, route }) {
  const { teamName, prediction } = route?.params || {};

  const [phase, setPhase] = useState('intro');
  const [currentMovement, setCurrentMovement] = useState(0);
  const [countdown, setCountdown] = useState(3);
  const [timer, setTimer] = useState(RECORDING_DURATION);
  const [vibrationLevel, setVibrationLevel] = useState(0);
  const [results, setResults] = useState([]);

  const currentMovementRef = useRef(0);
  const resultsRef = useRef([]);
  const vibrationSamples = useRef([]);
  const timerRef = useRef(null);
  const countdownRef = useRef(null);
  const sensorRef = useRef(null);

  useEffect(() => {
    return () => {
      clearInterval(timerRef.current);
      clearInterval(countdownRef.current);
      if (sensorRef.current) sensorRef.current.remove();
      Speech.stop();
    };
  }, []);

  const startCountdown = (movementIndex) => {
    const idx = movementIndex ?? currentMovementRef.current;
    setPhase('countdown');
    setCountdown(3);

    const movement = MOVEMENTS[idx];
    if (movement) {
      Speech.speak(`Get ready for ${movement.name}. ${movement.description}`, { rate: 0.85 });
    }

    let count = 3;
    countdownRef.current = setInterval(() => {
      count -= 1;
      setCountdown(count);
      if (count === 0) {
        clearInterval(countdownRef.current);
        startRecording(idx);
      }
    }, 1000);
  };

  const startRecording = (movementIndex) => {
    const idx = movementIndex ?? currentMovementRef.current;
    setPhase('recording');
    setTimer(RECORDING_DURATION);
    vibrationSamples.current = [];
    Speech.speak('Go! Move slowly and smoothly.', { rate: 0.85 });

    Accelerometer.setUpdateInterval(100);
    sensorRef.current = Accelerometer.addListener(({ x, y, z }) => {
      const magnitude = Math.sqrt(x * x + y * y + z * z);
      const vibration = Math.abs(magnitude - 1);
      vibrationSamples.current.push(vibration);
      setVibrationLevel(vibration);
    });

    let timeLeft = RECORDING_DURATION;
    timerRef.current = setInterval(() => {
      timeLeft -= 1;
      setTimer(timeLeft);
      if (timeLeft === 0) {
        clearInterval(timerRef.current);
        stopRecording(idx);
      }
    }, 1000);
  };

  const stopRecording = (movementIndex) => {
    const idx = movementIndex ?? currentMovementRef.current;

    if (sensorRef.current) {
      sensorRef.current.remove();
      sensorRef.current = null;
    }

    const samples = vibrationSamples.current;
    const avgVibration = samples.length > 0
      ? samples.reduce((a, b) => a + b, 0) / samples.length
      : 1;

    const graceScore = Math.max(0, Math.round(100 - avgVibration * 200));

    const result = {
      movement: MOVEMENTS[idx].name,
      avgVibration: avgVibration.toFixed(4),
      graceScore,
      duration: RECORDING_DURATION,
    };

    const newResults = [...resultsRef.current, result];
    resultsRef.current = newResults;
    setResults(newResults);

    Speech.speak(`Movement complete! Your grace score is ${graceScore} out of 100.`, { rate: 0.85 });

    if (idx + 1 < MOVEMENTS.length) {
      setPhase('between');
    } else {
      setPhase('done');
    }
  };

  const nextMovement = () => {
    const nextIdx = currentMovementRef.current + 1;
    currentMovementRef.current = nextIdx;
    setCurrentMovement(nextIdx);
    setVibrationLevel(0);
    startCountdown(nextIdx);
  };

  const getVibrationColor = () => {
    if (vibrationLevel < 0.05) return '#4caf50';
    if (vibrationLevel < 0.15) return '#ffeb3b';
    return '#f44336';
  };

  const getVibrationLabel = () => {
    if (vibrationLevel < 0.05) return '😌 Very Smooth';
    if (vibrationLevel < 0.15) return '😐 Moderate';
    return '😬 Shaky!';
  };

  const safeIdx = Math.min(currentMovement, MOVEMENTS.length - 1);

  return (
    <LinearGradient colors={['#4a90d9', '#1a3a5c']} style={styles.gradient}>
      <ScrollView contentContainerStyle={styles.container} scrollEnabled={false}>

        {/* INTRO PHASE */}
        {phase === 'intro' && (
          <View style={styles.centeredBox}>
            <Text style={styles.title}>Activity 5 Challenge</Text>
            <Text style={styles.subtitle}>You will perform 3 movements.</Text>
            <Text style={styles.subtitle}>Hold your phone in one hand throughout.</Text>

            <View style={styles.movementPreviewBox}>
              <Text style={styles.movementPreviewTitle}>The 3 Movements:</Text>
              {MOVEMENTS.map((m) => (
                <Text key={m.id} style={styles.movementPreviewItem}>
                  {m.name}: {m.description}
                </Text>
              ))}
            </View>

            <TouchableOpacity style={styles.button} onPress={() => startCountdown(0)}>
              <Text style={styles.buttonText}>Begin</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* COUNTDOWN PHASE */}
        {phase === 'countdown' && (
          <View style={styles.centeredBox}>
            <Text style={styles.title}>{MOVEMENTS[safeIdx].name}</Text>
            <Text style={styles.movementDesc}>{MOVEMENTS[safeIdx].description}</Text>
            <Text style={styles.countdownNumber}>{countdown === 0 ? 'GO!' : countdown}</Text>
            <Text style={styles.subtitle}>Get ready...</Text>
          </View>
        )}

        {/* RECORDING PHASE */}
        {phase === 'recording' && (
          <View style={styles.centeredBox}>
            <Text style={styles.title}>{MOVEMENTS[safeIdx].name}</Text>
            <Text style={styles.movementDesc}>{MOVEMENTS[safeIdx].description}</Text>
            <Text style={styles.timerText}>⏱ {timer}s remaining</Text>
            <View style={styles.vibrationBox}>
              <Text style={styles.vibrationLabel}>Live Smoothness</Text>
              <View style={styles.vibrationBarBg}>
                <View style={[styles.vibrationBarFill, {
                  width: `${Math.min(100, vibrationLevel * 500)}%`,
                  backgroundColor: getVibrationColor(),
                }]} />
              </View>
              <Text style={[styles.vibrationStatus, { color: getVibrationColor() }]}>
                {getVibrationLabel()}
              </Text>
            </View>
            <TouchableOpacity style={styles.stopButton} onPress={() => stopRecording(safeIdx)}>
              <Text style={styles.buttonText}>Stop Early</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* BETWEEN MOVEMENTS */}
        {phase === 'between' && (
          <View style={styles.centeredBox}>
            <Text style={styles.title}>✅ Movement Complete!</Text>
            <Text style={styles.scoreText}>
              Grace Score: {resultsRef.current[resultsRef.current.length - 1]?.graceScore ?? 0} / 100
            </Text>
            {MOVEMENTS[currentMovementRef.current + 1] && (
              <>
                <Text style={styles.subtitle}>
                  Next up: {MOVEMENTS[currentMovementRef.current + 1].name}
                </Text>
                <Text style={styles.movementDesc}>
                  {MOVEMENTS[currentMovementRef.current + 1].description}
                </Text>
              </>
            )}
            <TouchableOpacity style={styles.button} onPress={nextMovement}>
              <Text style={styles.buttonText}>Next Movement</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* DONE PHASE */}
        {phase === 'done' && (
          <View style={styles.centeredBox}>
            <Text style={styles.title}>🎉 All Done!</Text>
            <Text style={styles.subtitle}>Here are your results:</Text>
            {resultsRef.current.map((r, i) => (
              <View key={i} style={styles.resultCard}>
                <Text style={styles.resultTitle}>{r.movement}</Text>
                <Text style={styles.resultStat}>Grace Score: {r.graceScore} / 100</Text>
                <Text style={styles.resultStat}>Avg Vibration: {r.avgVibration}</Text>
                <Text style={styles.resultStat}>Duration: {r.duration}s</Text>
              </View>
            ))}
            <TouchableOpacity
              style={styles.button}
              onPress={() => navigation.navigate('Activity5Reflection', { teamName, prediction, results: resultsRef.current })}
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
  container: { flexGrow: 1, justifyContent: 'center', alignItems: 'center', padding: 24, paddingTop: 60 },
  centeredBox: { width: '100%', alignItems: 'center' },
  title: { fontSize: 22, fontWeight: 'bold', color: '#fff', marginBottom: 12, textAlign: 'center' },
  subtitle: { fontSize: 14, color: '#d0e8ff', marginBottom: 12, textAlign: 'center' },
  movementPreviewBox: {
    width: '100%', backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 16, padding: 16, marginBottom: 24,
  },
  movementPreviewTitle: { fontSize: 14, fontWeight: 'bold', color: '#fff', marginBottom: 10, textAlign: 'center' },
  movementPreviewItem: { fontSize: 13, color: '#d0e8ff', marginBottom: 8, lineHeight: 20 },
  movementDesc: { fontSize: 14, color: '#e0f0ff', textAlign: 'center', marginBottom: 24, lineHeight: 22 },
  countdownNumber: { fontSize: 80, fontWeight: 'bold', color: '#ffe082', marginVertical: 20 },
  timerText: { fontSize: 20, fontWeight: 'bold', color: '#ffe082', marginBottom: 24 },
  vibrationBox: { width: '100%', alignItems: 'center', marginBottom: 28 },
  vibrationLabel: { fontSize: 14, color: '#d0e8ff', marginBottom: 10 },
  vibrationBarBg: {
    width: '100%', height: 24, backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 12, overflow: 'hidden', marginBottom: 10,
  },
  vibrationBarFill: { height: '100%', borderRadius: 12 },
  vibrationStatus: { fontSize: 18, fontWeight: 'bold' },
  scoreText: { fontSize: 24, fontWeight: 'bold', color: '#ffe082', marginBottom: 16 },
  resultCard: {
    width: '100%', backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 16, padding: 16, marginBottom: 12,
  },
  resultTitle: { fontSize: 15, fontWeight: 'bold', color: '#ffe082', marginBottom: 6 },
  resultStat: { fontSize: 13, color: '#d0e8ff', marginBottom: 4 },
  button: {
    backgroundColor: 'rgba(255,255,255,0.85)', borderRadius: 25,
    paddingVertical: 14, paddingHorizontal: 50, alignItems: 'center', marginTop: 8,
  },
  stopButton: {
    backgroundColor: 'rgba(244,67,54,0.8)', borderRadius: 25,
    paddingVertical: 14, paddingHorizontal: 50, alignItems: 'center', marginTop: 8,
  },
  buttonText: { fontSize: 15, fontWeight: 'bold', color: '#1a3a5c', letterSpacing: 1 },
});