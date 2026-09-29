import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { colors, typography, radius, spacing } from '../../../theme';

const AppInput = ({
  label,
  value,
  onChangeText,
  error,
  hint,
  required = false,
  secureTextEntry = false,
  multiline = false,
  keyboardType = 'default',
  autoCapitalize = 'sentences',
  editable = true,
  rightAccessory,
  testID,
  ...rest
}) => {
  const [focused, setFocused] = useState(false);

  return (
    <View style={styles.wrapper}>
      {label && (
        <Text style={styles.label}>
          {label}
          {required && <Text style={styles.required}> *</Text>}
        </Text>
      )}
      <View style={[styles.field, focused && styles.fieldFocused, error && styles.fieldError]}>
        <TextInput
          testID={testID}
          style={[
            styles.input,
            multiline && styles.multiline,
            !editable && styles.inputLocked,
            !!rightAccessory && styles.inputWithAccessory,
          ]}
          value={value}
          onChangeText={onChangeText}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholderTextColor={colors.textMuted}
          secureTextEntry={secureTextEntry}
          multiline={multiline}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          editable={editable}
          accessibilityLabel={label}
          {...rest}
        />
        {rightAccessory}
      </View>
      {!!error && <Text style={styles.error}>{error}</Text>}
      {!error && !!hint && <Text style={styles.hint}>{hint}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: { marginBottom: spacing.lg },
  label: { ...typography.label, color: colors.textSecondary, marginBottom: spacing.xs },
  required: { color: colors.primary },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
  },
  fieldFocused: { borderColor: colors.primary },
  fieldError: { borderColor: colors.danger },
  input: {
    ...typography.body,
    color: colors.text,
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    minHeight: 48,
  },
  inputWithAccessory: { paddingRight: spacing.xs },
  inputLocked: { color: colors.textMuted },
  multiline: { minHeight: 96, textAlignVertical: 'top' },
  error: { ...typography.bodySmall, color: colors.danger, marginTop: spacing.xs },
  hint: { ...typography.bodySmall, color: colors.textMuted, marginTop: spacing.xs },
});

export default AppInput;
