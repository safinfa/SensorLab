import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useState, useEffect, useRef } from 'react';

const PHASES = [
  { id: 1, name: 'Phase 1', description: 'Dominant Hand', instruction: 'Tap the button as soon as it appears!' },
  { id: 2, name: 'Phase 2', description: 'Non-Dominant Hand', instruction: 'Now use your OTHER hand to tap!' },
  { id: 3, name: 'Phase 3', description: 'Tracing Challenge', instruction: 'Put your finger ON the green circle, then follow it as it moves!' },
];

const ATTEMPTS = 3;
const CIRCLE_SIZE = 60;
const AREA_WIDTH = 280;
const AREA_HEIGHT = 340;
const CENTER_X = AREA_WIDTH / 2 - CIRCLE_SIZE / 2;
const CENTER_Y = AREA_HEIGHT / 2 - CIRCLE_SIZE / 2;

export default function Activity6ChallengeScreen({ navigation, route }) {
  const { teamName, prediction } = route?.params || {};

  const [phase, setPhase] = useState(0);
  const [attempt, setAttempt] = useState(1);
  const [subPhase, setSubPhase] = useState('waiting');
  const [reactionTime, setReactionTime] = useState(null);
  const [buttonPos, setButtonPos] = useState({ x: 0, y: 0 });

  // Phase 3
  const [circlePos, setCirclePos] = useState({ x: CENTER_X, y: CENTER_Y });
  const [fingerOnCircle, setFingerOnCircle] = useState(false);
  const [traceStarted, setTraceStarted] = useState(false);
  const [currentAccuracy, setCurrentAccuracy] = useState(100);
  const [timeLeft, setTimeLeft] = useState(6);
  const [phase3Result, setPhase3Result] = useState(null);

  const startTimeRef = useRef(null);
  const timerRef = useRef(null);
  const circleTimerRef = useRef(null);
  const countdownRef = useRef(null);
  const resultsRef = useRef({ phase1: [], phase2: [], phase3: [] });
  const circlePosRef = useRef({ x: CENTER_X, y: CENTER_Y });
  const fingerPosRef = useRef(null);
  const accuracyHistoryRef = useRef([]);
  const traceStartedRef = useRef(false);
  const velocityRef = useRef({ vx: 2, vy: 1.5 });

  useEffect(() => {
    return () => {
      clearTimeout(timerRef.current);
      clearInterval(circleTimerRef.current);
      clearInterval(countdownRef.current);
    };
  }, []);

  const getRandomPosition = () => ({
    x: Math.floor(Math.random() * 200) + 20,
    y: Math.floor(Math.random() * 180) + 50,
  });

  const startAttempt = () => {
    setSubPhase('ready');
    setReactionTime(null);
    const delay = Math.floor(Math.random() * 3000) + 1500;
    timerRef.current = setTimeout(() => {
      setButtonPos(getRandomPosition());
      startTimeRef.current = Date.now();
      setSubPhase('active');
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }, delay);
  };

  const handleTap = () => {
    if (subPhase !== 'active') return;
    const elapsed = Date.now() - startTimeRef.current;
    setReactionTime(elapsed);
    setSubPhase('result');
    const key = phase === 1 ? 'phase1' : 'phase2';
    const newResults = { ...resultsRef.current, [key]: [...resultsRef.current[key], elapsed] };
    resultsRef.current = newResults;
  };

  const resetPhase3State = () => {
    clearInterval(circleTimerRef.current);
    clearInterval(countdownRef.current);
    const startPos = { x: CENTER_X, y: CENTER_Y };
    setCirclePos(startPos);
    circlePosRef.current = startPos;
    setFingerOnCircle(false);
    setTraceStarted(false);
    traceStartedRef.current = false;
    accuracyHistoryRef.current = [];
    setCurrentAccuracy(100);
    setTimeLeft(6);
    setPhase3Result(null);
    fingerPosRef.current = null;
    // Random starting velocity
    velocityRef.current = {
      vx: (Math.random() * 3 + 1) * (Math.random() < 0.5 ? 1 : -1),
      vy: (Math.random() * 3 + 1) * (Math.random() < 0.5 ? 1 : -1),
    };
  };

  const startCircleMoving = () => {
    let ticks = 0;
    let seconds = 6;

    countdownRef.current = setInterval(() => {
      seconds -= 1;
      setTimeLeft(seconds);
      if (seconds <= 0) clearInterval(countdownRef.current);
    }, 1000);

    circleTimerRef.current = setInterval(() => {
      ticks++;

      // Random bouncing ball movement
      let { x, y } = circlePosRef.current;
      let { vx, vy } = velocityRef.current;

      x += vx;
      y += vy;

      // Bounce off walls
      if (x <= 0) { x = 0; vx = Math.abs(vx) + Math.random() * 0.5; }
      if (x >= AREA_WIDTH - CIRCLE_SIZE) { x = AREA_WIDTH - CIRCLE_SIZE; vx = -(Math.abs(vx) + Math.random() * 0.5); }
      if (y <= 0) { y = 0; vy = Math.abs(vy) + Math.random() * 0.5; }
      if (y >= AREA_HEIGHT - CIRCLE_SIZE) { y = AREA_HEIGHT - CIRCLE_SIZE; vy = -(Math.abs(vy) + Math.random() * 0.5); }

      // Cap speed
      vx = Math.max(-5, Math.min(5, vx));
      vy = Math.max(-5, Math.min(5, vy));

      // Randomly change direction slightly every 20 ticks
      if (ticks % 20 === 0) {
        vx += (Math.random() - 0.5) * 2;
        vy += (Math.random() - 0.5) * 2;
      }

      velocityRef.current = { vx, vy };
      const newPos = { x, y };
      circlePosRef.current = newPos;
      setCirclePos({ ...newPos });

      // Accuracy calculation
      if (fingerPosRef.current) {
        const circleCenterX = newPos.x + CIRCLE_SIZE / 2;
        const circleCenterY = newPos.y + CIRCLE_SIZE / 2;
        const dx = fingerPosRef.current.x - circleCenterX;
        const dy = fingerPosRef.current.y - circleCenterY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const acc = Math.max(0, Math.round(100 - distance * 1.2));
        setCurrentAccuracy(acc);
        accuracyHistoryRef.current.push(acc);
        setFingerOnCircle(distance <= CIRCLE_SIZE);
      } else {
        accuracyHistoryRef.current.push(0);
        setFingerOnCircle(false);
      }

      if (ticks >= 60) {
        clearInterval(circleTimerRef.current);
        clearInterval(countdownRef.current);
        traceStartedRef.current = false;
        setTraceStarted(false);

        const history = accuracyHistoryRef.current;
        const avg = history.length > 0
          ? Math.round(history.reduce((a, b) => a + b, 0) / history.length)
          : 0;

        setPhase3Result(avg);
        const newResults = {
          ...resultsRef.current,
          phase3: [...resultsRef.current.phase3, avg],
        };
        resultsRef.current = newResults;
        setSubPhase('result');
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    }, 100);
  };

  const handleTraceAreaTouch = (evt) => {
    const { locationX, locationY } = evt.nativeEvent;
    fingerPosRef.current = { x: locationX, y: locationY };

    const circleCenterX = circlePosRef.current.x + CIRCLE_SIZE / 2;
    const circleCenterY = circlePosRef.current.y + CIRCLE_SIZE / 2;
    const dx = locationX - circleCenterX;
    const dy = locationY - circleCenterY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const isOnCircle = distance <= CIRCLE_SIZE;

    if (!traceStartedRef.current) {
      if (isOnCircle) {
        traceStartedRef.current = true;
        setTraceStarted(true);
        setSubPhase('active');
        setFingerOnCircle(true);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        startCircleMoving();
      }
    } else {
      const acc = Math.max(0, Math.round(100 - distance * 1.2));
      setCurrentAccuracy(acc);
      setFingerOnCircle(isOnCircle);
    }
  };

  const handleFingerLift = () => {
    fingerPosRef.current = null;
    setFingerOnCircle(false);
  };

  const nextAttempt = () => {
    resetPhase3State();
    if (attempt < ATTEMPTS) {
      setAttempt(prev => prev + 1);
      setSubPhase('waiting');
      setReactionTime(null);
    } else {
      if (phase < 3) {
        setPhase(prev => prev + 1);
        setAttempt(1);
        setSubPhase('waiting');
        setReactionTime(null);
      } else {
        setPhase(4);
      }
    }
  };

  const getAvg = (arr) => arr.length > 0
    ? Math.round(arr.reduce((a, b) => a + b, 0) / arr.length)
    : 0;

  const getRating = (ms) => {
    if (ms < 200) return '⚡ Lightning Fast!';
    if (ms < 300) return '🟢 Great!';
    if (ms < 450) return '🟡 Average';
    return '🔴 Keep Practicing!';
  };

  return (
    <LinearGradient colors={['#4a90d9', '#1a3a5c']} style={styles.gradient}>
      <ScrollView contentContainerStyle={styles.container} scrollEnabled={phase === 0 || phase === 4}>

        {/* INTRO */}
        {phase === 0 && (
          <View style={styles.centeredBox}>
            <Text style={styles.title}>Reaction Board Challenge</Text>
            <Text style={styles.subtitle}>3 Phases — Test your reaction time!</Text>
            {PHASES.map((p, i) => (
              <View key={i} style={styles.phaseCard}>
                <Text style={styles.phaseName}>{p.name} — {p.description}</Text>
                <Text style={styles.phaseDesc}>{p.instruction}</Text>
              </View>
            ))}
            <TouchableOpacity style={styles.button} onPress={() => { setPhase(1); setSubPhase('waiting'); }}>
              <Text style={styles.buttonText}>Begin Phase 1</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* PHASE 1 & 2 */}
        {(phase === 1 || phase === 2) && (
          <View style={styles.centeredBox}>
            <Text style={styles.title}>{PHASES[phase - 1].name}</Text>
            <Text style={styles.subtitle}>{PHASES[phase - 1].description}</Text>
            <Text style={styles.attemptText}>Attempt {attempt} of {ATTEMPTS}</Text>

            {subPhase === 'waiting' && (
              <>
                <Text style={styles.instruction}>{PHASES[phase - 1].instruction}</Text>
                <TouchableOpacity style={styles.button} onPress={startAttempt}>
                  <Text style={styles.buttonText}>Ready!</Text>
                </TouchableOpacity>
              </>
            )}

            {subPhase === 'ready' && (
              <View style={styles.waitBox}>
                <Text style={styles.waitText}>Wait for it...</Text>
                <Text style={styles.waitSubtext}>Don't tap yet! 👀</Text>
              </View>
            )}

            {subPhase === 'active' && (
              <View style={styles.tapArea}>
                <TouchableOpacity
                  style={[styles.reactionButton, { left: buttonPos.x, top: buttonPos.y }]}
                  onPress={handleTap}
                >
                  <Text style={styles.reactionButtonText}>TAP!</Text>
                </TouchableOpacity>
              </View>
            )}

            {subPhase === 'result' && reactionTime && (
              <View style={styles.resultBox}>
                <Text style={styles.resultTime}>{reactionTime} ms</Text>
                <Text style={styles.resultRating}>{getRating(reactionTime)}</Text>
                <TouchableOpacity style={styles.button} onPress={nextAttempt}>
                  <Text style={styles.buttonText}>
                    {attempt < ATTEMPTS ? 'Next Attempt' : phase < 3 ? `Start Phase ${phase + 1}` : 'See Results'}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}

        {/* PHASE 3 */}
        {phase === 3 && (
          <View style={styles.centeredBox}>
            <Text style={styles.title}>Phase 3 — Tracing</Text>
            <Text style={styles.subtitle}>Follow the moving circle!</Text>
            <Text style={styles.attemptText}>Attempt {attempt} of {ATTEMPTS}</Text>

            {/* Stats row — only show when active */}
            {subPhase === 'active' && (
              <View style={styles.statsRow}>
                <Text style={styles.statText}>⏱ {timeLeft}s</Text>
                <Text style={styles.statText}>🎯 {currentAccuracy}%</Text>
                <Text style={styles.statText}>{fingerOnCircle ? '✅ On!' : '❌ Off!'}</Text>
              </View>
            )}

            {subPhase === 'waiting' && (
              <Text style={styles.instruction}>
                Place your finger ON the green circle to start. Then keep following it!
              </Text>
            )}

            {/* Trace area — always visible in phase 3 waiting/active */}
            {(subPhase === 'waiting' || subPhase === 'active') && (
              <View
                style={styles.traceArea}
                onStartShouldSetResponder={() => true}
                onMoveShouldSetResponder={() => true}
                onStartShouldSetResponderCapture={() => true}
                onMoveShouldSetResponderCapture={() => true}
                onResponderGrant={handleTraceAreaTouch}
                onResponderMove={handleTraceAreaTouch}
                onResponderRelease={handleFingerLift}
                onResponderTerminate={handleFingerLift}
              >
                <View style={[styles.traceCircle, {
                  left: circlePos.x,
                  top: circlePos.y,
                  backgroundColor: subPhase === 'waiting'
                    ? '#4caf50'
                    : fingerOnCircle ? '#4caf50' : '#ff5722',
                }]}>
                  {subPhase === 'waiting' && (
                    <Text style={styles.circleHint}>👆</Text>
                  )}
                </View>
                {subPhase === 'waiting' && (
                  <Text style={styles.traceHint}>Touch the circle to begin!</Text>
                )}
              </View>
            )}

            {subPhase === 'result' && (
              <View style={styles.resultBox}>
                <Text style={styles.resultTime}>{phase3Result}%</Text>
                <Text style={styles.resultRating}>Tracing Accuracy</Text>
                <TouchableOpacity style={styles.button} onPress={nextAttempt}>
                  <Text style={styles.buttonText}>
                    {attempt < ATTEMPTS ? 'Next Attempt' : 'See Results'}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}

        {/* DONE */}
        {phase === 4 && (
          <View style={styles.centeredBox}>
            <Text style={styles.title}>🎉 All Done!</Text>

            <View style={styles.summaryCard}>
              <Text style={styles.summaryTitle}>Phase 1 — Dominant Hand</Text>
              <Text style={styles.summaryValue}>Avg: {getAvg(resultsRef.current.phase1)} ms</Text>
              <Text style={styles.summaryRating}>{getRating(getAvg(resultsRef.current.phase1))}</Text>
            </View>

            <View style={styles.summaryCard}>
              <Text style={styles.summaryTitle}>Phase 2 — Non-Dominant Hand</Text>
              <Text style={styles.summaryValue}>Avg: {getAvg(resultsRef.current.phase2)} ms</Text>
              <Text style={styles.summaryRating}>{getRating(getAvg(resultsRef.current.phase2))}</Text>
            </View>

            <View style={styles.summaryCard}>
              <Text style={styles.summaryTitle}>Phase 3 — Tracing</Text>
              <Text style={styles.summaryValue}>Avg Accuracy: {getAvg(resultsRef.current.phase3)}%</Text>
            </View>

            <TouchableOpacity
              style={styles.button}
              onPress={() => navigation.navigate('Activity6Reflection', {
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
  subtitle: { fontSize: 14, color: '#d0e8ff', marginBottom: 8, textAlign: 'center' },
  attemptText: { fontSize: 13, color: '#ffe082', marginBottom: 8, fontWeight: 'bold' },
  instruction: { fontSize: 14, color: '#e0f0ff', textAlign: 'center', marginBottom: 16, lineHeight: 22 },
  phaseCard: {
    width: '100%', backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 16, padding: 14, marginBottom: 12,
  },
  phaseName: { fontSize: 14, fontWeight: 'bold', color: '#ffe082', marginBottom: 4 },
  phaseDesc: { fontSize: 13, color: '#d0e8ff' },
  waitBox: { alignItems: 'center', marginVertical: 40 },
  waitText: { fontSize: 28, fontWeight: 'bold', color: '#ffe082', marginBottom: 8 },
  waitSubtext: { fontSize: 16, color: '#d0e8ff' },
  tapArea: { width: 300, height: 300, position: 'relative' },
  reactionButton: {
    position: 'absolute', width: 100, height: 100, borderRadius: 50,
    backgroundColor: '#4caf50', justifyContent: 'center', alignItems: 'center', elevation: 8,
  },
  reactionButtonText: { fontSize: 18, fontWeight: 'bold', color: '#fff' },
  resultBox: { alignItems: 'center', marginTop: 20 },
  resultTime: { fontSize: 52, fontWeight: 'bold', color: '#ffe082', marginBottom: 8 },
  resultRating: { fontSize: 18, color: '#fff', marginBottom: 24 },
  statsRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    width: '100%', marginBottom: 8, paddingHorizontal: 4,
  },
  statText: { fontSize: 13, color: '#fff', fontWeight: 'bold' },
  traceArea: {
    width: AREA_WIDTH, height: AREA_HEIGHT,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 20, marginVertical: 8,
    borderWidth: 2, borderColor: 'rgba(255,255,255,0.3)',
    position: 'relative', overflow: 'hidden',
  },
  traceCircle: {
    position: 'absolute', width: CIRCLE_SIZE, height: CIRCLE_SIZE,
    borderRadius: CIRCLE_SIZE / 2,
    justifyContent: 'center', alignItems: 'center',
  },
  circleHint: { fontSize: 22 },
  traceHint: {
    position: 'absolute', bottom: 12, alignSelf: 'center',
    color: '#ffe082', fontSize: 13, fontWeight: 'bold',
  },
  summaryCard: {
    width: '100%', backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 16, padding: 16, marginBottom: 12, alignItems: 'center',
  },
  summaryTitle: { fontSize: 14, fontWeight: 'bold', color: '#fff', marginBottom: 6 },
  summaryValue: { fontSize: 22, fontWeight: 'bold', color: '#ffe082', marginBottom: 4 },
  summaryRating: { fontSize: 13, color: '#d0e8ff' },
  button: {
    backgroundColor: 'rgba(255,255,255,0.85)', borderRadius: 25,
    paddingVertical: 14, paddingHorizontal: 50, alignItems: 'center', marginTop: 8,
  },
  buttonText: { fontSize: 15, fontWeight: 'bold', color: '#1a3a5c', letterSpacing: 1 },
});