import { prisma } from '../lib/prisma';
import { AgentRole, TaskStatus, ProjectType, MessageType } from '@prisma/client';

interface AgentDefinition {
  role: AgentRole;
  name: string;
  description: string;
  capabilities: string[];
  personality?: string[];
}

const AGENT_REGISTRY: AgentDefinition[] = [
  {
    role: 'project_manager',
    name: '项目经理',
    description: '负责整体项目规划、进度跟踪和团队协调，确保项目按时高质量交付',
    capabilities: ['项目规划', '任务分配', '进度跟踪', '风险管理', '质量把控', '团队协调'],
    personality: ['严谨', '高效', '目标导向'],
  },
  {
    role: 'creative_director',
    name: '创意总监',
    description: '负责整体创意方向把控、视觉风格指导和内容质量审核',
    capabilities: ['创意方向', '视觉把控', '内容审核', '风格指导', '创意激发'],
    personality: ['创意', '敏锐', '追求卓越'],
  },
  {
    role: 'script_writer',
    name: '编剧',
    description: '负责视频脚本创作、剧情设计和台词撰写',
    capabilities: ['剧本创作', '角色设计', '剧情编排', '台词撰写', '分镜脚本', '节奏把控'],
    personality: ['创意丰富', '故事感强', '细腻'],
  },
  {
    role: 'storyboard_artist',
    name: '分镜师',
    description: '负责分镜设计、视觉构图和画面规划',
    capabilities: ['分镜设计', '视觉构图', '镜头语言', '场景设计', '画面节奏', '运镜设计'],
    personality: ['视觉感强', '细致', '有空间感'],
  },
  {
    role: 'voice_actor',
    name: '配音演员',
    description: '负责旁白配音、角色配音和语音合成',
    capabilities: ['旁白配音', '角色配音', '语音合成', '情感表达', '语速控制', '语气把握'],
    personality: ['表现力强', '声音有磁性', '情感丰富'],
  },
  {
    role: 'video_editor',
    name: '视频剪辑师',
    description: '负责视频剪辑、特效制作和后期合成',
    capabilities: ['视频剪辑', '特效制作', '调色', '转场设计', '成品输出', '节奏把控'],
    personality: ['节奏感强', '技术娴熟', '追求完美'],
  },
  {
    role: 'marketing_strategist',
    name: '营销策划师',
    description: '负责营销策略制定、卖点提炼和传播规划',
    capabilities: ['市场分析', '营销策略', '卖点提炼', '传播规划', '效果评估', '用户洞察'],
    personality: ['市场敏感度高', '策略性强', '数据驱动'],
  },
  {
    role: 'brand_analyst',
    name: '品牌分析师',
    description: '负责品牌分析、定位和视觉规范',
    capabilities: ['品牌分析', '品牌定位', '视觉规范', '竞品分析', '调性把控', '品牌故事'],
    personality: ['品牌思维', '洞察力强', '系统化'],
  },
  {
    role: 'culture_researcher',
    name: '文化研究员',
    description: '负责文化调研、地方特色挖掘和内容策划',
    capabilities: ['文化调研', '地方特色', '历史研究', '民俗挖掘', '内容策划', '故事挖掘'],
    personality: ['好奇心强', '研究型', '文化底蕴深'],
  },
  {
    role: 'music_composer',
    name: '音乐设计师',
    description: '负责背景音乐、音效设计和音频制作',
    capabilities: ['配乐创作', '音效设计', '音频混音', '情绪音乐', '版权音乐', '声音设计'],
    personality: ['音乐感强', '细腻', '有创造力'],
  },
  {
    role: 'quality_inspector',
    name: '质量审核员',
    description: '负责内容质量审核、合规检查和最终验收',
    capabilities: ['质量审核', '合规检查', '内容审查', '技术质检', '最终验收', '标准把控'],
    personality: ['严谨', '细致', '原则性强'],
  },
  {
    role: 'data_analyst',
    name: '数据分析师',
    description: '负责数据分析、效果追踪和优化建议',
    capabilities: ['数据采集', '数据分析', '效果追踪', '可视化', '优化建议', '报告撰写'],
    personality: ['数据驱动', '逻辑清晰', '细致'],
  },
];

interface PipelinePhase {
  name: string;
  roles: AgentRole[];
  parallel?: boolean;
  requiresReview?: boolean;
  maxIterations?: number;
}

