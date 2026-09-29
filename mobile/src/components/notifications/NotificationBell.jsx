import React from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { colors, typography, radius, spacing, hitSlop } from '../../theme';

const NotificationBell = ({ count = 0, onPress }) => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  const handlePress = () => {
    if (onPress) return onPress();
    return navigation.navigate('Notifications');
  };

  return (
    <Pressable
      onPress={handlePress}
      hitSlop={hitSlop}
      accessibilityRole="button"
      accessibilityLabel={count > 0 ? `Notifications, ${count} unread` : 'Notifications'}
      style={[styles.container, { marginRight: spacing.lg, marginTop: insets.top ? 0 : spacing.sm }]}
    >
      <Text style={styles.icon}>{'\u{1F514}'}</Text>
      {count > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{count > 9 ? '9+' : count}</Text>
        </View>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: { alignSelf: 'flex-end', padding: spacing.xs },
  icon: { fontSize: 20 },
  badge: {
    position: 'absolute',
    top: 0,
    right: 0,
    minWidth: 18,
    height: 18,
    paddingHorizontal: 4,
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: { ...typography.caption, color: colors.textOnPrimary, fontWeight: '700' },
});

export default NotificationBell;
