import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Speech from 'expo-speech';
import { useState } from 'react';
import { collection, addDoc, getDoc, doc } from 'firebase/firestore';
import { auth, db } from '../firebaseConfig';
import { Profanity } from '@2toad/profanity';

const profanity = new Profanity();

export default function Activity7ReflectionScreen({ navigation, route }) {
  const { teamName, prediction, results } = route?.params || {};
  const [reflection, setReflection] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const reflectionPrompt = 'Time to reflect! Think about your breathing results. How did exercise change your breathing rate? Were you surprised? Write your thoughts below.';

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
        activityId: 7,
        activityName: 'Breathing Pace Trainer',
        totalScore: results?.rest || 0,
        results,
        prediction: prediction || '',
        reflection,
        profilePictureUrl,
        createdAt: new Date().toISOString(),
      });
      Alert.alert('Submitted! 🎉', 'Your results have been saved!', [
        { text: 'View Leaderboard', onPress: () => navigation.navigate('Leaderboard', { teamName, activityId: 7 }) }
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

        <View style={styles.summaryBox}>
          <Text style={styles.summaryTitle}>Your Breathing Results</Text>
          <Text style={styles.resultRow}>😌 At Rest: {results?.rest} BPM</Text>
          <Text style={styles.resultRow}>🏃 After Jogging: {results?.afterExercise1} BPM</Text>
          <Text style={styles.resultRow}>⭐ After Star Jumps: {results?.afterExercise2} BPM</Text>
        </View>

        <View style={styles.questionsBox}>
          <Text style={styles.sectionTitle}>Think About It:</Text>
          <Text style={styles.question}>• How much did exercise increase your breathing rate?</Text>
          <Text style={styles.question}>• Which exercise caused a bigger change?</Text>
          <Text style={styles.question}>• Did your results match your prediction?</Text>
          <Text style={styles.question}>• Why does breathing rate increase during exercise?</Text>
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
    width: '100%', backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 20, padding: 20, marginBottom: 16,
  },
  summaryTitle: { fontSize: 15, fontWeight: 'bold', color: '#fff', marginBottom: 10, textAlign: 'center' },
  resultRow: { fontSize: 14, color: '#ffe082', marginBottom: 6, textAlign: 'center' },
  questionsBox: {
    width: '100%', backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 16, padding: 16, marginBottom: 16,
  },
  sectionTitle: { fontSize: 15, fontWeight: 'bold', color: '#fff', marginBottom: 10 },
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