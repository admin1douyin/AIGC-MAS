import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Home,
  FolderOpen,
  User,
  Plus,
  MoreHorizontal,
  Sparkles,
  Film,
  ShoppingBag,
  ChevronRight,
  Gift,
  Video,
  Bell,
  Settings,
} from 'lucide-react';
import { projectApi } from '../services/projectApi';
import { authApi, type Subscription } from '../services/authApi';

const creationModes = [
  {
    key: 'short_drama',
    title: '短剧生产',
    desc: 'AI多智能体全流程协作，批量生产高质量短剧内容。',
    icon: Film,
    gradient: 'from-orange-500 to-red-600',
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=short%20drama%20film%20production%20scene%20colorful&image_size=landscape_16_9',
  },
  {
    key: 'corporate_video',
    title: '企业视频',
    desc: '品牌分析+营销策划+视频制作，一站式企业解决方案。',
    icon: ShoppingBag,
    gradient: 'from-blue-500 to-teal-600',
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=corporate%20video%20production%20business%20professional&image_size=landscape_16_9',
  },
  {
    key: 'tourism_promo',
    title: '文旅宣传',
    desc: '文化挖掘+故事创作+视觉呈现，打造地方文旅名片。',
    icon: Video,
    gradient: 'from-cyan-500 to-blue-600',
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=tourism%20promotion%20scenic%20landscape%20cultural&image_size=landscape_16_9',
  },
];

const navItems = [
  { key: 'home', label: '首页', icon: Home },
  { key: 'assets', label: '资产库', icon: FolderOpen },
  { key: 'ai_actors', label: 'AI演员', icon: User },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const [activeNav, setActiveNav] = useState('home');
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState<Subscription | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [projectsRes, subRes] = await Promise.all([
        projectApi.list({ page: 1, pageSize: 20 }),
        authApi.getSubscription(),
      ]);

      if (projectsRes.success) {
        setProjects(projectsRes.data.items || []);
      }
      if (subRes.success && subRes.data) {
        setSubscription(subRes.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = () => {
    navigate('/app/projects/new');
  };

  const handleNavClick = (key: string) => {
    setActiveNav(key);
    if (key === 'assets') {
      navigate('/app/assets');
    } else if (key === 'ai_actors') {
      navigate('/app/ai-actors');
    }
  };

  const getProjectModeLabel = (type: string) => {
    const map: Record<string, string> = {
      short_drama: '短剧生产',
      corporate_video: '企业视频',
      tourism_promo: '文旅宣传',
    };
    return map[type] || type;
  };

  return (
    <div className="min-h-screen bg-black flex flex-col lg:flex-row overflow-hidden">
      {/* Left Sidebar - hidden on mobile */}
      <aside className="hidden lg:flex w-56 bg-black/50 border-r border-white/10 flex-col flex-shrink-0">
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

            <div className="space-y-0.5">
              {loading ? (
                <div className="px-3 py-4 text-white/40 text-xs">加载中...</div>
              ) : projects.length === 0 ? (
                <div className="px-3 py-4 text-white/40 text-xs">暂无项目</div>
              ) : (
                projects.map((project) => (
                  <button
                    key={project.id}
                    onClick={() => navigate(`/app/projects/${project.id}/workbench`)}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-lg group transition-colors hover:bg-white/5"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-1 h-1 rounded-full bg-pink-400" />
                      <span className="text-white/70 text-sm truncate">{project.name}</span>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-white/30 text-xs px-1.5 py-0.5 bg-white/5 rounded">
                        {getProjectModeLabel(project.type)}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                        }}
                        className="p-1 text-white/40 hover:text-white rounded transition-colors"
                      >
                        <MoreHorizontal className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </nav>
      </aside>

      {/* Mobile Navigation - shown on small screens */}
      <nav className="lg:hidden bg-zinc-900/90 backdrop-blur-lg border-b border-white/10 px-4 py-2 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-pink-500 to-purple-500 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <span className="text-white font-semibold text-sm">AIGC-MAS</span>
        </div>
        <div className="flex items-center gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.key}
                onClick={() => handleNavClick(item.key)}
                className={`p-2 rounded-lg transition-colors ${
                  activeNav === item.key
                    ? 'bg-pink-500/20 text-pink-400'
                    : 'text-white/60 hover:bg-white/10 hover:text-white'
                }`}
              >
                <Icon className="w-5 h-5" />
              </button>
            );
          })}
        </div>
      </nav>

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
              <span className="text-white text-sm font-medium">
                {subscription ? (subscription.credits - subscription.usedCredits).toFixed(1) : '--'}
              </span>
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
              U
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-5xl mx-auto">
            <div className="mb-6">
              <h1 className="text-white text-2xl font-bold mb-2">选择创作模式</h1>
              <p className="text-white/50 text-sm">选择适合您的视频创作模式，开始AI视频制作之旅</p>
            </div>

            {/* Creation Modes Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {creationModes.map((mode) => {
                const Icon = mode.icon;
                return (
                  <div
                    key={mode.key}
                    className="group relative rounded-2xl overflow-hidden bg-white/5 border border-white/10 hover:border-pink-500/50 transition-all duration-300 cursor-pointer"
                    onClick={() => handleCreateProject()}
                  >
                    {/* Background Image */}
                    <div className="aspect-video relative overflow-hidden">
                      <img
                        src={mode.image}
                        alt={mode.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />
                      
                      {/* Content */}
                      <div className="absolute bottom-0 left-0 right-0 p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${mode.gradient} flex items-center justify-center`}>
                            <Icon className="w-4 h-4 text-white" />
                          </div>
                          <h3 className="text-white font-semibold text-lg">{mode.title}</h3>
                        </div>
                        <p className="text-white/60 text-sm mb-3 line-clamp-2">{mode.desc}</p>
                        <button className="inline-flex items-center gap-1 px-4 py-1.5 bg-white text-black text-sm font-medium rounded-full hover:bg-white/90 transition-colors">
                          立即创作
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Quick Stats */}
            <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: '总项目数', value: projects.length, icon: Film },
                { label: '进行中', value: projects.filter((p) => p.status === 'in_production' || p.status === 'planning').length, icon: Video },
                { label: '已完成', value: projects.filter((p) => p.status === 'completed').length, icon: Sparkles },
                { label: '累计积分', value: subscription ? subscription.credits.toFixed(1) : '--', icon: Gift },
              ].map((stat, idx) => {
                const Icon = stat.icon;
                return (
                  <div
                    key={idx}
                    className="bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-pink-500/20 to-purple-500/20 flex items-center justify-center">
                        <Icon className="w-5 h-5 text-pink-400" />
                      </div>
                    </div>
                    <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
                    <div className="text-white/50 text-sm">{stat.label}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
