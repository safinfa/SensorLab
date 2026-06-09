import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Alert, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Speech from 'expo-speech';
import { useState } from 'react';
import { collection, addDoc, getDoc, doc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { auth, db, storage } from '../firebaseConfig';
import { Profanity } from '@2toad/profanity';
import { sendSubmitNotification } from '../utils/notifications';

const profanity = new Profanity();

export default function Activity3ReflectionScreen({ navigation, route }) {
  const { teamName, prediction, results } = route?.params || {};
  const [reflection, setReflection] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');

  const reflectionPrompt = 'Time to reflect! Think about your hand fan results. Which design bent the paper the most? Did distance make a big difference? Was cardboard harder to bend than paper? Write your thoughts below.';

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

  const getBestReading = () => {
    if (!results || results.length === 0) return null;
    return results.reduce((best, r) => r.actualAngle > best.actualAngle ? r : best, results[0]);
  };

  const best = getBestReading();
  const totalScore = best ? Math.round(best.actualAngle) : 0;

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

      // Upload photos to Firebase Storage
      setUploadProgress('Uploading photos...');
      const resultsWithUrls = await Promise.all(results.map(async (r) => {
        if (!r.photoUri) return { ...r, photoUri: null, photoUrl: null };
        try {
          const response = await fetch(r.photoUri);
          const blob = await response.blob();
          const storageRef = ref(storage, `activity3/${user?.uid}/${Date.now()}_${r.design}_${r.distance}.jpg`);
          await uploadBytes(storageRef, blob);
          const photoUrl = await getDownloadURL(storageRef);
          return { ...r, photoUri: null, photoUrl };
        } catch (e) {
          console.log('Photo upload error:', e);
          return { ...r, photoUri: null, photoUrl: null };
        }
      }));

      setUploadProgress('Saving results...');

      // Get best reading with photo url
      const bestWithUrl = resultsWithUrls.reduce((b, r) =>
        r.actualAngle > b.actualAngle ? r : b, resultsWithUrls[0]);

      await addDoc(collection(db, 'leaderboard'), {
        teamName: teamName || 'Unknown Team',
        userId: user?.uid || 'anonymous',
        activityId: 3,
        activityName: 'Hand Fan Challenge',
        totalScore,
        bestReading: bestWithUrl,
        results: resultsWithUrls,
        prediction: prediction || '',
        reflection,
        profilePictureUrl,
        createdAt: new Date().toISOString(),
      });

      // Send submit notification
      sendSubmitNotification('Hand Fan Challenge');

      Alert.alert('Submitted! 🎉', 'Your results have been saved!', [
        { text: 'View Leaderboard', onPress: () => navigation.navigate('Leaderboard', { teamName, activityId: 3 }) }
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

        {best && (
          <View style={styles.summaryBox}>
            <Text style={styles.summaryTitle}>🏆 Best Result</Text>
            <Text style={styles.bestAngle}>{best.actualAngle}°</Text>
            <Text style={styles.bestDetail}>{best.design} — {best.material} at {best.distance}</Text>
            <Text style={styles.bestForce}>Estimated Force: {best.estimatedForce} N</Text>
            {best.photoUri && (
              <Image
                source={{ uri: best.photoUri }}
                style={styles.bestPhoto}
              />
            )}
          </View>
        )}

        <View style={styles.questionsBox}>
          <Text style={styles.sectionTitle}>Think About It:</Text>
          <Text style={styles.question}>• Which fan design bent the paper the most?</Text>
          <Text style={styles.question}>• How did distance affect the bend angle?</Text>
          <Text style={styles.question}>• Was cardboard harder to bend than paper? Why?</Text>
          <Text style={styles.question}>• Did your results match your prediction?</Text>
          <Text style={styles.question}>• What would happen if you used an even bigger fan?</Text>
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

        {uploadProgress ? (
          <View style={styles.progressBox}>
            <Text style={styles.progressText}>⏳ {uploadProgress}</Text>
          </View>
        ) : null}

        <TouchableOpacity
          style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={submitting}
        >
          <Text style={styles.submitButtonText}>
            {submitting ? uploadProgress || 'Submitting...' : 'Submit & View Leaderboard'}
          </Text>
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
  bestAngle: { fontSize: 48, fontWeight: 'bold', color: '#ffe082', marginBottom: 4 },
  bestDetail: { fontSize: 13, color: '#d0e8ff', marginBottom: 4, textAlign: 'center' },
  bestForce: { fontSize: 13, color: '#4caf50', fontWeight: 'bold' },
  bestPhoto: {
    width: '100%', height: 160, borderRadius: 12,
    marginTop: 12, resizeMode: 'cover',
  },
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
  progressBox: {
    width: '100%', backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12, padding: 12, marginBottom: 12, alignItems: 'center',
  },
  progressText: { fontSize: 13, color: '#ffe082' },
  submitButton: {
    width: '100%', backgroundColor: 'rgba(255,255,255,0.85)',
    borderRadius: 25, paddingVertical: 14, alignItems: 'center', marginBottom: 12,
  },
  submitButtonDisabled: { opacity: 0.6 },
  submitButtonText: { fontSize: 15, fontWeight: 'bold', color: '#1a3a5c', letterSpacing: 1 },
  endButton: {
    width: '100%', backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 25, paddingVertical: 14, alignItems: 'center',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)',
  },
  endButtonText: { fontSize: 15, color: '#fff', letterSpacing: 1 },
});