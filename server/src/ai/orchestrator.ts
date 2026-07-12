import { registry } from './tools/toolRegistry';
import { getAssetsTool, allocateAssetTool, registerAssetTool, updateAssetTool, deleteAssetTool } from './tools/assetTools';
import { bookResourceTool, getBookingsTool } from './tools/bookingTools';
import { raiseMaintenanceTool, getMaintenanceRequestsTool } from './tools/maintainanceTool';
import { getAssetUtilizationTool, getOverdueAllocationsTool } from './tools/reportTools';
import { getUsersTool, getDepartmentsTool, updateUserTool, createDepartmentTool } from './tools/userTools';
import { createAuditTool, logDiscrepancyTool } from './tools/auditTools';
import {
  returnAssetTool, approveTransferTool, approveMaintenanceTool,
  resolveMaintenanceTool, createBookingTool
} from './tools/actionTools';
import { Planner } from './planner/planner';
import { validatePlan } from './planner/validator';
import { Executor } from './executor/executer';
import { OllamaProvider } from './provider/ollama';
import { AgentResponse, Plan } from './types';
import { ConversationMemory } from './memory/conversationMemory';
import { AuthUser } from '../middleware/auth';

// Tool sets by role
const ADMIN_TOOLS = [
  getAssetsTool, allocateAssetTool, returnAssetTool, registerAssetTool,
  updateAssetTool, deleteAssetTool,
  bookResourceTool, getBookingsTool, createBookingTool,
  raiseMaintenanceTool, getMaintenanceRequestsTool, approveMaintenanceTool, resolveMaintenanceTool,
  approveTransferTool,
  getAssetUtilizationTool, getOverdueAllocationsTool,
  getUsersTool, getDepartmentsTool, updateUserTool, createDepartmentTool,
  createAuditTool, logDiscrepancyTool
];

const MANAGER_TOOLS = [
  getAssetsTool, allocateAssetTool, returnAssetTool, registerAssetTool,
  bookResourceTool, getBookingsTool, createBookingTool,
  raiseMaintenanceTool, getMaintenanceRequestsTool, approveMaintenanceTool, resolveMaintenanceTool,
  approveTransferTool,
  getAssetUtilizationTool, getOverdueAllocationsTool,
  getUsersTool, getDepartmentsTool,
  createAuditTool, logDiscrepancyTool
];

export class AssetFlowAgent {
  private planner: Planner;
  private executor: Executor;
  private provider: OllamaProvider;
  private memory: ConversationMemory;
  private userRole: string;

  constructor(userRole: string = 'ASSET_MANAGER') {
    this.planner = new Planner();
    this.executor = new Executor();
    this.provider = new OllamaProvider();
    this.memory = new ConversationMemory();
    this.userRole = userRole;

    // Register tools for this agent instance
    const tools = userRole === 'ADMIN' ? ADMIN_TOOLS : MANAGER_TOOLS;
    registry.clearTools();
    tools.forEach(t => registry.registerTool(t));
  }

  async processQuery(query: string, user?: AuthUser): Promise<AgentResponse> {
    try {
      this.memory.addMessage({ role: 'user', content: query });

      const availableTools = registry.getAllTools();
      const history = this.memory.getFormattedHistory();

      // Step 1: Planning
      const plan: Plan = await this.planner.createPlan(query, availableTools, history, this.userRole);

      // Step 2: Validation
      const isValid = validatePlan(plan, availableTools);
      if (!isValid) {
        const fallback = plan.Output || 'I could not determine the appropriate action.';
        this.memory.addMessage({ role: 'assistant', content: fallback });
        return { success: true, message: fallback };
      }

      // Step 3: Execution (if there are tool calls)
      let results: any[] = [];
      if (plan.Tool_calls && plan.Tool_calls.length > 0) {
        results = await this.executor.executePlan(plan, availableTools);
      }

      // Step 4: Final synthesis
      let finalMessage: string;
      if (results.length === 0) {
        // No tools needed, just return the planned output as a conversational response
        const synthesisPrompt = `You are AssetFlow AI. The user asked: "${query}".
Your planned response: "${plan.Output}".
Conversation history: ${history}
Provide a concise, professional response. No JSON. No technical details. Just the answer.`;
        finalMessage = await this.provider.generate(synthesisPrompt, { temperature: 0.3 });
      } else {
        const synthesisPrompt = `You are AssetFlow AI. The user asked: "${query}".
The tools returned the following data: ${JSON.stringify(results, null, 2)}.
Conversation history: ${history}
Provide a concise, professional summary of these results. No JSON in the output. Format as readable text.`;
        finalMessage = await this.provider.generate(synthesisPrompt, { temperature: 0.3 });
      }

      this.memory.addMessage({ role: 'assistant', content: finalMessage });
      return { success: true, message: finalMessage, data: results };
    } catch (error: any) {
      console.error('Agent error:', error);
      return { success: false, message: error.message || 'An error occurred during processing.' };
    }
  }
}
