import React from 'react';
import { View, Text } from 'react-native';
import { theme } from '../styles/theme';

interface EmptyStateProps {
  icon: string;
  title: string;
  message: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ icon, title, message }) => (
  <View
    style={[
      theme.card,
      {
        alignItems: 'center',
        paddingVertical: theme.spacing.xl,
        marginVertical: theme.spacing.lg,
      },
    ]}
  >
    <Text style={{ fontSize: 48, marginBottom: theme.spacing.md }}>{icon}</Text>
    <Text style={[theme.heading, { marginBottom: theme.spacing.sm }]}>{title}</Text>
    <Text style={[theme.subtext, { textAlign: 'center' }]}>{message}</Text>
  </View>
);
