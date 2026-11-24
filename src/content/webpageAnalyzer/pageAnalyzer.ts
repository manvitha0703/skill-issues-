import { PageOverviewData } from '../../types/message';
import { DeterministicFallback } from '../../ai/deterministicFallback';

export class PageAnalyzer {
  static analyze(doc: Document = document): PageOverviewData {
    const title = doc.title || 'Untitled Page';
    const url = window.location.href;
    const domain = window.location.hostname;

    // Headings
    const headingElements = doc.querySelectorAll('h1, h2, h3, h4, h5, h6');
    const headings: string[] = [];
    headingElements.forEach((h) => {
      const text = h.textContent?.trim();
      if (text && text.length > 2 && text.length < 120 && !headings.includes(text)) {
        headings.push(text);
      }
    });

    // Counts
    const forms = doc.querySelectorAll('form');
    const formFields = doc.querySelectorAll('input:not([type="hidden"]), select, textarea');
    const buttons = doc.querySelectorAll('button, input[type="button"], input[type="submit"], [role="button"]');
    const links = doc.querySelectorAll('a[href]');

    // Images & Missing Alt Detection
    const images = doc.querySelectorAll('img');
    let imagesMissingAlt = 0;
    images.forEach((img) => {
      const alt = img.getAttribute('alt');
      if (alt === null || alt.trim() === '') {
        imagesMissingAlt++;
        // Add accessible tag if missing
        img.setAttribute('data-swde-missing-alt', 'true');
      }
    });

    // Media & Animations
    const media = doc.querySelectorAll('video, audio');
    const hasAudioVideo = media.length > 0;
    const animatedElements = doc.querySelectorAll('.flashing, .blink, [class*="anim"], marquee');
    const hasAnimations = animatedElements.length > 0;

    // Extract main text snippet
    const mainEl = doc.querySelector('main, article, #content, .content, #main') || doc.body;
    const rawText = mainEl ? mainEl.textContent || '' : '';
    const cleanText = rawText.replace(/\s+/g, ' ').trim();
    const wordCount = cleanText.split(' ').length;
    const readingTimeMinutes = Math.max(1, Math.ceil(wordCount / 200));

    // Fallback deterministic summary
    const summary = DeterministicFallback.summarizePage(
      title,
      headings,
      cleanText.slice(0, 3000),
      forms.length > 0 ? formFields.length : 0
    );

    return {
      title,
      url,
      domain,
      category: summary.pageType,
      headings,
      sectionsCount: Math.max(1, headings.length),
      formsCount: forms.length > 0 ? forms.length : (formFields.length > 0 ? 1 : 0),
      buttonsCount: buttons.length,
      linksCount: links.length,
      imagesCount: images.length,
      imagesMissingAlt,
      hasAudioVideo,
      hasAnimations,
      readingTimeMinutes,
      summary,
    };
  }
}
