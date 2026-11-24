import { describe, it, expect } from 'vitest';
import { LocalTranslationEngine, LOCAL_TRANSLATION_DICTIONARIES } from '../localTranslationEngine';

describe('Local Offline Regional Translation Engine', () => {
  const LANGUAGES = ['hi', 'kn', 'ta', 'te', 'ml', 'bn', 'mr'];

  it('provides offline dictionaries for all 7 major regional languages', () => {
    LANGUAGES.forEach((lang) => {
      const dict = LOCAL_TRANSLATION_DICTIONARIES[lang];
      expect(dict, `Dictionary for ${lang} should exist`).toBeDefined();
      expect(Object.keys(dict).length).toBeGreaterThanOrEqual(30);

      // Verify core UI terms exist
      expect(dict['welcome']).toBeDefined();
      expect(dict['application']).toBeDefined();
      expect(dict['submit']).toBeDefined();
    });
  });

  it('translates isolated vocabulary accurately to Hindi', () => {
    const res = LocalTranslationEngine.translateText('submit application', 'hi');
    expect(res).toBe('आवेदन जमा करें');
  });

  it('translates isolated vocabulary accurately to Kannada', () => {
    const res = LocalTranslationEngine.translateText('scholarship', 'kn');
    expect(res).toBe('ವಿದ್ಯಾರ್ಥಿವೇತನ');
  });

  it('translates isolated vocabulary accurately to Tamil', () => {
    const res = LocalTranslationEngine.translateText('welcome', 'ta');
    expect(res).toBe('வரவேற்கிறோம்');
  });

  it('translates sentences preserving punctuation and replacing matched terms', () => {
    const text = 'Please submit your scholarship application before the deadline.';
    const translated = LocalTranslationEngine.translateText(text, 'hi');

    // Should contain translated Hindi words
    expect(translated).toContain('छात्रवृत्ति'); // scholarship
    expect(translated).toContain('आवेदन'); // application
    expect(translated).toContain('अंतिम तिथि'); // deadline
  });

  it('returns original text unharmed when target language is English or unrecognized', () => {
    const text = 'National Higher Education Portal';
    expect(LocalTranslationEngine.translateText(text, 'en')).toBe(text);
    expect(LocalTranslationEngine.translateText(text, 'xyz')).toBe(text);
  });
});
