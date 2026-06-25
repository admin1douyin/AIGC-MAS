import api from './api';

export interface Project {
  id: string;
  name: string;
  type: 'short_drama' | 'corporate_video' | 'tourism_promo';
  status: string;
  description: string;
  brief?: any;
  progress: number;
  owner?: any;
  tags: string[];
  estimatedDuration?: number;
  actualDuration?: number;
  budget?: number;
  createdAt: string;
  updatedAt: string;
  startedAt?: string;
  completedAt?: string;
  agents?: any[];
  tasks?: any[];
  scripts?: any[];
  assets?: any[];
  finalVideos?: any[];
  shortDrama?: any;
  corporateVideo?: any;
  tourismPromo?: any;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export const projectApi = {
  list: (params?: {
    page?: number;
    pageSize?: number;
    type?: string;
    status?: string;
    search?: string;
  }): Promise<{ success: boolean; data: PaginatedResponse<Project> }> =>
    api.get('/projects', { params }),

  get: (id: string): Promise<{ success: boolean; data: Project }> =>
    api.get(`/projects/${id}`),

  create: (data: Partial<Project>): Promise<{ success: boolean; data: Project }> =>
    api.post('/projects', data),

  update: (id: string, data: Partial<Project>): Promise<{ success: boolean; data: Project }> =>
    api.put(`/projects/${id}`, data),

  delete: (id: string): Promise<{ success: boolean }> =>
    api.delete(`/projects/${id}`),

  start: (id: string): Promise<{ success: boolean; data: any }> =>
    api.post(`/projects/${id}/start`),

  pause: (id: string): Promise<{ success: boolean; data: any }> =>
    api.post(`/projects/${id}/pause`),

  resume: (id: string): Promise<{ success: boolean; data: any }> =>
    api.post(`/projects/${id}/resume`),
};
