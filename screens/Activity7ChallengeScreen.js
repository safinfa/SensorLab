import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Accelerometer } from 'expo-sensors';
import * as Speech from 'expo-speech';
import * as Haptics from 'expo-haptics';
import { useState, useEffect, useRef } from 'react';

const RECORD_DURATION = 30; // 30 seconds per recording
const EXERCISE_DURATION = 60; // 60 seconds jogging

const STAGES = [
  { id: 'rest', label: '😌 At Rest', instruction: 'Lie down and place your phone flat on your chest. Breathe normally.' },
  { id: 'exercise1', label: '🏃 Jog on the Spot', instruction: 'Jog on the spot for 1 minute! Keep going!' },
  { id: 'afterExercise1', label: '💨 After Jogging', instruction: 'Place your phone back on your chest. Breathe normally.' },
  { id: 'exercise2', label: '⭐ Star Jumps', instruction: 'Complete 100 star jumps! Keep going!' },
  { id: 'afterExercise2', label: '💨 After Star Jumps', instruction: 'Place your phone back on your chest. Breathe normally.' },
];

export default function Activity7ChallengeScreen({ navigation, route }) {
  const { teamName, prediction } = route?.params || {};

  const [stageIndex, setStageIndex] = useState(0);
  const [phase, setPhase] = useState('intro'); // intro | exercising | recording | result | done
  const [timer, setTimer] = useState(0);
  const [breathCount, setBreathCount] = useState(0);
  const [breathsPerMinute, setBreathsPerMinute] = useState(0);
  const [results, setResults] = useState({ rest: 0, afterExercise1: 0, afterExercise2: 0 });

  // Accelerometer breath detection
  const [accelY, setAccelY] = useState(0);
  const lastPeakRef = useRef(false);
  const breathCountRef = useRef(0);
  const timerRef = useRef(null);
  const sensorRef = useRef(null);
  const resultsRef = useRef({ rest: 0, afterExercise1: 0, afterExercise2: 0 });

  useEffect(() => {
    return () => {
      clearInterval(timerRef.current);
      if (sensorRef.current) sensorRef.current.remove();
      Speech.stop();
    };
  }, []);

  const currentStage = STAGES[stageIndex];
  const isRecordingStage = ['rest', 'afterExercise1', 'afterExercise2'].includes(currentStage?.id);
  const isExerciseStage = ['exercise1', 'exercise2'].includes(currentStage?.id);

  const startRecording = () => {
    setPhase('recording');
    setBreathCount(0);
    breathCountRef.current = 0;
    lastPeakRef.current = false;
    setTimer(RECORD_DURATION);

    // Start accelerometer
    Accelerometer.setUpdateInterval(100);
    sensorRef.current = Accelerometer.addListener(({ y }) => {
      setAccelY(y);
      // Detect breath peak — chest rises (y increases above threshold)
      const isPeak = y > 0.08;
      if (isPeak && !lastPeakRef.current) {
        breathCountRef.current += 1;
        setBreathCount(breathCountRef.current);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
      lastPeakRef.current = isPeak;
    });

    // Countdown timer
    let timeLeft = RECORD_DURATION;
    timerRef.current = setInterval(() => {
      timeLeft -= 1;
      setTimer(timeLeft);
      if (timeLeft === 0) {
        clearInterval(timerRef.current);
        stopRecording();
      }
    }, 1000);
  };

  const stopRecording = () => {
    if (sensorRef.current) {
      sensorRef.current.remove();
      sensorRef.current = null;
    }
    clearInterval(timerRef.current);

    // Convert 30s count to breaths per minute
    const bpm = Math.round(breathCountRef.current * 2);
    setBreathsPerMinute(bpm);

    const newResults = { ...resultsRef.current, [currentStage.id]: bpm };
    resultsRef.current = newResults;
    setResults(newResults);

    Speech.speak(`Recording complete! You took ${bpm} breaths per minute.`, { rate: 0.85 });
    setPhase('result');
  };

  const startExercise = () => {
    setPhase('exercising');
    setTimer(EXERCISE_DURATION);

    const exerciseName = currentStage.id === 'exercise1' ? 'Jog on the spot!' : 'Start your star jumps!';
    Speech.speak(exerciseName, { rate: 0.9 });

    let timeLeft = EXERCISE_DURATION;
    timerRef.current = setInterval(() => {
      timeLeft -= 1;
      setTimer(timeLeft);
      if (timeLeft === 10) Speech.speak('10 seconds remaining!', { rate: 0.9 });
      if (timeLeft === 0) {
        clearInterval(timerRef.current);
        Speech.speak('Exercise complete! Now place your phone on your chest.', { rate: 0.85 });
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        nextStage();
      }
    }, 1000);
  };

  const nextStage = () => {
    clearInterval(timerRef.current);
    if (sensorRef.current) { sensorRef.current.remove(); sensorRef.current = null; }
    setBreathCount(0);
    breathCountRef.current = 0;

    if (stageIndex + 1 < STAGES.length) {
      setStageIndex(prev => prev + 1);
      setPhase('intro');
    } else {
      setPhase('done');
    }
  };

  const getBreathingStatus = (bpm) => {
    if (bpm < 12) return '🔵 Below Normal';
    if (bpm <= 20) return '🟢 Normal';
    if (bpm <= 30) return '🟡 Elevated';
    return '🔴 High';
  };

  return (
    <LinearGradient colors={['#4a90d9', '#1a3a5c']} style={styles.gradient}>
      <ScrollView contentContainerStyle={styles.container} scrollEnabled={phase === 'intro' || phase === 'done'}>

        {/* INTRO / BETWEEN STAGES */}
        {phase === 'intro' && (
          <View style={styles.centeredBox}>
            <Text style={styles.stageLabel}>{currentStage.label}</Text>
            <Text style={styles.instruction}>{currentStage.instruction}</Text>

            {isRecordingStage && (
              <>
                <Text style={styles.hint}>📱 Place phone flat on your chest</Text>
                <Text style={styles.hint}>⏱ Recording lasts {RECORD_DURATION} seconds</Text>
                <TouchableOpacity style={styles.button} onPress={startRecording}>
                  <Text style={styles.buttonText}>Start Recording</Text>
                </TouchableOpacity>
              </>
            )}

            {isExerciseStage && (
              <>
                <Text style={styles.hint}>
                  {currentStage.id === 'exercise1'
                    ? '🏃 Jog on the spot for 60 seconds'
                    : '⭐ Complete 100 star jumps'}
                </Text>
                <TouchableOpacity style={styles.button} onPress={startExercise}>
                  <Text style={styles.buttonText}>Start Exercise!</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        )}

        {/* EXERCISING */}
        {phase === 'exercising' && (
          <View style={styles.centeredBox}>
            <Text style={styles.stageLabel}>{currentStage.label}</Text>
            <Text style={styles.instruction}>{currentStage.instruction}</Text>
            <Text style={styles.bigTimer}>{timer}s</Text>
            <Text style={styles.hint}>Keep going! 💪</Text>
          </View>
        )}

        {/* RECORDING */}
        {phase === 'recording' && (
          <View style={styles.centeredBox}>
            <Text style={styles.stageLabel}>{currentStage.label}</Text>
            <Text style={styles.hint}>📱 Keep phone flat on chest</Text>
            <Text style={styles.hint}>🫁 Breathe normally</Text>

            <Text style={styles.bigTimer}>{timer}s</Text>

            <View style={styles.breathBox}>
              <Text style={styles.breathLabel}>Breaths Detected</Text>
              <Text style={styles.breathCount}>{breathCount}</Text>
            </View>

            {/* Live accelerometer bar */}
            <View style={styles.accelBarBg}>
              <View style={[styles.accelBarFill, {
                width: `${Math.min(100, Math.abs(accelY) * 500)}%`,
                backgroundColor: accelY > 0.08 ? '#4caf50' : '#4a90d9',
              }]} />
            </View>
            <Text style={styles.accelLabel}>
              {accelY > 0.08 ? '🫁 Breath detected!' : '😶 Waiting for breath...'}
            </Text>

            <TouchableOpacity style={styles.stopButton} onPress={stopRecording}>
              <Text style={styles.buttonText}>Stop Early</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* RESULT */}
        {phase === 'result' && (
          <View style={styles.centeredBox}>
            <Text style={styles.stageLabel}>✅ {currentStage.label} — Done!</Text>
            <View style={styles.resultBox}>
              <Text style={styles.resultLabel}>Breaths Per Minute</Text>
              <Text style={styles.resultBpm}>{breathsPerMinute}</Text>
              <Text style={styles.resultStatus}>{getBreathingStatus(breathsPerMinute)}</Text>
            </View>

            <TouchableOpacity style={styles.button} onPress={nextStage}>
              <Text style={styles.buttonText}>
                {stageIndex + 1 < STAGES.length ? 'Continue' : 'See Results'}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* DONE */}
        {phase === 'done' && (
          <View style={styles.centeredBox}>
            <Text style={styles.title}>🎉 All Done!</Text>
            <Text style={styles.subtitle}>Here are your breathing results:</Text>

            <View style={styles.summaryCard}>
              <Text style={styles.summaryTitle}>😌 At Rest</Text>
              <Text style={styles.summaryBpm}>{resultsRef.current.rest} BPM</Text>
              <Text style={styles.summaryStatus}>{getBreathingStatus(resultsRef.current.rest)}</Text>
            </View>

            <View style={styles.summaryCard}>
              <Text style={styles.summaryTitle}>💨 After Jogging</Text>
              <Text style={styles.summaryBpm}>{resultsRef.current.afterExercise1} BPM</Text>
              <Text style={styles.summaryStatus}>{getBreathingStatus(resultsRef.current.afterExercise1)}</Text>
            </View>

            <View style={styles.summaryCard}>
              <Text style={styles.summaryTitle}>💨 After Star Jumps</Text>
              <Text style={styles.summaryBpm}>{resultsRef.current.afterExercise2} BPM</Text>
              <Text style={styles.summaryStatus}>{getBreathingStatus(resultsRef.current.afterExercise2)}</Text>
            </View>

            <TouchableOpacity
              style={styles.button}
              onPress={() => navigation.navigate('Activity7Reflection', {
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
  title: { fontSize: 22, fontWeight: 'bold', color: '#fff', marginBottom: 8, textAlign: 'center' },
  subtitle: { fontSize: 14, color: '#d0e8ff', marginBottom: 20, textAlign: 'center' },
  stageLabel: { fontSize: 20, fontWeight: 'bold', color: '#ffe082', marginBottom: 12, textAlign: 'center' },
  instruction: { fontSize: 14, color: '#e0f0ff', textAlign: 'center', marginBottom: 16, lineHeight: 22 },
  hint: { fontSize: 13, color: '#d0e8ff', marginBottom: 8, textAlign: 'center' },
  bigTimer: { fontSize: 72, fontWeight: 'bold', color: '#ffe082', marginVertical: 20 },
  breathBox: {
    backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 20,
    padding: 20, alignItems: 'center', width: '100%', marginBottom: 16,
  },
  breathLabel: { fontSize: 13, color: '#d0e8ff', marginBottom: 4 },
  breathCount: { fontSize: 52, fontWeight: 'bold', color: '#4caf50' },
  accelBarBg: {
    width: '100%', height: 20, backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 10, overflow: 'hidden', marginBottom: 8,
  },
  accelBarFill: { height: '100%', borderRadius: 10 },
  accelLabel: { fontSize: 13, color: '#d0e8ff', marginBottom: 20, textAlign: 'center' },
  resultBox: {
    backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 20,
    padding: 24, alignItems: 'center', width: '100%', marginBottom: 24,
  },
  resultLabel: { fontSize: 13, color: '#d0e8ff', marginBottom: 4 },
  resultBpm: { fontSize: 52, fontWeight: 'bold', color: '#ffe082', marginBottom: 4 },
  resultStatus: { fontSize: 16, color: '#fff' },
  summaryCard: {
    width: '100%', backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 16, padding: 16, marginBottom: 12, alignItems: 'center',
  },
  summaryTitle: { fontSize: 14, fontWeight: 'bold', color: '#fff', marginBottom: 6 },
  summaryBpm: { fontSize: 28, fontWeight: 'bold', color: '#ffe082', marginBottom: 4 },
  summaryStatus: { fontSize: 13, color: '#d0e8ff' },
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