import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { clearError, login, selectAuthError, selectAuthLoading } from '../../store/authStore';
import { AppButton, AppInput, Logo, PasswordInput } from '../../components';
import { colors, typography, radius, spacing } from '../../theme';
import { validate, hasErrors, required, isEmailOrPhone, minLength } from '../../utils/validation';

const rules = {
  identifier: (v) => required(v) || isEmailOrPhone(v),
  password: (v) => required(v) || minLength(8)(v),
};

const LoginScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const loading = useSelector(selectAuthLoading);
  const error = useSelector(selectAuthError);

  const [values, setValues] = useState({ identifier: '', password: '' });
  const [errors, setErrors] = useState({});

  const setField = (field) => (value) => {
    setValues((prev) => ({ ...prev, [field]: value }));
    if (error) dispatch(clearError());
  };

  const onSubmit = async () => {
    const nextErrors = validate(values, rules);
    setErrors(nextErrors);
    if (hasErrors(nextErrors)) return;
    await dispatch(login({ identifier: values.identifier.trim(), password: values.password }));
  };

  return (
    <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Logo size={64} showWordmark={false} />
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>Sign in to continue</Text>
        </View>

        {!!error && (
          <View style={styles.banner}>
            <Text style={styles.bannerText}>{error}</Text>
          </View>
        )}

        <AppInput
          label="Email or phone"
          testID="login-identifier"
          value={values.identifier}
          onChangeText={setField('identifier')}
          error={errors.identifier}
          placeholder="you@example.com"
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="username"
        />

        <PasswordInput
          label="Password"
          testID="login-password"
          value={values.password}
          onChangeText={setField('password')}
          error={errors.password}
        />

        <View style={styles.forgotRow}>
          <Pressable
            accessibilityRole="link"
            accessibilityLabel="Forgot password"
            accessibilityState={{ disabled: true }}
            disabled
            style={styles.forgot}
          >
            <Text style={styles.forgotText}>Forgot Password?</Text>
          </Pressable>
        </View>

        <AppButton title="Login" size="lg" onPress={onSubmit} loading={loading} testID="login-submit" />

        <View style={styles.footer}>
          <AppButton
            title="Create Account"
            variant="outline"
            onPress={() => {
              dispatch(clearError());
              navigation.navigate('RoleSelection');
            }}
            testID="login-create-account"
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.surface },
  content: { flexGrow: 1, padding: spacing.xl, paddingTop: spacing.xxl, justifyContent: 'center' },
  header: { alignItems: 'center', marginBottom: spacing.xl },
  title: { ...typography.h1, color: colors.text, marginTop: spacing.lg, textAlign: 'center' },
  subtitle: { ...typography.body, color: colors.textSecondary, marginTop: spacing.xxs },
  banner: {
    backgroundColor: colors.primaryLight,
    borderLeftWidth: 3,
    borderLeftColor: colors.danger,
    borderRadius: radius.sm,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  bannerText: { ...typography.bodySmall, color: colors.danger },
  forgotRow: { alignItems: 'flex-end', marginTop: -spacing.sm, marginBottom: spacing.lg },
  forgot: { minHeight: 44, justifyContent: 'center', paddingHorizontal: spacing.xs },
  forgotText: { ...typography.bodySmall, color: colors.textMuted, textDecorationLine: 'line-through' },
  footer: { marginTop: spacing.lg },
});

export default LoginScreen;
