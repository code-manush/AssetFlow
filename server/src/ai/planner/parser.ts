import { Plan } from '../types';

export function parsePlan(text: string): Plan {
  try {
    const plan = JSON.parse(text);
    if (plan.Planning && plan.Tool_selection && plan.Output) return plan as Plan;
  } catch (e) {
    // Ignore and fallback
  }

  // Try to find a JSON block in the text
  const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  
  let jsonString = text;
  if (jsonMatch && jsonMatch[1]) {
    jsonString = jsonMatch[1];
  } else {
    // Extract between first { and last }
    const firstBrace = text.indexOf('{');
    const lastBrace = text.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      jsonString = text.substring(firstBrace, lastBrace + 1);
    }
  }

  try {
    const plan = JSON.parse(jsonString);
    if (!plan.Planning || !plan.Tool_selection || !plan.Output) {
      throw new Error('Missing required plan fields');
    }
    return plan as Plan;
  } catch (error) {
    console.log('Failed to parse JSON string:', jsonString);
    throw new Error('Could not parse plan JSON');
  }
}
