import React, { useCallback, useEffect, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { AppButton, AppCard, AppInput, AppModal, EmptyState, InfoRow, Loading } from '../../components';
import { colors, typography, spacing } from '../../theme';
import adminService from '../../services/adminService';
import { getErrorMessage } from '../../utils/helpers';

const AppSettingsScreen = () => {
  const [settings, setSettings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editing, setEditing] = useState(null);
  const [draft, setDraft] = useState('');
  const [saving, setSaving] = useState(false);
  const [removing, setRemoving] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setSettings(await adminService.listSettings());
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

  const save = async () => {
    if (!draft.trim()) return;
    setSaving(true);
    try {
      await adminService.saveSetting(editing.key, draft.trim(), editing.description);
      setEditing(null);
      await load();
    } catch (err) {
      setError(getErrorMessage(err, 'Could not save this setting'));
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    setSaving(true);
    try {
      await adminService.deleteSetting(removing.key);
      setRemoving(null);
      await load();
    } catch (err) {
      setError(getErrorMessage(err, 'Could not delete this setting'));
    } finally {
      setSaving(false);
    }
  };

  const renderItem = ({ item }) => (
    <AppCard>
      <InfoRow label={item.key} value={item.value} />
      {!!item.description && <Text style={styles.description}>{item.description}</Text>}
      <View style={styles.actions}>
        <AppButton
          title="Edit"
          size="sm"
          fullWidth={false}
          variant="outline"
          onPress={() => {
            setEditing(item);
            setDraft(item.value);
          }}
          style={styles.action}
        />
        <AppButton
          title="Delete"
          size="sm"
          fullWidth={false}
          variant="ghost"
          onPress={() => setRemoving(item)}
        />
      </View>
    </AppCard>
  );

  if (loading && settings.length === 0) return <Loading label="Loading settings…" fullScreen />;

  return (
    <View style={styles.screen}>
      <Text style={styles.hint}>Values here are read by the matching service at runtime.</Text>
      {!!error && <Text style={styles.error}>{error}</Text>}
      <FlatList
        data={settings}
        keyExtractor={(item) => item.key}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={load} tintColor={colors.primary} />}
        ListEmptyComponent={
          loading ? null : (
            <EmptyState icon={'\u{2699}'} title="No settings" message="Platform settings configured here will be applied across the app." />
          )
        }
      />

      <AppModal
        visible={!!editing}
        title={editing?.key}
        message={editing?.description}
        confirmTitle="Save"
        onConfirm={save}
        onClose={() => setEditing(null)}
        loading={saving}
      >
        <AppInput label="Value" value={draft} onChangeText={setDraft} autoCapitalize="none" />
      </AppModal>

      <AppModal
        visible={!!removing}
        title={`Delete ${removing?.key}?`}
        message="This setting will be removed from the platform."
        confirmTitle="Delete"
        onConfirm={remove}
        onClose={() => setRemoving(null)}
        loading={saving}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  hint: { ...typography.bodySmall, color: colors.textMuted, paddingHorizontal: spacing.lg, paddingTop: spacing.lg },
  list: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxl },
  description: { ...typography.caption, color: colors.textMuted, marginTop: spacing.xs },
  actions: { flexDirection: 'row', marginTop: spacing.md },
  action: { marginRight: spacing.sm },
  error: { ...typography.bodySmall, color: colors.danger, paddingHorizontal: spacing.lg, paddingBottom: spacing.sm },
});

export default AppSettingsScreen;
