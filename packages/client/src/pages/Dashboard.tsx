import { useState, useEffect } from 'react';
import {
  Film,
  Bot,
  CheckCircle,
  Play,
  TrendingUp,
  Clock,
  Zap,
} from 'lucide-react';
import { statsApi } from '../services/statsApi';

export default function Dashboard() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const res: any = await statsApi.overview();
      if (res.success) {
        setStats(res.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      label: '项目总数',
      value: stats?.totalProjects || 0,
      icon: Film,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600',
    },
    {
      label: '进行中',
      value: stats?.inProgressProjects || 0,
      icon: Play,
      color: 'bg-amber-500',
      bgColor: 'bg-amber-50',
      textColor: 'text-amber-600',
    },
    {
      label: '已完成',
      value: stats?.completedProjects || 0,
      icon: CheckCircle,
      color: 'bg-emerald-500',
      bgColor: 'bg-emerald-50',
      textColor: 'text-emerald-600',
    },
    {
      label: '智能体',
      value: stats?.totalAgents || 0,
      icon: Bot,
      color: 'bg-purple-500',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600',
    },
  ];

  const projectTypeData = [
    { label: '短剧生产', value: stats?.byType?.short_drama || 0, color: 'bg-blue-500' },
    { label: '企业视频', value: stats?.byType?.corporate_video || 0, color: 'bg-emerald-500' },
    { label: '文旅宣传', value: stats?.byType?.tourism_promo || 0, color: 'bg-amber-500' },
  ];

  const totalTypeProjects = projectTypeData.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">欢迎回来 👋</h1>
            <p className="text-blue-100">
              AIGC 多智能体视频制作平台 - 让 AI 助您高效创作
            </p>
          </div>
          <div className="hidden md:flex items-center gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold">{stats?.totalScripts || 0}</div>
              <div className="text-sm text-blue-200">脚本总数</div>
            </div>
            <div className="w-px h-12 bg-blue-400/30" />
            <div className="text-center">
              <div className="text-3xl font-bold">{stats?.totalTasks || 0}</div>
              <div className="text-sm text-blue-200">任务总数</div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              className="bg-white rounded-xl p-5 border border-slate-200"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 ${card.bgColor} rounded-xl flex items-center justify-center`}>
                  <Icon className={`w-6 h-6 ${card.textColor}`} />
                </div>
                <span className="text-xs text-slate-400 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  +12%
                </span>
              </div>
              <div className="text-2xl font-bold text-slate-800 mb-1">
                {loading ? '-' : card.value}
              </div>
              <div className="text-sm text-slate-500">{card.label}</div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Project Types */}
        <div className="bg-white rounded-xl p-6 border border-slate-200">
          <h3 className="font-semibold text-slate-800 mb-4">项目类型分布</h3>
          <div className="space-y-4">
            {projectTypeData.map((item, idx) => (
              <div key={idx}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-slate-600">{item.label}</span>
                  <span className="font-medium text-slate-800">
                    {item.value} 个
                    <span className="text-slate-400 ml-1">
                      ({totalTypeProjects > 0 ? Math.round((item.value / totalTypeProjects) * 100) : 0}%)
                    </span>
                  </span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${item.color} rounded-full transition-all`}
                    style={{
                      width: totalTypeProjects > 0 ? `${(item.value / totalTypeProjects) * 100}%` : '0%',
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Projects */}
        <div className="lg:col-span-2 bg-white rounded-xl p-6 border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-800">最近项目</h3>
            <a href="#/projects" className="text-sm text-blue-600 hover:text-blue-700">
              查看全部
            </a>
          </div>
          <div className="space-y-3">
            {stats?.recentProjects?.length > 0 ? (
              stats.recentProjects.map((project: any) => (
                <div
                  key={project.id}
                  className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-lg transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                      <Film className="w-5 h-5 text-slate-500" />
                    </div>
                    <div>
                      <div className="font-medium text-slate-800 text-sm">
                        {project.name}
                      </div>
                      <div className="text-xs text-slate-500">
                        {getProjectTypeLabel(project.type)}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-sm font-medium text-slate-700">
                        {project.progress}%
                      </div>
                      <div className="w-20 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-500 rounded-full"
                          style={{ width: `${project.progress}%` }}
                        />
                      </div>
                    </div>
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${getStatusStyle(
                        project.status
                      )}`}
                    >
                      {getStatusLabel(project.status)}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-slate-400">
                <Clock className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>暂无项目</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl p-6 border border-slate-200">
        <h3 className="font-semibold text-slate-800 mb-4">快速开始</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              title: '短剧生产',
              desc: 'AI 生成短剧剧本、分镜、配音、剪辑全流程',
              type: 'short_drama',
              gradient: 'from-blue-500 to-cyan-500',
            },
            {
              title: '企业视频营销',
              desc: '企业宣传片、产品视频、营销视频一站式制作',
              type: 'corporate_video',
              gradient: 'from-emerald-500 to-teal-500',
            },
            {
              title: '文旅宣传',
              desc: '地方文旅宣传片、景点介绍、民俗文化视频',
              type: 'tourism_promo',
              gradient: 'from-amber-500 to-orange-500',
            },
          ].map((item, idx) => (
            <a
              key={idx}
              href="#/projects/new"
              className="group p-5 border border-slate-200 rounded-xl hover:border-slate-300 hover:shadow-md transition-all"
            >
              <div
                className={`w-12 h-12 rounded-xl bg-gradient-to-br ${item.gradient} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}
              >
                <Zap className="w-6 h-6 text-white" />
              </div>
              <h4 className="font-semibold text-slate-800 mb-1">{item.title}</h4>
              <p className="text-sm text-slate-500">{item.desc}</p>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}

function getProjectTypeLabel(type: string) {
  const map: Record<string, string> = {
    short_drama: '短剧生产',
    corporate_video: '企业视频',
    tourism_promo: '文旅宣传',
  };
  return map[type] || type;
}

function getStatusLabel(status: string) {
  const map: Record<string, string> = {
    draft: '草稿',
    planning: '规划中',
    in_production: '制作中',
    review: '审核中',
    completed: '已完成',
    cancelled: '已取消',
  };
  return map[status] || status;
}

function getStatusStyle(status: string) {
  const map: Record<string, string> = {
    draft: 'bg-slate-100 text-slate-600',
    planning: 'bg-blue-100 text-blue-600',
    in_production: 'bg-amber-100 text-amber-600',
    review: 'bg-purple-100 text-purple-600',
    completed: 'bg-emerald-100 text-emerald-600',
    cancelled: 'bg-red-100 text-red-600',
  };
  return map[status] || 'bg-slate-100 text-slate-600';
}
