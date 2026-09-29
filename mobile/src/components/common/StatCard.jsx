import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, typography, spacing, radius } from '../../theme';

const StatCard = ({ label, value, tone = 'default', onPress }) => (
  <View style={[styles.card, tone !== 'default' && { borderColor: tone }]}>
    <Text style={[styles.value, tone !== 'default' && { color: tone }]}>{value}</Text>
    <Text style={styles.label}>{label}</Text>
  </View>
);

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    margin: spacing.xs,
    alignItems: 'center',
  },
  value: { ...typography.h2, color: colors.text },
  label: { ...typography.caption, color: colors.textSecondary, marginTop: spacing.xxs, textAlign: 'center' },
});

export default StatCard;
