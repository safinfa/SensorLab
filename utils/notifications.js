import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Configure how notifications appear
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

// Request permission
export const requestNotificationPermission = async () => {
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
};

// Schedule daily reminder at 9am
export const scheduleDailyReminder = async () => {
  // Cancel existing daily reminders first
  await cancelDailyReminder();

  const id = await Notifications.scheduleNotificationAsync({
    content: {
      title: '🔬 STEMM Lab — Time to Experiment!',
      body: "Don't forget to complete today's activity. Your team is waiting! 🚀",
      sound: true,
      data: { type: 'daily_reminder' },
    },
    trigger: {
      hour: 9,
      minute: 0,
      repeats: true,
    },
  });

  await AsyncStorage.setItem('daily_reminder_id', id);
  return id;
};

// Cancel daily reminder
export const cancelDailyReminder = async () => {
  try {
    const id = await AsyncStorage.getItem('daily_reminder_id');
    if (id) {
      await Notifications.cancelScheduledNotificationAsync(id);
      await AsyncStorage.removeItem('daily_reminder_id');
    }
  } catch (e) {}
};

// Send immediate notification when activity is submitted
export const sendSubmitNotification = (activityName) => {
  Notifications.scheduleNotificationAsync({
    content: {
      title: '🎉 Results Submitted!',
      body: `Your ${activityName} results are now on the leaderboard. Check your ranking!`,
      sound: true,
      data: { type: 'submit' },
    },
    trigger: null, // immediate
  });
};

// Save user's leaderboard ranks to AsyncStorage
export const saveUserRanks = async (userId, activityId, rank) => {
  try {
    const key = `rank_${userId}_${activityId}`;
    await AsyncStorage.setItem(key, String(rank));
  } catch (e) {}
};

// Check if user's rank dropped and notify
export const checkAndNotifyRankDrop = async (userId, activityId, newRank) => {
  try {
    const key = `rank_${userId}_${activityId}`;
    const savedRank = await AsyncStorage.getItem(key);

    if (savedRank !== null) {
      const oldRank = parseInt(savedRank);
      if (newRank > oldRank) {
        // Rank dropped — someone beat their score
        await Notifications.scheduleNotificationAsync({
          content: {
            title: '😲 Someone Beat Your Score!',
            body: `You dropped from #${oldRank} to #${newRank} on Activity ${activityId}. Time to beat them back! 💪`,
            sound: true,
            data: { type: 'rank_drop', activityId },
          },
          trigger: null, // immediate
        });
      } else if (newRank < oldRank) {
        // Rank improved
        await Notifications.scheduleNotificationAsync({
          content: {
            title: '🏆 You Climbed the Leaderboard!',
            body: `You moved up from #${oldRank} to #${newRank}! Keep it up! 🚀`,
            sound: true,
            data: { type: 'rank_up', activityId },
          },
          trigger: null,
        });
      }
    }

    // Save new rank
    await saveUserRanks(userId, activityId, newRank);
  } catch (e) {}
};