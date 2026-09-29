import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { respondToRequest, selectDonorSubmitting } from '../../store/donorStore';
import { AppButton, AppCard, BloodGroupBadge, InfoRow, Loading, UrgencyBadge } from '../../components';
import { colors, typography, spacing } from '../../theme';
import { formatDateTime, formatDistance, timeUntil } from '../../utils/helpers';
import donorService from '../../services/donorService';
import { getErrorMessage } from '../../utils/helpers';

const RequestDetailsScreen = ({ route, navigation }) => {
  const { id } = route.params;
  const dispatch = useDispatch();
  const submitting = useSelector(selectDonorSubmitting);
  const [request, setRequest] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;
    donorService
      .getRequest(id)
      .then((data) => active && setRequest(data))
      .catch((err) => active && setError(getErrorMessage(err, 'Could not load this request')));
    return () => {
      active = false;
    };
  }, [id]);

  const respond = async (response) => {
    setError(null);
    const result = await dispatch(respondToRequest({ id, response }));
    if (respondToRequest.fulfilled.match(result)) {
      navigation.goBack();
    }
  };

  if (!request) return <Loading label={error || 'Loading request…'} fullScreen />;

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

      <AppCard title="Details">
        <InfoRow label="Raised" value={formatDateTime(request.createdAt)} />
        <InfoRow label="Expires" value={timeUntil(request.expiresAt)} />
        <InfoRow label="Patient" value={request.patientName} />
        <InfoRow label="Age" value={request.patientAge} />
        <InfoRow label="Notes" value={request.notes} />
      </AppCard>

      {!!error && <Text style={styles.error}>{error}</Text>}

      <Text style={styles.prompt}>Can you donate?</Text>
      <Text style={styles.hint}>
        Confirm only if you can reach the hospital in time and are eligible to donate today.
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
  error: { ...typography.bodySmall, color: colors.danger, marginBottom: spacing.md },
  spacer: { height: spacing.md },
});

export default RequestDetailsScreen;
