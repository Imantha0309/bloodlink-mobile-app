import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { fetchRequests, selectRecipientError, selectRecipientLoading, selectRequests } from '../../store/recipientStore';
import { AppButton, AppCard, BloodGroupBadge, EmptyState, FilterTabs, StatusBadge, UrgencyBadge } from '../../components';
import { colors, typography, spacing } from '../../theme';
import { formatDateTime, isActiveRequest } from '../../utils/helpers';

const TABS = [
  { key: 'all', label: 'All' },
  { key: 'active', label: 'Active' },
  { key: 'closed', label: 'Closed' },
];

const RequestHistoryScreen = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const requests = useSelector(selectRequests);
  const loading = useSelector(selectRecipientLoading);
  const error = useSelector(selectRecipientError);
  const [tab, setTab] = useState('all');

  const load = useCallback(() => {
    dispatch(fetchRequests());
  }, [dispatch]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  useEffect(() => {
    load();
  }, [load]);

  const visible = useMemo(
    () => (tab === 'active' ? requests.filter((r) => isActiveRequest(r.status)) : tab === 'closed' ? requests.filter((r) => !isActiveRequest(r.status)) : requests),
    [requests, tab]
  );

  const renderItem = ({ item }) => (
    <AppCard onPress={() => navigation.navigate('RequestStatus', { id: item.id })}>
      <View style={styles.row}>
        <BloodGroupBadge group={item.bloodGroup} />
        <View style={styles.rowText}>
          <Text style={styles.title}>{item.unitsRequired} unit{item.unitsRequired === 1 ? '' : 's'} of {item.bloodGroup}</Text>
          <Text style={styles.meta}>{formatDateTime(item.createdAt)}</Text>
        </View>
        <View style={styles.badges}>
          <StatusBadge status={item.status} />
          <View style={styles.gap} />
          <UrgencyBadge urgency={item.urgency} />
        </View>
      </View>
    </AppCard>
  );

  return (
    <View style={styles.screen}>
      <View style={styles.content}>
        <FilterTabs value={tab} onChange={setTab} options={TABS} />
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
                title="Nothing here yet"
                message="Requests you raise will be listed here with their current status."
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
  content: { flex: 1, padding: spacing.lg },
  row: { flexDirection: 'row', alignItems: 'center' },
  rowText: { flex: 1, marginLeft: spacing.md },
  title: { ...typography.h4, color: colors.text },
  meta: { ...typography.bodySmall, color: colors.textSecondary, marginTop: spacing.xxs },
  badges: { alignItems: 'flex-end' },
  gap: { height: spacing.xs },
  error: { ...typography.bodySmall, color: colors.danger, marginBottom: spacing.sm },
});

export default RequestHistoryScreen;
