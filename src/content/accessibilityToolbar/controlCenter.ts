import { ProfileManager } from '../../accessibility/profileManager';
import { StyleGenerator } from '../../accessibility/styleGenerator';
import { SynchronizedReadingEngine } from '../screenReader/synchronizedReadingEngine';
import { SentenceHoverSimplifier } from '../dyslexia/sentenceHoverSimplifier';
import { PhotosensitivityGuard } from '../photosensitivity/photosensitivityGuard';
import { AdhdFocusEngine } from '../focus/adhdFocusEngine';
import { LocalTranslationEngine } from '../../ai/localTranslationEngine';
import { ImageOcrEngine } from '../../ai/imageOcrEngine';
import { ReadingModeOverlay } from '../readingMode/readingMode';
import { SafeStorage } from '../../storage/chromeStorage';
import { ColorBlindnessType, ThemePresetType } from '../../types/profile';

const TOOLBAR_ROOT_ID = 'swde-floating-toolbar-root';
const STORAGE_POS_KEY = 'swde_toolbar_coords';

export class AccessibilityControlCenter {
  private static rootEl: HTMLElement | null = null;
  private static isOpen = false;
  private static activeTab = 'quick';
  private static onTriggerFormFill?: () => void;

  static async init(onFormFill?: () => void): Promise<void> {
    if (typeof document === 'undefined') return;
    if (document.getElementById(TOOLBAR_ROOT_ID)) return;

    this.onTriggerFormFill = onFormFill;

    // Load persisted coordinates
    const savedPos = await SafeStorage.get<{ x: number; y: number } | null>(STORAGE_POS_KEY, null);
    const initialRight = savedPos ? `${Math.max(10, window.innerWidth - savedPos.x - 50)}px` : '20px';
    const initialBottom = savedPos ? `${Math.max(10, window.innerHeight - savedPos.y - 50)}px` : '20px';

    const root = document.createElement('div');
    root.id = TOOLBAR_ROOT_ID;
    root.style.cssText = `
      position: fixed;
      bottom: ${initialBottom};
      right: ${initialRight};
      z-index: 2147483646;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      user-select: none;
      direction: ltr;
    `;

    document.body.appendChild(root);
    this.rootEl = root;

    this.render();
    this.setupShortcuts();
  }

  private static setupShortcuts(): void {
    window.addEventListener('keydown', (e) => {
      // Alt + A: Toggle Accessibility Control Center
      if (e.altKey && e.key.toLowerCase() === 'a') {
        e.preventDefault();
        this.toggle();
      }
      // Alt + H: Next Heading
      else if (e.altKey && e.key.toLowerCase() === 'h') {
        e.preventDefault();
        SynchronizedReadingEngine.navigateToType('heading', e.shiftKey);
      }
      // Alt + L: Next Link
      else if (e.altKey && e.key.toLowerCase() === 'l') {
        e.preventDefault();
        SynchronizedReadingEngine.navigateToType('link', e.shiftKey);
      }
      // Alt + B: Next Button
      else if (e.altKey && e.key.toLowerCase() === 'b') {
        e.preventDefault();
        SynchronizedReadingEngine.navigateToType('button', e.shiftKey);
      }
      // Alt + F: Next Form
      else if (e.altKey && e.key.toLowerCase() === 'f') {
        e.preventDefault();
        SynchronizedReadingEngine.navigateToType('form', e.shiftKey);
      }
      // Esc: Emergency freeze / close
      else if (e.key === 'Escape' && this.isOpen) {
        this.close();
      }
    });
  }

  static toggle(): void {
    this.isOpen = !this.isOpen;
    this.render();
  }

  static open(): void {
    this.isOpen = true;
    this.render();
  }

  static close(): void {
    this.isOpen = false;
    this.render();
  }

