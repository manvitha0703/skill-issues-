import { AIConfig } from '../../types/ai';

export class AnthropicProvider {
  static async generate(config: AIConfig, prompt: string, systemInstruction?: string): Promise<string> {
    const endpoint = config.endpoint || 'https://api.anthropic.com/v1/messages';
    const model = config.model || 'claude-3-5-sonnet-20241022';

    const body: Record<string, unknown> = {
      model,
      max_tokens: config.maxTokens ?? 1500,
      temperature: config.temperature ?? 0.3,
      messages: [{ role: 'user', content: prompt }],
    };

    if (systemInstruction) {
      body.system = systemInstruction;
    }

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': config.apiKey,
        'anthropic-version': '2023-06-01',
        'dangerously-allow-browser': 'true', // Client-side extension call
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Anthropic API Error (${response.status}): ${errorText}`);
    }

    const data = await response.json();
    const content = data.content?.[0]?.text;

    if (!content) {
      throw new Error('Anthropic API returned an empty response.');
    }

    return content.trim();
  }
}
