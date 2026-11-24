import { AIConfig } from '../../types/ai';

export class OpenAIProvider {
  static async generate(config: AIConfig, prompt: string, systemInstruction?: string): Promise<string> {
    const isGroq = config.provider === 'groq';
    const defaultEndpoint = isGroq
      ? 'https://api.groq.com/openai/v1/chat/completions'
      : 'https://api.openai.com/v1/chat/completions';
    const endpoint = config.endpoint || defaultEndpoint;
    const model = config.model || (isGroq ? 'llama-3.3-70b-versatile' : 'gpt-4o-mini');

    const messages = [];
    if (systemInstruction) {
      messages.push({ role: 'system', content: systemInstruction });
    }
    messages.push({ role: 'user', content: prompt });

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${config.apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: config.temperature ?? 0.3,
        max_tokens: config.maxTokens ?? 1500,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`${isGroq ? 'Groq' : 'OpenAI'} API Error (${response.status}): ${errorText}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error('API returned an empty response.');
    }

    return content.trim();
  }
}
