import api from './api';

export interface Asset {
  id: string;
  projectId: string;
  type: 'video' | 'image' | 'audio' | 'document';
  name: string;
  url: string;
  duration?: number;
  category?: string;
  tags?: string;
  metadata?: string;
  size?: number;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAssetParams {
  projectId: string;
  type: 'video' | 'image' | 'audio' | 'document';
  name: string;
  url?: string;
  duration?: number;
  category?: string;
  tags?: string[];
  metadata?: Record<string, any>;
}

export const assetApi = {
  list: (params?: {
    projectId?: string;
    type?: string;
    category?: string;
    tag?: string;
    search?: string;
  }): Promise<{ success: boolean; data: Asset[] }> =>
    api.get('/assets', { params }),

  get: (id: string): Promise<{ success: boolean; data: Asset }> =>
    api.get(`/assets/${id}`),

  create: (data: CreateAssetParams): Promise<{ success: boolean; data: Asset }> =>
    api.post('/assets', {
      ...data,
      tags: data.tags ? JSON.stringify(data.tags) : undefined,
      metadata: data.metadata ? JSON.stringify(data.metadata) : undefined,
    }),

  update: (id: string, data: Partial<CreateAssetParams>): Promise<{ success: boolean; data: Asset }> =>
    api.put(`/assets/${id}`, {
      ...data,
      tags: data.tags ? JSON.stringify(data.tags) : undefined,
      metadata: data.metadata ? JSON.stringify(data.metadata) : undefined,
    }),

  delete: (id: string): Promise<{ success: boolean }> =>
    api.delete(`/assets/${id}`),

  upload: (
    file: File,
    params: {
      projectId: string;
      type: 'video' | 'image' | 'audio' | 'document';
      name?: string;
      duration?: number;
      category?: string;
      tags?: string[];
    }
  ): Promise<{ success: boolean; data: Asset }> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('projectId', params.projectId);
    formData.append('type', params.type);
    formData.append('name', params.name || file.name);
    if (params.duration) formData.append('duration', String(params.duration));
    if (params.category) formData.append('category', params.category);
    if (params.tags) formData.append('tags', JSON.stringify(params.tags));

    return api.post('/assets/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  batchUpload: (
    files: File[],
    params: {
      projectId: string;
      type: 'video' | 'image' | 'audio' | 'document';
      category?: string;
      tags?: string[];
    }
  ): Promise<{ success: boolean; data: { success: boolean; data?: Asset; error?: string }[] }> => {
    const formData = new FormData();
    files.forEach(file => formData.append('files', file));
    formData.append('projectId', params.projectId);
    formData.append('type', params.type);
    if (params.category) formData.append('category', params.category);
    if (params.tags) formData.append('tags', JSON.stringify(params.tags));

    return api.post('/assets/upload/batch', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  getCategories: (projectId?: string): Promise<{ success: boolean; data: string[] }> =>
    api.get('/assets/categories', { params: { projectId } }),

  getTags: (projectId?: string): Promise<{ success: boolean; data: string[] }> =>
    api.get('/assets/tags', { params: { projectId } }),

  getSignedUrl: (id: string): Promise<{ success: boolean; data: { url: string; signed: boolean } }> =>
    api.get(`/assets/${id}/signed-url`),
};
