import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import {
  clearCurrent,
  fetchRequestDetail,
  selectAcceptedDonors,
  selectCurrentRequest,
} from '../../store/recipientStore';
import {
  AppButton,
  AppCard,
  BloodGroupBadge,
  EmptyState,
  InfoRow,
  Loading,
  StatusBadge,
  UrgencyBadge,
} from '../../components';
import { colors, typography, spacing } from '../../theme';
import { formatDateTime, timeUntil } from '../../utils/helpers';

const MatchingDonorsScreen = ({ route, navigation }) => {
  const { id } = route.params;
  const dispatch = useDispatch();
  const request = useSelector(selectCurrentRequest);
  const acceptedDonors = useSelector(selectAcceptedDonors);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const load = async () => {
      setLoading(true);
      await dispatch(fetchRequestDetail(id));
      if (active) setLoading(false);
    };
    load();
    return () => {
      active = false;
      dispatch(clearCurrent());
    };
  }, [dispatch, id]);

  if (loading || !request) return <Loading label="Finding matching donors…" fullScreen />;

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <AppCard>
        <View style={styles.row}>
          <BloodGroupBadge group={request.bloodGroup} />
          <View style={styles.rowText}>
            <Text style={styles.title}>{request.unitsRequired} unit{request.unitsRequired === 1 ? '' : 's'} of {request.bloodGroup}</Text>
            <View style={styles.badges}>
              <StatusBadge status={request.status} />
              <View style={styles.gap} />
              <UrgencyBadge urgency={request.urgency} />
            </View>
          </View>
        </View>
        <InfoRow label="Expires" value={timeUntil(request.expiresAt)} />
        <InfoRow label="Raised" value={formatDateTime(request.createdAt)} />
      </AppCard>

      <Text style={styles.sectionTitle}>Responded donors</Text>

      {acceptedDonors.length === 0 ? (
        <EmptyState
          icon={'\u{1F50D}'}
          title="No responses yet"
          message="Compatible donors within 50 km were alerted when this request was raised. Their responses will appear here."
        />
      ) : (
        acceptedDonors.map((entry) => (
          <AppCard key={entry.id} title={entry.donor?.user?.name || 'Donor'}>
            <InfoRow label="Blood group" value={entry.donor?.bloodGroup} />
            {entry.donor?.phone && <InfoRow label="Phone" value={entry.donor.user.phone} />}
            <InfoRow label="Previous donations" value={String(entry.donor?.totalDonations ?? 0)} />
            <InfoRow label="Responded" value={formatDateTime(entry.respondedAt)} />
          </AppCard>
        ))
      )}

      <AppButton
        title="Track this request"
        onPress={() => navigation.navigate('RequestStatus', { id })}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, paddingBottom: spacing.xxl },
  row: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.md },
  rowText: { flex: 1, marginLeft: spacing.md },
  title: { ...typography.h4, color: colors.text },
  badges: { flexDirection: 'row', alignItems: 'center', marginTop: spacing.xs },
  gap: { width: spacing.sm },
  sectionTitle: { ...typography.h3, color: colors.text, marginBottom: spacing.md },
});

export default MatchingDonorsScreen;
