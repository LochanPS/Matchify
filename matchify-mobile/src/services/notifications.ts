import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true
  })
});

class NotificationService {
  private expoPushToken: string | null = null;

  async registerForPushNotifications() {
    try {
      if (!Device.isDevice) {
        console.log('Must use physical device for push notifications');
        return;
      }

      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.log('Failed to get push token for push notification!');
        return;
      }

      const projectId = Constants.expoConfig?.extra?.eas?.projectId;
      if (!projectId) {
        throw new Error('Project ID not found');
      }

      const token = await Notifications.getExpoPushTokenAsync({
        projectId
      });

      this.expoPushToken = token.data;
      console.log('Expo push token:', this.expoPushToken);

      return this.expoPushToken;
    } catch (error) {
      console.error('Error registering for push notifications:', error);
    }
  }

  async sendLocalNotification(title: string, body: string, data?: any) {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data: data || {},
          sound: 'default',
          badge: 1
        },
        trigger: { seconds: 2 }
      });
    } catch (error) {
      console.error('Error sending local notification:', error);
    }
  }

  async sendScheduledNotification(
    title: string,
    body: string,
    seconds: number,
    data?: any
  ) {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data: data || {},
          sound: 'default',
          badge: 1
        },
        trigger: { seconds }
      });
    } catch (error) {
      console.error('Error sending scheduled notification:', error);
    }
  }

  addNotificationResponseListener(callback: (response: Notifications.NotificationResponse) => void) {
    return Notifications.addNotificationResponseReceivedListener(callback);
  }

  addNotificationReceivedListener(callback: (notification: Notifications.Notification) => void) {
    return Notifications.addNotificationReceivedListener(callback);
  }

  getExpoPushToken() {
    return this.expoPushToken;
  }
}

export const notificationService = new NotificationService();