const PIPELINE_TEMPLATES: Record<string, PipelinePhase[]> = {
  short_drama: [
    { name: '项目启动', roles: ['project_manager'], maxIterations: 1 },
    { name: '创意策划', roles: ['creative_director', 'script_writer'], parallel: true, maxIterations: 2 },
    { name: '脚本创作', roles: ['script_writer'], requiresReview: true, maxIterations: 3 },
    { name: '分镜设计', roles: ['storyboard_artist'], requiresReview: true, maxIterations: 2 },
    { name: '配音录制', roles: ['voice_actor'], parallel: true, maxIterations: 2 },
    { name: '音乐设计', roles: ['music_composer'], parallel: true, maxIterations: 2 },
    { name: '视频剪辑', roles: ['video_editor'], requiresReview: true, maxIterations: 3 },
    { name: '质量审核', roles: ['quality_inspector'], maxIterations: 2 },
    { name: '营销策划', roles: ['marketing_strategist'], parallel: true, maxIterations: 1 },
  ],
  corporate_video: [
    { name: '项目启动', roles: ['project_manager'], maxIterations: 1 },
    { name: '品牌分析', roles: ['brand_analyst'], maxIterations: 2 },
    { name: '营销策划', roles: ['marketing_strategist'], requiresReview: true, maxIterations: 2 },
    { name: '创意策划', roles: ['creative_director'], parallel: true, maxIterations: 2 },
    { name: '脚本创作', roles: ['script_writer'], requiresReview: true, maxIterations: 3 },
    { name: '分镜设计', roles: ['storyboard_artist'], requiresReview: true, maxIterations: 2 },
    { name: '配音录制', roles: ['voice_actor'], parallel: true, maxIterations: 2 },
    { name: '音乐设计', roles: ['music_composer'], parallel: true, maxIterations: 2 },
    { name: '视频剪辑', roles: ['video_editor'], requiresReview: true, maxIterations: 3 },
    { name: '质量审核', roles: ['quality_inspector'], maxIterations: 2 },
    { name: '数据分析', roles: ['data_analyst'], maxIterations: 1 },
  ],
  tourism_promo: [
    { name: '项目启动', roles: ['project_manager'], maxIterations: 1 },
    { name: '文化调研', roles: ['culture_researcher'], maxIterations: 2 },
    { name: '创意策划', roles: ['creative_director', 'marketing_strategist'], parallel: true, maxIterations: 2 },
    { name: '脚本创作', roles: ['script_writer'], requiresReview: true, maxIterations: 3 },
    { name: '分镜设计', roles: ['storyboard_artist'], requiresReview: true, maxIterations: 2 },
    { name: '配音录制', roles: ['voice_actor'], parallel: true, maxIterations: 2 },
    { name: '音乐设计', roles: ['music_composer'], parallel: true, maxIterations: 2 },
    { name: '视频剪辑', roles: ['video_editor'], requiresReview: true, maxIterations: 3 },
    { name: '质量审核', roles: ['quality_inspector'], maxIterations: 2 },
    { name: '营销策划', roles: ['marketing_strategist'], maxIterations: 1 },
  ],
};

interface QualityReviewResult {
  passed: boolean;
  score: number;
  feedback: string[];
  suggestions: string[];
}

class AgentEngine {
  private initialized = false;
  private activeProjects: Map<string, AbortController> = new Map();

  async initialize() {
    if (this.initialized) return;

    const existingAgents = await prisma.agent.count();
    if (existingAgents === 0) {
      await this.seedAgents();
    }

    this.initialized = true;
    console.log('[AgentEngine] Initialized with', AGENT_REGISTRY.length, 'agent types');
  }

  getAgentRegistry() {
    return AGENT_REGISTRY;
  }

  getPipelineTemplates() {
    return PIPELINE_TEMPLATES;
  }

  private async seedAgents() {
    for (const def of AGENT_REGISTRY) {
      await prisma.agent.create({
        data: {
          name: def.name,
          role: def.role,
          status: 'idle',
          description: def.description,
          capabilities: def.capabilities as any,
          personality: def.personality as any,
        },
      });
    }
    console.log('[AgentEngine] Seeded', AGENT_REGISTRY.length, 'agents');
  }

