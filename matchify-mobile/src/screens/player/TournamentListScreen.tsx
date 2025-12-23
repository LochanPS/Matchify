import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { api } from '../../services/api';
import { theme } from '../../styles/theme';
import { TournamentCard } from '../../components/TournamentCard';
import { EmptyState } from '../../components/EmptyState';

interface Tournament {
  id: string;
  name: string;
  city: string;
  startDate: string;
  format: string;
  currentParticipants: number;
  maxParticipants: number;
  entryFee: number;
}

export const TournamentListScreen: React.FC = () => {
  const navigation = useNavigation();
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchTournaments();
  }, []);

  const fetchTournaments = async () => {
    try {
      setLoading(true);
      const res = await api.get('/tournaments');
      setTournaments(res.data);
    } catch (error) {
      Alert.alert('Error', 'Failed to load tournaments');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchTournaments();
    setRefreshing(false);
  };

  const filteredTournaments = tournaments.filter(
    (t) =>
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.city.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
      {/* Search Bar */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: theme.colors.white,
          marginHorizontal: theme.spacing.md,
          marginVertical: theme.spacing.md,
          paddingHorizontal: theme.spacing.md,
          borderRadius: 12,
          borderWidth: 1,
          borderColor: theme.colors.lightGray,
        }}
      >
        <Text style={{ fontSize: 18, marginRight: theme.spacing.md }}>🔍</Text>
        <TextInput
          style={{
            flex: 1,
            paddingVertical: theme.spacing.md,
            fontSize: 16,
            color: theme.colors.text,
          }}
          placeholder="Search tournaments..."
          placeholderTextColor={theme.colors.gray}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Tournaments List */}
      <View style={{ paddingHorizontal: theme.spacing.md, paddingBottom: theme.spacing.lg }}>
        {filteredTournaments.length > 0 ? (
          filteredTournaments.map((tournament) => (
            <TournamentCard
              key={tournament.id}
              {...tournament}
              onPress={() =>
                navigation.navigate('TournamentDetail' as never, {
                  tournamentId: tournament.id,
                } as never)
              }
            />
          ))
        ) : (
          <EmptyState
            icon="🏸"
            title="No Tournaments Found"
            message={
              searchQuery
                ? 'Try adjusting your search criteria'
                : 'No tournaments available at the moment'
            }
          />
        )}
      </View>
    </ScrollView>
  );
};
