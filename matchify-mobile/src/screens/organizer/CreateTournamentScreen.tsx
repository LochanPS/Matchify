import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { api } from '../../services/api';
import { theme } from '../../styles/theme';

interface FormData {
  name: string;
  description: string;
  city: string;
  format: string;
  startDate: string;
  endDate: string;
  entryFee: string;
  maxParticipants: string;
  rules: string;
}

export const CreateTournamentScreen: React.FC = () => {
  const navigation = useNavigation();
  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
    city: '',
    format: 'knockout',
    startDate: '',
    endDate: '',
    entryFee: '',
    maxParticipants: '',
    rules: '',
  });
  const [loading, setLoading] = useState(false);

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const validateForm = (): boolean => {
    if (!formData.name.trim()) {
      Alert.alert('Error', 'Tournament name is required');
      return false;
    }
    if (!formData.city.trim()) {
      Alert.alert('Error', 'City is required');
      return false;
    }
    if (!formData.startDate.trim()) {
      Alert.alert('Error', 'Start date is required');
      return false;
    }
    if (!formData.endDate.trim()) {
      Alert.alert('Error', 'End date is required');
      return false;
    }
    if (!formData.entryFee.trim() || isNaN(Number(formData.entryFee))) {
      Alert.alert('Error', 'Valid entry fee is required');
      return false;
    }
    if (!formData.maxParticipants.trim() || isNaN(Number(formData.maxParticipants))) {
      Alert.alert('Error', 'Valid max participants is required');
      return false;
    }
    return true;
  };

  const handleCreateTournament = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);
      const payload = {
        ...formData,
        entryFee: Number(formData.entryFee),
        maxParticipants: Number(formData.maxParticipants),
      };

      const res = await api.post('/tournaments', payload);
      Alert.alert('Success', 'Tournament created successfully', [
        {
          text: 'OK',
          onPress: () => {
            navigation.goBack();
          },
        },
      ]);
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to create tournament');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={theme.container}>
      {/* Header */}
      <View style={{ marginBottom: theme.spacing.lg }}>
        <Text style={[theme.heading, { fontSize: 28 }]}>Create Tournament</Text>
        <Text style={[theme.subtext, { marginTop: theme.spacing.xs }]}>
          Fill in the details to create a new tournament
        </Text>
      </View>

      {/* Form */}
      <View style={{ marginBottom: theme.spacing.lg }}>
        {/* Tournament Name */}
        <FormField
          label="Tournament Name"
          placeholder="e.g., City Championship"
          value={formData.name}
          onChangeText={(value) => handleInputChange('name', value)}
        />

        {/* Description */}
        <FormField
          label="Description"
          placeholder="Describe your tournament"
          value={formData.description}
          onChangeText={(value) => handleInputChange('description', value)}
          multiline
          numberOfLines={3}
        />

        {/* City */}
        <FormField
          label="City"
          placeholder="e.g., Bangalore"
          value={formData.city}
          onChangeText={(value) => handleInputChange('city', value)}
        />

        {/* Format */}
        <View style={{ marginBottom: theme.spacing.md }}>
          <Text style={[theme.text, { fontWeight: 'bold', marginBottom: theme.spacing.sm }]}>
            Format
          </Text>
          <View style={{ flexDirection: 'row', gap: theme.spacing.md }}>
            {['knockout', 'round-robin', 'league'].map((format) => (
              <TouchableOpacity
                key={format}
                style={{
                  flex: 1,
                  paddingVertical: theme.spacing.md,
                  paddingHorizontal: theme.spacing.md,
                  borderRadius: 8,
                  borderWidth: 2,
                  borderColor:
                    formData.format === format ? theme.colors.primary : theme.colors.lightGray,
                  backgroundColor:
                    formData.format === format ? theme.colors.primary : 'transparent',
                }}
                onPress={() => handleInputChange('format', format)}
              >
                <Text
                  style={{
                    textAlign: 'center',
                    color: formData.format === format ? 'white' : theme.colors.text,
                    fontWeight: 'bold',
                    textTransform: 'capitalize',
                  }}
                >
                  {format}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Start Date */}
        <FormField
          label="Start Date"
          placeholder="YYYY-MM-DD"
          value={formData.startDate}
          onChangeText={(value) => handleInputChange('startDate', value)}
        />

        {/* End Date */}
        <FormField
          label="End Date"
          placeholder="YYYY-MM-DD"
          value={formData.endDate}
          onChangeText={(value) => handleInputChange('endDate', value)}
        />

        {/* Entry Fee */}
        <FormField
          label="Entry Fee (₹)"
          placeholder="e.g., 500"
          value={formData.entryFee}
          onChangeText={(value) => handleInputChange('entryFee', value)}
          keyboardType="numeric"
        />

        {/* Max Participants */}
        <FormField
          label="Max Participants"
          placeholder="e.g., 16"
          value={formData.maxParticipants}
          onChangeText={(value) => handleInputChange('maxParticipants', value)}
          keyboardType="numeric"
        />

        {/* Rules */}
        <FormField
          label="Rules"
          placeholder="Enter tournament rules"
          value={formData.rules}
          onChangeText={(value) => handleInputChange('rules', value)}
          multiline
          numberOfLines={4}
        />
      </View>

      {/* Create Button */}
      <TouchableOpacity
        style={[theme.button, { marginBottom: theme.spacing.lg }]}
        onPress={handleCreateTournament}
        disabled={loading}
      >
        <Text style={theme.buttonText}>
          {loading ? 'Creating...' : 'Create Tournament'}
        </Text>
      </TouchableOpacity>

      {/* Cancel Button */}
      <TouchableOpacity
        style={[theme.button, { backgroundColor: theme.colors.lightGray, marginBottom: theme.spacing.lg }]}
        onPress={() => navigation.goBack()}
        disabled={loading}
      >
        <Text style={[theme.buttonText, { color: theme.colors.text }]}>Cancel</Text>
      </TouchableOpacity>

      <View style={{ height: theme.spacing.lg }} />
    </ScrollView>
  );
};

interface FormFieldProps {
  label: string;
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  keyboardType?: 'default' | 'numeric' | 'email-address';
  multiline?: boolean;
  numberOfLines?: number;
}

const FormField: React.FC<FormFieldProps> = ({
  label,
  placeholder,
  value,
  onChangeText,
  keyboardType = 'default',
  multiline = false,
  numberOfLines = 1,
}) => (
  <View style={{ marginBottom: theme.spacing.md }}>
    <Text style={[theme.text, { fontWeight: 'bold', marginBottom: theme.spacing.sm }]}>
      {label}
    </Text>
    <TextInput
      style={[
        theme.input,
        {
          minHeight: multiline ? 100 : 48,
          textAlignVertical: multiline ? 'top' : 'center',
        },
      ]}
      placeholder={placeholder}
      placeholderTextColor={theme.colors.gray}
      value={value}
      onChangeText={onChangeText}
      keyboardType={keyboardType}
      multiline={multiline}
      numberOfLines={numberOfLines}
    />
  </View>
);