  async startProject(projectId: string) {
    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (!project) throw new Error('Project not found');

    const pipeline = PIPELINE_TEMPLATES[project.type];
    if (!pipeline) throw new Error(`No pipeline for project type: ${project.type}`);

    if (this.activeProjects.has(projectId)) {
      throw new Error('Project already running');
    }

    const abortController = new AbortController();
    this.activeProjects.set(projectId, abortController);

    await prisma.project.update({
      where: { id: projectId },
      data: { 
        status: 'in_production', 
        progress: 5, 
        startedAt: new Date(),
        currentPhase: pipeline[0]?.name || '启动',
      },
    });

    const allRoles = [...new Set(pipeline.flatMap(p => p.roles))];
    await this.assignProjectAgents(projectId, allRoles);
    await this.createPipelineTasks(projectId, pipeline, project);

    this.runPipeline(projectId, pipeline, abortController.signal).catch((err) => {
      console.error('[AgentEngine] Pipeline error:', err);
      this.handleProjectError(projectId, err.message);
    });

    return { message: 'Project started', phases: pipeline.length };
  }

  private async assignProjectAgents(projectId: string, roles: AgentRole[]) {
    for (const role of roles) {
      let agent = await prisma.agent.findFirst({ where: { role } });
      if (!agent) {
        const def = AGENT_REGISTRY.find((a) => a.role === role);
        if (def) {
          agent = await prisma.agent.create({
            data: {
              name: def.name,
              role: def.role,
              status: 'idle',
              description: def.description,
              capabilities: def.capabilities as any,
              personality: def.personality as any,
              projectId,
            },
          });
        }
      } else {
        await prisma.agent.update({
          where: { id: agent.id },
          data: { projectId, status: 'idle' },
        });
      }
    }
  }

  private async createPipelineTasks(
    projectId: string, 
    phases: PipelinePhase[], 
    project: any
  ) {
    let taskIndex = 0;
    
    for (let phaseIdx = 0; phaseIdx < phases.length; phaseIdx++) {
      const phase = phases[phaseIdx];
      
      for (const role of phase.roles) {
        const def = AGENT_REGISTRY.find((a) => a.role === role);
        const taskTitle = this.getTaskTitleForRole(role, project.type);
        
        await prisma.agentTask.create({
          data: {
            projectId,
            agentRole: role,
            title: taskTitle,
            description: def?.description || '',
            phase: phase.name,
            phaseIndex: phaseIdx,
            priority: phaseIdx <= 1 ? 'high' : 'medium',
            status: 'pending',
            iteration: 1,
            maxIterations: phase.maxIterations || 1,
            requiresReview: phase.requiresReview || false,
            isParallel: phase.parallel || false,
            inputData: JSON.stringify({ 
              phase: phaseIdx + 1, 
              totalPhases: phases.length,
              phaseName: phase.name,
            }),
            orderIndex: taskIndex++,
          },
        });
      }
    }
  }

  private getTaskTitleForRole(role: string, projectType: string): string {
    const titles: Record<string, string> = {
      project_manager: '项目启动与规划',
      creative_director: '创意方向策划',
      script_writer: '脚本创作与优化',
      storyboard_artist: '分镜设计与视觉构图',
      voice_actor: '配音录制与语音合成',
      video_editor: '视频剪辑与后期合成',
      marketing_strategist: '营销策略与传播规划',
      brand_analyst: '品牌分析与定位',
      culture_researcher: '文化调研与内容策划',
      music_composer: '音乐与音效设计',
      quality_inspector: '质量审核与最终验收',
      data_analyst: '数据分析与效果评估',
    };
    return titles[role] || role;
  }

