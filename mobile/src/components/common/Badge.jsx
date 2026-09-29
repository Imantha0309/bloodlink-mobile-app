import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { bloodGroupColors, colors, typography, radius, spacing } from '../../theme';

const Badge = ({ label, background = colors.background, textColor = colors.textSecondary, style }) => (
  <View style={[styles.badge, { backgroundColor: background }, style]}>
    <Text style={[styles.text, { color: textColor }]}>{label}</Text>
  </View>
);

export const BloodGroupBadge = ({ group, size = 'md' }) => {
  const color = bloodGroupColors[group] || colors.textMuted;
  return (
    <View
      style={[
        styles.group,
        { backgroundColor: color, width: size === 'lg' ? 64 : 48, height: size === 'lg' ? 64 : 48 },
      ]}
      accessibilityLabel={`Blood group ${group}`}
    >
      <Text style={[styles.groupText, size === 'lg' && styles.groupTextLarge]}>{group}</Text>
    </View>
  );
};

export const StatusBadge = ({ status }) => (
  <Badge
    label={String(status || '').toUpperCase()}
    background={colors.primaryLight}
    textColor={colors.primary}
  />
);

export const UrgencyBadge = ({ urgency }) => {
  const map = {
    critical: { bg: '#FFEBEE', fg: '#B71C1C' },
    high: { bg: '#FFF3E0', fg: '#E65100' },
    medium: { bg: '#FFF8E1', fg: '#F57F17' },
    low: { bg: '#E8F5E9', fg: '#2E7D32' },
  };
  const { bg, fg } = map[urgency] || map.low;
  return <Badge label={String(urgency || '').toUpperCase()} background={bg} textColor={fg} />;
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
    alignSelf: 'flex-start',
  },
  text: { ...typography.caption, fontWeight: '700', letterSpacing: 0.5 },
  group: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.md,
    alignSelf: 'flex-start',
  },
  groupText: { ...typography.h4, color: colors.textOnPrimary, fontWeight: '700' },
  groupTextLarge: { fontSize: 22, fontWeight: '700' },
});

export default Badge;
