import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { respondToRequest, selectDonorSubmitting } from '../../store/donorStore';
import { AppButton, AppCard, BloodGroupBadge, InfoRow, Loading, UrgencyBadge } from '../../components';
import { colors, typography, spacing } from '../../theme';
import { formatDateTime, formatDistance, timeUntil } from '../../utils/helpers';
import { getErrorMessage } from '../../utils/helpers';

const ResponseScreen = ({ route, navigation }) => {
  const { id, request } = route.params;
  const dispatch = useDispatch();
  const submitting = useSelector(selectDonorSubmitting);
  const [error, setError] = useState(null);
  const [done, setDone] = useState(null);

  if (!request) return <Loading label="Request unavailable" fullScreen />;

  const respond = async (response) => {
    setError(null);
    const result = await dispatch(respondToRequest({ id, response }));
    if (respondToRequest.fulfilled.match(result)) {
      setDone(response);
    } else {
      setError(result.payload || getErrorMessage(result.error, 'Could not record your response'));
    }
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <BloodGroupBadge group={request.bloodGroup} size="lg" />
        <View style={styles.headerText}>
          <Text style={styles.title}>
            {request.unitsRequired} unit{request.unitsRequired === 1 ? '' : 's'} of {request.bloodGroup}
          </Text>
          <View style={styles.badgeRow}>
            <UrgencyBadge urgency={request.urgency} />
          </View>
        </View>
      </View>

      <AppCard title="Summary">
        <InfoRow label="Distance" value={formatDistance(request.distanceKm)} />
        <InfoRow label="Raised" value={formatDateTime(request.createdAt)} />
        <InfoRow label="Expires" value={timeUntil(request.expiresAt)} />
        {!!request.patientName && <InfoRow label="Patient" value={request.patientName} />}
      </AppCard>

      {!!done && (
        <View style={styles.confirmation}>
          <Text style={styles.confirmationText}>
            {done === 'accepted'
              ? 'Thank you. The recipient has been notified that you can donate.'
              : 'Response recorded. We will not show this request to you again.'}
          </Text>
        </View>
      )}

      {!!error && <Text style={styles.error}>{error}</Text>}

      {!done && (
        <View style={styles.actions}>
          <Text style={styles.prompt}>Can you donate?</Text>
          <Text style={styles.hint}>
            Only confirm if you can reach the hospital in time and are eligible to donate today.
          </Text>
          <AppButton
            title="Yes, I can donate"
            size="lg"
            onPress={() => respond('accepted')}
            loading={submitting}
            testID="accept-request"
          />
          <View style={styles.spacer} />
          <AppButton title="No, I cannot help" variant="outline" onPress={() => respond('declined')} disabled={submitting} />
        </View>
      )}

      <View style={styles.footer}>
        <AppButton title="Back to requests" variant="ghost" onPress={() => navigation.goBack()} />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, paddingBottom: spacing.xxl },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.lg },
  headerText: { flex: 1, marginLeft: spacing.lg },
  title: { ...typography.h3, color: colors.text },
  badgeRow: { flexDirection: 'row', marginTop: spacing.sm },
  prompt: { ...typography.h3, color: colors.text, marginBottom: spacing.xs },
  hint: { ...typography.bodySmall, color: colors.textSecondary, marginBottom: spacing.lg },
  error: { ...typography.bodySmall, color: colors.danger, marginTop: spacing.md },
  spacer: { height: spacing.md },
  confirmation: {
    backgroundColor: colors.success,
    borderRadius: 10,
    padding: spacing.lg,
    marginTop: spacing.lg,
  },
  confirmationText: { ...typography.body, color: colors.textOnPrimary },
  actions: { marginTop: spacing.lg },
  footer: { marginTop: spacing.xl, alignItems: 'center' },
});

export default ResponseScreen;
