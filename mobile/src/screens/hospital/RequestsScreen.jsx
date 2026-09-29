import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { AppCard, BloodGroupBadge, EmptyState, FilterTabs, Loading, StatusBadge, UrgencyBadge } from '../../components';
import { colors, typography, spacing } from '../../theme';
import hospitalService from '../../services/hospitalService';
import { getErrorMessage, timeAgo, timeUntil } from '../../utils/helpers';
import { REQUEST_STATUS } from '../../utils/constants';

const TABS = [
  { key: 'all', label: 'All' },
  { key: REQUEST_STATUS.PENDING, label: 'Pending' },
  { key: REQUEST_STATUS.MATCHING, label: 'Matching' },
  { key: REQUEST_STATUS.FULFILLED, label: 'Fulfilled' },
];

const RequestsScreen = () => {
  const navigation = useNavigation();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tab, setTab] = useState('all');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await hospitalService.listRequests({ limit: 50 });
      setRequests(res.data);
      setError(null);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  useEffect(() => {
    load();
  }, [load]);

  const visible = useMemo(
    () => (tab === 'all' ? requests : requests.filter((r) => r.status === tab)),
    [requests, tab]
  );

  const renderItem = ({ item }) => (
    <AppCard onPress={() => navigation.navigate('RequestDetails', { id: item.id })}>
      <View style={styles.row}>
        <BloodGroupBadge group={item.bloodGroup} />
        <View style={styles.rowText}>
          <Text style={styles.title}>
            {item.unitsRequired} unit{item.unitsRequired === 1 ? '' : 's'} of {item.bloodGroup}
          </Text>
          <Text style={styles.meta}>
            {item.recipient?.name ? `${item.recipient.name} · ` : ''}raised {timeAgo(item.createdAt)}
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
    </AppCard>
  );

  if (loading && requests.length === 0) return <Loading label="Loading requests…" fullScreen />;

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
            loading ? null : <EmptyState icon={'\u{1F4CB}'} title="No requests" message="Requests raised by recipients will appear here." />
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
  expiry: { ...typography.caption, color: colors.warning, marginTop: spacing.md },
  error: { ...typography.bodySmall, color: colors.danger, marginBottom: spacing.sm },
});

export default RequestsScreen;
