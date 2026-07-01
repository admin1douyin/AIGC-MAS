import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { validate } from '../middleware/validate';
import { requireAuth } from '../middleware/auth';
import { seedanceService } from '../services/seedanceService';
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

function calculateCredits(params: {
  model?: string;
  duration?: number;
  resolution?: string;
}): number {
  const duration = params.duration || 5;
  let credits = duration * 10;

  if (params.model === 'seedance-2.5') {
    credits *= 1.5;
  }

  if (params.resolution === '4k') {
    credits *= 2;
  } else if (params.resolution === '1080p') {
    credits *= 1.2;
  }

  return Math.ceil(credits);
}

async function checkAndDeductCredits(profileId: string, credits: number): Promise<boolean> {
  const subscription = await prisma.subscription.findUnique({
    where: { profileId },
  });

  if (!subscription) {
    return false;
  }

  const available = subscription.credits - subscription.usedCredits;
  if (available < credits) {
    return false;
  }

  await prisma.subscription.update({
    where: { profileId },
    data: { usedCredits: { increment: credits } },
  });

  return true;
}

async function refundCredits(profileId: string, credits: number): Promise<void> {
  await prisma.subscription.update({
    where: { profileId },
    data: { usedCredits: { decrement: credits } },
  }).catch(() => {});
}

router.post('/generate', requireAuth, validate(generateVideoSchema), async (req: Request, res: Response) => {
  try {
    const { projectId, scriptId, sceneId, assetIds, ...params } = req.body;
    const profileId = req.profile!.id;

    const credits = calculateCredits(params);
    const hasEnoughCredits = await checkAndDeductCredits(profileId, credits);

    if (!hasEnoughCredits) {
      return res.status(402).json({
        success: false,
        error: { code: 'INSUFFICIENT_CREDITS', message: '积分不足，请升级套餐或充值' }
      });
    }

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

    if (result.status === 'failed') {
      await refundCredits(profileId, credits);
    }

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
            credits,
            params,
          }),
          createdBy: profileId,
        },
      });
    }

    res.json({
      success: true,
      data: {
        ...result,
        credits,
      },
    });
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
    const profileId = req.profile!.id;

    const paramsList = scenes.map((scene: any) => ({
      prompt: scene.prompt,
      model: model || 'seedance-2.5',
      duration: scene.duration || 5,
      aspectRatio,
      resolution,
      sceneId: scene.sceneId,
    }));

    let totalCredits = 0;
    for (const params of paramsList) {
      totalCredits += calculateCredits(params);
    }

    const hasEnoughCredits = await checkAndDeductCredits(profileId, totalCredits);
    if (!hasEnoughCredits) {
      return res.status(402).json({
        success: false,
        error: { code: 'INSUFFICIENT_CREDITS', message: `积分不足，批量生成需要 ${totalCredits} 积分` }
      });
    }

    const results = await seedanceService.batchGenerateVideo(paramsList);

    const failedCount = results.filter(r => r.status === 'failed').length;
    if (failedCount > 0) {
      let refundAmount = 0;
      for (let i = 0; i < results.length; i++) {
        if (results[i].status === 'failed') {
          refundAmount += calculateCredits(paramsList[i]);
        }
      }
      if (refundAmount > 0) {
        await refundCredits(profileId, refundAmount);
      }
    }

    if (projectId) {
      for (let i = 0; i < results.length; i++) {
        const result = results[i];
        const params = paramsList[i];
        const credits = calculateCredits(params);

        await prisma.videoAsset.create({
          data: {
            projectId,
            type: 'video',
            name: `批量生成 ${i + 1} - ${new Date().toLocaleString()}`,
            url: result.videoUrl || '',
            duration: params.duration,
            category: 'generated',
            metadata: JSON.stringify({
              taskId: result.taskId,
              model: params.model,
              prompt: params.prompt,
              sceneId: params.sceneId,
              credits,
              params,
            }),
            createdBy: profileId,
          },
        });
      }
    }

    res.json({
      success: true,
      data: results.map((r, i) => ({
        ...r,
        credits: calculateCredits(paramsList[i]),
      })),
    });
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