  private async runPipeline(
    projectId: string, 
    phases: PipelinePhase[],
    signal: AbortSignal
  ) {
    for (let phaseIdx = 0; phaseIdx < phases.length; phaseIdx++) {
      if (signal.aborted) {
        console.log('[AgentEngine] Project aborted:', projectId);
        return;
      }

      const phase = phases[phaseIdx];
      
      await prisma.project.update({
        where: { id: projectId },
        data: { currentPhase: phase.name },
      });

      await this.sendMessage({
        projectId,
        content: `进入阶段：${phase.name}`,
        messageType: 'phase_start',
      });

      if (phase.parallel && phase.roles.length > 1) {
        await this.executeParallelPhase(projectId, phase, signal);
      } else {
        for (const role of phase.roles) {
          if (signal.aborted) return;
          await this.executeTaskWithIteration(projectId, role, phase, signal);
        }
      }

      const progress = Math.round(((phaseIdx + 1) / phases.length) * 100);
      await prisma.project.update({
        where: { id: projectId },
        data: { progress: Math.min(progress, 95) },
      });

      await this.sendMessage({
        projectId,
        content: `阶段完成：${phase.name}`,
        messageType: 'phase_complete',
      });
    }

    await prisma.project.update({
      where: { id: projectId },
      data: { 
        status: 'completed', 
        progress: 100, 
        completedAt: new Date(),
        currentPhase: '已完成',
      },
    });

    this.activeProjects.delete(projectId);
    console.log('[AgentEngine] Project completed:', projectId);
  }

  private async executeParallelPhase(
    projectId: string,
    phase: PipelinePhase,
    signal: AbortSignal
  ) {
    const promises = phase.roles.map(role => 
      this.executeTaskWithIteration(projectId, role, phase, signal)
    );
    await Promise.all(promises);
  }

  private async executeTaskWithIteration(
    projectId: string,
    role: AgentRole,
    phase: PipelinePhase,
    signal: AbortSignal
  ) {
    const maxIterations = phase.maxIterations || 1;
    
    for (let iteration = 1; iteration <= maxIterations; iteration++) {
      if (signal.aborted) return;

      const task = await prisma.agentTask.findFirst({
        where: { projectId, agentRole: role, phase: phase.name },
        orderBy: { createdAt: 'desc' },
      });

      if (!task) continue;

      if (iteration > 1) {
        await prisma.agentTask.update({
          where: { id: task.id },
          data: { 
            iteration,
            status: 'pending',
            feedback: `第 ${iteration} 轮迭代，基于上一轮反馈优化`,
          },
        });
      }

      await this.executeTask(task.id);

      if (phase.requiresReview && iteration < maxIterations) {
        const reviewResult = await this.performQualityReview(task.id, role);
        
        if (reviewResult.passed) {
          await this.sendMessage({
            projectId,
            taskId: task.id,
            content: `质量审核通过，评分：${reviewResult.score}/100`,
            messageType: 'review_pass',
          });
          break;
        } else {
          await this.sendMessage({
            projectId,
            taskId: task.id,
            content: `质量审核未通过，评分：${reviewResult.score}/100。${reviewResult.feedback.join('；')}`,
            messageType: 'review_fail',
          });
          
          await prisma.agentTask.update({
            where: { id: task.id },
            data: {
              status: 'needs_revision',
              reviewFeedback: reviewResult.feedback as any,
              reviewScore: reviewResult.score,
            },
          });
        }
      }
    }
  }

  private async performQualityReview(taskId: string, role: string): Promise<QualityReviewResult> {
    await new Promise(resolve => setTimeout(resolve, 800));

    const baseScores: Record<string, number> = {
      script_writer: 88,
      storyboard_artist: 85,
      video_editor: 90,
      voice_actor: 92,
      music_composer: 87,
      marketing_strategist: 86,
    };

    const score = Math.min(95, (baseScores[role] || 85) + Math.floor(Math.random() * 10));
    const passed = score >= 85;

    const feedbackTemplates: Record<string, string[]> = {
      script_writer: [
        '剧情节奏可以再紧凑一些',
        '角色对话可以更自然',
        '开场钩子需要加强',
        '情感转折可以更细腻',
      ],
      storyboard_artist: [
        '部分镜头构图可以更有张力',
        '场景过渡可以更流畅',
        '视觉层次可以更丰富',
      ],
      video_editor: [
        '转场效果可以更丰富',
        '整体节奏可以再优化',
        '调色可以更有氛围感',
      ],
    };

    const allFeedback = feedbackTemplates[role] || ['内容质量良好，可以继续优化'];
    const feedback = passed 
      ? allFeedback.slice(0, 1) 
      : allFeedback.slice(0, Math.floor(Math.random() * 2) + 2);

    const suggestions = [
      '建议增加更多视觉元素',
      '可以考虑增加互动性',
      '优化用户体验细节',
    ].slice(0, 2);

    return {
      passed,
      score,
      feedback,
      suggestions,
    };
  }

