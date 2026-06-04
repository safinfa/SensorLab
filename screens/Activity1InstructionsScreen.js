import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Speech from 'expo-speech';
import { useState, useEffect } from 'react';

export default function Activity1InstructionsScreen({ navigation, route }) {
  const teamName = route?.params?.teamName || 'Student';
  const [dropHeight, setDropHeight] = useState('');
  const [objectMass, setObjectMass] = useState('');
  const [prediction, setPrediction] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);

  const instructionsText = 'Here are your instructions. Measure and enter the drop height in centimetres. Weigh your object and enter its mass in grams. Position your phone so the camera can see the full drop zone. First drop the object WITHOUT a parachute as your baseline. Then test up to 3 parachute designs. The camera will detect motion to time each drop automatically.';

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

        <Image source={require('../assets/act1_parachute.png')} style={styles.icon} resizeMode="contain" />

        <View style={styles.instructionBox}>
          <Text style={styles.instructionTitle}>Instructions:</Text>
          <Text style={styles.instructionItem}>1. Measure your drop height and enter it below.</Text>
          <Text style={styles.instructionItem}>2. Weigh your object and enter its mass below.</Text>
          <Text style={styles.instructionItem}>3. Position phone so camera sees the full drop zone.</Text>
          <Text style={styles.instructionItem}>4. First test WITHOUT parachute as baseline.</Text>
          <Text style={styles.instructionItem}>5. Then test up to 3 parachute designs.</Text>
          <Text style={styles.instructionItem}>6. Camera detects motion to time each drop.</Text>
        </View>

        <Text style={styles.label}>Drop Height (cm):</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. 150"
          placeholderTextColor="#aaa"
          value={dropHeight}
          onChangeText={setDropHeight}
          keyboardType="numeric"
        />

        <Text style={styles.label}>Object Mass (grams):</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. 10"
          placeholderTextColor="#aaa"
          value={objectMass}
          onChangeText={setObjectMass}
          keyboardType="numeric"
        />

        <TextInput
          style={styles.predictionInput}
          placeholder="Which parachute design do you predict will fall slowest?"
          placeholderTextColor="#aaa"
          value={prediction}
          onChangeText={setPrediction}
          multiline
        />

        <TouchableOpacity
          style={[styles.button, (!dropHeight || !objectMass) && styles.buttonDisabled]}
          onPress={() => {
            if (!dropHeight || !objectMass) {
              return;
            }
            Speech.stop();
            navigation.navigate('Activity1Challenge', {
              teamName,
              prediction,
              dropHeight: parseFloat(dropHeight),
              objectMass: parseFloat(objectMass),
            });
          }}
          disabled={!dropHeight || !objectMass}
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
  label: { fontSize: 13, fontWeight: '600', color: '#e0f0ff', marginBottom: 8, alignSelf: 'flex-start' },
  input: {
    width: '100%', backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 16, padding: 14, fontSize: 14, color: '#fff',
    marginBottom: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)',
  },
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
  buttonDisabled: { opacity: 0.5 },
  buttonText: { fontSize: 15, fontWeight: 'bold', color: '#1a3a5c', letterSpacing: 1 },
});