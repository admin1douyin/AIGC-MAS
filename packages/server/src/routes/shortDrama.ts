import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { z } from 'zod';
import { validate } from '../middleware/validate';

const router = Router();

const updateShortDramaSchema = z.object({
  genre: z.string().optional(),
  episodeCount: z.number().int().min(1).optional(),
  episodeDuration: z.number().optional(),
  mainCharacters: z.array(z.any()).optional(),
  plotSummary: z.string().optional(),
  tone: z.string().optional(),
  targetPlatform: z.string().optional(),
});

router.get('/:projectId', async (req: Request, res: Response) => {
  const data = await prisma.shortDramaProject.findUnique({
    where: { projectId: req.params.projectId },
    include: { project: true },
  });

  if (!data) {
    return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Short drama project not found' } });
  }

  res.json({ success: true, data });
});

router.put('/:projectId', validate(updateShortDramaSchema), async (req: Request, res: Response) => {
  const data = await prisma.shortDramaProject.update({
    where: { projectId: req.params.projectId },
    data: req.body,
  });

  res.json({ success: true, data });
});

router.post('/:projectId/generate-script', async (req: Request, res: Response) => {
  const { projectId } = req.params;
  const project = await prisma.project.findUnique({ where: { id: projectId }, include: { shortDrama: true } });
  if (!project) {
    return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Project not found' } });
  }

  const brief = (project.brief as any) || {};
  const shortDrama = project.shortDrama;

  const generatedScenes = generateShortDramaScript(brief, shortDrama);

  const script = await prisma.videoScript.create({
    data: {
      projectId,
      title: brief.title || `${project.name} - 短剧脚本`,
      scenes: generatedScenes,
      totalDuration: generatedScenes.reduce((acc, s) => acc + (s.duration || 0), 0),
      version: 1,
    },
  });

  res.json({ success: true, data: script });
});

function generateShortDramaScript(brief: any, shortDrama: any) {
  const episodes = shortDrama?.episodeCount || 1;
  const scenesPerEpisode = 5;
  const scenes: any[] = [];

  const tones = ['甜宠', '虐恋', '悬疑', '搞笑', '逆袭', '都市', '古风', '玄幻'];
  const tone = shortDrama?.tone || tones[Math.floor(Math.random() * tones.length)];

  let sceneNum = 1;
  for (let ep = 1; ep <= episodes; ep++) {
    for (let i = 0; i < scenesPerEpisode; i++) {
      scenes.push({
        id: `scene-${sceneNum}`,
        sceneNumber: sceneNum,
        title: `第${ep}集 - 场景${i + 1}`,
        description: `第${ep}集第${i + 1}个场景，推进剧情发展，体现${tone}风格。`,
        duration: 60 + Math.floor(Math.random() * 30),
        dialogue: '角色A：你好，很高兴见到你。\n角色B：我也是，好久不见。',
        voiceover: '这是一个关于命运与选择的故事...',
        visualDescription: `${tone}风格的画面，人物特写与场景切换结合。`,
        audioDescription: '背景音乐配合情绪起伏，环境音增强沉浸感。',
        cameraAngle: i % 3 === 0 ? '全景' : i % 3 === 1 ? '中景' : '特写',
        location: ['室内客厅', '街道', '公司', '咖啡馆', '公园'][i % 5],
        characters: ['主角A', '主角B'],
        bgm: '轻快/悬疑/浪漫 背景音乐',
        transitions: '淡入淡出',
      });
      sceneNum++;
    }
  }

  return scenes;
}

export default router;
