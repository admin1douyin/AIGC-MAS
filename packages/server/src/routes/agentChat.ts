import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { z } from 'zod';
import { validate } from '../middleware/validate';
import { requireAuth } from '../middleware/auth';

const router = Router();

const chatSchema = z.object({
  projectId: z.string().optional(),
  message: z.string().min(1),
  agentRole: z.string().optional(),
  context: z.any().optional(),
});

const quickActions = [
  { icon: 'Film', label: '帮我写一个短剧脚本', prompt: '帮我写一个都市逆袭题材的短剧脚本，要有3集，每集30秒左右' },
  { icon: 'FileText', label: '生成企业宣传片方案', prompt: '帮我生成一个科技公司的企业宣传片方案，时长2分钟' },
  { icon: 'Image', label: '生成视频分镜画面', prompt: '帮我生成一个古风场景的视频分镜画面描述' },
  { icon: 'Music', label: '推荐背景音乐', prompt: '给我推荐适合企业宣传片的背景音乐风格' },
  { icon: 'Wand2', label: '优化视频创意', prompt: '帮我优化一下我的视频创意，让它更有吸引力' },
  { icon: 'Zap', label: '快速生成视频', prompt: '我想快速生成一个短视频，帮我规划一下流程' },
];

router.get('/quick-actions', requireAuth, async (req: Request, res: Response) => {
  res.json({ success: true, data: quickActions });
});

router.get('/chat/history', requireAuth, async (req: Request, res: Response) => {
  res.json({ success: true, data: [] });
});

router.delete('/chat/history', requireAuth, async (req: Request, res: Response) => {
  res.json({ success: true });
});

router.post('/chat', requireAuth, validate(chatSchema), async (req: Request, res: Response) => {
  try {
    const { projectId, message, agentRole } = req.body;

    let project: any = null;
    let projectContext = '';
    if (projectId) {
      try {
        project = await prisma.project.findUnique({
          where: { id: projectId },
          include: {
            shortDrama: true,
            corporateVideo: true,
            tourismPromo: true,
          },
        });
        if (project) {
          projectContext = `
当前项目信息：
- 项目名称：${project.name}
- 项目类型：${project.type}
- 项目描述：${project.description || '无'}
- 项目状态：${project.status}
${project.shortDrama ? `- 短剧类型：${project.shortDrama.genre}\n- 集数：${project.shortDrama.episodeCount}\n- 剧情简介：${project.shortDrama.plotSummary || '无'}` : ''}
${project.corporateVideo ? `- 公司名称：${project.corporateVideo.companyName}\n- 行业：${project.corporateVideo.industry}\n- 视频类型：${project.corporateVideo.videoType}` : ''}
${project.tourismPromo ? `- 目的地：${project.tourismPromo.location}\n- 主题：${project.tourismPromo.theme}\n- 目标游客：${project.tourismPromo.targetTravelers}` : ''}
`;
        }
      } catch (e) {
        console.error('[Agent Chat] Load project error:', e);
      }
    }

    const aiResponse = generateMockResponse(message, project);

    const responseMessage = {
      id: `msg-${Date.now()}`,
      role: 'assistant',
      content: aiResponse,
      timestamp: new Date().toISOString(),
      metadata: { agentRole: agentRole || 'general' },
    };

    res.json({
      success: true,
      data: responseMessage,
    });
  } catch (error: any) {
    console.error('Agent chat error:', error);
    res.status(500).json({
      success: false,
      error: { code: 'CHAT_ERROR', message: error.message }
    });
  }
});

