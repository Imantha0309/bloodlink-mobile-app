import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import {
  clearError,
  createRequest,
  selectRecipientError,
  selectRecipientSubmitting,
} from '../../store/recipientStore';
import {
  AppButton,
  AppInput,
  AppModal,
  BloodGroupSelector,
  LocationPicker,
  UrgencySelector,
} from '../../components';
import { colors, typography, spacing } from '../../theme';
import { URGENCY_LEVELS } from '../../utils/constants';
import { validate, hasErrors, required, isBloodGroup, isUrgency, isPositiveInt, isAge } from '../../utils/validation';

const UNITS = [1, 2, 3, 4, 5, 6];
const EmergencyRequestScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const submitting = useSelector(selectRecipientSubmitting);
  const error = useSelector(selectRecipientError);

  const [values, setValues] = useState({
    bloodGroup: null,
    unitsRequired: '1',
    urgency: 'high',
    patientName: '',
    patientAge: '',
    notes: '',
  });
  const [coords, setCoords] = useState(null);
  const [errors, setErrors] = useState({});
  const [confirm, setConfirm] = useState(false);

  const rules = {
    bloodGroup: (v) => required(v) || isBloodGroup(v),
    unitsRequired: (v) => required(v) || isPositiveInt(v),
    urgency: (v) => required(v) || isUrgency(v),
    patientAge: isAge,
  };

  const setField = (field) => (value) => {
    setValues((prev) => ({ ...prev, [field]: value }));
    if (error) dispatch(clearError());
  };

  const validateForm = () => {
    const nextErrors = validate(values, rules);
    setErrors(nextErrors);
    return !hasErrors(nextErrors);
  };

  const onSubmit = async () => {
    if (!validateForm()) return;
    setConfirm(true);
  };

  const dispatchSubmit = async () => {
    const result = await dispatch(
      createRequest({
        bloodGroup: values.bloodGroup,
        unitsRequired: Number(values.unitsRequired),
        urgency: values.urgency,
        patientName: values.patientName.trim() || undefined,
        patientAge: values.patientAge ? Number(values.patientAge) : undefined,
        notes: values.notes.trim() || undefined,
        ...(coords || {}),
      })
    );
    setConfirm(false);
    if (createRequest.fulfilled.match(result)) {
      navigation.navigate('MatchingDonors', { id: result.payload.request.id, matchedDonors: result.payload.matchedDonors });
    }
  };

  return (
    <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <BloodGroupSelector value={values.bloodGroup} onChange={setField('bloodGroup')} error={errors.bloodGroup} />

        <Text style={styles.label}>Units needed <Text style={styles.required}>*</Text></Text>
        <View style={styles.unitsRow}>
          {UNITS.map((unit) => {
            const active = String(unit) === String(values.unitsRequired);
            return (
              <AppButton
                key={unit}
                title={String(unit)}
                size="sm"
                fullWidth={false}
                variant={active ? 'primary' : 'outline'}
                onPress={() => setField('unitsRequired')(String(unit))}
                style={styles.unit}
              />
            );
          })}
        </View>
        {!!errors.unitsRequired && <Text style={styles.error}>{errors.unitsRequired}</Text>}

        <UrgencySelector value={values.urgency} onChange={setField('urgency')} error={errors.urgency} />

        <AppInput
          label="Patient name"
          testID="request-patient-name"
          value={values.patientName}
          onChangeText={setField('patientName')}
          placeholder="Optional"
        />
        <AppInput
          label="Patient age"
          testID="request-patient-age"
          value={values.patientAge}
          onChangeText={setField('patientAge')}
          error={errors.patientAge}
          keyboardType="number-pad"
          placeholder="Optional"
        />
        <AppInput
          label="Notes"
          testID="request-notes"
          value={values.notes}
          onChangeText={setField('notes')}
          placeholder="Anything donors should know"
          multiline
        />

        <LocationPicker onSelect={setCoords} />

        <AppButton
          title="Send emergency request"
          size="lg"
          onPress={onSubmit}
          loading={submitting}
          testID="request-submit"
        />
      </ScrollView>

      <AppModal
        visible={confirm}
        title="Confirm request"
        message={`We will alert compatible donors for ${values.bloodGroup} within the area. This is not a guarantee of a match.`}
        confirmTitle="Send request"
        onConfirm={dispatchSubmit}
        onClose={() => setConfirm(false)}
        loading={submitting}
      />
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, paddingBottom: spacing.xxl },
  label: { ...typography.label, color: colors.textSecondary, marginBottom: spacing.sm },
  required: { color: colors.primary },
  unitsRow: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: spacing.lg },
  unit: { marginRight: spacing.sm, marginBottom: spacing.sm, minWidth: 52 },
  error: { ...typography.bodySmall, color: colors.danger, marginTop: -spacing.md, marginBottom: spacing.md },
});

export default EmergencyRequestScreen;
