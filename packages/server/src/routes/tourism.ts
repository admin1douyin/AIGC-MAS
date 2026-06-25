import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { z } from 'zod';
import { validate } from '../middleware/validate';

const router = Router();

const updateTourismSchema = z.object({
  location: z.string().optional(),
  attractions: z.array(z.string()).optional(),
  culturalHighlights: z.array(z.string()).optional(),
  targetTravelers: z.string().optional(),
  season: z.string().optional(),
  durationDays: z.number().int().min(1).optional(),
});

router.get('/:projectId', async (req: Request, res: Response) => {
  const data = await prisma.tourismPromoProject.findUnique({
    where: { projectId: req.params.projectId },
    include: { project: true },
  });

  if (!data) {
    return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Tourism promo project not found' } });
  }

  res.json({ success: true, data });
});

router.put('/:projectId', validate(updateTourismSchema), async (req: Request, res: Response) => {
  const data = await prisma.tourismPromoProject.update({
    where: { projectId: req.params.projectId },
    data: req.body,
  });

  res.json({ success: true, data });
});

router.post('/:projectId/generate-script', async (req: Request, res: Response) => {
  const { projectId } = req.params;
  const project = await prisma.project.findUnique({ where: { id: projectId }, include: { tourismPromo: true } });
  if (!project) {
    return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Project not found' } });
  }

  const brief = (project.brief as any) || {};
  const tourism = project.tourismPromo;

  const scenes = generateTourismScript(brief, tourism);

  const script = await prisma.videoScript.create({
    data: {
      projectId,
      title: brief.title || `${tourism?.location || project.name} - 文旅宣传片`,
      scenes,
      totalDuration: scenes.reduce((acc, s) => acc + (s.duration || 0), 0),
      version: 1,
    },
  });

  res.json({ success: true, data: script });
});

function generateTourismScript(brief: any, tourism: any) {
  const location = tourism?.location || '美丽的目的地';
  const attractions = tourism?.attractions || ['自然景观', '人文古迹', '特色美食'];
  const totalDuration = brief.duration || 180;

  const baseScenes = [
    { title: '开篇 - 大美风光', desc: '航拍全景，展示目的地整体风貌，震撼开篇。', type: 'opening' },
    { title: '自然之美', desc: '展示山川湖泊、自然风光，让观众感受大自然的魅力。', type: 'nature' },
    { title: '人文历史', desc: '探访古迹名胜，讲述历史故事，感受文化底蕴。', type: 'culture' },
    { title: '特色体验', desc: '当地民俗、美食、手工艺品，独特的旅行体验。', type: 'experience' },
    { title: '旅途时光', desc: '舒适的住宿、便捷的交通，尽享美好假期。', type: 'travel' },
    { title: '结尾 - 相约之旅', desc: '美景回顾，热情邀请，等你来探索。', type: 'closing' },
  ];

  return baseScenes.map((tpl, idx) => ({
    id: `scene-${idx + 1}`,
    sceneNumber: idx + 1,
    title: tpl.title,
    description: tpl.desc,
    duration: Math.floor(totalDuration / baseScenes.length),
    voiceover: generateTourismVoiceover(tpl.type, location, attractions),
    visualDescription: `${location}${tpl.title}，画面唯美大气。`,
    audioDescription: '民乐与现代元素结合的背景音乐，富有地方特色。',
    cameraAngle: ['航拍', '全景', '中景', '特写', '移轴', '航拍'][idx],
    location: location,
    characters: ['游客', '当地居民'],
    bgm: '文旅宣传片背景音乐',
    transitions: idx === 0 ? '淡入' : idx === baseScenes.length - 1 ? '淡出' : '叠化',
  }));
}

function generateTourismVoiceover(type: string, location: string, attractions: string[]) {
  const map: Record<string, string> = {
    opening: `${location}——一片神奇而美丽的土地，等待您的探索。`,
    nature: `在这里，大自然的鬼斧神工令人叹为观止。${attractions[0] || '青山绿水'}，如诗如画。`,
    culture: `悠久的历史，灿烂的文化，每一处古迹都在诉说着动人的故事。`,
    experience: `独特的民俗风情，地道的特色美食，让您的旅程充满惊喜。`,
    travel: `舒适惬意的旅途，热情好客的人们，这里是心灵的栖息地。`,
    closing: `${location}，一个来了就不想离开的地方。我们在这里等您！`,
  };
  return map[type] || '';
}

export default router;
