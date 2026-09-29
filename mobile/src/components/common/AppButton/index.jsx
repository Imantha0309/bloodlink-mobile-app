import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, typography, radius, spacing } from '../../../theme';

const VARIANTS = {
  primary: { background: colors.primary, text: colors.textOnPrimary, border: colors.primary },
  secondary: { background: colors.secondary, text: colors.textOnPrimary, border: colors.secondary },
  outline: { background: colors.transparent, text: colors.primary, border: colors.primary },
  ghost: { background: colors.transparent, text: colors.secondary, border: colors.transparent },
  danger: { background: colors.danger, text: colors.textOnPrimary, border: colors.danger },
};

const SIZES = {
  sm: { paddingVertical: spacing.sm, paddingHorizontal: spacing.lg, fontSize: 13 },
  md: { paddingVertical: spacing.md, paddingHorizontal: spacing.lg, fontSize: 15 },
  lg: { paddingVertical: spacing.lg, paddingHorizontal: spacing.xl, fontSize: 17 },
};

const AppButton = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  fullWidth = true,
  style,
  testID,
}) => {
  const palette = VARIANTS[variant] || VARIANTS.primary;
  const dimensions = SIZES[size] || SIZES.md;
  const isDisabled = disabled || loading;

  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      accessibilityLabel={title}
      onPress={isDisabled ? undefined : onPress}
      style={({ pressed }) => [
        styles.base,
        {
          backgroundColor: palette.background,
          borderColor: palette.border,
          paddingVertical: dimensions.paddingVertical,
          paddingHorizontal: dimensions.paddingHorizontal,
          opacity: isDisabled ? 0.5 : pressed ? 0.85 : 1,
          alignSelf: fullWidth ? 'stretch' : 'flex-start',
        },
        style,
      ]}
    >
      <View style={styles.content}>
        {loading && <ActivityIndicator size="small" color={palette.text} style={styles.spinner} />}
        <Text style={[styles.label, typography.button, { color: palette.text, fontSize: dimensions.fontSize }]}>
          {title}
        </Text>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  content: { flexDirection: 'row', alignItems: 'center' },
  label: { textAlign: 'center' },
  spinner: { marginRight: spacing.sm },
});

export default AppButton;
