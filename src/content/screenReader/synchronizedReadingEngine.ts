import { SpeechService } from '../../voice/speechService';

export interface ReadingSentence {
  element: HTMLElement;
  text: string;
  rect: DOMRect;
}

const INDICATOR_ID = 'swde-visual-reading-indicator';
const CURSOR_BADGE_ID = 'swde-reading-cursor-badge';

export class SynchronizedReadingEngine {
  private static sentences: ReadingSentence[] = [];
  private static currentIndex = 0;
  private static isNarrating = false;
  private static isPaused = false;
  private static indicatorEl: HTMLElement | null = null;
  private static cursorBadgeEl: HTMLElement | null = null;
  private static rate = 1.0;
  private static voiceName = '';

  // Element navigation state
  private static navigableElements: HTMLElement[] = [];
  private static navIndex = -1;

  static setVoiceOptions(rate = 1.0, voice = ''): void {
    this.rate = rate;
    this.voiceName = voice;
  }

  /**
   * Scans current visible document and prepares structured sentence queue
   */
  static prepareDocumentSentences(): ReadingSentence[] {
    if (typeof document === 'undefined') return [];

    const nodes = document.querySelectorAll<HTMLElement>(
      'main p, main h1, main h2, main h3, main h4, main h5, main h6, main li, article p, article h1, article h2, article h3, article li, .content p, p, h1, h2, h3, h4'
    );

    const queue: ReadingSentence[] = [];

    nodes.forEach((el) => {
      // Ignore extension overlay elements and invisible nodes
      if (
        el.closest('#swde-floating-toolbar-root') ||
        el.closest('#swde-sentence-simplifier-tooltip') ||
        el.closest('#swde-reading-mode-root') ||
        el.closest('#swde-form-review-modal') ||
        el.closest('nav') ||
        el.closest('header') ||
        el.offsetParent === null
      ) {
        return;
      }

      const text = el.textContent?.trim();
      if (!text || text.length < 5) return;

      // Extract individual sentences
      const parts = text.match(/[^.!?]+[.!?]+(\s|$)|[^.!?]+$/g);
      if (parts) {
        parts.forEach((p) => {
          const sText = p.trim();
          if (sText.length > 5) {
            queue.push({
              element: el,
              text: sText,
              rect: el.getBoundingClientRect(),
            });
          }
        });
      } else {
        queue.push({
          element: el,
          text,
          rect: el.getBoundingClientRect(),
        });
      }
    });

    this.sentences = queue;
    return queue;
  }

  /**
   * Starts synchronized audio-visual narration from current or first sentence
   */
  static startNarration(startIndex = 0): void {
    this.prepareDocumentSentences();
    if (this.sentences.length === 0) {
      SpeechService.speak('No readable text found on this page.');
      return;
    }

    this.currentIndex = Math.max(0, Math.min(startIndex, this.sentences.length - 1));
    this.isNarrating = true;
    this.isPaused = false;
    this.speakCurrentSentence();
  }

  static pauseNarration(): void {
    if (this.isNarrating) {
      SpeechService.pause();
      this.isPaused = true;
      if (this.cursorBadgeEl) {
        this.cursorBadgeEl.textContent = '⏸ Paused';
      }
    }
  }

  static resumeNarration(): void {
    if (this.isNarrating && this.isPaused) {
      SpeechService.resume();
      this.isPaused = false;
      if (this.cursorBadgeEl) {
        this.cursorBadgeEl.textContent = '🔊 Reading...';
      }
    } else if (!this.isNarrating) {
      this.startNarration(this.currentIndex);
    }
  }

  static stopNarration(): void {
    this.isNarrating = false;
    this.isPaused = false;
    SpeechService.stop();
    this.removeVisualIndicator();
  }

  static startReading(_callback?: () => void): void {
    this.startNarration(0);
  }

  static pauseOrResume(): void {
    if (this.isPaused) {
      this.resumeNarration();
    } else {
      this.pauseNarration();
    }
  }

  static stopReading(): void {
    this.stopNarration();
  }

  static nextSentence(): void {
    if (this.currentIndex < this.sentences.length - 1) {
      this.currentIndex++;
      this.speakCurrentSentence();
    } else {
      this.stopNarration();
    }
  }

  static prevSentence(): void {
    if (this.currentIndex > 0) {
      this.currentIndex--;
      this.speakCurrentSentence();
    }
  }

  private static speakCurrentSentence(): void {
    if (!this.isNarrating || this.currentIndex >= this.sentences.length) {
      this.stopNarration();
      return;
    }

    const item = this.sentences[this.currentIndex];
    this.highlightSentence(item);

    SpeechService.speak(item.text, {
      rate: this.rate,
      voiceName: this.voiceName,
      onEnd: () => {
        if (this.isNarrating && !this.isPaused) {
          this.nextSentence();
        }
      },
      onError: () => {
        if (this.isNarrating) {
          this.nextSentence();
        }
      },
    });
  }

