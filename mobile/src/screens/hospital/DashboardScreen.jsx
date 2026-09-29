import React, { useCallback, useEffect, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { AppButton, AppCard, StatCard } from '../../components';
import { colors, typography, spacing } from '../../theme';
import hospitalService from '../../services/hospitalService';
import { getErrorMessage } from '../../utils/helpers';

const DashboardScreen = () => {
  const navigation = useNavigation();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setStats(await hospitalService.getDashboard());
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

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={loading} onRefresh={load} tintColor={colors.primary} />}
    >
      <Text style={styles.title}>Hospital dashboard</Text>
      <Text style={styles.subtitle}>Requests and verification activity across Bloodlink</Text>

      {!!error && <Text style={styles.error}>{error}</Text>}

      <View style={styles.grid}>
        <StatCard label="Total requests" value={stats?.totalRequests ?? '—'} />
        <StatCard label="In progress" value={stats?.pending ?? '—'} tone={colors.info} />
        <StatCard label="Fulfilled" value={stats?.fulfilled ?? '—'} tone={colors.success} />
        <StatCard label="Available donors" value={stats?.availableDonors ?? '—'} tone={colors.primary} />
        <StatCard label="Registered users" value={stats?.users ?? '—'} />
        <StatCard label="Hospitals" value={stats?.hospitals ?? '—'} />
      </View>

      <Text style={styles.sectionTitle}>Quick actions</Text>
      <AppCard>
        <AppButton title="Browse requests" onPress={() => navigation.navigate('Requests')} />
        <View style={styles.spacer} />
        <AppButton title="Scan donor QR code" variant="outline" onPress={() => navigation.navigate('QRScanner')} />
        <View style={styles.spacer} />
        <AppButton title="Verification history" variant="ghost" onPress={() => navigation.navigate('Verification')} />
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
