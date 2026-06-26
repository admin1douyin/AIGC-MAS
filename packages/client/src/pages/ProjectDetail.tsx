import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Play,
  Pause,
  Film,
  Bot,
  FileText,
  Layers,
  MessageSquare,
  Clock,
  Users,
  Sparkles,
} from 'lucide-react';
import { projectApi, Project } from '../services/projectApi';

type TabType = 'overview' | 'agents' | 'tasks' | 'script' | 'assets' | 'messages';

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [polling, setPolling] = useState(false);
  const statusRef = useRef<string>('');

  const loadProject = async () => {
    try {
      const res: any = await projectApi.get(id!);
      if (res.success) {
        setProject(res.data);
        statusRef.current = res.data.status;
        setPolling(res.data.status === 'in_production');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!id) return;
    loadProject();

    const interval = setInterval(() => {
      if (statusRef.current === 'in_production') {
        loadProject();
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [id]);

  const handleStart = async () => {
    if (!id) return;
    try {
      await projectApi.start(id);
      loadProject();
    } catch (e) {
      console.error(e);
    }
  };

  const handlePause = async () => {
    if (!id) return;
    try {
      await projectApi.pause(id);
      loadProject();
    } catch (e) {
      console.error(e);
    }
  };

  const handleResume = async () => {
    if (!id) return;
    try {
      await projectApi.resume(id);
      loadProject();
    } catch (e) {
      console.error(e);
    }
  };

  const tabs: { key: TabType; label: string; icon: any }[] = [
    { key: 'overview', label: '概览', icon: Sparkles },
    { key: 'agents', label: '智能体', icon: Bot },
    { key: 'tasks', label: '任务流', icon: Layers },
    { key: 'script', label: '脚本', icon: FileText },
    { key: 'assets', label: '素材', icon: Film },
    { key: 'messages', label: '消息', icon: MessageSquare },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-slate-400">加载中...</div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-500">项目不存在</p>
        <button
          onClick={() => navigate('/app/projects')}
          className="mt-4 text-blue-600 hover:text-blue-700"
        >
          返回项目列表
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <button
          onClick={() => navigate('/app/projects')}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-700 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          返回项目列表
        </button>

        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <Film className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-800">{project.name}</h1>
                <div className="flex items-center gap-3 mt-2">
                  <span className={`px-2.5 py-0.5 text-xs rounded-full font-medium ${getTypeStyle(project.type)}`}>
                    {getTypeLabel(project.type)}
                  </span>
                  <span className={`px-2.5 py-0.5 text-xs rounded-full font-medium ${getStatusStyle(project.status)}`}>
                    {getStatusLabel(project.status)}
                  </span>
                  {polling && (
                    <span className="flex items-center gap-1 text-xs text-amber-600">
                      <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
                      运行中
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {project.status === 'draft' ? (
                <button
                  onClick={handleStart}
                  className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors"
                >
                  <Play className="w-4 h-4" />
                  启动项目
                </button>
              ) : project.status === 'in_production' ? (
                <button
                  onClick={handlePause}
                  className="flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-medium transition-colors"
                >
                  <Pause className="w-4 h-4" />
                  暂停
                </button>
              ) : project.status === 'paused' || project.status === 'planning' ? (
                <button
                  onClick={handleResume}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                >
                  <Play className="w-4 h-4" />
                  继续
                </button>
              ) : null}
            </div>
          </div>

          {/* Progress */}
          <div className="mt-6">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-slate-600">项目进度</span>
              <span className="font-medium text-slate-800">{project.progress}%</span>
            </div>
            <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-500"
                style={{ width: `${project.progress}%` }}
              />
            </div>
          </div>

          {/* Info Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <div className="text-xs text-slate-500">智能体</div>
                <div className="font-medium text-slate-800">{project.agents?.length || 0} 个</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-amber-50 flex items-center justify-center">
                <Layers className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <div className="text-xs text-slate-500">任务数</div>
                <div className="font-medium text-slate-800">{project.tasks?.length || 0} 个</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center">
                <FileText className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <div className="text-xs text-slate-500">脚本</div>
                <div className="font-medium text-slate-800">{project.scripts?.length || 0} 版</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-purple-50 flex items-center justify-center">
                <Clock className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <div className="text-xs text-slate-500">创建时间</div>
                <div className="font-medium text-slate-800 text-sm">
                  {new Date(project.createdAt).toLocaleDateString('zh-CN')}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl border border-slate-200">
        <div className="flex border-b border-slate-200 overflow-x-auto scrollbar-thin">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 px-5 py-3.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                  isActive
                    ? 'text-blue-600 border-blue-600'
                    : 'text-slate-500 border-transparent hover:text-slate-700'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="p-6">
          {activeTab === 'overview' && <OverviewTab project={project} />}
          {activeTab === 'agents' && <AgentsTab project={project} />}
          {activeTab === 'tasks' && <TasksTab project={project} />}
          {activeTab === 'script' && <ScriptTab project={project} />}
          {activeTab === 'assets' && <AssetsTab project={project} />}
          {activeTab === 'messages' && <MessagesTab project={project} />}
        </div>
      </div>
    </div>
  );
}

function OverviewTab({ project }: { project: Project }) {
  const brief = project.brief as any || {};

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-semibold text-slate-800 mb-3">项目描述</h3>
        <p className="text-slate-600 text-sm">{project.description || '暂无描述'}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="font-semibold text-slate-800 mb-3">项目简报</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between py-2 border-b border-slate-50">
              <span className="text-slate-500">视频标题</span>
              <span className="text-slate-700">{brief.title || '-'}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-50">
              <span className="text-slate-500">目标受众</span>
              <span className="text-slate-700">{brief.targetAudience || '-'}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-50">
              <span className="text-slate-500">视频时长</span>
              <span className="text-slate-700">{brief.duration ? `${brief.duration} 秒` : '-'}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-50">
              <span className="text-slate-500">风格</span>
              <span className="text-slate-700">{brief.style || '-'}</span>
            </div>
          </div>
        </div>

        <div>
          <h3 className="font-semibold text-slate-800 mb-3">标签</h3>
          <div className="flex flex-wrap gap-2">
            {project.tags.length > 0 ? (
              project.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-full text-xs"
                >
                  {tag}
                </span>
              ))
            ) : (
              <span className="text-sm text-slate-400">暂无标签</span>
            )}
          </div>
        </div>
      </div>

      {project.shortDrama && (
        <div>
          <h3 className="font-semibold text-slate-800 mb-3">短剧详情</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-3 bg-slate-50 rounded-lg">
              <div className="text-xs text-slate-500">题材</div>
              <div className="font-medium text-slate-800 text-sm">{project.shortDrama.genre || '-'}</div>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg">
              <div className="text-xs text-slate-500">集数</div>
              <div className="font-medium text-slate-800 text-sm">{project.shortDrama.episodeCount || 1} 集</div>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg">
              <div className="text-xs text-slate-500">单集时长</div>
              <div className="font-medium text-slate-800 text-sm">{project.shortDrama.episodeDuration || '-'} 秒</div>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg">
              <div className="text-xs text-slate-500">发布平台</div>
              <div className="font-medium text-slate-800 text-sm">{project.shortDrama.targetPlatform || '-'}</div>
            </div>
          </div>
        </div>
      )}

      {project.corporateVideo && (
        <div>
          <h3 className="font-semibold text-slate-800 mb-3">企业视频详情</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="p-3 bg-slate-50 rounded-lg">
              <div className="text-xs text-slate-500">企业名称</div>
              <div className="font-medium text-slate-800 text-sm">{project.corporateVideo.companyName || '-'}</div>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg">
              <div className="text-xs text-slate-500">行业</div>
              <div className="font-medium text-slate-800 text-sm">{project.corporateVideo.industry || '-'}</div>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg">
              <div className="text-xs text-slate-500">视频类型</div>
              <div className="font-medium text-slate-800 text-sm">{project.corporateVideo.videoType || '-'}</div>
            </div>
          </div>
        </div>
      )}

      {project.tourismPromo && (
        <div>
          <h3 className="font-semibold text-slate-800 mb-3">文旅宣传详情</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="p-3 bg-slate-50 rounded-lg">
              <div className="text-xs text-slate-500">目的地</div>
              <div className="font-medium text-slate-800 text-sm">{project.tourismPromo.location || '-'}</div>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg">
              <div className="text-xs text-slate-500">建议季节</div>
              <div className="font-medium text-slate-800 text-sm">{project.tourismPromo.season || '-'}</div>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg">
              <div className="text-xs text-slate-500">建议行程</div>
              <div className="font-medium text-slate-800 text-sm">{project.tourismPromo.durationDays || '-'} 天</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function AgentsTab({ project }: { project: Project }) {
  return (
    <div className="space-y-4">
      {project.agents && project.agents.length > 0 ? (
        project.agents.map((agent: any) => (
          <div
            key={agent.id}
            className="flex items-center justify-between p-4 border border-slate-200 rounded-xl hover:border-slate-300 transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="font-medium text-slate-800">{agent.name}</div>
                <div className="text-sm text-slate-500">{agent.description}</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className={`px-2.5 py-1 text-xs rounded-full font-medium ${getAgentStatusStyle(agent.status)}`}>
                {getAgentStatusLabel(agent.status)}
              </span>
            </div>
          </div>
        ))
      ) : (
        <div className="text-center py-12 text-slate-400">
          <Bot className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p>暂无智能体，启动项目后将自动分配</p>
        </div>
      )}
    </div>
  );
}

function TasksTab({ project }: { project: Project }) {
  return (
    <div className="space-y-3">
      {project.tasks && project.tasks.length > 0 ? (
        project.tasks.map((task: any, index: number) => (
          <div
            key={task.id}
            className="flex items-start gap-4 p-4 border border-slate-200 rounded-xl"
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0 ${
              task.status === 'completed' ? 'bg-emerald-100 text-emerald-600' :
              task.status === 'in_progress' ? 'bg-blue-100 text-blue-600' :
              'bg-slate-100 text-slate-500'
            }`}>
              {task.status === 'completed' ? '✓' : index + 1}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-slate-800">{task.title}</h4>
                <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${getTaskStatusStyle(task.status)}`}>
                  {getTaskStatusLabel(task.status)}
                </span>
              </div>
              <p className="text-sm text-slate-500 mt-1">{task.description}</p>
              {task.agentRole && (
                <div className="mt-2 text-xs text-slate-400">
                  负责智能体：{getAgentRoleLabel(task.agentRole)}
                </div>
              )}
            </div>
          </div>
        ))
      ) : (
        <div className="text-center py-12 text-slate-400">
          <Layers className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p>暂无任务，启动项目后将自动生成任务流</p>
        </div>
      )}
    </div>
  );
}

function ScriptTab({ project }: { project: Project }) {
  const scripts = project.scripts || [];
  const latestScript = scripts[0];

  if (scripts.length === 0) {
    return (
      <div className="text-center py-12 text-slate-400">
        <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
        <p>暂无脚本</p>
      </div>
    );
  }

  const scenes: any[] = latestScript?.scenes || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-slate-800">{latestScript?.title}</h3>
          <p className="text-sm text-slate-500 mt-1">
            共 {scenes.length} 个场景 · 总时长 {latestScript?.totalDuration} 秒 · v{latestScript?.version}
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {scenes.map((scene: any) => (
          <div
            key={scene.id}
            className="p-4 border border-slate-200 rounded-xl"
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <h4 className="font-medium text-slate-800">
                  场景 {scene.sceneNumber}：{scene.title}
                </h4>
                <p className="text-sm text-slate-500 mt-1">{scene.description}</p>
              </div>
              <span className="text-xs text-slate-400 flex-shrink-0">{scene.duration}s</span>
            </div>

            {scene.voiceover && (
              <div className="p-3 bg-blue-50/50 rounded-lg mt-3">
                <div className="text-xs text-blue-600 font-medium mb-1">旁白</div>
                <p className="text-sm text-slate-700">{scene.voiceover}</p>
              </div>
            )}

            {scene.dialogue && (
              <div className="p-3 bg-purple-50/50 rounded-lg mt-3">
                <div className="text-xs text-purple-600 font-medium mb-1">对话</div>
                <p className="text-sm text-slate-700 whitespace-pre-line">{scene.dialogue}</p>
              </div>
            )}

            <div className="flex flex-wrap gap-4 mt-3 text-xs text-slate-500">
              {scene.location && <span>📍 {scene.location}</span>}
              {scene.cameraAngle && <span>🎬 {scene.cameraAngle}</span>}
              {scene.bgm && <span>🎵 {scene.bgm}</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AssetsTab({ project }: { project: Project }) {
  const assets = project.assets || [];

  if (assets.length === 0) {
    return (
      <div className="text-center py-12 text-slate-400">
        <Film className="w-12 h-12 mx-auto mb-2 opacity-50" />
        <p>暂无素材</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {assets.map((asset: any) => (
        <div
          key={asset.id}
          className="aspect-video bg-slate-100 rounded-xl flex flex-col items-center justify-center p-4 border border-slate-200"
        >
          <Film className="w-8 h-8 text-slate-400 mb-2" />
          <div className="text-sm font-medium text-slate-700 text-center truncate w-full">
            {asset.name}
          </div>
          <div className="text-xs text-slate-400 mt-1">{asset.type}</div>
        </div>
      ))}
    </div>
  );
}

function MessagesTab({ project }: { project: Project }) {
  const [messages, setMessages] = useState<any[]>([]);

  useEffect(() => {
    const allMessages: any[] = [];
    project.tasks?.forEach((task: any) => {
      if (task.messages) {
        allMessages.push(...task.messages);
      }
    });
    allMessages.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    setMessages(allMessages);
  }, [project]);

  if (messages.length === 0) {
    return (
      <div className="text-center py-12 text-slate-400">
        <MessageSquare className="w-12 h-12 mx-auto mb-2 opacity-50" />
        <p>暂无消息</p>
      </div>
    );
  }

  return (
    <div className="space-y-3 max-h-96 overflow-y-auto scrollbar-thin pr-2">
      {messages.map((msg: any) => (
        <div key={msg.id} className="flex gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center flex-shrink-0">
            <Bot className="w-4 h-4 text-white" />
          </div>
          <div className="flex-1">
            <div className="bg-slate-50 rounded-lg p-3">
              <p className="text-sm text-slate-700">{msg.content}</p>
            </div>
            <div className="text-xs text-slate-400 mt-1">
              {new Date(msg.createdAt).toLocaleTimeString('zh-CN')}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function getTypeLabel(type: string) {
  const map: Record<string, string> = {
    short_drama: '短剧生产',
    corporate_video: '企业视频',
    tourism_promo: '文旅宣传',
  };
  return map[type] || type;
}

function getTypeStyle(type: string) {
  const map: Record<string, string> = {
    short_drama: 'bg-blue-100 text-blue-700',
    corporate_video: 'bg-emerald-100 text-emerald-700',
    tourism_promo: 'bg-amber-100 text-amber-700',
  };
  return map[type] || 'bg-slate-100 text-slate-700';
}

function getStatusLabel(status: string) {
  const map: Record<string, string> = {
    draft: '草稿',
    planning: '规划中',
    in_production: '制作中',
    in_review: '审核中',
    review: '审核中',
    completed: '已完成',
    cancelled: '已取消',
    paused: '已暂停',
    failed: '失败',
    archived: '已归档',
  };
  return map[status] || status;
}

function getStatusStyle(status: string) {
  const map: Record<string, string> = {
    draft: 'bg-slate-100 text-slate-700',
    planning: 'bg-blue-100 text-blue-700',
    in_production: 'bg-amber-100 text-amber-700',
    in_review: 'bg-purple-100 text-purple-700',
    review: 'bg-purple-100 text-purple-700',
    completed: 'bg-emerald-100 text-emerald-700',
    cancelled: 'bg-red-100 text-red-700',
    paused: 'bg-orange-100 text-orange-700',
    failed: 'bg-red-100 text-red-700',
    archived: 'bg-slate-100 text-slate-500',
  };
  return map[status] || 'bg-slate-100 text-slate-700';
}

function getAgentStatusLabel(status: string) {
  const map: Record<string, string> = {
    idle: '空闲',
    working: '工作中',
    paused: '暂停',
    error: '异常',
  };
  return map[status] || status;
}

function getAgentStatusStyle(status: string) {
  const map: Record<string, string> = {
    idle: 'bg-slate-100 text-slate-600',
    working: 'bg-blue-100 text-blue-600',
    paused: 'bg-amber-100 text-amber-600',
    error: 'bg-red-100 text-red-600',
  };
  return map[status] || 'bg-slate-100 text-slate-600';
}

function getTaskStatusLabel(status: string) {
  const map: Record<string, string> = {
    pending: '待执行',
    in_progress: '进行中',
    in_review: '审核中',
    needs_revision: '需要修改',
    completed: '已完成',
    failed: '失败',
    cancelled: '已取消',
  };
  return map[status] || status;
}

function getTaskStatusStyle(status: string) {
  const map: Record<string, string> = {
    pending: 'bg-slate-100 text-slate-600',
    in_progress: 'bg-blue-100 text-blue-600',
    in_review: 'bg-purple-100 text-purple-600',
    needs_revision: 'bg-orange-100 text-orange-600',
    completed: 'bg-emerald-100 text-emerald-600',
    failed: 'bg-red-100 text-red-600',
    cancelled: 'bg-slate-100 text-slate-500',
  };
  return map[status] || 'bg-slate-100 text-slate-600';
}

function getAgentRoleLabel(role: string) {
  const map: Record<string, string> = {
    project_manager: '项目经理',
    script_writer: '编剧',
    storyboard_artist: '分镜师',
    voice_actor: '配音演员',
    video_editor: '视频剪辑师',
    marketing_strategist: '营销策划师',
    brand_analyst: '品牌分析师',
    culture_researcher: '文化研究员',
    music_composer: '音乐设计师',
    quality_inspector: '质量审核员',
  };
  return map[role] || role;
}
