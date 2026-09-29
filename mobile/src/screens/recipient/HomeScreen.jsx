import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import {
  clearCurrent,
  fetchRequests,
  selectRecipientError,
  selectRecipientLoading,
  selectRequests,
} from '../../store/recipientStore';
import {
  AppButton,
  AppCard,
  BloodGroupBadge,
  EmptyState,
  FilterTabs,
  StatusBadge,
  UrgencyBadge,
} from '../../components';
import { colors, typography, radius, spacing } from '../../theme';
import { isActiveRequest, timeAgo, timeUntil } from '../../utils/helpers';

const FILTERS = {
  all: () => true,
  active: (r) => isActiveRequest(r.status),
  fulfilled: (r) => r.status === 'fulfilled',
  closed: (r) => r.status === 'cancelled' || r.status === 'expired',
};

const HomeScreen = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const requests = useSelector(selectRequests);
  const loading = useSelector(selectRecipientLoading);
  const error = useSelector(selectRecipientError);
  const [filter, setFilter] = useState('all');

  const load = useCallback(() => {
    dispatch(fetchRequests());
  }, [dispatch]);

  useFocusEffect(
    useCallback(() => {
      load();
      return () => dispatch(clearCurrent());
    }, [load, dispatch])
  );

  useEffect(() => {
    load();
  }, [load]);

  const visible = useMemo(() => requests.filter(FILTERS[filter] || FILTERS.all), [requests, filter]);

  const active = useMemo(() => requests.filter((r) => isActiveRequest(r.status)), [requests]);

  const renderItem = ({ item }) => (
    <AppCard
      onPress={() => navigation.navigate('RequestStatus', { id: item.id })}
      accessibilityLabel={`Request for ${item.bloodGroup}, ${item.status}`}
    >
      <View style={styles.row}>
        <BloodGroupBadge group={item.bloodGroup} />
        <View style={styles.rowText}>
          <Text style={styles.title}>{item.unitsRequired} unit{item.unitsRequired === 1 ? '' : 's'} needed</Text>
          <Text style={styles.meta}>
            {item.patientName ? `${item.patientName} · ` : ''}
            {item.unitsRequired} unit{item.unitsRequired === 1 ? '' : 's'} · raised {timeAgo(item.createdAt)}
          </Text>
        </View>
        <View style={styles.badges}>
          <UrgencyBadge urgency={item.urgency} />
          <View style={styles.badgeSpacer} />
          <StatusBadge status={item.status} />
        </View>
      </View>
      {isActiveRequest(item.status) && !!item.expiresAt && (
        <Text style={styles.expiry}>Expires in {timeUntil(item.expiresAt)}</Text>
      )}
    </AppCard>
  );

  return (
    <View style={styles.screen}>
      <View style={styles.hero}>
        <Text style={styles.heroTitle}>Need blood urgently?</Text>
        <Text style={styles.heroSubtitle}>
          Raise a request and we will alert compatible donors near you.
        </Text>
        <AppButton
          title="New emergency request"
          size="lg"
          onPress={() => navigation.navigate('EmergencyRequest')}
          testID="new-request"
        />
      </View>

      <View style={styles.content}>
        <Text style={styles.sectionTitle}>
          Your requests{active.length > 0 ? ` · ${active.length} active` : ''}
        </Text>
        <FilterTabs value={filter} onChange={setFilter} />

        {!!error && <Text style={styles.error}>{error}</Text>}

        <FlatList
          data={visible}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderItem}
          refreshControl={<RefreshControl refreshing={loading} onRefresh={load} tintColor={colors.primary} />}
          ListEmptyComponent={
            loading ? null : (
              <EmptyState
                icon={'\u{1F4CB}'}
                title="No requests yet"
                message="When you raise an emergency request it will appear here so you can track matched donors."
                actionTitle="Create a request"
                onAction={() => navigation.navigate('EmergencyRequest')}
              />
            )
          }
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  hero: { backgroundColor: colors.primary, padding: spacing.xl },
  heroTitle: { ...typography.h2, color: colors.textOnPrimary },
  heroSubtitle: { ...typography.body, color: colors.primaryLight, marginTop: spacing.xs, marginBottom: spacing.lg },
  content: { flex: 1, padding: spacing.lg },
  sectionTitle: { ...typography.h3, color: colors.text, marginBottom: spacing.md },
  row: { flexDirection: 'row', alignItems: 'center' },
  rowText: { flex: 1, marginLeft: spacing.md },
  title: { ...typography.h4, color: colors.text },
  meta: { ...typography.bodySmall, color: colors.textSecondary, marginTop: spacing.xxs },
  badges: { marginLeft: spacing.sm, alignItems: 'flex-end' },
  badgeSpacer: { height: spacing.xs },
  expiry: { ...typography.caption, color: colors.warning, marginTop: spacing.md },
  error: { ...typography.bodySmall, color: colors.danger, marginBottom: spacing.sm },
});

export default HomeScreen;
