import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebaseConfig';
import { Profanity } from '@2toad/profanity';

const profanity = new Profanity();

export default function RegisterScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [teamName, setTeamName] = useState('');
  const [members, setMembers] = useState(['', '', '', '']);
  const [grade, setGrade] = useState('');
  const [loading, setLoading] = useState(false);

  const updateMember = (index, value) => {
    const updated = [...members];
    updated[index] = value;
    setMembers(updated);
  };

  const generateDiscriminator = () => {
    return Math.floor(1000 + Math.random() * 9000).toString();
  };

  const handleRegister = async () => {
    if (!email || !password || !teamName || !grade) {
      Alert.alert('Oops!', 'Please fill in email, password, team name, and grade.');
      return;
    }
    if (members.filter(m => m.trim() !== '').length === 0) {
      Alert.alert('Oops!', 'Please enter at least one team member name.');
      return;
    }

    // Bad words filter on team name
    if (profanity.exists(teamName)) {
      Alert.alert('⚠️ Inappropriate Name', 'Your team name contains inappropriate words. Please choose a different name.');
      return;
    }

    // Bad words filter on member names
    const badMember = members.find(m => m.trim() !== '' && profanity.exists(m));
    if (badMember) {
      Alert.alert('⚠️ Inappropriate Name', 'A team member name contains inappropriate words. Please fix it and try again.');
      return;
    }

    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const uid = userCredential.user.uid;
      const discriminator = generateDiscriminator();

      await setDoc(doc(db, 'teams', uid), {
        teamName,
        discriminator,
        members: members.filter(m => m.trim() !== ''),
        grade,
        email,
        createdAt: new Date().toISOString(),
      });

      Alert.alert('Success!', `Welcome, Team ${teamName}#${discriminator}!`, [
        { text: 'Let\'s Go!', onPress: () => navigation.navigate('Login') }
      ]);
    } catch (error) {
      if (error.code === 'auth/email-already-in-use') {
        Alert.alert('Error', 'That email is already registered!');
      } else if (error.code === 'auth/weak-password') {
        Alert.alert('Error', 'Password must be at least 6 characters.');
      } else {
        Alert.alert('Error', 'Something went wrong. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={['#4a90d9', '#1a3a5c']} style={styles.gradient}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Create Your Team</Text>
        <Text style={styles.subtitle}>Register to start your STEMM journey!</Text>

        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          placeholder="team@email.com"
          placeholderTextColor="#999"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <Text style={styles.label}>Password</Text>
        <TextInput
          style={styles.input}
          placeholder="Min. 6 characters"
          placeholderTextColor="#999"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <Text style={styles.label}>Team Name</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. The Rocket Squad"
          placeholderTextColor="#999"
          value={teamName}
          onChangeText={setTeamName}
        />

        <Text style={styles.label}>Grade / Year Level</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. Year 7"
          placeholderTextColor="#999"
          value={grade}
          onChangeText={setGrade}
        />

        <Text style={styles.label}>Team Members (First Names)</Text>
        {members.map((member, index) => (
          <TextInput
            key={index}
            style={styles.input}
            placeholder={`Member ${index + 1}${index === 0 ? ' (required)' : ' (optional)'}`}
            placeholderTextColor="#999"
            value={member}
            onChangeText={(val) => updateMember(index, val)}
          />
        ))}

        <Text style={styles.discriminatorNote}>
          Your Team Discriminator will be auto-assigned after registration!
        </Text>

        <TouchableOpacity style={styles.registerButton} onPress={handleRegister} disabled={loading}>
          {loading ? <ActivityIndicator color="#1a3a5c" /> : <Text style={styles.registerText}>CREATE TEAM</Text>}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
          <Text style={styles.loginLink}>Already have an account? Login Here</Text>
        </TouchableOpacity>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  container: { paddingHorizontal: 28, paddingTop: 60, paddingBottom: 40 },
  title: { fontSize: 26, fontWeight: 'bold', color: '#fff', textAlign: 'center', marginBottom: 6 },
  subtitle: { fontSize: 14, color: '#d0e8ff', textAlign: 'center', marginBottom: 28 },
  label: { fontSize: 13, fontWeight: '600', color: '#e0f0ff', marginBottom: 6, marginLeft: 4 },
  input: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 25,
    paddingHorizontal: 20,
    paddingVertical: 13,
    fontSize: 14,
    marginBottom: 14,
    color: '#333',
  },
  discriminatorNote: {
    fontSize: 12,
    color: '#b0d4f1',
    textAlign: 'center',
    marginBottom: 20,
    fontStyle: 'italic',
  },
  registerButton: {
    backgroundColor: 'rgba(255,255,255,0.85)',
    borderRadius: 25,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 20,
  },
  registerText: { fontSize: 15, fontWeight: 'bold', color: '#1a3a5c', letterSpacing: 2 },
  loginLink: { color: '#ffffff', fontSize: 13, textAlign: 'center', textDecorationLine: 'underline' },
});