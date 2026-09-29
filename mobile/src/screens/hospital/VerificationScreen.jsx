import React, { useEffect, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { AppCard, Badge, EmptyState, FilterTabs, Loading } from '../../components';
import { colors, typography, spacing } from '../../theme';
import hospitalService from '../../services/hospitalService';
import { getErrorMessage, formatDateTime, titleCase } from '../../utils/helpers';

const TABS = [
  { key: 'all', label: 'All' },
  { key: 'approved', label: 'Approved' },
  { key: 'pending', label: 'Pending' },
  { key: 'rejected', label: 'Rejected' },
];

const VerificationScreen = () => {
  const navigation = useNavigation();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tab, setTab] = useState('all');

  const load = async () => {
    setLoading(true);
    try {
      const res = await hospitalService.listVerifications({ limit: 50 });
      setRecords(res.data);
      setError(null);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      load();
    }, [])
  );

  useEffect(() => {
    load();
  }, []);

  const visible = tab === 'all' ? records : records.filter((r) => r.status === tab);

  const renderItem = ({ item }) => (
    <AppCard title={`Code ${item.donationId}`} subtitle={formatDateTime(item.createdAt)}>
      <View style={styles.row}>
        <Badge
          label={titleCase(item.status).toUpperCase()}
          background={item.status === 'approved' ? colors.success : item.status === 'rejected' ? colors.danger : colors.warning}
          textColor={colors.textOnPrimary}
        />
        {!!item.hospital && <Text style={styles.hospital}>{item.hospital.name}</Text>}
      </View>
      {!!item.remarks && <Text style={styles.remarks}>{item.remarks}</Text>}
    </AppCard>
  );

  if (loading && records.length === 0) return <Loading label="Loading verifications…" fullScreen />;

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
                icon={'\u{1F4E6}'}
                title="No verifications"
                message="Donations you record will be listed here."
                actionTitle="Scan a QR code"
                onAction={() => navigation.navigate('QRScanner')}
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
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: spacing.sm },
  hospital: { ...typography.bodySmall, color: colors.textSecondary },
  remarks: { ...typography.bodySmall, color: colors.textSecondary, marginTop: spacing.sm },
  error: { ...typography.bodySmall, color: colors.danger, marginBottom: spacing.sm },
});

export default VerificationScreen;
