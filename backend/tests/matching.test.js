const { canDonateTo, compatibleGroups, COMPATIBILITY } = require('../src/services/matchingService');
const { distanceKm, paginate } = require('../src/utils/helpers');

describe('blood group compatibility', () => {
  test('O- is a universal donor', () => {
    const all = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
    expect(all.every((g) => canDonateTo('O-', g))).toBe(true);
  });

  test('O- as a recipient only accepts O-', () => {
    const all = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
    expect(compatibleGroups('O-')).toEqual(['O-']);
    expect(all.filter((g) => canDonateTo(g, 'O-'))).toEqual(['O-']);
  });

  test('AB+ as a recipient accepts every group', () => {
    const all = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
    expect(all.every((g) => canDonateTo(g, 'AB+'))).toBe(true);
  });

  test('AB+ cannot donate to O-', () => {
    expect(canDonateTo('AB+', 'O-')).toBe(false);
  });

  test('A+ cannot donate to O- or B+', () => {
    expect(canDonateTo('A+', 'O-')).toBe(false);
    expect(canDonateTo('A+', 'B+')).toBe(false);
    expect(canDonateTo('A+', 'A+')).toBe(true);
  });

  test('compatibility table covers all 8 groups', () => {
    expect(Object.keys(COMPATIBILITY).sort()).toEqual(
      ['A+', 'A-', 'AB+', 'AB-', 'B+', 'B-', 'O+', 'O-'].sort()
    );
  });
});

describe('helpers', () => {
  test('distanceKm is zero for identical points', () => {
    expect(distanceKm(-26.2041, 28.0473, -26.2041, 28.0473)).toBe(0);
  });

  test('distanceKm returns null when coordinates missing', () => {
    expect(distanceKm(null, 1, 2, 3)).toBeNull();
  });

  test('paginate clamps page and limit', () => {
    expect(paginate({})).toEqual({ page: 1, limit: 20, offset: 0 });
    expect(paginate({ page: '3', limit: '10' })).toEqual({ page: 3, limit: 10, offset: 20 });
    expect(paginate({ limit: '9999' }).limit).toBe(100);
  });
});
