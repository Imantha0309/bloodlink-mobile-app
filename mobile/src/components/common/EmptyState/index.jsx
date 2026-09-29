import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, typography, spacing } from '../../../theme';
import AppButton from '../AppButton';

const EmptyState = ({ icon = '🩸', title, message, actionTitle, onAction }) => (
  <View style={styles.container}>
    <Text style={styles.icon}>{icon}</Text>
    {!!title && <Text style={styles.title}>{title}</Text>}
    {!!message && <Text style={styles.message}>{message}</Text>}
    {!!actionTitle && (
      <View style={styles.action}>
        <AppButton title={actionTitle} onPress={onAction} fullWidth={false} size="sm" />
      </View>
    )}
  </View>
);

const styles = StyleSheet.create({
  container: { padding: spacing.xl, alignItems: 'center', justifyContent: 'center' },
  icon: { fontSize: 40, marginBottom: spacing.md },
  title: { ...typography.h4, color: colors.text, textAlign: 'center' },
  message: { ...typography.body, color: colors.textSecondary, textAlign: 'center', marginTop: spacing.sm },
  action: { marginTop: spacing.lg },
});

export default EmptyState;
