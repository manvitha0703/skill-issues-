import { ColorBlindnessType } from '../types/profile';

/**
 * Standard Scientific Color Vision Deficiency Matrices
 * Based on Brettel, Viénot & Mollon (1997) and Machado, Oliveira & Fernandes (2009).
 */

// 5x4 matrix row representations [R, G, B, A, Offset]
export interface ColorMatrix {
  r: [number, number, number, number, number];
  g: [number, number, number, number, number];
  b: [number, number, number, number, number];
  a: [number, number, number, number, number];
}

export const BASE_COLOR_MATRICES: Record<Exclude<ColorBlindnessType, 'none' | 'highContrast'>, ColorMatrix> = {
  // Red-Blind (Severe)
  protanopia: {
    r: [0.56667, 0.43333, 0.0, 0, 0],
    g: [0.55833, 0.44167, 0.0, 0, 0],
    b: [0.0, 0.24167, 0.75833, 0, 0],
    a: [0, 0, 0, 1, 0],
  },
  // Red-Weak (Anomalous Trichromacy, ~60% severity default)
  protanomaly: {
    r: [0.81667, 0.18333, 0.0, 0, 0],
    g: [0.33333, 0.66667, 0.0, 0, 0],
    b: [0.0, 0.125, 0.875, 0, 0],
    a: [0, 0, 0, 1, 0],
  },
  // Green-Blind (Severe)
  deuteranopia: {
    r: [0.625, 0.375, 0.0, 0, 0],
    g: [0.70, 0.30, 0.0, 0, 0],
    b: [0.0, 0.30, 0.70, 0, 0],
    a: [0, 0, 0, 1, 0],
  },
  // Green-Weak (Anomalous Trichromacy, ~60% severity default)
  deuteranomaly: {
    r: [0.80, 0.20, 0.0, 0, 0],
    g: [0.25833, 0.74167, 0.0, 0, 0],
    b: [0.0, 0.14167, 0.85833, 0, 0],
    a: [0, 0, 0, 1, 0],
  },
  // Blue-Blind (Severe)
  tritanopia: {
    r: [0.95, 0.05, 0.0, 0, 0],
    g: [0.0, 0.43333, 0.56667, 0, 0],
    b: [0.0, 0.475, 0.525, 0, 0],
    a: [0, 0, 0, 1, 0],
  },
  // Blue-Weak (Anomalous Trichromacy, ~60% severity default)
  tritanomaly: {
    r: [0.96667, 0.03333, 0.0, 0, 0],
    g: [0.0, 0.73333, 0.26667, 0, 0],
    b: [0.0, 0.18333, 0.81667, 0, 0],
    a: [0, 0, 0, 1, 0],
  },
  // Complete Monochromacy
  achromatopsia: {
    r: [0.299, 0.587, 0.114, 0, 0],
    g: [0.299, 0.587, 0.114, 0, 0],
    b: [0.299, 0.587, 0.114, 0, 0],
    a: [0, 0, 0, 1, 0],
  },
  // Incomplete Monochromacy
  achromatomaly: {
    r: [0.618, 0.320, 0.062, 0, 0],
    g: [0.163, 0.775, 0.062, 0, 0],
    b: [0.163, 0.320, 0.516, 0, 0],
    a: [0, 0, 0, 1, 0],
  },
};

/**
 * Linearly interpolates between Identity matrix and target deficiency matrix by factor [0, 1]
 */
export function interpolateColorMatrix(
  matrixOrType: ColorMatrix | ColorBlindnessType | string,
  intensityPercent: number
): string {
  let matrix: ColorMatrix;
  if (typeof matrixOrType === 'string') {
    matrix = (BASE_COLOR_MATRICES as any)[matrixOrType] || BASE_COLOR_MATRICES['deuteranopia'];
  } else {
    matrix = matrixOrType;
  }

  const factor = Math.max(0, Math.min(100, intensityPercent)) / 100;
  // Identity:
  // r: [1, 0, 0, 0, 0]
  // g: [0, 1, 0, 0, 0]
  // b: [0, 0, 1, 0, 0]
  // a: [0, 0, 0, 1, 0]
  const lerp = (base: number, target: number) => {
    return Number((base * (1 - factor) + target * factor).toFixed(4));
  };

  const r = [
    lerp(1, matrix.r[0]), lerp(0, matrix.r[1]), lerp(0, matrix.r[2]), matrix.r[3], matrix.r[4]
  ];
  const g = [
    lerp(0, matrix.g[0]), lerp(1, matrix.g[1]), lerp(0, matrix.g[2]), matrix.g[3], matrix.g[4]
  ];
  const b = [
    lerp(0, matrix.b[0]), lerp(0, matrix.b[1]), lerp(1, matrix.b[2]), matrix.b[3], matrix.b[4]
  ];
  const a = matrix.a;

  return [
    ...r,
    ...g,
    ...b,
    ...a
  ].join(' ');
}

export function generateAllSvgFilters(intensityMap: Partial<Record<ColorBlindnessType, number>> = {}): string {
  const filterElements = (Object.keys(BASE_COLOR_MATRICES) as Array<keyof typeof BASE_COLOR_MATRICES>).map((key) => {
    const intensity = intensityMap[key] ?? 100;
    const values = interpolateColorMatrix(BASE_COLOR_MATRICES[key], intensity);
    return `
    <filter id="swde-filter-${key}">
      <feColorMatrix type="matrix" values="${values}" />
    </filter>`;
  });

  return `
<svg id="swde-colorblind-filters" style="position: absolute; width: 0; height: 0; overflow: hidden;" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
  <defs>
    ${filterElements.join('\n')}
    <filter id="swde-filter-high-contrast">
      <feComponentTransfer>
        <feFuncR type="linear" slope="1.45" intercept="-0.15" />
        <feFuncG type="linear" slope="1.45" intercept="-0.15" />
        <feFuncB type="linear" slope="1.45" intercept="-0.15" />
      </feComponentTransfer>
    </filter>
  </defs>
</svg>
`;
}

export function injectSvgFilters(intensity = 100, mode?: ColorBlindnessType): void {
  if (typeof document === 'undefined') return;

  let container = document.getElementById('swde-svg-filters-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'swde-svg-filters-container';
    document.body.appendChild(container);
  }

  const intensityMap: Partial<Record<ColorBlindnessType, number>> = {};
  if (mode && mode !== 'none' && mode !== 'highContrast') {
    intensityMap[mode] = intensity;
  }

  container.innerHTML = generateAllSvgFilters(intensityMap);
}

export function removeSvgFilters(): void {
  if (typeof document === 'undefined') return;
  const container = document.getElementById('swde-svg-filters-container');
  if (container) {
    container.remove();
  }
}
