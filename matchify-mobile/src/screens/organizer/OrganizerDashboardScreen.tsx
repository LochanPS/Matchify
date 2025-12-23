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
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { api } from '../../services/api';
import { theme } from '../../styles/theme';

interface DashboardStats {
  activeTournaments: number;
  totalParticipants: number;
  totalRevenue: number;
  upcomingMatches: number;
}

interface Tournament {
  id: string;
  name: string;
  status: 'upcoming' | 'ongoing' | 'completed';
  participants: number;
  revenue: number;
  startDate: string;
}

export const OrganizerDashboardScreen: React.FC = () => {
  const navigation = useNavigation();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      fetchDashboardData();
    }, [])
  );

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsRes, tournamentsRes] = await Promise.all([
        api.get('/organizer/dashboard/stats'),
        api.get('/organizer/tournaments'),
      ]);

      setStats(statsRes.data);
      setTournaments(tournamentsRes.data);
    } catch (error) {
      Alert.alert('Error', 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchDashboardData();
    setRefreshing(false);
  };

  if (loading) {
    return (
      <View style={[theme.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView
      style={theme.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {/* Header */}
      <View style={{ marginBottom: theme.spacing.lg }}>
        <Text style={[theme.heading, { fontSize: 28 }]}>Organizer Dashboard</Text>
        <Text style={[theme.subtext, { marginTop: theme.spacing.xs }]}>
          Manage your tournaments
        </Text>
      </View>

      {/* Stats Grid */}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: theme.spacing.lg }}>
        <StatCard
          icon="🏆"
          label="Active Tournaments"
          value={stats?.activeTournaments || 0}
        />
        <StatCard
          icon="👥"
          label="Total Participants"
          value={stats?.totalParticipants || 0}
        />
        <StatCard
          icon="💰"
          label="Total Revenue"
          value={`₹${stats?.totalRevenue || 0}`}
        />
        <StatCard
          icon="🎯"
          label="Upcoming Matches"
          value={stats?.upcomingMatches || 0}
        />
      </View>

      {/* Create Tournament Button */}
      <TouchableOpacity
        style={[theme.button, { marginBottom: theme.spacing.lg }]}
        onPress={() => navigation.navigate('CreateTournament' as never)}
      >
        <Text style={theme.buttonText}>+ Create New Tournament</Text>
      </TouchableOpacity>

      {/* My Tournaments */}
      <View>
        <Text style={[theme.heading, { marginBottom: theme.spacing.md }]}>My Tournaments</Text>
        {tournaments.length > 0 ? (
          tournaments.map((tournament) => (
            <TouchableOpacity
              key={tournament.id}
              style={[theme.card, { marginBottom: theme.spacing.md }]}
              onPress={() =>
                navigation.navigate('ManageTournament' as never, {
                  tournamentId: tournament.id,
                } as never)
              }
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
                  <Text style={theme.heading}>{tournament.name}</Text>
                  <Text style={[theme.subtext, { marginTop: theme.spacing.xs }]}>
                    {tournament.startDate}
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

              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  paddingTop: theme.spacing.md,
                  borderTopWidth: 1,
                  borderTopColor: theme.colors.lightGray,
                }}
              >
                <View>
                  <Text style={theme.subtext}>Participants</Text>
                  <Text style={[theme.text, { marginTop: theme.spacing.xs }]}>
                    {tournament.participants}
                  </Text>
                </View>
                <View>
                  <Text style={theme.subtext}>Revenue</Text>
                  <Text style={[theme.text, { marginTop: theme.spacing.xs }]}>
                    ₹{tournament.revenue}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          ))
        ) : (
          <View style={[theme.card, { alignItems: 'center', paddingVertical: theme.spacing.lg }]}>
            <Text style={theme.subtext}>No tournaments yet</Text>
            <Text style={[theme.subtext, { marginTop: theme.spacing.md }]}>
              Create your first tournament to get started
            </Text>
          </View>
        )}
      </View>

      <View style={{ height: theme.spacing.lg }} />
    </ScrollView>
  );
};

interface StatCardProps {
  icon: string;
  label: string;
  value: string | number;
}

const StatCard: React.FC<StatCardProps> = ({ icon, label, value }) => (
  <View
    style={{
      width: '48%',
      marginRight: '4%',
      marginBottom: theme.spacing.md,
      padding: theme.spacing.md,
      backgroundColor: theme.colors.lightGray,
      borderRadius: 12,
    }}
  >
    <Text style={{ fontSize: 28, marginBottom: theme.spacing.sm }}>{icon}</Text>
    <Text style={[theme.heading, { fontSize: 20, marginBottom: theme.spacing.xs }]}>
      {value}
    </Text>
    <Text style={theme.subtext}>{label}</Text>
  </View>
);
