import api from './api';

export interface ScriptScene {
  sceneNumber?: number;
  title?: string;
  duration?: number;
  location?: string;
  description?: string;
  cameraAngle?: string;
  voiceover?: string;
  dialogue?: string;
  bgm?: string;
  emotion?: string;
}

export interface VideoScript {
  id: string;
  projectId: string;
  title: string;
  logline?: string;
  scenes: ScriptScene[];
  totalDuration: number;
  version: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  storyboards?: any[];
  project?: { id: string; name: string; type: string };
}

export const scriptApi = {
  list: (projectId?: string): Promise<{ success: boolean; data: VideoScript[] }> =>
    api.get('/scripts', { params: { projectId } }),

  get: (id: string): Promise<{ success: boolean; data: VideoScript }> =>
    api.get(`/scripts/${id}`),

  create: (data: { projectId: string; title: string; scenes: ScriptScene[] }): Promise<{ success: boolean; data: VideoScript }> =>
    api.post('/scripts', data),

  update: (id: string, data: { title?: string; scenes?: ScriptScene[] }): Promise<{ success: boolean; data: VideoScript }> =>
    api.put(`/scripts/${id}`, data),

  delete: (id: string): Promise<{ success: boolean }> =>
    api.delete(`/scripts/${id}`),
};
