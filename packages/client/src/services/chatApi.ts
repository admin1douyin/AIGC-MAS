import api from './api';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  metadata?: any;
}

export const chatApi = {
  sendMessage: (data: {
    projectId?: string;
    message: string;
    agentRole?: string;
    context?: any;
  }): Promise<{ success: boolean; data: ChatMessage }> =>
    api.post('/agents/chat', data),

  getHistory: (projectId: string): Promise<{ success: boolean; data: ChatMessage[] }> =>
    api.get(`/agents/chat/history`, { params: { projectId } }),

  clearHistory: (projectId: string): Promise<{ success: boolean }> =>
    api.delete(`/agents/chat/history`, { params: { projectId } }),

  quickActions: (projectId?: string): Promise<{ success: boolean; data: any[] }> =>
    api.get('/agents/chat/quick-actions', { params: { projectId } }),
};