  async executeTask(taskId: string) {
    const task = await prisma.agentTask.findUnique({ where: { id: taskId } });
    if (!task) throw new Error('Task not found');

    let agent = await prisma.agent.findFirst({ where: { role: task.agentRole } });
    if (!agent) {
      const def = AGENT_REGISTRY.find((a) => a.role === task.agentRole);
      if (!def) throw new Error(`Agent role not found: ${task.agentRole}`);
      agent = await prisma.agent.create({
        data: {
          name: def.name,
          role: def.role,
          status: 'working',
          description: def.description,
          capabilities: def.capabilities as any,
          personality: def.personality as any,
          projectId: task.projectId,
          currentTaskId: task.id,
        },
      });
    } else {
      await prisma.agent.update({
        where: { id: agent.id },
        data: { status: 'working', currentTaskId: task.id },
      });
    }

    await prisma.agentTask.update({
      where: { id: taskId },
      data: { status: 'in_progress', agentId: agent.id, startedAt: new Date() },
    });

    await this.sendMessage({
      fromAgentId: agent.id,
      projectId: task.projectId,
      taskId: task.id,
      content: `${agent.name}开始执行任务：${task.title}（第${task.iteration}轮）`,
      messageType: 'notification',
    });

    await this.simulateTaskWork(task, agent);

    const outputData = this.generateTaskOutput(task);

    await prisma.agentTask.update({
      where: { id: taskId },
      data: {
        status: 'completed',
        completedAt: new Date(),
        outputData,
      },
    });

    await prisma.agent.update({
      where: { id: agent.id },
      data: { status: 'idle', currentTaskId: null, completedTasks: { increment: 1 } },
    });

    await this.sendMessage({
      fromAgentId: agent.id,
      projectId: task.projectId,
      taskId: task.id,
      content: `${agent.name}完成任务：${task.title}`,
      messageType: 'result',
    });

    return { taskId, status: 'completed', outputData };
  }

  private async simulateTaskWork(task: any, agent: any) {
    const baseDelay = 2000;
    const randomDelay = Math.random() * 2000;
    await new Promise((resolve) => setTimeout(resolve, baseDelay + randomDelay));

    const checkpoints = 4;
    for (let i = 1; i <= checkpoints; i++) {
      await new Promise((resolve) => setTimeout(resolve, 400 + Math.random() * 400));
      
      const progressMessages = [
        '正在分析需求...',
        '正在构思方案...',
        '正在制作内容...',
        '正在优化细节...',
      ];
      
      await this.sendMessage({
        fromAgentId: agent.id,
        projectId: task.projectId,
        taskId: task.id,
        content: `${agent.name}：${progressMessages[i - 1] || '进行中...'}（${Math.round((i / checkpoints) * 100)}%）`,
        messageType: 'notification',
      }).catch(() => {});
    }
  }

