import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { clearError, register, selectAuthError, selectAuthLoading } from '../../store/authStore';
import {
  AppButton,
  AppInput,
  BloodGroupSelector,
  Checkbox,
  LocationPicker,
  PasswordInput,
  PasswordStrength,
} from '../../components';
import { colors, typography, radius, spacing } from '../../theme';
import { ROLES } from '../../utils/constants';
import { titleCase } from '../../utils/helpers';
import {
  validate,
  hasErrors,
  required,
  isEmail,
  isPhone,
  minLength,
  isBloodGroup,
  isAccepted,
  hasWeakPassword,
} from '../../utils/validation';

const RegisterScreen = ({ route, navigation }) => {
  const { role = ROLES.RECIPIENT } = route.params || {};
  const dispatch = useDispatch();
  const loading = useSelector(selectAuthLoading);
  const error = useSelector(selectAuthError);

  const [values, setValues] = useState({
    name: '',
    hospitalName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    bloodGroup: null,
    location: null,
    terms: false,
  });
  const [errors, setErrors] = useState({});

  const isHospital = role === ROLES.HOSPITAL;
  const needsBloodGroup = role === ROLES.DONOR || role === ROLES.RECIPIENT;

  const rules = {
    name: (v) => required(v) || minLength(isHospital ? 3 : 2)(v),
    ...(isHospital ? { hospitalName: (v) => required(v) || minLength(2)(v) } : {}),
    email: (v) => required(v) || isEmail(v),
    phone: (v) => required(v) || isPhone(v),
    password: (v) => required(v) || minLength(8)(v) || hasWeakPassword(v),
    confirmPassword: (v) => (v !== values.password ? 'Passwords do not match' : null),
    ...(needsBloodGroup ? { bloodGroup: (v) => required(v) || isBloodGroup(v) } : {}),
    terms: isAccepted,
  };

  const setField = (field) => (value) => {
    setValues((prev) => ({ ...prev, [field]: value }));
    if (error) dispatch(clearError());
  };

  const onSubmit = async () => {
    const nextErrors = validate(values, rules);
    setErrors(nextErrors);
    if (hasErrors(nextErrors)) return;

    await dispatch(
      register({
        name: values.name.trim(),
        email: values.email.trim(),
        phone: values.phone.trim(),
        password: values.password,
        role,
        ...(needsBloodGroup && values.bloodGroup ? { bloodGroup: values.bloodGroup } : {}),
        ...(isHospital ? { hospitalName: values.hospitalName.trim() } : {}),
        ...(values.location
          ? { latitude: values.location.latitude, longitude: values.location.longitude }
          : {}),
      })
    );
  };

  return (
    <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Create Your Account</Text>
        <Text style={styles.subtitle}>Join BloodLink and help connect people with blood donors</Text>
        <Text style={styles.role}>Registering as {titleCase(role)}</Text>

        {!!error && (
          <View style={styles.banner}>
            <Text style={styles.bannerText}>{error}</Text>
          </View>
        )}

        <AppInput
          label={isHospital ? 'Contact person' : 'Full name'}
          testID="register-name"
          value={values.name}
          onChangeText={setField('name')}
          error={errors.name}
          autoCapitalize="words"
          autoComplete="name"
        />

        {isHospital && (
          <AppInput
            label="Facility name"
            testID="register-hospital"
            value={values.hospitalName}
            onChangeText={setField('hospitalName')}
            error={errors.hospitalName}
            placeholder="e.g. City Hospital"
            autoCapitalize="words"
          />
        )}

        <AppInput
          label="Email"
          testID="register-email"
          value={values.email}
          onChangeText={setField('email')}
          error={errors.email}
          placeholder="you@example.com"
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
        />

        <AppInput
          label="Phone number"
          testID="register-phone"
          value={values.phone}
          onChangeText={setField('phone')}
          error={errors.phone}
          placeholder="+27 82 123 4567"
          keyboardType="phone-pad"
          autoComplete="tel"
        />

        {needsBloodGroup && (
          <BloodGroupSelector
            value={values.bloodGroup}
            onChange={setField('bloodGroup')}
            error={errors.bloodGroup}
          />
        )}

        <LocationPicker onSelect={setField('location')} />

        <PasswordInput
          label="Password"
          testID="register-password"
          value={values.password}
          onChangeText={setField('password')}
          error={errors.password}
        />
        <PasswordStrength value={values.password} />

        <PasswordInput
          label="Confirm password"
          testID="register-confirm"
          value={values.confirmPassword}
          onChangeText={setField('confirmPassword')}
          error={errors.confirmPassword}
        />

        <Checkbox
          testID="register-terms"
          value={values.terms}
          onChange={setField('terms')}
          error={errors.terms}
          label="I agree to the BloodLink Terms of Service and Privacy Policy, and consent to being contacted about blood requests."
        />

        <AppButton title="Create Account" size="lg" onPress={onSubmit} loading={loading} testID="register-submit" />

        <View style={styles.footer}>
          <AppButton
            title="Already have an account? Login"
            variant="ghost"
            onPress={() => {
              dispatch(clearError());
              navigation.goBack();
            }}
            testID="register-login"
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.surface },
  content: { padding: spacing.xl, paddingTop: spacing.xl, paddingBottom: spacing.xxl },
  title: { ...typography.h1, color: colors.text },
  subtitle: { ...typography.body, color: colors.textSecondary, marginTop: spacing.xxs },
  role: {
    ...typography.label,
    color: colors.primary,
    marginTop: spacing.md,
    marginBottom: spacing.xl,
    alignSelf: 'flex-start',
    backgroundColor: colors.primaryLight,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    overflow: 'hidden',
  },
  banner: {
    backgroundColor: colors.primaryLight,
    borderLeftWidth: 3,
    borderLeftColor: colors.danger,
    borderRadius: radius.sm,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  bannerText: { ...typography.bodySmall, color: colors.danger },
  footer: { marginTop: spacing.sm, alignItems: 'center' },
});

export default RegisterScreen;
