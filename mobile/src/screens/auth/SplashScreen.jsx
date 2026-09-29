import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Logo } from '../../components';
import { colors, typography, spacing } from '../../theme';
import { BRAND_TAGLINE } from '../../utils/constants';

const SplashScreen = () => (
  <SafeAreaView style={styles.screen}>
    <View style={styles.content}>
      <Logo size={76} showWordmark={false} />
      <Text style={styles.name}>BloodLink</Text>
      <Text style={styles.tagline}>{BRAND_TAGLINE}</Text>
    </View>

    <View style={styles.footer}>
      <ActivityIndicator size="small" color={colors.primary} />
      <Text style={styles.status}>Starting up…</Text>
    </View>
  </SafeAreaView>
);

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.surface, justifyContent: 'center' },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing.xl },
  name: { ...typography.h1, color: colors.text, marginTop: spacing.xl, letterSpacing: -0.5 },
  tagline: { ...typography.body, color: colors.textSecondary, marginTop: spacing.xs },
  footer: { alignItems: 'center', paddingBottom: spacing.xxxl, gap: spacing.md },
  status: { ...typography.bodySmall, color: colors.textMuted },
});

export default SplashScreen;
