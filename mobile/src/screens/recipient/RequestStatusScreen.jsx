import React, { useEffect } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import {
  clearCurrent,
  fetchRequestDetail,
  selectAcceptedDonors,
  selectCurrentRequest,
  selectRecipientError,
} from '../../store/recipientStore';
import {
  AppButton,
  AppCard,
  BloodGroupBadge,
  InfoRow,
  Loading,
  StatusBadge,
  UrgencyBadge,
} from '../../components';
import { colors, typography, radius, spacing } from '../../theme';
import { formatDateTime, isActiveRequest, timeUntil } from '../../utils/helpers';

const RequestStatusScreen = ({ route }) => {
  const { id } = route.params;
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const request = useSelector(selectCurrentRequest);
  const donors = useSelector(selectAcceptedDonors);
  const error = useSelector(selectRecipientError);

  useEffect(() => {
    dispatch(fetchRequestDetail(id));
    return () => dispatch(clearCurrent());
  }, [dispatch, id]);

  if (error && !request) return <Loading label={error} fullScreen />;
  if (!request) return <Loading label="Loading request…" fullScreen />;

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <BloodGroupBadge group={request.bloodGroup} size="lg" />
        <View style={styles.headerText}>
          <Text style={styles.title}>{request.unitsRequired} unit{request.unitsRequired === 1 ? '' : 's'} needed</Text>
          <View style={styles.badgeRow}>
            <StatusBadge status={request.status} />
            <View style={styles.badgeGap} />
            <UrgencyBadge urgency={request.urgency} />
          </View>
        </View>
      </View>

      <AppCard title="Request details">
        <InfoRow label="Raised" value={formatDateTime(request.createdAt)} />
        <InfoRow label="Expires" value={isActiveRequest(request.status) ? timeUntil(request.expiresAt) : '—'} />
        <InfoRow label="Patient" value={request.patientName} />
        <InfoRow label="Age" value={request.patientAge} />
        <InfoRow label="Units requested" value={request.unitsRequired} />
        {!!request.hospital && <InfoRow label="Hospital" value={request.hospital.name} />}
        {!!request.notes && <InfoRow label="Notes" value={request.notes} />}
      </AppCard>

      <Text style={styles.sectionTitle}>
        {donors.length > 0 ? 'Donors who accepted' : 'No donors have accepted yet'}
      </Text>

      {donors.length === 0 ? (
        <AppCard>
          <Text style={styles.empty}>
            We are alerting compatible donors nearby. Accepted donors will show up here with their contact details.
          </Text>
        </AppCard>
      ) : (
        donors.map((row) => (
          <AppCard key={row.id} title={row.donor?.user?.name} subtitle={`${row.donor?.bloodGroup || ''} donor`}>
            <InfoRow label="Phone" value={row.donor?.user?.phone} />
            {!!row.distanceKm && <InfoRow label="Distance" value={`${row.distanceKm} km`} />}
            <InfoRow label="Responded" value={formatDateTime(row.respondedAt)} />
            <View style={styles.donorAction}>
              <AppButton
                title="Call donor"
                size="sm"
                fullWidth={false}
                onPress={() => {}}
                disabled={!row.donor?.user?.phone}
              />
            </View>
          </AppCard>
        ))
      )}

      {isActiveRequest(request.status) && (
        <View style={styles.actions}>
          <AppButton
            title="View matched donors"
            variant="outline"
            onPress={() => navigation.navigate('MatchingDonors', { id: request.id })}
          />
          <AppButton
            title="Cancel request"
            variant="ghost"
            onPress={() => navigation.navigate('ReviewRequest', { id: request.id })}
          />
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, paddingBottom: spacing.xxl },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.lg },
  headerText: { flex: 1, marginLeft: spacing.lg },
  title: { ...typography.h3, color: colors.text },
  badgeRow: { flexDirection: 'row', alignItems: 'center', marginTop: spacing.sm },
  badgeGap: { width: spacing.sm },
  sectionTitle: { ...typography.h3, color: colors.text, marginBottom: spacing.md },
  empty: { ...typography.body, color: colors.textSecondary },
  donorAction: { flexDirection: 'row', marginTop: spacing.md },
  actions: { marginTop: spacing.lg },
});

export default RequestStatusScreen;
