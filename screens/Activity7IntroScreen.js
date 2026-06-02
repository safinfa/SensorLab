import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Speech from 'expo-speech';
import { useState, useEffect } from 'react';

export default function Activity7IntroScreen({ navigation, route }) {
  const teamName = route?.params?.teamName || 'Student';
  const [isSpeaking, setIsSpeaking] = useState(false);

  const introText = 'Welcome to Activity 7: Breathing Pace Trainer. In this activity, you will place your phone on your chest and the app will detect your breathing using the accelerometer. You will record your breathing at rest, then after two exercises, and compare the results.';

  const toggleSpeech = () => {
    if (isSpeaking) {
      Speech.stop();
      setIsSpeaking(false);
    } else {
      setIsSpeaking(true);
      Speech.speak(introText, {
        rate: 0.85,
        onDone: () => setIsSpeaking(false),
        onStopped: () => setIsSpeaking(false),
      });
    }
  };

  useEffect(() => {
    return () => Speech.stop();
  }, []);

  return (
    <LinearGradient colors={['#4a90d9', '#1a3a5c']} style={styles.gradient}>
      <ScrollView contentContainerStyle={styles.container}>

        <TouchableOpacity style={styles.speakerButton} onPress={toggleSpeech}>
          <Text style={styles.speakerIcon}>{isSpeaking ? '🔊' : '🔇'}</Text>
          <Text style={styles.speakerLabel}>{isSpeaking ? 'Stop Reading' : 'Read Aloud'}</Text>
        </TouchableOpacity>

        <Image source={require('../assets/act7_breathing.png')} style={styles.icon} resizeMode="contain" />

        <Text style={styles.description}>
          Students analyse breathing patterns at rest and after exercise. The phone's accelerometer detects chest movement to count breaths per minute.
        </Text>

        <View style={styles.objectiveBox}>
          <Text style={styles.objectiveTitle}>Your Objective?</Text>
          <Text style={styles.objectiveItem}>• Place your phone flat on your chest.</Text>
          <Text style={styles.objectiveItem}>• Record your breathing rate at rest.</Text>
          <Text style={styles.objectiveItem}>• Perform Exercise 1: Jog on the spot for 1 minute.</Text>
          <Text style={styles.objectiveItem}>• Perform Exercise 2: Complete 100 star jumps.</Text>
          <Text style={styles.objectiveItem}>• Record your breathing rate after each exercise.</Text>
          <Text style={styles.objectiveItem}>• Compare how exercise affects your breathing.</Text>
        </View>

        <TouchableOpacity
          style={styles.button}
          onPress={() => {
            Speech.stop();
            navigation.navigate('Activity7Instructions', { teamName });
          }}
        >
          <Text style={styles.buttonText}>Start Activity</Text>
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
  icon: { width: 140, height: 140, marginBottom: 20 },
  description: { fontSize: 14, color: '#e0f0ff', textAlign: 'center', marginBottom: 24, lineHeight: 22 },
  objectiveBox: { width: '100%', marginBottom: 32 },
  objectiveTitle: { fontSize: 15, fontWeight: 'bold', color: '#fff', textAlign: 'center', marginBottom: 12 },
  objectiveItem: { fontSize: 13, color: '#d0e8ff', marginBottom: 8, lineHeight: 20 },
  button: {
    backgroundColor: 'rgba(255,255,255,0.85)', borderRadius: 25,
    paddingVertical: 14, paddingHorizontal: 60, alignItems: 'center',
  },
  buttonText: { fontSize: 15, fontWeight: 'bold', color: '#1a3a5c', letterSpacing: 1 },
});