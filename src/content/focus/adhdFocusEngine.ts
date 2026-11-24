export class AdhdFocusEngine {
  private static spotlightActive = false;
  private static currentFocusedParagraph: HTMLElement | null = null;
  private static hiddenDistractions: HTMLElement[] = [];

  static enableSpotlight(): void {
    if (this.spotlightActive || typeof document === 'undefined') return;
    this.spotlightActive = true;
    document.body.classList.add('swde-spotlight-active');

    document.addEventListener('mouseover', this.handleMouseOver);
    document.addEventListener('focusin', this.handleFocusIn);
  }

  static disableSpotlight(): void {
    if (!this.spotlightActive || typeof document === 'undefined') return;
    this.spotlightActive = false;
    document.body.classList.remove('swde-spotlight-active');

    document.removeEventListener('mouseover', this.handleMouseOver);
    document.removeEventListener('focusin', this.handleFocusIn);

    if (this.currentFocusedParagraph) {
      this.currentFocusedParagraph.classList.remove('swde-current-focus');
      this.currentFocusedParagraph = null;
    }
  }

  private static handleMouseOver = (e: MouseEvent): void => {
    const target = (e.target as HTMLElement)?.closest('p, li, blockquote') as HTMLElement | null;
    if (!target) return;

    if (target.closest('#swde-floating-toolbar-root') || target.closest('#swde-reading-mode-root')) {
      return;
    }

    if (AdhdFocusEngine.currentFocusedParagraph && AdhdFocusEngine.currentFocusedParagraph !== target) {
      AdhdFocusEngine.currentFocusedParagraph.classList.remove('swde-current-focus');
    }

    AdhdFocusEngine.currentFocusedParagraph = target;
    target.classList.add('swde-current-focus');
  };

  private static handleFocusIn = (e: FocusEvent): void => {
    const target = (e.target as HTMLElement)?.closest('p, li, blockquote, h1, h2, h3, a, input, button') as HTMLElement | null;
    if (!target) return;

    if (AdhdFocusEngine.currentFocusedParagraph && AdhdFocusEngine.currentFocusedParagraph !== target) {
      AdhdFocusEngine.currentFocusedParagraph.classList.remove('swde-current-focus');
    }

    AdhdFocusEngine.currentFocusedParagraph = target;
    target.classList.add('swde-current-focus');
  };

  /**
   * Restores all elements that were hidden by the clutter filter
   */
  static restoreHiddenElements(): number {
    const hidden = document.querySelectorAll<HTMLElement>('.swde-manually-hidden');
    let count = 0;
    hidden.forEach((el) => {
      el.classList.remove('swde-manually-hidden');
      el.style.display = '';
      count++;
    });
    return count;
  }
}
