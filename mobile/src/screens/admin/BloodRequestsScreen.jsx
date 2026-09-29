import React, { useCallback, useEffect, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { AppButton, AppCard, BloodGroupBadge, EmptyState, FilterTabs, Loading, StatusBadge, UrgencyBadge } from '../../components';
import { colors, typography, spacing } from '../../theme';
import adminService from '../../services/adminService';
import { getErrorMessage, formatDateTime, timeUntil } from '../../utils/helpers';
import { REQUEST_STATUS } from '../../utils/constants';

const TABS = [
  { key: 'all', label: 'All' },
  { key: REQUEST_STATUS.PENDING, label: 'Pending' },
  { key: REQUEST_STATUS.MATCHING, label: 'Matching' },
  { key: REQUEST_STATUS.FULFILLED, label: 'Fulfilled' },
  { key: REQUEST_STATUS.CANCELLED, label: 'Cancelled' },
];

const BloodRequestsScreen = () => {
  const navigation = useNavigation();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tab, setTab] = useState('all');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminService.listRequests({ limit: 50 });
      setRequests(res.data);
      setError(null);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const visible = tab === 'all' ? requests : requests.filter((r) => r.status === tab);

  const changeStatus = async (request, status) => {
    const previous = request.status;
    setRequests((prev) => prev.map((r) => (r.id === request.id ? { ...r, status } : r)));
    try {
      await adminService.updateRequest(request.id, { status });
    } catch (err) {
      setRequests((prev) => prev.map((r) => (r.id === request.id ? { ...r, status: previous } : r)));
      setError(getErrorMessage(err, 'Could not update the request'));
    }
  };

  const renderItem = ({ item }) => (
    <AppCard>
      <View style={styles.row}>
        <BloodGroupBadge group={item.bloodGroup} />
        <View style={styles.rowText}>
          <Text style={styles.title}>
            {item.unitsRequired} unit{item.unitsRequired === 1 ? '' : 's'} of {item.bloodGroup}
          </Text>
          <Text style={styles.meta}>
            {item.recipient?.name ? `${item.recipient.name} · ` : ''}
            {formatDateTime(item.createdAt)}
          </Text>
        </View>
        <View style={styles.badges}>
          <StatusBadge status={item.status} />
          <View style={styles.gap} />
          <UrgencyBadge urgency={item.urgency} />
        </View>
      </View>
      {item.status === REQUEST_STATUS.MATCHING && !!item.expiresAt && (
        <Text style={styles.expiry}>Expires in {timeUntil(item.expiresAt)}</Text>
      )}
      <View style={styles.actions}>
        {item.status !== REQUEST_STATUS.FULFILLED && (
          <AppButton
            title="Mark fulfilled"
            size="sm"
            fullWidth={false}
            onPress={() => changeStatus(item, REQUEST_STATUS.FULFILLED)}
            style={styles.action}
          />
        )}
        {item.status === REQUEST_STATUS.PENDING && (
          <AppButton
            title="Cancel"
            size="sm"
            fullWidth={false}
            variant="outline"
            onPress={() => changeStatus(item, REQUEST_STATUS.CANCELLED)}
            style={styles.action}
          />
        )}
      </View>
    </AppCard>
  );

  if (loading && requests.length === 0) return <Loading label="Loading requests…" fullScreen />;

  return (
    <View style={styles.screen}>
      <View style={styles.content}>
        <View style={styles.tabs}>
          <FilterTabs value={tab} onChange={setTab} options={TABS} />
        </View>
        {!!error && <Text style={styles.error}>{error}</Text>}
        <FlatList
          data={visible}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={loading} onRefresh={load} tintColor={colors.primary} />}
          ListEmptyComponent={
            loading ? null : <EmptyState icon={'\u{1F4CB}'} title="No requests" message="Requests raised by recipients will appear here." />
          }
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { flex: 1 },
  list: { padding: spacing.lg, paddingTop: 0, paddingBottom: spacing.xxl },
  tabs: { paddingHorizontal: spacing.lg },
  row: { flexDirection: 'row', alignItems: 'center' },
  rowText: { flex: 1, marginLeft: spacing.md },
  title: { ...typography.h4, color: colors.text },
  meta: { ...typography.bodySmall, color: colors.textSecondary, marginTop: spacing.xxs },
  badges: { alignItems: 'flex-end' },
  gap: { height: spacing.xs },
  expiry: { ...typography.caption, color: colors.warning, marginTop: spacing.md },
  actions: { flexDirection: 'row', marginTop: spacing.md },
  action: { marginRight: spacing.sm },
  error: { ...typography.bodySmall, color: colors.danger, paddingHorizontal: spacing.lg, paddingBottom: spacing.sm },
});

export default BloodRequestsScreen;
