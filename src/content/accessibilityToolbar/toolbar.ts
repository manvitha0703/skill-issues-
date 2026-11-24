import { ReadingModeOverlay } from '../readingMode/readingMode';
import { SpeechService } from '../../voice/speechService';
import { StyleGenerator } from '../../accessibility/styleGenerator';

export class AccessibilityToolbar {
  private static rootEl: HTMLElement | null = null;
  private static isExpanded: boolean = false;
  private static readingRulerActive: boolean = false;
  private static currentScale: number = 100;
  private static isSpeaking: boolean = false;

  static init(onOpenFormFiller?: () => void): void {
    if (typeof document === 'undefined') return;
    if (document.getElementById('swde-floating-toolbar-root')) return;

    const root = document.createElement('div');
    root.id = 'swde-floating-toolbar-root';
    root.style.cssText = `
      position: fixed;
      bottom: 24px;
      right: 24px;
      z-index: 2147483645;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      user-select: none;
    `;

    root.innerHTML = `
      <div id="swde-toolbar-container" style="display: flex; flex-direction: column; align-items: flex-end; gap: 8px;">
        <!-- Expanded Panel -->
        <div id="swde-toolbar-menu" style="display: none; background: #0B132B; border: 1px solid #1C2541; border-radius: 14px; box-shadow: 0 10px 25px rgba(0,0,0,0.3); padding: 12px; min-width: 210px; color: #FFFFFF;">
          <div style="font-size: 11px; font-weight: 700; color: #38BDF8; letter-spacing: 0.05em; margin-bottom: 8px; text-transform: uppercase;">
            Accessibility Tools
          </div>
          <div style="display: flex; flex-direction: column; gap: 6px;">
            <button id="swde-tb-reader" style="display: flex; align-items: center; gap: 10px; background: #1C2541; color: #fff; border: 1px solid #2E4170; padding: 8px 12px; border-radius: 8px; font-size: 13px; font-weight: 500; cursor: pointer; text-align: left; width: 100%;">
              <span>📖</span> Reader View
            </button>
            <button id="swde-tb-ruler" style="display: flex; align-items: center; gap: 10px; background: #1C2541; color: #fff; border: 1px solid #2E4170; padding: 8px 12px; border-radius: 8px; font-size: 13px; font-weight: 500; cursor: pointer; text-align: left; width: 100%;">
              <span>📏</span> Reading Ruler
            </button>
            <button id="swde-tb-tts" style="display: flex; align-items: center; gap: 10px; background: #1C2541; color: #fff; border: 1px solid #2E4170; padding: 8px 12px; border-radius: 8px; font-size: 13px; font-weight: 500; cursor: pointer; text-align: left; width: 100%;">
              <span>🔊</span> Read Aloud
            </button>
            <button id="swde-tb-font-plus" style="display: flex; align-items: center; gap: 10px; background: #1C2541; color: #fff; border: 1px solid #2E4170; padding: 8px 12px; border-radius: 8px; font-size: 13px; font-weight: 500; cursor: pointer; text-align: left; width: 100%;">
              <span>🔍</span> Larger Text (+20%)
            </button>
            <button id="swde-tb-forms" style="display: flex; align-items: center; gap: 10px; background: #0369A1; color: #fff; border: 1px solid #0EA5E9; padding: 8px 12px; border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer; text-align: left; width: 100%;">
              <span>⚡</span> Smart Form Fill
            </button>
          </div>
        </div>

        <!-- Main Toggle Floating Pill -->
        <button id="swde-toolbar-main-btn" title="Toggle Same Web Accessibility Tools" style="background: linear-gradient(135deg, #0EA5E9 0%, #0369A1 100%); color: #ffffff; border: none; width: 48px; height: 48px; border-radius: 50%; box-shadow: 0 4px 14px rgba(14, 165, 233, 0.4); cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 22px; transition: transform 0.2s ease;">
          👁
        </button>
      </div>
    `;

    document.body.appendChild(root);
    this.rootEl = root;

    // Toggle menu
    const mainBtn = root.querySelector('#swde-toolbar-main-btn') as HTMLButtonElement;
    const menu = root.querySelector('#swde-toolbar-menu') as HTMLElement;
    mainBtn.addEventListener('click', () => {
      this.isExpanded = !this.isExpanded;
      menu.style.display = this.isExpanded ? 'block' : 'none';
      mainBtn.style.transform = this.isExpanded ? 'scale(1.08)' : 'scale(1)';
    });

    // Reader Mode
    root.querySelector('#swde-tb-reader')?.addEventListener('click', () => {
      ReadingModeOverlay.open();
      menu.style.display = 'none';
      this.isExpanded = false;
    });

    // Reading Ruler
    const rulerBtn = root.querySelector('#swde-tb-ruler') as HTMLButtonElement;
    rulerBtn?.addEventListener('click', () => {
      this.readingRulerActive = !this.readingRulerActive;
      StyleGenerator.toggleReadingRuler(this.readingRulerActive);
      rulerBtn.style.background = this.readingRulerActive ? '#0284C7' : '#1C2541';
    });

    // TTS
    const ttsBtn = root.querySelector('#swde-tb-tts') as HTMLButtonElement;
    ttsBtn?.addEventListener('click', () => {
      if (this.isSpeaking) {
        SpeechService.stop();
        this.isSpeaking = false;
        ttsBtn.innerHTML = '<span>🔊</span> Read Aloud';
      } else {
        const text = document.querySelector('article, main')
          ? document.querySelector('article, main')!.textContent || ''
          : document.body.innerText;
        SpeechService.speak(text.slice(0, 3000), {
          onEnd: () => {
            this.isSpeaking = false;
            ttsBtn.innerHTML = '<span>🔊</span> Read Aloud';
          },
        });
        this.isSpeaking = true;
        ttsBtn.innerHTML = '<span>⏹</span> Stop Speech';
      }
    });

    // Larger text
    root.querySelector('#swde-tb-font-plus')?.addEventListener('click', () => {
      this.currentScale = this.currentScale >= 160 ? 100 : this.currentScale + 20;
      document.body.style.zoom = `${this.currentScale}%`;
    });

    // Forms
    root.querySelector('#swde-tb-forms')?.addEventListener('click', () => {
      if (onOpenFormFiller) {
        onOpenFormFiller();
      }
    });
  }

  static destroy(): void {
    if (this.rootEl) {
      this.rootEl.remove();
      this.rootEl = null;
    }
  }
}
