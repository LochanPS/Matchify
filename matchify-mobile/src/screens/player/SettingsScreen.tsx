import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { theme } from '../../styles/theme';

export const SettingsScreen: React.FC = () => {
  const { logout } = useAuth();
  const [notifications, setNotifications] = React.useState(true);
  const [emailUpdates, setEmailUpdates] = React.useState(true);

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: logout,
      },
    ]);
  };

  return (
    <ScrollView style={theme.container}>
      {/* Notifications Section */}
      <View style={{ marginBottom: theme.spacing.lg }}>
        <Text style={[theme.heading, { marginBottom: theme.spacing.md }]}>Notifications</Text>

        <SettingRow
          label="Push Notifications"
          value={notifications}
          onValueChange={setNotifications}
        />
        <SettingRow
          label="Email Updates"
          value={emailUpdates}
          onValueChange={setEmailUpdates}
        />
      </View>

      {/* About Section */}
      <View style={{ marginBottom: theme.spacing.lg }}>
        <Text style={[theme.heading, { marginBottom: theme.spacing.md }]}>About</Text>

        <SettingItem label="App Version" value="1.0.0" />
        <SettingItem label="Build Number" value="1" />
      </View>

      {/* Help Section */}
      <View style={{ marginBottom: theme.spacing.lg }}>
        <Text style={[theme.heading, { marginBottom: theme.spacing.md }]}>Help</Text>

        <TouchableOpacity
          style={[theme.card, { marginBottom: theme.spacing.md }]}
          onPress={() => Alert.alert('Help', 'Help feature coming soon')}
        >
          <Text style={theme.text}>📖 Help Center</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[theme.card, { marginBottom: theme.spacing.md }]}
          onPress={() => Alert.alert('Contact', 'Contact support feature coming soon')}
        >
          <Text style={theme.text}>📧 Contact Support</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[theme.card, { marginBottom: theme.spacing.md }]}
          onPress={() => Alert.alert('Terms', 'Terms & Conditions feature coming soon')}
        >
          <Text style={theme.text}>📋 Terms & Conditions</Text>
        </TouchableOpacity>
      </View>

      {/* Logout Button */}
      <TouchableOpacity
        style={[theme.button, { backgroundColor: theme.colors.error, marginBottom: theme.spacing.lg }]}
        onPress={handleLogout}
      >
        <Text style={theme.buttonText}>Logout</Text>
      </TouchableOpacity>

      <View style={{ height: theme.spacing.lg }} />
    </ScrollView>
  );
};

interface SettingRowProps {
  label: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
}

const SettingRow: React.FC<SettingRowProps> = ({ label, value, onValueChange }) => (
  <View
    style={[
      theme.card,
      {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: theme.spacing.md,
      },
    ]}
  >
    <Text style={theme.text}>{label}</Text>
    <Switch
      value={value}
      onValueChange={onValueChange}
      trackColor={{ false: theme.colors.lightGray, true: theme.colors.primary }}
      thumbColor={value ? theme.colors.primary : theme.colors.gray}
    />
  </View>
);

interface SettingItemProps {
  label: string;
  value: string;
}

const SettingItem: React.FC<SettingItemProps> = ({ label, value }) => (
  <View
    style={[
      theme.card,
      {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: theme.spacing.md,
      },
    ]}
  >
    <Text style={theme.text}>{label}</Text>
    <Text style={[theme.subtext, { fontWeight: 'bold' }]}>{value}</Text>
  </View>
);
