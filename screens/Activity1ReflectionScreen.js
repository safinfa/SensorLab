import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Speech from 'expo-speech';
import { useState } from 'react';
import { collection, addDoc, getDoc, doc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { auth, db, storage } from '../firebaseConfig';
import { Profanity } from '@2toad/profanity';
import { sendSubmitNotification } from '../utils/notifications';

const profanity = new Profanity();

export default function Activity1ReflectionScreen({ navigation, route }) {
  const { teamName, prediction, results, dropHeight, objectMass, location } = route?.params || {};
  const [reflection, setReflection] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');

  const reflectionPrompt = 'Time to reflect! Think about your parachute results. Which design had the longest drop time? How did the drag force differ between designs? Did your results match your prediction?';

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

  const bestDesign = results?.length > 1
    ? results.slice(1).reduce((best, r) =>
        parseFloat(r.dropTime) > parseFloat(best.dropTime) ? r : best, results[1])
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

      // Upload best design video to Firebase Storage
      let bestVideoUrl = null;
      if (bestDesign?.videoUri) {
        try {
          setUploadProgress('Uploading video...');
          const response = await fetch(bestDesign.videoUri);
          const blob = await response.blob();
          const timestamp = Date.now();
          const storageRef = ref(storage, `activity1/${user?.uid}/${timestamp}_best.mp4`);
          await uploadBytes(storageRef, blob);
          bestVideoUrl = await getDownloadURL(storageRef);
          setUploadProgress('Video uploaded! Saving results...');
        } catch (uploadError) {
          console.log('Video upload error:', uploadError);
          setUploadProgress('Video upload failed, saving results without video...');
        }
      }

      await addDoc(collection(db, 'leaderboard'), {
        teamName: teamName || 'Unknown Team',
        userId: user?.uid || 'anonymous',
        activityId: 1,
        activityName: 'Parachute Drop Challenge',
        totalScore: bestDesign ? parseFloat(bestDesign.dropTime) * 1000 : 0,
        bestDesign: {
          ...bestDesign,
          videoUrl: bestVideoUrl,
          videoUri: null,
        },
        results: results.map(r => ({ ...r, videoUri: null })),
        dropHeight,
        objectMass,
        prediction: prediction || '',
        reflection,
        profilePictureUrl,
        location: location || null,
        createdAt: new Date().toISOString(),
      });

      // Send submit notification
      sendSubmitNotification('Parachute Drop Challenge');

      Alert.alert('Submitted! 🎉', 'Your results have been saved!', [
        { text: 'View Leaderboard', onPress: () => navigation.navigate('Leaderboard', { teamName, activityId: 1 }) }
      ]);
    } catch (error) {
      console.log('Submit error:', error);
      Alert.alert('Error', 'Could not save results. Please try again.');
    } finally {
      setSubmitting(false);
      setUploadProgress('');
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

        {bestDesign && (
          <View style={styles.summaryBox}>
            <Text style={styles.summaryTitle}>🏆 Best Parachute Design</Text>
            <Text style={styles.bestName}>{bestDesign.design}</Text>
            <Text style={styles.bestTime}>{bestDesign.dropTime}s drop time</Text>
            <Text style={styles.bestForce}>Drag Force: {bestDesign.dragForce} N</Text>
            {bestDesign.videoUri && (
              <Text style={styles.videoNote}>📹 Best drop video will be uploaded to leaderboard</Text>
            )}
          </View>
        )}

        {/* Drop Location */}
        {location && (
          <View style={styles.locationBox}>
            <Text style={styles.locationTitle}>📍 Drop Location</Text>
            <Text style={styles.locationAddress}>{location.address}</Text>
            <Text style={styles.locationCoords}>
              {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
            </Text>
          </View>
        )}

        <View style={styles.allResultsBox}>
          <Text style={styles.sectionTitle}>All Results:</Text>
          {results?.map((r, i) => (
            <View key={i} style={styles.resultRow}>
              <Text style={styles.resultName}>{r.design}</Text>
              <Text style={styles.resultTime}>{r.dropTime}s — {r.finalVelocity}m/s</Text>
            </View>
          ))}
        </View>

        <View style={styles.questionsBox}>
          <Text style={styles.sectionTitle}>Think About It:</Text>
          <Text style={styles.question}>• Which design had the longest drop time?</Text>
          <Text style={styles.question}>• How much did the parachute slow the fall?</Text>
          <Text style={styles.question}>• What design features made the best parachute?</Text>
          <Text style={styles.question}>• Did your results match your prediction?</Text>
          <Text style={styles.question}>• How do real parachutes use these principles?</Text>
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
  bestName: { fontSize: 18, color: '#fff', marginBottom: 4 },
  bestTime: { fontSize: 32, fontWeight: 'bold', color: '#ffe082', marginBottom: 4 },
  bestForce: { fontSize: 13, color: '#4caf50', fontWeight: 'bold' },
  videoNote: { fontSize: 12, color: '#b0d4f1', marginTop: 8, fontStyle: 'italic' },
  locationBox: {
    width: '100%', backgroundColor: 'rgba(76,175,80,0.15)',
    borderRadius: 16, padding: 14, marginBottom: 16,
    alignItems: 'center', borderWidth: 1,
    borderColor: 'rgba(76,175,80,0.4)',
  },
  locationTitle: { fontSize: 13, fontWeight: 'bold', color: '#4caf50', marginBottom: 4 },
  locationAddress: { fontSize: 13, color: '#fff', textAlign: 'center', marginBottom: 4 },
  locationCoords: { fontSize: 11, color: '#b0d4f1' },
  allResultsBox: {
    width: '100%', backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 16, padding: 16, marginBottom: 16,
  },
  sectionTitle: { fontSize: 15, fontWeight: 'bold', color: '#fff', marginBottom: 10 },
  resultRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  resultName: { fontSize: 13, color: '#d0e8ff' },
  resultTime: { fontSize: 13, fontWeight: 'bold', color: '#ffe082' },
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