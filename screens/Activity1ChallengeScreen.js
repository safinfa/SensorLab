import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, TextInput, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useEffect, useRef, useState } from 'react';
import * as Haptics from 'expo-haptics';
import { Video, ResizeMode } from 'expo-av';
import * as ImagePicker from 'expo-image-picker';

const DESIGNS = ['No Parachute (Baseline)', 'Design 1', 'Design 2', 'Design 3'];
const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function Activity1ChallengeScreen({ navigation, route }) {
  const { teamName, prediction, dropHeight, objectMass } = route?.params || {};

  const [permission, requestPermission] = useCameraPermissions();
  const [currentDesign, setCurrentDesign] = useState(0);
  const [phase, setPhase] = useState('setup');
  const [isRecording, setIsRecording] = useState(false);
  const [videoUri, setVideoUri] = useState(null);
  const [dropTime, setDropTime] = useState('');
  const [contactTime, setContactTime] = useState('');
  const [bounceType, setBounceType] = useState('no_bounce');
  const [bounceHeight, setBounceHeight] = useState('');
  const [results, setResults] = useState([]);
  const [videoPosition, setVideoPosition] = useState(0);
  const [videoDuration, setVideoDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const cameraRef = useRef(null);
  const videoRef = useRef(null);
  const resultsRef = useRef([]);
  const positionIntervalRef = useRef(null);

  useEffect(() => {
    return () => {
      if (cameraRef.current && isRecording) cameraRef.current.stopRecording();
      clearInterval(positionIntervalRef.current);
    };
  }, [isRecording]);

  const heightMeters = (dropHeight || 150) / 100;
  const massKg = (objectMass || 10) / 1000;
  const gravity = 9.8;

  const calculatePhysics = () => {
    const t = parseFloat(dropTime);
    if (!t || t <= 0) return null;
    const finalVelocity = gravity * t;
    const acceleration = (2 * heightMeters) / (t * t);
    const netForce = massKg * acceleration;
    const weight = massKg * gravity;
    const dragForce = Math.max(0, weight - netForce);
    let gForce = 0;
    const ct = parseFloat(contactTime);
    if (ct && ct > 0) {
      if (bounceType === 'no_bounce') {
        gForce = finalVelocity / (ct * gravity);
      } else {
        const bt = parseFloat(bounceHeight);
        if (bt && bt > 0) {
          const reboundVelocity = gravity * bt;
          gForce = (finalVelocity + reboundVelocity) / (ct * gravity);
        }
      }
    }
    return {
      finalVelocity: finalVelocity.toFixed(2),
      acceleration: acceleration.toFixed(2),
      netForce: netForce.toFixed(4),
      dragForce: dragForce.toFixed(4),
      weight: weight.toFixed(4),
      gForce: gForce.toFixed(2),
      dropTime: t.toFixed(3),
    };
  };

  const formatMs = (ms) => {
    const totalMs = Math.round(ms);
    const minutes = Math.floor(totalMs / 60000);
    const seconds = Math.floor((totalMs % 60000) / 1000);
    const millis = totalMs % 1000;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${millis.toString().padStart(3, '0')}`;
  };

  const startRecording = async () => {
    if (!cameraRef.current) {
      Alert.alert('Error', 'Camera not ready. Please wait.');
      return;
    }
    try {
      setIsRecording(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      const video = await cameraRef.current.recordAsync({
        maxDuration: 30,
        mute: false,
      });
      if (video?.uri) {
        setVideoUri(video.uri);
        setPhase('review');
      }
    } catch (e) {
      console.log('Recording error:', e);
      Alert.alert('Recording Error', 'Could not start recording. Please check camera permissions and try again.');
      setIsRecording(false);
    }
  };

  const stopRecording = async () => {
    if (cameraRef.current && isRecording) {
      try {
        await cameraRef.current.stopRecording();
        setIsRecording(false);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch (e) {
        setIsRecording(false);
      }
    }
  };

  const pickVideoFromLibrary = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Videos,
      allowsEditing: false,
      quality: 1,
    });
    if (!result.canceled) {
      setVideoUri(result.assets[0].uri);
      setPhase('review');
    }
  };

  const startPositionTracking = () => {
    clearInterval(positionIntervalRef.current);
    positionIntervalRef.current = setInterval(async () => {
      if (videoRef.current) {
        const status = await videoRef.current.getStatusAsync();
        if (status.isLoaded) {
          setVideoPosition(status.positionMillis || 0);
          setVideoDuration(status.durationMillis || 0);
          setIsPlaying(status.isPlaying || false);
        }
      }
    }, 50); // Update every 50ms for smooth millisecond display
  };

  const handleVideoLoad = (status) => {
    setVideoDuration(status.durationMillis || 0);
    startPositionTracking();
  };

  const seekVideo = async (direction) => {
    if (!videoRef.current) return;
    const newPos = Math.max(0, Math.min(videoDuration, videoPosition + direction));
    await videoRef.current.setPositionAsync(newPos);
    setVideoPosition(newPos);
  };

  const markDropTime = () => {
    const seconds = (videoPosition / 1000).toFixed(3);
    setDropTime(seconds);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const markContactTime = () => {
    const dropMs = parseFloat(dropTime) * 1000;
    const contactMs = videoPosition - dropMs;
    if (contactMs > 0) {
      setContactTime((contactMs / 1000).toFixed(3));
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } else {
      Alert.alert('Oops!', 'Mark the drop time first, then mark the contact time after it.');
    }
  };

  const saveAndNext = () => {
    const physics = calculatePhysics();
    if (!physics) {
      Alert.alert('Oops!', 'Please enter the drop time before saving.');
      return;
    }
    const result = {
      design: DESIGNS[currentDesign],
      videoUri,
      ...physics,
      bounceType,
      contactTime: parseFloat(contactTime) || 0,
    };
    const newResults = [...resultsRef.current, result];
    resultsRef.current = newResults;
    setResults(newResults);
    setVideoUri(null);
    setDropTime('');
    setContactTime('');
    setBounceHeight('');
    setBounceType('no_bounce');
    setVideoPosition(0);
    setVideoDuration(0);
    clearInterval(positionIntervalRef.current);
    if (currentDesign + 1 < DESIGNS.length) {
      setCurrentDesign(prev => prev + 1);
      setPhase('setup');
    } else {
      setPhase('done');
    }
  };

  if (!permission) return <View />;

  if (!permission.granted) {
    return (
      <LinearGradient colors={['#4a90d9', '#1a3a5c']} style={styles.gradient}>
        <View style={styles.permissionBox}>
          <Text style={styles.title}>Camera Permission Required</Text>
          <Text style={styles.subtitle}>Please allow camera access to record the parachute drop.</Text>
          <TouchableOpacity style={styles.button} onPress={requestPermission}>
            <Text style={styles.buttonText}>Grant Permission</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={['#4a90d9', '#1a3a5c']} style={styles.gradient}>

      {/* RECORDING PHASE — Full screen camera */}
      {phase === 'recording' && (
        <View style={styles.fullScreenCamera}>
          <CameraView
            ref={cameraRef}
            style={StyleSheet.absoluteFill}
            facing="back"
            mode="video"
            videoQuality="1080p"
            onCameraReady={() => console.log('Camera ready')}
          />

          {/* Top overlay */}
          <View style={styles.cameraTopOverlay}>
            <Text style={styles.cameraTopText}>
              {isRecording ? '🔴 RECORDING — Tap STOP when landing is done' : '📷 Ready — Tap RECORD to start'}
            </Text>
          </View>

          {/* Bottom controls */}
          <View style={styles.cameraBottomControls}>
            {!isRecording ? (
              <TouchableOpacity style={styles.recordCircleButton} onPress={startRecording}>
                <View style={styles.recordCircleInner} />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity style={styles.stopCircleButton} onPress={stopRecording}>
                <View style={styles.stopCircleInner} />
              </TouchableOpacity>
            )}
            {!isRecording && (
              <TouchableOpacity style={styles.cameraBackButton} onPress={() => setPhase('setup')}>
                <Text style={styles.cameraBackText}>← Back</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}

      {/* ALL OTHER PHASES */}
      {phase !== 'recording' && (
        <ScrollView contentContainerStyle={styles.container}>

          {/* SETUP PHASE */}
          {phase === 'setup' && (
            <View style={styles.centeredBox}>
              <Text style={styles.title}>🪂 {DESIGNS[currentDesign]}</Text>
              <Text style={styles.subtitle}>Drop {currentDesign + 1} of {DESIGNS.length}</Text>
              <Text style={styles.dropInfo}>📏 Height: {dropHeight}cm | ⚖️ Mass: {objectMass}g</Text>

              <View style={styles.checklistBox}>
                <Text style={styles.checklistTitle}>Before Recording:</Text>
                <Text style={styles.checklistItem}>☐ Use a ruler in frame for scale reference</Text>
                <Text style={styles.checklistItem}>☐ Mark the target landing zone on the floor</Text>
                {currentDesign === 0
                  ? <Text style={styles.checklistItem}>☐ This is baseline — NO parachute</Text>
                  : <Text style={styles.checklistItem}>☐ Attach parachute to the toy soldier</Text>}
                <Text style={styles.checklistItem}>☐ Hold toy at exactly {dropHeight}cm height</Text>
                <Text style={styles.checklistItem}>☐ Use slow-motion video if available</Text>
              </View>

              <View style={styles.tipBox}>
                <Text style={styles.tipTitle}>📹 Recording Tips:</Text>
                <Text style={styles.tipText}>• Keep phone steady — use a stand if possible</Text>
                <Text style={styles.tipText}>• Make sure full drop zone is visible</Text>
                <Text style={styles.tipText}>• Place ruler in frame for scale reference</Text>
              </View>

              <TouchableOpacity style={styles.recordButton} onPress={() => setPhase('recording')}>
                <Text style={styles.buttonText}>📹 Start Recording</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.libraryButton} onPress={pickVideoFromLibrary}>
                <Text style={styles.libraryButtonText}>📁 Use Existing Video</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* REVIEW PHASE */}
          {phase === 'review' && videoUri && (
            <View style={styles.centeredBox}>
              <Text style={styles.title}>📹 Review Your Video</Text>
              <Text style={styles.subtitle}>Scrub through to find drop and landing moments</Text>

              <Video
                ref={videoRef}
                source={{ uri: videoUri }}
                style={styles.videoPlayer}
                useNativeControls
                resizeMode={ResizeMode.CONTAIN}
                shouldPlay={false}
                onLoad={handleVideoLoad}
              />

              <View style={styles.instructionBox}>
                <Text style={styles.instructionTitle}>📋 From Your Video, Measure:</Text>
                <Text style={styles.instructionItem}>1. Time from release to first ground contact (drop time)</Text>
                <Text style={styles.instructionItem}>2. Time from first contact to object stopping (contact time)</Text>
                <Text style={styles.instructionItem}>3. If object bounced, time to max height after bounce</Text>
              </View>

              <TouchableOpacity style={styles.button} onPress={() => setPhase('calculate')}>
                <Text style={styles.buttonText}>Enter Measurements →</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.backButton} onPress={() => setPhase('recording')}>
                <Text style={styles.backButtonText}>← Re-record</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* CALCULATE PHASE — with video playback */}
          {phase === 'calculate' && (
            <View style={styles.centeredBox}>
              <Text style={styles.title}>📐 Enter Measurements</Text>
              <Text style={styles.subtitle}>{DESIGNS[currentDesign]}</Text>

              {/* Video playback with millisecond timer */}
              {videoUri && (
                <View style={styles.videoSection}>
                  <Video
                    ref={videoRef}
                    source={{ uri: videoUri }}
                    style={styles.calculateVideoPlayer}
                    useNativeControls
                    resizeMode={ResizeMode.CONTAIN}
                    shouldPlay={false}
                    onLoad={handleVideoLoad}
                  />

                  {/* Millisecond timer display */}
                  <View style={styles.timerDisplay}>
                    <Text style={styles.timerMs}>{formatMs(videoPosition)}</Text>
                    <Text style={styles.timerLabel}>Current Position</Text>
                  </View>

                  {/* Fine seek controls */}
                  <View style={styles.seekRow}>
                    <TouchableOpacity style={styles.seekBtn} onPress={() => seekVideo(-100)}>
                      <Text style={styles.seekBtnText}>-100ms</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.seekBtn} onPress={() => seekVideo(-33)}>
                      <Text style={styles.seekBtnText}>-1f</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.seekBtn} onPress={() => seekVideo(33)}>
                      <Text style={styles.seekBtnText}>+1f</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.seekBtn} onPress={() => seekVideo(100)}>
                      <Text style={styles.seekBtnText}>+100ms</Text>
                    </TouchableOpacity>
                  </View>

                  {/* Mark buttons */}
                  <View style={styles.markRow}>
                    <TouchableOpacity style={styles.markDropBtn} onPress={markDropTime}>
                      <Text style={styles.markBtnText}>📍 Mark Drop</Text>
                      {dropTime ? <Text style={styles.markBtnSub}>{dropTime}s</Text> : null}
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.markLandBtn} onPress={markContactTime}>
                      <Text style={styles.markBtnText}>🎯 Mark Landing</Text>
                      {contactTime ? <Text style={styles.markBtnSub}>{contactTime}s</Text> : null}
                    </TouchableOpacity>
                  </View>

                  <Text style={styles.markHint}>
                    Tip: Pause video at exact moment, then tap Mark buttons. Use frame controls for precision.
                  </Text>
                </View>
              )}

              {/* Manual input fallback */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>⏱ Drop Time (seconds)</Text>
                <Text style={styles.inputHint}>Auto-filled by Mark Drop, or enter manually</Text>
                <View style={styles.inputRow}>
                  <Text style={styles.inputPrefix}>t =</Text>
                  <TextInput
                    style={styles.textInput}
                    value={dropTime}
                    onChangeText={setDropTime}
                    placeholder="e.g. 0.450"
                    placeholderTextColor="#aaa"
                    keyboardType="numeric"
                  />
                  <Text style={styles.inputSuffix}>s</Text>
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>💥 Contact Time (seconds)</Text>
                <Text style={styles.inputHint}>Auto-filled by Mark Landing, or enter manually</Text>
                <View style={styles.inputRow}>
                  <Text style={styles.inputPrefix}>tc =</Text>
                  <TextInput
                    style={styles.textInput}
                    value={contactTime}
                    onChangeText={setContactTime}
                    placeholder="e.g. 0.050"
                    placeholderTextColor="#aaa"
                    keyboardType="numeric"
                  />
                  <Text style={styles.inputSuffix}>s</Text>
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>🏀 Did the object bounce?</Text>
                <View style={styles.bounceRow}>
                  <TouchableOpacity
                    style={[styles.bounceBtn, bounceType === 'no_bounce' && styles.bounceBtnActive]}
                    onPress={() => setBounceType('no_bounce')}
                  >
                    <Text style={styles.bounceBtnText}>No Bounce</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.bounceBtn, bounceType === 'bounce' && styles.bounceBtnActive]}
                    onPress={() => setBounceType('bounce')}
                  >
                    <Text style={styles.bounceBtnText}>Bounced</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {bounceType === 'bounce' && (
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>⬆️ Time to Max Bounce Height (seconds)</Text>
                  <Text style={styles.inputHint}>Time from first contact to highest bounce point</Text>
                  <View style={styles.inputRow}>
                    <Text style={styles.inputPrefix}>tb =</Text>
                    <TextInput
                      style={styles.textInput}
                      value={bounceHeight}
                      onChangeText={setBounceHeight}
                      placeholder="e.g. 0.150"
                      placeholderTextColor="#aaa"
                      keyboardType="numeric"
                    />
                    <Text style={styles.inputSuffix}>s</Text>
                  </View>
                </View>
              )}

              {/* Live physics preview */}
              {dropTime ? (
                <View style={styles.previewBox}>
                  <Text style={styles.previewTitle}>📊 Calculated Results:</Text>
                  {(() => {
                    const physics = calculatePhysics();
                    if (!physics) return null;
                    return (
                      <>
                        <View style={styles.previewRow}>
                          <Text style={styles.previewLabel}>Final Velocity</Text>
                          <Text style={styles.previewValue}>{physics.finalVelocity} m/s</Text>
                        </View>
                        <View style={styles.previewRow}>
                          <Text style={styles.previewLabel}>Acceleration</Text>
                          <Text style={styles.previewValue}>{physics.acceleration} m/s²</Text>
                        </View>
                        <View style={styles.previewRow}>
                          <Text style={styles.previewLabel}>Net Force</Text>
                          <Text style={styles.previewValue}>{physics.netForce} N</Text>
                        </View>
                        <View style={styles.previewRow}>
                          <Text style={styles.previewLabel}>Weight</Text>
                          <Text style={styles.previewValue}>{physics.weight} N</Text>
                        </View>
                        <View style={styles.previewRow}>
                          <Text style={styles.previewLabel}>Drag Force</Text>
                          <Text style={styles.previewValue}>{physics.dragForce} N</Text>
                        </View>
                        {contactTime ? (
                          <View style={styles.previewRow}>
                            <Text style={styles.previewLabel}>G-Force</Text>
                            <Text style={styles.previewValue}>{physics.gForce} g</Text>
                          </View>
                        ) : null}
                      </>
                    );
                  })()}
                </View>
              ) : null}

              <TouchableOpacity style={styles.button} onPress={saveAndNext}>
                <Text style={styles.buttonText}>
                  {currentDesign + 1 < DESIGNS.length ? 'Save & Next Design →' : 'Save & See Results'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.backButton} onPress={() => setPhase('review')}>
                <Text style={styles.backButtonText}>← Back to Video</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* DONE PHASE */}
          {phase === 'done' && (
            <View style={styles.centeredBox}>
              <Text style={styles.title}>🎉 All Drops Complete!</Text>
              <Text style={styles.subtitle}>Parachute Drop Results:</Text>

              {resultsRef.current.length > 1 && (() => {
                const parachuteDesigns = resultsRef.current.slice(1);
                const best = parachuteDesigns.reduce((b, r) =>
                  parseFloat(r.dropTime) > parseFloat(b.dropTime) ? r : b, parachuteDesigns[0]);
                return (
                  <View style={styles.bestCard}>
                    <Text style={styles.bestTitle}>🏆 Best Parachute Design</Text>
                    <Text style={styles.bestName}>{best.design}</Text>
                    <Text style={styles.bestTime}>{best.dropTime}s drop time</Text>
                    <Text style={styles.bestForce}>Drag Force: {best.dragForce} N</Text>
                  </View>
                );
              })()}

              {resultsRef.current.map((r, i) => (
                <View key={i} style={styles.summaryCard}>
                  <Text style={styles.summaryTitle}>{r.design}</Text>
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Drop Time:</Text>
                    <Text style={styles.summaryValue}>{r.dropTime} s</Text>
                  </View>
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Final Velocity:</Text>
                    <Text style={styles.summaryValue}>{r.finalVelocity} m/s</Text>
                  </View>
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Acceleration:</Text>
                    <Text style={styles.summaryValue}>{r.acceleration} m/s²</Text>
                  </View>
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Net Force:</Text>
                    <Text style={styles.summaryValue}>{r.netForce} N</Text>
                  </View>
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Drag Force:</Text>
                    <Text style={styles.summaryValue}>{r.dragForce} N</Text>
                  </View>
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>G-Force:</Text>
                    <Text style={styles.summaryValue}>{r.gForce} g</Text>
                  </View>
                </View>
              ))}

              <TouchableOpacity
                style={styles.button}
                onPress={() => navigation.navigate('Activity1Reflection', {
                  teamName, prediction,
                  results: resultsRef.current,
                  dropHeight, objectMass,
                })}
              >
                <Text style={styles.buttonText}>Continue to Reflection</Text>
              </TouchableOpacity>
            </View>
          )}

        </ScrollView>
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  container: { flexGrow: 1, paddingTop: 60, paddingBottom: 40, paddingHorizontal: 24 },
  centeredBox: { width: '100%', alignItems: 'center' },
  permissionBox: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },

  // Full screen camera
  fullScreenCamera: {
    flex: 1,
    backgroundColor: '#000',
  },
  cameraTopOverlay: {
    position: 'absolute', top: 60, left: 0, right: 0,
    alignItems: 'center', zIndex: 10,
    paddingHorizontal: 20,
  },
  cameraTopText: {
    color: '#fff', fontSize: 14, fontWeight: 'bold',
    backgroundColor: 'rgba(0,0,0,0.6)', paddingHorizontal: 16,
    paddingVertical: 8, borderRadius: 20, textAlign: 'center',
  },
  cameraBottomControls: {
    position: 'absolute', bottom: 60, left: 0, right: 0,
    alignItems: 'center', zIndex: 10,
  },
  recordCircleButton: {
    width: 80, height: 80, borderRadius: 40,
    borderWidth: 4, borderColor: '#fff',
    justifyContent: 'center', alignItems: 'center',
    marginBottom: 20,
  },
  recordCircleInner: {
    width: 60, height: 60, borderRadius: 30,
    backgroundColor: '#f44336',
  },
  stopCircleButton: {
    width: 80, height: 80, borderRadius: 40,
    borderWidth: 4, borderColor: '#fff',
    justifyContent: 'center', alignItems: 'center',
    marginBottom: 20,
  },
  stopCircleInner: {
    width: 30, height: 30, borderRadius: 4,
    backgroundColor: '#fff',
  },
  cameraBackButton: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 20, paddingVertical: 10,
    borderRadius: 20,
  },
  cameraBackText: { color: '#fff', fontSize: 14 },

  // Video player
  videoPlayer: { width: '100%', height: 240, borderRadius: 16, marginBottom: 16 },
  calculateVideoPlayer: { width: '100%', height: 220, borderRadius: 16, marginBottom: 8 },

  // Millisecond timer
  videoSection: { width: '100%', marginBottom: 16 },
  timerDisplay: {
    backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: 12,
    padding: 12, alignItems: 'center', marginBottom: 8,
  },
  timerMs: { fontSize: 32, fontWeight: 'bold', color: '#ffe082', fontFamily: 'monospace' },
  timerLabel: { fontSize: 11, color: '#b0d4f1', marginTop: 2 },

  // Seek controls
  seekRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    marginBottom: 8, gap: 6,
  },
  seekBtn: {
    flex: 1, backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 10, paddingVertical: 8, alignItems: 'center',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)',
  },
  seekBtnText: { fontSize: 12, color: '#fff', fontWeight: '600' },

  // Mark buttons
  markRow: { flexDirection: 'row', gap: 8, marginBottom: 8 },
  markDropBtn: {
    flex: 1, backgroundColor: 'rgba(244,67,54,0.3)',
    borderRadius: 12, paddingVertical: 10, alignItems: 'center',
    borderWidth: 1, borderColor: '#f44336',
  },
  markLandBtn: {
    flex: 1, backgroundColor: 'rgba(76,175,80,0.3)',
    borderRadius: 12, paddingVertical: 10, alignItems: 'center',
    borderWidth: 1, borderColor: '#4caf50',
  },
  markBtnText: { fontSize: 13, color: '#fff', fontWeight: 'bold' },
  markBtnSub: { fontSize: 11, color: '#ffe082', marginTop: 2 },
  markHint: { fontSize: 11, color: '#b0d4f1', textAlign: 'center', marginBottom: 8, lineHeight: 16 },

  // General styles
  title: { fontSize: 22, fontWeight: 'bold', color: '#fff', marginBottom: 8, textAlign: 'center' },
  subtitle: { fontSize: 14, color: '#d0e8ff', marginBottom: 8, textAlign: 'center' },
  dropInfo: { fontSize: 13, color: '#ffe082', marginBottom: 16, fontWeight: 'bold' },
  checklistBox: {
    width: '100%', backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 16, padding: 16, marginBottom: 16,
  },
  checklistTitle: { fontSize: 14, fontWeight: 'bold', color: '#fff', marginBottom: 10, textAlign: 'center' },
  checklistItem: { fontSize: 13, color: '#d0e8ff', marginBottom: 8, lineHeight: 20 },
  tipBox: {
    width: '100%', backgroundColor: 'rgba(255,215,0,0.1)',
    borderRadius: 16, padding: 16, marginBottom: 20,
    borderWidth: 1, borderColor: 'rgba(255,215,0,0.3)',
  },
  tipTitle: { fontSize: 13, fontWeight: 'bold', color: '#ffe082', marginBottom: 8 },
  tipText: { fontSize: 13, color: '#d0e8ff', marginBottom: 4 },
  instructionBox: {
    width: '100%', backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 16, padding: 16, marginBottom: 16,
  },
  instructionTitle: { fontSize: 14, fontWeight: 'bold', color: '#fff', marginBottom: 10 },
  instructionItem: { fontSize: 13, color: '#d0e8ff', marginBottom: 6, lineHeight: 20 },
  inputGroup: { width: '100%', marginBottom: 16 },
  inputLabel: { fontSize: 14, fontWeight: 'bold', color: '#fff', marginBottom: 4 },
  inputHint: { fontSize: 12, color: '#b0d4f1', marginBottom: 8 },
  inputRow: { flexDirection: 'row', alignItems: 'center', width: '100%' },
  inputPrefix: { fontSize: 16, color: '#ffe082', fontWeight: 'bold', width: 40 },
  inputSuffix: { fontSize: 16, color: '#ffe082', fontWeight: 'bold', width: 30 },
  textInput: {
    flex: 1, backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 12, padding: 10, fontSize: 16,
    color: '#fff', borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)',
    marginHorizontal: 8,
  },
  bounceRow: { flexDirection: 'row', gap: 12, marginTop: 8 },
  bounceBtn: {
    flex: 1, paddingVertical: 10, borderRadius: 12, alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)', borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  bounceBtnActive: { backgroundColor: 'rgba(255,255,255,0.3)', borderColor: '#fff' },
  bounceBtnText: { fontSize: 13, color: '#fff', fontWeight: '600' },
  previewBox: {
    width: '100%', backgroundColor: 'rgba(76,175,80,0.15)',
    borderRadius: 16, padding: 16, marginBottom: 16,
    borderWidth: 1, borderColor: 'rgba(76,175,80,0.4)',
  },
  previewTitle: { fontSize: 14, fontWeight: 'bold', color: '#4caf50', marginBottom: 8 },
  previewRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  previewLabel: { fontSize: 13, color: '#d0e8ff' },
  previewValue: { fontSize: 13, fontWeight: 'bold', color: '#ffe082' },
  bestCard: {
    width: '100%', backgroundColor: 'rgba(255,215,0,0.15)',
    borderRadius: 20, padding: 20, alignItems: 'center',
    marginBottom: 16, borderWidth: 2, borderColor: '#FFD700',
  },
  bestTitle: { fontSize: 14, fontWeight: 'bold', color: '#FFD700', marginBottom: 4 },
  bestName: { fontSize: 18, color: '#fff', marginBottom: 4 },
  bestTime: { fontSize: 32, fontWeight: 'bold', color: '#ffe082', marginBottom: 4 },
  bestForce: { fontSize: 13, color: '#4caf50', fontWeight: 'bold' },
  summaryCard: {
    width: '100%', backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 16, padding: 16, marginBottom: 12,
  },
  summaryTitle: { fontSize: 15, fontWeight: 'bold', color: '#ffe082', marginBottom: 8 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  summaryLabel: { fontSize: 13, color: '#d0e8ff' },
  summaryValue: { fontSize: 13, fontWeight: 'bold', color: '#fff' },
  button: {
    backgroundColor: 'rgba(255,255,255,0.85)', borderRadius: 25,
    paddingVertical: 14, paddingHorizontal: 50, alignItems: 'center', marginTop: 8,
    width: '100%',
  },
  recordButton: {
    backgroundColor: '#f44336', borderRadius: 25,
    paddingVertical: 14, paddingHorizontal: 50, alignItems: 'center', marginTop: 8,
    width: '100%',
  },
  libraryButton: {
    backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 25,
    paddingVertical: 14, paddingHorizontal: 50, alignItems: 'center', marginTop: 12,
    width: '100%', borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)',
  },
  libraryButtonText: { fontSize: 15, color: '#fff', letterSpacing: 1 },
  backButton: { marginTop: 12, padding: 10 },
  backButtonText: { fontSize: 14, color: '#d0e8ff', textDecorationLine: 'underline' },
  buttonText: { fontSize: 15, fontWeight: 'bold', color: '#1a3a5c', letterSpacing: 1 },
});