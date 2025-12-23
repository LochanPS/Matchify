import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { theme } from '../styles/theme';

interface LoadingSpinnerProps {
  size?: 'small' | 'large';
  color?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'large',
  color = theme.colors.primary,
}) => (
  <View style={[theme.container, { justifyContent: 'center', alignItems: 'center' }]}>
    <ActivityIndicator size={size} color={color} />
  </View>
);
