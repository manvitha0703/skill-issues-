import { EffectiveSettings } from './profileManager';
import { injectSvgFilters, removeSvgFilters } from './svgFilters';
import { ColorBlindnessType } from '../types/profile';

const STYLE_ELEMENT_ID = 'swde-injected-accessibility-styles';
const READING_RULER_ID = 'swde-reading-ruler';
const LINE_FOCUS_TOP_ID = 'swde-line-focus-top';
const LINE_FOCUS_BOTTOM_ID = 'swde-line-focus-bottom';
const WARM_TINT_ID = 'swde-warm-tint-overlay';
const BRIGHTNESS_OVERLAY_ID = 'swde-brightness-overlay';
const SPOTLIGHT_STYLE_ID = 'swde-spotlight-styles';

export class StyleGenerator {
  /**
   * Generates dynamic CSS rules based on the effective combined accessibility settings.
   */
  static generateCSS(settings: EffectiveSettings): string {
    const { visual, reading, interaction } = settings;
    const rules: string[] = [];

    // 1. Dyslexia, Fonts & Typography
    let fontDeclaration = '';
    if (visual.fontFamily === 'opendyslexic') {
      fontDeclaration = `font-family: 'OpenDyslexic', 'Comic Sans MS', 'Verdana', sans-serif !important;`;
    } else if (visual.fontFamily === 'atkinson') {
      fontDeclaration = `font-family: 'Atkinson Hyperlegible', 'Verdana', 'Segoe UI', sans-serif !important;`;
    } else if (visual.fontFamily === 'lexend') {
      fontDeclaration = `font-family: 'Lexend', 'Trebuchet MS', 'Segoe UI', sans-serif !important;`;
    } else if (visual.fontFamily === 'sans-serif') {
      fontDeclaration = `font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif !important;`;
    } else if (visual.fontFamily === 'serif') {
      fontDeclaration = `font-family: 'Georgia', 'Times New Roman', serif !important;`;
    }

    const typographyRules: string[] = [];
    if (fontDeclaration) typographyRules.push(fontDeclaration);
    if (visual.letterSpacing > 0) typographyRules.push(`letter-spacing: ${visual.letterSpacing}px !important;`);
    if (visual.wordSpacing > 0) typographyRules.push(`word-spacing: ${visual.wordSpacing}px !important;`);
    if (visual.lineHeight > 1.0) typographyRules.push(`line-height: ${visual.lineHeight} !important;`);

    if (typographyRules.length > 0) {
      rules.push(`
        p, li, article, main, span, div, a, label, input, textarea, select {
          ${typographyRules.join('\n  ')}
        }
      `);
    }

    if (visual.paragraphSpacing > 0) {
      rules.push(`
        p, article > div, ul, ol {
          margin-bottom: ${visual.paragraphSpacing}px !important;
        }
      `);
    }

    // 2. Font Size Scaling & Page Zoom
    if (visual.fontSizeAdjustment > 0) {
      const scale = 1 + visual.fontSizeAdjustment / 100;
      rules.push(`
        html {
          font-size: ${scale * 100}% !important;
        }
        body {
          font-size: 1rem !important;
        }
        p, li, span, a, label, input, button, select, textarea {
          font-size: calc(1em * ${scale}) !important;
        }
        h1 { font-size: calc(2.2em * ${scale}) !important; }
        h2 { font-size: calc(1.8em * ${scale}) !important; }
        h3 { font-size: calc(1.4em * ${scale}) !important; }
      `);
    }

    if (visual.pageZoomLevel && visual.pageZoomLevel !== 100) {
      rules.push(`
        html {
          zoom: ${visual.pageZoomLevel}% !important;
        }
      `);
    }

    // 3. Color Blindness SVG Filter
    if (visual.colorBlindnessMode !== 'none') {
      const filterId =
        visual.colorBlindnessMode === 'highContrast'
          ? 'swde-filter-high-contrast'
          : `swde-filter-${visual.colorBlindnessMode}`;
      rules.push(`
        html {
          filter: url(#${filterId}) !important;
        }
      `);
    }

    // 4. Contrast & Low Vision Themes
    if (visual.contrastMode === 'high') {
      rules.push(`
        html {
          filter: contrast(${visual.customContrastRatio || 1.35}) !important;
        }
        body {
          background-color: #ffffff !important;
          color: #000000 !important;
        }
        p, span, h1, h2, h3, h4, h5, h6, li, label {
          color: #000000 !important;
        }
      `);
    } else if (visual.contrastMode === 'dark') {
      rules.push(`
        html, body {
          background-color: #0f172a !important;
          color: #f8fafc !important;
        }
        p, span, h1, h2, h3, h4, h5, h6, li, label, div {
          color: #f1f5f9 !important;
        }
        a {
          color: #38bdf8 !important;
        }
        input, select, textarea {
          background-color: #1e293b !important;
          color: #f8fafc !important;
          border-color: #475569 !important;
        }
      `);
    } else if (visual.contrastMode === 'yellow_on_black') {
      rules.push(`
        html, body {
          background-color: #000000 !important;
          color: #ffff00 !important;
        }
        p, span, h1, h2, h3, h4, h5, h6, li, label, div, a, button {
          color: #ffff00 !important;
          background-color: transparent !important;
        }
        a {
          text-decoration: underline 2px #ffff00 !important;
        }
        input, select, textarea, button {
          border: 2px solid #ffff00 !important;
          background-color: #111111 !important;
          color: #ffff00 !important;
        }
      `);
    } else if (visual.contrastMode === 'black_on_yellow') {
      rules.push(`
        html, body {
          background-color: #ffff00 !important;
          color: #000000 !important;
        }
        p, span, h1, h2, h3, h4, h5, h6, li, label, div, a, button {
          color: #000000 !important;
          background-color: transparent !important;
        }
        input, select, textarea, button {
          border: 2px solid #000000 !important;
          background-color: #ffffff !important;
          color: #000000 !important;
        }
      `);
    } else if (visual.contrastMode === 'cyan_on_black') {
      rules.push(`
        html, body {
          background-color: #000000 !important;
          color: #00ffff !important;
        }
        p, span, h1, h2, h3, h4, h5, h6, li, label, div, a, button {
          color: #00ffff !important;
          background-color: transparent !important;
        }
        input, select, textarea, button {
          border: 2px solid #00ffff !important;
          background-color: #111111 !important;
          color: #00ffff !important;
        }
      `);
    } else if (visual.contrastMode === 'inverted') {
      rules.push(`
        html {
          filter: invert(0.95) hue-rotate(180deg) !important;
        }
        img, video, canvas, svg {
          filter: invert(1) hue-rotate(180deg) !important;
        }
      `);
    } else if (visual.contrastMode === 'sepia') {
      rules.push(`
        html {
          filter: sepia(0.4) contrast(1.1) brightness(0.95) !important;
          background-color: #fbf0d9 !important;
        }
      `);
    }

    // 5. Link & Heading Highlighting
    if (visual.highlightLinks) {
      rules.push(`
        a {
          text-decoration: underline 2.5px #0284c7 !important;
          text-underline-offset: 4px !important;
          font-weight: 600 !important;
          color: #0369a1 !important;
        }
        a:hover, a:focus {
          background-color: #e0f2fe !important;
          border-radius: 3px !important;
        }
      `);
    }

    if (visual.highlightHeadings) {
      rules.push(`
        h1, h2, h3, h4, h5, h6 {
          border-left: 4px solid #0ea5e9 !important;
          padding-left: 10px !important;
          margin-top: 14px !important;
          margin-bottom: 8px !important;
        }
      `);
    }

    // 6. Large Click Targets & Motor Assistance
    if (visual.largeClickTargets || interaction.largeInteractiveButtons) {
      rules.push(`
        button, a.btn, input[type="button"], input[type="submit"], input[type="reset"], [role="button"] {
          min-height: 46px !important;
          min-width: 46px !important;
          padding: 10px 18px !important;
          font-weight: 600 !important;
          cursor: pointer !important;
          margin: 4px !important;
          border-radius: 8px !important;
        }
        input, select, textarea {
          min-height: 44px !important;
          padding: 8px 12px !important;
        }
      `);
    }

    // 7. Enhanced Focus Indicators
    if (interaction.visibleFocusIndicators) {
      rules.push(`
        :focus, :focus-visible {
          outline: 3.5px solid #0ea5e9 !important;
          outline-offset: 3px !important;
          box-shadow: 0 0 0 6px rgba(14, 165, 233, 0.45) !important;
          transition: outline 0.1s ease-in-out !important;
        }
      `);
    }

    // 8. Custom Accessible Cursor
    if (visual.customCursor) {
      rules.push(`
        *, html, body, a, button, input {
          cursor: default !important;
        }
        a, button, [role="button"], input[type="submit"] {
          cursor: pointer !important;
        }
      `);
    }

    // 9. Photosensitivity & Reduced Motion / Emergency Stop
    if (
      interaction.reduceMotion ||
      interaction.disableTransitions ||
      interaction.suppressFlashingContent ||
      interaction.emergencyStopActive
    ) {
      rules.push(`
        *, *::before, *::after {
          animation-duration: 0.0001ms !important;
          animation-iteration-count: 1 !important;
          transition-duration: 0.0001ms !important;
          transition-delay: 0s !important;
          scroll-behavior: auto !important;
        }
        .flashing, .blink, [class*="blink"], [class*="pulse"], marquee {
          animation: none !important;
          opacity: 1 !important;
        }
      `);
    }

    // 10. ADHD Focus & Clutter Reduction
    if (reading.hideAdsAndBanners || reading.adhdFocusDimClutter) {
      const strictness = reading.distractionFilteringIntensity || 'moderate';
      if (strictness === 'strict') {
        rules.push(`
          .ad, .advertisement, [id*="ad-"], [class*="ad-"], [class*="banner-promo"],
          [id*="banner-promo"], [class*="floating-ad"], [class*="sponsor"],
          [class*="popup"], [class*="modal-backdrop"], [id*="newsletter"],
          aside, .sidebar {
            display: none !important;
          }
        `);
      } else {
        rules.push(`
          .ad, .advertisement, [id*="ad-"], [class*="ad-"], [class*="banner-promo"],
          [id*="banner-promo"], [class*="floating-ad"], [class*="sponsor"] {
            display: none !important;
          }
        `);
      }
    }

    if (reading.hideSidebar && reading.distractionFilteringIntensity !== 'strict') {
      rules.push(`
        aside, .sidebar, [class*="sidebar"]:not(body):not(html) {
          opacity: 0.25 !important;
          filter: grayscale(1) !important;
          transition: opacity 0.2s ease !important;
        }
        aside:hover, .sidebar:hover {
          opacity: 1 !important;
          filter: none !important;
        }
      `);
    }

    // 11. Reading Paragraph Highlighting
    if (reading.highlightCurrentParagraph) {
      rules.push(`
        p:hover, article p:hover, li:hover {
          background-color: rgba(224, 242, 254, 0.45) !important;
          border-left: 3px solid #0284c7 !important;
          padding-left: 8px !important;
          border-radius: 4px !important;
        }
      `);
    }

    // 12. Active Paragraph Spotlight for ADHD
    if (reading.activeParagraphSpotlight) {
      rules.push(`
        body.swde-spotlight-active article p,
        body.swde-spotlight-active main p,
        body.swde-spotlight-active .content p {
          opacity: 0.3 !important;
          filter: blur(0.5px) !important;
          transition: opacity 0.2s ease, filter 0.2s ease !important;
        }
        body.swde-spotlight-active article p:hover,
        body.swde-spotlight-active main p:hover,
        body.swde-spotlight-active .content p:hover,
        body.swde-spotlight-active p.swde-current-focus {
          opacity: 1 !important;
          filter: none !important;
          background: rgba(254, 243, 199, 0.5) !important;
          border-radius: 6px !important;
          padding: 4px 8px !important;
        }
      `);
    }

    return rules.join('\n\n');
  }

