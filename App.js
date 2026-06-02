import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Activity3IntroScreen from './screens/Activity3IntroScreen';
import Activity3InstructionsScreen from './screens/Activity3InstructionsScreen';
import Activity3ChallengeScreen from './screens/Activity3ChallengeScreen';
import Activity3ReflectionScreen from './screens/Activity3ReflectionScreen';
import Activity4IntroScreen from './screens/Activity4IntroScreen';
import Activity4InstructionsScreen from './screens/Activity4InstructionsScreen';
import Activity4ChallengeScreen from './screens/Activity4ChallengeScreen';
import Activity4ReflectionScreen from './screens/Activity4ReflectionScreen';
import Activity5IntroScreen from './screens/Activity5IntroScreen';
import Activity5InstructionsScreen from './screens/Activity5InstructionsScreen';
import Activity5ChallengeScreen from './screens/Activity5ChallengeScreen';
import Activity5ReflectionScreen from './screens/Activity5ReflectionScreen';
import Activity6IntroScreen from './screens/Activity6IntroScreen';
import Activity6InstructionsScreen from './screens/Activity6InstructionsScreen';
import Activity6ChallengeScreen from './screens/Activity6ChallengeScreen';
import Activity6ReflectionScreen from './screens/Activity6ReflectionScreen';
import Activity7IntroScreen from './screens/Activity7IntroScreen';
import Activity7InstructionsScreen from './screens/Activity7InstructionsScreen';
import Activity7ChallengeScreen from './screens/Activity7ChallengeScreen';
import Activity7ReflectionScreen from './screens/Activity7ReflectionScreen';
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
        <Stack.Screen name="Activity3" component={Activity3IntroScreen} />
        <Stack.Screen name="Activity3Instructions" component={Activity3InstructionsScreen} />
        <Stack.Screen name="Activity3Challenge" component={Activity3ChallengeScreen} />
        <Stack.Screen name="Activity3Reflection" component={Activity3ReflectionScreen} />
        <Stack.Screen name="Activity4" component={Activity4IntroScreen} />
        <Stack.Screen name="Activity4Instructions" component={Activity4InstructionsScreen} />
        <Stack.Screen name="Activity4Challenge" component={Activity4ChallengeScreen} />
        <Stack.Screen name="Activity4Reflection" component={Activity4ReflectionScreen} />
        <Stack.Screen name="Activity5" component={Activity5IntroScreen} />
        <Stack.Screen name="Activity5Instructions" component={Activity5InstructionsScreen} />
        <Stack.Screen name="Activity5Challenge" component={Activity5ChallengeScreen} />
        <Stack.Screen name="Activity5Reflection" component={Activity5ReflectionScreen} />
        <Stack.Screen name="Activity6" component={Activity6IntroScreen} />
        <Stack.Screen name="Activity6Instructions" component={Activity6InstructionsScreen} />
        <Stack.Screen name="Activity6Challenge" component={Activity6ChallengeScreen} />
        <Stack.Screen name="Activity6Reflection" component={Activity6ReflectionScreen} />
        <Stack.Screen name="Activity7" component={Activity7IntroScreen} />
        <Stack.Screen name="Activity7Instructions" component={Activity7InstructionsScreen} />
        <Stack.Screen name="Activity7Challenge" component={Activity7ChallengeScreen} />
        <Stack.Screen name="Activity7Reflection" component={Activity7ReflectionScreen} />
        <Stack.Screen name="Leaderboard" component={LeaderboardScreen} />
        <Stack.Screen name="LeaderboardDetail" component={LeaderboardDetailScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}