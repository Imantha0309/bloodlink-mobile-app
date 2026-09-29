import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchDonorProfile,
  selectDonorError,
  selectDonorProfile,
  setAvailability,
} from '../../store/donorStore';
import { AppButton, AppCard, BloodGroupSelector, InfoRow, Loading } from '../../components';
import { colors, typography, radius, spacing } from '../../theme';
import donorService from '../../services/donorService';
import { getErrorMessage, formatDate } from '../../utils/helpers';
import { validate, hasErrors, required, isBloodGroup } from '../../utils/validation';

const AvailabilityScreen = () => {
  const dispatch = useDispatch();
  const profile = useSelector(selectDonorProfile);
  const error = useSelector(selectDonorError);

  const [group, setGroup] = useState(null);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);

  useEffect(() => {
    if (profile?.bloodGroup) setGroup(profile.bloodGroup);
  }, [profile?.bloodGroup]);

  const saveGroup = async () => {
    const nextErrors = validate({ bloodGroup: group }, { bloodGroup: (v) => required(v) || isBloodGroup(v) });
    setErrors(nextErrors);
    if (hasErrors(nextErrors)) return;

    setSaving(true);
    setSaveError(null);
    try {
      await donorService.updateProfile({ bloodGroup: group });
      dispatch(fetchDonorProfile());
    } catch (err) {
      setSaveError(getErrorMessage(err, 'Could not save your blood group'));
    } finally {
      setSaving(false);
    }
  };

  if (!profile) return <Loading label="Loading your profile…" fullScreen />;

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Donation availability</Text>
      <Text style={styles.subtitle}>
        You will only be matched to requests while you are available, and only if your blood group is compatible.
      </Text>

      <View style={styles.switchCard}>
        <View style={styles.switchText}>
          <Text style={styles.switchTitle}>{profile.isAvailable ? 'Available to donate' : 'Not available'}</Text>
          <Text style={styles.switchSubtitle}>
            {profile.isAvailable
              ? 'Matching requests will appear in your feed.'
              : 'Turn this on when you are ready to donate.'}
          </Text>
        </View>
        <Switch
          value={Boolean(profile.isAvailable)}
          onValueChange={(next) => dispatch(setAvailability(next))}
          trackColor={{ true: colors.primary, false: colors.border }}
          thumbColor={colors.surface}
          accessibilityLabel="Availability toggle"
        />
      </View>

      <AppCard title="Your details">
        <InfoRow label="Blood group" value={profile.bloodGroup} />
        <InfoRow label="Total donations" value={profile.totalDonations} />
        <InfoRow label="Last donation" value={profile.lastDonationDate ? formatDate(profile.lastDonationDate) : 'None yet'} />
        {!!error && <Text style={styles.error}>{error}</Text>}
      </AppCard>

      <BloodGroupSelector
        value={group}
        onChange={(v) => {
          setGroup(v);
          setSaveError(null);
        }}
        label="Update blood group"
        error={errors.bloodGroup}
      />
      {!!saveError && <Text style={styles.error}>{saveError}</Text>}

      <AppButton title="Save blood group" onPress={saveGroup} loading={saving} />

      <View style={styles.notice}>
        <Text style={styles.noticeText}>
          Blood groups can only be changed by a verified Bloodlink administrator. Contact support if the value above is wrong.
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, paddingBottom: spacing.xxl },
  title: { ...typography.h2, color: colors.text },
  subtitle: { ...typography.body, color: colors.textSecondary, marginBottom: spacing.xl },
  switchCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  switchText: { flex: 1, marginRight: spacing.lg },
  switchTitle: { ...typography.h4, color: colors.text },
  switchSubtitle: { ...typography.bodySmall, color: colors.textSecondary, marginTop: spacing.xxs },
  error: { ...typography.bodySmall, color: colors.danger, marginTop: spacing.sm },
  notice: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    marginTop: spacing.lg,
  },
  noticeText: { ...typography.caption, color: colors.textMuted },
});

export default AvailabilityScreen;
