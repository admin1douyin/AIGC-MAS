import api from './api';

export interface Agent {
  id: string;
  name: string;
  role: string;
  status: string;
  description: string;
  capabilities: string[];
  currentTaskId?: string;
  projectId?: string;
  createdAt: string;
  updatedAt: string;
}

export const agentApi = {
  list: (params?: { projectId?: string; role?: string; status?: string }): Promise<{ success: boolean; data: Agent[] }> =>
    api.get('/agents', { params }),

  get: (id: string): Promise<{ success: boolean; data: Agent }> =>
    api.get(`/agents/${id}`),

  getMessages: (id: string, projectId?: string): Promise<{ success: boolean; data: any[] }> =>
    api.get(`/agents/${id}/messages`, { params: { projectId } }),

  getRegistry: (): Promise<{ success: boolean; data: any[] }> =>
    api.get('/agents/registry/list'),
};
