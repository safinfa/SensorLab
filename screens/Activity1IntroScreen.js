import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Speech from 'expo-speech';
import { useState, useEffect } from 'react';

export default function Activity1IntroScreen({ navigation, route }) {
  const teamName = route?.params?.teamName || 'Student';
  const [isSpeaking, setIsSpeaking] = useState(false);

  const introText = 'Welcome to Activity 1: Parachute Drop Challenge. In this activity you will build a parachute and test how well it slows a falling object. The app will use your camera to detect the drop and automatically time it. You will then compare different parachute designs.';

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

        <Image source={require('../assets/act1_parachute.png')} style={styles.icon} resizeMode="contain" />

        <Text style={styles.description}>
          Students investigate how parachute design affects the speed of a falling object. The app uses your camera to automatically detect when the object is dropped and when it lands, giving you an accurate drop time.
        </Text>

        <View style={styles.objectiveBox}>
          <Text style={styles.objectiveTitle}>Your Objective?</Text>
          <Text style={styles.objectiveItem}>• Build a parachute from a plastic bag or paper.</Text>
          <Text style={styles.objectiveItem}>• Attach it to a small object (eraser, toy, etc.).</Text>
          <Text style={styles.objectiveItem}>• Drop without parachute first as baseline.</Text>
          <Text style={styles.objectiveItem}>• Test up to 3 different parachute designs.</Text>
          <Text style={styles.objectiveItem}>• App detects the drop using camera motion detection.</Text>
          <Text style={styles.objectiveItem}>• Compare drop times and calculate drag force.</Text>
        </View>

        <View style={styles.equipmentBox}>
          <Text style={styles.equipmentTitle}>Equipment Needed:</Text>
          <Text style={styles.equipmentItem}>🪂 Plastic bag or paper for parachute</Text>
          <Text style={styles.equipmentItem}>📎 String or rubber bands</Text>
          <Text style={styles.equipmentItem}>🧸 Small object to attach (eraser, toy)</Text>
          <Text style={styles.equipmentItem}>📏 Ruler to measure drop height</Text>
          <Text style={styles.equipmentItem}>⚖️ Scale to measure object mass (grams)</Text>
        </View>

        <TouchableOpacity
          style={styles.button}
          onPress={() => {
            Speech.stop();
            navigation.navigate('Activity1Instructions', { teamName });
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
  objectiveBox: { width: '100%', marginBottom: 16 },
  objectiveTitle: { fontSize: 15, fontWeight: 'bold', color: '#fff', textAlign: 'center', marginBottom: 12 },
  objectiveItem: { fontSize: 13, color: '#d0e8ff', marginBottom: 8, lineHeight: 20 },
  equipmentBox: {
    width: '100%', backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 16, padding: 16, marginBottom: 28,
  },
  equipmentTitle: { fontSize: 14, fontWeight: 'bold', color: '#fff', marginBottom: 10, textAlign: 'center' },
  equipmentItem: { fontSize: 13, color: '#d0e8ff', marginBottom: 8 },
  button: {
    backgroundColor: 'rgba(255,255,255,0.85)', borderRadius: 25,
    paddingVertical: 14, paddingHorizontal: 60, alignItems: 'center',
  },
  buttonText: { fontSize: 15, fontWeight: 'bold', color: '#1a3a5c', letterSpacing: 1 },
});