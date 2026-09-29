import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { colors, typography, radius, spacing } from '../../theme';
import { BRAND_NAME, BRAND_TAGLINE } from '../../utils/constants';

/**
 * BloodLink brand mark: a blood drop inside a soft circular field.
 * `size` scales the whole lockup; the wordmark is hidden on the splash-style
 * layout via `showWordmark={false}`.
 */
const Logo = ({ size = 72, showWordmark = true, tagline = false, style }) => {
  const field = size * 1.5;
  const drop = size * 0.62;

  return (
    <View style={[styles.wrapper, { gap: spacing.md }, style]}>
      <View
        style={[
          styles.field,
          { width: field, height: field, borderRadius: field / 2, padding: field * 0.16 },
        ]}
      >
        <MaterialCommunityIcons name="blood-drop" size={drop} color={colors.primary} />
      </View>

      {showWordmark && (
        <View style={styles.text}>
          <Text style={[styles.wordmark, { fontSize: size * 0.42, lineHeight: size * 0.5 }]}>
            {BRAND_NAME}
          </Text>
          {tagline && <Text style={styles.tagline}>{BRAND_TAGLINE}</Text>}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: { alignItems: 'center' },
  field: {
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: { alignItems: 'center' },
  wordmark: { ...typography.h2, color: colors.text, letterSpacing: -0.5 },
  tagline: { ...typography.body, color: colors.textSecondary, marginTop: spacing.xs },
});

export default Logo;
