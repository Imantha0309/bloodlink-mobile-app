import React, { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import * as Location from 'expo-location';
import { colors, typography, radius, spacing } from '../../theme';

const LocationPicker = ({ onSelect, error }) => {
  const [coords, setCoords] = useState(null);
  const [loading, setLoading] = useState(false);

  // Permission is only requested when the user opts in, so the form never
  // triggers an OS prompt on open.
  const request = async () => {
    setLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Allow location access so we can find donors near you.');
        return;
      }
      const position = await Location.getCurrentPositionAsync({});
      const next = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      };
      setCoords(next);
      onSelect(next);
    } catch (err) {
      Alert.alert('Location unavailable', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>Location</Text>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={coords ? 'Update current location' : 'Use my current location'}
        onPress={request}
        disabled={loading}
        style={({ pressed }) => [styles.field, !!error && styles.fieldError, pressed && styles.pressed]}
      >
        <MaterialCommunityIcons
          name={coords ? 'map-marker' : 'map-marker-outline'}
          size={20}
          color={coords ? colors.primary : colors.textMuted}
        />
        <View style={styles.text}>
          <Text style={coords ? styles.value : styles.valueMuted}>
            {coords
              ? `${coords.latitude.toFixed(4)}, ${coords.longitude.toFixed(4)}`
              : loading
                ? 'Locating…'
                : 'Use my current location'}
          </Text>
          <Text style={styles.hint}>
            {coords ? 'Tap to update' : 'Helps us find donors closest to you'}
          </Text>
        </View>
      </Pressable>

      {!!error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: { marginBottom: spacing.lg },
  label: { ...typography.label, color: colors.textSecondary, marginBottom: spacing.xs },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 48,
    paddingHorizontal: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
  },
  fieldError: { borderColor: colors.danger },
  pressed: { opacity: 0.9 },
  text: { flex: 1, marginLeft: spacing.md },
  value: { ...typography.body, color: colors.text },
  valueMuted: { ...typography.body, color: colors.textSecondary },
  hint: { ...typography.caption, color: colors.textMuted, marginTop: spacing.xxs },
  error: { ...typography.bodySmall, color: colors.danger, marginTop: spacing.xs },
});

export default LocationPicker;
