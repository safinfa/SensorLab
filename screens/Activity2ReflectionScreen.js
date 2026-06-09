import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Speech from 'expo-speech';
import { useState } from 'react';
import { collection, addDoc, getDoc, doc } from 'firebase/firestore';
import { auth, db } from '../firebaseConfig';
import { Profanity } from '@2toad/profanity';
import { sendSubmitNotification } from '../utils/notifications';

const profanity = new Profanity();

export default function Activity2ReflectionScreen({ navigation, route }) {
  const { teamName, prediction, results } = route?.params || {};
  const [reflection, setReflection] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const reflectionPrompt = 'Time to reflect! Think about your sound measurements. Which sound was loudest? Were you surprised by any results? How could these noise levels affect health or the environment? Write your thoughts below.';

  const toggleSpeech = () => {
    if (isSpeaking) {
      Speech.stop();
      setIsSpeaking(false);
    } else {
      setIsSpeaking(true);
      Speech.speak(reflectionPrompt, {
        rate: 0.85,
        onDone: () => setIsSpeaking(false),
        onStopped: () => setIsSpeaking(false),
      });
    }
  };

  const loudest = results?.length > 0
    ? results.reduce((max, r) => r.actualDb > max.actualDb ? r : max, results[0])
    : null;

  const handleSubmit = async () => {
    if (!reflection.trim()) {
      Alert.alert('Oops!', 'Please write a reflection before submitting.');
      return;
    }
    if (profanity.exists(reflection)) {
      Alert.alert('⚠️ Inappropriate Language', 'Your reflection contains inappropriate words. Please keep it respectful.');
      return;
    }
    setSubmitting(true);
    try {
      const user = auth.currentUser;

      // Fetch profile picture
      let profilePictureUrl = null;
      try {
        const profileDoc = await getDoc(doc(db, 'teams', user?.uid));
        if (profileDoc.exists()) {
          profilePictureUrl = profileDoc.data()?.profilePictureUrl || null;
        }
      } catch (e) {}

      await addDoc(collection(db, 'leaderboard'), {
        teamName: teamName || 'Unknown Team',
        userId: user?.uid || 'anonymous',
        activityId: 2,
        activityName: 'Sound Pollution Hunter',
        totalScore: loudest?.actualDb || 0,
        loudestSound: loudest,
        results,
        prediction: prediction || '',
        reflection,
        profilePictureUrl,
        createdAt: new Date().toISOString(),
      });

      // Send submit notification
      sendSubmitNotification('Sound Pollution Hunter');

      Alert.alert('Submitted! 🎉', 'Your results have been saved!', [
        { text: 'View Leaderboard', onPress: () => navigation.navigate('Leaderboard', { teamName, activityId: 2 }) }
      ]);
    } catch (error) {
      Alert.alert('Error', 'Could not save results. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <LinearGradient colors={['#4a90d9', '#1a3a5c']} style={styles.gradient}>
      <ScrollView contentContainerStyle={styles.container}>

        <TouchableOpacity style={styles.speakerButton} onPress={toggleSpeech}>
          <Text style={styles.speakerIcon}>{isSpeaking ? '🔊' : '🔇'}</Text>
          <Text style={styles.speakerLabel}>{isSpeaking ? 'Stop Reading' : 'Read Aloud'}</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Reflection Time 🧠</Text>

        {loudest && (
          <View style={styles.summaryBox}>
            <Text style={styles.summaryTitle}>🏆 Loudest Sound</Text>
            <Text style={styles.loudestEmoji}>{loudest.emoji}</Text>
            <Text style={styles.loudestName}>{loudest.sound}</Text>
            <Text style={styles.loudestDb}>{loudest.actualDb} dB</Text>
          </View>
        )}

        <View style={styles.allResultsBox}>
          <Text style={styles.sectionTitle}>All Results:</Text>
          {results?.map((r, i) => (
            <View key={i} style={styles.resultRow}>
              <Text style={styles.resultName}>{r.emoji} {r.sound}</Text>
              <Text style={styles.resultDb}>{r.actualDb} dB</Text>
            </View>
          ))}
        </View>

        <View style={styles.questionsBox}>
          <Text style={styles.sectionTitle}>Think About It:</Text>
          <Text style={styles.question}>• Which sound was loudest? Were you surprised?</Text>
          <Text style={styles.question}>• How did your predictions compare to actual results?</Text>
          <Text style={styles.question}>• Were the noise levels you recorded dangerous?</Text>
          <Text style={styles.question}>• How could these sound levels impact health or environment?</Text>
          <Text style={styles.question}>• What did you learn about noise pollution?</Text>
        </View>

        <TextInput
          style={styles.reflectionInput}
          placeholder="Write your reflection or feedback and future improvements..."
          placeholderTextColor="#aaa"
          value={reflection}
          onChangeText={setReflection}
          multiline
          numberOfLines={6}
          textAlignVertical="top"
        />

        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit} disabled={submitting}>
          <Text style={styles.submitButtonText}>{submitting ? 'Submitting...' : 'Submit & View Leaderboard'}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.endButton} onPress={() => navigation.navigate('Home', { teamName })}>
          <Text style={styles.endButtonText}>End Activity</Text>
        </TouchableOpacity>

      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  container: { alignItems: 'center', paddingTop: 50, paddingBottom: 40, paddingHorizontal: 24 },
  speakerButton: {
    flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-end',
    backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 20,
    paddingHorizontal: 14, paddingVertical: 8, marginBottom: 16,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)',
  },
  speakerIcon: { fontSize: 18, marginRight: 6 },
  speakerLabel: { fontSize: 13, color: '#fff', fontWeight: '600' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#fff', marginBottom: 20, textAlign: 'center' },
  summaryBox: {
    width: '100%', backgroundColor: 'rgba(255,215,0,0.15)',
    borderRadius: 20, padding: 20, alignItems: 'center',
    marginBottom: 16, borderWidth: 2, borderColor: '#FFD700',
  },
  summaryTitle: { fontSize: 14, fontWeight: 'bold', color: '#FFD700', marginBottom: 4 },
  loudestEmoji: { fontSize: 40, marginBottom: 4 },
  loudestName: { fontSize: 16, color: '#fff', marginBottom: 4 },
  loudestDb: { fontSize: 36, fontWeight: 'bold', color: '#ffe082' },
  allResultsBox: {
    width: '100%', backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 16, padding: 16, marginBottom: 16,
  },
  sectionTitle: { fontSize: 15, fontWeight: 'bold', color: '#fff', marginBottom: 10 },
  resultRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  resultName: { fontSize: 13, color: '#d0e8ff' },
  resultDb: { fontSize: 13, fontWeight: 'bold', color: '#ffe082' },
  questionsBox: {
    width: '100%', backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 16, padding: 16, marginBottom: 16,
  },
  question: { fontSize: 13, color: '#d0e8ff', marginBottom: 6, lineHeight: 20 },
  reflectionInput: {
    width: '100%', backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 16, padding: 16, fontSize: 14, color: '#fff',
    minHeight: 120, marginBottom: 20, borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  submitButton: {
    width: '100%', backgroundColor: 'rgba(255,255,255,0.85)',
    borderRadius: 25, paddingVertical: 14, alignItems: 'center', marginBottom: 12,
  },
  submitButtonText: { fontSize: 15, fontWeight: 'bold', color: '#1a3a5c', letterSpacing: 1 },
  endButton: {
    width: '100%', backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 25, paddingVertical: 14, alignItems: 'center',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)',
  },
  endButtonText: { fontSize: 15, color: '#fff', letterSpacing: 1 },
});