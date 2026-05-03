import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Activity5IntroScreen from './screens/Activity5IntroScreen';
import Activity5InstructionsScreen from './screens/Activity5InstructionsScreen';
import Activity5ChallengeScreen from './screens/Activity5ChallengeScreen';
import Activity5ReflectionScreen from './screens/Activity5ReflectionScreen';
import LeaderboardScreen from './screens/LeaderboardScreen';
import LeaderboardDetailScreen from './screens/LeaderboardDetailScreen';
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import HomeScreen from './screens/HomeScreen';
import ActivityListScreen from './screens/ActivityListScreen';
import { View, Text } from 'react-native';

const Stack = createNativeStackNavigator();

function ComingSoonScreen() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#1a3a5c' }}>
      <Text style={{ color: '#fff', fontSize: 20 }}>Coming Soon!</Text>
    </View>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="ActivityList" component={ActivityListScreen} />
        <Stack.Screen name="Activity5" component={Activity5IntroScreen} />
        <Stack.Screen name="Activity5Instructions" component={Activity5InstructionsScreen} />
        <Stack.Screen name="Activity5Challenge" component={Activity5ChallengeScreen} />
        <Stack.Screen name="Activity5Reflection" component={Activity5ReflectionScreen} />
        <Stack.Screen name="Leaderboard" component={LeaderboardScreen} />
        <Stack.Screen name="LeaderboardDetail" component={LeaderboardDetailScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}