import { StyleGenerator } from '../accessibility/styleGenerator';
import { ProfileManager } from '../accessibility/profileManager';
import { FormDetector } from './formDetection/formDetector';
import { FieldMatcher } from './formDetection/fieldMatcher';
import { FormFiller } from './formDetection/formFiller';
import { FormReviewModal } from './formDetection/formReviewModal';
import { PageAnalyzer } from './webpageAnalyzer/pageAnalyzer';
import { ReadingModeOverlay } from './readingMode/readingMode';
import { AccessibilityControlCenter } from './accessibilityToolbar/controlCenter';
import { SynchronizedReadingEngine } from './screenReader/synchronizedReadingEngine';
import { LocalTranslationEngine } from '../ai/localTranslationEngine';
import { ImageOcrEngine } from '../ai/imageOcrEngine';
import { SpeechService } from '../voice/speechService';
import { ExtensionMessage } from '../types/message';
import { VaultData } from '../types/vault';

class ContentScriptController {
  private static isInitialized = false;

  static async init(): Promise<void> {
    if (this.isInitialized) return;
    this.isInitialized = true;

    try {
      // 1. Load active accessibility settings and apply
      const state = await ProfileManager.getState();
      const effective = ProfileManager.getEffectiveSettings(state);
      StyleGenerator.applyToDOM(effective);

      // 2. Initialize in-page floating accessibility control center
      await AccessibilityControlCenter.init(async () => {
        this.triggerFormDetection();
      });

      // 3. Listen to runtime messages
      this.setupMessageListener();

      // 4. Debounced MutationObserver for dynamic SPAs
      this.setupMutationObserver();
    } catch (err) {
      console.warn('Same Web Different Eyes content script initialization warning:', err);
    }
  }

  private static setupMessageListener(): void {
    if (typeof chrome === 'undefined' || !chrome.runtime || !chrome.runtime.onMessage) {
      return;
    }

    chrome.runtime.onMessage.addListener((message: ExtensionMessage, _sender, sendResponse) => {
      switch (message.type) {
        case 'GET_ACCESSIBILITY_STATE': {
          ProfileManager.getState().then((state) => {
            const effective = ProfileManager.getEffectiveSettings(state);
            sendResponse({ state, effective });
          });
          return true;
        }

        case 'UPDATE_ACCESSIBILITY_STATE':
        case 'APPLY_PROFILE': {
          ProfileManager.getState().then((state) => {
            const effective = ProfileManager.getEffectiveSettings(state);
            StyleGenerator.applyToDOM(effective);
            sendResponse({ success: true, effective });
          });
          return true;
        }

        case 'TOGGLE_MASTER_ACCESSIBILITY': {
          ProfileManager.getState().then((state) => {
            const effective = ProfileManager.getEffectiveSettings(state);
            StyleGenerator.applyToDOM(effective);
            sendResponse({ success: true, masterToggle: state.masterToggle });
          });
          return true;
        }

        case 'ANALYZE_PAGE': {
          const overview = PageAnalyzer.analyze(document);
          sendResponse({ overview });
          return true;
        }

        case 'DETECT_FORMS': {
          const fields = FormDetector.detectFields(document);
          const vaultData = message.payload as VaultData | undefined;
          let matches: any[] = [];
          if (vaultData) {
            matches = FieldMatcher.matchFields(fields, vaultData);
          }
          sendResponse({ fields, matches });
          return true;
        }

        case 'FILL_FORM_FIELDS': {
          const matches = message.payload as any[];
          const outcome = FormFiller.fill(matches);
          sendResponse({ outcome });
          return true;
        }

        case 'CLEAR_FILLED_FIELDS': {
          const count = FormFiller.clearFilled();
          sendResponse({ clearedCount: count });
          return true;
        }

        case 'OPEN_READING_MODE': {
          ReadingModeOverlay.open();
          sendResponse({ success: true });
          return true;
        }

        case 'CLOSE_READING_MODE': {
          ReadingModeOverlay.close();
          sendResponse({ success: true });
          return true;
        }

        case 'TOGGLE_READING_RULER': {
          const enable = message.payload as boolean;
          StyleGenerator.toggleReadingRuler(enable);
          sendResponse({ success: true });
          return true;
        }

        case 'SPEAK_TEXT': {
          const text = message.payload as string;
          SpeechService.speak(text);
          sendResponse({ success: true });
          return true;
        }

        case 'STOP_SPEAKING': {
          SpeechService.stop();
          SynchronizedReadingEngine.stopNarration();
          sendResponse({ success: true });
          return true;
        }

        case 'START_SYNCHRONIZED_NARRATION': {
          SynchronizedReadingEngine.startNarration();
          sendResponse({ success: true });
          return true;
        }

        case 'STOP_SYNCHRONIZED_NARRATION': {
          SynchronizedReadingEngine.stopNarration();
          sendResponse({ success: true });
          return true;
        }

        case 'TRANSLATE_PAGE_LOCAL': {
          const lang = (message.payload as string) || 'hi';
          const outcome = LocalTranslationEngine.translatePageDOM(lang);
          sendResponse({ success: true, outcome });
          return true;
        }

        case 'RESTORE_PAGE_LOCAL': {
          const count = LocalTranslationEngine.restoreOriginalPage();
          sendResponse({ success: true, restoredCount: count });
          return true;
        }

        case 'SCAN_IMAGES_OCR': {
          const lang = message.payload as string | undefined;
          ImageOcrEngine.scanAllImages(lang).then((results) => {
            if (results.length > 0) {
              ImageOcrEngine.showImageOverlay(results[0]);
            }
            sendResponse({ results });
          });
          return true;
        }

        default:
          break;
      }
    });
  }

  private static async triggerFormDetection(): Promise<void> {
    const fields = FormDetector.detectFields(document);
    // Request decrypted vault data or cached data from background/storage
    chrome.runtime.sendMessage(
      { type: 'GET_VAULT_STATUS' },
      (response) => {
        if (response && response.vaultData) {
          const matches = FieldMatcher.matchFields(fields, response.vaultData);
          FormReviewModal.show(matches, fields.length);
        } else {
          // Open extension popup or prompt
          alert(
            'Form detected! Please unlock your Personal Vault in the extension popup to auto-fill.'
          );
        }
      }
    );
  }

  private static debounceTimer: any = null;
  private static setupMutationObserver(): void {
    const observer = new MutationObserver((mutations) => {
      // Ignore extension's own elements
      const hasForeignMutation = mutations.some(
        (m) =>
          !(m.target as HTMLElement).closest ||
          !(m.target as HTMLElement).closest('#swde-floating-toolbar-root, #swde-reading-mode-root, #swde-form-review-modal')
      );

      if (!hasForeignMutation) return;

      clearTimeout(this.debounceTimer);
      this.debounceTimer = setTimeout(async () => {
        const state = await ProfileManager.getState();
        if (state.masterToggle) {
          const effective = ProfileManager.getEffectiveSettings(state);
          // Re-evaluate styles if needed
          if (effective?.interaction.pauseAutoplay) {
            document.querySelectorAll('video, audio').forEach((media) => {
              try {
                (media as HTMLMediaElement).pause();
              } catch (_) {}
            });
          }
        }
      }, 350);
    });

    observer.observe(document.body || document.documentElement, {
      childList: true,
      subtree: true,
    });
  }
}

// Auto-run when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => ContentScriptController.init());
} else {
  ContentScriptController.init();
}
