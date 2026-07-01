import { prisma } from '../lib/prisma';
import crypto from 'crypto';

export interface SeedanceConfig {
  apiKey: string;
  baseUrl: string;
}

export interface GenerateVideoParams {
  prompt: string;
  model?: 'seedance-2.0' | 'seedance-2.5';
  duration?: number;
  resolution?: '720p' | '1080p' | '4k';
  aspectRatio?: '16:9' | '9:16' | '1:1' | '4:3';
  style?: string;
  seed?: number;
  referenceImages?: string[];
  negativePrompt?: string;
  fps?: number;
  cameraMotion?: 'static' | 'pan_left' | 'pan_right' | 'tilt_up' | 'tilt_down' | 'zoom_in' | 'zoom_out' | 'orbit';
}

export interface VideoGenerationTask {
  taskId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress?: number;
  videoUrl?: string;
  thumbnailUrl?: string;
  duration?: number;
  error?: string;
  createdAt?: string;
  completedAt?: string;
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

  private isMockMode(): boolean {
    return !this.config?.apiKey || this.config.apiKey.includes('YOUR') || this.config.apiKey === '';
  }

  private generateMockTaskId(): string {
    return `mock_${crypto.randomBytes(16).toString('hex')}`;
  }

  private mockVideoUrls = [
    'https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4',
    'https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_2mb.mp4',
  ];

  async generateVideo(params: GenerateVideoParams): Promise<VideoGenerationTask> {
    const config = await this.getConfig();
    if (!config) {
      return {
        taskId: 'unconfigured',
        status: 'failed',
        error: 'Seedance API 未配置，请联系管理员配置',
      };
    }

    if (this.isMockMode()) {
      return this.mockGenerateVideo(params);
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
          model: params.model || 'seedance-2.5',
          duration: params.duration || 5,
          resolution: params.resolution || '1080p',
          aspect_ratio: params.aspectRatio || '16:9',
          style: params.style,
          seed: params.seed,
          reference_images: params.referenceImages,
          negative_prompt: params.negativePrompt,
          fps: params.fps,
          camera_motion: params.cameraMotion,
        }),
      });

      if (!response.ok) {
        const error: any = await response.json().catch(() => ({ message: '生成失败' }));
        return {
          taskId: 'error',
          status: 'failed',
          error: error.message || `生成失败 (${response.status})`,
        };
      }

      const data: any = await response.json();
      return {
        taskId: data.task_id || data.id,
        status: 'processing',
        progress: 0,
        createdAt: new Date().toISOString(),
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

    if (this.isMockMode() || taskId.startsWith('mock_')) {
      return this.mockGetTaskStatus(taskId);
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

      const data: any = await response.json();
      return {
        taskId: data.task_id || taskId,
        status: data.status || 'processing',
        progress: data.progress,
        videoUrl: data.video_url,
        thumbnailUrl: data.thumbnail_url,
        duration: data.duration,
        error: data.error,
        createdAt: data.created_at,
        completedAt: data.completed_at,
      };
    } catch (error: any) {
      return {
        taskId,
        status: 'failed',
        error: error.message || '网络错误',
      };
    }
  }

  async batchGenerateVideo(paramsList: GenerateVideoParams[]): Promise<VideoGenerationTask[]> {
    const results: VideoGenerationTask[] = [];
    for (const params of paramsList) {
      const result = await this.generateVideo(params);
      results.push(result);
    }
    return results;
  }

  getModels(): { id: string; name: string; description: string }[] {
    return [
      {
        id: 'seedance-2.0',
        name: 'Seedance 2.0',
        description: '稳定版，适合大多数视频生成场景，支持5-10秒视频生成',
      },
      {
        id: 'seedance-2.5',
        name: 'Seedance 2.5',
        description: '最新版，画质提升，支持更长时长和更多镜头运动',
      },
    ];
  }

  private mockGenerateVideo(params: GenerateVideoParams): VideoGenerationTask {
    const taskId = this.generateMockTaskId();
    console.log(`[SeedanceService] Mock generate video: ${params.prompt.substring(0, 50)}...`);

    return {
      taskId,
      status: 'processing',
      progress: 0,
      createdAt: new Date().toISOString(),
    };
  }

  private mockGetTaskStatus(taskId: string): VideoGenerationTask {
    const randomProgress = Math.floor(Math.random() * 100);
    const isCompleted = randomProgress > 80;

    if (isCompleted) {
      return {
        taskId,
        status: 'completed',
        progress: 100,
        videoUrl: this.mockVideoUrls[Math.floor(Math.random() * this.mockVideoUrls.length)],
        thumbnailUrl: '',
        duration: 5,
        createdAt: new Date(Date.now() - 60000).toISOString(),
        completedAt: new Date().toISOString(),
      };
    }

    return {
      taskId,
      status: 'processing',
      progress: randomProgress,
      createdAt: new Date(Date.now() - 30000).toISOString(),
    };
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
        const error: any = await response.json().catch(() => ({ message: '生成分镜失败' }));
        return { taskId: 'error', status: 'failed', error: error.message };
      }

      const data: any = await response.json();
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
