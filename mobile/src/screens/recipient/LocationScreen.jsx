import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { AppButton, AppInput, LocationPicker } from '../../components';
import { colors, typography, radius, spacing } from '../../theme';
import recipientService from '../../services/recipientService';
import { getErrorMessage } from '../../utils/helpers';

const LocationScreen = ({ navigation }) => {
  const [coords, setCoords] = useState(null);
  const [address, setAddress] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [saved, setSaved] = useState(false);

  const save = async () => {
    setSaving(true);
    setError(null);
    try {
      await recipientService.updateProfile({
        ...(coords || {}),
        address: address.trim(),
      });
      setSaved(true);
      navigation.goBack();
    } catch (err) {
      setError(getErrorMessage(err, 'Could not save your location'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Your location</Text>
      <Text style={styles.subtitle}>
        We use your location only to find donors within range. It is never shown to other users.
      </Text>

      <LocationPicker
        onSelect={(next) => {
          setCoords(next);
          setSaved(false);
          setError(null);
        }}
      />

      <AppInput
        label="Area or suburb"
        testID="location-address"
        value={address}
        onChangeText={(v) => {
          setAddress(v);
          setSaved(false);
        }}
        placeholder="e.g. Sandton"
      />

      {!!error && <Text style={styles.error}>{error}</Text>}
      {saved && <Text style={styles.saved}>Location saved</Text>}

      <AppButton title="Save location" onPress={save} loading={saving} testID="save-location" />
      <View style={styles.footer}>
        <AppButton title="Back" variant="ghost" onPress={() => navigation.goBack()} />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, paddingBottom: spacing.xxl },
  title: { ...typography.h2, color: colors.text },
  subtitle: { ...typography.body, color: colors.textSecondary, marginBottom: spacing.xl },
  error: { ...typography.bodySmall, color: colors.danger, marginBottom: spacing.md },
  saved: { ...typography.bodySmall, color: colors.success, marginBottom: spacing.md },
  footer: { marginTop: spacing.lg, alignItems: 'center' },
});

export default LocationScreen;