  /**
   * Applies the complete style and overlay ecosystem to document DOM.
   */
  static applyToDOM(settings: EffectiveSettings | null): void {
    if (typeof document === 'undefined') return;

    this.removeFromDOM();

    if (!settings) {
      removeSvgFilters();
      return;
    }

    // 1. Inject SVG Filters with requested intensity
    if (settings.visual.colorBlindnessMode !== 'none') {
      injectSvgFilters(settings.visual.colorBlindnessIntensity ?? 100, settings.visual.colorBlindnessMode);
    } else {
      removeSvgFilters();
    }

    // 2. Inject Dynamic CSS
    const cssText = this.generateCSS(settings);
    const styleEl = document.createElement('style');
    styleEl.id = STYLE_ELEMENT_ID;
    styleEl.textContent = cssText;
    document.head.appendChild(styleEl);

    // 3. Warm Background Tint Overlay
    this.updateWarmTint(settings.visual.warmTint, settings.visual.warmTintIntensity || 15);

    // 4. Photosensitivity Brightness Reduction Dimmer
    this.updateBrightnessReduction(settings.visual.brightnessReduction || 0);

    // 5. Single-Line Reading Focus / Reading Ruler
    this.updateReadingFocus(
      settings.visual.readingRuler,
      settings.visual.singleLineFocus,
      settings.visual.readingRulerHeight || 38
    );

    // 6. ADHD Paragraph Spotlight class
    if (settings.reading.activeParagraphSpotlight) {
      document.body.classList.add('swde-spotlight-active');
    } else {
      document.body.classList.remove('swde-spotlight-active');
    }

    // 7. Video Autoplay Suppression
    if (settings.interaction.pauseAutoplay || settings.interaction.emergencyStopActive) {
      this.suppressMediaPlayback();
    }
  }

