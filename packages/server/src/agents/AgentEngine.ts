import { prisma } from '../lib/prisma';
import { AgentRole, TaskStatus } from '@aigc-mas/shared';

interface AgentDefinition {
  role: string;
  name: string;
  description: string;
  capabilities: string[];
}

const AGENT_REGISTRY: AgentDefinition[] = [
  {
    role: 'project_manager',
    name: '项目经理',
    description: '负责整体项目规划、进度跟踪和团队协调',
    capabilities: ['项目规划', '任务分配', '进度跟踪', '风险管理', '质量把控'],
  },
  {
    role: 'script_writer',
    name: '编剧',
    description: '负责视频脚本创作、剧情设计和台词撰写',
    capabilities: ['剧本创作', '角色设计', '剧情编排', '台词撰写', '分镜脚本'],
  },
  {
    role: 'storyboard_artist',
    name: '分镜师',
    description: '负责分镜设计、视觉构图和画面规划',
    capabilities: ['分镜设计', '视觉构图', '镜头语言', '场景设计', '画面节奏'],
  },
  {
    role: 'voice_actor',
    name: '配音演员',
    description: '负责旁白配音、角色配音和语音合成',
    capabilities: ['旁白配音', '角色配音', '语音合成', '情感表达', '语速控制'],
  },
  {
    role: 'video_editor',
    name: '视频剪辑师',
    description: '负责视频剪辑、特效制作和后期合成',
    capabilities: ['视频剪辑', '特效制作', '调色', '转场设计', '成品输出'],
  },
  {
    role: 'marketing_strategist',
    name: '营销策划师',
    description: '负责营销策略制定、卖点提炼和传播规划',
    capabilities: ['市场分析', '营销策略', '卖点提炼', '传播规划', '效果评估'],
  },
  {
    role: 'brand_analyst',
    name: '品牌分析师',
    description: '负责品牌分析、定位和视觉规范',
    capabilities: ['品牌分析', '品牌定位', '视觉规范', '竞品分析', '调性把控'],
  },
  {
    role: 'culture_researcher',
    name: '文化研究员',
    description: '负责文化调研、地方特色挖掘和内容策划',
    capabilities: ['文化调研', '地方特色', '历史研究', '民俗挖掘', '内容策划'],
  },
  {
    role: 'music_composer',
    name: '音乐设计师',
    description: '负责背景音乐、音效设计和音频制作',
    capabilities: ['配乐创作', '音效设计', '音频混音', '情绪音乐', '版权音乐'],
  },
  {
    role: 'quality_inspector',
    name: '质量审核员',
    description: '负责内容质量审核、合规检查和最终验收',
    capabilities: ['质量审核', '合规检查', '内容审查', '技术质检', '最终验收'],
  },
];

const PIPELINE_TEMPLATES: Record<string, string[]> = {
  short_drama: [
    'project_manager',
    'script_writer',
    'storyboard_artist',
    'voice_actor',
    'music_composer',
    'video_editor',
    'quality_inspector',
  ],
  corporate_video: [
    'project_manager',
    'brand_analyst',
    'marketing_strategist',
    'script_writer',
    'storyboard_artist',
    'voice_actor',
    'music_composer',
    'video_editor',
    'quality_inspector',
  ],
  tourism_promo: [
    'project_manager',
    'culture_researcher',
    'script_writer',
    'storyboard_artist',
    'voice_actor',
    'music_composer',
    'video_editor',
    'quality_inspector',
  ],
};

class AgentEngine {
  private initialized = false;
  private activeProjects: Set<string> = new Set();

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

