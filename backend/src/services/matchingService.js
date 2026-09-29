// Keyed by RECIPIENT group, listing the donor groups that may donate to it.
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

const canDonateTo = (donorGroup, recipientGroup) =>
  (COMPATIBILITY[recipientGroup] || []).includes(donorGroup);

/** Donor blood groups that are compatible with the given recipient group. */
const compatibleGroups = (recipientGroup) => COMPATIBILITY[recipientGroup] || [];

module.exports = { COMPATIBILITY, canDonateTo, compatibleGroups };
