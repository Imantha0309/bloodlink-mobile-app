import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { AppButton, BloodGroupSelector } from '../../components';
import { colors, typography, radius, spacing } from '../../theme';
import recipientService from '../../services/recipientService';
import { getErrorMessage } from '../../utils/helpers';
import { validate, hasErrors, required, isBloodGroup } from '../../utils/validation';
import { COMPATIBILITY_HINT } from '../../utils/compatibility';

const BloodGroupScreen = ({ navigation }) => {
  const [value, setValue] = useState(null);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [saved, setSaved] = useState(false);

  const save = async () => {
    const nextErrors = validate({ bloodGroup: value }, { bloodGroup: (v) => required(v) || isBloodGroup(v) });
    setErrors(nextErrors);
    if (hasErrors(nextErrors)) return;

    setSaving(true);
    setError(null);
    try {
      await recipientService.updateProfile({ bloodGroup: value });
      setSaved(true);
      navigation.goBack();
    } catch (err) {
      setError(getErrorMessage(err, 'Could not save your blood group'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Save your blood group</Text>
      <Text style={styles.subtitle}>
        Keeping this on your profile lets us pre-fill new requests and warn you if yours is unsafe to donate.
      </Text>

      <BloodGroupSelector value={value} onChange={(v) => { setValue(v); setSaved(false); setError(null); }} error={errors.bloodGroup} />

      {!!value && (
        <View style={styles.hint}>
          <Text style={styles.hintTitle}>Who can donate {value} to you</Text>
          {(COMPATIBILITY_HINT[value] || []).map((group) => (
            <Text key={group} style={styles.hintLine}>{`\u2022 ${group}`}</Text>
          ))}
        </View>
      )}

      {!!error && <Text style={styles.error}>{error}</Text>}
      {saved && <Text style={styles.saved}>Blood group saved</Text>}

      <AppButton title="Save blood group" onPress={save} loading={saving} testID="save-blood-group" />
      <View style={styles.footer}>
        <AppButton title="Not now" variant="ghost" onPress={() => navigation.goBack()} />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, paddingBottom: spacing.xxl },
  title: { ...typography.h2, color: colors.text },
  subtitle: { ...typography.body, color: colors.textSecondary, marginBottom: spacing.xl },
  hint: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  hintTitle: { ...typography.h4, color: colors.text, marginBottom: spacing.sm },
  hintLine: { ...typography.bodySmall, color: colors.textSecondary, lineHeight: 20 },
  error: { ...typography.bodySmall, color: colors.danger, marginBottom: spacing.md },
  saved: { ...typography.bodySmall, color: colors.success, marginBottom: spacing.md },
  footer: { marginTop: spacing.lg, alignItems: 'center' },
});

export default BloodGroupScreen;
