export type ProfilePresetId =
  | 'dyslexia'
  | 'colorBlindness'
  | 'lowVision'
  | 'blindScreenReader'
  | 'photosensitivity'
  | 'adhdFocus'
  | 'motorAccessibility'
  | 'languageAssistance'
  | 'simplifiedReading'
  | 'seniorFriendly'
  | 'custom';

export type ColorBlindnessType =
  | 'none'
  | 'protanopia'
  | 'protanomaly'
  | 'deuteranopia'
  | 'deuteranomaly'
  | 'tritanopia'
  | 'tritanomaly'
  | 'achromatopsia'
  | 'achromatomaly'
  | 'highContrast';

export type ThemePresetType =
  | 'normal'
  | 'high'
  | 'dark'
  | 'inverted'
  | 'sepia'
  | 'yellow_on_black'
  | 'black_on_yellow'
  | 'cyan_on_black';

export interface VisualSettings {
  fontSizeAdjustment: number; // percentage change (-50 to +150)
  pageZoomLevel: number; // 100 to 200 percentage
  letterSpacing: number; // in px (0 to 10)
  wordSpacing: number; // in px (0 to 15)
  lineHeight: number; // multiplier (1.0 to 2.5)
  paragraphSpacing: number; // in px (0 to 30)
  fontFamily: 'default' | 'opendyslexic' | 'atkinson' | 'lexend' | 'sans-serif' | 'serif';
  colorBlindnessMode: ColorBlindnessType;
  colorBlindnessIntensity: number; // 0 to 100%
  contrastMode: ThemePresetType;
  customContrastRatio: number; // 1 to 2
  highlightLinks: boolean;
  highlightHeadings: boolean;
  largeClickTargets: boolean;
  customCursor: boolean;
  readingRuler: boolean;
  readingRulerHeight: number; // in px (20 to 80)
  singleLineFocus: boolean; // dims surrounding lines
  warmTint: boolean; // warm background tint for dyslexia comfort
  warmTintIntensity: number; // 0 to 50%
  brightnessReduction: number; // 0 to 70% dimming for photosensitivity
}

export interface ReadingSettings {
  readingLevel: 'very_simple' | 'simple' | 'standard' | 'detailed';
  readingModeActive: boolean;
  adhdFocusDimClutter: boolean;
  distractionFilteringIntensity: 'mild' | 'moderate' | 'strict';
  activeParagraphSpotlight: boolean;
  hideSidebar: boolean;
  hideAdsAndBanners: boolean;
  syllableHighlighting: boolean;
  highlightCurrentParagraph: boolean;
  hoverSimplification: boolean; // Hover over sentence to view simplified tooltip
  explainDifficultWords: boolean;
}

export interface InteractionSettings {
  reduceMotion: boolean;
  suppressFlashingContent: boolean;
  flashingContentDetector: boolean;
  pauseAutoplay: boolean;
  disableTransitions: boolean;
  visibleFocusIndicators: boolean;
  keyboardShortcutsEnabled: boolean;
  enhancedTabNavigation: boolean;
  largeInteractiveButtons: boolean;
  easierScrolling: boolean;
  emergencyStopActive: boolean; // 1-click immediate freeze of all media and animations
}

export interface LanguageSettings {
  preferredLanguage: string; // 'en', 'hi', 'kn', 'ta', 'te', 'ml', 'bn', 'mr'
  autoTranslatePage: boolean;
  contextualDefinitions: boolean;
  hoverTranslation: boolean;
}

export interface AudioSettings {
  ttsVoiceName: string;
  ttsRate: number; // 0.5 to 2.0
  ttsPitch: number; // 0.5 to 1.5
  ttsVolume: number; // 0.1 to 1.0
  speechRecognitionEnabled: boolean;
  visualReadingIndicator: boolean; // Highlight active reading sentence and scroll into view
  screenReaderNavigationActive: boolean;
}

export interface AccessibilityProfile {
  id: string;
  name: string;
  presetId?: ProfilePresetId;
  enabled: boolean;
  description: string;
  visualSettings: VisualSettings;
  readingSettings: ReadingSettings;
  interactionSettings: InteractionSettings;
  languageSettings: LanguageSettings;
  audioSettings: AudioSettings;
}

export interface UserAccessibilityState {
  masterToggle: boolean;
  activeProfileIds: string[];
  profiles: AccessibilityProfile[];
  activeSiteDomain: string;
  siteExceptions: Record<string, boolean>; // domain -> disabled override
  toolbarPosition?: { x: number; y: number }; // persistent floating position
}
