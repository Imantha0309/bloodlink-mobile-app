import React, { useCallback, useEffect, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { AppCard, Badge, EmptyState, FilterTabs, InfoRow, Loading } from '../../components';
import { colors, typography, spacing } from '../../theme';
import adminService from '../../services/adminService';
import { getErrorMessage, formatDateTime, titleCase } from '../../utils/helpers';

const TABS = [
  { key: 'all', label: 'All' },
  { key: 'approved', label: 'Approved' },
  { key: 'pending', label: 'Pending' },
  { key: 'rejected', label: 'Rejected' },
];

const VerificationScreen = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tab, setTab] = useState('all');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminService.listVerifications({ limit: 50 });
      setRecords(res.data);
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

  const visible = tab === 'all' ? records : records.filter((r) => r.status === tab);

  const renderItem = ({ item }) => (
    <AppCard title={`Code ${item.donationId}`}>
      <Badge
        label={titleCase(item.status).toUpperCase()}
        background={item.status === 'approved' ? colors.success : item.status === 'rejected' ? colors.danger : colors.warning}
        textColor={colors.textOnPrimary}
        style={styles.badge}
      />
      <InfoRow label="Hospital" value={item.hospital?.name} />
      <InfoRow label="Verified at" value={formatDateTime(item.verifiedAt)} />
      <InfoRow label="Recorded" value={formatDateTime(item.createdAt)} />
      {!!item.remarks && <InfoRow label="Remarks" value={item.remarks} />}
    </AppCard>
  );

  if (loading && records.length === 0) return <Loading label="Loading verifications…" fullScreen />;

  return (
    <View style={styles.screen}>
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
          loading ? null : (
            <EmptyState icon={'\u{1F4E6}'} title="No verifications" message="Donations recorded by hospitals will appear here." />
          )
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  tabs: { paddingHorizontal: spacing.lg, paddingTop: spacing.lg },
  list: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxl },
  badge: { marginBottom: spacing.md },
  error: { ...typography.bodySmall, color: colors.danger, paddingHorizontal: spacing.lg, paddingBottom: spacing.sm },
});

export default VerificationScreen;
