import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, Alert, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useState, useEffect } from 'react';
import { auth, db } from '../firebaseConfig';
import { doc, getDoc, deleteDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { signOut, deleteUser } from 'firebase/auth';

export default function SettingsScreen({ navigation, route }) {
  const { teamName } = route?.params || {};
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

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

  const handleDeleteAccount = () => {
    Alert.alert(
      '⚠️ Delete Account',
      'This will permanently delete your account and all your activity data. This cannot be undone!',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete Account', style: 'destructive',
          onPress: () => {
            Alert.alert(
              'Are you absolutely sure?',
              'All your leaderboard entries, results and profile will be deleted forever.',
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Yes, Delete Everything', style: 'destructive',
                  onPress: async () => {
                    setDeleting(true);
                    try {
                      const user = auth.currentUser;

                      // Delete leaderboard entries
                      const q = query(collection(db, 'leaderboard'), where('userId', '==', user.uid));
                      const snapshot = await getDocs(q);
                      const deletePromises = snapshot.docs.map(d => deleteDoc(doc(db, 'leaderboard', d.id)));
                      await Promise.all(deletePromises);

                      // Delete team document
                      await deleteDoc(doc(db, 'teams', user.uid));

                      // Delete Firebase Auth account
                      await deleteUser(user);

                      Alert.alert('Account Deleted', 'Your account has been permanently deleted.');
                      navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
                    } catch (error) {
                      console.log('Delete error:', error);
                      Alert.alert('Error', 'Could not delete account. You may need to log out and log back in first, then try again.');
                    } finally {
                      setDeleting(false);
                    }
                  }
                }
              ]
            );
          }
        }
      ]
    );
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

        <Text style={styles.title}>⚙️ Settings</Text>

        {/* Profile Card */}
        <View style={styles.profileCard}>
          {profile?.profilePictureUrl ? (
            <Image source={{ uri: profile.profilePictureUrl }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarInitial}>
                {(profile?.teamName || 'T')[0].toUpperCase()}
              </Text>
            </View>
          )}
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{profile?.teamName || teamName}</Text>
            <Text style={styles.profileEmail}>{auth.currentUser?.email}</Text>
            {profile?.members?.length > 0 && (
              <Text style={styles.profileMembers}>
                👥 {profile.members.join(', ')}
              </Text>
            )}
            {profile?.grade && (
              <Text style={styles.profileGrade}>🎓 {profile.grade}</Text>
            )}
            <Text style={styles.profileSince}>
              Member since {auth.currentUser?.metadata?.creationTime
                ? new Date(auth.currentUser.metadata.creationTime).toLocaleDateString()
                : 'N/A'}
            </Text>
          </View>
        </View>

        {/* Go to full profile */}
        <TouchableOpacity
          style={styles.profileButton}
          onPress={() => navigation.navigate('Profile', { teamName })}
        >
          <Text style={styles.profileButtonText}>👤 Edit Profile & Change Picture</Text>
          <Text style={styles.profileButtonArrow}>→</Text>
        </TouchableOpacity>

        {/* Divider */}
        <View style={styles.divider} />

        {/* Log Out */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutIcon}>🚪</Text>
          <View style={styles.actionContent}>
            <Text style={styles.logoutTitle}>Log Out</Text>
            <Text style={styles.logoutSubtitle}>Sign out of your account</Text>
          </View>
          <Text style={styles.actionArrow}>→</Text>
        </TouchableOpacity>

        {/* Divider */}
        <View style={styles.divider} />

        {/* Delete Account */}
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={handleDeleteAccount}
          disabled={deleting}
        >
          {deleting ? (
            <ActivityIndicator color="#ff8a80" size="small" style={{ marginRight: 12 }} />
          ) : (
            <Text style={styles.deleteIcon}>🗑️</Text>
          )}
          <View style={styles.actionContent}>
            <Text style={styles.deleteTitle}>Delete Account</Text>
            <Text style={styles.deleteSubtitle}>Permanently delete all your data</Text>
          </View>
          <Text style={styles.actionArrow}>→</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>← Back to Home</Text>
        </TouchableOpacity>

      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  container: { alignItems: 'center', paddingTop: 60, paddingBottom: 40, paddingHorizontal: 24 },
  loadingBox: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#fff', marginBottom: 24, textAlign: 'center' },

  // Profile card
  profileCard: {
    width: '100%', backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 20, padding: 20, flexDirection: 'row',
    alignItems: 'center', marginBottom: 12,
  },
  avatar: {
    width: 70, height: 70, borderRadius: 35,
    borderWidth: 2, borderColor: '#fff', marginRight: 16,
  },
  avatarPlaceholder: {
    width: 70, height: 70, borderRadius: 35,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 2, borderColor: '#fff', marginRight: 16,
  },
  avatarInitial: { fontSize: 28, fontWeight: 'bold', color: '#fff' },
  profileInfo: { flex: 1 },
  profileName: { fontSize: 17, fontWeight: 'bold', color: '#fff', marginBottom: 2 },
  profileEmail: { fontSize: 12, color: '#b0d4f1', marginBottom: 4 },
  profileMembers: { fontSize: 12, color: '#d0e8ff', marginBottom: 2 },
  profileGrade: { fontSize: 12, color: '#d0e8ff', marginBottom: 2 },
  profileSince: { fontSize: 11, color: '#b0d4f1' },

  // Edit profile button
  profileButton: {
    width: '100%', backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 16, padding: 16, flexDirection: 'row',
    alignItems: 'center', justifyContent: 'space-between',
    marginBottom: 24, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)',
  },
  profileButtonText: { fontSize: 14, color: '#fff', fontWeight: '600' },
  profileButtonArrow: { fontSize: 16, color: '#b0d4f1' },

  // Divider
  divider: {
    width: '100%', height: 1,
    backgroundColor: 'rgba(255,255,255,0.1)', marginBottom: 16,
  },

  // Action buttons
  logoutButton: {
    width: '100%', backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 16, padding: 16, flexDirection: 'row',
    alignItems: 'center', marginBottom: 16,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)',
  },
  logoutIcon: { fontSize: 22, marginRight: 12 },
  actionContent: { flex: 1 },
  logoutTitle: { fontSize: 15, fontWeight: 'bold', color: '#fff', marginBottom: 2 },
  logoutSubtitle: { fontSize: 12, color: '#b0d4f1' },
  actionArrow: { fontSize: 16, color: '#b0d4f1' },

  deleteButton: {
    width: '100%', backgroundColor: 'rgba(244,67,54,0.1)',
    borderRadius: 16, padding: 16, flexDirection: 'row',
    alignItems: 'center', marginBottom: 32,
    borderWidth: 1, borderColor: 'rgba(244,67,54,0.3)',
  },
  deleteIcon: { fontSize: 22, marginRight: 12 },
  deleteTitle: { fontSize: 15, fontWeight: 'bold', color: '#ff8a80', marginBottom: 2 },
  deleteSubtitle: { fontSize: 12, color: '#ffb3b0' },

  backButton: {
    width: '100%', backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 25, paddingVertical: 14, alignItems: 'center',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)',
  },
  backButtonText: { fontSize: 14, color: '#fff', letterSpacing: 1 },
});