router.get('/config', (_req: Request, res: Response) => {
  const config = {
    aspectRatios: [
      { id: '16:9', label: '16:9', description: '横屏，YouTube/B站' },
      { id: '9:16', label: '9:16', description: '竖屏，抖音/视频号' },
      { id: '21:9', label: '21:9', description: '宽屏，电影感' },
    ],
    resolutions: [
      { id: '480p', label: '480P', description: '流畅', coefficient: 0.8 },
      { id: '720p', label: '720P', description: '标准', coefficient: 1.0 },
      { id: '1080p', label: '1080P', description: '高清', coefficient: 1.2 },
      { id: '4k', label: '4K', description: '超清', coefficient: 2.0 },
    ],
    models: [
      { id: 'seedance-2.0-mini', label: 'Seedance 2.0 Mini', coefficient: 0.5, description: '轻量版' },
      { id: 'seedance-2.0-fast', label: 'Seedance 2.0 Fast', coefficient: 0.7, description: '快速版' },
      { id: 'seedance-2.0', label: 'Seedance 2.0', coefficient: 1.0, description: '稳定版' },
      { id: 'seedance-2.5', label: 'Seedance 2.5', coefficient: 1.5, description: '最新版' },
    ],
    durations: [4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15],
    styles: [
      { id: 'default', label: '默认风格', preview: '' },
      { id: 'cinematic', label: '电影感', preview: '' },
      { id: 'anime', label: '动漫风格', preview: '' },
      { id: 'ink_wash', label: '国风水墨', preview: '' },
      { id: 'cyberpunk', label: '赛博朋克', preview: '' },
      { id: 'fresh', label: '小清新', preview: '' },
      { id: 'vintage', label: '复古胶片', preview: '' },
      { id: 'realistic', label: '写实风格', preview: '' },
    ],
    baseCreditPerSecond: 10,
  };

  res.json({ success: true, data: config });
});

router.get('/projects/:projectId/tasks', requireAuth, async (req: Request, res: Response) => {
  try {
    const { projectId } = req.params;

    const assets = await prisma.videoAsset.findMany({
      where: {
        projectId,
        type: 'video',
        metadata: { contains: 'taskId' },
      },
      orderBy: { createdAt: 'desc' },
    });

    const tasks = assets.map((asset: any) => {
      let metadata: any = {};
      try {
        metadata = JSON.parse(asset.metadata || '{}');
      } catch (e) {
        metadata = {};
      }

      const status = asset.url ? 'completed' : 'processing';

      return {
        id: asset.id,
        taskId: metadata.taskId || '',
        name: asset.name,
        url: asset.url,
        thumbnailUrl: asset.thumbnailUrl || '',
        duration: asset.duration,
        status,
        credits: metadata.credits || 0,
        model: metadata.model || '',
        prompt: metadata.prompt || '',
        createdAt: asset.createdAt,
      };
    });

    res.json({ success: true, data: tasks });
  } catch (error: any) {
    console.error('Get project tasks error:', error);
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: error.message }
    });
  }
});


const generateScriptSchema = z.object({
  projectId: z.string(),
  prompt: z.string(),
  style: z.string().optional(),
  duration: z.number().min(1).max(300).optional(),
  sceneCount: z.number().int().min(1).max(20).optional(),
});

