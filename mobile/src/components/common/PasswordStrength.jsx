import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, typography, radius, spacing } from '../../theme';
import { passwordScore } from '../../utils/validation';

const LEVELS = [
  { label: 'Too weak', color: colors.danger },
  { label: 'Weak', color: colors.warning },
  { label: 'Fair', color: colors.warning },
  { label: 'Good', color: colors.success },
  { label: 'Strong', color: colors.success },
];

/**
 * Four-segment strength meter. Renders nothing until the user has typed
 * something, so an untouched form stays clean.
 */
const PasswordStrength = ({ value }) => {
  if (!value) return null;

  const score = passwordScore(value);
  const level = LEVELS[score];

  return (
    <View style={styles.wrapper}>
      <View style={styles.track}>
        {[0, 1, 2, 3].map((index) => (
          <View
            key={index}
            style={[
              styles.segment,
              { backgroundColor: index < score ? level.color : colors.border },
            ]}
          />
        ))}
      </View>
      <Text style={styles.label}>
        Password strength: <Text style={{ color: level.color }}>{level.label}</Text>
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: { marginTop: -spacing.sm, marginBottom: spacing.lg },
  track: { flexDirection: 'row', gap: spacing.xs },
  segment: { flex: 1, height: 4, borderRadius: radius.pill },
  label: { ...typography.caption, color: colors.textSecondary, marginTop: spacing.sm },
});

export default PasswordStrength;
