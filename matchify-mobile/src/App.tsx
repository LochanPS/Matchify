import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { notificationService } from './services/notifications';
import RootNavigator from './navigation/RootNavigator';

const AppContent = () => {
  const { isAuthenticated, loading } = useAuth();

  useEffect(() => {
    // Register for push notifications
    notificationService.registerForPushNotifications();

    // Listen for notifications
    const subscription = notificationService.addNotificationReceivedListener((notification) => {
      console.log('Notification received:', notification);
    });

    const responseSubscription = notificationService.addNotificationResponseListener((response) => {
      console.log('Notification response:', response);
    });

    return () => {
      subscription.remove();
      responseSubscription.remove();
    };
  }, []);

  if (loading) {
    return null; // Show splash screen while loading
  }

  return (
    <NavigationContainer>
      <RootNavigator isAuthenticated={isAuthenticated} />
      <StatusBar barStyle="dark-content" />
    </NavigationContainer>
  );
};

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </SafeAreaProvider>
  );
}
