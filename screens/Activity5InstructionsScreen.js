import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Speech from 'expo-speech';
import { useEffect, useState } from 'react';

export default function Activity5InstructionsScreen({ navigation, route }) {
  const teamName = route?.params?.teamName || 'Student';
  const [prediction, setPrediction] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);

  const instructionsText = 'Here are your instructions. Hold your phone firmly in one hand. You will perform 3 stretch movements. Move slowly and as smoothly as possible. Lower vibration means a higher score. Enter your prediction below, then tap Start Test.';

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

        {/* Speaker Toggle Button */}
        <TouchableOpacity style={styles.speakerButton} onPress={toggleSpeech}>
          <Text style={styles.speakerIcon}>{isSpeaking ? '🔊' : '🔇'}</Text>
          <Text style={styles.speakerLabel}>{isSpeaking ? 'Stop Reading' : 'Read Aloud'}</Text>
        </TouchableOpacity>

        <Image source={require('../assets/act5_human.png')} style={styles.icon} resizeMode="contain" />

        <View style={styles.instructionBox}>
          <Text style={styles.instructionTitle}>Instructions:</Text>
          <Text style={styles.instructionItem}>• Hold the phone firmly in one hand throughout each movement.</Text>
          <Text style={styles.instructionItem}>• You will perform 3 different stretch movements.</Text>
          <Text style={styles.instructionItem}>• Move as slowly and smoothly as possible — the app measures shakiness.</Text>
          <Text style={styles.instructionItem}>• Each movement is timed — lower vibration = higher grace score.</Text>
          <Text style={styles.instructionItem}>• You will get 3 attempts total before seeing your results.</Text>
        </View>

        <TextInput
          style={styles.predictionInput}
          placeholder="Which movement do you predict will be hardest to keep smooth?"
          placeholderTextColor="#aaa"
          value={prediction}
          onChangeText={setPrediction}
          multiline
        />

        <TouchableOpacity
          style={styles.button}
          onPress={() => {
            Speech.stop();
            navigation.navigate('Activity5Challenge', { teamName, prediction });
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
  icon: { width: 140, height: 140, marginBottom: 20 },
  instructionBox: { width: '100%', marginBottom: 24 },
  instructionTitle: { fontSize: 15, fontWeight: 'bold', color: '#fff', textAlign: 'center', marginBottom: 12 },
  instructionItem: { fontSize: 13, color: '#d0e8ff', marginBottom: 8, lineHeight: 20 },
  predictionInput: {
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 16,
    padding: 16,
    fontSize: 14,
    color: '#fff',
    minHeight: 90,
    marginBottom: 28,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  button: {
    backgroundColor: 'rgba(255,255,255,0.85)',
    borderRadius: 25,
    paddingVertical: 14,
    paddingHorizontal: 60,
    alignItems: 'center',
  },
  buttonText: { fontSize: 15, fontWeight: 'bold', color: '#1a3a5c', letterSpacing: 1 },
});