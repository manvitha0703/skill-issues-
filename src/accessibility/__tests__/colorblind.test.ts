import { describe, it, expect } from 'vitest';
import { BASE_COLOR_MATRICES, interpolateColorMatrix } from '../svgFilters';
import { ColorBlindnessType } from '../../types/profile';

describe('Scientific Color Blindness Engine (8 Deficiencies)', () => {
  const ALL_TYPES: Exclude<ColorBlindnessType, 'none' | 'highContrast'>[] = [
    'protanopia',
    'protanomaly',
    'deuteranopia',
    'deuteranomaly',
    'tritanopia',
    'tritanomaly',
    'achromatopsia',
    'achromatomaly',
  ];

  it('defines 5x4 transformation matrix rows for all 8 deficiency types', () => {
    ALL_TYPES.forEach((type) => {
      const matrix = BASE_COLOR_MATRICES[type];
      expect(matrix, `Matrix for ${type} should exist`).toBeDefined();
      expect(matrix.r).toHaveLength(5);
      expect(matrix.g).toHaveLength(5);
      expect(matrix.b).toHaveLength(5);
      expect(matrix.a).toHaveLength(5);

      // Verify all matrix entries are valid finite numbers
      [...matrix.r, ...matrix.g, ...matrix.b, ...matrix.a].forEach((val) => {
        expect(typeof val).toBe('number');
        expect(Number.isFinite(val)).toBe(true);
      });
    });
  });

  it('interpolates accurately between identity matrix at 0% and full matrix at 100%', () => {
    const deuteranopiaBase = BASE_COLOR_MATRICES['deuteranopia'];

    // At 100% severity, interpolated string should match base matrix
    const matrix100Str = interpolateColorMatrix('deuteranopia', 100);
    const parsed100 = matrix100Str.split(' ').map(Number);
    expect(parsed100).toHaveLength(20);
    expect(parsed100[0]).toBeCloseTo(deuteranopiaBase.r[0], 2);
    expect(parsed100[1]).toBeCloseTo(deuteranopiaBase.r[1], 2);

    // At 50% severity, first diagonal element should be halfway between 1 and deuteranopiaBase.r[0]
    const matrix50Str = interpolateColorMatrix('deuteranopia', 50);
    const parsed50 = matrix50Str.split(' ').map(Number);
    const expectedHalf = 1 * 0.5 + deuteranopiaBase.r[0] * 0.5;
    expect(parsed50[0]).toBeCloseTo(expectedHalf, 2);

    // At 0% severity, should equal the identity matrix
    const matrix0Str = interpolateColorMatrix('deuteranopia', 0);
    const parsed0 = matrix0Str.split(' ').map(Number);
    expect(parsed0[0]).toBeCloseTo(1, 4); // R row R col
    expect(parsed0[6]).toBeCloseTo(1, 4); // G row G col
    expect(parsed0[12]).toBeCloseTo(1, 4); // B row B col
    expect(parsed0[18]).toBeCloseTo(1, 4); // A row A col
  });

  it('achromatopsia correctly converts colors to pure greyscale luminance weights', () => {
    const achromatopsia = BASE_COLOR_MATRICES['achromatopsia'];
    // Red row luminance weights: ~0.299, ~0.587, ~0.114
    expect(achromatopsia.r[0]).toBeCloseTo(0.299, 2);
    expect(achromatopsia.r[1]).toBeCloseTo(0.587, 2);
    expect(achromatopsia.r[2]).toBeCloseTo(0.114, 2);

    // Green row should have identical luminance weights
    expect(achromatopsia.g[0]).toBeCloseTo(0.299, 2);
    expect(achromatopsia.g[1]).toBeCloseTo(0.587, 2);
    expect(achromatopsia.g[2]).toBeCloseTo(0.114, 2);

    // Blue row should also have identical luminance weights
    expect(achromatopsia.b[0]).toBeCloseTo(0.299, 2);
    expect(achromatopsia.b[1]).toBeCloseTo(0.587, 2);
    expect(achromatopsia.b[2]).toBeCloseTo(0.114, 2);
  });

  it('handles unknown or default color blindness types gracefully without throwing', () => {
    // @ts-ignore
    const fallbackStr = interpolateColorMatrix('unknown_type' as any, 80);
    expect(fallbackStr).toBeDefined();
    expect(typeof fallbackStr).toBe('string');
    const values = fallbackStr.split(' ');
    expect(values).toHaveLength(20);
  });
});