  private generateTaskOutput(task: any) {
    const role = task.agentRole;
    const iteration = task.iteration || 1;
    const project = task.projectId;

    const outputs: Record<string, any> = {
      project_manager: {
        plan: '项目计划已制定完成',
        milestones: [
          { name: '需求确认', status: 'completed' },
          { name: '创意策划', status: 'in_progress' },
          { name: '脚本创作', status: 'pending' },
          { name: '分镜设计', status: 'pending' },
          { name: '素材制作', status: 'pending' },
          { name: '剪辑合成', status: 'pending' },
          { name: '最终交付', status: 'pending' },
        ],
        timeline: '预计3-5个工作日',
        risks: [
          { level: 'low', description: '需求变更风险', mitigation: '建立变更管理流程' },
          { level: 'medium', description: '质量风险', mitigation: '多轮质量审核机制' },
        ],
        teamSize: 8,
      },
      creative_director: {
        creativeDirection: '创意方向已确定',
        visualStyle: '电影感 + 现代美学',
        tone: '专业而富有感染力',
        keyVisuals: ['主视觉海报', '开场画面', '转场设计'],
        inspiration: ['经典电影构图', '现代设计趋势', '品牌调性融合'],
        iteration,
      },
      script_writer: {
        scenesCount: 8 + iteration,
        totalDuration: 180 + iteration * 10,
        version: iteration,
        characters: [
          { name: '主角', description: '核心人物，推动故事发展', screenTime: '60%' },
          { name: '配角', description: '辅助主角，增加故事层次', screenTime: '30%' },
          { name: '旁白', description: '串联剧情，引导观众', screenTime: '10%' },
        ],
        scenes: Array.from({ length: Math.min(8 + iteration, 12) }, (_, i) => ({
          id: i + 1,
          title: `场景${i + 1}`,
          duration: 15 + Math.floor(Math.random() * 10),
          location: ['室内', '室外', '城市', '自然'][i % 4],
          emotion: ['平静', '紧张', '温馨', '激昂'][i % 4],
        })),
        storyStructure: '三幕式结构',
        hook: '开场3秒抓住注意力',
        emotionalArc: '起承转合完整',
      },
      storyboard_artist: {
        framesCount: 30 + iteration * 5,
        style: '电影感',
        aspectRatio: '16:9',
        shotTypes: ['特写', '中景', '全景', '俯拍', '仰拍', '跟拍'],
        cameraMovements: ['推', '拉', '摇', '移', '跟'],
        lightingDesign: '三点布光 + 氛围光',
        colorPalette: '冷暖对比，突出主题',
        keyFrames: Array.from({ length: 5 }, (_, i) => ({
          id: i + 1,
          description: `关键镜头${i + 1}`,
          composition: ['三分法', '对称', '引导线', '框架式'][i % 4],
        })),
      },
      voice_actor: {
        voiceType: '专业旁白',
        language: '中文',
        duration: 180,
        samples: 3,
        emotions: ['沉稳', '激昂', '温馨', '专业'],
        tone: '专业而富有感染力',
        speed: '中等偏慢（适合叙事）',
        audioQuality: '48kHz / 24bit',
      },
      music_composer: {
        bgmTracks: 3,
        sfxCount: 15 + iteration * 3,
        mood: '激昂/温馨/紧张',
        instruments: ['钢琴', '弦乐', '电子合成器', '打击乐'],
        style: '史诗感 + 现代电子',
        tempo: '动态变化，配合剧情',
        audioFormat: 'WAV 48kHz/24bit',
        copyright: '原创音乐，无版权问题',
      },
      video_editor: {
        clipsCount: 25 + iteration * 3,
        transitions: ['淡入淡出', '溶解', '划像', '缩放', '无缝转场'],
        outputFormat: '1080p/MP4/H.264',
        colorGrading: '电影级调色',
        effects: ['光效', '粒子', '文字动画', '图形动效'],
        duration: '3分15秒',
        frameRate: '30fps',
        renderQuality: '高画质',
      },
      marketing_strategist: {
        channels: [
          { name: '抖音', priority: 'high', contentFormat: '竖屏短视频' },
          { name: '视频号', priority: 'high', contentFormat: '横屏+竖屏' },
          { name: 'B站', priority: 'medium', contentFormat: '横屏长视频' },
          { name: '小红书', priority: 'medium', contentFormat: '图文+视频' },
          { name: '微博', priority: 'low', contentFormat: '短视频+话题' },
        ],
        targetAudience: {
          age: '18-45岁',
          gender: '男女均衡',
          interests: ['娱乐', '生活方式', '科技', '文化'],
        },
        kpi: {
          exposure: '曝光量 100万+',
          engagement: '互动率 5%+',
          conversion: '转化率 2%+',
        },
        contentStrategy: '矩阵式内容分发，多平台联动',
        launchPlan: '预热期 + 爆发期 + 长尾期',
      },
      brand_analyst: {
        brandPositioning: '行业领先的AIGC视频创作平台',
        brandPersonality: '专业、创新、高效',
        visualStyle: '现代科技感 + 人文温度',
        tone: '专业而友好，富有创造力',
        keyMessages: [
          '用AI重新定义视频创作',
          '专业品质，高效交付',
          '让每个人都能制作大片级视频',
        ],
        competitorAnalysis: {
          directCompetitors: 3,
          ourAdvantage: ['多智能体协作', '商用级品质', '全流程自动化'],
        },
      },
      culture_researcher: {
        highlights: ['历史文化', '自然景观', '民俗风情', '特色美食'],
        localFeatures: [
          { category: '美食', items: ['地方小吃', '特色菜肴', '传统糕点'] },
          { category: '工艺', items: ['传统手工艺', '非遗项目', '地方特产'] },
          { category: '景点', items: ['历史古迹', '自然风光', '网红打卡地'] },
        ],
        stories: [
          { title: '历史传说', type: 'history' },
          { title: '民俗故事', type: 'folklore' },
          { title: '人物传记', type: 'biography' },
        ],
        culturalElements: ['建筑风格', '服饰特色', '节日庆典', '传统艺术'],
      },
      quality_inspector: {
        qualityScore: 92 + iteration * 2,
        qualityDimensions: [
          { dimension: '内容质量', score: 90 },
          { dimension: '技术质量', score: 95 },
          { dimension: '创意水平', score: 88 },
          { dimension: '完成度', score: 96 },
        ],
        issuesFound: 0,
        issues: [],
        approved: true,
        approvalLevel: 'A+ 优秀',
        suggestions: ['可进一步优化细节', '考虑增加互动元素'],
      },
      data_analyst: {
        metrics: {
          viewCount: '预估 100万+',
          averageWatchTime: '预估 75%',
          engagementRate: '预估 5.5%',
          shareRate: '预估 2.3%',
        },
        targetAudienceInsights: {
          peakViewingTime: '19:00-22:00',
          preferredContent: '故事性强的内容',
          device: '移动端为主（85%）',
        },
        optimizationSuggestions: [
          '优化前3秒钩子，提升完播率',
          '增加互动引导，提升评论率',
          '把握发布时机，提升初始流量',
        ],
      },
    };

    return outputs[role] || { completed: true, iteration };
  }

