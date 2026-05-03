import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const menuItems = [
  { id: 1, label: 'START NEW ACTIVITY', image: require('../assets/start_new_activity.png'), active: true, screen: 'ActivityList' },
  { id: 2, label: 'PREVIOUS ACTIVITIES', image: require('../assets/previous_activities.png'), active: false },
  { id: 3, label: 'VIEW PROFILE', image: require('../assets/view_profile.png'), active: false },
  { id: 4, label: 'SETTINGS', image: require('../assets/settings.png'), active: false },
  { id: 5, label: 'LEADERBOARD', image: require('../assets/leaderboard.png'), active: true, screen: 'Leaderboard' },
  { id: 6, label: 'TEAMS', image: require('../assets/teams.png'), active: false },
];

export default function HomeScreen({ navigation, route }) {
  const teamName = route?.params?.teamName || 'Student';

  const handlePress = (item) => {
    if (!item.active) {
      Alert.alert('Coming Soon!', 'This feature will be available in the next update!');
      return;
    }
    navigation.navigate(item.screen, { teamName });
  };

  return (
    <LinearGradient colors={['#4a90d9', '#1a3a5c']} style={styles.gradient}>
      <ScrollView contentContainerStyle={styles.container}>

        {/* Logo */}
        <Image source={require('../assets/logo.png')} style={styles.logo} resizeMode="contain" />

        {/* Welcome Text */}
        <Text style={styles.welcome}>Welcome, {teamName}!</Text>
        <Text style={styles.subtitle}>What would you like to do today?</Text>

        {/* 2x3 Grid */}
        <View style={styles.grid}>
          {menuItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={[styles.card, !item.active && styles.cardLocked]}
              onPress={() => handlePress(item)}
              activeOpacity={item.active ? 0.7 : 0.5}
            >
              <Image source={item.image} style={[styles.cardImage, !item.active && styles.imagelocked]} resizeMode="contain" />
              {!item.active && (
                <View style={styles.lockBadge}>
                  <Text style={styles.lockText}>🔒</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>

      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  container: { alignItems: 'center', paddingTop: 50, paddingBottom: 40, paddingHorizontal: 16 },
  logo: { width: 180, height: 120, marginBottom: 10 },
  welcome: { fontSize: 22, fontWeight: 'bold', color: '#fff', marginBottom: 4 },
  subtitle: { fontSize: 13, color: '#d0e8ff', marginBottom: 24 },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 16,
  },
  card: {
    width: '44%',
    aspectRatio: 1,
    borderRadius: 20,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  cardLocked: {
    opacity: 0.6,
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  imagelocked: {
    opacity: 0.7,
  },
  lockBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 12,
    padding: 3,
  },
  lockText: { fontSize: 14 },
});