import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, typography, radius, spacing } from '../../theme';

const options = [
  { key: 'all', label: 'All' },
  { key: 'active', label: 'Active' },
  { key: 'fulfilled', label: 'Fulfilled' },
  { key: 'closed', label: 'Closed' },
];

const FilterTabs = ({ value, onChange, options: customOptions }) => {
  const items = customOptions || options;

  return (
    <View style={styles.container}>
      {items.map((item) => {
        const active = item.key === value;
        return (
          <Pressable
            key={item.key}
            onPress={() => onChange(item.key)}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            style={[styles.tab, active && styles.tabActive]}
          >
            <Text style={[styles.label, active && styles.labelActive]}>{item.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flexDirection: 'row', marginBottom: spacing.md },
  tab: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: spacing.sm,
  },
  tabActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  label: { ...typography.bodySmall, color: colors.textSecondary, fontWeight: '600' },
  labelActive: { color: colors.textOnPrimary },
});

export default FilterTabs;
