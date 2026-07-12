import { Plan, Tool } from '../types';

export function validatePlan(plan: Plan, availableTools: Tool[]): boolean {
  if (!plan.Tool_calls || plan.Tool_calls.length === 0) {
    return true; // No tools to validate
  }

  const toolNames = availableTools.map(t => t.name);

  for (const call of plan.Tool_calls) {
    if (!toolNames.includes(call.name)) {
      console.warn(`Tool ${call.name} requested in plan but not available.`);
      return false;
    }
  }

  return true;
}
