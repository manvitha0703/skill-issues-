import {
  AISimplifyResponse,
  AIPageSummaryResponse,
  SimplificationLevel,
  WebpageCategory,
} from '../types/ai';

// Common technical, academic, and bureaucratic terms mapped to simple explanations
const ACCESSIBILITY_DICTIONARY: Record<string, string> = {
  matriculation: '10th grade / high school graduation',
  domicile: 'permanent home state or legal residence',
  aggregate: 'overall combined total or average',
  stipulation: 'a condition or rule that must be followed',
  emoluments: 'salary, payment, or compensation',
  prerequisite: 'a requirement you must complete first',
  remuneration: 'payment received for work or services',
  notwithstanding: 'in spite of, or regardless of',
  aforementioned: 'mentioned earlier or before',
  commence: 'to begin or start',
  terminate: 'to end or stop',
  disseminate: 'to spread or distribute information',
  utilize: 'to use',
  endeavor: 'to try or attempt',
  expedite: 'to speed up',
  mandate: 'an official requirement or order',
  discrepancy: 'a difference or mismatch between two things',
  affidavit: 'a formal written legal statement made under oath',
  annexure: 'an attached document or appendix',
  bonafide: 'genuine, real, or official',
};

export class DeterministicFallback {
  /**
   * Deterministically simplifies text without hallucinating.
   * Splits run-on sentences, simplifies known jargon, and extracts bullet points.
   */
  static simplifyText(text: string, level: SimplificationLevel): AISimplifyResponse {
    if (!text || text.trim() === '') {
      return {
        simplifiedText: '',
        keyPoints: [],
        difficultWordsExplained: [],
        isAiGenerated: false,
      };
    }

    const wordsFound: Array<{ word: string; explanation: string }> = [];
    const lower = text.toLowerCase();

    for (const [term, explanation] of Object.entries(ACCESSIBILITY_DICTIONARY)) {
      const regex = new RegExp(`\\b${term}\\b`, 'i');
      if (regex.test(lower)) {
        wordsFound.push({ word: term, explanation });
      }
    }

    // Split text into sentences
    const rawSentences = text
      .replace(/([.?!])\s*(?=[A-Z])/g, '$1|')
      .split('|')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    // Sentence score based on length and position
    let processedSentences = rawSentences.map((sentence) => {
      let modified = sentence;
      if (level === 'very_simple' || level === 'simple') {
        // Replace difficult words in place
        for (const [term, explanation] of Object.entries(ACCESSIBILITY_DICTIONARY)) {
          const regex = new RegExp(`\\b${term}\\b`, 'gi');
          modified = modified.replace(regex, `${term} (${explanation})`);
        }
      }
      return modified;
    });

    if (level === 'very_simple') {
      // Keep only the most informative sentences (first sentence and shortest clear sentences)
      processedSentences = processedSentences.slice(0, Math.min(5, processedSentences.length));
    }

    // Identify key takeaways
    const keyPoints = processedSentences
      .filter((s) => s.length > 20 && s.length < 150)
      .slice(0, 4);

    return {
      simplifiedText: processedSentences.join(' \n\n'),
      keyPoints: keyPoints.length > 0 ? keyPoints : [rawSentences[0] || ''],
      difficultWordsExplained: wordsFound,
      isAiGenerated: false,
    };
  }

  /**
   * Deterministic page summary by extracting headings, dates, deadlines, and page type.
   */
  static summarizePage(
    title: string,
    headings: string[],
    fullSnippet: string,
    formsCount: number
  ): AIPageSummaryResponse {
    // Detect dates and deadlines using regex patterns (e.g., "Deadline: 15 March", "Last date: ...", "2024-12-31")
    const dateRegex = /(?:deadline|last date|due date|closing date|valid until|expires on)[:\s]+([0-9]{1,2}(?:st|nd|rd|th)?\s+[A-Za-z]+(?:\s+[0-9]{4})?|[0-9]{1,2}[-/][0-9]{1,2}[-/][0-9]{2,4})/gi;
    const foundDates: string[] = [];
    let match;
    while ((match = dateRegex.exec(fullSnippet)) !== null) {
      if (match[0] && !foundDates.includes(match[0].trim())) {
        foundDates.push(match[0].trim());
      }
    }

    // Determine category heuristically
    const lower = (title + ' ' + headings.join(' ') + ' ' + fullSnippet.slice(0, 1000)).toLowerCase();
    let pageType: WebpageCategory = 'general';
    let primaryAction = 'Read and browse the page content';

    if (lower.includes('scholarship') || lower.includes('admission') || lower.includes('course') || lower.includes('exam')) {
      pageType = 'education';
      primaryAction = formsCount > 0 ? 'Fill out the education application or scholarship form' : 'Review academic requirements';
    } else if (lower.includes('portal') || lower.includes('ministry') || lower.includes('gov') || lower.includes('official application')) {
      pageType = 'government';
      primaryAction = formsCount > 0 ? 'Complete the official government form' : 'Check government notifications';
    } else if (lower.includes('news') || lower.includes('times') || lower.includes('headline') || lower.includes('article') || lower.includes('report')) {
      pageType = 'news';
      primaryAction = 'Read the news article';
    } else if (lower.includes('cart') || lower.includes('price') || lower.includes('buy') || lower.includes('checkout') || lower.includes('shop')) {
      pageType = 'ecommerce';
      primaryAction = 'Review product details and options';
    } else if (lower.includes('health') || lower.includes('patient') || lower.includes('clinic') || lower.includes('medical')) {
      pageType = 'healthcare';
      primaryAction = 'Review health and medical information';
    }

    const summaryParts: string[] = [];
    summaryParts.push(`This page is titled "${title || 'Untitled Page'}".`);
    if (headings.length > 0) {
      summaryParts.push(`It contains ${headings.length} primary section(s): ${headings.slice(0, 4).join(', ')}.`);
    }
    if (formsCount > 0) {
      summaryParts.push(`There is 1 interactive form with input fields ready for auto-filling.`);
    }

    return {
      summary: summaryParts.join(' '),
      pageType,
      primaryAction,
      importantDatesOrDeadlines: foundDates.length > 0 ? foundDates : ['No explicit deadline detected on this page.'],
      keySections: headings.slice(0, 6),
      isAiGenerated: false,
    };
  }

  /**
   * Deterministic translation fallback providing curated translations for common UI instructions
   */
  static getOfflineTranslationNotice(targetLanguage: string): string {
    const languageNames: Record<string, string> = {
      hi: 'Hindi (हिन्दी)',
      kn: 'Kannada (ಕನ್ನಡ)',
      ta: 'Tamil (தமிழ்)',
      te: 'Telugu (తెలుగు)',
      ml: 'Malayalam (മലയാളം)',
      bn: 'Bengali (বাংলা)',
      mr: 'Marathi (मराठी)',
      en: 'English',
    };
    const name = languageNames[targetLanguage.toLowerCase()] || targetLanguage;
    return `[Offline Translation Notice]: Live translation to ${name} requires an AI API Key (Gemini, OpenAI, Anthropic, or Groq) in Settings. Basic offline reading mode is active.`;
  }
}
