import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useDispatch } from 'react-redux';
import { AppButton } from '../../components';
import { colors, typography, radius, spacing, elevation } from '../../theme';
import { ROLES } from '../../utils/constants';

const OPTIONS = [
  {
    role: ROLES.RECIPIENT,
    icon: 'account-heart-outline',
    title: 'Recipient',
    description: 'Request blood for a patient and get matched with nearby donors.',
  },
  {
    role: ROLES.DONOR,
    icon: 'hand-heart-outline',
    title: 'Donor',
    description: 'Get alerted to matching requests and help save lives.',
  },
  {
    role: ROLES.HOSPITAL,
    icon: 'hospital-building',
    title: 'Hospital / Blood Bank',
    description: 'Manage incoming requests and verify donations at your facility.',
  },
];

const RoleSelectionScreen = ({ navigation }) => {
  const [selected, setSelected] = useState(ROLES.RECIPIENT);

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>How will you use BloodLink?</Text>
        <Text style={styles.subtitle}>
          Select the account type that best describes you. You can update this later in your profile.
        </Text>

        {OPTIONS.map((option) => {
          const active = option.role === selected;
          return (
            <Pressable
              key={option.role}
              testID={`role-option-${option.role}`}
              onPress={() => setSelected(option.role)}
              accessibilityRole="radio"
              accessibilityState={{ selected: active }}
              accessibilityLabel={option.title}
              style={({ pressed }) => [styles.card, active && styles.cardActive, pressed && styles.cardPressed]}
            >
              <View style={[styles.iconField, active && styles.iconFieldActive]}>
                <MaterialCommunityIcons
                  name={option.icon}
                  size={26}
                  color={active ? colors.primary : colors.textSecondary}
                />
              </View>

              <View style={styles.cardText}>
                <Text style={[styles.cardTitle, active && styles.cardTitleActive]}>{option.title}</Text>
                <Text style={styles.cardDescription}>{option.description}</Text>
              </View>

              <View style={[styles.radio, active && styles.radioActive]}>
                {active && <MaterialCommunityIcons name="check" size={14} color={colors.textOnPrimary} />}
              </View>
            </Pressable>
          );
        })}
      </ScrollView>

      <View style={styles.footer}>
        <AppButton
          title="Continue"
          size="lg"
          testID="role-continue"
          onPress={() => navigation.navigate('Register', { role: selected })}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.surface },
  content: { padding: spacing.xl, paddingTop: spacing.xl, paddingBottom: spacing.lg },
  title: { ...typography.h2, color: colors.text },
  subtitle: { ...typography.body, color: colors.textSecondary, marginTop: spacing.xs, marginBottom: spacing.xl },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderColor: colors.border,
    padding: spacing.lg,
    marginBottom: spacing.md,
    minHeight: 88,
    ...elevation.low,
  },
  cardActive: { borderColor: colors.primary, backgroundColor: colors.primaryLight },
  cardPressed: { opacity: 0.9 },
  iconField: {
    width: 52,
    height: 52,
    borderRadius: radius.md,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconFieldActive: { backgroundColor: colors.surface },
  cardText: { flex: 1, marginHorizontal: spacing.md },
  cardTitle: { ...typography.h4, color: colors.text },
  cardTitleActive: { color: colors.primaryDark },
  cardDescription: { ...typography.bodySmall, color: colors.textSecondary, marginTop: spacing.xxs },
  radio: {
    width: 24,
    height: 24,
    borderRadius: radius.pill,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  footer: {
    padding: spacing.xl,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
  },
});

export default RoleSelectionScreen;
