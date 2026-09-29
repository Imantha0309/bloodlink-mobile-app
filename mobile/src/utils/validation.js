import { BLOOD_GROUPS, URGENCY_LEVELS } from './constants';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^\+?[0-9\s-]{7,20}$/;

export const required = (value) => {
  if (value === undefined || value === null || String(value).trim() === '') return 'This field is required';
  return null;
};

export const isEmail = (value) => (EMAIL_RE.test(String(value)) ? null : 'Enter a valid email address');

export const isPhone = (value) => (PHONE_RE.test(String(value)) ? null : 'Enter a valid phone number');

/** Login and the register form both accept either an email address or a phone number. */
export const isEmailOrPhone = (value) => {
  const trimmed = String(value).trim();
  if (trimmed === '') return 'Enter your email or phone number';
  if (EMAIL_RE.test(trimmed) || PHONE_RE.test(trimmed)) return null;
  return 'Enter a valid email address or phone number';
};

export const minLength = (n) => (value) =>
  String(value || '').length >= n ? null : `Must be at least ${n} characters`;

export const isBloodGroup = (value) => (BLOOD_GROUPS.includes(value) ? null : 'Select a valid blood group');

export const isUrgency = (value) => (URGENCY_LEVELS.includes(value) ? null : 'Select a valid urgency level');

export const isPositiveInt = (value) =>
  Number.isInteger(Number(value)) && Number(value) > 0 ? null : 'Enter a whole number above zero';

export const isLatitude = (value) =>
  value === undefined || value === null || value === '' ? null : Number(value) >= -90 && Number(value) <= 90
    ? null
    : 'Invalid latitude';

export const isLongitude = (value) =>
  value === undefined || value === null || value === '' ? null : Number(value) >= -180 && Number(value) <= 180
    ? null
    : 'Invalid longitude';

export const isAge = (value) => {
  if (value === undefined || value === null || value === '') return null;
  const n = Number(value);
  return Number.isInteger(n) && n > 0 && n < 130 ? null : 'Enter an age between 1 and 129';
};

/** Terms/privacy consent is a hard gate, so the message is explicit. */
export const isAccepted = (value) => (value ? null : 'You must accept the terms to continue');

/**
 * 0–4 strength score, mirroring the meter in `PasswordStrength` so the
 * validation message and the visual indicator never disagree.
 */
export const passwordScore = (value) => {
  const password = String(value || '');
  if (password.length < 8) return 0;

  let score = 1;
  if (password.length >= 10) score += 1;
  if (password.length >= 13) score += 1;

  const classes = [/[a-z]/, /[A-Z]/, /[0-9]/, /[^A-Za-z0-9]/].filter((re) => re.test(password)).length;
  if (classes >= 3) score += 1;
  if (classes === 4) score += 1;

  return Math.min(score, 4);
};

export const hasWeakPassword = (value) =>
  passwordScore(value) < 2 ? 'Use at least 8 characters with a mix of letters and numbers' : null;

/** Returns `{ field: error }` for every field that fails. Empty object means valid. */
export const validate = (values, rules) =>
  Object.entries(rules).reduce((errors, [field, rule]) => {
    const result = rule(values[field], values);
    if (result) errors[field] = result;
    return errors;
  }, {});

export const hasErrors = (errors) => Object.keys(errors).length > 0;
