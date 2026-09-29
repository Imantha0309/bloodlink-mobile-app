import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { AppButton, AppCard, BloodGroupBadge, InfoRow, Loading, StatusBadge, UrgencyBadge } from '../../components';
import { colors, typography, spacing } from '../../theme';
import hospitalService from '../../services/hospitalService';
import { getErrorMessage, formatDateTime, timeUntil } from '../../utils/helpers';
import { REQUEST_STATUS } from '../../utils/constants';

const RequestDetailsScreen = ({ route }) => {
  const { id } = route.params;
  const navigation = useNavigation();
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;
    hospitalService
      .getRequest(id)
      .then((data) => active && setRequest(data))
      .catch((err) => active && setError(getErrorMessage(err, 'Could not load this request')))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [id]);

  const setStatus = async (status) => {
    setSaving(true);
    setError(null);
    try {
      const updated = await hospitalService.updateRequestStatus(id, { status });
      setRequest(updated);
    } catch (err) {
      setError(getErrorMessage(err, 'Could not update the request'));
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loading label="Loading request…" fullScreen />;
  if (!request) return <Loading label={error || 'Request unavailable'} fullScreen />;

  const isActive = request.status === REQUEST_STATUS.PENDING || request.status === REQUEST_STATUS.MATCHING;

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <BloodGroupBadge group={request.bloodGroup} size="lg" />
        <View style={styles.headerText}>
          <Text style={styles.title}>
            {request.unitsRequired} unit{request.unitsRequired === 1 ? '' : 's'} of {request.bloodGroup}
          </Text>
          <View style={styles.badgeRow}>
            <StatusBadge status={request.status} />
            <View style={styles.gap} />
            <UrgencyBadge urgency={request.urgency} />
          </View>
        </View>
      </View>

      <AppCard title="Patient">
        <InfoRow label="Name" value={request.patientName} />
        <InfoRow label="Age" value={request.patientAge} />
        <InfoRow label="Notes" value={request.notes} />
      </AppCard>

      <AppCard title="Request">
        <InfoRow label="Raised" value={formatDateTime(request.createdAt)} />
        <InfoRow label="Expires" value={isActive ? timeUntil(request.expiresAt) : '—'} />
        <InfoRow label="Attached hospital" value={request.hospital?.name} />
        <InfoRow label="Recipient phone" value={request.recipient?.phone} />
      </AppCard>

      {!!error && <Text style={styles.error}>{error}</Text>}

      {isActive && (
        <View style={styles.actions}>
          <Text style={styles.sectionTitle}>Update status</Text>
          <AppButton title="Mark as fulfilled" onPress={() => setStatus(REQUEST_STATUS.FULFILLED)} loading={saving} />
          <View style={styles.spacer} />
          <AppButton
            title="Mark as cancelled"
            variant="outline"
            onPress={() => setStatus(REQUEST_STATUS.CANCELLED)}
            disabled={saving}
          />
        </View>
      )}

      <View style={styles.footer}>
        <AppButton
          title="Scan donor to record donation"
          variant="ghost"
          onPress={() => navigation.navigate('QRScanner')}
        />
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
  badgeRow: { flexDirection: 'row', alignItems: 'center', marginTop: spacing.sm },
  gap: { width: spacing.sm },
  error: { ...typography.bodySmall, color: colors.danger, marginBottom: spacing.md },
  actions: { marginTop: spacing.lg },
  sectionTitle: { ...typography.h3, color: colors.text, marginBottom: spacing.md },
  spacer: { height: spacing.md },
  footer: { marginTop: spacing.xl, alignItems: 'center' },
});

export default RequestDetailsScreen;
