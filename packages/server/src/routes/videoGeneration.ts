import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { validate } from '../middleware/validate';
import { requireAuth } from '../middleware/auth';
import { seedanceService } from '../services/seedance';
import { prisma } from '../lib/prisma';

const router = Router();

const generateVideoSchema = z.object({
  projectId: z.string().optional(),
  scriptId: z.string().optional(),
  sceneId: z.string().optional(),
  prompt: z.string(),
  model: z.enum(['seedance-2.0', 'seedance-2.5']).optional(),
  duration: z.number().min(1).max(60).optional(),
  aspectRatio: z.enum(['16:9', '9:16', '1:1', '4:3']).optional(),
  resolution: z.enum(['720p', '1080p', '4k']).optional(),
  style: z.string().optional(),
  referenceImages: z.array(z.string().url()).optional(),
  assetIds: z.array(z.string()).optional(),
  seed: z.number().int().optional(),
  negativePrompt: z.string().optional(),
  cameraMotion: z.enum(['static', 'pan_left', 'pan_right', 'tilt_up', 'tilt_down', 'zoom_in', 'zoom_out', 'orbit']).optional(),
});

const batchGenerateSchema = z.object({
  projectId: z.string(),
  scenes: z.array(z.object({
    sceneId: z.string().optional(),
    prompt: z.string(),
    duration: z.number().optional(),
  })),
  model: z.enum(['seedance-2.0', 'seedance-2.5']).optional(),
  aspectRatio: z.enum(['16:9', '9:16', '1:1', '4:3']).optional(),
  resolution: z.enum(['720p', '1080p', '4k']).optional(),
});

router.post('/generate', requireAuth, validate(generateVideoSchema), async (req: Request, res: Response) => {
  try {
    const { projectId, scriptId, sceneId, assetIds, ...params } = req.body;

    let referenceImages = params.referenceImages || [];

    if (assetIds && assetIds.length > 0) {
      const assets = await prisma.videoAsset.findMany({
        where: { id: { in: assetIds } },
        select: { url: true, type: true },
      });

      const imageUrls = assets
        .filter(a => a.type === 'image' && a.url)
        .map(a => a.url);

      referenceImages = [...referenceImages, ...imageUrls];
    }

    const result = await seedanceService.generateVideo({
      ...params,
      referenceImages: referenceImages.length > 0 ? referenceImages : undefined,
    });

    if (projectId) {
      await prisma.videoAsset.create({
        data: {
          projectId,
          type: 'video',
          name: `生成视频 - ${new Date().toLocaleString()}`,
          url: result.videoUrl || '',
          duration: params.duration,
          category: 'generated',
          metadata: JSON.stringify({
            taskId: result.taskId,
            model: params.model || 'seedance-2.5',
            prompt: params.prompt,
            sceneId,
            scriptId,
            assetIds,
            params,
          }),
          createdBy: req.profile!.id,
        },
      });
    }

    res.json({ success: true, data: result });
  } catch (error: any) {
    console.error('Generate video error:', error);
    res.status(500).json({
      success: false,
      error: { code: 'GENERATION_ERROR', message: error.message }
    });
  }
});

router.post('/batch-generate', requireAuth, validate(batchGenerateSchema), async (req: Request, res: Response) => {
  try {
    const { projectId, scenes, model, aspectRatio, resolution } = req.body;

    const paramsList = scenes.map((scene: any) => ({
      prompt: scene.prompt,
      model: model || 'seedance-2.5',
      duration: scene.duration || 5,
      aspectRatio,
      resolution,
    }));

    const results = await seedanceService.batchGenerateVideo(paramsList);

    res.json({ success: true, data: results });
  } catch (error: any) {
    console.error('Batch generate video error:', error);
    res.status(500).json({
      success: false,
      error: { code: 'GENERATION_ERROR', message: error.message }
    });
  }
});

router.get('/task/:taskId', requireAuth, async (req: Request, res: Response) => {
  try {
    const { taskId } = req.params;
    const status = await seedanceService.getTaskStatus(taskId);

    if (status.status === 'completed' && status.videoUrl) {
      const asset = await prisma.videoAsset.findFirst({
        where: {
          metadata: { contains: taskId },
        },
      });

      if (asset) {
        if (!asset.url) {
          await prisma.videoAsset.update({
            where: { id: asset.id },
            data: { url: status.videoUrl, duration: status.duration },
          });
        }

        const existingFinalVideo = await prisma.finalVideo.findFirst({
          where: { projectId: asset.projectId, url: status.videoUrl },
        });

        if (!existingFinalVideo) {
          const project = await prisma.project.findUnique({
            where: { id: asset.projectId },
          });

          let thumbnailUrl = '';
          if (status.thumbnailUrl) {
            thumbnailUrl = status.thumbnailUrl;
          }

          await prisma.finalVideo.create({
            data: {
              projectId: asset.projectId,
              title: project?.name ? `${project.name} - 成片` : '成片',
              description: 'AI生成视频成品',
              url: status.videoUrl,
              thumbnailUrl,
              duration: status.duration || 0,
              resolution: '1080p',
              format: 'mp4',
              size: 0,
              version: 1,
              isFinal: true,
            },
          });
        }
      }
    }

    res.json({ success: true, data: status });
  } catch (error: any) {
    console.error('Get task status error:', error);
    res.status(500).json({
      success: false,
      error: { code: 'TASK_ERROR', message: error.message }
    });
  }
});

router.get('/models', (_req: Request, res: Response) => {
  const models = seedanceService.getModels();
  res.json({ success: true, data: models });
});

router.post('/generate-from-script/:scriptId', requireAuth, async (req: Request, res: Response) => {
  try {
    const { scriptId } = req.params;
    const { model = 'seedance-2.5', aspectRatio = '16:9', resolution = '1080p' } = req.body;

    const script = await prisma.videoScript.findUnique({
      where: { id: scriptId },
    });

    if (!script) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Script not found' }
      });
    }

    const scenes = JSON.parse((script.scenes as string) || '[]') as any[];

    if (scenes.length === 0) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_REQUEST', message: 'No scenes in script' }
      });
    }

    const generationTasks = scenes.map((scene: any) => ({
      prompt: scene.visualDescription || scene.description || scene.title,
      model,
      duration: scene.duration || 5,
      aspectRatio,
      resolution,
      style: scene.style,
      cameraMotion: scene.cameraAngle ? mapCameraAngle(scene.cameraAngle) : undefined,
    }));

    const results = await seedanceService.batchGenerateVideo(generationTasks);

    res.json({
      success: true,
      data: {
        tasks: results,
        totalScenes: scenes.length,
      },
    });
  } catch (error: any) {
    console.error('Generate from script error:', error);
    res.status(500).json({
      success: false,
      error: { code: 'GENERATION_ERROR', message: error.message }
    });
  }
});

function mapCameraAngle(angle: string): 'static' | 'pan_left' | 'pan_right' | 'tilt_up' | 'tilt_down' | 'zoom_in' | 'zoom_out' | 'orbit' | undefined {
  const map: Record<string, any> = {
    '全景': 'static',
    '中景': 'static',
    '特写': 'zoom_in',
    '航拍': 'orbit',
    '跟拍': 'pan_right',
    '推': 'zoom_in',
    '拉': 'zoom_out',
    '摇': 'pan_right',
    '移': 'pan_left',
  };
  return map[angle];
}

export default router;
