import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { logout, selectUser } from '../../store/authStore';
import { AppButton, AppCard, AppModal, InfoRow } from '../../components';
import { colors, typography, radius, spacing } from '../../theme';
import { titleCase } from '../../utils/helpers';

const ProfileScreen = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const user = useSelector(selectUser);
  const [confirmLogout, setConfirmLogout] = useState(false);

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{(user?.name || '?').slice(0, 1).toUpperCase()}</Text>
        </View>
        <Text style={styles.name}>{user?.name}</Text>
        <Text style={styles.role}>{titleCase(user?.role)}</Text>
      </View>

      <AppCard title="Account">
        <InfoRow label="Email" value={user?.email} />
        <InfoRow label="Phone" value={user?.phone} />
        <InfoRow label="Status" value={user?.isActive ? 'Active' : 'Disabled'} />
        <InfoRow label="Verification" value={titleCase(user?.verificationStatus)} />
      </AppCard>

      <AppCard title="Preferences">
        <AppButton
          title="Blood group"
          variant="ghost"
          onPress={() => navigation.navigate('BloodGroup')}
        />
        <View style={styles.spacer} />
        <AppButton
          title="Location"
          variant="ghost"
          onPress={() => navigation.navigate('Location')}
        />
      </AppCard>

      <View style={styles.actions}>
        <AppButton title="Sign out" variant="outline" onPress={() => setConfirmLogout(true)} testID="logout" />
      </View>

      <AppModal
        visible={confirmLogout}
        title="Sign out?"
        message="You will need to sign in again to raise new requests."
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
  actions: { marginTop: spacing.lg },
  spacer: { height: spacing.xs },
});

export default ProfileScreen;
