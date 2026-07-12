import { Message } from '../types';

export class ConversationMemory {
  private history: Message[] = [];

  addMessage(message: Message) {
    this.history.push(message);
  }

  getHistory(): Message[] {
    return this.history;
  }

  getFormattedHistory(): string {
    return this.history.map(m => `${m.role.toUpperCase()}: ${m.content}`).join('\n');
  }

  clear() {
    this.history = [];
  }
}
