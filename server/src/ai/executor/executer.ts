import { Plan, Tool } from '../types';

export class Executor {
  async executePlan(plan: Plan, availableTools: Tool[]): Promise<any[]> {
    const results = [];

    if (!plan.Tool_calls || plan.Tool_calls.length === 0) {
      return [];
    }

    for (const call of plan.Tool_calls) {
      const tool = availableTools.find(t => t.name === call.name);
      if (!tool) {
        results.push({ tool: call.name, error: 'Tool not found' });
        continue;
      }

      try {
        console.log(`Executing tool: ${call.name} with args`, call.arguments);
        const result = await tool.execute(call.arguments);
        results.push({ tool: call.name, success: true, result });
      } catch (error: any) {
        console.error(`Error executing ${call.name}:`, error);
        results.push({ tool: call.name, success: false, error: error.message });
      }
    }

    return results;
  }
}
