import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Speech from 'expo-speech';
import { useState, useEffect } from 'react';

export default function Activity4IntroScreen({ navigation, route }) {
  const teamName = route?.params?.teamName || 'Student';
  const [isSpeaking, setIsSpeaking] = useState(false);

  const introText = 'Welcome to Activity 4: Earthquake Resistant Structure. In this activity you will build a structure and test how well it withstands vibrations. Place your phone on top of the structure, and use another phone to take photos before and after the vibration test. You will then measure how far the structure moved and upload your photos.';

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

        <Image source={require('../assets/act4_earthquake.png')} style={styles.icon} resizeMode="contain" />

        <Text style={styles.description}>
          Students build structures and test how well they resist earthquake-like vibrations. The phone's accelerometer and gyroscope measure the shaking while the structure is tested.
        </Text>

        <View style={styles.objectiveBox}>
          <Text style={styles.objectiveTitle}>Your Objective?</Text>
          <Text style={styles.objectiveItem}>• Build a structure from available materials.</Text>
          <Text style={styles.objectiveItem}>• Place your phone ON TOP of the structure.</Text>
          <Text style={styles.objectiveItem}>• Use ANOTHER phone to take a photo BEFORE the test.</Text>
          <Text style={styles.objectiveItem}>• The app will simulate earthquake vibrations.</Text>
          <Text style={styles.objectiveItem}>• After vibrations stop, take ANOTHER photo of the structure.</Text>
          <Text style={styles.objectiveItem}>• Measure how far the structure moved in cm.</Text>
          <Text style={styles.objectiveItem}>• Upload both photos and record your results.</Text>
        </View>

        <View style={styles.equipmentBox}>
          <Text style={styles.equipmentTitle}>Equipment Needed:</Text>
          <Text style={styles.equipmentItem}>🧱 Building materials (paper, cardboard, sticks, tape)</Text>
          <Text style={styles.equipmentItem}>📱 This phone (placed on structure)</Text>
          <Text style={styles.equipmentItem}>📸 Another phone (to take photos)</Text>
          <Text style={styles.equipmentItem}>📏 Ruler (to measure movement)</Text>
        </View>

        <TouchableOpacity
          style={styles.button}
          onPress={() => {
            Speech.stop();
            navigation.navigate('Activity4Instructions', { teamName });
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