function generateRandomUuid(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

const sceneDescriptions = [
  '开场全景，展现整体环境氛围',
  '中景推进，聚焦主体人物动作',
  '特写镜头，突出关键细节表情',
  '侧面跟拍，展现动作连续性',
  '俯拍视角，营造空间纵深感',
  '仰拍镜头，突出主体气势感',
  '慢动作呈现，强化情绪表达',
  '转场过渡，自然衔接下一场景',
];

const dialogues = [
  '让我们开始这段奇妙的旅程',
  '每一个细节都值得被记录',
  '这一刻，时间仿佛静止了',
  '故事才刚刚开始...',
  '让美好永远定格在这一刻',
];

const cameraAngles = ['全景', '中景', '特写', '俯拍', '仰拍', '跟拍', '推镜头', '拉镜头'];

router.post('/generate-script', requireAuth, validate(generateScriptSchema), async (req: Request, res: Response) => {
  try {
    const { projectId, prompt, style, duration = 30, sceneCount = 3 } = req.body;
    const profileId = req.profile!.id;

    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: '项目不存在' }
      });
    }

    const perSceneDuration = Math.floor(duration / sceneCount);
    const title = 'AI生成脚本 - ' + prompt.slice(0, 20);

    const scenes = Array.from({ length: sceneCount }, (_, index) => {
      const descIndex = index % sceneDescriptions.length;
      const dialogueIndex = index % dialogues.length;
      const cameraIndex = index % cameraAngles.length;

      return {
        id: generateRandomUuid(),
        index: index + 1,
        description: `${prompt} - ${sceneDescriptions[descIndex]}`,
        dialogue: dialogues[dialogueIndex],
        duration: perSceneDuration,
        cameraAngle: cameraAngles[cameraIndex],
      };
    });

    const videoScript = await prisma.videoScript.create({
      data: {
        projectId,
        title,
        logline: prompt,
        scenes: JSON.stringify(scenes),
        totalDuration: duration,
        version: 1,
        isActive: true,
      },
    });

    const result = {
      ...videoScript,
      scenes,
    };

    res.json({ success: true, data: result });
  } catch (error: any) {
    console.error('Generate script error:', error);
    res.status(500).json({
      success: false,
      error: { code: 'GENERATION_ERROR', message: error.message }
    });
  }
});

const generateStoryboardSchema = z.object({
  scriptId: z.string(),
  projectId: z.string(),
  sceneCount: z.number().int().min(1).max(20).optional(),
  style: z.string().optional(),
  aspectRatio: z.string().optional(),
});

router.post('/generate-storyboard', requireAuth, validate(generateStoryboardSchema), async (req: Request, res: Response) => {
  try {
    const { scriptId, projectId, sceneCount = 3, style, aspectRatio } = req.body;

    const script = await prisma.videoScript.findUnique({
      where: { id: scriptId },
    });

    if (!script) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: '脚本不存在' }
      });
    }

    let scenes: any[] = [];
    try {
      scenes = JSON.parse((script.scenes as string) || '[]');
    } catch (e) {
      scenes = [];
    }

    if (scenes.length === 0) {
      scenes = Array.from({ length: sceneCount }, (_, index) => ({
        id: generateRandomUuid(),
        index: index + 1,
        description: `场景 ${index + 1}`,
        duration: 5,
      }));
    }

    const updatedScenes = scenes.map((scene: any, index: number) => {
      const baseDesc = scene.description || '';
      const cameraAngle = scene.cameraAngle || '';
      const styleDesc = style || 'cinematic';

      const promptParts = [
        baseDesc,
        styleDesc ? `${styleDesc} style` : '',
        cameraAngle ? `camera angle: ${cameraAngle}` : '',
        aspectRatio ? `aspect ratio: ${aspectRatio}` : '',
        'high quality, detailed, professional video',
      ].filter(Boolean);

      const cnPromptParts = [
        baseDesc,
        styleDesc ? `风格：${styleDesc}` : '',
        cameraAngle ? `镜头角度：${cameraAngle}` : '',
        '高质量，细节丰富，专业视频制作',
      ].filter(Boolean);

      return {
        ...scene,
        prompt: promptParts.join(', '),
        promptCn: cnPromptParts.join('，'),
        referenceImage: '',
      };
    });

    await prisma.videoScript.update({
      where: { id: scriptId },
      data: {
        scenes: JSON.stringify(updatedScenes),
      },
    });

    res.json({
      success: true,
      data: {
        scenes: updatedScenes,
        scriptId,
      },
    });
  } catch (error: any) {
    console.error('Generate storyboard error:', error);
    res.status(500).json({
      success: false,
      error: { code: 'GENERATION_ERROR', message: error.message }
    });
  }
});

router.get('/tasks/:taskId', requireAuth, async (req: Request, res: Response) => {
  try {
    const { taskId } = req.params;

    const status = await seedanceService.getTaskStatus(taskId);

    res.json({
      success: true,
      data: {
        taskId: status.taskId,
        status: status.status,
        videoUrl: status.videoUrl,
        progress: status.progress,
        error: status.error,
      },
    });
  } catch (error: any) {
    console.error('Get task status error:', error);
    res.status(500).json({
      success: false,
      error: { code: 'TASK_ERROR', message: error.message }
    });
  }
});

export default router;
