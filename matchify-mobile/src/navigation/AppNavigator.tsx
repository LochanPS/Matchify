import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../styles/theme';

// Player Screens
import { TournamentListScreen } from '../screens/player/TournamentListScreen';
import { TournamentDetailScreen } from '../screens/player/TournamentDetailScreen';
import { PlayerProfileScreen } from '../screens/player/PlayerProfileScreen';
import { SettingsScreen } from '../screens/player/SettingsScreen';

// Organizer Screens
import { OrganizerDashboardScreen } from '../screens/organizer/OrganizerDashboardScreen';
import { CreateTournamentScreen } from '../screens/organizer/CreateTournamentScreen';
import { ManageTournamentScreen } from '../screens/organizer/ManageTournamentScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// Tournament Stack
const TournamentStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: true,
        headerStyle: { backgroundColor: colors.primary },
        headerTintColor: colors.white,
        headerTitleStyle: { fontWeight: '600' }
      }}
    >
      <Stack.Screen
        name="TournamentList"
        component={TournamentListScreen}
        options={{ title: 'Tournaments' }}
      />
      <Stack.Screen
        name="TournamentDetail"
        component={TournamentDetailScreen}
        options={{ title: 'Tournament Details' }}
      />
    </Stack.Navigator>
  );
};

// Profile Stack
const ProfileStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: true,
        headerStyle: { backgroundColor: colors.primary },
        headerTintColor: colors.white,
        headerTitleStyle: { fontWeight: '600' }
      }}
    >
      <Stack.Screen
        name="Profile"
        component={PlayerProfileScreen}
        options={{ title: 'My Profile' }}
      />
      <Stack.Screen
        name="Settings"
        component={SettingsScreen}
        options={{ title: 'Settings' }}
      />
    </Stack.Navigator>
  );
};

// Organizer Stack
const OrganizerStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: true,
        headerStyle: { backgroundColor: colors.primary },
        headerTintColor: colors.white,
        headerTitleStyle: { fontWeight: '600' }
      }}
    >
      <Stack.Screen
        name="OrganizerDashboard"
        component={OrganizerDashboardScreen}
        options={{ title: 'My Tournaments' }}
      />
      <Stack.Screen
        name="CreateTournament"
        component={CreateTournamentScreen}
        options={{ title: 'Create Tournament' }}
      />
      <Stack.Screen
        name="ManageTournament"
        component={ManageTournamentScreen}
        options={{ title: 'Manage Tournament' }}
      />
    </Stack.Navigator>
  );
};

const AppNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap = 'home';

          if (route.name === 'Tournaments') {
            iconName = focused ? 'trophy' : 'trophy-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          } else if (route.name === 'Organizer') {
            iconName = focused ? 'settings' : 'settings-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.gray,
        tabBarStyle: {
          backgroundColor: colors.white,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          paddingBottom: 5,
          paddingTop: 5
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600'
        }
      })}
    >
      <Tab.Screen
        name="Tournaments"
        component={TournamentStack}
        options={{
          tabBarLabel: 'Tournaments'
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileStack}
        options={{
          tabBarLabel: 'Profile'
        }}
      />
      <Tab.Screen
        name="Organizer"
        component={OrganizerStack}
        options={{
          tabBarLabel: 'Organize'
        }}
      />
    </Tab.Navigator>
  );
};

export default AppNavigator;
