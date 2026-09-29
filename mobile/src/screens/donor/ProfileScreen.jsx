import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { fetchDonorProfile, selectDonorProfile } from '../../store/donorStore';
import { logout, selectUser } from '../../store/authStore';
import { AppButton, AppCard, AppInput, AppModal, InfoRow, Loading } from '../../components';
import { colors, typography, radius, spacing } from '../../theme';
import donorService from '../../services/donorService';
import { getErrorMessage, formatDate, titleCase } from '../../utils/helpers';
import { validate, hasErrors, isPhone, minLength } from '../../utils/validation';

const ProfileScreen = () => {
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const profile = useSelector(selectDonorProfile);
  const [confirmLogout, setConfirmLogout] = useState(false);
  const [values, setValues] = useState({ name: '', phone: '' });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (user) setValues({ name: user.name || '', phone: user.phone || '' });
  }, [user]);

  useEffect(() => {
    dispatch(fetchDonorProfile());
  }, [dispatch]);

  if (!user) return <Loading fullScreen />;

  const save = async () => {
    const nextErrors = validate(values, {
      name: (v) => minLength(2)(v),
      phone: isPhone,
    });
    setErrors(nextErrors);
    if (hasErrors(nextErrors)) return;

    setSaving(true);
    setError(null);
    try {
      await donorService.updateProfile({ name: values.name.trim(), phone: values.phone.trim() });
      setSaved(true);
    } catch (err) {
      setError(getErrorMessage(err, 'Could not save your details'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{(user.name || '?').slice(0, 1).toUpperCase()}</Text>
        </View>
        <Text style={styles.name}>{user.name}</Text>
        <Text style={styles.role}>{titleCase(user.role)}</Text>
      </View>

      <AppCard title="Donation record">
        <InfoRow label="Blood group" value={profile?.bloodGroup} />
        <InfoRow label="Total donations" value={profile?.totalDonations ?? 0} />
        <InfoRow
          label="Last donation"
          value={profile?.lastDonationDate ? formatDate(profile.lastDonationDate) : 'None yet'}
        />
        <InfoRow label="Verification" value={titleCase(user.verificationStatus)} />
      </AppCard>

      <AppCard title="Edit details">
        <AppInput
          label="Full name"
          value={values.name}
          onChangeText={(v) => setValues((p) => ({ ...p, name: v }))}
          error={errors.name}
          autoCapitalize="words"
        />
        <AppInput
          label="Phone number"
          value={values.phone}
          onChangeText={(v) => setValues((p) => ({ ...p, phone: v }))}
          error={errors.phone}
          keyboardType="phone-pad"
        />
        {!!error && <Text style={styles.error}>{error}</Text>}
        {saved && <Text style={styles.saved}>Details saved</Text>}
        <AppButton title="Save changes" onPress={save} loading={saving} size="sm" />
      </AppCard>

      <View style={styles.actions}>
        <AppButton title="Sign out" variant="outline" onPress={() => setConfirmLogout(true)} testID="logout" />
      </View>

      <AppModal
        visible={confirmLogout}
        title="Sign out?"
        message="You will need to sign in again to respond to requests."
        confirmTitle="Sign out"
        onConfirm={async () => {
          setConfirmLogout(false);
          await dispatch(logout());
        }}
        onClose={() => setConfirmLogout(false)}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, paddingBottom: spacing.xxl },
  header: { alignItems: 'center', marginBottom: spacing.xl },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  avatarText: { ...typography.h1, color: colors.textOnPrimary },
  name: { ...typography.h2, color: colors.text },
  role: { ...typography.body, color: colors.textSecondary, marginTop: spacing.xxs },
  error: { ...typography.bodySmall, color: colors.danger, marginBottom: spacing.sm },
  saved: { ...typography.bodySmall, color: colors.success, marginBottom: spacing.sm },
  actions: { marginTop: spacing.lg },
});

export default ProfileScreen;
