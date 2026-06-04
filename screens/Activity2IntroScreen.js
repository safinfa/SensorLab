import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Speech from 'expo-speech';
import { useState, useEffect } from 'react';

export default function Activity2IntroScreen({ navigation, route }) {
  const teamName = route?.params?.teamName || 'Student';
  const [isSpeaking, setIsSpeaking] = useState(false);

  const introText = 'Welcome to Activity 2: Sound Pollution Hunter. In this activity you will use your phone microphone to measure sound levels in decibels. You will test different sound sources and identify loud and quiet zones in your environment.';

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

        <Image source={require('../assets/act2_sound.png')} style={styles.icon} resizeMode="contain" />

        <Text style={styles.description}>
          Students measure sound levels in their environment to understand how noise pollution varies with different actions. Using your phone's microphone, the app measures sound intensity in decibels and helps explore how noise affects the spaces around you.
        </Text>

        <View style={styles.objectiveBox}>
          <Text style={styles.objectiveTitle}>Your Objective?</Text>
          <Text style={styles.objectiveItem}>• Use your phone microphone to measure sound levels.</Text>
          <Text style={styles.objectiveItem}>• Test 4 different sound sources.</Text>
          <Text style={styles.objectiveItem}>• Record your predictions before each measurement.</Text>
          <Text style={styles.objectiveItem}>• Compare loud and quiet zones in your environment.</Text>
          <Text style={styles.objectiveItem}>• Reflect on how noise pollution affects health.</Text>
        </View>

        <View style={styles.soundsBox}>
          <Text style={styles.soundsTitle}>Sounds You Will Test:</Text>
          <Text style={styles.soundsItem}>📚 Dropping a book</Text>
          <Text style={styles.soundsItem}>🗣️ Talking normally</Text>
          <Text style={styles.soundsItem}>👟 Walking</Text>
          <Text style={styles.soundsItem}>🦶 Stamping your foot</Text>
        </View>

        <TouchableOpacity
          style={styles.button}
          onPress={() => {
            Speech.stop();
            navigation.navigate('Activity2Instructions', { teamName });
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
  soundsBox: {
    width: '100%', backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 16, padding: 16, marginBottom: 28,
  },
  soundsTitle: { fontSize: 14, fontWeight: 'bold', color: '#fff', marginBottom: 10, textAlign: 'center' },
  soundsItem: { fontSize: 13, color: '#d0e8ff', marginBottom: 8 },
  button: {
    backgroundColor: 'rgba(255,255,255,0.85)', borderRadius: 25,
    paddingVertical: 14, paddingHorizontal: 60, alignItems: 'center',
  },
  buttonText: { fontSize: 15, fontWeight: 'bold', color: '#1a3a5c', letterSpacing: 1 },
});