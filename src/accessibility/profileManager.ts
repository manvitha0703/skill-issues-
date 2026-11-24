import { SafeStorage } from '../storage/chromeStorage';
import {
  AccessibilityProfile,
  UserAccessibilityState,
  VisualSettings,
  ReadingSettings,
  InteractionSettings,
  LanguageSettings,
  AudioSettings,
} from '../types/profile';
import { DEFAULT_PROFILES } from './presets';

const STORAGE_KEY_PROFILES = 'swde_user_accessibility_state';

export interface EffectiveSettings {
  visual: VisualSettings;
  reading: ReadingSettings;
  interaction: InteractionSettings;
  language: LanguageSettings;
  audio: AudioSettings;
  activeProfileNames: string[];
}

export class ProfileManager {
  static async getState(): Promise<UserAccessibilityState> {
    const defaultState: UserAccessibilityState = {
      masterToggle: false,
      activeProfileIds: [],
      profiles: DEFAULT_PROFILES,
      activeSiteDomain: '',
      siteExceptions: {},
    };

    const state = await SafeStorage.get<UserAccessibilityState>(STORAGE_KEY_PROFILES, defaultState);

    // Merge in any new default presets if they were missing or have new fields
    const existingIds = new Set(state.profiles.map((p) => p.id));
    for (const preset of DEFAULT_PROFILES) {
      if (!existingIds.has(preset.id)) {
        state.profiles.push(preset);
      } else {
        const existingIdx = state.profiles.findIndex((p) => p.id === preset.id);
        if (existingIdx >= 0) {
          // Preserve enabled flag but merge new properties
          state.profiles[existingIdx] = {
            ...preset,
            enabled: state.profiles[existingIdx].enabled,
            visualSettings: { ...preset.visualSettings, ...state.profiles[existingIdx].visualSettings },
            readingSettings: { ...preset.readingSettings, ...state.profiles[existingIdx].readingSettings },
            interactionSettings: { ...preset.interactionSettings, ...state.profiles[existingIdx].interactionSettings },
            languageSettings: { ...preset.languageSettings, ...state.profiles[existingIdx].languageSettings },
            audioSettings: { ...preset.audioSettings, ...state.profiles[existingIdx].audioSettings },
          };
        }
      }
    }

    return state;
  }

  static async saveState(state: UserAccessibilityState): Promise<void> {
    await SafeStorage.set(STORAGE_KEY_PROFILES, state);
  }

  static async toggleMaster(enabled?: boolean): Promise<boolean> {
    const state = await this.getState();
    state.masterToggle = enabled !== undefined ? enabled : !state.masterToggle;
    await this.saveState(state);
    return state.masterToggle;
  }

  static async toggleProfile(profileId: string, enabled?: boolean): Promise<UserAccessibilityState> {
    const state = await this.getState();
    const prof = state.profiles.find((p) => p.id === profileId || p.presetId === profileId);
    if (!prof) return state;

    const newStatus = enabled !== undefined ? enabled : !prof.enabled;
    prof.enabled = newStatus;

    if (newStatus) {
      if (!state.activeProfileIds.includes(prof.id)) {
        state.activeProfileIds.push(prof.id);
      }
    } else {
      state.activeProfileIds = state.activeProfileIds.filter((id) => id !== prof.id);
    }

    // Auto-turn on master toggle if user enables a profile
    if (newStatus && !state.masterToggle) {
      state.masterToggle = true;
    }

    await this.saveState(state);
    return state;
  }

  static async upsertProfile(profile: AccessibilityProfile): Promise<UserAccessibilityState> {
    const state = await this.getState();
    const idx = state.profiles.findIndex((p) => p.id === profile.id);
    if (idx >= 0) {
      state.profiles[idx] = profile;
    } else {
      state.profiles.push(profile);
    }
    await this.saveState(state);
    return state;
  }

  static async deleteProfile(profileId: string): Promise<UserAccessibilityState> {
    const state = await this.getState();
    // Prevent deleting core default presets, only allow deleting custom
    if (!profileId.startsWith('custom_')) {
      return state;
    }
    state.profiles = state.profiles.filter((p) => p.id !== profileId);
    state.activeProfileIds = state.activeProfileIds.filter((id) => id !== profileId);
    await this.saveState(state);
    return state;
  }