function generateMockResponse(message: string, project: any): string {
  const msg = message.toLowerCase();
  
  if (msg.includes('短剧') || msg.includes('脚本')) {
    return `好的！我来帮您创作一个短剧脚本。

## 🎬 短剧方案推荐

根据您的需求，我为您推荐以下题材方向：

### 方向一：都市逆袭爽剧
**核心设定**：主角意外重生/获得金手指，从底层逆袭成为人生赢家
**经典元素**：打脸反派、商业成功、爱情收获
**目标受众**：18-35岁，偏好快节奏爽感内容

### 方向二：甜宠爱情剧
**核心设定**：欢喜冤家/契约恋爱，从互怼到相爱
**经典元素**：霸道总裁/高冷男主、可爱女主、甜蜜互动
**目标受众**：年轻女性观众

### 方向三：古风穿越剧
**核心设定**：现代女主穿越古代，用现代智慧玩转古代
**经典元素**：王爷/皇帝、宫斗、逆袭
**目标受众**：古风爱好者

---

您更倾向于哪个方向？或者告诉我您的具体想法，我来为您定制专属脚本！`;
  }

  if (msg.includes('企业') || msg.includes('宣传')) {
    return `好的！企业宣传片是展示品牌形象的重要方式。

## 🏢 企业宣传片方案

### 标准结构（120秒版本）

**0:00-0:15 | 开篇 - 品牌亮相**
- 震撼开场 + Logo演绎
- 核心理念一句话

**0:15-0:40 | 企业实力展示**
- 发展历程/规模数据
- 荣誉资质
- 办公环境

**0:40-1:10 | 产品/服务介绍**
- 核心产品展示
- 服务优势
- 客户案例

**1:10-1:35 | 团队与文化**
- 核心团队
- 企业文化
- 社会责任

**1:35-2:00 | 结尾 - 展望未来**
- 愿景使命
- 号召行动
- 联系方式

---

请问贵公司是什么行业？宣传片的主要用途是什么？我可以为您提供更精准的方案！`;
  }

  if (msg.includes('文旅') || msg.includes('旅游') || msg.includes('景区')) {
    return `太棒了！文旅宣传片能够完美展现目的地的魅力。

## 🌄 文旅宣传视频方案

### 经典结构（180秒版本）

**0:00-0:30 | 开篇 - 大美风光**
- 航拍全景震撼开场
- 最美景色混剪
- 点明主题

**0:30-1:00 | 自然之美**
- 山川湖泊
- 森林花海
- 日出日落

**1:00-1:30 | 人文历史**
- 历史古迹
- 传统文化
- 民俗风情

**1:30-2:00 | 美食体验**
- 特色美食
- 当地小吃
- 味蕾享受

**2:00-3:00 | 结尾 - 热情邀约**
- 美景回顾
- 游玩攻略
- 发出邀请

---

请问您想宣传哪个城市或景区？主要的特色亮点有哪些？`;
  }

  if (msg.includes('分镜') || msg.includes('画面')) {
    return `好的！分镜设计是视频制作的关键环节。

## 🎨 分镜设计服务

我可以帮您完成以下分镜相关工作：

### 1. 分镜脚本创作
- 根据文字脚本拆解成具体镜头
- 设计每个镜头的画面内容
- 确定镜头时长和节奏

### 2. 画面风格设计
- 确定整体视觉风格（写实/动漫/赛博朋克等）
- 设计色彩搭配方案
- 参考图推荐

### 3. 镜头语言设计
- 景别选择（特写/近景/中景/全景/远景）
- 镜头运动（推/拉/摇/移/跟/升/降）
- 转场效果设计

### 4. AI生图提示词
- 为每个分镜生成精准的AI绘图提示词
- 支持多种AI绘画模型
- 风格一致性保障

---

请提供您的脚本内容，我来为您设计详细的分镜方案！`;
  }

  return `您好！很高兴为您服务。我是您的AI视频制作助手，可以帮您完成各种视频制作任务。

## 🤖 我能帮您做什么

### 🎬 短剧视频制作
- 都市逆袭、甜宠爱情、古风穿越等题材
- 脚本创作、分镜设计、视频生成

### 🏢 企业宣传视频
- 企业宣传片、产品介绍、品牌故事
- 专业文案、高端画面、企业调性

### 🌄 文旅宣传视频
- 城市宣传、景区推广、美食探店
- 唯美画面、文化底蕴、旅游种草

### ✨ 更多功能
- 视频创意咨询
- 素材生成建议
- 制作流程规划

---

请告诉我您想制作什么类型的视频，或者描述您的创意想法，我来帮您实现！`;
}

export default router;
