import { DeterministicFallback } from '../../ai/deterministicFallback';
import { SpeechService } from '../../voice/speechService';

const TOOLTIP_ID = 'swde-sentence-simplifier-tooltip';

export class SentenceHoverSimplifier {
  private static active = false;
  private static hoverTimer: any = null;
  private static tooltipEl: HTMLElement | null = null;
  private static currentSentence = '';

  static enable(): void {
    if (this.active || typeof document === 'undefined') return;
    this.active = true;

    document.addEventListener('mousemove', this.handleMouseMove);
    document.addEventListener('keydown', this.handleKeyDown);
  }

  static disable(): void {
    if (!this.active || typeof document === 'undefined') return;
    this.active = false;

    document.removeEventListener('mousemove', this.handleMouseMove);
    document.removeEventListener('keydown', this.handleKeyDown);
    this.hideTooltip();
  }

  private static handleMouseMove = (e: MouseEvent): void => {
    if (!SentenceHoverSimplifier.active) return;

    clearTimeout(SentenceHoverSimplifier.hoverTimer);

    const target = e.target as HTMLElement | null;
    if (!target) return;

    // Ignore extension UI
    if (
      target.closest('#swde-floating-toolbar-root') ||
      target.closest('#swde-sentence-simplifier-tooltip') ||
      target.closest('#swde-reading-mode-root') ||
      target.closest('#swde-form-review-modal')
    ) {
      return;
    }

    // Only process text containers
    if (!['P', 'LI', 'ARTICLE', 'BLOCKQUOTE', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'SPAN', 'DIV'].includes(target.tagName)) {
      SentenceHoverSimplifier.hideTooltip();
      return;
    }

    SentenceHoverSimplifier.hoverTimer = setTimeout(() => {
      const sentence = SentenceHoverSimplifier.extractSentenceAtPoint(e.clientX, e.clientY, target);
      if (sentence && sentence.length > 25 && sentence !== SentenceHoverSimplifier.currentSentence) {
        SentenceHoverSimplifier.showTooltip(sentence, e.clientX, e.clientY);
      }
    }, 600); // 600ms intentional hover debounce to prevent accidental triggering
  };

  private static handleKeyDown = (e: KeyboardEvent): void => {
    if (!SentenceHoverSimplifier.active) return;

    // Alt + D: simplify active element or text selection
    if (e.altKey && e.key.toLowerCase() === 'd') {
      e.preventDefault();
      const selection = window.getSelection()?.toString().trim();
      if (selection && selection.length > 10) {
        SentenceHoverSimplifier.showTooltip(selection, window.innerWidth / 2 - 160, 120);
        return;
      }

      const activeEl = document.activeElement;
      if (activeEl && activeEl.textContent) {
        const text = activeEl.textContent.trim();
        if (text.length > 20) {
          const rect = activeEl.getBoundingClientRect();
          SentenceHoverSimplifier.showTooltip(text.slice(0, 200), rect.left, rect.top - 10);
        }
      }
    } else if (e.key === 'Escape') {
      SentenceHoverSimplifier.hideTooltip();
    }
  };

  private static extractSentenceAtPoint(x: number, y: number, element: HTMLElement): string | null {
    const text = element.textContent?.trim();
    if (!text || text.length < 20) return null;

    // Split text into sentences
    const sentences = text.match(/[^.!?]+[.!?]+(\s|$)|[^.!?]+$/g);
    if (!sentences || sentences.length === 0) return text;

    // If only one sentence
    if (sentences.length === 1) return sentences[0].trim();

    // Use caretRangeFromPoint or range to determine exact sentence
    if (document.caretRangeFromPoint) {
      const range = document.caretRangeFromPoint(x, y);
      if (range && range.startContainer.nodeType === Node.TEXT_NODE) {
        const offset = range.startOffset;
        const nodeText = range.startContainer.textContent || '';
        const nodeSentences = nodeText.match(/[^.!?]+[.!?]+(\s|$)|[^.!?]+$/g) || [nodeText];
        let runningLength = 0;
        for (const s of nodeSentences) {
          runningLength += s.length;
          if (offset <= runningLength) {
            return s.trim();
          }
        }
      }
    }

    return sentences[0].trim();
  }

  private static showTooltip(sentence: string, clientX: number, clientY: number): void {
    this.currentSentence = sentence;
    const simplified = DeterministicFallback.simplifyText(sentence, 'simple');

    if (!this.tooltipEl) {
      this.tooltipEl = document.createElement('div');
      this.tooltipEl.id = TOOLTIP_ID;
      this.tooltipEl.setAttribute('role', 'tooltip');
      this.tooltipEl.style.cssText = `
        position: fixed;
        z-index: 2147483647;
        background: #0B132B;
        color: #F8F9FA;
        border: 1.5px solid #0EA5E9;
        border-radius: 12px;
        box-shadow: 0 10px 25px rgba(0,0,0,0.45);
        padding: 12px 14px;
        max-width: 380px;
        font-family: 'Atkinson Hyperlegible', -apple-system, sans-serif;
        font-size: 13.5px;
        line-height: 1.6;
        user-select: text;
        animation: swdeTooltipFade 0.2s ease-out;
      `;
      document.body.appendChild(this.tooltipEl);
    }

    // Position tooltip safely on screen
    const tooltipW = 360;
    const posX = Math.max(16, Math.min(window.innerWidth - tooltipW - 20, clientX - tooltipW / 2));
    const posY = clientY > 180 ? clientY - 140 : clientY + 30;

    this.tooltipEl.style.left = `${posX}px`;
    this.tooltipEl.style.top = `${posY}px`;

    const jargonList = simplified.difficultWordsExplained.length > 0
      ? `<div style="margin-top: 8px; padding-top: 6px; border-top: 1px solid #1C2541; font-size: 11px; color: #7DD3FC;">
           ${simplified.difficultWordsExplained.map(j => `<strong>${j.word}</strong>: ${j.explanation}`).join(' • ')}
         </div>`
      : '';

    this.tooltipEl.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
        <span style="font-size: 10px; font-weight: bold; text-transform: uppercase; color: #38BDF8; letter-spacing: 0.05em; display: flex; align-items: center; gap: 4px;">
          ✨ Simplified Meaning
        </span>
        <div style="display: flex; gap: 6px;">
          <button id="swde-tt-tts-btn" style="background: transparent; border: none; cursor: pointer; color: #94A3B8; font-size: 12px;" title="Read Aloud">🔊</button>
          <button id="swde-tt-close-btn" style="background: transparent; border: none; cursor: pointer; color: #94A3B8; font-size: 12px;" title="Close">✕</button>
        </div>
      </div>
      <div style="color: #F1F5F9; font-weight: 500;">
        ${simplified.simplifiedText}
      </div>
      ${jargonList}
    `;

    this.tooltipEl.querySelector('#swde-tt-close-btn')?.addEventListener('click', () => {
      this.hideTooltip();
    });

    this.tooltipEl.querySelector('#swde-tt-tts-btn')?.addEventListener('click', () => {
      SpeechService.speak(simplified.simplifiedText);
    });
  }

  static hideTooltip(): void {
    if (this.tooltipEl) {
      this.tooltipEl.remove();
      this.tooltipEl = null;
    }
    this.currentSentence = '';
  }
}