  /**
   * Intelligently combines multiple active profiles into an effective composite settings object.
   */
  static getEffectiveSettings(state: UserAccessibilityState): EffectiveSettings | null {
    if (!state.masterToggle) {
      return null;
    }

    const activeProfiles = state.profiles.filter(
      (p) => p.enabled || state.activeProfileIds.includes(p.id)
    );

    if (activeProfiles.length === 0) {
      return null;
    }

    // Baseline settings
    const visual: VisualSettings = {
      fontSizeAdjustment: 0,
      pageZoomLevel: 100,
      letterSpacing: 0,
      wordSpacing: 0,
      lineHeight: 1.5,
      paragraphSpacing: 0,
      fontFamily: 'default',
      colorBlindnessMode: 'none',
      colorBlindnessIntensity: 100,
      contrastMode: 'normal',
      customContrastRatio: 1.0,
      highlightLinks: false,
      highlightHeadings: false,
      largeClickTargets: false,
      customCursor: false,
      readingRuler: false,
      readingRulerHeight: 36,
      singleLineFocus: false,
      warmTint: false,
      warmTintIntensity: 0,
      brightnessReduction: 0,
    };

    const reading: ReadingSettings = {
      readingLevel: 'standard',
      readingModeActive: false,
      adhdFocusDimClutter: false,
      distractionFilteringIntensity: 'mild',
      activeParagraphSpotlight: false,
      hideSidebar: false,
      hideAdsAndBanners: false,
      syllableHighlighting: false,
      highlightCurrentParagraph: false,
      hoverSimplification: false,
      explainDifficultWords: false,
    };

    const interaction: InteractionSettings = {
      reduceMotion: false,
      suppressFlashingContent: false,
      flashingContentDetector: false,
      pauseAutoplay: false,
      disableTransitions: false,
      visibleFocusIndicators: false,
      keyboardShortcutsEnabled: false,
      enhancedTabNavigation: false,
      largeInteractiveButtons: false,
      easierScrolling: false,
      emergencyStopActive: false,
    };

    const language: LanguageSettings = {
      preferredLanguage: 'en',
      autoTranslatePage: false,
      contextualDefinitions: false,
      hoverTranslation: false,
    };

    const audio: AudioSettings = {
      ttsVoiceName: '',
      ttsRate: 1.0,
      ttsPitch: 1.0,
      ttsVolume: 1.0,
      speechRecognitionEnabled: false,
      visualReadingIndicator: false,
      screenReaderNavigationActive: false,
    };

    // Combine settings from active profiles
    for (const prof of activeProfiles) {
      const v = prof.visualSettings;
      visual.fontSizeAdjustment = Math.max(visual.fontSizeAdjustment, v.fontSizeAdjustment || 0);
      visual.pageZoomLevel = Math.max(visual.pageZoomLevel, v.pageZoomLevel || 100);
      visual.letterSpacing = Math.max(visual.letterSpacing, v.letterSpacing || 0);
      visual.wordSpacing = Math.max(visual.wordSpacing, v.wordSpacing || 0);
      visual.lineHeight = Math.max(visual.lineHeight, v.lineHeight || 1.5);
      visual.paragraphSpacing = Math.max(visual.paragraphSpacing, v.paragraphSpacing || 0);
      if (v.fontFamily && v.fontFamily !== 'default') visual.fontFamily = v.fontFamily;
      if (v.colorBlindnessMode && v.colorBlindnessMode !== 'none') {
        visual.colorBlindnessMode = v.colorBlindnessMode;
        visual.colorBlindnessIntensity = v.colorBlindnessIntensity ?? 100;
      }
      if (v.contrastMode && v.contrastMode !== 'normal') visual.contrastMode = v.contrastMode;
      visual.customContrastRatio = Math.max(visual.customContrastRatio, v.customContrastRatio || 1.0);
      visual.highlightLinks = visual.highlightLinks || v.highlightLinks;
      visual.highlightHeadings = visual.highlightHeadings || v.highlightHeadings;
      visual.largeClickTargets = visual.largeClickTargets || v.largeClickTargets;
      visual.customCursor = visual.customCursor || v.customCursor;
      visual.readingRuler = visual.readingRuler || v.readingRuler;
      visual.readingRulerHeight = Math.max(visual.readingRulerHeight, v.readingRulerHeight || 36);
      visual.singleLineFocus = visual.singleLineFocus || v.singleLineFocus;
      visual.warmTint = visual.warmTint || v.warmTint;
      visual.warmTintIntensity = Math.max(visual.warmTintIntensity, v.warmTintIntensity || 0);
      visual.brightnessReduction = Math.max(visual.brightnessReduction, v.brightnessReduction || 0);

      const r = prof.readingSettings;
      if (r.readingModeActive) reading.readingModeActive = true;
      reading.adhdFocusDimClutter = reading.adhdFocusDimClutter || r.adhdFocusDimClutter;
      reading.activeParagraphSpotlight = reading.activeParagraphSpotlight || r.activeParagraphSpotlight;
      if (r.distractionFilteringIntensity === 'strict') reading.distractionFilteringIntensity = 'strict';
      else if (r.distractionFilteringIntensity === 'moderate' && reading.distractionFilteringIntensity !== 'strict') {
        reading.distractionFilteringIntensity = 'moderate';
      }
      reading.hideSidebar = reading.hideSidebar || r.hideSidebar;
      reading.hideAdsAndBanners = reading.hideAdsAndBanners || r.hideAdsAndBanners;
      reading.syllableHighlighting = reading.syllableHighlighting || r.syllableHighlighting;
      reading.highlightCurrentParagraph = reading.highlightCurrentParagraph || r.highlightCurrentParagraph;
      reading.hoverSimplification = reading.hoverSimplification || r.hoverSimplification;
      reading.explainDifficultWords = reading.explainDifficultWords || r.explainDifficultWords;
      if (r.readingLevel === 'very_simple') reading.readingLevel = 'very_simple';
      else if (r.readingLevel === 'simple' && reading.readingLevel !== 'very_simple') reading.readingLevel = 'simple';

      const i = prof.interactionSettings;
      interaction.reduceMotion = interaction.reduceMotion || i.reduceMotion;
      interaction.suppressFlashingContent = interaction.suppressFlashingContent || i.suppressFlashingContent;
      interaction.flashingContentDetector = interaction.flashingContentDetector || i.flashingContentDetector;
      interaction.pauseAutoplay = interaction.pauseAutoplay || i.pauseAutoplay;
      interaction.disableTransitions = interaction.disableTransitions || i.disableTransitions;
      interaction.visibleFocusIndicators = interaction.visibleFocusIndicators || i.visibleFocusIndicators;
      interaction.keyboardShortcutsEnabled = interaction.keyboardShortcutsEnabled || i.keyboardShortcutsEnabled;
      interaction.enhancedTabNavigation = interaction.enhancedTabNavigation || i.enhancedTabNavigation;
      interaction.largeInteractiveButtons = interaction.largeInteractiveButtons || i.largeInteractiveButtons;
      interaction.easierScrolling = interaction.easierScrolling || i.easierScrolling;
      interaction.emergencyStopActive = interaction.emergencyStopActive || i.emergencyStopActive;

      const l = prof.languageSettings;
      if (l.preferredLanguage && l.preferredLanguage !== 'en') language.preferredLanguage = l.preferredLanguage;
      language.autoTranslatePage = language.autoTranslatePage || l.autoTranslatePage;
      language.contextualDefinitions = language.contextualDefinitions || l.contextualDefinitions;
      language.hoverTranslation = language.hoverTranslation || l.hoverTranslation;

      const a = prof.audioSettings;
      if (a.ttsVoiceName) audio.ttsVoiceName = a.ttsVoiceName;
      if (a.ttsRate && a.ttsRate !== 1.0) audio.ttsRate = a.ttsRate;
      audio.speechRecognitionEnabled = audio.speechRecognitionEnabled || a.speechRecognitionEnabled;
      audio.visualReadingIndicator = audio.visualReadingIndicator || a.visualReadingIndicator;
      audio.screenReaderNavigationActive = audio.screenReaderNavigationActive || a.screenReaderNavigationActive;
    }

    return {
      visual,
      reading,
      interaction,
      language,
      audio,
      activeProfileNames: activeProfiles.map((p) => p.name),
    };
  }
}
