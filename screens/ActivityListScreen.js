import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const activities = [
  { id: 1, image: require('../assets/act1_parachute.png'), active: false, screen: 'Activity1' },
  { id: 2, image: require('../assets/act2_sound.png'), active: true, screen: 'Activity2' },
  { id: 3, image: require('../assets/act3_handfan.png'), active: true, screen: 'Activity3' },
  { id: 4, image: require('../assets/act4_earthquake.png'), active: true, screen: 'Activity4' },
  { id: 5, image: require('../assets/act5_human.png'), active: true, screen: 'Activity5' },
  { id: 6, image: require('../assets/act6_reaction.png'), active: true, screen: 'Activity6' },
  { id: 7, image: require('../assets/act7_breathing.png'), active: true, screen: 'Activity7' },
];

export default function ActivityListScreen({ navigation, route }) {
  const teamName = route?.params?.teamName || 'Student';

  const handlePress = (item) => {
    if (!item.active) {
      Alert.alert('Locked 🔒', 'This activity is not available yet. Stay tuned!');
      return;
    }
    navigation.navigate(item.screen, { teamName });
  };

  return (
    <LinearGradient colors={['#4a90d9', '#1a3a5c']} style={styles.gradient}>
      <ScrollView contentContainerStyle={styles.container}>

        {/* Logo */}
        <Image source={require('../assets/logo.png')} style={styles.logo} resizeMode="contain" />

        {/* Subtitle */}
        <Text style={styles.subtitle}>Which activity would you like to do today?</Text>

        {/* Activities Grid */}
        <View style={styles.grid}>
          {activities.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={[styles.card, !item.active && styles.cardLocked]}
              onPress={() => handlePress(item)}
              activeOpacity={item.active ? 0.7 : 0.5}
            >
              <Image source={item.image} style={styles.cardImage} resizeMode="contain" />
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
  logo: { width: 180, height: 120, marginBottom: 4 },
  subtitle: { fontSize: 14, color: '#d0e8ff', marginBottom: 24, textAlign: 'center' },
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
  cardLocked: { opacity: 0.55 },
  cardImage: { width: '100%', height: '100%' },
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