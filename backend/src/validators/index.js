const { BLOOD_GROUPS, URGENCY_LEVELS, ROLES, REQUEST_STATUS, DONOR_RESPONSE } = require('../config/constants');

const isNonEmptyString = (v) => typeof v === 'string' && v.trim().length > 0;

const validate = (schema) => (req, _res, next) => {
  const errors = {};

  for (const [field, rule] of Object.entries(schema)) {
    const value = req.body[field];
    const result = rule(value, req.body);
    if (result !== true) errors[field] = result;
  }

  if (Object.keys(errors).length > 0) {
    return next(require('../utils/ApiError').badRequest('Validation failed', errors));
  }
  return next();
};

const required = (field) => (v) => (isNonEmptyString(v) ? true : `${field} is required`);

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^\+?[0-9\s-]{7,20}$/;

const email = (v) => (EMAIL_RE.test(String(v)) ? true : 'Valid email is required');

const isPhone = (v) => (PHONE_RE.test(String(v)) ? true : 'Valid phone number is required');

// Optional email: absent is fine, but a provided value must be a valid address.
const optionalEmail = (v) => (v === undefined || v === null || String(v).trim() === '' ? true : email(v));

// Login accepts either an email or a phone number in a single `identifier` field.
const loginIdentifier = (v, body) => {
  const hasIdentifier = !(v === undefined || v === null || String(v).trim() === '');
  const hasEmail = isNonEmptyString(body.email);
  if (!hasIdentifier) return hasEmail ? true : 'Email or phone is required';
  const value = String(v).trim();
  return EMAIL_RE.test(value) || PHONE_RE.test(value) ? true : 'Enter a valid email or phone number';
};

// Phone is required and must look like a phone number.
const phone = (field) => (v) => {
  const missing = required(field)(v);
  return missing === true ? isPhone(v) : missing;
};

const minLength = (n) => (v) => (String(v).length >= n ? true : `Must be at least ${n} characters`);

const oneOf = (list, name) => (v) => (list.includes(v) ? true : `${name} must be one of: ${list.join(', ')}`);

const optionalOneOf = (list, name) => (v) => (v === undefined || v === null || list.includes(v) ? true : `${name} must be one of: ${list.join(', ')}`);

const isInt = (v) => (Number.isInteger(Number(v)) ? true : 'Must be an integer');

const min = (n) => (v) => (Number(v) >= n ? true : `Must be at least ${n}`);

const isLatitude = (v) => (v >= -90 && v <= 90 ? true : 'Invalid latitude');
const isLongitude = (v) => (v >= -180 && v <= 180 ? true : 'Invalid longitude');

const optionalPair = (a, b, ruleA, ruleB) => (v, body) => {
  if (v === undefined || v === null) return true;
  return ruleA(v) === true && ruleB(body[b]) === true ? true : `Invalid ${a}/${b} coordinates`;
};

const registerSchema = {
  name: required('name'),
  email: email,
  password: minLength(8),
  phone: phone('phone'),
  role: oneOf(Object.values(ROLES).filter((r) => r !== ROLES.ADMIN), 'role'),
  bloodGroup: (v) => (v === undefined || BLOOD_GROUPS.includes(v) ? true : 'Invalid blood group'),
  hospitalName: (v, body) => (body.role !== ROLES.HOSPITAL || isNonEmptyString(v) ? true : 'hospitalName is required for hospital accounts'),
  latitude: (v) => (v === undefined || v === null || v === '' ? true : isLatitude(v)),
  longitude: (v) => (v === undefined || v === null || v === '' ? true : isLongitude(v)),
};

const loginSchema = {
  email: optionalEmail,
  identifier: loginIdentifier,
  password: required('password'),
};

const createRequestSchema = {
  bloodGroup: oneOf(BLOOD_GROUPS, 'bloodGroup'),
  unitsRequired: (v) => (v === undefined ? true : isInt(v) === true && min(1)(v) === true ? true : 'unitsRequired must be a positive integer'),
  urgency: optionalOneOf(Object.values(URGENCY_LEVELS), 'urgency'),
  patientName: (v) => (v === undefined || isNonEmptyString(v) ? true : 'patientName must be a non-empty string'),
  patientAge: (v) => (v === undefined || (Number.isInteger(Number(v)) && Number(v) > 0 && Number(v) < 130) ? true : 'patientAge must be 1-129'),
  notes: (v) => (v === undefined || typeof v === 'string' ? true : 'notes must be a string'),
  latitude: (v) => (v === undefined ? true : isLatitude(v)),
  longitude: (v) => (v === undefined ? true : isLongitude(v)),
};

const updateRequestSchema = {
  status: optionalOneOf(Object.values(REQUEST_STATUS), 'status'),
  unitsRequired: (v) => (v === undefined ? true : isInt(v) === true && min(1)(v) === true ? true : 'unitsRequired must be a positive integer'),
  hospitalId: (v) => (v === undefined || isNonEmptyString(String(v)) ? true : 'hospitalId must be a number'),
};

const donorResponseSchema = {
  response: oneOf(Object.values(DONOR_RESPONSE), 'response'),
};

const availabilitySchema = {
  isAvailable: (v) => (typeof v === 'boolean' ? true : 'isAvailable must be boolean'),
};

const profileSchema = {
  name: (v) => (v === undefined || isNonEmptyString(v) ? true : 'name is required'),
  phone: (v) => (v === undefined || isNonEmptyString(v) ? true : 'phone is required'),
  bloodGroup: optionalOneOf(BLOOD_GROUPS, 'bloodGroup'),
  latitude: (v) => (v === undefined || v === null ? true : isLatitude(v)),
  longitude: (v) => (v === undefined || v === null ? true : isLongitude(v)),
  address: (v) => (v === undefined || typeof v === 'string' ? true : 'address must be a string'),
};

const verificationSchema = {
  donationId: required('donationId'),
  status: optionalOneOf(['approved', 'rejected'], 'status'),
  remarks: (v) => (v === undefined || typeof v === 'string' ? true : 'remarks must be a string'),
};

module.exports = {
  validate,
  rules: { required, email, isPhone, phone, minLength, oneOf, optionalOneOf, isInt, min, isLatitude, isLongitude, optionalPair },
  schemas: {
    registerSchema,
    loginSchema,
    createRequestSchema,
    updateRequestSchema,
    donorResponseSchema,
    availabilitySchema,
    profileSchema,
    verificationSchema,
  },
};