  private static async render(): Promise<void> {
    if (!this.rootEl) return;

    const state = await ProfileManager.getState();
    const effective = ProfileManager.getEffectiveSettings(state);

    const isMasterOn = state.masterToggle;
    const currentMode = effective?.visual.colorBlindnessMode || 'none';
    const currentIntensity = effective?.visual.colorBlindnessIntensity ?? 100;
    const warmTint = effective?.visual.warmTint ?? false;
    const warmTintVal = effective?.visual.warmTintIntensity ?? 15;
    const brightnessVal = effective?.visual.brightnessReduction ?? 0;
    const isRuler = effective?.visual.readingRuler ?? false;
    const isLineFocus = effective?.visual.singleLineFocus ?? false;
    const isSpotlight = effective?.reading.activeParagraphSpotlight ?? false;
    const isHoverSimple = effective?.reading.hoverSimplification ?? false;
    const zoomLevel = effective?.visual.pageZoomLevel ?? 100;
    const isNarrating = SynchronizedReadingEngine.isNarratingActive();

    // Enable/disable sub-features based on current state
    if (isMasterOn && isHoverSimple) {
      SentenceHoverSimplifier.enable();
    } else {
      SentenceHoverSimplifier.disable();
    }

    if (isMasterOn && isSpotlight) {
      AdhdFocusEngine.enableSpotlight();
    } else {
      AdhdFocusEngine.disableSpotlight();
    }

    this.rootEl.innerHTML = `
      <div style="display: flex; flex-direction: column; align-items: flex-end; gap: 8px;">
        <!-- EXPANDED CONTROL CENTRE -->
        <div id="swde-cc-panel" style="display: ${this.isOpen ? 'flex' : 'none'}; flex-direction: column; width: 340px; max-height: 82vh; background: #0B132B; color: #FFFFFF; border: 1.5px solid #1C2541; border-radius: 16px; box-shadow: 0 20px 45px rgba(0,0,0,0.55); overflow: hidden; animation: swdeScaleUp 0.18s ease-out;">
          
          <!-- Header Bar -->
          <div style="padding: 12px 14px; background: #1C2541; border-bottom: 1px solid #2E4170; display: flex; justify-content: space-between; align-items: center; cursor: grab;">
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="background: linear-gradient(135deg, #0EA5E9, #0284C7); color: #fff; width: 24px; height: 24px; border-radius: 6px; display: flex; align-items: center; justify-content: center; font-size: 13px;">👁️</span>
              <div>
                <div style="font-weight: 700; font-size: 13px; color: #FFFFFF;">Accessibility Control Centre</div>
                <div style="font-size: 10px; color: #38BDF8;">Same Web, Different Eyes</div>
              </div>
            </div>
            <div style="display: flex; gap: 6px; align-items: center;">
              <button id="swde-cc-master-toggle" style="background: ${isMasterOn ? '#0EA5E9' : '#334155'}; color: ${isMasterOn ? '#0B132B' : '#E2E8F0'}; border: none; font-size: 10px; font-weight: bold; padding: 3px 8px; border-radius: 12px; cursor: pointer;">
                ${isMasterOn ? 'ON' : 'OFF'}
              </button>
              <button id="swde-cc-close-btn" style="background: transparent; border: none; color: #94A3B8; font-size: 16px; cursor: pointer; padding: 2px;">✕</button>
            </div>
          </div>

          <!-- Navigation Tab Strip -->
          <div style="display: flex; background: #0B132B; border-bottom: 1px solid #1C2541; overflow-x: auto; padding: 4px 6px; gap: 4px; font-size: 11px; scrollbar-width: none;">
            <button class="swde-tab-btn" data-tab="quick" style="padding: 5px 8px; border-radius: 6px; border: none; cursor: pointer; white-space: nowrap; font-weight: 600; background: ${this.activeTab === 'quick' ? '#0284C7' : 'transparent'}; color: ${this.activeTab === 'quick' ? '#fff' : '#94A3B8'};">⚡ Profiles</button>
            <button class="swde-tab-btn" data-tab="dyslexia" style="padding: 5px 8px; border-radius: 6px; border: none; cursor: pointer; white-space: nowrap; font-weight: 600; background: ${this.activeTab === 'dyslexia' ? '#0284C7' : 'transparent'}; color: ${this.activeTab === 'dyslexia' ? '#fff' : '#94A3B8'};">📖 Dyslexia</button>
            <button class="swde-tab-btn" data-tab="colorblind" style="padding: 5px 8px; border-radius: 6px; border: none; cursor: pointer; white-space: nowrap; font-weight: 600; background: ${this.activeTab === 'colorblind' ? '#0284C7' : 'transparent'}; color: ${this.activeTab === 'colorblind' ? '#fff' : '#94A3B8'};">🎨 Color</button>
            <button class="swde-tab-btn" data-tab="vision" style="padding: 5px 8px; border-radius: 6px; border: none; cursor: pointer; white-space: nowrap; font-weight: 600; background: ${this.activeTab === 'vision' ? '#0284C7' : 'transparent'}; color: ${this.activeTab === 'vision' ? '#fff' : '#94A3B8'};">🔍 Vision</button>
            <button class="swde-tab-btn" data-tab="speech" style="padding: 5px 8px; border-radius: 6px; border: none; cursor: pointer; white-space: nowrap; font-weight: 600; background: ${this.activeTab === 'speech' ? '#0284C7' : 'transparent'}; color: ${this.activeTab === 'speech' ? '#fff' : '#94A3B8'};">🔊 Reader</button>
            <button class="swde-tab-btn" data-tab="safety" style="padding: 5px 8px; border-radius: 6px; border: none; cursor: pointer; white-space: nowrap; font-weight: 600; background: ${this.activeTab === 'safety' ? '#0284C7' : 'transparent'}; color: ${this.activeTab === 'safety' ? '#fff' : '#94A3B8'};">🛡️ Safety</button>
            <button class="swde-tab-btn" data-tab="tools" style="padding: 5px 8px; border-radius: 6px; border: none; cursor: pointer; white-space: nowrap; font-weight: 600; background: ${this.activeTab === 'tools' ? '#0284C7' : 'transparent'}; color: ${this.activeTab === 'tools' ? '#fff' : '#94A3B8'};">🌐 Tools</button>
          </div>

          <!-- Body Content -->
          <div style="padding: 12px; overflow-y: auto; flex: 1; display: flex; flex-direction: column; gap: 10px; font-size: 12px;">

            ${this.renderTabContent(state, effective, {
              isMasterOn,
              currentMode,
              currentIntensity,
              warmTint,
              warmTintVal,
              brightnessVal,
              isRuler,
              isLineFocus,
              isSpotlight,
              isHoverSimple,
              zoomLevel,
              isNarrating,
            })}

          </div>

          <!-- Footer Actions -->
          <div style="padding: 10px 12px; background: #1C2541; border-top: 1px solid #2E4170; display: flex; justify-content: space-between; align-items: center;">
            <button id="swde-cc-reset-btn" style="background: transparent; border: 1px solid #475569; color: #CBD5E1; padding: 4px 8px; border-radius: 6px; font-size: 11px; cursor: pointer;">
              Reset Page
            </button>
            <button id="swde-cc-formfill-btn" style="background: #0EA5E9; color: #0B132B; border: none; padding: 5px 12px; border-radius: 6px; font-size: 11px; font-weight: bold; cursor: pointer;">
              ⚡ Form Fill
            </button>
          </div>
        </div>

        <!-- FLOATING MAIN TRIGGER BUTTON -->
        <button id="swde-cc-trigger-btn" title="Open Accessibility Control Centre (Alt + A)" style="width: 50px; height: 50px; border-radius: 50%; background: linear-gradient(135deg, #0EA5E9 0%, #0369A1 100%); color: #ffffff; border: 2px solid #38BDF8; box-shadow: 0 4px 18px rgba(14, 165, 233, 0.45); cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 22px; transition: transform 0.15s ease;">
          👁️
        </button>
      </div>
    `;

    this.attachEventListeners(state);
  }

