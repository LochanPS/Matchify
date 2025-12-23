import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../services/api';
import { theme } from '../../styles/theme';

interface PlayerStats {
  matches: number;
  wins: number;
  losses: number;
  winRate: number;
  tournaments: number;
  city: string;
}

interface RecentMatch {
  id: string;
  opponent: string;
  result: 'win' | 'loss';
  score: string;
  date: string;
}

export const PlayerProfileScreen: React.FC = () => {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState<PlayerStats | null>(null);
  const [recentMatches, setRecentMatches] = useState<RecentMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      const [statsRes, matchesRes] = await Promise.all([
        api.get(`/users/${user?.id}/stats`),
        api.get(`/users/${user?.id}/recent-matches`),
      ]);

      setStats(statsRes.data);
      setRecentMatches(matchesRes.data);
    } catch (error) {
      Alert.alert('Error', 'Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchProfileData();
    setRefreshing(false);
  };

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
      {/* Profile Header */}
      <View style={[theme.card, { alignItems: 'center', marginBottom: theme.spacing.lg }]}>
        <View
          style={{
            width: 100,
            height: 100,
            borderRadius: 50,
            backgroundColor: theme.colors.lightGray,
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: theme.spacing.md,
          }}
        >
          <Text style={{ fontSize: 40 }}>👤</Text>
        </View>
        <Text style={[theme.heading, { marginBottom: theme.spacing.xs }]}>{user?.name}</Text>
        <Text style={[theme.subtext, { marginBottom: theme.spacing.md }]}>
          📍 {stats?.city || 'City not set'}
        </Text>
      </View>

      {/* Stats Grid */}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: theme.spacing.lg }}>
        <StatCard label="Matches" value={stats?.matches || 0} />
        <StatCard label="Wins" value={stats?.wins || 0} />
        <StatCard label="Win Rate" value={`${stats?.winRate || 0}%`} />
        <StatCard label="Tournaments" value={stats?.tournaments || 0} />
      </View>

      {/* Recent Matches */}
      <View style={{ marginBottom: theme.spacing.lg }}>
        <Text style={[theme.heading, { marginBottom: theme.spacing.md }]}>Recent Matches</Text>
        {recentMatches.length > 0 ? (
          recentMatches.map((match) => (
            <View key={match.id} style={[theme.card, { marginBottom: theme.spacing.md }]}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <View style={{ flex: 1 }}>
                  <Text style={theme.text}>vs {match.opponent}</Text>
                  <Text style={[theme.subtext, { marginTop: theme.spacing.xs }]}>
                    {match.score}
                  </Text>
                </View>
                <View
                  style={{
                    paddingHorizontal: theme.spacing.md,
                    paddingVertical: theme.spacing.sm,
                    borderRadius: 8,
                    backgroundColor:
                      match.result === 'win' ? theme.colors.success : theme.colors.error,
                  }}
                >
                  <Text style={{ color: 'white', fontWeight: 'bold' }}>
                    {match.result === 'win' ? 'Won' : 'Lost'}
                  </Text>
                </View>
              </View>
              <Text style={[theme.subtext, { marginTop: theme.spacing.sm }]}>{match.date}</Text>
            </View>
          ))
        ) : (
          <Text style={theme.subtext}>No recent matches</Text>
        )}
      </View>

      {/* Action Buttons */}
      <TouchableOpacity
        style={[theme.button, { marginBottom: theme.spacing.md }]}
        onPress={() => Alert.alert('Edit Profile', 'Edit profile feature coming soon')}
      >
        <Text style={theme.buttonText}>Edit Profile</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[theme.button, { backgroundColor: theme.colors.error }]}
        onPress={handleLogout}
      >
        <Text style={theme.buttonText}>Logout</Text>
      </TouchableOpacity>

      <View style={{ height: theme.spacing.lg }} />
    </ScrollView>
  );
};

interface StatCardProps {
  label: string;
  value: string | number;
}

const StatCard: React.FC<StatCardProps> = ({ label, value }) => (
  <View
    style={{
      width: '48%',
      marginRight: '4%',
      marginBottom: theme.spacing.md,
      padding: theme.spacing.md,
      backgroundColor: theme.colors.lightGray,
      borderRadius: 12,
      alignItems: 'center',
    }}
  >
    <Text style={[theme.heading, { fontSize: 24, marginBottom: theme.spacing.xs }]}>
      {value}
    </Text>
    <Text style={theme.subtext}>{label}</Text>
  </View>
);
