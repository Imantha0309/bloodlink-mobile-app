import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { colors, typography, spacing } from '../../../theme';

const Loading = ({ label = 'Loading…', fullScreen = false }) => (
  <View style={[styles.container, fullScreen && styles.fullScreen]}>
    <ActivityIndicator size="large" color={colors.primary} accessibilityLabel={label} />
    {!!label && <Text style={styles.label}>{label}</Text>}
  </View>
);

const styles = StyleSheet.create({
  container: { padding: spacing.xl, alignItems: 'center', justifyContent: 'center' },
  fullScreen: { flex: 1, backgroundColor: colors.background },
  label: { ...typography.bodySmall, color: colors.textSecondary, marginTop: spacing.md },
});

export default Loading;
