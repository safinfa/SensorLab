import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Speech from 'expo-speech';
import { useState, useEffect } from 'react';

export default function Activity3IntroScreen({ navigation, route }) {
  const teamName = route?.params?.teamName || 'Student';
  const [isSpeaking, setIsSpeaking] = useState(false);

  const introText = 'Welcome to Activity 3: Hand Fan Challenge. In this activity you will build paper fans and test how air movement affects flexible materials. You will fan air at a standing piece of paper and cardboard from 3 different distances, recording how much it bends each time. Tap Start Activity when you are ready.';

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

        <Image source={require('../assets/act3_handfan.png')} style={styles.icon} resizeMode="contain" />

        <Text style={styles.description}>
          Students test how air movement affects flexible materials. Build a paper fan, stand paper upright on a table, and fan from different distances to see how much it bends!
        </Text>

        <View style={styles.objectiveBox}>
          <Text style={styles.objectiveTitle}>Your Objective?</Text>
          <Text style={styles.objectiveItem}>• Build 3 different fan designs from paper/cardboard.</Text>
          <Text style={styles.objectiveItem}>• Stand a piece of paper upright on the table.</Text>
          <Text style={styles.objectiveItem}>• Fan from 3 distances: 15cm, 30cm, and 45cm.</Text>
          <Text style={styles.objectiveItem}>• Record how much the paper bends in degrees.</Text>
          <Text style={styles.objectiveItem}>• Repeat using cardboard instead of paper.</Text>
          <Text style={styles.objectiveItem}>• Compare which design and distance creates the most bend.</Text>
        </View>

        <View style={styles.equipmentBox}>
          <Text style={styles.equipmentTitle}>Equipment Needed:</Text>
          <Text style={styles.equipmentItem}>📄 Paper and cardboard</Text>
          <Text style={styles.equipmentItem}>✂️ Scissors and sticky tape</Text>
          <Text style={styles.equipmentItem}>📏 Ruler (to measure distances)</Text>
          <Text style={styles.equipmentItem}>📱 This app to record results</Text>
        </View>

        <TouchableOpacity
          style={styles.button}
          onPress={() => {
            Speech.stop();
            navigation.navigate('Activity3Instructions', { teamName });
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