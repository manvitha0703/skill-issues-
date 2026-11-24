import { describe, it, expect, vi, beforeEach } from 'vitest';
import { OllamaProvider } from '../providers/ollamaProvider';
import { AIService } from '../aiService';

describe('Local-First AI and Ollama Integration', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('checks Ollama health with safe timeout and returns false if server is unreachable', async () => {
    // Mock fetch rejection (e.g. ECONNREFUSED)
    global.fetch = vi.fn().mockRejectedValue(new Error('Failed to connect to localhost:11434'));

    const isAvailable = await OllamaProvider.isAvailable();
    expect(isAvailable).toBe(false);
  });

  it('detects available models when Ollama returns valid tags JSON', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        models: [
          { name: 'llama3:latest' },
          { name: 'mistral:latest' },
        ],
      }),
    });

    const isAvailable = await OllamaProvider.isAvailable();
    expect(isAvailable).toBe(true);

    const models = await OllamaProvider.listLocalModels();
    expect(models).toContain('llama3:latest');
    expect(models).toContain('mistral:latest');
  });

  it('AIService falls back gracefully to local deterministic algorithms without errors', async () => {
    // Ensure mock fetch fails so it must fallback
    global.fetch = vi.fn().mockRejectedValue(new Error('Network down'));

    const result = await AIService.simplifyText({
      text: 'The domicile state requirement is mandatory: candidate matriculation credentials must conform strictly with regulations.',
      level: 'simple',
    });

    expect(result).toBeDefined();
    expect(result.simplifiedText).toBeDefined();
    expect(typeof result.simplifiedText).toBe('string');
    expect(result.simplifiedText.length).toBeGreaterThan(5);
  });
});