  async sendMessage(params: {
    fromAgentId?: string;
    toAgentId?: string;
    projectId: string;
    taskId?: string;
    content: string;
    messageType: MessageType;
  }) {
    return prisma.agentMessage.create({
      data: {
        fromAgentId: params.fromAgentId || 'system',
        toAgentId: params.toAgentId,
        projectId: params.projectId,
        taskId: params.taskId,
        content: params.content,
        messageType: params.messageType,
      },
    });
  }

  async pauseProject(projectId: string) {
    const abortController = this.activeProjects.get(projectId);
    if (abortController) {
      abortController.abort();
      this.activeProjects.delete(projectId);
    }
    
    await prisma.project.update({
      where: { id: projectId },
      data: { status: 'paused' },
    });
    
    return { message: 'Project paused' };
  }

  async resumeProject(projectId: string) {
    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (!project) throw new Error('Project not found');

    if (this.activeProjects.has(projectId)) {
      throw new Error('Project already running');
    }

    const pipeline = PIPELINE_TEMPLATES[project.type];
    if (!pipeline) throw new Error(`No pipeline for project type: ${project.type}`);

    const abortController = new AbortController();
    this.activeProjects.set(projectId, abortController);

    await prisma.project.update({
      where: { id: projectId },
      data: { status: 'in_production' },
    });

    this.runPipeline(projectId, pipeline, abortController.signal).catch((err) => {
      console.error('[AgentEngine] Pipeline error:', err);
      this.handleProjectError(projectId, err.message);
    });

    return { message: 'Project resumed' };
  }

  async cancelProject(projectId: string) {
    const abortController = this.activeProjects.get(projectId);
    if (abortController) {
      abortController.abort();
      this.activeProjects.delete(projectId);
    }

    await prisma.project.update({
      where: { id: projectId },
      data: { status: 'cancelled', cancelledAt: new Date() },
    });

    return { message: 'Project cancelled' };
  }

  private async handleProjectError(projectId: string, errorMessage: string) {
    this.activeProjects.delete(projectId);
    
    await prisma.project.update({
      where: { id: projectId },
      data: { 
        status: 'failed',
        errorMessage,
      },
    });

    await this.sendMessage({
      projectId,
      content: `项目执行出错：${errorMessage}`,
      messageType: 'error',
    });
  }

  async getProjectStatus(projectId: string) {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        tasks: {
          orderBy: { createdAt: 'asc' },
          include: { agent: true },
        },
        agents: true,
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 20,
          include: { fromAgent: true },
        },
      },
    });

    if (!project) throw new Error('Project not found');

    const completedTasks = project.tasks.filter(t => t.status === 'completed').length;
    const totalTasks = project.tasks.length;

    return {
      project,
      stats: {
        completedTasks,
        totalTasks,
        isRunning: this.activeProjects.has(projectId),
      },
    };
  }
}

export const agentEngine = new AgentEngine();
