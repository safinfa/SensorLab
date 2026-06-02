import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Speech from 'expo-speech';
import { useState, useEffect } from 'react';

export default function Activity4InstructionsScreen({ navigation, route }) {
  const teamName = route?.params?.teamName || 'Student';
  const [prediction, setPrediction] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);

  const instructionsText = 'Here are your instructions. Step 1: Build your structure. Step 2: Mark the starting position of your structure on the table. Step 3: Place this phone flat on top of the structure. Step 4: Use another phone to take a photo of the structure before the test. Step 5: Tap Start Test to begin the vibration. Step 6: After vibrations stop, use the other phone to take another photo. Step 7: Measure how far the structure moved from its original position. Step 8: Upload both photos and enter the distance moved.';

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

        <Image source={require('../assets/act4_earthquake.png')} style={styles.icon} resizeMode="contain" />

        <View style={styles.instructionBox}>
          <Text style={styles.instructionTitle}>Instructions:</Text>
          <Text style={styles.instructionItem}>1. Build your structure from available materials.</Text>
          <Text style={styles.instructionItem}>2. Mark the starting position on the table with tape or a pen.</Text>
          <Text style={styles.instructionItem}>3. Place THIS phone flat on top of the structure.</Text>
          <Text style={styles.instructionItem}>4. Use ANOTHER phone to take a BEFORE photo.</Text>
          <Text style={styles.instructionItem}>5. Tap Start Test — the app will simulate vibrations.</Text>
          <Text style={styles.instructionItem}>6. After vibrations stop, take an AFTER photo with the other phone.</Text>
          <Text style={styles.instructionItem}>7. Measure how far the structure moved using a ruler.</Text>
          <Text style={styles.instructionItem}>8. Upload both photos and enter the distance.</Text>
        </View>

        <View style={styles.warningBox}>
          <Text style={styles.warningTitle}>⚠️ Important Reminders</Text>
          <Text style={styles.warningItem}>• Keep this phone ON the structure during the test.</Text>
          <Text style={styles.warningItem}>• Have the other phone READY before starting.</Text>
          <Text style={styles.warningItem}>• Mark the starting position CLEARLY before the test.</Text>
          <Text style={styles.warningItem}>• Measure from the mark to the new position after.</Text>
        </View>

        <TextInput
          style={styles.predictionInput}
          placeholder="How far do you predict your structure will move? (e.g. 5cm)"
          placeholderTextColor="#aaa"
          value={prediction}
          onChangeText={setPrediction}
          multiline
        />

        <TouchableOpacity
          style={styles.button}
          onPress={() => {
            Speech.stop();
            navigation.navigate('Activity4Challenge', { teamName, prediction });
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
  warningBox: {
    width: '100%', backgroundColor: 'rgba(255,165,0,0.15)',
    borderRadius: 16, padding: 16, marginBottom: 20,
    borderWidth: 1, borderColor: 'rgba(255,165,0,0.4)',
  },
  warningTitle: { fontSize: 14, fontWeight: 'bold', color: '#ffb74d', marginBottom: 10 },
  warningItem: { fontSize: 13, color: '#ffe0b2', marginBottom: 6, lineHeight: 20 },
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