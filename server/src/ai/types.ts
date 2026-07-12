export interface ToolParameter {
  name: string;
  type: string;
  description: string;
  required: boolean;
}

export interface Tool {
  name: string;
  description: string;
  parameters: ToolParameter[];
  execute: (args: any) => Promise<any>;
}

export interface ToolCall {
  name: string;
  arguments: any;
}

export interface Plan {
  Planning: string;
  Tool_selection: string;
  Implementation: string;
  Output: string;
  Tool_calls?: ToolCall[];
}

export interface AgentResponse {
  message: string;
  success: boolean;
  data?: any;
}

export interface Message {
  role: 'system' | 'user' | 'assistant' | 'tool';
  content: string;
}
