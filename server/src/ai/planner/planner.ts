import { OllamaProvider } from '../provider/ollama';
import { getSystemPrompt } from '../prompts/systemPrompt';
import { Plan, Tool } from '../types';
import { parsePlan } from './parser';

export class Planner {
  private provider: OllamaProvider;

  constructor() {
    this.provider = new OllamaProvider();
  }

  async createPlan(query: string, availableTools: Tool[], history: string, userRole: string): Promise<Plan> {
    const toolsDescription = availableTools.map(t =>
      `Tool: ${t.name}\n  Description: ${t.description}\n  Parameters: ${JSON.stringify(t.parameters)}`
    ).join('\n\n');

    const prompt = `${getSystemPrompt(userRole)}

## AVAILABLE TOOLS
${toolsDescription}

## CONVERSATION HISTORY
${history || 'No prior conversation.'}

## USER QUERY
"${query}"

Respond ONLY with valid JSON. No explanation. No markdown. No code fences. Just the raw JSON object.`;

    const responseText = await this.provider.generate(prompt, { temperature: 0.1 });
    console.log('[AI RAW RESPONSE]', responseText.substring(0, 500));

    try {
      return parsePlan(responseText);
    } catch (e) {
      console.error('Failed to parse plan:', e);
      throw new Error('AI could not formulate a valid execution plan.');
    }
  }
}
