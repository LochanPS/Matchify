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
  rules: string;
}

interface Participant {
  id: string;
  name: string;
  email: string;
  registeredAt: string;
  status: 'registered' | 'withdrawn';
}

interface Match {
  id: string;
  player1: string;
  player2: string;
  score: string;
  status: 'pending' | 'completed';
  scheduledDate: string;
}

export const ManageTournamentScreen: React.FC = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { tournamentId } = route.params as { tournamentId: string };

  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'participants' | 'matches'>('overview');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchTournamentData();
  }, [tournamentId]);

  const fetchTournamentData = async () => {
    try {
      setLoading(true);
      const [tournamentRes, participantsRes, matchesRes] = await Promise.all([
        api.get(`/tournaments/${tournamentId}`),
        api.get(`/tournaments/${tournamentId}/participants`),
        api.get(`/tournaments/${tournamentId}/matches`),
      ]);

      setTournament(tournamentRes.data);
      setParticipants(participantsRes.data);
      setMatches(matchesRes.data);
    } catch (error) {
      Alert.alert('Error', 'Failed to load tournament data');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchTournamentData();
    setRefreshing(false);
  };

  const handleStartTournament = async () => {
    Alert.alert('Start Tournament', 'Are you sure you want to start this tournament?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Start',
        onPress: async () => {
          try {
            await api.post(`/tournaments/${tournamentId}/start`);
            Alert.alert('Success', 'Tournament started');
            await fetchTournamentData();
          } catch (error: any) {
            Alert.alert('Error', error.response?.data?.message || 'Failed to start tournament');
          }
        },
      },
    ]);
  };

  const handleEndTournament = async () => {
    Alert.alert('End Tournament', 'Are you sure you want to end this tournament?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'End',
        style: 'destructive',
        onPress: async () => {
          try {
            await api.post(`/tournaments/${tournamentId}/end`);
            Alert.alert('Success', 'Tournament ended');
            await fetchTournamentData();
          } catch (error: any) {
            Alert.alert('Error', error.response?.data?.message || 'Failed to end tournament');
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
              {tournament.city} • {tournament.format}
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

        <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: theme.spacing.md }}>
          <StatBox label="Participants" value={`${tournament.currentParticipants}/${tournament.maxParticipants}`} />
          <StatBox label="Entry Fee" value={`₹${tournament.entryFee}`} />
          <StatBox label="Matches" value={matches.length} />
        </View>
      </View>

      {/* Tabs */}
      <View style={{ flexDirection: 'row', marginBottom: theme.spacing.lg, gap: theme.spacing.md }}>
        {(['overview', 'participants', 'matches'] as const).map((tab) => (
          <TouchableOpacity
            key={tab}
            style={{
              flex: 1,
              paddingVertical: theme.spacing.md,
              borderBottomWidth: 2,
              borderBottomColor: activeTab === tab ? theme.colors.primary : theme.colors.lightGray,
            }}
            onPress={() => setActiveTab(tab)}
          >
            <Text
              style={{
                textAlign: 'center',
                fontWeight: activeTab === tab ? 'bold' : 'normal',
                color: activeTab === tab ? theme.colors.primary : theme.colors.gray,
                textTransform: 'capitalize',
              }}
            >
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <View>
          <View style={[theme.card, { marginBottom: theme.spacing.lg }]}>
            <Text style={[theme.heading, { marginBottom: theme.spacing.md }]}>Details</Text>
            <InfoRow label="Start Date" value={tournament.startDate} />
            <InfoRow label="End Date" value={tournament.endDate} />
            <InfoRow label="Format" value={tournament.format} />
            <InfoRow label="Max Participants" value={tournament.maxParticipants.toString()} />
          </View>

          <View style={[theme.card, { marginBottom: theme.spacing.lg }]}>
            <Text style={[theme.heading, { marginBottom: theme.spacing.md }]}>Rules</Text>
            <Text style={theme.text}>{tournament.rules || 'No rules specified'}</Text>
          </View>

          {/* Action Buttons */}
          {tournament.status === 'upcoming' && (
            <TouchableOpacity
              style={[theme.button, { marginBottom: theme.spacing.lg }]}
              onPress={handleStartTournament}
            >
              <Text style={theme.buttonText}>Start Tournament</Text>
            </TouchableOpacity>
          )}

          {tournament.status === 'ongoing' && (
            <TouchableOpacity
              style={[theme.button, { backgroundColor: theme.colors.error, marginBottom: theme.spacing.lg }]}
              onPress={handleEndTournament}
            >
              <Text style={theme.buttonText}>End Tournament</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {activeTab === 'participants' && (
        <View>
          {participants.length > 0 ? (
            participants.map((participant) => (
              <View key={participant.id} style={[theme.card, { marginBottom: theme.spacing.md }]}>
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={theme.text}>{participant.name}</Text>
                    <Text style={[theme.subtext, { marginTop: theme.spacing.xs }]}>
                      {participant.email}
                    </Text>
                  </View>
                  <View
                    style={{
                      paddingHorizontal: theme.spacing.md,
                      paddingVertical: theme.spacing.sm,
                      borderRadius: 8,
                      backgroundColor:
                        participant.status === 'registered'
                          ? theme.colors.success
                          : theme.colors.error,
                    }}
                  >
                    <Text style={{ color: 'white', fontWeight: 'bold', textTransform: 'capitalize' }}>
                      {participant.status}
                    </Text>
                  </View>
                </View>
                <Text style={[theme.subtext, { marginTop: theme.spacing.md }]}>
                  Registered: {participant.registeredAt}
                </Text>
              </View>
            ))
          ) : (
            <View style={[theme.card, { alignItems: 'center', paddingVertical: theme.spacing.lg }]}>
              <Text style={theme.subtext}>No participants yet</Text>
            </View>
          )}
        </View>
      )}

      {activeTab === 'matches' && (
        <View>
          {matches.length > 0 ? (
            matches.map((match) => (
              <View key={match.id} style={[theme.card, { marginBottom: theme.spacing.md }]}>
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: theme.spacing.md,
                  }}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={theme.text}>{match.player1}</Text>
                    <Text style={[theme.subtext, { marginTop: theme.spacing.xs }]}>vs</Text>
                    <Text style={[theme.text, { marginTop: theme.spacing.xs }]}>{match.player2}</Text>
                  </View>
                  <View style={{ alignItems: 'center' }}>
                    <Text style={[theme.heading, { fontSize: 20 }]}>{match.score}</Text>
                    <View
                      style={{
                        marginTop: theme.spacing.sm,
                        paddingHorizontal: theme.spacing.md,
                        paddingVertical: theme.spacing.xs,
                        borderRadius: 6,
                        backgroundColor:
                          match.status === 'completed'
                            ? theme.colors.success
                            : theme.colors.warning,
                      }}
                    >
                      <Text style={{ color: 'white', fontWeight: 'bold', textTransform: 'capitalize' }}>
                        {match.status}
                      </Text>
                    </View>
                  </View>
                </View>
                <Text style={[theme.subtext, { marginTop: theme.spacing.md }]}>
                  Scheduled: {match.scheduledDate}
                </Text>
              </View>
            ))
          ) : (
            <View style={[theme.card, { alignItems: 'center', paddingVertical: theme.spacing.lg }]}>
              <Text style={theme.subtext}>No matches yet</Text>
            </View>
          )}
        </View>
      )}

      <View style={{ height: theme.spacing.lg }} />
    </ScrollView>
  );
};

interface StatBoxProps {
  label: string;
  value: string | number;
}

const StatBox: React.FC<StatBoxProps> = ({ label, value }) => (
  <View
    style={{
      flex: 1,
      paddingVertical: theme.spacing.md,
      paddingHorizontal: theme.spacing.sm,
      backgroundColor: theme.colors.lightGray,
      borderRadius: 8,
      alignItems: 'center',
    }}
  >
    <Text style={[theme.heading, { fontSize: 18 }]}>{value}</Text>
    <Text style={[theme.subtext, { marginTop: theme.spacing.xs }]}>{label}</Text>
  </View>
);

interface InfoRowProps {
  label: string;
  value: string;
}

const InfoRow: React.FC<InfoRowProps> = ({ label, value }) => (
  <View
    style={{
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingVertical: theme.spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.lightGray,
    }}
  >
    <Text style={theme.subtext}>{label}</Text>
    <Text style={theme.text}>{value}</Text>
  </View>
);
