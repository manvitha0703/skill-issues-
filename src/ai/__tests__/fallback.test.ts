import { describe, it, expect } from 'vitest';
import { DeterministicFallback } from '../deterministicFallback';
import { AIService } from '../aiService';

describe('DeterministicFallback & AIService', () => {
  it('simplifies text and explains difficult academic/bureaucratic terms', () => {
    const rawText =
      'Candidates must submit their matriculation certificate. The domicile state requirement is mandatory. The aggregate CGPA must be above 3.5. Furthermore, candidates must endeavor to avoid any discrepancy.';
    const result = DeterministicFallback.simplifyText(rawText, 'simple');

    expect(result.simplifiedText).toContain('matriculation (10th grade / high school graduation)');
    expect(result.simplifiedText).toContain('domicile (permanent home state or legal residence)');
    expect(result.simplifiedText).toContain('aggregate (overall combined total or average)');
    expect(result.difficultWordsExplained.length).toBeGreaterThanOrEqual(3);
    expect(result.isAiGenerated).toBe(false);
  });

  it('summarizes page and detects deadlines accurately', () => {
    const pageSnippet = `
      Welcome to the National Higher Education Fellowship Portal.
      All applicants must submit their forms before the deadline: 15 October 2026.
      Please verify your eligibility criteria before commencing.
    `;
    const summary = DeterministicFallback.summarizePage(
      'Scholarship Fellowship Portal',
      ['Eligibility Criteria', 'Application Steps', 'Upload Documents'],
      pageSnippet,
      1
    );

    expect(summary.pageType).toBe('education');
    expect(summary.importantDatesOrDeadlines.length).toBeGreaterThan(0);
    expect(summary.importantDatesOrDeadlines[0]).toContain('15 October 2026');
    expect(summary.isAiGenerated).toBe(false);
  });

  it('safely handles unconfigured AI state without crashing', async () => {
    const response = await AIService.simplifyText({
      text: 'Candidates must verify their aggregate score.',
      level: 'standard',
    });

    expect(response.simplifiedText).toBeDefined();
    expect(response.isAiGenerated).toBe(false);
  });
});
