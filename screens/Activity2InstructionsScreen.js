import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Speech from 'expo-speech';
import { useState, useEffect } from 'react';

export default function Activity2InstructionsScreen({ navigation, route }) {
  const teamName = route?.params?.teamName || 'Student';
  const [prediction, setPrediction] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);

  const instructionsText = 'Here are your instructions. Position your phone where you want to measure sound. The app uses your microphone to capture noise levels. For each sound source, first enter your predicted decibel level, then tap Start Recording and make the sound. The app will measure the peak decibel level. Repeat for all 4 sounds.';

  const toggleSpeech = () => {
    if (isSpeaking) {
      Speech.stop();
      setIsSpeaking(false);
    } else {
      setIsSpeaking(true);
      Speech.speak(instructionsText, {
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

        <View style={styles.instructionBox}>
          <Text style={styles.instructionTitle}>Instructions:</Text>
          <Text style={styles.instructionItem}>1. Position your phone stably where you want to measure.</Text>
          <Text style={styles.instructionItem}>2. Make sure the area is quiet before starting each test.</Text>
          <Text style={styles.instructionItem}>3. Enter your predicted dB level for each sound.</Text>
          <Text style={styles.instructionItem}>4. Tap Start Recording and immediately make the sound.</Text>
          <Text style={styles.instructionItem}>5. The app records for 3 seconds and shows peak dB.</Text>
          <Text style={styles.instructionItem}>6. Repeat for all 4 different sound sources.</Text>
        </View>

        <View style={styles.tipBox}>
          <Text style={styles.tipTitle}>💡 dB Reference Guide</Text>
          <Text style={styles.tipText}>🤫 Whisper: ~30 dB</Text>
          <Text style={styles.tipText}>🗣️ Normal talking: ~60 dB</Text>
          <Text style={styles.tipText}>🎸 Loud music: ~90 dB</Text>
          <Text style={styles.tipText}>✈️ Airplane: ~120 dB</Text>
        </View>

        <TextInput
          style={styles.predictionInput}
          placeholder="Which sound do you predict will be the loudest?"
          placeholderTextColor="#aaa"
          value={prediction}
          onChangeText={setPrediction}
          multiline
        />

        <TouchableOpacity
          style={styles.button}
          onPress={() => {
            Speech.stop();
            navigation.navigate('Activity2Challenge', { teamName, prediction });
          }}
        >
          <Text style={styles.buttonText}>Start Test</Text>
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
  instructionBox: { width: '100%', marginBottom: 16 },
  instructionTitle: { fontSize: 15, fontWeight: 'bold', color: '#fff', textAlign: 'center', marginBottom: 12 },
  instructionItem: { fontSize: 13, color: '#d0e8ff', marginBottom: 8, lineHeight: 20 },
  tipBox: {
    width: '100%', backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 16, padding: 16, marginBottom: 20,
  },
  tipTitle: { fontSize: 13, fontWeight: 'bold', color: '#ffe082', marginBottom: 8 },
  tipText: { fontSize: 13, color: '#d0e8ff', marginBottom: 6 },
  predictionInput: {
    width: '100%', backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 16, padding: 16, fontSize: 14, color: '#fff',
    minHeight: 90, marginBottom: 28, borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  button: {
    backgroundColor: 'rgba(255,255,255,0.85)', borderRadius: 25,
    paddingVertical: 14, paddingHorizontal: 60, alignItems: 'center',
  },
  buttonText: { fontSize: 15, fontWeight: 'bold', color: '#1a3a5c', letterSpacing: 1 },
});