  static removeFromDOM(): void {
    if (typeof document === 'undefined') return;
    const styleEl = document.getElementById(STYLE_ELEMENT_ID);
    if (styleEl) styleEl.remove();

    removeSvgFilters();
    this.updateWarmTint(false, 0);
    this.updateBrightnessReduction(0);
    this.updateReadingFocus(false, false, 36);
    document.body.classList.remove('swde-spotlight-active');
  }

  /**
   * Non-destructive warm background tint (e.g. amber/cream) for dyslexia eye comfort
   */
  static updateWarmTint(enableOrIntensity: boolean | number, intensityVal?: number): void {
    if (typeof document === 'undefined') return;
    const enable = typeof enableOrIntensity === 'boolean' ? enableOrIntensity : enableOrIntensity > 0;
    const intensity = typeof enableOrIntensity === 'number' ? enableOrIntensity : (intensityVal ?? 20);

    let overlay = document.getElementById(WARM_TINT_ID);

    if (!enable || intensity <= 0) {
      if (overlay) overlay.remove();
      return;
    }

    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = WARM_TINT_ID;
      overlay.setAttribute('aria-hidden', 'true');
      overlay.style.cssText = `
        position: fixed;
        inset: 0;
        pointer-events: none;
        z-index: 2147483641;
        mix-blend-mode: multiply;
        transition: background-color 0.2s ease;
      `;
      document.body.appendChild(overlay);
    }

