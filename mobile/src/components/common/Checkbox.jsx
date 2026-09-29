import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { colors, typography, radius, spacing } from '../../theme';

const Checkbox = ({ label, value, onChange, error, testID }) => (
  <View style={styles.wrapper}>
    <Pressable
      testID={testID}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: !!value }}
      accessibilityLabel={label}
      onPress={() => onChange(!value)}
      style={styles.row}
    >
      <View style={[styles.box, value && styles.boxChecked, error && styles.boxError]}>
        {!!value && <MaterialCommunityIcons name="check" size={16} color={colors.textOnPrimary} />}
      </View>
      <Text style={styles.label}>{label}</Text>
    </Pressable>
    {!!error && <Text style={styles.error}>{error}</Text>}
  </View>
);

const styles = StyleSheet.create({
  wrapper: { marginBottom: spacing.md },
  row: { flexDirection: 'row', alignItems: 'flex-start', minHeight: 44 },
  box: {
    width: 22,
    height: 22,
    borderRadius: radius.sm,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  boxChecked: { backgroundColor: colors.primary, borderColor: colors.primary },
  boxError: { borderColor: colors.danger },
  label: { ...typography.bodySmall, color: colors.textSecondary, flex: 1, marginLeft: spacing.md },
  error: { ...typography.bodySmall, color: colors.danger, marginTop: spacing.xs, marginLeft: 34 },
});

export default Checkbox;
