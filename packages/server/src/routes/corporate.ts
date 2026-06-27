import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { z } from 'zod';
import { validate } from '../middleware/validate';
import { requireAuth, optionalAuth } from '../middleware/auth';

const router = Router();

const updateCorporateSchema = z.object({
  companyName: z.string().optional(),
  industry: z.string().optional(),
  videoType: z.string().optional(),
  brandGuidelines: z.any().optional(),
  keySellingPoints: z.array(z.string()).optional(),
  callToAction: z.string().optional(),
});

router.get('/:projectId', optionalAuth, async (req: Request, res: Response) => {
  const data = await prisma.corporateVideoProject.findUnique({
    where: { projectId: req.params.projectId },
    include: { project: true },
  });

  if (!data) {
    return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Corporate video project not found' } });
  }

  res.json({ success: true, data });
});

router.put('/:projectId', requireAuth, validate(updateCorporateSchema), async (req: Request, res: Response) => {
  const data = await prisma.corporateVideoProject.update({
    where: { projectId: req.params.projectId },
    data: req.body,
  });

  res.json({ success: true, data });
});

router.post('/:projectId/generate-marketing-plan', requireAuth, async (req: Request, res: Response) => {
  const { projectId } = req.params;
  const project = await prisma.project.findUnique({ where: { id: projectId }, include: { corporateVideo: true } });
  if (!project) {
    return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Project not found' } });
  }

  const corporate = project.corporateVideo;
  const brief = (project.brief as any) || {};

  const marketingPlan = {
    targetAudience: brief.targetAudience || '企业决策者、潜在客户',
    coreMessage: brief.keyMessages?.[0] || '展现企业实力与品牌价值',
    videoStyle: corporate?.videoType || '企业宣传片',
    keySellingPoints: corporate?.keySellingPoints || ['品牌实力', '产品优势', '服务质量'],
    callToAction: corporate?.callToAction || '立即咨询，开启合作',
    channels: ['官网首页', '社交媒体', '展会播放', '销售物料'],
    duration: brief.duration || 120,
  };

  res.json({ success: true, data: marketingPlan });
});

router.post('/:projectId/generate-script', requireAuth, async (req: Request, res: Response) => {
  const { projectId } = req.params;
  const project = await prisma.project.findUnique({ where: { id: projectId }, include: { corporateVideo: true } });
  if (!project) {
    return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Project not found' } });
  }

  const brief = (project.brief as any) || {};
  const corporate = project.corporateVideo;

  const scenes = generateCorporateScript(brief, corporate);

  const script = await prisma.videoScript.create({
    data: {
      projectId,
      title: brief.title || `${corporate?.companyName || project.name} - 企业宣传片`,
      scenes: scenes as any,
      totalDuration: scenes.reduce((acc, s) => acc + (s.duration || 0), 0),
      version: 1,
    },
  });

  res.json({ success: true, data: script });
});

function generateCorporateScript(brief: any, corporate: any) {
  const totalDuration = brief.duration || 120;
  const sceneCount = 6;
  const sceneDuration = Math.floor(totalDuration / sceneCount);

  const sceneTemplates = [
    { title: '开篇 - 品牌亮相', desc: '企业品牌形象震撼出场，Logo演绎，奠定整体基调。', type: 'opening' },
    { title: '企业实力', desc: '展示企业规模、发展历程、行业地位，建立信任。', type: 'strength' },
    { title: '产品/服务展示', desc: '核心产品或服务介绍，突出优势特点。', type: 'product' },
    { title: '团队与文化', desc: '优秀团队展示，企业文化传递，增强情感连接。', type: 'team' },
    { title: '客户案例', desc: '典型客户成功案例，用事实说话。', type: 'case' },
    { title: '结尾 - 号召行动', desc: '愿景展望，联系方式，呼吁合作。', type: 'closing' },
  ];

  return sceneTemplates.map((tpl, idx) => ({
    id: `scene-${idx + 1}`,
    sceneNumber: idx + 1,
    title: tpl.title,
    description: tpl.desc,
    duration: sceneDuration,
    voiceover: generateCorporateVoiceover(tpl.type, corporate),
    visualDescription: `${tpl.title}画面，专业大气的企业风格。`,
    audioDescription: '背景音乐恢弘大气，节奏逐渐推进。',
    cameraAngle: idx % 2 === 0 ? '全景' : '中景',
    location: '企业办公区/产品展示厅',
    characters: ['企业员工', '客户代表'],
    bgm: '企业宣传片背景音乐',
    transitions: idx === 0 ? '淡入' : idx === sceneCount - 1 ? '淡出' : '叠化',
  }));
}

function generateCorporateVoiceover(type: string, corporate: any) {
  const company = corporate?.companyName || '我们的企业';
  const map: Record<string, string> = {
    opening: `${company}——引领行业未来，创造无限可能。`,
    strength: `历经多年发展，${company}已成为行业领先的综合性企业，业务遍布全国。`,
    product: '我们致力于为客户提供最优质的产品和服务，持续创新，追求卓越。',
    team: '拥有一支专业、高效、充满激情的团队，是我们最大的财富。',
    case: '众多知名企业的共同选择，用实力赢得信赖。',
    closing: `${company}——期待与您携手，共创美好未来。立即联系我们！`,
  };
  return map[type] || '';
}

export default router;
