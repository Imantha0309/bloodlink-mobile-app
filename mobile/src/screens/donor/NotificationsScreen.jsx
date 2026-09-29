import React, { useCallback } from 'react';
import { FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchMatchedRequests,
  selectDonorError,
  selectDonorLoading,
  selectMatchedRequests,
} from '../../store/donorStore';
import { AppCard, BloodGroupBadge, EmptyState, Loading, UrgencyBadge } from '../../components';
import { colors, typography, spacing } from '../../theme';
import { formatDistance, timeAgo, timeUntil } from '../../utils/helpers';

const NotificationsScreen = () => {
  const dispatch = useDispatch();
  const requests = useSelector(selectMatchedRequests);
  const loading = useSelector(selectDonorLoading);
  const error = useSelector(selectDonorError);

  const load = useCallback(() => {
    dispatch(fetchMatchedRequests());
  }, [dispatch]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const renderItem = ({ item }) => {
    const request = item.request || {};
    return (
      <AppCard
        title={`${request.unitsRequired || 1} unit${request.unitsRequired === 1 ? '' : 's'} of ${request.bloodGroup || ''}`}
        subtitle={`${formatDistance(item.distanceKm)} · raised ${timeAgo(request.createdAt)}`}
      >
        <View style={styles.row}>
          <BloodGroupBadge group={request.bloodGroup} />
          <View style={styles.rowText}>
            {!!request.patientName && <Text style={styles.patient}>{request.patientName}</Text>}
            {!!request.notes && <Text style={styles.notes} numberOfLines={2}>{request.notes}</Text>}
            <View style={styles.badges}>
              <UrgencyBadge urgency={request.urgency} />
              {!!request.expiresAt && (
                <Text style={styles.expiry}>{timeUntil(request.expiresAt)}</Text>
              )}
            </View>
          </View>
        </View>
      </AppCard>
    );
  };

  if (loading && requests.length === 0) return <Loading label="Loading requests…" fullScreen />;

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Text style={styles.title}>Matching requests</Text>
        <Text style={styles.subtitle}>Requests you can donate to, closest first</Text>
      </View>
      {!!error && <Text style={styles.error}>{error}</Text>}
      <FlatList
        data={requests}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={load} tintColor={colors.primary} />}
        ListEmptyComponent={
          <EmptyState
            icon={'\u{1F4E5}'}
            title="No requests yet"
            message="When a compatible request is raised near you it will show up here."
          />
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  header: { padding: spacing.lg, paddingBottom: spacing.sm },
  title: { ...typography.h2, color: colors.text },
  subtitle: { ...typography.bodySmall, color: colors.textSecondary, marginTop: spacing.xxs },
  list: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxl },
  row: { flexDirection: 'row', alignItems: 'center' },
  rowText: { flex: 1, marginLeft: spacing.md },
  patient: { ...typography.body, color: colors.text, fontWeight: '600' },
  notes: { ...typography.bodySmall, color: colors.textSecondary, marginTop: spacing.xxs },
  badges: { flexDirection: 'row', alignItems: 'center', marginTop: spacing.sm },
  expiry: { ...typography.caption, color: colors.warning, marginLeft: spacing.sm },
  error: { ...typography.bodySmall, color: colors.danger, paddingHorizontal: spacing.lg, paddingBottom: spacing.sm },
});

export default NotificationsScreen;
