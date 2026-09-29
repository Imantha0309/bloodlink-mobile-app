// Mirrors backend/src/services/matchingService.js so the app can show
// compatibility hints without a round trip. Keyed by RECIPIENT group.
const COMPATIBILITY = {
  'O-': ['O-'],
  'O+': ['O-', 'O+'],
  'A-': ['A-', 'O-'],
  'A+': ['A+', 'A-', 'O+', 'O-'],
  'B-': ['B-', 'O-'],
  'B+': ['B+', 'B-', 'O+', 'O-'],
  'AB-': ['AB-', 'A-', 'B-', 'O-'],
  'AB+': ['AB+', 'AB-', 'A+', 'A-', 'B+', 'B-', 'O+', 'O-'],
};

/** Donor groups that may donate to the given recipient group. */
export const compatibleGroups = (recipientGroup) => COMPATIBILITY[recipientGroup] || [];

/** True when a donor with `donorGroup` may donate to a recipient with `recipientGroup`. */
export const canDonateTo = (donorGroup, recipientGroup) =>
  compatibleGroups(recipientGroup).includes(donorGroup);

export const COMPATIBILITY_HINT = COMPATIBILITY;

export default { COMPATIBILITY, compatibleGroups, canDonateTo };
