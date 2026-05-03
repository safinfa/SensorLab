import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Speech from 'expo-speech';
import { useState } from 'react';
import { collection, addDoc } from 'firebase/firestore';
import { auth, db } from '../firebaseConfig';
import { Profanity } from '@2toad/profanity';

const profanity = new Profanity();

export default function Activity5ReflectionScreen({ navigation, route }) {
  const { teamName, prediction, results } = route?.params || {};
  const [reflection, setReflection] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const reflectionPrompt = 'Time to reflect! Think about your experience. Which movement was the hardest to keep smooth? Were the noise levels you recorded surprising? Write your thoughts in the box below, then submit to see the leaderboard.';

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

  const totalScore = results
    ? Math.round(results.reduce((sum, r) => sum + r.graceScore, 0) / results.length)
    : 0;

  const bestMovement = results
    ? results.reduce((best, r) => r.graceScore > best.graceScore ? r : best, results[0])
    : null;

  const handleSubmit = async () => {
    if (!reflection.trim()) {
      Alert.alert('Oops!', 'Please write a reflection before submitting.');
      return;
    }

    // Bad words filter check
    if (profanity.exists(reflection)) {
      Alert.alert(
        '⚠️ Inappropriate Language',
        'Your reflection contains inappropriate words. Please keep it respectful and try again.',
        [{ text: 'OK' }]
      );
      return;
    }

    setSubmitting(true);
    try {
      const user = auth.currentUser;
      await addDoc(collection(db, 'leaderboard'), {
        teamName: teamName || 'Unknown Team',
        userId: user?.uid || 'anonymous',
        activityId: 5,
        activityName: 'Stretch Speed & Gracefulness',
        totalScore,
        results,
        prediction: prediction || '',
        reflection,
        createdAt: new Date().toISOString(),
      });

      Alert.alert('Submitted! 🎉', 'Your results have been saved to the leaderboard!', [
        {
          text: 'View Leaderboard',
          onPress: () => navigation.navigate('Leaderboard', { teamName, activityId: 5 }),
        },
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

        {/* Speaker Toggle */}
        <TouchableOpacity style={styles.speakerButton} onPress={toggleSpeech}>
          <Text style={styles.speakerIcon}>{isSpeaking ? '🔊' : '🔇'}</Text>
          <Text style={styles.speakerLabel}>{isSpeaking ? 'Stop Reading' : 'Read Aloud'}</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Reflection Time 🧠</Text>

        {/* Score Summary */}
        <View style={styles.summaryBox}>
          <Text style={styles.summaryTitle}>Your Final Score</Text>
          <Text style={styles.scoreNumber}>{totalScore} / 100</Text>
          {bestMovement && (
            <Text style={styles.summarySubtext}>
              Best: {bestMovement.movement} ({bestMovement.graceScore}/100)
            </Text>
          )}
        </View>

        {/* Results Breakdown */}
        <View style={styles.breakdownBox}>
          <Text style={styles.sectionTitle}>Results Breakdown</Text>
          {results?.map((r, i) => (
            <View key={i} style={styles.resultRow}>
              <Text style={styles.resultName}>{r.movement}</Text>
              <Text style={styles.resultScore}>{r.graceScore}/100</Text>
            </View>
          ))}
        </View>

        {/* Reflection Questions */}
        <View style={styles.questionsBox}>
          <Text style={styles.sectionTitle}>Think About It:</Text>
          <Text style={styles.question}>• Which movement was the hardest to keep smooth?</Text>
          <Text style={styles.question}>• Did your results match your prediction?</Text>
          <Text style={styles.question}>• How could you improve your grace score?</Text>
          <Text style={styles.question}>• What did you learn about body coordination?</Text>
        </View>

        {/* Reflection Input */}
        <TextInput
          style={styles.reflectionInput}
          placeholder="Write your reflection or feedback and future improvements..."
          placeholderTextColor="#aaa"
          value={reflection}
          onChangeText={setReflection}
          multiline
          numberOfLines={6}
        />

        {/* Buttons */}
        <TouchableOpacity
          style={styles.submitButton}
          onPress={handleSubmit}
          disabled={submitting}
        >
          <Text style={styles.submitButtonText}>
            {submitting ? 'Submitting...' : 'Submit & View Leaderboard'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.endButton}
          onPress={() => navigation.navigate('Home', { teamName })}
        >
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
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-end',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  speakerIcon: { fontSize: 18, marginRight: 6 },
  speakerLabel: { fontSize: 13, color: '#fff', fontWeight: '600' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#fff', marginBottom: 20, textAlign: 'center' },
  summaryBox: {
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    marginBottom: 16,
  },
  summaryTitle: { fontSize: 14, color: '#d0e8ff', marginBottom: 6 },
  scoreNumber: { fontSize: 48, fontWeight: 'bold', color: '#ffe082', marginBottom: 4 },
  summarySubtext: { fontSize: 13, color: '#d0e8ff' },
  breakdownBox: {
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: { fontSize: 15, fontWeight: 'bold', color: '#fff', marginBottom: 10 },
  resultRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  resultName: { fontSize: 13, color: '#d0e8ff' },
  resultScore: { fontSize: 13, fontWeight: 'bold', color: '#ffe082' },
  questionsBox: {
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  question: { fontSize: 13, color: '#d0e8ff', marginBottom: 6, lineHeight: 20 },
  reflectionInput: {
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 16,
    padding: 16,
    fontSize: 14,
    color: '#fff',
    minHeight: 120,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    textAlignVertical: 'top',
  },
  submitButton: {
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.85)',
    borderRadius: 25,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 12,
  },
  submitButtonText: { fontSize: 15, fontWeight: 'bold', color: '#1a3a5c', letterSpacing: 1 },
  endButton: {
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 25,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  endButtonText: { fontSize: 15, color: '#fff', letterSpacing: 1 },
});