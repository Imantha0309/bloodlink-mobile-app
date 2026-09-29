import React, { useCallback, useEffect, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { AppButton, AppCard, AppInput, Badge, EmptyState, InfoRow, Loading } from '../../components';
import { colors, typography, spacing } from '../../theme';
import adminService from '../../services/adminService';
import { getErrorMessage, formatDate } from '../../utils/helpers';

const HospitalsScreen = () => {
  const [hospitals, setHospitals] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminService.listHospitals({ search: search.trim() || undefined, limit: 50 });
      setHospitals(res.data);
      setError(null);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    load();
  }, [load]);

  const toggleVerification = async (hospital) => {
    const next = !hospital.isVerified;
    setHospitals((prev) => prev.map((h) => (h.id === hospital.id ? { ...h, isVerified: next } : h)));
    try {
      await adminService.verifyHospital(hospital.id, next);
    } catch (err) {
      setHospitals((prev) => prev.map((h) => (h.id === hospital.id ? { ...h, isVerified: !next } : h)));
      setError(getErrorMessage(err, 'Could not update verification'));
    }
  };

  const renderItem = ({ item }) => (
    <AppCard title={item.name} subtitle={`Registration ${item.registrationNumber}`}>
      <View style={styles.metaRow}>
        <Badge
          label={item.isVerified ? 'VERIFIED' : 'UNVERIFIED'}
          background={item.isVerified ? colors.success : colors.warning}
          textColor={colors.textOnPrimary}
        />
        <Badge
          label={item.user?.isActive === false ? 'DISABLED' : 'ACTIVE'}
          background={colors.background}
          textColor={colors.textSecondary}
          style={styles.gap}
        />
      </View>
      <InfoRow label="Contact" value={item.user?.email} />
      <InfoRow label="Phone" value={item.user?.phone || item.contactPhone} />
      <InfoRow label="Address" value={item.address} />
      <InfoRow label="Registered" value={formatDate(item.createdAt)} />
      <View style={styles.action}>
        <AppButton
          title={item.isVerified ? 'Revoke verification' : 'Verify hospital'}
          size="sm"
          fullWidth={false}
          variant={item.isVerified ? 'outline' : 'primary'}
          onPress={() => toggleVerification(item)}
        />
      </View>
    </AppCard>
  );

  if (loading && hospitals.length === 0) return <Loading label="Loading hospitals…" fullScreen />;

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <AppInput
          label="Search"
          value={search}
          onChangeText={setSearch}
          placeholder="Name or registration number"
          autoCapitalize="none"
        />
      </View>
      {!!error && <Text style={styles.error}>{error}</Text>}
      <FlatList
        data={hospitals}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        keyboardShouldPersistTaps="handled"
        refreshControl={<RefreshControl refreshing={loading} onRefresh={load} tintColor={colors.primary} />}
        ListEmptyComponent={
          loading ? null : (
            <EmptyState icon={'\u{1F3E5}'} title="No hospitals" message="Registered hospital accounts will appear here." />
          )
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  header: { padding: spacing.lg, paddingBottom: 0 },
  list: { padding: spacing.lg, paddingBottom: spacing.xxl },
  metaRow: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.md },
  gap: { marginLeft: spacing.sm },
  action: { marginTop: spacing.md, alignItems: 'flex-start' },
  error: { ...typography.bodySmall, color: colors.danger, paddingHorizontal: spacing.lg, paddingTop: spacing.sm },
});

export default HospitalsScreen;