  /**
   * Positions high-visibility non-destructive overlay over the exact active sentence
   */
  private static highlightSentence(item: ReadingSentence): void {
    if (typeof document === 'undefined') return;

    // Smoothly scroll active element into view
    item.element.scrollIntoView({ behavior: 'smooth', block: 'center' });

    const rect = item.element.getBoundingClientRect();
    const scrollX = window.scrollX || window.pageXOffset;
    const scrollY = window.scrollY || window.pageYOffset;

    if (!this.indicatorEl) {
      this.indicatorEl = document.createElement('div');
      this.indicatorEl.id = INDICATOR_ID;
      this.indicatorEl.setAttribute('aria-hidden', 'true');
      this.indicatorEl.style.cssText = `
        position: absolute;
        pointer-events: none;
        z-index: 2147483640;
        background: rgba(14, 165, 233, 0.22);
        border: 2px solid #0284c7;
        border-radius: 6px;
        box-shadow: 0 0 0 4px rgba(14, 165, 233, 0.25);
        transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
      `;
      document.body.appendChild(this.indicatorEl);
    }

    if (!this.cursorBadgeEl) {
      this.cursorBadgeEl = document.createElement('div');
      this.cursorBadgeEl.id = CURSOR_BADGE_ID;
      this.cursorBadgeEl.setAttribute('aria-hidden', 'true');
      this.cursorBadgeEl.style.cssText = `
        position: absolute;
        pointer-events: none;
        z-index: 2147483641;
        background: #0284c7;
        color: #ffffff;
        font-family: -apple-system, BlinkMacSystemFont, sans-serif;
        font-size: 11px;
        font-weight: 700;
        letter-spacing: 0.05em;
        padding: 3px 8px;
        border-radius: 4px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
      `;
      document.body.appendChild(this.cursorBadgeEl);
    }

    this.indicatorEl.style.left = `${rect.left + scrollX - 4}px`;
    this.indicatorEl.style.top = `${rect.top + scrollY - 2}px`;
    this.indicatorEl.style.width = `${Math.max(rect.width + 8, 40)}px`;
    this.indicatorEl.style.height = `${Math.max(rect.height + 4, 24)}px`;

    this.cursorBadgeEl.textContent = '🔊 Reading...';
    this.cursorBadgeEl.style.left = `${rect.left + scrollX}px`;
    this.cursorBadgeEl.style.top = `${Math.max(0, rect.top + scrollY - 22)}px`;
  }

  private static removeVisualIndicator(): void {
    if (this.indicatorEl) {
      this.indicatorEl.remove();
      this.indicatorEl = null;
    }
    if (this.cursorBadgeEl) {
      this.cursorBadgeEl.remove();
      this.cursorBadgeEl = null;
    }
  }

  /* -------------------------------------------------------------
   * KEYBOARD ACCESSIBILITY LANDMARK & ELEMENT NAVIGATION
   * ------------------------------------------------------------- */
  static navigateToType(type: 'heading' | 'link' | 'button' | 'form', reverse = false): void {
    let selector = '';
    switch (type) {
      case 'heading':
        selector = 'h1, h2, h3, h4, h5, h6, [role="heading"]';
        break;
      case 'link':
        selector = 'a[href]';
        break;
      case 'button':
        selector = 'button, input[type="button"], input[type="submit"], [role="button"]';
        break;
      case 'form':
        selector = 'input:not([type="hidden"]), select, textarea, [role="textbox"], [role="combobox"]';
        break;
    }

    const items = Array.from(document.querySelectorAll<HTMLElement>(selector)).filter(
      (el) =>
        el.offsetParent !== null &&
        !el.closest('#swde-floating-toolbar-root') &&
        !el.closest('#swde-reading-mode-root')
    );

    if (items.length === 0) {
      SpeechService.speak(`No ${type}s found on this page.`);
      return;
    }

    this.navigableElements = items;
    if (reverse) {
      this.navIndex = this.navIndex <= 0 ? items.length - 1 : this.navIndex - 1;
    } else {
      this.navIndex = (this.navIndex + 1) % items.length;
    }

    const target = items[this.navIndex];
    target.focus();
    target.scrollIntoView({ behavior: 'smooth', block: 'center' });

    // Announce verbally with role context
    const label = target.getAttribute('aria-label') || target.textContent?.trim() || target.getAttribute('placeholder') || '';
    let announcement = `${type}: ${label.slice(0, 80)}`;
    if (type === 'heading') {
      const level = target.tagName.replace('H', '');
      announcement = `Heading level ${level}: ${label}`;
    }

    this.highlightSentence({
      element: target,
      text: announcement,
      rect: target.getBoundingClientRect(),
    });

    SpeechService.speak(announcement, { rate: this.rate });
  }

  static isNarratingActive(): boolean {
    return this.isNarrating && !this.isPaused;
  }
}
