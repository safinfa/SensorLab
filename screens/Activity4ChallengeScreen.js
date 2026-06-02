import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Image, Alert, Vibration } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Accelerometer, Gyroscope } from 'expo-sensors';
import * as Speech from 'expo-speech';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage, auth } from '../firebaseConfig';
import { useState, useEffect, useRef } from 'react';

const VIBRATION_DURATION = 15;
const ROUNDS = 3;

export default function Activity4ChallengeScreen({ navigation, route }) {
  const { teamName, prediction } = route?.params || {};

  const [phase, setPhase] = useState('prepare');
  const [countdown, setCountdown] = useState(3);
  const [timer, setTimer] = useState(VIBRATION_DURATION);
  const [round, setRound] = useState(1);
  const [shakeLevel, setShakeLevel] = useState(0);
  const [maxShake, setMaxShake] = useState(0);
  const [beforePhoto, setBeforePhoto] = useState(null);
  const [afterPhoto, setAfterPhoto] = useState(null);
  const [distanceMoved, setDistanceMoved] = useState('');
  const [uploading, setUploading] = useState(false);
  const [results, setResults] = useState([]);

  const timerRef = useRef(null);
  const countdownRef = useRef(null);
  const sensorRef = useRef(null);
  const gyroRef = useRef(null);
  const vibrateLoopRef = useRef(null);
  const maxShakeRef = useRef(0);
  const resultsRef = useRef([]);

  useEffect(() => {
    return () => {
      clearInterval(timerRef.current);
      clearInterval(countdownRef.current);
      vibrateLoopRef.current = null;
      Vibration.cancel();
      if (sensorRef.current) sensorRef.current.remove();
      if (gyroRef.current) gyroRef.current.remove();
      Speech.stop();
    };
  }, []);

  const startCountdown = () => {
    setPhase('countdown');
    setCountdown(3);
    Speech.speak('Get ready! Place this phone on your structure now!', { rate: 0.85 });

    let count = 3;
    countdownRef.current = setInterval(() => {
      count -= 1;
      setCountdown(count);
      if (count === 0) {
        clearInterval(countdownRef.current);
        startVibration();
      }
    }, 1000);
  };

  const startVibration = () => {
    setPhase('vibrating');
    setTimer(VIBRATION_DURATION);
    maxShakeRef.current = 0;
    setMaxShake(0);
    Speech.speak('Vibration started! Keep the phone on the structure!', { rate: 0.85 });

    // Strong repeating vibration pattern like earthquake
    const pattern = [0, 550, 50, 550, 50, 550, 50, 550, 50, 550, 50, 550, 50, 550, 50, 550];
    Vibration.vibrate(pattern, true);
    vibrateLoopRef.current = true;

    // Start accelerometer
    Accelerometer.setUpdateInterval(100);
    sensorRef.current = Accelerometer.addListener(({ x, y, z }) => {
      const magnitude = Math.sqrt(x * x + y * y + z * z);
      const shake = Math.abs(magnitude - 1);
      setShakeLevel(shake);
      if (shake > maxShakeRef.current) {
        maxShakeRef.current = shake;
        setMaxShake(shake);
      }
    });

    // Start gyroscope
    Gyroscope.setUpdateInterval(100);
    gyroRef.current = Gyroscope.addListener(({ x, y, z }) => {
      // Data collection only
    });

    let timeLeft = VIBRATION_DURATION;
    timerRef.current = setInterval(() => {
      timeLeft -= 1;
      setTimer(timeLeft);
      if (timeLeft === 5) Speech.speak('5 seconds remaining!', { rate: 0.9 });
      if (timeLeft === 0) {
        clearInterval(timerRef.current);
        stopVibration();
      }
    }, 1000);
  };

  const stopVibration = () => {
    vibrateLoopRef.current = null;
    Vibration.cancel();
    if (sensorRef.current) { sensorRef.current.remove(); sensorRef.current = null; }
    if (gyroRef.current) { gyroRef.current.remove(); gyroRef.current = null; }
    Speech.speak('Vibration stopped! Now take your after photo with the other phone!', { rate: 0.85 });
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setPhase('upload');
  };

  const pickImage = async (type) => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission needed', 'Please allow access to your photo library.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.7,
    });
    if (!result.canceled) {
      if (type === 'before') setBeforePhoto(result.assets[0].uri);
      else setAfterPhoto(result.assets[0].uri);
    }
  };

  const uploadImageToStorage = async (uri, filename) => {
    const response = await fetch(uri);
    const blob = await response.blob();
    const storageRef = ref(storage, `activity4/${auth.currentUser?.uid}/${filename}`);
    await uploadBytes(storageRef, blob);
    const url = await getDownloadURL(storageRef);
    return url;
  };

  const handleSaveRound = async () => {
    if (!beforePhoto || !afterPhoto) {
      Alert.alert('Oops!', 'Please upload both before and after photos.');
      return;
    }
    if (!distanceMoved || isNaN(parseFloat(distanceMoved))) {
      Alert.alert('Oops!', 'Please enter the distance the structure moved in cm.');
      return;
    }

    setUploading(true);
    try {
      const timestamp = Date.now();
      const beforeUrl = await uploadImageToStorage(beforePhoto, `before_round${round}_${timestamp}.jpg`);
      const afterUrl = await uploadImageToStorage(afterPhoto, `after_round${round}_${timestamp}.jpg`);

      const roundResult = {
        round,
        maxShake: maxShakeRef.current.toFixed(4),
        distanceMoved: parseFloat(distanceMoved),
        beforePhotoUrl: beforeUrl,
        afterPhotoUrl: afterUrl,
      };

      const newResults = [...resultsRef.current, roundResult];
      resultsRef.current = newResults;
      setResults(newResults);

      if (round < ROUNDS) {
        setRound(prev => prev + 1);
        setBeforePhoto(null);
        setAfterPhoto(null);
        setDistanceMoved('');
        setMaxShake(0);
        maxShakeRef.current = 0;
        setPhase('prepare');
      } else {
        setPhase('done');
      }
    } catch (error) {
      Alert.alert('Upload Error', 'Could not upload photos. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const getShakeColor = () => {
    if (shakeLevel < 0.1) return '#4caf50';
    if (shakeLevel < 0.3) return '#ffeb3b';
    return '#f44336';
  };

  return (
    <LinearGradient colors={['#4a90d9', '#1a3a5c']} style={styles.gradient}>
      <ScrollView contentContainerStyle={styles.container} scrollEnabled={phase === 'upload' || phase === 'done'}>

        {/* PREPARE */}
        {phase === 'prepare' && (
          <View style={styles.centeredBox}>
            <Text style={styles.title}>Round {round} of {ROUNDS}</Text>
            <Text style={styles.subtitle}>Earthquake Resistant Structure</Text>
            <View style={styles.checklistBox}>
              <Text style={styles.checklistTitle}>Before You Start:</Text>
              <Text style={styles.checklistItem}>☐ Build or modify your structure</Text>
              <Text style={styles.checklistItem}>☐ Mark the starting position on the table</Text>
              <Text style={styles.checklistItem}>☐ Have the other phone ready for photos</Text>
              <Text style={styles.checklistItem}>☐ Take a BEFORE photo with the other phone</Text>
              <Text style={styles.checklistItem}>☐ Place THIS phone flat on top of the structure</Text>
            </View>
            <View style={styles.reminderBox}>
              <Text style={styles.reminderText}>
                📸 Take the BEFORE photo NOW with another phone before tapping Start!
              </Text>
            </View>
            <TouchableOpacity style={styles.button} onPress={startCountdown}>
              <Text style={styles.buttonText}>Start Vibration Test</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* COUNTDOWN */}
        {phase === 'countdown' && (
          <View style={styles.centeredBox}>
            <Text style={styles.title}>Get Ready!</Text>
            <Text style={styles.subtitle}>Place phone on structure NOW!</Text>
            <Text style={styles.countdownNumber}>{countdown === 0 ? 'GO!' : countdown}</Text>
          </View>
        )}

        {/* VIBRATING */}
        {phase === 'vibrating' && (
          <View style={styles.centeredBox}>
            <Text style={styles.title}>🌋 Vibration Active!</Text>
            <Text style={styles.subtitle}>Keep phone on structure!</Text>
            <Text style={styles.bigTimer}>{timer}s</Text>
            <View style={styles.shakeBox}>
              <Text style={styles.shakeLabel}>Live Shake Level</Text>
              <View style={styles.shakeBarBg}>
                <View style={[styles.shakeBarFill, {
                  width: `${Math.min(100, shakeLevel * 300)}%`,
                  backgroundColor: getShakeColor(),
                }]} />
              </View>
              <Text style={[styles.shakeValue, { color: getShakeColor() }]}>
                {shakeLevel.toFixed(3)}
              </Text>
            </View>
            <Text style={styles.maxShakeText}>Peak Shake: {maxShake.toFixed(3)}</Text>
          </View>
        )}

        {/* UPLOAD */}
        {phase === 'upload' && (
          <View style={styles.centeredBox}>
            <Text style={styles.title}>📸 Round {round} — Upload Photos</Text>
            <Text style={styles.subtitle}>Peak Shake: {maxShake.toFixed(3)}</Text>
            <View style={styles.reminderBox}>
              <Text style={styles.reminderText}>
                📸 Take the AFTER photo NOW with the other phone before uploading!
              </Text>
            </View>
            <Text style={styles.photoLabel}>Before Photo:</Text>
            <TouchableOpacity style={styles.photoUploadBtn} onPress={() => pickImage('before')}>
              {beforePhoto ? (
                <Image source={{ uri: beforePhoto }} style={styles.photoPreview} />
              ) : (
                <Text style={styles.photoUploadText}>📁 Upload Before Photo</Text>
              )}
            </TouchableOpacity>
            <Text style={styles.photoLabel}>After Photo:</Text>
            <TouchableOpacity style={styles.photoUploadBtn} onPress={() => pickImage('after')}>
              {afterPhoto ? (
                <Image source={{ uri: afterPhoto }} style={styles.photoPreview} />
              ) : (
                <Text style={styles.photoUploadText}>📁 Upload After Photo</Text>
              )}
            </TouchableOpacity>
            <Text style={styles.photoLabel}>Distance Moved (cm):</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. 3.5"
              placeholderTextColor="#aaa"
              value={distanceMoved}
              onChangeText={setDistanceMoved}
              keyboardType="numeric"
            />
            <TouchableOpacity
              style={[styles.button, uploading && styles.buttonDisabled]}
              onPress={handleSaveRound}
              disabled={uploading}
            >
              <Text style={styles.buttonText}>
                {uploading ? 'Uploading...' : round < ROUNDS ? 'Save & Next Round →' : 'Save & Finish'}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* DONE */}
        {phase === 'done' && (
          <View style={styles.centeredBox}>
            <Text style={styles.title}>🎉 All Done!</Text>
            <Text style={styles.subtitle}>Here are your results:</Text>
            {resultsRef.current.map((r, i) => (
              <View key={i} style={styles.resultCard}>
                <Text style={styles.resultTitle}>Round {r.round}</Text>
                <Text style={styles.resultStat}>Peak Shake: {r.maxShake}</Text>
                <Text style={styles.resultStat}>Distance Moved: {r.distanceMoved} cm</Text>
                <View style={styles.photoRow}>
                  <Image source={{ uri: r.beforePhotoUrl }} style={styles.resultPhoto} />
                  <Image source={{ uri: r.afterPhotoUrl }} style={styles.resultPhoto} />
                </View>
                <Text style={styles.photoCaption}>Before / After</Text>
              </View>
            ))}
            <TouchableOpacity
              style={styles.button}
              onPress={() => navigation.navigate('Activity4Reflection', {
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
  subtitle: { fontSize: 14, color: '#d0e8ff', marginBottom: 16, textAlign: 'center' },
  checklistBox: {
    width: '100%', backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 16, padding: 16, marginBottom: 16,
  },
  checklistTitle: { fontSize: 14, fontWeight: 'bold', color: '#fff', marginBottom: 10, textAlign: 'center' },
  checklistItem: { fontSize: 13, color: '#d0e8ff', marginBottom: 8, lineHeight: 20 },
  reminderBox: {
    width: '100%', backgroundColor: 'rgba(255,165,0,0.2)',
    borderRadius: 16, padding: 14, marginBottom: 20,
    borderWidth: 1, borderColor: 'rgba(255,165,0,0.5)',
  },
  reminderText: { fontSize: 13, color: '#ffb74d', textAlign: 'center', lineHeight: 20, fontWeight: '600' },
  countdownNumber: { fontSize: 80, fontWeight: 'bold', color: '#ffe082', marginVertical: 20 },
  bigTimer: { fontSize: 72, fontWeight: 'bold', color: '#ffe082', marginVertical: 16 },
  shakeBox: { width: '100%', alignItems: 'center', marginBottom: 16 },
  shakeLabel: { fontSize: 14, color: '#d0e8ff', marginBottom: 8 },
  shakeBarBg: {
    width: '100%', height: 24, backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 12, overflow: 'hidden', marginBottom: 8,
  },
  shakeBarFill: { height: '100%', borderRadius: 12 },
  shakeValue: { fontSize: 18, fontWeight: 'bold' },
  maxShakeText: { fontSize: 14, color: '#ffe082', fontWeight: 'bold', marginBottom: 8 },
  photoLabel: { fontSize: 13, fontWeight: '600', color: '#e0f0ff', marginBottom: 8, alignSelf: 'flex-start' },
  photoUploadBtn: {
    width: '100%', height: 160, backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 16, justifyContent: 'center', alignItems: 'center',
    marginBottom: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)',
    overflow: 'hidden',
  },
  photoUploadText: { fontSize: 14, color: '#d0e8ff' },
  photoPreview: { width: '100%', height: '100%', resizeMode: 'cover' },
  input: {
    width: '100%', backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 16, padding: 14, fontSize: 14, color: '#fff',
    marginBottom: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)',
  },
  button: {
    backgroundColor: 'rgba(255,255,255,0.85)', borderRadius: 25,
    paddingVertical: 14, paddingHorizontal: 50, alignItems: 'center', marginTop: 8,
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { fontSize: 15, fontWeight: 'bold', color: '#1a3a5c', letterSpacing: 1 },
  resultCard: {
    width: '100%', backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 16, padding: 16, marginBottom: 12,
  },
  resultTitle: { fontSize: 15, fontWeight: 'bold', color: '#ffe082', marginBottom: 6 },
  resultStat: { fontSize: 13, color: '#d0e8ff', marginBottom: 4 },
  photoRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10, gap: 8 },
  resultPhoto: { width: '48%', height: 100, borderRadius: 10, resizeMode: 'cover' },
  photoCaption: { fontSize: 11, color: '#b0d4f1', textAlign: 'center', marginTop: 4 },
});