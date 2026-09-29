import React, { useCallback, useEffect, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { AppButton, AppCard, Loading, StatCard } from '../../components';
import { colors, typography, spacing } from '../../theme';
import adminService from '../../services/adminService';
import { getErrorMessage } from '../../utils/helpers';

const DashboardScreen = () => {
  const navigation = useNavigation();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setStats(await adminService.getStats());
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

  if (loading && !stats) return <Loading label="Loading platform statistics…" fullScreen />;

  const roleCount = (role) => stats?.byRole?.find((r) => r.role === role)?.total ?? 0;

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={loading} onRefresh={load} tintColor={colors.primary} />}
    >
      <Text style={styles.title}>Admin dashboard</Text>
      <Text style={styles.subtitle}>Platform health at a glance</Text>

      {!!error && <Text style={styles.error}>{error}</Text>}

      <View style={styles.grid}>
        <StatCard label="Total users" value={stats?.byRole?.reduce((sum, r) => sum + Number(r.total), 0) ?? '—'} />
        <StatCard label="Recipients" value={roleCount('recipient')} />
        <StatCard label="Donors" value={roleCount('donor')} tone={colors.primary} />
        <StatCard label="Available donors" value={stats?.availableDonors ?? '—'} tone={colors.success} />
        <StatCard label="Hospitals" value={roleCount('hospital')} />
        <StatCard label="Requests" value={stats?.requests ?? '—'} tone={colors.info} />
      </View>

      <Text style={styles.sectionTitle}>Manage</Text>
      <AppCard>
        <AppButton title="Users" onPress={() => navigation.navigate('Users')} />
        <View style={styles.spacer} />
        <AppButton title="Donors" variant="outline" onPress={() => navigation.navigate('Donors')} />
        <View style={styles.spacer} />
        <AppButton title="Recipients" variant="outline" onPress={() => navigation.navigate('Recipients')} />
        <View style={styles.spacer} />
        <AppButton title="Hospitals" variant="outline" onPress={() => navigation.navigate('Hospitals')} />
        <View style={styles.spacer} />
        <AppButton title="Blood requests" variant="ghost" onPress={() => navigation.navigate('BloodRequests')} />
        <View style={styles.spacer} />
        <AppButton title="Verifications" variant="ghost" onPress={() => navigation.navigate('Verification')} />
        <View style={styles.spacer} />
        <AppButton title="App settings" variant="ghost" onPress={() => navigation.navigate('AppSettings')} />
      </AppCard>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, paddingBottom: spacing.xxl },
  title: { ...typography.h2, color: colors.text },
  subtitle: { ...typography.body, color: colors.textSecondary, marginBottom: spacing.lg },
  grid: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -spacing.xs },
  sectionTitle: { ...typography.h3, color: colors.text, marginTop: spacing.lg, marginBottom: spacing.md },
  error: { ...typography.bodySmall, color: colors.danger, marginBottom: spacing.md },
  spacer: { height: spacing.sm },
});

export default DashboardScreen;
