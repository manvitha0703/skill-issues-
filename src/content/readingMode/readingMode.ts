import { SpeechService } from '../../voice/speechService';
import { DeterministicFallback } from '../../ai/deterministicFallback';
import { AIService } from '../../ai/aiService';

export class ReadingModeOverlay {
  private static rootEl: HTMLElement | null = null;
  private static isSpeaking: boolean = false;
  private static currentContent: string = '';

  static open(): void {
    if (typeof document === 'undefined') return;
    if (document.getElementById('swde-reading-mode-root')) {
      return;
    }

    // Extract article content
    const pageTitle = document.title || 'Reader View';
    const article =
      document.querySelector('article, main, .article-content, #article, .post-content') ||
      document.body;

    const paragraphs: string[] = [];
    article.querySelectorAll('p, h2, h3, blockquote, li').forEach((el) => {
      // Don't grab script, style, or extension elements
      if (el.closest('#swde-overlay-root') || el.closest('#swde-reading-mode-root')) return;
      const text = el.textContent?.trim();
      if (text && text.length > 20) {
        paragraphs.push(text);
      }
    });

    this.currentContent = paragraphs.join('\n\n');

    // Create modal element
    const root = document.createElement('div');
    root.id = 'swde-reading-mode-root';
    root.setAttribute('role', 'dialog');
    root.setAttribute('aria-label', 'Distraction-Free Reading Mode');
    root.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: #F8F9FA;
      color: #1A202C;
      z-index: 2147483646;
      overflow-y: auto;
      font-family: 'Atkinson Hyperlegible', -apple-system, sans-serif;
      line-height: 1.8;
      font-size: 19px;
      box-sizing: border-box;
      padding: 30px 20px;
    `;

    root.innerHTML = `
      <div style="max-width: 820px; margin: 0 auto; background: #ffffff; border-radius: 16px; box-shadow: 0 10px 30px rgba(0,0,0,0.08); padding: 40px; border: 1px solid #E2E8F0;">
        <!-- Header Controls -->
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #EDF2F7; padding-bottom: 18px; margin-bottom: 28px; flex-wrap: wrap; gap: 12px;">
          <div style="display: flex; align-items: center; gap: 8px;">
            <span style="background: #0284C7; color: #fff; font-size: 12px; font-weight: bold; padding: 4px 10px; border-radius: 20px;">READING MODE</span>
            <span style="color: #64748B; font-size: 14px;">Same Web, Different Eyes</span>
          </div>
          <div style="display: flex; gap: 8px; align-items: center;">
            <button id="swde-reader-tts-btn" style="background: #E0F2FE; color: #0284C7; border: none; padding: 8px 14px; border-radius: 8px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 6px;">
              🔊 Read Aloud
            </button>
            <button id="swde-reader-simplify-btn" style="background: #F3E8FF; color: #7C3AED; border: none; padding: 8px 14px; border-radius: 8px; font-weight: 600; cursor: pointer;">
              ✨ Simplify Text
            </button>
            <button id="swde-reader-theme-btn" style="background: #F1F5F9; color: #334155; border: 1px solid #CBD5E1; padding: 8px 12px; border-radius: 8px; font-weight: 600; cursor: pointer;">
              🌓 Theme
            </button>
            <button id="swde-reader-close-btn" style="background: #0B132B; color: #fff; border: none; padding: 8px 16px; border-radius: 8px; font-weight: 600; cursor: pointer;">
              ✕ Exit
            </button>
          </div>
        </div>

        <!-- Article Content -->
        <h1 style="font-size: 32px; font-weight: 800; color: #0B132B; margin-bottom: 12px; line-height: 1.3;">
          ${pageTitle}
        </h1>
        <div style="font-size: 14px; color: #64748B; margin-bottom: 24px;">
          Clean reader layout • Estimated read time: ${Math.ceil(paragraphs.length / 3)} min
        </div>

        <div id="swde-reader-body" style="font-size: 19px; line-height: 1.85; color: #2D3748;">
          ${paragraphs.map((p) => `<p style="margin-bottom: 20px;">${p}</p>`).join('')}
        </div>
      </div>
    `;

    document.body.appendChild(root);
    this.rootEl = root;

    // Attach Event Listeners
    const closeBtn = root.querySelector('#swde-reader-close-btn');
    closeBtn?.addEventListener('click', () => this.close());

    // ESC key closes
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        this.close();
        window.removeEventListener('keydown', handleKeyDown);
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    // TTS Button
    const ttsBtn = root.querySelector('#swde-reader-tts-btn') as HTMLButtonElement;
    ttsBtn?.addEventListener('click', () => {
      if (this.isSpeaking) {
        SpeechService.stop();
        this.isSpeaking = false;
        ttsBtn.textContent = '🔊 Read Aloud';
      } else {
        SpeechService.speak(this.currentContent, {
          onEnd: () => {
            this.isSpeaking = false;
            if (ttsBtn) ttsBtn.textContent = '🔊 Read Aloud';
          },
        });
        this.isSpeaking = true;
        ttsBtn.textContent = '⏹ Stop Reading';
      }
    });

    // Simplify Button
    const simplifyBtn = root.querySelector('#swde-reader-simplify-btn') as HTMLButtonElement;
    const bodyEl = root.querySelector('#swde-reader-body');
    simplifyBtn?.addEventListener('click', async () => {
      simplifyBtn.disabled = true;
      simplifyBtn.textContent = 'Simplifying...';
      try {
        const response = await AIService.simplifyText({
          text: this.currentContent,
          level: 'simple',
        });
        if (bodyEl) {
          bodyEl.innerHTML = `
            <div style="background: #F0FDF4; border: 1px solid #86EFAC; border-radius: 10px; padding: 16px; margin-bottom: 24px;">
              <strong style="color: #166534;">✨ Key Takeaways:</strong>
              <ul style="margin: 8px 0 0 16px; color: #166534;">
                ${response.keyPoints.map((k) => `<li>${k}</li>`).join('')}
              </ul>
            </div>
            ${response.simplifiedText
              .split('\n\n')
              .map((p) => `<p style="margin-bottom: 18px;">${p}</p>`)
              .join('')}
          `;
          simplifyBtn.textContent = '✓ Simplified';
        }
      } catch (err) {
        simplifyBtn.textContent = '✨ Simplify Text';
      } finally {
        simplifyBtn.disabled = false;
      }
    });

    // Theme Toggle
    let themeIndex = 0;
    const themes = [
      { bg: '#F8F9FA', card: '#ffffff', text: '#1A202C' }, // Light
      { bg: '#0F172A', card: '#1E293B', text: '#F8FAFC' }, // Dark
      { bg: '#FBF0D9', card: '#F7E7C4', text: '#3E2723' }, // Sepia
    ];
    const themeBtn = root.querySelector('#swde-reader-theme-btn');
    themeBtn?.addEventListener('click', () => {
      themeIndex = (themeIndex + 1) % themes.length;
      const t = themes[themeIndex];
      root.style.background = t.bg;
      const card = root.querySelector('div') as HTMLElement;
      if (card) {
        card.style.background = t.card;
        card.style.color = t.text;
      }
    });
  }

  static close(): void {
    if (this.isSpeaking) {
      SpeechService.stop();
      this.isSpeaking = false;
    }
    if (this.rootEl) {
      this.rootEl.remove();
      this.rootEl = null;
    }
    const existing = document.getElementById('swde-reading-mode-root');
    if (existing) existing.remove();
  }
}
