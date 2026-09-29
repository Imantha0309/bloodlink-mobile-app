import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { AppButton, AppCard, Badge, InfoRow } from '../../components';
import { colors, typography, radius, spacing } from '../../theme';
import { formatDateTime, titleCase } from '../../utils/helpers';

const VerificationResultScreen = ({ route, navigation }) => {
  const { result } = route.params || {};

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.badgeWrap}>
        <Text style={styles.icon}>{'\u{2705}'}</Text>
        <Text style={styles.title}>Donation verified</Text>
        <Badge label={titleCase(result?.status).toUpperCase()} background={colors.success} textColor={colors.textOnPrimary} />
      </View>

      <Text style={styles.subtitle}>
        The donor has been notified and their donation record has been updated.
      </Text>

      {!!result && (
        <AppCard title="Record">
          <InfoRow label="Donation code" value={result.donationId} />
          <InfoRow label="Status" value={titleCase(result.status)} />
          <InfoRow label="Verified at" value={formatDateTime(result.verifiedAt)} />
          {!!result.remarks && <InfoRow label="Remarks" value={result.remarks} />}
        </AppCard>
      )}

      <AppButton title="Scan another donor" onPress={() => navigation.replace('QRScanner')} />
      <View style={styles.spacer} />
      <AppButton title="Back to dashboard" variant="outline" onPress={() => navigation.navigate('Dashboard')} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, paddingBottom: spacing.xxl },
  badgeWrap: { alignItems: 'center', marginBottom: spacing.lg },
  icon: { fontSize: 56, marginBottom: spacing.md },
  title: { ...typography.h2, color: colors.text, marginBottom: spacing.sm },
  subtitle: { ...typography.body, color: colors.textSecondary, textAlign: 'center', marginBottom: spacing.xl },
  spacer: { height: spacing.md },
});

export default VerificationResultScreen;
