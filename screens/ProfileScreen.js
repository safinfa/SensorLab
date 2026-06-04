import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, Alert, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import { useState, useEffect } from 'react';
import { auth, db, storage } from '../firebaseConfig';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { signOut } from 'firebase/auth';

export default function ProfileScreen({ navigation, route }) {
  const { teamName } = route?.params || {};
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;
      const docRef = doc(db, 'teams', user.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setProfile(docSnap.data());
      } else {
        setProfile({
          teamName: teamName || 'Unknown Team',
          email: user.email,
          members: [],
          profilePictureUrl: null,
        });
      }
    } catch (error) {
      console.log('Load profile error:', error);
    } finally {
      setLoading(false);
    }
  };

  const showImageOptions = () => {
    Alert.alert(
      'Profile Picture',
      'Choose how to add your profile picture',
      [
        { text: 'Take Photo 📷', onPress: takePhoto },
        { text: 'Choose from Gallery 🖼️', onPress: pickFromGallery },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const takePhoto = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission needed', 'Please allow camera access.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (!result.canceled) uploadImage(result.assets[0].uri);
  };

  const pickFromGallery = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission needed', 'Please allow access to your photo library.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (!result.canceled) uploadImage(result.assets[0].uri);
  };

  const uploadImage = async (uri) => {
    setUploading(true);
    try {
      const user = auth.currentUser;
      const response = await fetch(uri);
      const blob = await response.blob();
      const storageRef = ref(storage, `profiles/${user.uid}/profile.jpg`);
      await uploadBytes(storageRef, blob);
      const downloadUrl = await getDownloadURL(storageRef);
      const docRef = doc(db, 'teams', user.uid);
      await updateDoc(docRef, { profilePictureUrl: downloadUrl });
      setProfile(prev => ({ ...prev, profilePictureUrl: downloadUrl }));
      Alert.alert('✅ Success', 'Profile picture updated!');
    } catch (error) {
      console.log('Upload error:', error);
      Alert.alert('Error', 'Could not upload profile picture. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert('Log Out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log Out', style: 'destructive',
        onPress: async () => {
          await signOut(auth);
          navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
        }
      }
    ]);
  };

  if (loading) {
    return (
      <LinearGradient colors={['#4a90d9', '#1a3a5c']} style={styles.gradient}>
        <View style={styles.loadingBox}>
          <ActivityIndicator color="#fff" size="large" />
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={['#4a90d9', '#1a3a5c']} style={styles.gradient}>
      <ScrollView contentContainerStyle={styles.container}>

        {/* Profile Picture */}
        <TouchableOpacity style={styles.avatarContainer} onPress={showImageOptions} disabled={uploading}>
          {profile?.profilePictureUrl ? (
            <Image source={{ uri: profile.profilePictureUrl }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarInitial}>
                {(profile?.teamName || 'T')[0].toUpperCase()}
              </Text>
            </View>
          )}

          {/* Camera icon overlay */}
          <View style={styles.cameraOverlay}>
            {uploading
              ? <ActivityIndicator color="#fff" size="small" />
              : <Text style={styles.cameraIcon}>📷</Text>
            }
          </View>
        </TouchableOpacity>

        <Text style={styles.uploadHint}>
          {uploading ? 'Uploading...' : 'Tap to change profile picture'}
        </Text>

        {/* Team Name */}
        <Text style={styles.teamName}>{profile?.teamName || teamName}</Text>
        <Text style={styles.email}>{auth.currentUser?.email}</Text>

        {/* Team Members */}
        {profile?.members?.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>👥 Team Members</Text>
            {profile.members.map((member, i) => (
              <View key={i} style={styles.memberRow}>
                <View style={styles.memberDot} />
                <Text style={styles.memberName}>{member}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Grade */}
        {profile?.grade && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🎓 Grade / Year Level</Text>
            <Text style={styles.sectionValue}>{profile.grade}</Text>
          </View>
        )}

        {/* Account Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📧 Account</Text>
          <Text style={styles.sectionValue}>{auth.currentUser?.email}</Text>
          <Text style={styles.sectionSubValue}>
            Member since {auth.currentUser?.metadata?.creationTime
              ? new Date(auth.currentUser.metadata.creationTime).toLocaleDateString()
              : 'N/A'}
          </Text>
        </View>

        {/* Back Button */}
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>← Back to Home</Text>
        </TouchableOpacity>

        {/* Logout */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>

      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  container: { alignItems: 'center', paddingTop: 60, paddingBottom: 40, paddingHorizontal: 24 },
  loadingBox: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  avatarContainer: {
    width: 120, height: 120, borderRadius: 60,
    marginBottom: 8, position: 'relative',
  },
  avatar: {
    width: 120, height: 120, borderRadius: 60,
    borderWidth: 3, borderColor: '#fff',
  },
  avatarPlaceholder: {
    width: 120, height: 120, borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 3, borderColor: '#fff',
  },
  avatarInitial: { fontSize: 48, fontWeight: 'bold', color: '#fff' },
  cameraOverlay: {
    position: 'absolute', bottom: 0, right: 0,
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: '#4a90d9', justifyContent: 'center',
    alignItems: 'center', borderWidth: 2, borderColor: '#fff',
  },
  cameraIcon: { fontSize: 16 },
  uploadHint: { fontSize: 12, color: '#b0d4f1', marginBottom: 16 },
  teamName: { fontSize: 26, fontWeight: 'bold', color: '#fff', marginBottom: 4, textAlign: 'center' },
  email: { fontSize: 14, color: '#b0d4f1', marginBottom: 24 },
  section: {
    width: '100%', backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 16, padding: 16, marginBottom: 16,
  },
  sectionTitle: { fontSize: 13, fontWeight: 'bold', color: '#ffe082', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 1 },
  sectionValue: { fontSize: 15, color: '#fff', fontWeight: '500' },
  sectionSubValue: { fontSize: 12, color: '#b0d4f1', marginTop: 4 },
  memberRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  memberDot: {
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: '#4caf50', marginRight: 10,
  },
  memberName: { fontSize: 14, color: '#d0e8ff' },
  backButton: {
    width: '100%', backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 25, paddingVertical: 14, alignItems: 'center',
    marginBottom: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)',
  },
  backButtonText: { fontSize: 14, color: '#fff', letterSpacing: 1 },
  logoutButton: {
    width: '100%', backgroundColor: 'rgba(244,67,54,0.2)',
    borderRadius: 25, paddingVertical: 14, alignItems: 'center',
    borderWidth: 1, borderColor: 'rgba(244,67,54,0.4)',
  },
  logoutText: { fontSize: 14, color: '#ff8a80', fontWeight: 'bold', letterSpacing: 1 },
});