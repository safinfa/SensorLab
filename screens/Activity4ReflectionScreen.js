import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Alert, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Speech from 'expo-speech';
import { useState } from 'react';
import { collection, addDoc, getDoc, doc } from 'firebase/firestore';
import { auth, db } from '../firebaseConfig';
import { Profanity } from '@2toad/profanity';

const profanity = new Profanity();

export default function Activity4ReflectionScreen({ navigation, route }) {
  const { teamName, prediction, results } = route?.params || {};
  const [reflection, setReflection] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const reflectionPrompt = 'Time to reflect! Think about your earthquake structure results. How far did your structure move? What could you change to make it more stable? Write your thoughts below.';

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

  const bestRound = results?.length > 0
    ? results.reduce((best, r) => r.distanceMoved < best.distanceMoved ? r : best, results[0])
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
        activityId: 4,
        activityName: 'Earthquake Resistant Structure',
        totalScore: bestRound ? Math.max(0, Math.round(1000 - bestRound.distanceMoved * 100)) : 0,
        bestRound,
        results,
        prediction: prediction || '',
        reflection,
        profilePictureUrl,
        createdAt: new Date().toISOString(),
      });
      Alert.alert('Submitted! 🎉', 'Your results have been saved!', [
        { text: 'View Leaderboard', onPress: () => navigation.navigate('Leaderboard', { teamName, activityId: 4 }) }
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

        {bestRound && (
          <View style={styles.summaryBox}>
            <Text style={styles.summaryTitle}>🏆 Best Round</Text>
            <Text style={styles.bestValue}>{bestRound.distanceMoved} cm moved</Text>
            <Text style={styles.bestDetail}>Round {bestRound.round} — Peak Shake: {bestRound.maxShake}</Text>
            <View style={styles.photoRow}>
              <Image source={{ uri: bestRound.beforePhotoUrl }} style={styles.photo} />
              <Image source={{ uri: bestRound.afterPhotoUrl }} style={styles.photo} />
            </View>
            <Text style={styles.photoCaption}>Before / After</Text>
          </View>
        )}

        <View style={styles.questionsBox}>
          <Text style={styles.sectionTitle}>Think About It:</Text>
          <Text style={styles.question}>• How far did your structure move in each round?</Text>
          <Text style={styles.question}>• Which round had the least movement? Why?</Text>
          <Text style={styles.question}>• What materials made your structure more stable?</Text>
          <Text style={styles.question}>• Did your results match your prediction?</Text>
          <Text style={styles.question}>• How could real buildings use these principles?</Text>
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
  bestValue: { fontSize: 36, fontWeight: 'bold', color: '#ffe082', marginBottom: 4 },
  bestDetail: { fontSize: 13, color: '#d0e8ff', marginBottom: 12, textAlign: 'center' },
  photoRow: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', gap: 8 },
  photo: { width: '48%', height: 100, borderRadius: 10, resizeMode: 'cover' },
  photoCaption: { fontSize: 11, color: '#b0d4f1', textAlign: 'center', marginTop: 4 },
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