    const alpha = (intensity / 100) * 0.45;
    overlay.style.backgroundColor = `rgba(255, 235, 175, ${alpha})`;
  }

  /**
   * Toggles the movable reading ruler on/off, or sets to specific boolean
   */
  static toggleReadingRuler(enableOrHeight?: boolean | number, height = 36): boolean {
    if (typeof document === 'undefined') return false;
    const existing = document.getElementById(READING_RULER_ID);
    const willEnable = typeof enableOrHeight === 'boolean' ? enableOrHeight : !existing;
    const actualHeight = typeof enableOrHeight === 'number' ? enableOrHeight : height;
    this.updateReadingFocus(willEnable, false, actualHeight);
    return willEnable;
  }

  /**
   * Dynamically applies or updates SVG color blindness filter
   */
  static updateColorBlindnessFilter(type: ColorBlindnessType, intensity = 100): void {
    if (typeof document === 'undefined') return;
    if (type === 'none') {
      removeSvgFilters();
      document.documentElement.style.removeProperty('filter');
    } else {
      injectSvgFilters(intensity, type);
      document.documentElement.style.filter = `url(#swde-filter-${type})`;
    }
  }

  /**
   * Non-destructive brightness reduction overlay for photosensitivity
   */
  static updateBrightnessReduction(percentage: number): void {
    if (typeof document === 'undefined') return;
    let overlay = document.getElementById(BRIGHTNESS_OVERLAY_ID);

    if (percentage <= 0) {
      if (overlay) overlay.remove();
      return;
    }

    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = BRIGHTNESS_OVERLAY_ID;
      overlay.setAttribute('aria-hidden', 'true');
      overlay.style.cssText = `
        position: fixed;
        inset: 0;
        pointer-events: none;
        z-index: 2147483642;
        transition: background-color 0.2s ease;
      `;
      document.body.appendChild(overlay);
    }

    const alpha = (percentage / 100) * 0.85;
    overlay.style.backgroundColor = `rgba(0, 0, 0, ${alpha})`;
  }

  /**
   * Single-line reading focus & movable reading ruler supporting mouse & keyboard
   */
  private static readingFocusY = 200;
  private static readingListenersAttached = false;

  static updateReadingFocus(ruler: boolean, singleLine: boolean, rulerHeight: number): void {
    if (typeof document === 'undefined') return;

    let rulerEl = document.getElementById(READING_RULER_ID);
    let topCurtain = document.getElementById(LINE_FOCUS_TOP_ID);
    let bottomCurtain = document.getElementById(LINE_FOCUS_BOTTOM_ID);

    if (!ruler && !singleLine) {
      if (rulerEl) rulerEl.remove();
      if (topCurtain) topCurtain.remove();
      if (bottomCurtain) bottomCurtain.remove();
      return;
    }

    // Create ruler if enabled
    if (ruler && !rulerEl) {
      rulerEl = document.createElement('div');
      rulerEl.id = READING_RULER_ID;
      rulerEl.setAttribute('aria-hidden', 'true');
      rulerEl.style.cssText = `
        position: fixed;
        left: 0;
        right: 0;
        height: ${rulerHeight}px;
        background: rgba(14, 165, 233, 0.15);
        border-top: 2px solid #0284c7;
        border-bottom: 2px solid #0284c7;
        pointer-events: none;
        z-index: 2147483643;
        transition: top 0.05s ease-out;
      `;
      document.body.appendChild(rulerEl);
    }

    // Create single line focus curtains if enabled (dims lines above & below)
    if (singleLine) {
      if (!topCurtain) {
        topCurtain = document.createElement('div');
        topCurtain.id = LINE_FOCUS_TOP_ID;
        topCurtain.setAttribute('aria-hidden', 'true');
        topCurtain.style.cssText = `
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          background: rgba(15, 23, 42, 0.45);
          pointer-events: none;
          z-index: 2147483642;
          transition: height 0.05s ease-out;
        `;
        document.body.appendChild(topCurtain);
      }

      if (!bottomCurtain) {
        bottomCurtain = document.createElement('div');
        bottomCurtain.id = LINE_FOCUS_BOTTOM_ID;
        bottomCurtain.setAttribute('aria-hidden', 'true');
        bottomCurtain.style.cssText = `
          position: fixed;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(15, 23, 42, 0.45);
          pointer-events: none;
          z-index: 2147483642;
          transition: top 0.05s ease-out;
        `;
        document.body.appendChild(bottomCurtain);
      }
    }

    const updatePositions = (clientY: number) => {
      this.readingFocusY = clientY;
      const halfH = rulerHeight / 2;
      const topY = Math.max(0, clientY - halfH);
      const bottomY = clientY + halfH;

      const r = document.getElementById(READING_RULER_ID);
      if (r) {
        r.style.top = `${topY}px`;
        r.style.height = `${rulerHeight}px`;
      }

      const tc = document.getElementById(LINE_FOCUS_TOP_ID);
      if (tc) {
        tc.style.height = `${topY}px`;
      }

      const bc = document.getElementById(LINE_FOCUS_BOTTOM_ID);
      if (bc) {
        bc.style.top = `${bottomY}px`;
      }
    };

    updatePositions(this.readingFocusY);

    if (!this.readingListenersAttached) {
      this.readingListenersAttached = true;
      window.addEventListener('mousemove', (e) => {
        updatePositions(e.clientY);
      });

      // Keyboard navigation (Alt + Up / Alt + Down)
      window.addEventListener('keydown', (e) => {
        if (e.altKey && (e.key === 'ArrowUp' || e.key === 'ArrowDown')) {
          e.preventDefault();
          const delta = e.key === 'ArrowUp' ? -28 : 28;
          updatePositions(Math.max(50, Math.min(window.innerHeight - 50, this.readingFocusY + delta)));
        }
      });
    }
  }

  static suppressMediaPlayback(): void {
    if (typeof document === 'undefined') return;
    document.querySelectorAll('video, audio').forEach((el) => {
      try {
        const media = el as HTMLMediaElement;
        media.autoplay = false;
        media.pause();
        media.removeAttribute('autoplay');
      } catch (_) {}
    });
  }
}
