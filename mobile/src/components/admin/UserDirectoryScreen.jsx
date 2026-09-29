import React, { useCallback, useEffect, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { AppButton, AppCard, AppInput, AppModal, Badge, EmptyState, Loading } from '..';
import { colors, typography, spacing } from '../../theme';
import adminService from '../../services/adminService';
import { getErrorMessage, formatDate, titleCase } from '../../utils/helpers';

const UserDirectoryScreen = ({ role, emptyTitle, emptyMessage }) => {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pending, setPending] = useState(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminService.listUsers({ role, search: search.trim() || undefined, limit: 50 });
      setUsers(res.data);
      setError(null);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [role, search]);

  useEffect(() => {
    load();
  }, [load]);

  const toggleActive = async (isActive) => {
    setBusy(true);
    try {
      const updated = await adminService.setUserActive(pending.id, isActive);
      setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
      setPending(null);
    } catch (err) {
      setError(getErrorMessage(err, 'Could not update this account'));
    } finally {
      setBusy(false);
    }
  };

  const renderItem = ({ item }) => (
    <AppCard title={item.name} subtitle={item.email}>
      <View style={styles.metaRow}>
        <Badge
          label={item.isActive ? 'ACTIVE' : 'DISABLED'}
          background={item.isActive ? colors.success : colors.textMuted}
          textColor={colors.textOnPrimary}
        />
        <Badge
          label={titleCase(item.verificationStatus).toUpperCase()}
          background={colors.background}
          textColor={colors.textSecondary}
          style={styles.badgeGap}
        />
      </View>
      <Text style={styles.meta}>{`Phone: ${item.phone || '—'}`}</Text>
      <Text style={styles.meta}>{`Joined: ${formatDate(item.createdAt)}`}</Text>
      <View style={styles.action}>
        <AppButton
          title={item.isActive ? 'Disable account' : 'Enable account'}
          size="sm"
          fullWidth={false}
          variant={item.isActive ? 'outline' : 'primary'}
          onPress={() => setPending(item)}
        />
      </View>
    </AppCard>
  );

  if (loading && users.length === 0) return <Loading label="Loading accounts…" fullScreen />;

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <AppInput
          label="Search"
          value={search}
          onChangeText={setSearch}
          placeholder="Name, email or phone"
          autoCapitalize="none"
        />
      </View>
      {!!error && <Text style={styles.error}>{error}</Text>}
      <FlatList
        data={users}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        keyboardShouldPersistTaps="handled"
        refreshControl={<RefreshControl refreshing={loading} onRefresh={load} tintColor={colors.primary} />}
        ListEmptyComponent={
          loading ? null : (
            <EmptyState icon={'\u{1F465}'} title={emptyTitle} message={emptyMessage} />
          )
        }
      />

      <AppModal
        visible={!!pending}
        title={pending?.isActive ? 'Disable this account?' : 'Enable this account?'}
        message={pending?.isActive
          ? 'They will not be able to sign in or respond to requests until re-enabled.'
          : 'They will be able to sign in again immediately.'}
        confirmTitle={pending?.isActive ? 'Disable' : 'Enable'}
        onConfirm={() => toggleActive(!pending.isActive)}
        onClose={() => setPending(null)}
        loading={busy}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  header: { padding: spacing.lg, paddingBottom: 0 },
  list: { padding: spacing.lg, paddingBottom: spacing.xxl },
  metaRow: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm },
  badgeGap: { marginLeft: spacing.sm },
  meta: { ...typography.bodySmall, color: colors.textSecondary },
  action: { marginTop: spacing.md, alignItems: 'flex-start' },
  error: { ...typography.bodySmall, color: colors.danger, paddingHorizontal: spacing.lg, paddingTop: spacing.sm },
});

export default UserDirectoryScreen;
