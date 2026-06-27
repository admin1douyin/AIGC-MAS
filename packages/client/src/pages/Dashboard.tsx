import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  const navigate = useNavigate();
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
      gradient: 'from-primary to-primary-light',
    },
    {
      label: '进行中',
      value: stats?.inProgressProjects || 0,
      icon: Play,
      gradient: 'from-warm to-amber-400',
    },
    {
      label: '已完成',
      value: stats?.completedProjects || 0,
      icon: CheckCircle,
      gradient: 'from-teal to-green-400',
    },
    {
      label: '智能体',
      value: stats?.totalAgents || 0,
      icon: Bot,
      gradient: 'from-primary to-teal',
    },
  ];

  const projectTypeData = [
    { label: '短剧生产', value: stats?.byType?.short_drama || 0, color: 'bg-primary' },
    { label: '企业视频', value: stats?.byType?.corporate_video || 0, color: 'bg-teal' },
    { label: '文旅宣传', value: stats?.byType?.tourism_promo || 0, color: 'bg-warm' },
  ];

  const totalTypeProjects = projectTypeData.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="space-y-6">
      <div className="card-surface p-6 bg-gradient-primary">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white mb-2">欢迎回来 👋</h1>
            <p className="text-white/80">
              AIGC 多智能体视频制作平台 - 让 AI 助您高效创作
            </p>
          </div>
          <div className="hidden md:flex items-center gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-white">{stats?.totalScripts || 0}</div>
              <div className="text-sm text-white/70">脚本总数</div>
            </div>
            <div className="w-px h-12 bg-white/20" />
            <div className="text-center">
              <div className="text-3xl font-bold text-white">{stats?.totalTasks || 0}</div>
              <div className="text-sm text-white/70">任务总数</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              className="card-surface p-5"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${card.gradient} flex items-center justify-center`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <span className="text-xs text-text-secondary flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  +12%
                </span>
              </div>
              <div className="text-2xl font-bold text-text-primary mb-1">
                {loading ? '-' : card.value}
              </div>
              <div className="text-sm text-text-secondary">{card.label}</div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card-surface p-6">
          <h3 className="font-semibold text-text-primary mb-4">项目类型分布</h3>
          <div className="space-y-4">
            {projectTypeData.map((item, idx) => (
              <div key={idx}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-text-secondary">{item.label}</span>
                  <span className="font-medium text-text-primary">
                    {item.value} 个
                    <span className="text-text-tertiary ml-1">
                      ({totalTypeProjects > 0 ? Math.round((item.value / totalTypeProjects) * 100) : 0}%)
                    </span>
                  </span>
                </div>
                <div className="h-2 bg-bg-surface rounded-full overflow-hidden">
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

        <div className="lg:col-span-2 card-surface p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-text-primary">最近项目</h3>
            <button onClick={() => navigate('/app/projects')} className="text-sm text-primary hover:text-primary-hover transition-colors">
              查看全部
            </button>
          </div>
          <div className="space-y-3">
            {stats?.recentProjects?.length > 0 ? (
              stats.recentProjects.map((project: any) => (
                <div
                  key={project.id}
                  onClick={() => navigate(`/app/projects/${project.id}`)}
                  className="flex items-center justify-between p-3 hover:bg-bg-surface rounded-lg transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-primary-light flex items-center justify-center">
                      <Film className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <div className="font-medium text-text-primary text-sm">
                        {project.name}
                      </div>
                      <div className="text-xs text-text-secondary">
                        {getProjectTypeLabel(project.type)}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-sm font-medium text-text-primary">
                        {project.progress}%
                      </div>
                      <div className="w-20 h-1.5 bg-bg-surface rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full"
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
              <div className="text-center py-8 text-text-tertiary">
                <Clock className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>暂无项目</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="card-surface p-6">
        <h3 className="font-semibold text-text-primary mb-4">快速开始</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              title: '短剧生产',
              desc: 'AI 生成短剧剧本、分镜、配音、剪辑全流程',
              type: 'short_drama',
              gradient: 'from-primary to-primary-light',
            },
            {
              title: '企业视频营销',
              desc: '企业宣传片、产品视频、营销视频一站式制作',
              type: 'corporate_video',
              gradient: 'from-teal to-green-400',
            },
            {
              title: '文旅宣传',
              desc: '地方文旅宣传片、景点介绍、民俗文化视频',
              type: 'tourism_promo',
              gradient: 'from-warm to-amber-400',
            },
          ].map((item, idx) => (
            <button
              key={idx}
              onClick={() => navigate('/app/projects/new')}
              className="group p-5 border border-border rounded-xl hover:border-border-hover hover:shadow-md transition-all text-left"
            >
              <div
                className={`w-12 h-12 rounded-xl bg-gradient-to-br ${item.gradient} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}
              >
                <Zap className="w-6 h-6 text-white" />
              </div>
              <h4 className="font-semibold text-text-primary mb-1">{item.title}</h4>
              <p className="text-sm text-text-secondary">{item.desc}</p>
            </button>
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
    draft: 'bg-bg-surface text-text-secondary',
    planning: 'bg-blue-50 text-blue-600',
    in_production: 'bg-amber-50 text-amber-600',
    in_review: 'bg-primary-bg text-primary',
    review: 'bg-primary-bg text-primary',
    completed: 'bg-teal/10 text-state-success',
    cancelled: 'bg-red-50 text-state-error',
    paused: 'bg-orange-50 text-state-warning',
    failed: 'bg-red-50 text-state-error',
    archived: 'bg-bg-surface text-text-tertiary',
  };
  return map[status] || 'bg-bg-surface text-text-secondary';
}