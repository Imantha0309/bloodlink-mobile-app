import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, typography, radius, spacing } from '../../theme';

const options = [
  { label: 'Critical', value: 'critical', hint: 'Life-threatening, respond now' },
  { label: 'High', value: 'high', hint: 'Needed within hours' },
  { label: 'Medium', value: 'medium', hint: 'Needed today' },
  { label: 'Low', value: 'low', hint: 'Can wait a day' },
];

const UrgencySelector = ({ value, onChange, error }) => (
  <View style={styles.wrapper}>
    <Text style={styles.label}>Urgency <Text style={styles.required}>*</Text></Text>
    <View style={styles.row}>
      {options.map((option) => {
        const active = option.value === value;
        return (
          <Pressable
            key={option.value}
            onPress={() => onChange(option.value)}
            accessibilityRole="radio"
            accessibilityState={{ selected: active }}
            style={[styles.chip, active && styles.chipActive]}
          >
            <Text style={[styles.chipText, active && styles.chipTextActive]}>{option.label}</Text>
          </Pressable>
        );
      })}
    </View>
    {!!error && <Text style={styles.error}>{error}</Text>}
  </View>
);

const styles = StyleSheet.create({
  wrapper: { marginBottom: spacing.lg },
  label: { ...typography.label, color: colors.textSecondary, marginBottom: spacing.sm },
  required: { color: colors.primary },
  row: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -spacing.xxs },
  chip: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    margin: spacing.xxs,
  },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { ...typography.bodySmall, color: colors.textSecondary, fontWeight: '600' },
  chipTextActive: { color: colors.textOnPrimary },
  error: { ...typography.bodySmall, color: colors.danger, marginTop: spacing.xs },
});

export default UrgencySelector;
