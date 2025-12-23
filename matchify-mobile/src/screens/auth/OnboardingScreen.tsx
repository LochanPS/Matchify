import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  ScrollView
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { colors, spacing, typography, borderRadius, shadows } from '../../styles/theme';

const OnboardingScreen = ({ route, navigation }: any) => {
  const { name, email, password } = route.params;
  const [role, setRole] = useState<'player' | 'organizer' | null>(null);
  const [city, setCity] = useState('');
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();

  const handleComplete = async () => {
    if (!role || !city) {
      Alert.alert('Error', 'Please select a role and enter your city');
      return;
    }

    try {
      setLoading(true);
      await signup(name, email, password, role, city);
    } catch (error: any) {
      Alert.alert('Signup Failed', error.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>Welcome to MATCHIFY!</Text>
        <Text style={styles.subtitle}>Let's set up your profile</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>What's your role?</Text>
        <View style={styles.roleContainer}>
          <TouchableOpacity
            style={[
              styles.roleButton,
              role === 'player' && styles.roleButtonActive
            ]}
            onPress={() => setRole('player')}
            disabled={loading}
          >
            <Text style={[
              styles.roleButtonText,
              role === 'player' && styles.roleButtonTextActive
            ]}>
              🏸 Player
            </Text>
            <Text style={[
              styles.roleButtonSubtext,
              role === 'player' && styles.roleButtonSubtextActive
            ]}>
              Join tournaments
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.roleButton,
              role === 'organizer' && styles.roleButtonActive
            ]}
            onPress={() => setRole('organizer')}
            disabled={loading}
          >
            <Text style={[
              styles.roleButtonText,
              role === 'organizer' && styles.roleButtonTextActive
            ]}>
              🎯 Organizer
            </Text>
            <Text style={[
              styles.roleButtonSubtext,
              role === 'organizer' && styles.roleButtonSubtextActive
            ]}>
              Create tournaments
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Where are you from?</Text>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>City</Text>
          <View style={styles.input}>
            <Text style={styles.cityText}>{city || 'Select your city'}</Text>
          </View>
          <Text style={styles.hint}>Popular cities: Bangalore, Mumbai, Delhi, Chennai</Text>
        </View>
      </View>

      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleComplete}
        disabled={loading || !role || !city}
      >
        {loading ? (
          <ActivityIndicator color={colors.white} />
        ) : (
          <Text style={styles.buttonText}>Get Started</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl
  },
  header: {
    marginBottom: spacing.xxxl,
    alignItems: 'center'
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.sm,
    textAlign: 'center'
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    fontWeight: '500',
    textAlign: 'center'
  },
  section: {
    marginBottom: spacing.xxxl
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.lg
  },
  roleContainer: {
    flexDirection: 'row',
    gap: spacing.lg
  },
  roleButton: {
    flex: 1,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.md,
    alignItems: 'center',
    backgroundColor: colors.white,
    ...shadows.sm
  },
  roleButtonActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primary
  },
  roleButtonText: {
    fontSize: 24,
    marginBottom: spacing.sm
  },
  roleButtonTextActive: {
    color: colors.white
  },
  roleButtonSubtext: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '500'
  },
  roleButtonSubtextActive: {
    color: colors.white
  },
  inputGroup: {
    gap: spacing.sm
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    backgroundColor: colors.white,
    justifyContent: 'center',
    ...shadows.sm
  },
  cityText: {
    fontSize: 16,
    color: colors.text
  },
  hint: {
    fontSize: 12,
    color: colors.textSecondary,
    fontStyle: 'italic'
  },
  button: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    marginTop: spacing.xl,
    ...shadows.md
  },
  buttonDisabled: {
    opacity: 0.6
  },
  buttonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600'
  }
});

export default OnboardingScreen;