  private static renderTabContent(state: any, effective: any, vals: any): string {
    switch (this.activeTab) {
      case 'quick':
        return `
          <div style="font-weight: 700; font-size: 11px; color: #38BDF8; text-transform: uppercase;">Quick Profiles</div>
          <div style="display: grid; grid-cols-2; grid-template-columns: 1fr 1fr; gap: 6px;">
            ${[
              { id: 'dyslexia', label: '📖 Dyslexia' },
              { id: 'colorBlindness', label: '🎨 Color Blind' },
              { id: 'lowVision', label: '🔍 Low Vision' },
              { id: 'photosensitivity', label: '🛡️ Seizure Guard' },
              { id: 'adhdFocus', label: '🎯 ADHD Focus' },
              { id: 'seniorFriendly', label: '👓 Senior Mode' },
            ].map((p) => {
              const active = state.profiles.some((prof: any) => (prof.presetId === p.id || prof.id === p.id) && prof.enabled);
              return `
                <button class="swde-profile-toggle-btn" data-preset="${p.id}" style="padding: 8px; border-radius: 8px; border: 1px solid ${active ? '#0EA5E9' : '#2E4170'}; background: ${active ? '#0369A1' : '#1C2541'}; color: #fff; font-size: 11px; font-weight: 600; text-align: left; cursor: pointer;">
                  ${p.label}
                </button>
              `;
            }).join('')}
          </div>
          <button id="swde-quick-readerview" style="width: 100%; padding: 8px; background: #1C2541; border: 1px solid #0EA5E9; color: #38BDF8; border-radius: 8px; font-weight: 600; cursor: pointer; margin-top: 4px;">
            📖 Open Distraction-Free Reader View
          </button>
        `;

      case 'dyslexia':
        return `
          <div style="font-weight: 700; font-size: 11px; color: #38BDF8; text-transform: uppercase;">Dyslexia & Reading Focus</div>
          
          <label style="display: flex; justify-content: space-between; align-items: center; background: #1C2541; padding: 8px; border-radius: 8px;">
            <span>Highlight Current Line Focus</span>
            <input type="checkbox" id="swde-toggle-linefocus" ${vals.isLineFocus ? 'checked' : ''} style="accent-color: #0EA5E9;" />
          </label>

          <label style="display: flex; justify-content: space-between; align-items: center; background: #1C2541; padding: 8px; border-radius: 8px;">
            <span>Movable Reading Ruler</span>
            <input type="checkbox" id="swde-toggle-ruler" ${vals.isRuler ? 'checked' : ''} style="accent-color: #0EA5E9;" />
          </label>

          <label style="display: flex; justify-content: space-between; align-items: center; background: #1C2541; padding: 8px; border-radius: 8px;">
            <span>Hover Sentence Simplifier</span>
            <input type="checkbox" id="swde-toggle-hover-simple" ${vals.isHoverSimple ? 'checked' : ''} style="accent-color: #0EA5E9;" />
          </label>

          <div style="background: #1C2541; padding: 10px; border-radius: 8px;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
              <span>Warm Tint Comfort:</span>
              <span id="swde-warmtint-val" style="color: #FCD34D;">${vals.warmTintVal}%</span>
            </div>
            <input type="range" id="swde-warmtint-slider" min="0" max="40" step="5" value="${vals.warmTintVal}" style="width: 100%; accent-color: #F59E0B;" />
          </div>
        `;

      case 'colorblind':
        return `
          <div style="font-weight: 700; font-size: 11px; color: #38BDF8; text-transform: uppercase;">8 Color Vision Deficiency Presets</div>
          <div style="display: flex; flex-direction: column; gap: 4px;">
            <select id="swde-colorblind-select" style="width: 100%; background: #1C2541; border: 1px solid #2E4170; color: #fff; padding: 8px; border-radius: 8px; font-size: 11px;">
              <option value="none" ${vals.currentMode === 'none' ? 'selected' : ''}>Original (Normal Color Vision)</option>
              <option value="protanopia" ${vals.currentMode === 'protanopia' ? 'selected' : ''}>Protanopia (Red-Blind, Severe)</option>
              <option value="protanomaly" ${vals.currentMode === 'protanomaly' ? 'selected' : ''}>Protanomaly (Red-Weak)</option>
              <option value="deuteranopia" ${vals.currentMode === 'deuteranopia' ? 'selected' : ''}>Deuteranopia (Green-Blind, Severe)</option>
              <option value="deuteranomaly" ${vals.currentMode === 'deuteranomaly' ? 'selected' : ''}>Deuteranomaly (Green-Weak)</option>
              <option value="tritanopia" ${vals.currentMode === 'tritanopia' ? 'selected' : ''}>Tritanopia (Blue-Blind, Severe)</option>
              <option value="tritanomaly" ${vals.currentMode === 'tritanomaly' ? 'selected' : ''}>Tritanomaly (Blue-Weak)</option>
              <option value="achromatopsia" ${vals.currentMode === 'achromatopsia' ? 'selected' : ''}>Achromatopsia (Monochromacy)</option>
              <option value="achromatomaly" ${vals.currentMode === 'achromatomaly' ? 'selected' : ''}>Achromatomaly (Partial Monochromacy)</option>
            </select>

            <div style="background: #1C2541; padding: 8px; border-radius: 8px; margin-top: 4px;">
              <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                <span>Correction Intensity:</span>
                <span id="swde-cb-intensity-val" style="color: #38BDF8;">${vals.currentIntensity}%</span>
              </div>
              <input type="range" id="swde-cb-intensity-slider" min="10" max="100" step="10" value="${vals.currentIntensity}" style="width: 100%; accent-color: #0EA5E9;" />
            </div>
          </div>
        `;

      case 'vision':
        return `
          <div style="font-weight: 700; font-size: 11px; color: #38BDF8; text-transform: uppercase;">Low Vision & Themes</div>
          
          <div style="display: flex; justify-content: space-between; align-items: center; background: #1C2541; padding: 8px; border-radius: 8px;">
            <span>Page Magnification:</span>
            <div style="display: flex; gap: 6px; align-items: center;">
              <button id="swde-zoom-minus" style="background: #2E4170; border: none; color: #fff; width: 26px; height: 26px; border-radius: 6px; cursor: pointer; font-weight: bold;">-</button>
              <span style="font-weight: bold; width: 44px; text-align: center;">${vals.zoomLevel}%</span>
              <button id="swde-zoom-plus" style="background: #2E4170; border: none; color: #fff; width: 26px; height: 26px; border-radius: 6px; cursor: pointer; font-weight: bold;">+</button>
            </div>
          </div>

          <div style="background: #1C2541; padding: 8px; border-radius: 8px;">
            <div style="font-size: 11px; margin-bottom: 4px; color: #94A3B8;">High Contrast Theme:</div>
            <select id="swde-theme-select" style="width: 100%; background: #0B132B; border: 1px solid #2E4170; color: #fff; padding: 6px; border-radius: 6px; font-size: 11px;">
              <option value="normal">Standard Web Colors</option>
              <option value="high">High Contrast Bold</option>
              <option value="dark">Dark Theme</option>
              <option value="yellow_on_black">Yellow on Black (Low Vision)</option>
              <option value="black_on_yellow">Black on Yellow</option>
              <option value="cyan_on_black">Cyan on Black</option>
              <option value="sepia">Warm Sepia</option>
            </select>
          </div>
        `;

      case 'speech':
        return `
          <div style="font-weight: 700; font-size: 11px; color: #38BDF8; text-transform: uppercase;">Screen Reader & Narration</div>
          
          <div style="background: #1C2541; padding: 10px; border-radius: 8px; text-align: center;">
            <div style="font-size: 10px; color: #38BDF8; font-weight: bold; margin-bottom: 6px;">SYNCHRONIZED VISUAL NARRATOR</div>
            <div style="display: flex; gap: 6px; justify-content: center; margin-bottom: 8px;">
              <button id="swde-spk-prev" style="background: #2E4170; border: none; color: #fff; padding: 6px 12px; border-radius: 6px; cursor: pointer;">⏮ Prev</button>
              <button id="swde-spk-play" style="background: #0EA5E9; border: none; color: #0B132B; font-weight: bold; padding: 6px 16px; border-radius: 6px; cursor: pointer;">
                ${vals.isNarrating ? '⏹ Stop' : '🔊 Read Page'}
              </button>
              <button id="swde-spk-next" style="background: #2E4170; border: none; color: #fff; padding: 6px 12px; border-radius: 6px; cursor: pointer;">⏭ Next</button>
            </div>
            <div style="font-size: 10px; color: #94A3B8;">Highlights active sentence & scrolls into view automatically</div>
          </div>

          <div style="font-size: 11px; color: #94A3B8; margin-top: 4px;">Landmark Navigation Shortcuts:</div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 4px; font-size: 10px;">
            <button id="swde-nav-headings" style="background: #1C2541; border: 1px solid #2E4170; color: #E2E8F0; padding: 6px; border-radius: 6px; cursor: pointer;">H: Headings (Alt+H)</button>
            <button id="swde-nav-links" style="background: #1C2541; border: 1px solid #2E4170; color: #E2E8F0; padding: 6px; border-radius: 6px; cursor: pointer;">L: Links (Alt+L)</button>
            <button id="swde-nav-buttons" style="background: #1C2541; border: 1px solid #2E4170; color: #E2E8F0; padding: 6px; border-radius: 6px; cursor: pointer;">B: Buttons (Alt+B)</button>
            <button id="swde-nav-forms" style="background: #1C2541; border: 1px solid #2E4170; color: #E2E8F0; padding: 6px; border-radius: 6px; cursor: pointer;">F: Forms (Alt+F)</button>
          </div>
        `;

      case 'safety':
        return `
          <div style="font-weight: 700; font-size: 11px; color: #38BDF8; text-transform: uppercase;">Photosensitivity & ADHD Focus</div>
          
          <button id="swde-emergency-btn" style="width: 100%; padding: 10px; background: #DC2626; color: #fff; border: 2px solid #EF4444; border-radius: 8px; font-weight: 800; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 6px;">
            🛑 EMERGENCY STOP ALL MEDIA
          </button>

          <div style="background: #1C2541; padding: 8px; border-radius: 8px;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
              <span>Brightness Reduction Dimmer:</span>
              <span id="swde-dimmer-val" style="color: #38BDF8;">${vals.brightnessVal}%</span>
            </div>
            <input type="range" id="swde-dimmer-slider" min="0" max="70" step="5" value="${vals.brightnessVal}" style="width: 100%; accent-color: #0EA5E9;" />
          </div>

          <label style="display: flex; justify-content: space-between; align-items: center; background: #1C2541; padding: 8px; border-radius: 8px;">
            <span>ADHD Paragraph Spotlight</span>
            <input type="checkbox" id="swde-toggle-spotlight" ${vals.isSpotlight ? 'checked' : ''} style="accent-color: #0EA5E9;" />
          </label>
        `;

      case 'tools':
        return `
          <div style="font-weight: 700; font-size: 11px; color: #38BDF8; text-transform: uppercase;">Local AI, Translation & OCR</div>
          
          <div style="background: #1C2541; padding: 8px; border-radius: 8px;">
            <div style="font-size: 11px; margin-bottom: 4px;">Offline Page Translation:</div>
            <div style="display: flex; gap: 4px;">
              <select id="swde-trans-lang-select" style="flex: 1; background: #0B132B; border: 1px solid #2E4170; color: #fff; padding: 6px; border-radius: 6px; font-size: 11px;">
                <option value="hi">Hindi (हिन्दी)</option>
                <option value="kn">Kannada (ಕನ್ನಡ)</option>
                <option value="ta">Tamil (தமிழ்)</option>
                <option value="te">Telugu (తెలుగు)</option>
                <option value="ml">Malayalam (മലയാളം)</option>
                <option value="bn">Bengali (বাংলা)</option>
                <option value="mr">Marathi (मराठी)</option>
              </select>
              <button id="swde-trans-apply-btn" style="background: #0284C7; color: #fff; border: none; padding: 6px 10px; border-radius: 6px; font-weight: bold; cursor: pointer;">Translate</button>
            </div>
            <button id="swde-trans-revert-btn" style="margin-top: 6px; width: 100%; background: transparent; border: 1px solid #475569; color: #94A3B8; padding: 4px; border-radius: 6px; font-size: 10px; cursor: pointer;">Restore Original English</button>
          </div>

          <button id="swde-ocr-scan-btn" style="width: 100%; padding: 8px; background: #1C2541; border: 1px solid #2E4170; color: #F1F5F9; border-radius: 8px; font-weight: 600; cursor: pointer; text-align: left;">
            🖼️ Scan Images & Extract Text (Local OCR)
          </button>
        `;

      default:
        return '';
    }
  }

