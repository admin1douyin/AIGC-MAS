import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { projectApi, Project } from '../services/projectApi';
import { useAuth } from '../lib/AuthContext';
import {
  Home,
  FolderOpen,
  User,
  Plus,
  MoreHorizontal,
  Sparkles,
  Search,
  Gift,
  Video,
  Bell,
  Settings,
  Star,
  X,
  Loader2,
  AlertCircle,
  MessageSquare,
  ChevronRight,
  Clock,
} from 'lucide-react';

const navItems = [
  { key: 'home', label: '首页', icon: Home },
  { key: 'assets', label: '资产库', icon: FolderOpen },
  { key: 'ai_actors', label: 'AI演员', icon: User },
];

const roleFilters = [
  { key: 'all', label: '全部' },
  { key: 'director', label: '导演' },
  { key: 'screenwriter', label: '编剧' },
  { key: 'cinematographer', label: '摄影' },
  { key: 'editor', label: '剪辑' },
  { key: 'producer', label: '制片' },
];

const statusFilters = [
  { key: 'all', label: '全部状态' },
  { key: 'active', label: '活跃' },
  { key: 'idle', label: '空闲' },
  { key: 'busy', label: '忙碌' },
];

const roleNameMap: Record<string, string> = {
  director: '导演',
  screenwriter: '编剧',
  cinematographer: '摄影',
  editor: '剪辑',
  producer: '制片',
};

const statusNameMap: Record<string, string> = {
  active: '活跃',
  idle: '空闲',
  busy: '忙碌',
};

const statusColorMap: Record<string, string> = {
  active: 'bg-green-500',
  idle: 'bg-yellow-500',
  busy: 'bg-red-500',
};

interface Agent {
  id: string;
  projectId: string;
  name: string;
  role: string;
  description: string | null;
  avatarUrl: string | null;
  status: string;
  capabilities: string | null;
  config: string | null;
  createdAt: string;
  updatedAt: string;
}

interface AgentMessage {
  id: string;
  role: string;
  content: string;
  createdAt: string;
  [key: string]: any;
}

interface RegistryEntry {
  id: string;
  name: string;
  role: string;
  description: string;
  [key: string]: any;
}

