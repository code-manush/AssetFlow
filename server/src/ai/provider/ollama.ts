interface OllamaOptions {
  model?: string;
  temperature?: number;
}

export class OllamaProvider {
  private baseUrl: string;
  private defaultModel: string;

  constructor(baseUrl: string = 'http://localhost:11434', model: string = 'qwen3:8b') {
    this.baseUrl = baseUrl;
    this.defaultModel = model;
  }

  async generate(prompt: string, options?: OllamaOptions): Promise<string> {
    const model = options?.model || this.defaultModel;
    const temperature = options?.temperature ?? 0.7;

    const response = await fetch(`${this.baseUrl}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        prompt,
        stream: false,
        options: { temperature },
      }),
    });

    if (!response.ok) {
      throw new Error(`Ollama generation failed: ${response.statusText}`);
    }

    const data = await response.json();
    return data.response;
  }
}
