import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { theme } from '../styles/theme';

interface TournamentCardProps {
  id: string;
  name: string;
  city: string;
  format: string;
  startDate: string;
  entryFee: number;
  participants: number;
  maxParticipants: number;
  onPress: () => void;
}

export const TournamentCard: React.FC<TournamentCardProps> = ({
  name,
  city,
  format,
  startDate,
  entryFee,
  participants,
  maxParticipants,
  onPress,
}) => {
  const participationPercentage = Math.round((participants / maxParticipants) * 100);

  return (
    <TouchableOpacity
      style={[theme.card, { marginBottom: theme.spacing.md }]}
      onPress={onPress}
    >
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: theme.spacing.md,
        }}
      >
        <View style={{ flex: 1 }}>
          <Text style={theme.heading}>{name}</Text>
          <Text style={[theme.subtext, { marginTop: theme.spacing.xs }]}>
            📍 {city}
          </Text>
        </View>
        <View
          style={{
            paddingHorizontal: theme.spacing.md,
            paddingVertical: theme.spacing.sm,
            borderRadius: 8,
            backgroundColor: theme.colors.primary,
          }}
        >
          <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 12 }}>
            {format}
          </Text>
        </View>
      </View>

      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          paddingVertical: theme.spacing.md,
          borderTopWidth: 1,
          borderTopColor: theme.colors.lightGray,
          marginBottom: theme.spacing.md,
        }}
      >
        <View>
          <Text style={theme.subtext}>📅 Date</Text>
          <Text style={[theme.text, { marginTop: theme.spacing.xs }]}>{startDate}</Text>
        </View>
        <View>
          <Text style={theme.subtext}>💰 Entry</Text>
          <Text style={[theme.text, { marginTop: theme.spacing.xs }]}>₹{entryFee}</Text>
        </View>
        <View>
          <Text style={theme.subtext}>👥 Players</Text>
          <Text style={[theme.text, { marginTop: theme.spacing.xs }]}>
            {participants}/{maxParticipants}
          </Text>
        </View>
      </View>

      {/* Progress Bar */}
      <View
        style={{
          height: 6,
          backgroundColor: theme.colors.lightGray,
          borderRadius: 3,
          overflow: 'hidden',
        }}
      >
        <View
          style={{
            height: '100%',
            width: `${participationPercentage}%`,
            backgroundColor: theme.colors.primary,
          }}
        />
      </View>
    </TouchableOpacity>
  );
};