export default function AIActors() {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Data state
  const [agents, setAgents] = useState<Agent[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [agentMessages, setAgentMessages] = useState<AgentMessage[]>([]);
  const [, setRegistryEntries] = useState<RegistryEntry[]>([]);

  // UI state
  const [activeNav, setActiveNav] = useState('ai_actors');
  const [activeRole, setActiveRole] = useState('all');
  const [activeStatus, setActiveStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [showDetailPanel, setShowDetailPanel] = useState(false);

  // Loading state
  const [agentsLoading, setAgentsLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [projectsLoading, setProjectsLoading] = useState(true);

  // Error state
  const [agentsError, setAgentsError] = useState<string | null>(null);
  const [messagesError, setMessagesError] = useState<string | null>(null);
  const [projectsError, setProjectsError] = useState<string | null>(null);

  // Fetch projects
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setProjectsLoading(true);
        setProjectsError(null);
        const res = await projectApi.list({ page: 1, pageSize: 100 });
        const projectList = res?.data?.items || [];
        setProjects(projectList);
      } catch (err: any) {
        setProjectsError(err?.message || '加载项目列表失败');
      } finally {
        setProjectsLoading(false);
      }
    };
    fetchProjects();
  }, []);

  // Fetch agents
  const fetchAgents = useCallback(async () => {
    try {
      setAgentsLoading(true);
      setAgentsError(null);
      const params: Record<string, string> = {};
      if (selectedProjectId) params.projectId = selectedProjectId;
      if (activeRole !== 'all') params.role = activeRole;
      if (activeStatus !== 'all') params.status = activeStatus;
      const res = await api.get('/agents', { params });
      setAgents(res?.data || []);
    } catch (err: any) {
      setAgentsError(err?.message || '加载AI演员失败');
    } finally {
      setAgentsLoading(false);
    }
  }, [selectedProjectId, activeRole, activeStatus]);

  useEffect(() => {
    fetchAgents();
  }, [fetchAgents]);

  // Fetch registry entries
  useEffect(() => {
    const fetchRegistry = async () => {
      try {
        const res = await api.get('/agents/registry/list');
        setRegistryEntries(res?.data || []);
      } catch {
        // Registry is optional, silently fail
      }
    };
    fetchRegistry();
  }, []);

  // Fetch agent messages when selecting an agent
  const fetchAgentMessages = useCallback(async (agentId: string) => {
    try {
      setMessagesLoading(true);
      setMessagesError(null);
      const params: Record<string, string> = {};
      if (selectedProjectId) params.projectId = selectedProjectId;
      const res = await api.get(`/agents/${agentId}/messages`, { params });
      setAgentMessages(res?.data || []);
    } catch (err: any) {
      setMessagesError(err?.message || '加载消息失败');
    } finally {
      setMessagesLoading(false);
    }
  }, [selectedProjectId]);

  const handleSelectAgent = async (agent: Agent) => {
    setSelectedAgent(agent);
    setShowDetailPanel(true);
    await fetchAgentMessages(agent.id);
  };

  const handleCloseDetail = () => {
    setShowDetailPanel(false);
    setSelectedAgent(null);
    setAgentMessages([]);
    setMessagesError(null);
  };

  const handleNavClick = (key: string) => {
    setActiveNav(key);
    if (key === 'home') {
      navigate('/app');
    } else if (key === 'assets') {
      navigate('/app/assets');
    }
  };

  // Filter agents by search query (client-side)
  const filteredAgents = agents.filter((agent) =>
    agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (agent.description && agent.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleString('zh-CN', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  const getAvatarFallback = (name: string) => {
    return name.charAt(0).toUpperCase();
  };

  return (
    <div className="h-screen bg-black flex overflow-hidden">
      {/* Left Sidebar */}
      <aside className="w-56 bg-black/50 border-r border-white/10 flex flex-col flex-shrink-0">
        {/* Logo */}
        <div className="h-14 flex items-center px-4 border-b border-white/10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-pink-500 to-purple-500 flex items-center justify-center">
              <Sparkles className="w-[18px] h-[18px] text-white" />
            </div>
            <span className="text-white font-bold text-base">AIGC-MAS</span>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-3 px-2 overflow-y-auto">
          <div className="space-y-1 mb-4">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.key}
                  onClick={() => handleNavClick(item.key)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeNav === item.key
                      ? 'bg-pink-500/20 text-pink-400'
                      : 'text-white/60 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </button>
              );
            })}
          </div>

          {/* Project Section */}
          <div className="mt-4">
            <div className="flex items-center justify-between px-3 mb-2">
              <span className="text-white/40 text-xs font-medium">项目</span>
              <button
                onClick={() => navigate('/app/projects/new')}
                className="flex items-center gap-1 px-2 py-1 text-white/60 hover:text-white hover:bg-white/10 rounded text-xs transition-colors"
              >
                <Plus className="w-3 h-3" />
                新建项目
              </button>
            </div>

            {projectsLoading ? (
              <div className="px-3 py-2">
                <Loader2 className="w-4 h-4 text-white/30 animate-spin" />
              </div>
            ) : projectsError ? (
              <div className="px-3 py-2 text-red-400/60 text-xs">{projectsError}</div>
            ) : (
              <div className="space-y-0.5">
                {projects.map((project) => (
                  <button
                    key={project.id}
                    onClick={() => setSelectedProjectId(selectedProjectId === project.id ? '' : project.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg group transition-colors hover:bg-white/5 ${
                      selectedProjectId === project.id ? 'bg-white/10' : ''
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div className={`w-1 h-1 rounded-full ${selectedProjectId === project.id ? 'bg-pink-400' : 'bg-white/30'}`} />
                      <span className="text-white/70 text-sm truncate">{project.name}</span>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                      }}
                      className="p-1 text-white/40 hover:text-white rounded transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <MoreHorizontal className="w-3.5 h-3.5" />
                    </button>
                  </button>
                ))}
              </div>
            )}
          </div>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <header className="h-14 bg-black/50 backdrop-blur border-b border-white/10 flex items-center justify-between px-6 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-pink-500 to-purple-500 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="text-white font-semibold">AIGC-MAS</span>
          </div>

          <div className="flex items-center gap-3">
            <button className="flex items-center gap-1.5 px-3 py-1.5 text-white/80 hover:text-white text-sm transition-colors">
              <Gift className="w-4 h-4 text-yellow-400" />
              邀请有礼
            </button>
            <button className="flex items-center gap-1.5 px-3 py-1.5 text-white/80 hover:text-white text-sm transition-colors">
              <Video className="w-4 h-4" />
              视频详细
            </button>
            <div className="flex items-center gap-1.5 px-3 py-1 bg-white/5 rounded-full">
              <div className="w-3 h-3 rounded-full bg-pink-500" />
              <span className="text-white text-sm font-medium">2780.4</span>
            </div>
            <button className="px-3 py-1 bg-gradient-to-r from-pink-500 to-purple-500 text-white text-sm font-medium rounded-full hover:opacity-90 transition-opacity">
              订阅
            </button>
            <button className="p-1.5 text-white/60 hover:text-white hover:bg-white/10 rounded-full transition-colors">
              <Bell className="w-4 h-4" />
            </button>
            <button className="p-1.5 text-white/60 hover:text-white hover:bg-white/10 rounded-full transition-colors">
              <Settings className="w-4 h-4" />
            </button>
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-pink-500 to-purple-500 flex items-center justify-center text-white text-xs font-medium">
              {user?.email?.charAt(0).toUpperCase() || 'U'}
            </div>
          </div>
        </header>

        {/* AI Actors Content */}
        <div className="flex-1 flex overflow-hidden">
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 border-b border-white/10">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h1 className="text-white text-xl font-bold">AI演员库</h1>
                  <p className="text-white/50 text-sm mt-1">管理和查看项目中的AI智能体</p>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-500 text-white text-sm font-medium rounded-full hover:opacity-90 transition-opacity">
                  <Plus className="w-4 h-4" />
                  创建演员
                </button>
              </div>

              {/* Filters + search */}
              <div className="flex items-center gap-3 flex-wrap">
                {/* Role filter */}
                <div className="flex items-center gap-2">
                  {roleFilters.map((rf) => (
                    <button
                      key={rf.key}
                      onClick={() => setActiveRole(rf.key)}
                      className={`px-4 py-1.5 text-sm font-medium rounded-full transition-colors ${
                        activeRole === rf.key
                          ? 'bg-pink-500 text-white'
                          : 'text-white/60 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      {rf.label}
                    </button>
                  ))}
                </div>

                {/* Status filter */}
                <div className="flex items-center gap-2 ml-2">
                  {statusFilters.map((sf) => (
                    <button
                      key={sf.key}
                      onClick={() => setActiveStatus(sf.key)}
                      className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors border ${
                        activeStatus === sf.key
                          ? 'border-pink-500/50 bg-pink-500/20 text-pink-400'
                          : 'border-white/10 text-white/50 hover:text-white hover:border-white/20'
                      }`}
                    >
                      {sf.label}
                    </button>
                  ))}
                </div>

                <div className="flex-1" />

                {/* Project selector */}
                {selectedProjectId && (
                  <div className="flex items-center gap-1.5 px-3 py-1 bg-purple-500/20 border border-purple-500/30 rounded-full text-xs">
                    <FolderOpen className="w-3 h-3 text-purple-400" />
                    <span className="text-purple-300">
                      {projects.find((p) => p.id === selectedProjectId)?.name || '未知项目'}
                    </span>
                    <button
                      onClick={() => setSelectedProjectId('')}
                      className="text-purple-400 hover:text-white ml-1"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}

                {/* Search */}
                <div className="relative">
                  <Search className="w-4 h-4 text-white/40 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="搜索演员..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 pr-4 py-1.5 bg-white/5 border border-white/10 rounded-full text-white text-sm focus:outline-none focus:border-pink-500/50 w-48"
                  />
                </div>
              </div>
            </div>

            {/* Agents Grid */}
            <div className="flex-1 overflow-y-auto p-6">
              {/* Loading state */}
              {agentsLoading ? (
                <div className="flex flex-col items-center justify-center h-64 gap-3">
                  <Loader2 className="w-8 h-8 text-pink-400 animate-spin" />
                  <span className="text-white/50 text-sm">加载AI演员中...</span>
                </div>
              ) : agentsError ? (
                <div className="flex flex-col items-center justify-center h-64 gap-3">
                  <AlertCircle className="w-8 h-8 text-red-400" />
                  <span className="text-red-400 text-sm">{agentsError}</span>
                  <button
                    onClick={fetchAgents}
                    className="px-4 py-1.5 bg-white/10 text-white text-sm rounded-full hover:bg-white/20 transition-colors"
                  >
                    重试
                  </button>
                </div>
              ) : filteredAgents.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 gap-3">
                  <User className="w-8 h-8 text-white/20" />
                  <span className="text-white/40 text-sm">
                    {searchQuery ? '没有找到匹配的AI演员' : '暂无AI演员'}
                  </span>
                  {!searchQuery && (
                    <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-500 text-white text-sm font-medium rounded-full hover:opacity-90 transition-opacity">
                      <Plus className="w-4 h-4" />
                      创建演员
                    </button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                  {filteredAgents.map((agent) => (
                    <div
                      key={agent.id}
                      onClick={() => handleSelectAgent(agent)}
                      className={`group relative rounded-xl overflow-hidden bg-white/5 border transition-all cursor-pointer ${
                        selectedAgent?.id === agent.id
                          ? 'border-pink-500/80 ring-1 ring-pink-500/30'
                          : 'border-white/10 hover:border-pink-500/50'
                      }`}
                    >
                      {/* Avatar area */}
                      <div className="aspect-[3/4] relative overflow-hidden bg-gradient-to-br from-gray-800 to-gray-900">
                        {agent.avatarUrl ? (
                          <img
                            src={agent.avatarUrl}
                            alt={agent.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-pink-500/20 to-purple-500/20">
                            <span className="text-4xl font-bold text-white/30">
                              {getAvatarFallback(agent.name)}
                            </span>
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                        {/* Status indicator */}
                        <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2 py-1 bg-black/50 backdrop-blur rounded-full">
                          <div className={`w-2 h-2 rounded-full ${statusColorMap[agent.status] || 'bg-gray-500'}`} />
                          <span className="text-white/80 text-xs">{statusNameMap[agent.status] || agent.status}</span>
                        </div>

                        {/* Role badge */}
                        <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 bg-black/50 backdrop-blur rounded-full">
                          <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                          <span className="text-white text-xs font-medium">
                            {roleNameMap[agent.role] || agent.role}
                          </span>
                        </div>

                        {/* Bottom info */}
                        <div className="absolute bottom-0 left-0 right-0 p-3">
                          <h3 className="text-white font-semibold mb-0.5">{agent.name}</h3>
                          {agent.description && (
                            <p className="text-white/50 text-xs line-clamp-2 mb-1.5">{agent.description}</p>
                          )}
                          <div className="flex items-center justify-between">
                            <span className="text-white/40 text-xs flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {formatDate(agent.updatedAt)}
                            </span>
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleSelectAgent(agent);
                                }}
                                className="p-1.5 bg-pink-500 backdrop-blur rounded-full hover:bg-pink-600 transition-colors"
                              >
                                <ChevronRight className="w-3.5 h-3.5 text-white" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Detail Panel */}
          {showDetailPanel && selectedAgent && (
            <div className="w-96 border-l border-white/10 bg-black/50 backdrop-blur flex flex-col flex-shrink-0">
              {/* Detail header */}
              <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between">
                <h2 className="text-white font-semibold text-sm">演员详情</h2>
                <button
                  onClick={handleCloseDetail}
                  className="p-1.5 text-white/40 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto">
                {/* Agent profile */}
                <div className="p-5 border-b border-white/10">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-gradient-to-br from-pink-500/20 to-purple-500/20">
                      {selectedAgent.avatarUrl ? (
                        <img
                          src={selectedAgent.avatarUrl}
                          alt={selectedAgent.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="text-2xl font-bold text-white/30">
                            {getAvatarFallback(selectedAgent.name)}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-white font-bold text-lg">{selectedAgent.name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="px-2 py-0.5 bg-pink-500/20 text-pink-400 text-xs rounded-full">
                          {roleNameMap[selectedAgent.role] || selectedAgent.role}
                        </span>
                        <span className="flex items-center gap-1 text-xs">
                          <span className={`w-2 h-2 rounded-full ${statusColorMap[selectedAgent.status] || 'bg-gray-500'}`} />
                          <span className="text-white/60">{statusNameMap[selectedAgent.status] || selectedAgent.status}</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {selectedAgent.description && (
                    <div className="mb-4">
                      <span className="text-white/40 text-xs">描述</span>
                      <p className="text-white/80 text-sm mt-1">{selectedAgent.description}</p>
                    </div>
                  )}

                  {/* Capabilities */}
                  {selectedAgent.capabilities && (
                    <div className="mb-4">
                      <span className="text-white/40 text-xs">能力</span>
                      <div className="flex flex-wrap gap-1.5 mt-1">
                        {(() => {
                          try {
                            const caps = JSON.parse(selectedAgent.capabilities);
                            if (Array.isArray(caps)) {
                              return caps.map((cap: string, i: number) => (
                                <span key={i} className="px-2 py-0.5 bg-white/5 border border-white/10 text-white/60 text-xs rounded-full">
                                  {cap}
                                </span>
                              ));
                            }
                            return <span className="text-white/40 text-xs">{selectedAgent.capabilities}</span>;
                          } catch {
                            return <span className="text-white/40 text-xs">{selectedAgent.capabilities}</span>;
                          }
                        })()}
                      </div>
                    </div>
                  )}

                  {/* Meta info */}
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-white/40">创建时间</span>
                      <p className="text-white/70 mt-0.5">{formatDate(selectedAgent.createdAt)}</p>
                    </div>
                    <div>
                      <span className="text-white/40">更新时间</span>
                      <p className="text-white/70 mt-0.5">{formatDate(selectedAgent.updatedAt)}</p>
                    </div>
                    {selectedAgent.projectId && (
                      <div className="col-span-2">
                        <span className="text-white/40">所属项目</span>
                        <p className="text-white/70 mt-0.5">
                          {projects.find((p) => p.id === selectedAgent.projectId)?.name || selectedAgent.projectId}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Messages section */}
                <div className="p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <MessageSquare className="w-4 h-4 text-pink-400" />
                    <span className="text-white font-medium text-sm">消息记录</span>
                  </div>

                  {messagesLoading ? (
                    <div className="flex items-center justify-center py-8 gap-2">
                      <Loader2 className="w-4 h-4 text-pink-400 animate-spin" />
                      <span className="text-white/40 text-xs">加载消息中...</span>
                    </div>
                  ) : messagesError ? (
                    <div className="flex flex-col items-center py-8 gap-2">
                      <AlertCircle className="w-5 h-5 text-red-400" />
                      <span className="text-red-400/70 text-xs">{messagesError}</span>
                      <button
                        onClick={() => fetchAgentMessages(selectedAgent.id)}
                        className="text-white/50 text-xs hover:text-white transition-colors"
                      >
                        重试
                      </button>
                    </div>
                  ) : agentMessages.length === 0 ? (
                    <div className="text-center py-8">
                      <MessageSquare className="w-6 h-6 text-white/10 mx-auto mb-2" />
                      <span className="text-white/30 text-xs">暂无消息记录</span>
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-80 overflow-y-auto">
                      {agentMessages.map((msg, i) => (
                        <div key={msg.id || i} className="bg-white/5 rounded-lg p-3">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`text-xs font-medium ${
                              msg.role === 'user' ? 'text-blue-400' : 'text-pink-400'
                            }`}>
                              {msg.role === 'user' ? '用户' : msg.role === 'assistant' ? 'AI' : msg.role}
                            </span>
                            <span className="text-white/20 text-xs">
                              {msg.createdAt ? formatDate(msg.createdAt) : ''}
                            </span>
                          </div>
                          <p className="text-white/70 text-xs leading-relaxed whitespace-pre-wrap">
                            {msg.content}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
