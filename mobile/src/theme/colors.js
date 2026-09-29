export const colors = {
  primary: '#C62828',
  primaryDark: '#8E1B1B',
  primaryLight: '#FFEBEE',

  secondary: '#0D47A1',
  accent: '#C2185B',

  success: '#2E7D32',
  warning: '#F9A825',
  danger: '#C62828',
  info: '#0277BD',

  background: '#F5F6F8',
  surface: '#FFFFFF',
  border: '#E0E3E7',

  text: '#1A1C1E',
  textSecondary: '#5F6368',
  textMuted: '#9AA0A6',
  textOnPrimary: '#FFFFFF',

  overlay: 'rgba(0, 0, 0, 0.5)',
  transparent: 'transparent',
};

// One colour per blood group, used on badges and group chips.
export const bloodGroupColors = {
  'O-': '#B71C1C',
  'O+': '#C62828',
  'A-': '#1B5E20',
  'A+': '#2E7D32',
  'B-': '#0D47A1',
  'B+': '#1565C0',
  'AB-': '#4A148C',
  'AB+': '#6A1B9A',
};

export const bloodGroups = Object.keys(bloodGroupColors);

export const urgencyColors = {
  critical: colors.danger,
  high: '#EF6C00',
  medium: colors.warning,
  low: colors.success,
};

export const statusColors = {
  pending: colors.textMuted,
  matching: colors.info,
  fulfilled: colors.success,
  cancelled: colors.textMuted,
  expired: colors.textMuted,
};
