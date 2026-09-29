import React, { useCallback, useEffect } from 'react';
import { FlatList, RefreshControl, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchDonorProfile,
  fetchMatchedRequests,
  selectDonorError,
  selectDonorLoading,
  selectDonorProfile,
  selectMatchedRequests,
  setAvailability,
} from '../../store/donorStore';
import { AppButton, AppCard, BloodGroupBadge, EmptyState, Loading, UrgencyBadge } from '../../components';
import { colors, typography, radius, spacing } from '../../theme';
import { formatDistance, timeAgo } from '../../utils/helpers';

const DonorHomeScreen = () => {
  const dispatch = useDispatch();
  const profile = useSelector(selectDonorProfile);
  const requests = useSelector(selectMatchedRequests);
  const loading = useSelector(selectDonorLoading);
  const error = useSelector(selectDonorError);

  const load = useCallback(() => {
    dispatch(fetchDonorProfile());
    dispatch(fetchMatchedRequests());
  }, [dispatch]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  useEffect(() => {
    load();
  }, [load]);

  if (loading && !profile) return <Loading label="Loading your dashboard…" fullScreen />;

  const available = Boolean(profile?.isAvailable);

  const renderItem = ({ item }) => {
    const request = item.request;
    return (
      <AppCard title={`${request?.unitsRequired || 1} unit${request?.unitsRequired === 1 ? '' : 's'} of ${request?.bloodGroup || ''}`} subtitle={`Raised ${timeAgo(request?.createdAt)}`}>
        <View style={styles.cardRow}>
          <BloodGroupBadge group={request?.bloodGroup} />
          <View style={styles.cardText}>
            {!!request?.patientName && <Text style={styles.patient}>{request.patientName}</Text>}
            <Text style={styles.distance}>{formatDistance(item.distanceKm)}</Text>
            <View style={styles.badgeRow}>
              <UrgencyBadge urgency={request?.urgency} />
            </View>
          </View>
        </View>
      </AppCard>
    );
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={[styles.availability, available ? styles.availableCard : styles.unavailableCard]}>
        <View style={styles.availabilityText}>
          <Text style={[styles.availabilityTitle, !available && styles.availabilityTitleDark]}>
            {available ? 'You are available' : 'You are unavailable'}
          </Text>
          <Text style={[styles.availabilitySubtitle, !available && styles.availabilitySubtitleDark]}>
            {available
              ? 'We will alert you when a matching request appears near you.'
              : 'Turn this on to receive alerts for compatible requests.'}
          </Text>
        </View>
        <Switch
          value={available}
          onValueChange={(next) => dispatch(setAvailability(next))}
          trackColor={{ true: colors.primary, false: colors.border }}
          thumbColor={colors.surface}
          accessibilityLabel="Availability toggle"
          testID="availability-toggle"
        />
      </View>

      {!!error && <Text style={styles.error}>{error}</Text>}

      <View style={styles.statsRow}>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{profile?.totalDonations ?? 0}</Text>
          <Text style={styles.statLabel}>Donations</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{profile?.bloodGroup || '—'}</Text>
          <Text style={styles.statLabel}>Blood group</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{requests.length}</Text>
          <Text style={styles.statLabel}>Open matches</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Requests near you</Text>

      {loading && requests.length === 0 ? (
        <Loading label="Finding requests…" />
      ) : (
        <FlatList
          data={requests}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderItem}
          scrollEnabled={false}
          refreshControl={<RefreshControl refreshing={loading} onRefresh={load} tintColor={colors.primary} />}
          ListEmptyComponent={
            <EmptyState
              icon={'\u{1F4E5}'}
              title={available ? 'No matching requests' : 'Turn on availability first'}
              message={
                available
                  ? 'We will notify you the moment a compatible request is raised near you.'
                  : 'You need to be available before we can match you to requests.'
              }
            />
          }
        />
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, paddingBottom: spacing.xxl },
  availability: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: radius.md,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    borderWidth: 1,
  },
  availableCard: { backgroundColor: colors.success, borderColor: colors.success },
  unavailableCard: { backgroundColor: colors.surface, borderColor: colors.border },
  availabilityText: { flex: 1, marginRight: spacing.lg },
  availabilityTitle: { ...typography.h4, color: colors.textOnPrimary },
  availabilityTitleDark: { color: colors.text },
  availabilitySubtitle: { ...typography.bodySmall, color: colors.textOnPrimary, marginTop: spacing.xxs },
  availabilitySubtitleDark: { color: colors.textSecondary },
  statsRow: { flexDirection: 'row', marginHorizontal: -spacing.xs, marginBottom: spacing.lg },
  stat: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    marginHorizontal: spacing.xs,
    alignItems: 'center',
  },
  statValue: { ...typography.h2, color: colors.text },
  statLabel: { ...typography.caption, color: colors.textSecondary, marginTop: spacing.xxs },
  sectionTitle: { ...typography.h3, color: colors.text, marginBottom: spacing.md },
  cardRow: { flexDirection: 'row', alignItems: 'center' },
  cardText: { flex: 1, marginLeft: spacing.md },
  patient: { ...typography.body, color: colors.text, fontWeight: '600' },
  distance: { ...typography.bodySmall, color: colors.textSecondary, marginTop: spacing.xxs },
  badgeRow: { flexDirection: 'row', marginTop: spacing.sm },
  error: { ...typography.bodySmall, color: colors.danger, marginBottom: spacing.md },
});

export default DonorHomeScreen;
