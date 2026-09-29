import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { clearCurrent, fetchRequestDetail, selectCurrentRequest } from '../../store/recipientStore';
import { AppButton, AppCard, AppModal, BloodGroupBadge, InfoRow, Loading, UrgencyBadge } from '../../components';
import { colors, typography, spacing } from '../../theme';
import { formatDateTime, timeUntil } from '../../utils/helpers';
import recipientService from '../../services/recipientService';
import { getErrorMessage } from '../../utils/helpers';

const ReviewRequestScreen = ({ route, navigation }) => {
  const { id } = route.params;
  const dispatch = useDispatch();
  const request = useSelector(selectCurrentRequest);
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    dispatch(fetchRequestDetail(id));
    return () => dispatch(clearCurrent());
  }, [dispatch, id]);

  if (!request) return <Loading label="Loading request…" fullScreen />;

  const cancel = async () => {
    setCancelling(true);
    setError(null);
    try {
      await recipientService.cancelRequest(id);
      setConfirmVisible(false);
      navigation.navigate('RequestHistory');
    } catch (err) {
      setError(getErrorMessage(err, 'Could not cancel the request'));
      setConfirmVisible(false);
    } finally {
      setCancelling(false);
    }
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Review request</Text>
      <Text style={styles.subtitle}>Check the details before confirming.</Text>

      <AppCard>
        <View style={styles.row}>
          <BloodGroupBadge group={request.bloodGroup} size="lg" />
          <View style={styles.rowText}>
            <Text style={styles.cardTitle}>
              {request.unitsRequired} unit{request.unitsRequired === 1 ? '' : 's'} of {request.bloodGroup}
            </Text>
            <View style={styles.badgeRow}>
              <UrgencyBadge urgency={request.urgency} />
            </View>
          </View>
        </View>
        <InfoRow label="Patient" value={request.patientName} />
        <InfoRow label="Age" value={request.patientAge} />
        <InfoRow label="Notes" value={request.notes} />
        <InfoRow label="Raised" value={formatDateTime(request.createdAt)} />
        <InfoRow label="Expires" value={timeUntil(request.expiresAt)} />
      </AppCard>

      {!!error && <Text style={styles.error}>{error}</Text>}

      <AppButton
        title="Confirm and alert donors"
        onPress={() => navigation.navigate('MatchingDonors', { id })}
      />
      <View style={styles.spacer} />
      <AppButton
        title="Cancel this request"
        variant="outline"
        onPress={() => setConfirmVisible(true)}
        testID="cancel-request"
      />

      <AppModal
        visible={confirmVisible}
        title="Cancel this request?"
        message="Matched donors will no longer see this request. This cannot be undone."
        confirmTitle="Yes, cancel it"
        onConfirm={cancel}
        onClose={() => setConfirmVisible(false)}
        loading={cancelling}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, paddingBottom: spacing.xxl },
  title: { ...typography.h2, color: colors.text },
  subtitle: { ...typography.body, color: colors.textSecondary, marginBottom: spacing.xl },
  row: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.md },
  rowText: { flex: 1, marginLeft: spacing.lg },
  cardTitle: { ...typography.h4, color: colors.text },
  badgeRow: { flexDirection: 'row', marginTop: spacing.xs },
  error: { ...typography.bodySmall, color: colors.danger, marginBottom: spacing.md },
  spacer: { height: spacing.md },
});

export default ReviewRequestScreen;
