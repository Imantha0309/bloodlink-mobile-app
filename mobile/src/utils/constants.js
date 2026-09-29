import Constants from 'expo-constants';

export const BRAND_NAME = 'BloodLink';
export const BRAND_TAGLINE = 'Connecting Blood. Saving Lives.';

export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL ||
  (Constants.expoConfig?.hostUri
    ? `http://${Constants.expoConfig.hostUri.split(':')[0]}:4000/api`
    : 'http://localhost:4000/api');

export const STORAGE_KEYS = {
  TOKEN: '@bloodlink/token',
  USER: '@bloodlink/user',
};

export const ROLES = {
  DONOR: 'donor',
  RECIPIENT: 'recipient',
  HOSPITAL: 'hospital',
  ADMIN: 'admin',
};

export const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export const URGENCY_LEVELS = ['critical', 'high', 'medium', 'low'];

export const REQUEST_STATUS = {
  PENDING: 'pending',
  MATCHING: 'matching',
  FULFILLED: 'fulfilled',
  CANCELLED: 'cancelled',
  EXPIRED: 'expired',
};

export const DONOR_RESPONSE = {
  PENDING: 'pending',
  ACCEPTED: 'accepted',
  DECLINED: 'declined',
};

export const TIMEOUT_MS = 15000;

export const MAPS = {
  DEFAULT_REGION: {
    latitude: -26.2041,
    longitude: 28.0473,
    latitudeDelta: 0.2,
    longitudeDelta: 0.2,
  },
  MATCH_RADIUS_KM: 50,
};
