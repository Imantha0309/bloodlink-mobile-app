import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, typography, radius, spacing, elevation } from '../../../theme';

const AppCard = ({ title, subtitle, right, onPress, children, style, testID }) => {
  const content = (
    <View style={[styles.card, style]}>
      {(title || right) && (
        <View style={styles.header}>
          <View style={styles.headerText}>
            {!!title && <Text style={styles.title}>{title}</Text>}
            {!!subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
          </View>
          {right}
        </View>
      )}
      {children}
    </View>
  );

  if (!onPress) return <View testID={testID}>{content}</View>;

  return (
    <Pressable testID={testID} accessibilityRole="button" onPress={onPress}>
      {content}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    ...elevation.low,
  },
  header: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  headerText: { flex: 1, paddingRight: spacing.sm },
  title: { ...typography.h4, color: colors.text },
  subtitle: { ...typography.bodySmall, color: colors.textSecondary, marginTop: spacing.xxs },
});

export default AppCard;
