import { StyleGenerator } from '../../accessibility/styleGenerator';

export class PhotosensitivityGuard {
  private static observer: MutationObserver | null = null;
  private static isEmergencyStop = false;
  private static suppressedElements: Array<{ el: HTMLElement; originalStyles: string }> = [];

  static enable(suppressFlashing = true, pauseAutoplay = true, brightnessDim = 0): void {
    if (typeof document === 'undefined') return;

    // Apply brightness overlay
    StyleGenerator.updateBrightnessReduction(brightnessDim);

    if (pauseAutoplay) {
      this.pauseAllMedia();
    }

    if (suppressFlashing) {
      this.detectAndSuppressFlashing();
    }

    // Monitor dynamically added media / animated elements
    if (!this.observer) {
      this.observer = new MutationObserver((mutations) => {
        let hasNewNodes = false;
        mutations.forEach((m) => {
          if (m.addedNodes.length > 0) hasNewNodes = true;
        });

        if (hasNewNodes) {
          if (pauseAutoplay) this.pauseAllMedia();
          if (suppressFlashing) this.detectAndSuppressFlashing();
        }
      });

      this.observer.observe(document.body || document.documentElement, {
        childList: true,
        subtree: true,
      });
    }
  }

  static disable(): void {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
    StyleGenerator.updateBrightnessReduction(0);
    this.restoreSuppressedElements();
    this.isEmergencyStop = false;
  }

  /**
   * Prominent 1-click Emergency Stop: immediately freezes all animations, pauses all media,
   * and silences audio across the page.
   */
  static triggerEmergencyStop(): void {
    this.isEmergencyStop = true;
    this.pauseAllMedia();

    // Freeze all CSS animations
    const emergencyStyle = document.createElement('style');
    emergencyStyle.id = 'swde-emergency-freeze';
    emergencyStyle.textContent = `
      *, *::before, *::after {
        animation-play-state: paused !important;
        animation-duration: 0.0001ms !important;
        transition-duration: 0.0001ms !important;
      }
      video, audio {
        visibility: hidden !important;
      }
      .flashing, .blink, [class*="blink"], marquee {
        display: none !important;
      }
    `;
    document.head.appendChild(emergencyStyle);
  }

  static clearEmergencyStop(): void {
    this.isEmergencyStop = false;
    const s = document.getElementById('swde-emergency-freeze');
    if (s) s.remove();
    this.pauseAllMedia(); // Keep media safely paused
  }

  private static pauseAllMedia(): void {
    document.querySelectorAll<HTMLMediaElement>('video, audio').forEach((media) => {
      try {
        media.autoplay = false;
        media.pause();
        media.removeAttribute('autoplay');
      } catch (_) {}
    });
  }

  private static detectAndSuppressFlashing(): void {
    const candidates = document.querySelectorAll<HTMLElement>(
      '.flashing, .blink, [class*="blink"], [class*="pulse"], marquee, [class*="flashing"]'
    );

    candidates.forEach((el) => {
      if (el.getAttribute('data-swde-suppressed')) return;

      this.suppressedElements.push({
        el,
        originalStyles: el.getAttribute('style') || '',
      });

      el.setAttribute('data-swde-suppressed', 'true');
      el.style.animation = 'none';
      el.style.transition = 'none';
      el.style.opacity = '0.9';
    });
  }

  static restoreSuppressedElements(): void {
    this.suppressedElements.forEach(({ el, originalStyles }) => {
      try {
        el.removeAttribute('data-swde-suppressed');
        el.setAttribute('style', originalStyles);
      } catch (_) {}
    });
    this.suppressedElements = [];
  }
}
