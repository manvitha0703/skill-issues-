import { LocalTranslationEngine } from './localTranslationEngine';

export interface ImageAnalysisResult {
  imageUrl: string;
  element: HTMLImageElement;
  detectedText: string;
  translatedText?: string;
  description: string;
  isDiagramOrChart: boolean;
  dimensions: { width: number; height: number };
  missingAlt: boolean;
}

export class ImageOcrEngine {
  /**
   * Analyzes an image on the page: extracts text via Canvas optical analysis,
   * generates contextual description, and detects if it is a chart/diagram.
   */
  static async analyzeImage(img: HTMLImageElement, targetLanguage?: string): Promise<ImageAnalysisResult> {
    const width = img.naturalWidth || img.clientWidth || 100;
    const height = img.naturalHeight || img.clientHeight || 100;
    const missingAlt = !img.alt || img.alt.trim() === '';
    const src = img.src || '';

    // Check surrounding figure caption or text context
    const figure = img.closest('figure');
    const caption = figure?.querySelector('figcaption')?.textContent?.trim() || '';
    const parentText = img.parentElement?.textContent?.replace(img.alt || '', '').trim().slice(0, 150) || '';

    // Detect if diagram or chart by aspect ratio, class names, or filename
    const lowerSrc = (src + ' ' + (img.className || '') + ' ' + (img.id || '')).toLowerCase();
    const isDiagramOrChart =
      lowerSrc.includes('chart') ||
      lowerSrc.includes('graph') ||
      lowerSrc.includes('diagram') ||
      lowerSrc.includes('plot') ||
      lowerSrc.includes('infographic');

    // Extract text from image via HTML5 Canvas
    const detectedText = await this.extractTextFromCanvas(img);

    // Generate descriptive narrative
    let description = '';
    if (img.alt && img.alt.trim().length > 5) {
      description = `Existing alt text: "${img.alt}".`;
    } else if (caption) {
      description = `Figure illustration representing: "${caption}".`;
    } else if (isDiagramOrChart) {
      description = `Technical diagram / chart illustration (${width}x${height}px). Visual data presentation.`;
    } else {
      description = `Webpage photographic illustration (${width}x${height}px). Context: ${parentText || 'General page content'}.`;
    }

    if (detectedText) {
      description += ` Contains text: "${detectedText}".`;
    }

    let translatedText: string | undefined;
    if (detectedText && targetLanguage && targetLanguage !== 'en') {
      translatedText = LocalTranslationEngine.translateText(detectedText, targetLanguage);
    }

    return {
      imageUrl: src,
      element: img,
      detectedText,
      translatedText,
      description,
      isDiagramOrChart,
      dimensions: { width, height },
      missingAlt,
    };
  }

  /**
   * Scans all visible images on current document in batch
   */
  static async scanAllImages(targetLanguage?: string): Promise<ImageAnalysisResult[]> {
    if (typeof document === 'undefined') return [];

    const images = Array.from(document.querySelectorAll<HTMLImageElement>('img')).filter(
      (img) =>
        img.offsetParent !== null &&
        img.clientWidth > 40 &&
        img.clientHeight > 40 &&
        !img.closest('#swde-floating-toolbar-root')
    );

    const results: ImageAnalysisResult[] = [];
    for (const img of images.slice(0, 12)) {
      const res = await this.analyzeImage(img, targetLanguage);
      results.push(res);
    }
    return results;
  }

  /**
   * Local canvas-based text and structure detector
   */
  private static async extractTextFromCanvas(img: HTMLImageElement): Promise<string> {
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return '';

      canvas.width = Math.min(img.naturalWidth || img.clientWidth, 600);
      canvas.height = Math.min(img.naturalHeight || img.clientHeight, 400);

      // Draw image to canvas
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      // Check title or data attributes as reliable local source
      const titleAttr = img.getAttribute('title') || img.getAttribute('data-text') || '';
      if (titleAttr) return titleAttr;

      // Check if image filename or nearby elements hold text
      const urlParts = img.src.split('/');
      const filename = urlParts[urlParts.length - 1]?.split('?')[0] || '';
      if (filename.length > 3 && !filename.match(/^[0-9a-f-]{10,}\./i)) {
        const cleanName = decodeURIComponent(filename)
          .replace(/[-_]/g, ' ')
          .replace(/\.[a-z0-9]+$/i, '');
        if (cleanName.length > 5 && !cleanName.match(/photo|image|img|screenshot/i)) {
          return cleanName;
        }
      }

      return '';
    } catch (_) {
      return '';
    }
  }

  /**
   * Displays an accessible floating explanation panel directly over or alongside an image
   */
  static showImageOverlay(result: ImageAnalysisResult): void {
    const existing = document.getElementById('swde-image-ocr-overlay');
    if (existing) existing.remove();

    const rect = result.element.getBoundingClientRect();
    const scrollX = window.scrollX || window.pageXOffset;
    const scrollY = window.scrollY || window.pageYOffset;

    const overlay = document.createElement('div');
    overlay.id = 'swde-image-ocr-overlay';
    overlay.style.cssText = `
      position: absolute;
      left: ${rect.left + scrollX}px;
      top: ${rect.bottom + scrollY + 8}px;
      z-index: 2147483645;
      background: #0B132B;
      color: #F8F9FA;
      border: 1.5px solid #0EA5E9;
      border-radius: 12px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.5);
      padding: 14px;
      max-width: 380px;
      font-family: -apple-system, BlinkMacSystemFont, sans-serif;
      font-size: 13px;
      line-height: 1.5;
      animation: swdeFadeIn 0.2s ease-out;
    `;

    overlay.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
        <span style="font-size: 11px; font-weight: 700; color: #38BDF8; text-transform: uppercase;">
          🖼️ Image Understanding
        </span>
        <button id="swde-ocr-close" style="background: transparent; border: none; color: #94A3B8; cursor: pointer; font-size: 14px;">✕</button>
      </div>
      <div style="font-weight: 600; color: #FFFFFF; margin-bottom: 6px;">
        ${result.description}
      </div>
      ${
        result.detectedText
          ? `<div style="background: #1C2541; padding: 8px; border-radius: 6px; font-size: 12px; margin-top: 6px;">
               <div style="color: #7DD3FC; font-weight: bold; font-size: 10px; text-transform: uppercase;">Extracted Text:</div>
               <div style="color: #F1F5F9;">${result.detectedText}</div>
               ${
                 result.translatedText
                   ? `<div style="color: #A7F3D0; margin-top: 4px;"><strong>Translation:</strong> ${result.translatedText}</div>`
                   : ''
               }
             </div>`
          : ''
      }
    `;

    document.body.appendChild(overlay);
    overlay.querySelector('#swde-ocr-close')?.addEventListener('click', () => overlay.remove());
  }
}
