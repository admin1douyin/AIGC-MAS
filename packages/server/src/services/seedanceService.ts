import { prisma } from './prisma';

export interface SeedanceConfig {
  apiKey: string;
  baseUrl: string;
}

export interface GenerateVideoParams {
  prompt: string;
  model?: string;
  duration?: number;
  resolution?: string;
  aspectRatio?: string;
  style?: string;
  seed?: number;
  referenceImage?: string;
}

export interface VideoGenerationTask {
  taskId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress?: number;
  videoUrl?: string;
  thumbnailUrl?: string;
  error?: string;
}

class SeedanceService {
  private config: SeedanceConfig | null = null;

  async getConfig(): Promise<SeedanceConfig | null> {
    if (this.config) return this.config;

    try {
      const [apiKeyConfig, baseUrlConfig] = await Promise.all([
        prisma.systemConfig.findUnique({
          where: { category_key: { category: 'seedance', key: 'API_KEY' } },
        }),
        prisma.systemConfig.findUnique({
          where: { category_key: { category: 'seedance', key: 'BASE_URL' } },
        }),
      ]);

      if (!apiKeyConfig?.value) {
        return null;
      }

      this.config = {
        apiKey: apiKeyConfig.value,
        baseUrl: baseUrlConfig?.value || 'https://api.seedance.com',
      };

      return this.config;
    } catch {
      return null;
    }
  }

  async isConfigured(): Promise<boolean> {
    const config = await this.getConfig();
    return !!config?.apiKey;
  }

  async generateVideo(params: GenerateVideoParams): Promise<VideoGenerationTask> {
    const config = await this.getConfig();
    if (!config) {
      return {
        taskId: 'unconfigured',
        status: 'failed',
        error: 'Seedance API 未配置，请联系管理员配置',
      };
    }

    try {
      const response = await fetch(`${config.baseUrl}/v1/videos/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${config.apiKey}`,
        },
        body: JSON.stringify({
          prompt: params.prompt,
          model: params.model || 'seedance-2.0',
          duration: params.duration || 5,
          resolution: params.resolution || '1080p',
          aspect_ratio: params.aspectRatio || '16:9',
          style: params.style,
          seed: params.seed,
          reference_image: params.referenceImage,
        }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: '生成失败' }));
        return {
          taskId: 'error',
          status: 'failed',
          error: error.message || `生成失败 (${response.status})`,
        };
      }

      const data = await response.json();
      return {
        taskId: data.task_id || data.id,
        status: 'processing',
        progress: 0,
      };
    } catch (error: any) {
      return {
        taskId: 'error',
        status: 'failed',
        error: error.message || '网络错误',
      };
    }
  }

  async getTaskStatus(taskId: string): Promise<VideoGenerationTask> {
    const config = await this.getConfig();
    if (!config) {
      return {
        taskId,
        status: 'failed',
        error: 'Seedance API 未配置',
      };
    }

    try {
      const response = await fetch(`${config.baseUrl}/v1/videos/${taskId}`, {
        headers: {
          'Authorization': `Bearer ${config.apiKey}`,
        },
      });

      if (!response.ok) {
        return {
          taskId,
          status: 'failed',
          error: `查询失败 (${response.status})`,
        };
      }

      const data = await response.json();
      return {
        taskId: data.task_id || taskId,
        status: data.status || 'processing',
        progress: data.progress,
        videoUrl: data.video_url,
        thumbnailUrl: data.thumbnail_url,
        error: data.error,
      };
    } catch (error: any) {
      return {
        taskId,
        status: 'failed',
        error: error.message || '网络错误',
      };
    }
  }

  async generateStoryboard(params: {
    prompt: string;
    shotCount?: number;
    style?: string;
  }): Promise<{ taskId: string; status: string; shots?: any[]; error?: string }> {
    const config = await this.getConfig();
    if (!config) {
      return { taskId: 'unconfigured', status: 'failed', error: 'Seedance API 未配置' };
    }

    try {
      const response = await fetch(`${config.baseUrl}/v1/storyboard/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${config.apiKey}`,
        },
        body: JSON.stringify({
          prompt: params.prompt,
          shot_count: params.shotCount || 4,
          style: params.style,
        }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: '生成分镜失败' }));
        return { taskId: 'error', status: 'failed', error: error.message };
      }

      const data = await response.json();
      return {
        taskId: data.task_id || data.id,
        status: 'completed',
        shots: data.shots || [],
      };
    } catch (error: any) {
      return {
        taskId: 'error',
        status: 'failed',
        error: error.message || '网络错误',
      };
    }
  }

  clearCache() {
    this.config = null;
  }
}

export const seedanceService = new SeedanceService();
