export interface OllamaModelInfo {
  name: string;
  size: number;
  digest: string;
  modified_at: string;
}

export class OllamaProvider {
  private static defaultEndpoint = 'http://localhost:11434';

  /**
   * Checks if local Ollama inference server is online and reachable
   */
  static async checkStatus(endpoint = this.defaultEndpoint): Promise<{
    online: boolean;
    models: OllamaModelInfo[];
    error?: string;
  }> {
    try {
      const res = await fetch(`${endpoint.replace(/\/$/, '')}/api/tags`, {
        method: 'GET',
        headers: { Accept: 'application/json' },
      });

      if (!res.ok) {
        return { online: false, models: [], error: `HTTP ${res.status}` };
      }

      const data = await res.json();
      return {
        online: true,
        models: (data.models || []) as OllamaModelInfo[],
      };
    } catch (err) {
      return {
        online: false,
        models: [],
        error: 'Local Ollama server is offline or unreachable at ' + endpoint,
      };
    }
  }

  /**
   * Helper to quickly check if Ollama server is running
   */
  static async isAvailable(endpoint = this.defaultEndpoint): Promise<boolean> {
    const status = await this.checkStatus(endpoint);
    return status.online;
  }

  /**
   * Helper to retrieve model tag names
   */
  static async listLocalModels(endpoint = this.defaultEndpoint): Promise<string[]> {
    const status = await this.checkStatus(endpoint);
    return status.models.map((m) => m.name);
  }

  /**
   * Generates text locally using local Ollama model
   */
  static async generate(
    prompt: string,
    model = 'llama3',
    endpoint = this.defaultEndpoint,
    system?: string
  ): Promise<string> {
    const url = `${endpoint.replace(/\/$/, '')}/api/generate`;

    const body: Record<string, unknown> = {
      model,
      prompt,
      stream: false,
      options: {
        temperature: 0.3,
        num_predict: 1200,
      },
    };

    if (system) {
      body.system = system;
    }

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Local Ollama error (${res.status}): ${errText}`);
    }

    const data = await res.json();
    return (data.response || '').trim();
  }
}
