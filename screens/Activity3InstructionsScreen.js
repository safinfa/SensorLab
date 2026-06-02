import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Speech from 'expo-speech';
import { useState, useEffect } from 'react';

export default function Activity3InstructionsScreen({ navigation, route }) {
  const teamName = route?.params?.teamName || 'Student';
  const [prediction, setPrediction] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);

  const instructionsText = 'Here are your instructions. Build 3 different fan designs. For each design, stand paper upright on the table and fan air from 15 centimetres, then 30 centimetres, then 45 centimetres. Record how much the paper bends in degrees each time. Then repeat using cardboard instead of paper. Enter your prediction below then tap Start Test.';

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

        <Image source={require('../assets/act3_handfan.png')} style={styles.icon} resizeMode="contain" />

        <View style={styles.instructionBox}>
          <Text style={styles.instructionTitle}>Instructions:</Text>
          <Text style={styles.instructionItem}>1. Build your first fan design from paper or cardboard.</Text>
          <Text style={styles.instructionItem}>2. Stand a piece of paper upright on the table.</Text>
          <Text style={styles.instructionItem}>3. Fan from 15cm, 30cm, and 45cm away.</Text>
          <Text style={styles.instructionItem}>4. Record the bend angle in degrees for each distance.</Text>
          <Text style={styles.instructionItem}>5. Repeat steps 2-4 with cardboard instead of paper.</Text>
          <Text style={styles.instructionItem}>6. Build 2 more fan designs and repeat the whole process.</Text>
        </View>

        <View style={styles.tipBox}>
          <Text style={styles.tipTitle}>💡 How to Measure Bend Angle</Text>
          <Text style={styles.tipText}>
            Place a protractor or ruler against the paper before fanning. After fanning, observe how many degrees it has bent from its upright position. Even an estimate is fine!
          </Text>
        </View>

        <TextInput
          style={styles.predictionInput}
          placeholder="Which fan design do you predict will bend the paper the most?"
          placeholderTextColor="#aaa"
          value={prediction}
          onChangeText={setPrediction}
          multiline
        />

        <TouchableOpacity
          style={styles.button}
          onPress={() => {
            Speech.stop();
            navigation.navigate('Activity3Challenge', { teamName, prediction });
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
  tipText: { fontSize: 13, color: '#d0e8ff', lineHeight: 20 },
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