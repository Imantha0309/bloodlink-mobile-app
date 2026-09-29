import React, { useState } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import AppInput from './AppInput';
import { colors, spacing } from '../../theme';

/**
 * AppInput with a show/hide toggle wired to `secureTextEntry`.
 * The toggle is a 44px touch target even though the glyph itself is smaller.
 */
const PasswordInput = ({ value, onChangeText, error, testID, ...rest }) => {
  const [visible, setVisible] = useState(false);

  return (
    <AppInput
      {...rest}
      testID={testID}
      value={value}
      onChangeText={onChangeText}
      error={error}
      secureTextEntry={!visible}
      autoCapitalize="none"
      rightAccessory={
        <Pressable
          testID={testID ? `${testID}-toggle` : undefined}
          accessibilityRole="button"
          accessibilityLabel={visible ? 'Hide password' : 'Show password'}
          onPress={() => setVisible((prev) => !prev)}
          style={styles.toggle}
          hitSlop={{ top: spacing.sm, bottom: spacing.sm, left: spacing.sm, right: spacing.sm }}
        >
          <MaterialCommunityIcons
            name={visible ? 'eye-off-outline' : 'eye-outline'}
            size={20}
            color={colors.textMuted}
          />
        </Pressable>
      }
    />
  );
};

const styles = StyleSheet.create({
  toggle: { minWidth: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center' },
});

export default PasswordInput;
