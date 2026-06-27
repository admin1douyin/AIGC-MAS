import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Film,
  Plus,
  Search,
  Filter,
  Play,
  Pause,
  Trash2,
  Eye,
} from 'lucide-react';
import { projectApi, Project } from '../services/projectApi';

export default function Projects() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    loadProjects();
  }, [page, typeFilter, statusFilter, searchQuery]);

  const loadProjects = async () => {
    setLoading(true);
    try {
      const res: any = await projectApi.list({
        page,
        pageSize: 10,
        type: typeFilter || undefined,
        status: statusFilter || undefined,
        search: searchQuery || undefined,
      });
      if (res.success) {
        setProjects(res.data.items);
        setTotal(res.data.total);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    setSearchQuery(search);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除这个项目吗？')) return;
    try {
      await projectApi.delete(id);
      loadProjects();
    } catch (e) {
      console.error(e);
    }
  };

  const handleStart = async (id: string) => {
    try {
      await projectApi.start(id);
      loadProjects();
    } catch (e) {
      console.error(e);
    }
  };

  const handlePause = async (id: string) => {
    try {
      await projectApi.pause(id);
      loadProjects();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">项目管理</h1>
          <p className="text-text-secondary mt-1">管理所有视频制作项目</p>
        </div>
        <button
          onClick={() => navigate('/app/projects/new')}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          新建项目
        </button>
      </div>

      <div className="card-surface p-4">
        <div className="flex flex-wrap items-center gap-4">
          <form onSubmit={handleSearch} className="flex-1 min-w-[200px] max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary" />
              <input
                type="text"
                placeholder="搜索项目名称..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
          </form>

          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-text-tertiary" />
            <select
              value={typeFilter}
              onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}
              className="px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-bg"
            >
              <option value="">全部类型</option>
              <option value="short_drama">短剧生产</option>
              <option value="corporate_video">企业视频</option>
              <option value="tourism_promo">文旅宣传</option>
            </select>
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              className="px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-bg"
            >
              <option value="">全部状态</option>
              <option value="draft">草稿</option>
              <option value="planning">规划中</option>
              <option value="in_production">制作中</option>
              <option value="review">审核中</option>
              <option value="completed">已完成</option>
            </select>
          </div>
        </div>
      </div>

      <div className="card-surface overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-text-tertiary">加载中...</div>
        ) : projects.length === 0 ? (
          <div className="p-12 text-center">
            <Film className="w-16 h-16 text-border mx-auto mb-4" />
            <p className="text-text-secondary mb-4">暂无项目</p>
            <button
              onClick={() => navigate('/app/projects/new')}
              className="text-primary hover:text-primary-hover font-medium"
            >
              创建第一个项目
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-bg-elevated border-b border-border">
                <tr>
                  <th className="text-left px-6 py-3 text-xs font-medium text-text-secondary uppercase tracking-wider">
                    项目
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-text-secondary uppercase tracking-wider">
                    类型
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-text-secondary uppercase tracking-wider">
                    进度
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-text-secondary uppercase tracking-wider">
                    状态
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-text-secondary uppercase tracking-wider">
                    创建时间
                  </th>
                  <th className="text-right px-6 py-3 text-xs font-medium text-text-secondary uppercase tracking-wider">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {projects.map((project) => (
                  <tr key={project.id} className="hover:bg-bg-elevated">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-primary-light flex items-center justify-center">
                          <Film className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <div
                            className="font-medium text-text-primary cursor-pointer hover:text-primary"
                            onClick={() => navigate(`/app/projects/${project.id}`)}
                          >
                            {project.name}
                          </div>
                          <div className="text-xs text-text-secondary truncate max-w-xs">
                            {project.description}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeStyle(project.type)}`}>
                        {getTypeLabel(project.type)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-2 bg-bg-surface rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary rounded-full"
                            style={{ width: `${project.progress}%` }}
                          />
                        </div>
                        <span className="text-sm text-text-secondary">{project.progress}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusStyle(project.status)}`}>
                        {getStatusLabel(project.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-text-secondary">
                      {new Date(project.createdAt).toLocaleDateString('zh-CN')}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => navigate(`/app/projects/${project.id}`)}
                          className="p-1.5 text-text-tertiary hover:text-primary hover:bg-primary-bg rounded transition-colors"
                          title="查看"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {project.status === 'draft' || project.status === 'planning' ? (
                          <button
                            onClick={() => handleStart(project.id)}
                            className="p-1.5 text-text-tertiary hover:text-state-success hover:bg-teal/10 rounded transition-colors"
                            title="启动"
                          >
                            <Play className="w-4 h-4" />
                          </button>
                        ) : project.status === 'in_production' ? (
                          <button
                            onClick={() => handlePause(project.id)}
                            className="p-1.5 text-text-tertiary hover:text-state-warning hover:bg-amber-50 rounded transition-colors"
                            title="暂停"
                          >
                            <Pause className="w-4 h-4" />
                          </button>
                        ) : null}
                        <button
                          onClick={() => handleDelete(project.id)}
                          className="p-1.5 text-text-tertiary hover:text-state-error hover:bg-red-50 rounded transition-colors"
                          title="删除"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {total > 10 && (
          <div className="px-6 py-4 border-t border-border flex items-center justify-between">
            <div className="text-sm text-text-secondary">
              共 {total} 个项目
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="px-3 py-1.5 border border-border rounded text-sm text-text-secondary hover:bg-bg-elevated disabled:opacity-50 disabled:cursor-not-allowed"
              >
                上一页
              </button>
              <span className="text-sm text-text-secondary">第 {page} 页</span>
              <button
                onClick={() => setPage(page + 1)}
                disabled={page * 10 >= total}
                className="px-3 py-1.5 border border-border rounded text-sm text-text-secondary hover:bg-bg-elevated disabled:opacity-50 disabled:cursor-not-allowed"
              >
                下一页
              </button>
            </div>
          </div>
        )}
      </div>
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
    short_drama: 'bg-primary-bg text-primary',
    corporate_video: 'bg-teal/10 text-teal',
    tourism_promo: 'bg-warm/10 text-warm',
  };
  return map[type] || 'bg-bg-surface text-text-secondary';
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