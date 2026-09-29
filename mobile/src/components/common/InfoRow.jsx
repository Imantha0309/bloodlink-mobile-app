import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, typography, spacing } from '../../theme';

const Row = ({ label, value, testID }) => (
  <View style={styles.row} testID={testID}>
    <Text style={styles.label}>{label}</Text>
    <Text style={styles.value}>{value === null || value === undefined || value === '' ? '—' : String(value)}</Text>
  </View>
);

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: spacing.xs,
  },
  label: { ...typography.bodySmall, color: colors.textSecondary, flex: 1 },
  value: { ...typography.bodySmall, color: colors.text, fontWeight: '600', flex: 1, textAlign: 'right' },
});

export default Row;
