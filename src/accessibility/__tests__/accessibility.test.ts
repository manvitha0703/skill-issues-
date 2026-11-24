import { describe, it, expect } from 'vitest';
import { ProfileManager } from '../profileManager';
import { StyleGenerator } from '../styleGenerator';
import { DEFAULT_PROFILES } from '../presets';
import { UserAccessibilityState } from '../../types/profile';

describe('Accessibility Engine & Profiles', () => {
  it('combines multiple active profiles (Dyslexia + Low Vision) seamlessly', () => {
    const dyslexia = DEFAULT_PROFILES.find((p) => p.presetId === 'dyslexia')!;
    const lowVision = DEFAULT_PROFILES.find((p) => p.presetId === 'lowVision')!;

    const state: UserAccessibilityState = {
      masterToggle: true,
      activeProfileIds: [dyslexia.id, lowVision.id],
      profiles: DEFAULT_PROFILES.map((p) => ({
        ...p,
        enabled: p.id === dyslexia.id || p.id === lowVision.id,
      })),
      activeSiteDomain: 'example.com',
      siteExceptions: {},
    };

    const effective = ProfileManager.getEffectiveSettings(state);
    expect(effective).not.toBeNull();
    // Font adjustment should take the larger value from lowVision (+45%)
    expect(effective!.visual.fontSizeAdjustment).toBe(45);
    // Letter spacing from dyslexia (+2px)
    expect(effective!.visual.letterSpacing).toBe(2);
    // Large click targets from low vision
    expect(effective!.visual.largeClickTargets).toBe(true);
    // Reading ruler from dyslexia
    expect(effective!.visual.readingRuler).toBe(true);
    expect(effective!.activeProfileNames).toContain('Dyslexia-Friendly');
    expect(effective!.activeProfileNames).toContain('Low Vision Assistance');
  });

  it('generates valid accessibility CSS including reduced motion, fonts, and focus rings', () => {
    const dyslexia = DEFAULT_PROFILES.find((p) => p.presetId === 'dyslexia')!;
    const state: UserAccessibilityState = {
      masterToggle: true,
      activeProfileIds: [dyslexia.id],
      profiles: DEFAULT_PROFILES.map((p) => ({ ...p, enabled: p.id === dyslexia.id })),
      activeSiteDomain: 'example.com',
      siteExceptions: {},
    };

    const effective = ProfileManager.getEffectiveSettings(state)!;
    const css = StyleGenerator.generateCSS(effective);

    expect(css).toContain('OpenDyslexic');
    expect(css).toContain('letter-spacing: 2px !important');
    expect(css).toContain('line-height: 1.85 !important');
    expect(css).toContain(':focus, :focus-visible');
  });

  it('returns null when master toggle is disabled', () => {
    const state: UserAccessibilityState = {
      masterToggle: false,
      activeProfileIds: ['preset_dyslexia'],
      profiles: DEFAULT_PROFILES.map((p) => ({ ...p, enabled: p.presetId === 'dyslexia' })),
      activeSiteDomain: 'example.com',
      siteExceptions: {},
    };

    const effective = ProfileManager.getEffectiveSettings(state);
    expect(effective).toBeNull();
  });
});