  private async seedAgents() {
    for (const def of AGENT_REGISTRY) {
      await prisma.agent.create({
        data: {
          name: def.name,
          role: def.role,
          status: 'idle',
          description: def.description,
          capabilities: def.capabilities as any,
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

    this.activeProjects.add(projectId);

    await prisma.project.update({
      where: { id: projectId },
      data: { status: 'in_production', progress: 5, startedAt: new Date() },
    });

    await this.assignProjectAgents(projectId, pipeline);

    await this.createPipelineTasks(projectId, pipeline, project);

    this.runPipeline(projectId).catch((err) => {
      console.error('[AgentEngine] Pipeline error:', err);
    });

    return { message: 'Project started', pipeline };
  }

  private async assignProjectAgents(projectId: string, roles: string[]) {
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

  private async createPipelineTasks(projectId: string, roles: string[], project: any) {
    const tasks: any[] = [];
    let prevTaskId: string | null = null;

    for (let i = 0; i < roles.length; i++) {
      const role = roles[i];
      const def = AGENT_REGISTRY.find((a) => a.role === role);
      const taskTitle = this.getTaskTitleForRole(role, project.type);

      const taskData: any = {
        projectId,
        agentRole: role,
        title: taskTitle,
        description: def?.description || '',
        priority: 'high',
        status: 'pending',
        dependsOn: prevTaskId ? [prevTaskId] : [],
        inputData: { phase: i + 1, totalPhases: roles.length },
      };

      const task = await prisma.agentTask.create({ data: taskData });

      tasks.push(task);
      prevTaskId = task.id;
    }

    return tasks;
  }

  private getTaskTitleForRole(role: string, projectType: string): string {
    const titles: Record<string, string> = {
      project_manager: '项目启动与规划',
      script_writer: '脚本创作',
      storyboard_artist: '分镜设计',
      voice_actor: '配音录制',
      video_editor: '视频剪辑与合成',
      marketing_strategist: '营销策划',
      brand_analyst: '品牌分析',
      culture_researcher: '文化调研与策划',
      music_composer: '音乐与音效设计',
      quality_inspector: '质量审核与验收',
    };
    return titles[role] || role;
  }

  private async runPipeline(projectId: string) {
    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (!project) return;

    const tasks = await prisma.agentTask.findMany({
      where: { projectId },
      orderBy: { createdAt: 'asc' },
    });

    for (const task of tasks) {
      if (!this.activeProjects.has(projectId)) {
        console.log('[AgentEngine] Project paused:', projectId);
        return;
      }

      await this.executeTask(task.id);

      const completedTasks = await prisma.agentTask.count({
        where: { projectId, status: 'completed' },
      });
      const progress = Math.round((completedTasks / tasks.length) * 100);

      await prisma.project.update({
        where: { id: projectId },
        data: { progress },
      });
    }

    await prisma.project.update({
      where: { id: projectId },
      data: { status: 'completed', progress: 100, completedAt: new Date() },
    });

    this.activeProjects.delete(projectId);
    console.log('[AgentEngine] Project completed:', projectId);
  }

  async executeTask(taskId: string) {
    const task = await prisma.agentTask.findUnique({ where: { id: taskId } });
    if (!task) throw new Error('Task not found');

    let agent = await prisma.agent.findFirst({ where: { role: task.agentRole } });
    if (!agent) {
      const def = AGENT_REGISTRY.find((a) => a.role === task.agentRole);
      if (!def) throw new Error(`Agent role not found: ${task.agentRole}`);
      const agentData: any = {
        name: def.name,
        role: def.role,
        status: 'working',
        description: def.description,
        capabilities: def.capabilities,
        projectId: task.projectId,
        currentTaskId: task.id,
      };
      agent = await prisma.agent.create({ data: agentData });
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
      content: `开始执行任务：${task.title}`,
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
      data: { status: 'idle', currentTaskId: null },
    });

    await this.sendMessage({
      fromAgentId: agent.id,
      projectId: task.projectId,
      taskId: task.id,
      content: `任务完成：${task.title}`,
      messageType: 'result',
    });

    return { taskId, status: 'completed' };
  }

  private async simulateTaskWork(task: any, agent: any) {
    const baseDelay = 1500;
    const randomDelay = Math.random() * 1500;
    await new Promise((resolve) => setTimeout(resolve, baseDelay + randomDelay));

    const checkpoints = 3;
    for (let i = 1; i <= checkpoints; i++) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      await this.sendMessage({
        fromAgentId: agent.id,
        projectId: task.projectId,
        taskId: task.id,
        content: `任务进度：${Math.round((i / checkpoints) * 100)}%`,
        messageType: 'notification',
      }).catch(() => {});
    }
  }

  private generateTaskOutput(task: any) {
    const role = task.agentRole;
    const outputs: Record<string, any> = {
      project_manager: {
        plan: '项目计划已制定',
        milestones: ['需求确认', '脚本创作', '分镜设计', '素材制作', '剪辑合成', '最终交付'],
        timeline: '预计3-5个工作日',
      },
      script_writer: {
        scenesCount: 6,
        totalDuration: 180,
        version: 1,
        characters: ['主角', '配角'],
      },
      storyboard_artist: {
        framesCount: 24,
        style: '电影感',
        aspectRatio: '16:9',
      },
      voice_actor: {
        voiceType: '专业旁白',
        language: '中文',
        duration: 180,
      },
      music_composer: {
        bgmTracks: 2,
        sfxCount: 10,
        mood: '激昂/温馨',
      },
      video_editor: {
        clipsCount: 20,
        transitions: '专业转场',
        outputFormat: '1080p/MP4',
      },
      marketing_strategist: {
        channels: ['抖音', '视频号', 'B站'],
        targetAudience: '18-45岁',
        kpi: '曝光量/转化率',
      },
      brand_analyst: {
        brandPositioning: '行业领先',
        visualStyle: '专业大气',
        tone: '稳重可信',
      },
      culture_researcher: {
        highlights: ['历史文化', '自然景观', '民俗风情'],
        localFeatures: ['地方美食', '传统工艺'],
      },
      quality_inspector: {
        qualityScore: 95,
        issuesFound: 0,
        approved: true,
      },
    };

    return outputs[role] || { completed: true };
  }

  async sendMessage(params: {
    fromAgentId: string;
    toAgentId?: string;
    projectId: string;
    taskId?: string;
    content: string;
    messageType: string;
  }) {
    return prisma.agentMessage.create({
      data: {
        fromAgentId: params.fromAgentId,
        toAgentId: params.toAgentId,
        projectId: params.projectId,
        taskId: params.taskId,
        content: params.content,
        messageType: params.messageType,
      },
    });
  }

  async pauseProject(projectId: string) {
    this.activeProjects.delete(projectId);
    await prisma.project.update({
      where: { id: projectId },
      data: { status: 'planning' },
    });
    return { message: 'Project paused' };
  }

  async resumeProject(projectId: string) {
    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (!project) throw new Error('Project not found');

    this.activeProjects.add(projectId);

    await prisma.project.update({
      where: { id: projectId },
      data: { status: 'in_production' },
    });

    this.runPipeline(projectId).catch(console.error);

    return { message: 'Project resumed' };
  }
}

export const agentEngine = new AgentEngine();
