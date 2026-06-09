import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Alert, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useState, useRef } from 'react';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';

const DESIGNS = ['Design 1', 'Design 2', 'Design 3'];
const DISTANCES = ['15cm', '30cm', '45cm'];
const MATERIALS = ['Paper', 'Cardboard'];

const STIFFNESS = { Paper: 0.05, Cardboard: 0.5 };

const calculateForce = (material, angleDegrees) => {
  const k = STIFFNESS[material];
  const angleRad = (angleDegrees * Math.PI) / 180;
  return (k * angleRad).toFixed(3);
};

export default function Activity3ChallengeScreen({ navigation, route }) {
  const { teamName, prediction } = route?.params || {};

  const [designIndex, setDesignIndex] = useState(0);
  const [distanceIndex, setDistanceIndex] = useState(0);
  const [materialIndex, setMaterialIndex] = useState(0);
  const [phase, setPhase] = useState('input');
  const [predictedAngle, setPredictedAngle] = useState('');
  const [actualAngle, setActualAngle] = useState('');
  const [notes, setNotes] = useState('');
  const [allResults, setAllResults] = useState([]);
  const [cameraVisible, setCameraVisible] = useState(false);
  const [currentPhoto, setCurrentPhoto] = useState(null);
  const [permission, requestPermission] = useCameraPermissions();

  const cameraRef = useRef(null);

  const currentDesign = DESIGNS[designIndex];
  const currentDistance = DISTANCES[distanceIndex];
  const currentMaterial = MATERIALS[materialIndex];
  const totalReadings = DESIGNS.length * DISTANCES.length * MATERIALS.length;
  const currentReading = designIndex * (DISTANCES.length * MATERIALS.length) +
    materialIndex * DISTANCES.length + distanceIndex + 1;

  const takePhoto = async () => {
    if (!permission?.granted) {
      const { granted } = await requestPermission();
      if (!granted) {
        Alert.alert('Permission needed', 'Please allow camera access.');
        return;
      }
    }
    setCameraVisible(true);
  };

  const capturePhoto = async () => {
    if (!cameraRef.current) return;
    try {
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.7 });
      setCurrentPhoto(photo.uri);
      setCameraVisible(false);
    } catch (e) {
      Alert.alert('Error', 'Could not take photo. Please try again.');
    }
  };

  const pickFromGallery = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.7,
    });
    if (!result.canceled) {
      setCurrentPhoto(result.assets[0].uri);
    }
  };

  const handleSaveReading = () => {
    if (!actualAngle || isNaN(parseFloat(actualAngle))) {
      Alert.alert('Oops!', 'Please enter the actual bend angle in degrees.');
      return;
    }

    const angle = parseFloat(actualAngle);
    const force = calculateForce(currentMaterial, angle);

    const reading = {
      design: currentDesign,
      distance: currentDistance,
      material: currentMaterial,
      predictedAngle: predictedAngle || 'N/A',
      actualAngle: angle,
      estimatedForce: force,
      notes,
      photoUri: currentPhoto || null,
    };

    const newResults = [...allResults, reading];
    setAllResults(newResults);

    setPredictedAngle('');
    setActualAngle('');
    setNotes('');
    setCurrentPhoto(null);

    if (distanceIndex + 1 < DISTANCES.length) {
      setDistanceIndex(prev => prev + 1);
    } else if (materialIndex + 1 < MATERIALS.length) {
      setDistanceIndex(0);
      setMaterialIndex(prev => prev + 1);
    } else if (designIndex + 1 < DESIGNS.length) {
      setDistanceIndex(0);
      setMaterialIndex(0);
      setDesignIndex(prev => prev + 1);
    } else {
      setPhase('done');
    }
  };

  const getBestReading = () => {
    if (allResults.length === 0) return null;
    return allResults.reduce((best, r) => r.actualAngle > best.actualAngle ? r : best, allResults[0]);
  };

  // Full screen camera
  if (cameraVisible) {
    return (
      <View style={styles.fullScreenCamera}>
        <CameraView
          ref={cameraRef}
          style={StyleSheet.absoluteFill}
          facing="back"
        />
        <View style={styles.cameraTopOverlay}>
          <Text style={styles.cameraTopText}>
            📐 Capture the bend angle — {currentDesign} | {currentMaterial} | {currentDistance}
          </Text>
        </View>
        <View style={styles.cameraBottomControls}>
          <TouchableOpacity style={styles.captureButton} onPress={capturePhoto}>
            <View style={styles.captureButtonInner} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.cameraBackButton} onPress={() => setCameraVisible(false)}>
            <Text style={styles.cameraBackText}>← Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <LinearGradient colors={['#4a90d9', '#1a3a5c']} style={styles.gradient}>
      <ScrollView contentContainerStyle={styles.container}>

        {/* INPUT PHASE */}
        {phase === 'input' && (
          <View style={styles.centeredBox}>

            <View style={styles.progressBox}>
              <Text style={styles.progressText}>Reading {currentReading} of {totalReadings}</Text>
              <View style={styles.progressBarBg}>
                <View style={[styles.progressBarFill, { width: `${(currentReading / totalReadings) * 100}%` }]} />
              </View>
            </View>

            <View style={styles.testInfoBox}>
              <Text style={styles.testInfoTitle}>Current Test:</Text>
              <Text style={styles.testInfoRow}>🪭 Fan: <Text style={styles.testInfoValue}>{currentDesign}</Text></Text>
              <Text style={styles.testInfoRow}>📏 Distance: <Text style={styles.testInfoValue}>{currentDistance}</Text></Text>
              <Text style={styles.testInfoRow}>📄 Material: <Text style={styles.testInfoValue}>{currentMaterial}</Text></Text>
            </View>

            <Text style={styles.label}>Predicted Bend Angle (°)</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. 30"
              placeholderTextColor="#aaa"
              value={predictedAngle}
              onChangeText={setPredictedAngle}
              keyboardType="numeric"
            />

            <Text style={styles.label}>Actual Bend Angle (°) *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. 25"
              placeholderTextColor="#aaa"
              value={actualAngle}
              onChangeText={setActualAngle}
              keyboardType="numeric"
            />

            <Text style={styles.label}>Observation Notes (optional)</Text>
            <TextInput
              style={[styles.input, styles.notesInput]}
              placeholder="e.g. Paper bent smoothly, no vibration..."
              placeholderTextColor="#aaa"
              value={notes}
              onChangeText={setNotes}
              multiline
            />

            {/* Photo section */}
            <Text style={styles.label}>📸 Photo Proof of Bend Angle</Text>
            {currentPhoto ? (
              <View style={styles.photoPreviewBox}>
                <Image source={{ uri: currentPhoto }} style={styles.photoPreview} />
                <View style={styles.photoActions}>
                  <TouchableOpacity style={styles.retakeBtn} onPress={takePhoto}>
                    <Text style={styles.retakeBtnText}>📷 Retake</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.removeBtn} onPress={() => setCurrentPhoto(null)}>
                    <Text style={styles.removeBtnText}>✕ Remove</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <View style={styles.photoButtonRow}>
                <TouchableOpacity style={styles.photoBtn} onPress={takePhoto}>
                  <Text style={styles.photoBtnText}>📷 Take Photo</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.photoBtn} onPress={pickFromGallery}>
                  <Text style={styles.photoBtnText}>🖼️ Gallery</Text>
                </TouchableOpacity>
              </View>
            )}

            {actualAngle ? (
              <View style={styles.forcePreview}>
                <Text style={styles.forceLabel}>Estimated Force:</Text>
                <Text style={styles.forceValue}>
                  {calculateForce(currentMaterial, parseFloat(actualAngle) || 0)} N
                </Text>
              </View>
            ) : null}

            <TouchableOpacity style={styles.button} onPress={handleSaveReading}>
              <Text style={styles.buttonText}>
                {currentReading < totalReadings ? 'Save & Next →' : 'Save & Finish'}
              </Text>
            </TouchableOpacity>

            {allResults.length > 0 && (
              <View style={styles.prevResultsBox}>
                <Text style={styles.prevResultsTitle}>Previous Readings:</Text>
                {allResults.slice(-3).map((r, i) => (
                  <Text key={i} style={styles.prevResultItem}>
                    {r.design} | {r.material} | {r.distance} → {r.actualAngle}° ({r.estimatedForce}N)
                    {r.photoUri ? ' 📸' : ''}
                  </Text>
                ))}
              </View>
            )}

          </View>
        )}

        {/* DONE PHASE */}
        {phase === 'done' && (
          <View style={styles.centeredBox}>
            <Text style={styles.title}>🎉 All Done!</Text>
            <Text style={styles.subtitle}>Here are your results:</Text>

            {getBestReading() && (
              <View style={styles.bestCard}>
                <Text style={styles.bestTitle}>🏆 Biggest Bend!</Text>
                <Text style={styles.bestValue}>{getBestReading().actualAngle}°</Text>
                <Text style={styles.bestDetail}>
                  {getBestReading().design} — {getBestReading().material} at {getBestReading().distance}
                </Text>
                {getBestReading().photoUri && (
                  <Image
                    source={{ uri: getBestReading().photoUri }}
                    style={styles.bestPhoto}
                  />
                )}
              </View>
            )}

            {DESIGNS.map((design) => (
              <View key={design} style={styles.designResultBox}>
                <Text style={styles.designResultTitle}>{design}</Text>
                {allResults
                  .filter(r => r.design === design)
                  .map((r, i) => (
                    <View key={i}>
                      <View style={styles.resultRow}>
                        <Text style={styles.resultLabel}>{r.material} @ {r.distance}</Text>
                        <Text style={styles.resultValue}>{r.actualAngle}° — {r.estimatedForce}N</Text>
                      </View>
                      {r.photoUri && (
                        <Image
                          source={{ uri: r.photoUri }}
                          style={styles.resultPhoto}
                        />
                      )}
                    </View>
                  ))
                }
              </View>
            ))}

            <TouchableOpacity
              style={styles.button}
              onPress={() => navigation.navigate('Activity3Reflection', {
                teamName, prediction, results: allResults,
              })}
            >
              <Text style={styles.buttonText}>Continue to Reflection</Text>
            </TouchableOpacity>
          </View>
        )}

      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  container: { flexGrow: 1, paddingTop: 60, paddingBottom: 40, paddingHorizontal: 24 },
  centeredBox: { width: '100%', alignItems: 'center' },

  // Full screen camera
  fullScreenCamera: { flex: 1, backgroundColor: '#000' },
  cameraTopOverlay: {
    position: 'absolute', top: 60, left: 0, right: 0,
    alignItems: 'center', zIndex: 10, paddingHorizontal: 20,
  },
  cameraTopText: {
    color: '#fff', fontSize: 13, fontWeight: 'bold',
    backgroundColor: 'rgba(0,0,0,0.6)', paddingHorizontal: 16,
    paddingVertical: 8, borderRadius: 20, textAlign: 'center',
  },
  cameraBottomControls: {
    position: 'absolute', bottom: 60, left: 0, right: 0,
    alignItems: 'center', zIndex: 10,
  },
  captureButton: {
    width: 80, height: 80, borderRadius: 40,
    borderWidth: 4, borderColor: '#fff',
    justifyContent: 'center', alignItems: 'center', marginBottom: 20,
  },
  captureButtonInner: {
    width: 60, height: 60, borderRadius: 30,
    backgroundColor: '#fff',
  },
  cameraBackButton: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20,
  },
  cameraBackText: { color: '#fff', fontSize: 14 },

  // Photo section
  photoPreviewBox: { width: '100%', marginBottom: 16 },
  photoPreview: {
    width: '100%', height: 200, borderRadius: 16,
    marginBottom: 8, resizeMode: 'cover',
  },
  photoActions: { flexDirection: 'row', gap: 8 },
  retakeBtn: {
    flex: 1, backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 12, paddingVertical: 10, alignItems: 'center',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)',
  },
  retakeBtnText: { fontSize: 13, color: '#fff' },
  removeBtn: {
    flex: 1, backgroundColor: 'rgba(244,67,54,0.2)',
    borderRadius: 12, paddingVertical: 10, alignItems: 'center',
    borderWidth: 1, borderColor: '#f44336',
  },
  removeBtnText: { fontSize: 13, color: '#ff8a80' },
  photoButtonRow: { flexDirection: 'row', gap: 8, width: '100%', marginBottom: 16 },
  photoBtn: {
    flex: 1, backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 12, paddingVertical: 12, alignItems: 'center',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)',
  },
  photoBtnText: { fontSize: 13, color: '#fff', fontWeight: '600' },

  // Best card photo
  bestPhoto: {
    width: '100%', height: 160, borderRadius: 12,
    marginTop: 12, resizeMode: 'cover',
  },

  // Result photo
  resultPhoto: {
    width: '100%', height: 120, borderRadius: 10,
    marginBottom: 8, marginTop: 4, resizeMode: 'cover',
  },

  progressBox: { width: '100%', marginBottom: 20 },
  progressText: { fontSize: 13, color: '#ffe082', fontWeight: 'bold', textAlign: 'center', marginBottom: 8 },
  progressBarBg: {
    width: '100%', height: 8, backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 4, overflow: 'hidden',
  },
  progressBarFill: { height: '100%', backgroundColor: '#4caf50', borderRadius: 4 },
  testInfoBox: {
    width: '100%', backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 16, padding: 16, marginBottom: 20,
  },
  testInfoTitle: { fontSize: 14, fontWeight: 'bold', color: '#fff', marginBottom: 10, textAlign: 'center' },
  testInfoRow: { fontSize: 13, color: '#d0e8ff', marginBottom: 6 },
  testInfoValue: { color: '#ffe082', fontWeight: 'bold' },
  label: { fontSize: 13, fontWeight: '600', color: '#e0f0ff', marginBottom: 6, alignSelf: 'flex-start' },
  input: {
    width: '100%', backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 16, padding: 14, fontSize: 14, color: '#fff',
    marginBottom: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)',
  },
  notesInput: { minHeight: 70, textAlignVertical: 'top' },
  forcePreview: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12, padding: 12, marginBottom: 16, width: '100%',
  },
  forceLabel: { fontSize: 13, color: '#d0e8ff', marginRight: 8 },
  forceValue: { fontSize: 18, fontWeight: 'bold', color: '#4caf50' },
  button: {
    backgroundColor: 'rgba(255,255,255,0.85)', borderRadius: 25,
    paddingVertical: 14, paddingHorizontal: 50, alignItems: 'center', marginTop: 8,
  },
  buttonText: { fontSize: 15, fontWeight: 'bold', color: '#1a3a5c', letterSpacing: 1 },
  prevResultsBox: {
    width: '100%', backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 16, padding: 14, marginTop: 20,
  },
  prevResultsTitle: { fontSize: 13, fontWeight: 'bold', color: '#fff', marginBottom: 8 },
  prevResultItem: { fontSize: 12, color: '#b0d4f1', marginBottom: 4 },
  title: { fontSize: 22, fontWeight: 'bold', color: '#fff', marginBottom: 8, textAlign: 'center' },
  subtitle: { fontSize: 14, color: '#d0e8ff', marginBottom: 20, textAlign: 'center' },
  bestCard: {
    width: '100%', backgroundColor: 'rgba(255,215,0,0.15)',
    borderRadius: 20, padding: 20, alignItems: 'center',
    marginBottom: 20, borderWidth: 2, borderColor: '#FFD700',
  },
  bestTitle: { fontSize: 14, fontWeight: 'bold', color: '#FFD700', marginBottom: 4 },
  bestValue: { fontSize: 48, fontWeight: 'bold', color: '#ffe082', marginBottom: 4 },
  bestDetail: { fontSize: 13, color: '#d0e8ff', textAlign: 'center' },
  designResultBox: {
    width: '100%', backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 16, padding: 16, marginBottom: 12,
  },
  designResultTitle: { fontSize: 14, fontWeight: 'bold', color: '#fff', marginBottom: 10 },
  resultRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    paddingVertical: 6, borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  resultLabel: { fontSize: 12, color: '#d0e8ff' },
  resultValue: { fontSize: 12, fontWeight: 'bold', color: '#ffe082' },
});