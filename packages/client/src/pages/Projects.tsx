import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Film,
  Plus,
  Search,
  Filter,
  MoreVertical,
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
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    loadProjects();
  }, [page, typeFilter, statusFilter]);

  const loadProjects = async () => {
    setLoading(true);
    try {
      const res: any = await projectApi.list({
        page,
        pageSize: 10,
        type: typeFilter || undefined,
        status: statusFilter || undefined,
        search: search || undefined,
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
    loadProjects();
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">项目管理</h1>
          <p className="text-slate-500 mt-1">管理所有视频制作项目</p>
        </div>
        <button
          onClick={() => navigate('/projects/new')}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
        >
          <Plus className="w-5 h-5" />
          新建项目
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-slate-200 p-4">
        <div className="flex flex-wrap items-center gap-4">
          <form onSubmit={handleSearch} className="flex-1 min-w-[200px] max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="搜索项目名称..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </form>

          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={typeFilter}
              onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}
              className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">全部类型</option>
              <option value="short_drama">短剧生产</option>
              <option value="corporate_video">企业视频</option>
              <option value="tourism_promo">文旅宣传</option>
            </select>
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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

      {/* Project List */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400">加载中...</div>
        ) : projects.length === 0 ? (
          <div className="p-12 text-center">
            <Film className="w-16 h-16 text-slate-200 mx-auto mb-4" />
            <p className="text-slate-500 mb-4">暂无项目</p>
            <button
              onClick={() => navigate('/projects/new')}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              创建第一个项目
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">
                    项目
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">
                    类型
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">
                    进度
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">
                    状态
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">
                    创建时间
                  </th>
                  <th className="text-right px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {projects.map((project) => (
                  <tr key={project.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                          <Film className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <div
                            className="font-medium text-slate-800 cursor-pointer hover:text-blue-600"
                            onClick={() => navigate(`/projects/${project.id}`)}
                          >
                            {project.name}
                          </div>
                          <div className="text-xs text-slate-500 truncate max-w-xs">
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
                        <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-blue-500 rounded-full"
                            style={{ width: `${project.progress}%` }}
                          />
                        </div>
                        <span className="text-sm text-slate-600">{project.progress}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusStyle(project.status)}`}>
                        {getStatusLabel(project.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500">
                      {new Date(project.createdAt).toLocaleDateString('zh-CN')}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => navigate(`/projects/${project.id}`)}
                          className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                          title="查看"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {project.status === 'draft' || project.status === 'planning' ? (
                          <button
                            onClick={() => handleStart(project.id)}
                            className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded transition-colors"
                            title="启动"
                          >
                            <Play className="w-4 h-4" />
                          </button>
                        ) : project.status === 'in_production' ? (
                          <button
                            className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded transition-colors"
                            title="暂停"
                          >
                            <Pause className="w-4 h-4" />
                          </button>
                        ) : null}
                        <button
                          onClick={() => handleDelete(project.id)}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
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

        {/* Pagination */}
        {total > 10 && (
          <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between">
            <div className="text-sm text-slate-500">
              共 {total} 个项目
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="px-3 py-1.5 border border-slate-200 rounded text-sm text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                上一页
              </button>
              <span className="text-sm text-slate-600">第 {page} 页</span>
              <button
                onClick={() => setPage(page + 1)}
                disabled={page * 10 >= total}
                className="px-3 py-1.5 border border-slate-200 rounded text-sm text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
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
    review: '审核中',
    completed: '已完成',
    cancelled: '已取消',
  };
  return map[status] || status;
}

function getStatusStyle(status: string) {
  const map: Record<string, string> = {
    draft: 'bg-slate-100 text-slate-700',
    planning: 'bg-blue-100 text-blue-700',
    in_production: 'bg-amber-100 text-amber-700',
    review: 'bg-purple-100 text-purple-700',
    completed: 'bg-emerald-100 text-emerald-700',
    cancelled: 'bg-red-100 text-red-700',
  };
  return map[status] || 'bg-slate-100 text-slate-700';
}
