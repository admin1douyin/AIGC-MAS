import api from './api';

export interface GenerateVideoParams {
  projectId?: string;
  scriptId?: string;
  sceneId?: string;
  prompt: string;
  model?: 'seedance-2.0' | 'seedance-2.5';
  duration?: number;
  aspectRatio?: '16:9' | '9:16' | '1:1' | '4:3';
  resolution?: '720p' | '1080p' | '4k';
  style?: string;
  referenceImages?: string[];
  assetIds?: string[];
  seed?: number;
  negativePrompt?: string;
  cameraMotion?: string;
}

export interface VideoGenerationTask {
  taskId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress?: number;
  videoUrl?: string;
  thumbnailUrl?: string;
  duration?: number;
  error?: string;
  credits?: number;
}

export const videoApi = {
  generate: (params: GenerateVideoParams): Promise<{ success: boolean; data: VideoGenerationTask }> =>
    api.post('/video-generation/generate', params),

  batchGenerate: (params: {
    projectId: string;
    scenes: { sceneId?: string; prompt: string; duration?: number }[];
    model?: string;
    aspectRatio?: string;
    resolution?: string;
  }): Promise<{ success: boolean; data: VideoGenerationTask[] }> =>
    api.post('/video-generation/batch-generate', params),

  getTaskStatus: (taskId: string): Promise<{ success: boolean; data: VideoGenerationTask }> =>
    api.get(`/video-generation/task/${taskId}`),

  getModels: (): Promise<{ success: boolean; data: { id: string; name: string; description: string }[] }> =>
    api.get('/video-generation/models'),

  generateFromScript: (scriptId: string, params?: {
    model?: string;
    aspectRatio?: string;
    resolution?: string;
  }): Promise<{ success: boolean; data: { tasks: VideoGenerationTask[]; totalScenes: number } }> =>
    api.post(`/video-generation/generate-from-script/${scriptId}`, params),
};
