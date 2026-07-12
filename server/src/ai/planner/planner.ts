import { OllamaProvider } from '../provider/ollama';
import { SYSTEM_PROMPT } from '../prompts/systemPrompt';
import { Plan, Tool } from '../types';
import { parsePlan } from './parser';

export class Planner {
  private provider: OllamaProvider;

  constructor() {
    this.provider = new OllamaProvider();
  }

  async createPlan(query: string, availableTools: Tool[], history: string): Promise<Plan> {
    const toolsDescription = availableTools.map(t => 
      `- ${t.name}: ${t.description} \n  Parameters: ${JSON.stringify(t.parameters)}`
    ).join('\n');

    const prompt = `${SYSTEM_PROMPT}\n\nAvailable tools:\n${toolsDescription}\n\nConversation History:\n${history}\n\nUser Query: "${query}"\n\nPlease output the Workflow in JSON format containing Planning, Tool_selection, Implementation, Output, and an optional Tool_calls array with { name, arguments }.`;

    const responseText = await this.provider.generate(prompt);
    
    try {
      return parsePlan(responseText);
    } catch (e) {
      console.error('Failed to parse plan:', e);
      throw new Error('AI could not formulate a valid execution plan.');
    }
  }
}