  private static attachEventListeners(state: any): void {
    if (!this.rootEl) return;

    // Main Toggle Button
    const trigger = this.rootEl.querySelector('#swde-cc-trigger-btn');
    trigger?.addEventListener('click', () => this.toggle());

    // Close Button
    const closeBtn = this.rootEl.querySelector('#swde-cc-close-btn');
    closeBtn?.addEventListener('click', () => this.close());

    // Dragging mechanism
    this.setupDraggable(trigger as HTMLElement);

    // Tab buttons
    this.rootEl.querySelectorAll('.swde-tab-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const tab = btn.getAttribute('data-tab');
        if (tab) {
          this.activeTab = tab;
          this.render();
        }
      });
    });

    // Master toggle button
    this.rootEl.querySelector('#swde-cc-master-toggle')?.addEventListener('click', async () => {
      await ProfileManager.toggleMaster();
      const updated = await ProfileManager.getState();
      const effective = ProfileManager.getEffectiveSettings(updated);
      StyleGenerator.applyToDOM(effective);
      this.render();
    });

    // Profile toggle buttons
    this.rootEl.querySelectorAll('.swde-profile-toggle-btn').forEach((btn) => {
      btn.addEventListener('click', async () => {
        const presetId = btn.getAttribute('data-preset');
        if (presetId) {
          await ProfileManager.toggleProfile(presetId);
          const updated = await ProfileManager.getState();
          const effective = ProfileManager.getEffectiveSettings(updated);
          StyleGenerator.applyToDOM(effective);
          this.render();
        }
      });
    });

    // Reset Page
    this.rootEl.querySelector('#swde-cc-reset-btn')?.addEventListener('click', async () => {
      await ProfileManager.toggleMaster(false);
      StyleGenerator.removeFromDOM();
      LocalTranslationEngine.restoreOriginalPage();
      this.render();
    });

    // Form Fill
    this.rootEl.querySelector('#swde-cc-formfill-btn')?.addEventListener('click', () => {
      if (this.onTriggerFormFill) this.onTriggerFormFill();
    });

    // Reader View
    this.rootEl.querySelector('#swde-quick-readerview')?.addEventListener('click', () => {
      ReadingModeOverlay.open();
      this.close();
    });

    // Line Focus toggle
    this.rootEl.querySelector('#swde-toggle-linefocus')?.addEventListener('change', async (e) => {
      const checked = (e.target as HTMLInputElement).checked;
      const s = await ProfileManager.getState();
      const prof = s.profiles.find((p) => p.presetId === 'dyslexia');
      if (prof) prof.visualSettings.singleLineFocus = checked;
      await ProfileManager.saveState(s);
      StyleGenerator.applyToDOM(ProfileManager.getEffectiveSettings(s));
    });

    // Reading Ruler toggle
    this.rootEl.querySelector('#swde-toggle-ruler')?.addEventListener('change', async (e) => {
      const checked = (e.target as HTMLInputElement).checked;
      const s = await ProfileManager.getState();
      const prof = s.profiles.find((p) => p.presetId === 'dyslexia');
      if (prof) prof.visualSettings.readingRuler = checked;
      await ProfileManager.saveState(s);
      StyleGenerator.applyToDOM(ProfileManager.getEffectiveSettings(s));
    });

    // Hover sentence simplifier toggle
    this.rootEl.querySelector('#swde-toggle-hover-simple')?.addEventListener('change', async (e) => {
      const checked = (e.target as HTMLInputElement).checked;
      if (checked) SentenceHoverSimplifier.enable();
      else SentenceHoverSimplifier.disable();
    });

    // Warm tint slider
    const tintSlider = this.rootEl.querySelector('#swde-warmtint-slider') as HTMLInputElement | null;
    tintSlider?.addEventListener('input', async (e) => {
      const val = Number((e.target as HTMLInputElement).value);
      const span = this.rootEl?.querySelector('#swde-warmtint-val');
      if (span) span.textContent = `${val}%`;
      StyleGenerator.updateWarmTint(val > 0, val);
    });

    // Colorblind preset dropdown
    const cbSelect = this.rootEl.querySelector('#swde-colorblind-select') as HTMLSelectElement | null;
    cbSelect?.addEventListener('change', async (e) => {
      const mode = (e.target as HTMLSelectElement).value as ColorBlindnessType;
      const s = await ProfileManager.getState();
      const prof = s.profiles.find((p) => p.presetId === 'colorBlindness');
      if (prof) prof.visualSettings.colorBlindnessMode = mode;
      await ProfileManager.saveState(s);
      StyleGenerator.applyToDOM(ProfileManager.getEffectiveSettings(s));
    });

    // Colorblind intensity slider
    const cbIntensity = this.rootEl.querySelector('#swde-cb-intensity-slider') as HTMLInputElement | null;
    cbIntensity?.addEventListener('input', async (e) => {
      const val = Number((e.target as HTMLInputElement).value);
      const span = this.rootEl?.querySelector('#swde-cb-intensity-val');
      if (span) span.textContent = `${val}%`;
      const s = await ProfileManager.getState();
      const prof = s.profiles.find((p) => p.presetId === 'colorBlindness');
      if (prof) prof.visualSettings.colorBlindnessIntensity = val;
      await ProfileManager.saveState(s);
      StyleGenerator.applyToDOM(ProfileManager.getEffectiveSettings(s));
    });

    // Zoom controls
    this.rootEl.querySelector('#swde-zoom-plus')?.addEventListener('click', async () => {
      const s = await ProfileManager.getState();
      const prof = s.profiles.find((p) => p.presetId === 'lowVision');
      if (prof) prof.visualSettings.pageZoomLevel = Math.min(200, (prof.visualSettings.pageZoomLevel || 100) + 15);
      await ProfileManager.saveState(s);
      StyleGenerator.applyToDOM(ProfileManager.getEffectiveSettings(s));
      this.render();
    });

    this.rootEl.querySelector('#swde-zoom-minus')?.addEventListener('click', async () => {
      const s = await ProfileManager.getState();
      const prof = s.profiles.find((p) => p.presetId === 'lowVision');
      if (prof) prof.visualSettings.pageZoomLevel = Math.max(90, (prof.visualSettings.pageZoomLevel || 100) - 15);
      await ProfileManager.saveState(s);
      StyleGenerator.applyToDOM(ProfileManager.getEffectiveSettings(s));
      this.render();
    });

    // Theme selector
    const themeSelect = this.rootEl.querySelector('#swde-theme-select') as HTMLSelectElement | null;
    themeSelect?.addEventListener('change', async (e) => {
      const mode = (e.target as HTMLSelectElement).value as ThemePresetType;
      const s = await ProfileManager.getState();
      const prof = s.profiles.find((p) => p.presetId === 'lowVision');
      if (prof) prof.visualSettings.contrastMode = mode;
      await ProfileManager.saveState(s);
      StyleGenerator.applyToDOM(ProfileManager.getEffectiveSettings(s));
    });

    // Speech narrator play / stop
    this.rootEl.querySelector('#swde-spk-play')?.addEventListener('click', () => {
      if (SynchronizedReadingEngine.isNarratingActive()) {
        SynchronizedReadingEngine.stopNarration();
      } else {
        SynchronizedReadingEngine.startNarration();
      }
      this.render();
    });

    this.rootEl.querySelector('#swde-spk-next')?.addEventListener('click', () => {
      SynchronizedReadingEngine.nextSentence();
    });

    this.rootEl.querySelector('#swde-spk-prev')?.addEventListener('click', () => {
      SynchronizedReadingEngine.prevSentence();
    });

    // Landmark navigation
    this.rootEl.querySelector('#swde-nav-headings')?.addEventListener('click', () => {
      SynchronizedReadingEngine.navigateToType('heading');
    });
    this.rootEl.querySelector('#swde-nav-links')?.addEventListener('click', () => {
      SynchronizedReadingEngine.navigateToType('link');
    });
    this.rootEl.querySelector('#swde-nav-buttons')?.addEventListener('click', () => {
      SynchronizedReadingEngine.navigateToType('button');
    });
    this.rootEl.querySelector('#swde-nav-forms')?.addEventListener('click', () => {
      SynchronizedReadingEngine.navigateToType('form');
    });

    // Emergency Stop
    this.rootEl.querySelector('#swde-emergency-btn')?.addEventListener('click', () => {
      PhotosensitivityGuard.triggerEmergencyStop();
      alert('Emergency freeze active: all video, audio and animations paused.');
    });

    // Dimmer slider
    const dimmerSlider = this.rootEl.querySelector('#swde-dimmer-slider') as HTMLInputElement | null;
    dimmerSlider?.addEventListener('input', (e) => {
      const val = Number((e.target as HTMLInputElement).value);
      const span = this.rootEl?.querySelector('#swde-dimmer-val');
      if (span) span.textContent = `${val}%`;
      StyleGenerator.updateBrightnessReduction(val);
    });

    // ADHD Spotlight toggle
    this.rootEl.querySelector('#swde-toggle-spotlight')?.addEventListener('change', (e) => {
      const checked = (e.target as HTMLInputElement).checked;
      if (checked) AdhdFocusEngine.enableSpotlight();
      else AdhdFocusEngine.disableSpotlight();
    });

    // Translation
    this.rootEl.querySelector('#swde-trans-apply-btn')?.addEventListener('click', () => {
      const lang = (this.rootEl?.querySelector('#swde-trans-lang-select') as HTMLSelectElement)?.value || 'hi';
      const outcome = LocalTranslationEngine.translatePageDOM(lang);
      alert(`Page translated into selected regional language (${outcome.translatedCount} text nodes updated).`);
    });

    this.rootEl.querySelector('#swde-trans-revert-btn')?.addEventListener('click', () => {
      LocalTranslationEngine.restoreOriginalPage();
      alert('Restored original English text.');
    });

    // Image OCR Scan
    this.rootEl.querySelector('#swde-ocr-scan-btn')?.addEventListener('click', async () => {
      const results = await ImageOcrEngine.scanAllImages();
      if (results.length === 0) {
        alert('No relevant images found on this page.');
      } else {
        ImageOcrEngine.showImageOverlay(results[0]);
        alert(`Scanned ${results.length} image(s). Showing understanding overlay for the first image.`);
      }
    });
  }

  private static setupDraggable(triggerEl: HTMLElement): void {
    if (!this.rootEl || !triggerEl) return;

    let isDragging = false;
    let startX = 0;
    let startY = 0;
    let startRight = 0;
    let startBottom = 0;

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      startX = e.clientX;
      startY = e.clientY;
      const rect = this.rootEl!.getBoundingClientRect();
      startRight = window.innerWidth - rect.right;
      startBottom = window.innerHeight - rect.bottom;

      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onMouseUp);
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging || !this.rootEl) return;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;

      const newRight = Math.max(10, Math.min(window.innerWidth - 60, startRight - dx));
      const newBottom = Math.max(10, Math.min(window.innerHeight - 60, startBottom - dy));

      this.rootEl.style.right = `${newRight}px`;
      this.rootEl.style.bottom = `${newBottom}px`;
    };

    const onMouseUp = () => {
      if (isDragging && this.rootEl) {
        isDragging = false;
        const rect = this.rootEl.getBoundingClientRect();
        SafeStorage.set(STORAGE_POS_KEY, { x: rect.left, y: rect.top });
      }
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };

    triggerEl.addEventListener('mousedown', onMouseDown);
  }
}
