import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { api } from '../../services/api';
import { theme } from '../../styles/theme';

interface Tournament {
  id: string;
  name: string;
  description: string;
  city: string;
  format: string;
  startDate: string;
  endDate: string;
  entryFee: number;
  maxParticipants: number;
  currentParticipants: number;
  status: 'upcoming' | 'ongoing' | 'completed';
  organizer: string;
  rules: string;
}

export const TournamentDetailScreen: React.FC = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { tournamentId } = route.params as { tournamentId: string };

  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [registering, setRegistering] = useState(false);

  useEffect(() => {
    fetchTournamentDetails();
  }, [tournamentId]);

  const fetchTournamentDetails = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/tournaments/${tournamentId}`);
      setTournament(res.data);
      
      // Check if user is registered
      const regRes = await api.get(`/tournaments/${tournamentId}/registration-status`);
      setIsRegistered(regRes.data.isRegistered);
    } catch (error) {
      Alert.alert('Error', 'Failed to load tournament details');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchTournamentDetails();
    setRefreshing(false);
  };

  const handleRegister = async () => {
    try {
      setRegistering(true);
      await api.post(`/tournaments/${tournamentId}/register`);
      setIsRegistered(true);
      Alert.alert('Success', 'You have been registered for this tournament');
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to register');
    } finally {
      setRegistering(false);
    }
  };

  const handleWithdraw = async () => {
    Alert.alert('Withdraw', 'Are you sure you want to withdraw from this tournament?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Withdraw',
        style: 'destructive',
        onPress: async () => {
          try {
            setRegistering(true);
            await api.post(`/tournaments/${tournamentId}/withdraw`);
            setIsRegistered(false);
            Alert.alert('Success', 'You have withdrawn from this tournament');
          } catch (error: any) {
            Alert.alert('Error', error.response?.data?.message || 'Failed to withdraw');
          } finally {
            setRegistering(false);
          }
        },
      },
    ]);
  };

  if (loading) {
    return (
      <View style={[theme.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (!tournament) {
    return (
      <View style={[theme.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={theme.text}>Tournament not found</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={theme.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {/* Header */}
      <View style={[theme.card, { marginBottom: theme.spacing.lg }]}>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: theme.spacing.md,
          }}
        >
          <View style={{ flex: 1 }}>
            <Text style={theme.heading}>{tournament.name}</Text>
            <Text style={[theme.subtext, { marginTop: theme.spacing.xs }]}>
              by {tournament.organizer}
            </Text>
          </View>
          <View
            style={{
              paddingHorizontal: theme.spacing.md,
              paddingVertical: theme.spacing.sm,
              borderRadius: 8,
              backgroundColor:
                tournament.status === 'upcoming'
                  ? theme.colors.primary
                  : tournament.status === 'ongoing'
                  ? theme.colors.warning
                  : theme.colors.success,
            }}
          >
            <Text style={{ color: 'white', fontWeight: 'bold', textTransform: 'capitalize' }}>
              {tournament.status}
            </Text>
          </View>
        </View>

        <Text style={[theme.text, { marginBottom: theme.spacing.md }]}>
          {tournament.description}
        </Text>

        {/* Key Info */}
        <View style={{ gap: theme.spacing.md }}>
          <InfoRow icon="📍" label="Location" value={tournament.city} />
          <InfoRow icon="🏸" label="Format" value={tournament.format} />
          <InfoRow icon="📅" label="Dates" value={`${tournament.startDate} - ${tournament.endDate}`} />
          <InfoRow icon="💰" label="Entry Fee" value={`₹${tournament.entryFee}`} />
          <InfoRow
            icon="👥"
            label="Participants"
            value={`${tournament.currentParticipants}/${tournament.maxParticipants}`}
          />
        </View>
      </View>

      {/* Rules */}
      <View style={[theme.card, { marginBottom: theme.spacing.lg }]}>
        <Text style={[theme.heading, { marginBottom: theme.spacing.md }]}>Rules</Text>
        <Text style={theme.text}>{tournament.rules}</Text>
      </View>

      {/* Action Button */}
      <TouchableOpacity
        style={[
          theme.button,
          {
            backgroundColor: isRegistered ? theme.colors.error : theme.colors.primary,
            marginBottom: theme.spacing.lg,
          },
        ]}
        onPress={isRegistered ? handleWithdraw : handleRegister}
        disabled={registering}
      >
        <Text style={theme.buttonText}>
          {registering ? 'Processing...' : isRegistered ? 'Withdraw' : 'Register Now'}
        </Text>
      </TouchableOpacity>

      <View style={{ height: theme.spacing.lg }} />
    </ScrollView>
  );
};

interface InfoRowProps {
  icon: string;
  label: string;
  value: string;
}

const InfoRow: React.FC<InfoRowProps> = ({ icon, label, value }) => (
  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
    <Text style={{ fontSize: 20, marginRight: theme.spacing.md }}>{icon}</Text>
    <View style={{ flex: 1 }}>
      <Text style={theme.subtext}>{label}</Text>
      <Text style={[theme.text, { marginTop: theme.spacing.xs }]}>{value}</Text>
    </View>
  </View>
);
