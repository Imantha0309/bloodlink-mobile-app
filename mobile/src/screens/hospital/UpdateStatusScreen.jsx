import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { AppButton, AppCard, AppInput, Loading } from '../../components';
import { colors, typography, spacing } from '../../theme';
import hospitalService from '../../services/hospitalService';
import { getErrorMessage } from '../../utils/helpers';
import { REQUEST_STATUS } from '../../utils/constants';

const UpdateStatusScreen = ({ route, navigation }) => {
  const { id, request } = route.params || {};
  const [status, setStatus] = useState(request?.status || REQUEST_STATUS.MATCHING);
  const [units, setUnits] = useState(String(request?.unitsRequired || 1));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [saved, setSaved] = useState(false);

  const save = async () => {
    setSaving(true);
    setError(null);
    try {
      await hospitalService.updateRequestStatus(id, {
        status,
        unitsRequired: Number(units),
      });
      setSaved(true);
    } catch (err) {
      setError(getErrorMessage(err, 'Could not update the request'));
    } finally {
      setSaving(false);
    }
  };

  if (!id) return <Loading label="No request selected" fullScreen />;

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Update request status</Text>
      <Text style={styles.subtitle}>Changes are visible to the recipient immediately.</Text>

      {!!error && <Text style={styles.banner}>{error}</Text>}
      {saved && <Text style={styles.saved}>Request updated</Text>}

      <Text style={styles.label}>Status</Text>
      <View style={styles.options}>
        {Object.values(REQUEST_STATUS).map((option) => {
          const active = option === status;
          return (
            <AppButton
              key={option}
              title={option.charAt(0).toUpperCase() + option.slice(1)}
              size="sm"
              fullWidth={false}
              variant={active ? 'primary' : 'outline'}
              onPress={() => setStatus(option)}
              style={styles.option}
            />
          );
        })}
      </View>

      <AppInput
        label="Units required"
        value={units}
        onChangeText={setUnits}
        keyboardType="number-pad"
      />

      <AppButton title="Save update" onPress={save} loading={saving} testID="save-status" />
      <View style={styles.footer}>
        <AppButton title="Done" variant="ghost" onPress={() => navigation.goBack()} />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, paddingBottom: spacing.xxl },
  title: { ...typography.h2, color: colors.text },
  subtitle: { ...typography.body, color: colors.textSecondary, marginBottom: spacing.xl },
  label: { ...typography.label, color: colors.textSecondary, marginBottom: spacing.sm },
  options: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: spacing.lg },
  option: { marginRight: spacing.sm, marginBottom: spacing.sm },
  banner: {
    ...typography.bodySmall,
    color: colors.danger,
    backgroundColor: colors.primaryLight,
    padding: spacing.md,
    borderRadius: 8,
    marginBottom: spacing.lg,
  },
  saved: { ...typography.bodySmall, color: colors.success, marginBottom: spacing.md },
  footer: { marginTop: spacing.lg, alignItems: 'center' },
});

export default UpdateStatusScreen;
