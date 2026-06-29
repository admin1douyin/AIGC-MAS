import crypto from 'crypto';

export interface SeedanceConfig {
  apiKey: string;
  baseUrl: string;
  defaultModel: 'seedance-2.0' | 'seedance-2.5';
}

export interface VideoGenerationParams {
  prompt: string;
  model?: 'seedance-2.0' | 'seedance-2.5';
  duration?: number;
  aspectRatio?: '16:9' | '9:16' | '1:1' | '4:3';
  resolution?: '720p' | '1080p' | '4k';
  style?: string;
  referenceImages?: string[];
  seed?: number;
  negativePrompt?: string;
  fps?: number;
  cameraMotion?: 'static' | 'pan_left' | 'pan_right' | 'tilt_up' | 'tilt_down' | 'zoom_in' | 'zoom_out' | 'orbit';
}

export interface VideoGenerationResult {
  taskId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  videoUrl?: string;
  thumbnailUrl?: string;
  duration?: number;
  error?: string;
}

export interface VideoTaskStatus {
  taskId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress?: number;
  videoUrl?: string;
  thumbnailUrl?: string;
  duration?: number;
  error?: string;
  createdAt: string;
  completedAt?: string;
}

function getSeedanceConfig(): SeedanceConfig {
  const apiKey = process.env.SEEDANCE_API_KEY || '';
  const baseUrl = process.env.SEEDANCE_BASE_URL || 'https://api.seedance.com/v1';
  const defaultModel = (process.env.SEEDANCE_DEFAULT_MODEL as 'seedance-2.0' | 'seedance-2.5') || 'seedance-2.5';

  return { apiKey, baseUrl, defaultModel };
}

function isMockMode(): boolean {
  const config = getSeedanceConfig();
  return !config.apiKey || config.apiKey.includes('YOUR') || config.apiKey === '';
}

function generateMockTaskId(): string {
  return `mock_${crypto.randomBytes(16).toString('hex')}`;
}

const mockVideoUrls = [
  'https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4',
  'https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_2mb.mp4',
];

export class SeedanceService {
  private config: SeedanceConfig;

  constructor() {
    this.config = getSeedanceConfig();
  }

  async generateVideo(params: VideoGenerationParams): Promise<VideoGenerationResult> {
    if (isMockMode()) {
      return this.mockGenerateVideo(params);
    }

    try {
      const url = `${this.config.baseUrl}/video/generations`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`,
        },
        body: JSON.stringify({
          prompt: params.prompt,
          model: params.model || this.config.defaultModel,
          duration: params.duration || 5,
          aspect_ratio: params.aspectRatio || '16:9',
          resolution: params.resolution || '1080p',
          style: params.style,
          reference_images: params.referenceImages,
          seed: params.seed,
          negative_prompt: params.negativePrompt,
          fps: params.fps,
          camera_motion: params.cameraMotion,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Seedance API error: ${response.status} - ${JSON.stringify(errorData)}`);
      }

      const data = await response.json() as any;
      return {
        taskId: data.task_id || data.id,
        status: data.status || 'pending',
      };
    } catch (error) {
      console.error('[SeedanceService] Generate video error:', error);
      throw error;
    }
  }

  async getTaskStatus(taskId: string): Promise<VideoTaskStatus> {
    if (isMockMode() || taskId.startsWith('mock_')) {
      return this.mockGetTaskStatus(taskId);
    }

    try {
      const url = `${this.config.baseUrl}/video/generations/${taskId}`;
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Seedance API error: ${response.status}`);
      }

      const data = await response.json() as any;
      return {
        taskId: data.task_id || data.id || taskId,
        status: data.status || 'processing',
        progress: data.progress,
        videoUrl: data.video_url,
        thumbnailUrl: data.thumbnail_url,
        duration: data.duration,
        error: data.error,
        createdAt: data.created_at || new Date().toISOString(),
        completedAt: data.completed_at,
      };
    } catch (error) {
      console.error('[SeedanceService] Get task status error:', error);
      throw error;
    }
  }

  async batchGenerateVideo(paramsList: VideoGenerationParams[]): Promise<VideoGenerationResult[]> {
    const results: VideoGenerationResult[] = [];
    for (const params of paramsList) {
      const result = await this.generateVideo(params);
      results.push(result);
    }
    return results;
  }

  async waitForCompletion(taskId: string, timeoutMs: number = 300000, pollIntervalMs: number = 5000): Promise<VideoTaskStatus> {
    const startTime = Date.now();

    while (Date.now() - startTime < timeoutMs) {
      const status = await this.getTaskStatus(taskId);

      if (status.status === 'completed' || status.status === 'failed') {
        return status;
      }

      await new Promise(resolve => setTimeout(resolve, pollIntervalMs));
    }

    throw new Error(`Video generation timeout after ${timeoutMs}ms`);
  }

  private mockGenerateVideo(params: VideoGenerationParams): VideoGenerationResult {
    const taskId = generateMockTaskId();
    console.log(`[SeedanceService] Mock generate video: ${params.prompt.substring(0, 50)}...`);

    return {
      taskId,
      status: 'processing',
    };
  }

  private mockGetTaskStatus(taskId: string): VideoTaskStatus {
    const randomProgress = Math.floor(Math.random() * 100);
    const isCompleted = randomProgress > 80;

    if (isCompleted) {
      return {
        taskId,
        status: 'completed',
        progress: 100,
        videoUrl: mockVideoUrls[Math.floor(Math.random() * mockVideoUrls.length)],
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
}

export const seedanceService = new SeedanceService();
