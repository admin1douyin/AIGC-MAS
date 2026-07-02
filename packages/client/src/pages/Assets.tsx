import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Home,
  FolderOpen,
  User,
  Plus,
  MoreHorizontal,
  Sparkles,
  Search,
  Upload,
  Download,
  CheckSquare,
  Gift,
  Video,
  Bell,
  Settings,
  X,
  Trash2,
  Loader2,
  Image,
  FileText,
  Music,
  Film,
} from 'lucide-react';
import api from '../services/api';
import { projectApi } from '../services/projectApi';
import { authApi, type Subscription } from '../services/authApi';
import { useAuth } from '../lib/AuthContext';

interface Asset {
  id: string;
  projectId: string;
  type: 'video' | 'image' | 'audio' | 'document';
  name: string;
  url: string;
  duration: number | null;
  metadata: string | null;
  tags: string | null;
  category: string | null;
  createdBy: string | null;
  createdAt: string;
  updatedAt: string;
}

const navItems = [
  { key: 'home', label: '首页', icon: Home },
  { key: 'assets', label: '资产库', icon: FolderOpen },
  { key: 'ai_actors', label: 'AI演员', icon: User },
];

const assetTabs = [
  { key: 'projects', label: '我的项目' },
  { key: 'scripts', label: '我的剧本' },
];

const typeFilters = [
  { key: 'all', label: '全部', icon: null },
  { key: 'image', label: '图片', icon: Image },
  { key: 'video', label: '视频', icon: Film },
  { key: 'audio', label: '音频', icon: Music },
  { key: 'document', label: '文档', icon: FileText },
];

function getTypeIcon(type: string) {
  switch (type) {
    case 'video': return Film;
    case 'image': return Image;
    case 'audio': return Music;
    case 'document': return FileText;
    default: return Image;
  }
}

export default function Assets() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const batchFileInputRef = useRef<HTMLInputElement>(null);

  const [activeNav, setActiveNav] = useState('assets');
  const [activeTab, setActiveTab] = useState('projects');
  const [activeType, setActiveType] = useState('all');
  const [activeCategory, setActiveCategory] = useState('');
  const [selectedProject, setSelectedProject] = useState('');
  const [selectedAssets, setSelectedAssets] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Data states
  const [projects, setProjects] = useState<any[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [, setTags] = useState<string[]>([]);
  const [subscription, setSubscription] = useState<Subscription | null>(null);

  // UI states
  const [loading, setLoading] = useState(true);
  const [assetsLoading, setAssetsLoading] = useState(false);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Upload form states
  const [uploadName, setUploadName] = useState('');
  const [uploadCategory, setUploadCategory] = useState('');
  const [uploadTags, setUploadTags] = useState('');
  const [uploadType, setUploadType] = useState<'video' | 'image' | 'audio' | 'document'>('image');
  const [uploadFile, setUploadFile] = useState<File | null>(null);

  // Load projects and subscription on mount
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      const [projectsRes, subRes] = await Promise.all([
        projectApi.list({ page: 1, pageSize: 100 }),
        authApi.getSubscription(),
      ]);
      if (projectsRes.success) {
        const projectList = projectsRes.data.items || [];
        setProjects(projectList);
        if (projectList.length > 0 && !selectedProject) {
          setSelectedProject(projectList[0].id);
        }
      }
      if (subRes.success && subRes.data) {
        setSubscription(subRes.data);
      }
    } catch (e) {
      console.error(e);
      setError('加载项目失败');
    } finally {
      setLoading(false);
    }
  };

  // Load assets when project, type, category, or search changes
  const loadAssets = useCallback(async () => {
    if (!selectedProject) {
      setAssets([]);
      return;
    }
    setAssetsLoading(true);
    setError('');
    try {
      const params: Record<string, string> = { projectId: selectedProject };
      if (activeType !== 'all') params.type = activeType;
      if (activeCategory) params.category = activeCategory;
      if (searchQuery) params.search = searchQuery;

      const [assetsRes, categoriesRes] = await Promise.all([
        api.get('/assets', { params }),
        api.get('/assets/categories', { params: { projectId: selectedProject } }),
      ]);

      const assetsData = assetsRes as any;
      const categoriesData = categoriesRes as any;
      if (assetsData?.success) {
        setAssets(assetsData.data || []);
      } else {
        setAssets([]);
      }
      if (categoriesData?.success) {
        setCategories(categoriesData.data || []);
      }
    } catch (e: any) {
      console.error(e);
      setError(e?.response?.data?.error || '加载资产失败');
      setAssets([]);
    } finally {
      setAssetsLoading(false);
    }
  }, [selectedProject, activeType, activeCategory, searchQuery]);

  useEffect(() => {
    loadAssets();
  }, [loadAssets]);

  // Load tags when project changes
  useEffect(() => {
    if (!selectedProject) {
      setTags([]);
      return;
    }
    api.get('/assets/tags', { params: { projectId: selectedProject } })
      .then((res: any) => {
        if (res?.success) setTags(res.data || []);
      })
      .catch(() => {});
  }, [selectedProject]);

  const handleNavClick = (key: string) => {
    setActiveNav(key);
    if (key === 'home') {
      navigate('/app');
    } else if (key === 'ai_actors') {
      navigate('/app/ai-actors');
    }
  };

  const toggleAssetSelection = (id: string) => {
    setSelectedAssets((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedAssets.length === assets.length) {
      setSelectedAssets([]);
    } else {
      setSelectedAssets(assets.map((a) => a.id));
    }
  };

  const handleUpload = async () => {
    if (!uploadFile || !selectedProject) return;
    setUploading(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('file', uploadFile);
      formData.append('projectId', selectedProject);
      formData.append('type', uploadType);
      formData.append('name', uploadName || uploadFile.name);
      if (uploadCategory) formData.append('category', uploadCategory);
      if (uploadTags) formData.append('tags', uploadTags);

      const res = await api.post('/assets/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if ((res as any)?.success) {
        setShowUploadDialog(false);
        resetUploadForm();
        loadAssets();
      } else {
        setError('上传失败');
      }
    } catch (e: any) {
      console.error(e);
      setError(e?.response?.data?.error || '上传失败');
    } finally {
      setUploading(false);
    }
  };

  const handleBatchUpload = async (files: FileList) => {
    if (!files.length || !selectedProject) return;
    setUploading(true);
    setError('');
    try {
      const formData = new FormData();
      Array.from(files).forEach((file) => {
        formData.append('files', file);
      });
      formData.append('projectId', selectedProject);
      formData.append('type', uploadType);
      if (uploadCategory) formData.append('category', uploadCategory);
      if (uploadTags) formData.append('tags', uploadTags);

      const res = await api.post('/assets/upload/batch', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if ((res as any)?.success) {
        loadAssets();
      } else {
        setError('批量上传失败');
      }
    } catch (e: any) {
      console.error(e);
      setError(e?.response?.data?.error || '批量上传失败');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeleteLoading(true);
    setError('');
    try {
      const res = await api.delete(`/assets/${id}`);
      if ((res as any)?.success || res === undefined) {
        setShowDeleteConfirm(null);
        setSelectedAssets((prev) => prev.filter((a) => a !== id));
        loadAssets();
      } else {
        setError('删除失败');
      }
    } catch (e: any) {
      console.error(e);
      setError(e?.response?.data?.error || '删除失败');
    } finally {
      setDeleteLoading(false);
    }
  };

  const resetUploadForm = () => {
    setUploadName('');
    setUploadCategory('');
    setUploadTags('');
    setUploadType('image');
    setUploadFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const parseTags = (tagsStr: string | null): string[] => {
    if (!tagsStr) return [];
    try {
      return JSON.parse(tagsStr);
    } catch {
      return [];
    }
  };

  const getAssetThumbnail = (asset: Asset) => {
    if (asset.type === 'image') return asset.url;
    return '';
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

            <div className="space-y-0.5">
              {loading ? (
                <div className="px-3 py-4 flex items-center gap-2 text-white/40 text-xs">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  加载中...
                </div>
              ) : projects.length === 0 ? (
                <div className="px-3 py-4 text-white/40 text-xs">暂无项目</div>
              ) : (
                projects.map((project) => (
                  <button
                    key={project.id}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-lg group transition-colors hover:bg-white/5"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-1 h-1 rounded-full bg-pink-400" />
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
                ))
              )}
            </div>
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
              {user?.email?.[0]?.toUpperCase() || 'U'}
            </div>
          </div>
        </header>

        {/* Asset Library Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Project list sidebar */}
          <div className="w-48 border-r border-white/10 bg-black/30 overflow-y-auto py-4 px-2">
            <div className="text-white/40 text-xs mb-2 px-2">项目</div>
            {loading ? (
              <div className="px-3 py-4 flex items-center gap-2 text-white/40 text-xs">
                <Loader2 className="w-3 h-3 animate-spin" />
                加载中...
              </div>
            ) : projects.length === 0 ? (
              <div className="px-3 py-4 text-white/40 text-xs">暂无项目</div>
            ) : (
              projects.map((project) => (
                <button
                  key={project.id}
                  onClick={() => setSelectedProject(project.id)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                    selectedProject === project.id
                      ? 'bg-pink-500/20 text-pink-400'
                      : 'text-white/60 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  {project.name}
                </button>
              ))
            )}
          </div>

          {/* Main asset area */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Header with tabs */}
            <div className="px-6 py-4 border-b border-white/10">
              <div className="flex items-center gap-2 mb-4">
                {assetTabs.map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`px-4 py-1.5 text-sm font-medium rounded-full transition-colors ${
                      activeTab === tab.key
                        ? 'bg-pink-500 text-white'
                        : 'text-white/60 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Type filters + category + search */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  {typeFilters.map((tf) => {
                    const Icon = tf.icon;
                    return (
                      <button
                        key={tf.key}
                        onClick={() => setActiveType(tf.key)}
                        className={`px-3 py-1 text-sm font-medium rounded-full transition-colors flex items-center gap-1.5 ${
                          activeType === tf.key
                            ? 'bg-pink-500 text-white'
                            : 'text-white/60 hover:text-white hover:bg-white/5'
                        }`}
                      >
                        {Icon && <Icon className="w-3.5 h-3.5" />}
                        {tf.label}
                      </button>
                    );
                  })}
                </div>

                {/* Category dropdown */}
                {categories.length > 0 && (
                  <select
                    value={activeCategory}
                    onChange={(e) => setActiveCategory(e.target.value)}
                    className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-white text-sm focus:outline-none focus:border-pink-500/50 appearance-none cursor-pointer"
                  >
                    <option value="" className="bg-zinc-900">全部分类</option>
                    {categories.map((cat) => (
                      <option key={cat} value={cat} className="bg-zinc-900">{cat}</option>
                    ))}
                  </select>
                )}

                <div className="flex-1" />
                <div className="relative">
                  <Search className="w-4 h-4 text-white/40 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="搜索"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 pr-4 py-1.5 bg-white/5 border border-white/10 rounded-full text-white text-sm focus:outline-none focus:border-pink-500/50 w-40"
                  />
                </div>
              </div>
            </div>

            {/* Error banner */}
            {error && (
              <div className="mx-6 mt-4 px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center justify-between">
                <span className="text-red-400 text-sm">{error}</span>
                <button onClick={() => setError('')} className="text-red-400 hover:text-red-300">
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Asset grid */}
            <div className="flex-1 overflow-y-auto p-6">
              {!selectedProject ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <FolderOpen className="w-12 h-12 text-white/20 mx-auto mb-3" />
                    <p className="text-white/40 text-sm">请选择一个项目查看资产</p>
                  </div>
                </div>
              ) : assetsLoading ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div
                      key={i}
                      className="aspect-square rounded-lg bg-white/5 animate-pulse border border-white/5"
                    />
                  ))}
                </div>
              ) : assets.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <FolderOpen className="w-12 h-12 text-white/20 mx-auto mb-3" />
                    <p className="text-white/40 text-sm">暂无资产</p>
                    <button
                      onClick={() => setShowUploadDialog(true)}
                      className="mt-3 px-4 py-2 bg-pink-500/20 text-pink-400 text-sm font-medium rounded-full hover:bg-pink-500/30 transition-colors"
                    >
                      上传素材
                    </button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                  {assets.map((asset) => {
                    const TypeIcon = getTypeIcon(asset.type);
                    const thumbnail = getAssetThumbnail(asset);
                    const assetTags = parseTags(asset.tags);

                    return (
                      <div
                        key={asset.id}
                        onClick={() => toggleAssetSelection(asset.id)}
                        className={`group relative aspect-square rounded-lg overflow-hidden border-2 cursor-pointer transition-all ${
                          selectedAssets.includes(asset.id)
                            ? 'border-pink-500'
                            : 'border-transparent hover:border-white/20'
                        }`}
                      >
                        {thumbnail ? (
                          <img
                            src={thumbnail}
                            alt={asset.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-white/5 flex items-center justify-center">
                            <TypeIcon className="w-8 h-8 text-white/30" />
                          </div>
                        )}
                        {asset.type === 'video' && asset.duration && (
                          <div className="absolute top-2 left-2 px-1.5 py-0.5 bg-black/60 rounded text-white/80 text-xs">
                            {Math.round(asset.duration)}s
                          </div>
                        )}
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
                          <div className="flex items-center justify-between">
                            <span className="text-white text-sm truncate">{asset.name}</span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setShowDeleteConfirm(asset.id);
                              }}
                              className="p-1 text-white/40 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                          {asset.category && (
                            <span className="text-white/40 text-xs">{asset.category}</span>
                          )}
                          {assetTags.length > 0 && (
                            <div className="flex gap-1 mt-1 flex-wrap">
                              {assetTags.slice(0, 3).map((tag: string) => (
                                <span key={tag} className="px-1.5 py-0.5 bg-white/10 rounded text-white/50 text-[10px]">
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                        {selectedAssets.includes(asset.id) && (
                          <div className="absolute top-2 right-2 w-5 h-5 bg-pink-500 rounded-full flex items-center justify-center">
                            <CheckSquare className="w-3 h-3 text-white" />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-3 border-t border-white/10 flex items-center justify-between">
              <button
                onClick={() => setShowUploadDialog(true)}
                className="flex items-center gap-2 px-4 py-2 bg-pink-500/20 text-pink-400 text-sm font-medium rounded-full hover:bg-pink-500/30 transition-colors"
              >
                <Upload className="w-4 h-4" />
                导入素材
              </button>
              <div className="flex items-center gap-3">
                <span className="text-white/40 text-xs">
                  已选择 {selectedAssets.length} 项
                </span>
                <button
                  onClick={toggleSelectAll}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-white/60 hover:text-white text-sm transition-colors"
                >
                  <CheckSquare className="w-4 h-4" />
                  全选
                </button>
                <button className="flex items-center gap-1.5 px-3 py-1.5 text-white/60 hover:text-white text-sm transition-colors">
                  <Plus className="w-4 h-4" />
                  批量添加到项目
                </button>
                <button
                  onClick={() => batchFileInputRef.current?.click()}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-white/60 hover:text-white text-sm transition-colors"
                >
                  <Download className="w-4 h-4" />
                  批量上传
                </button>
                <input
                  ref={batchFileInputRef}
                  type="file"
                  multiple
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files.length > 0) {
                      handleBatchUpload(e.target.files);
                      e.target.value = '';
                    }
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Upload Dialog */}
      {showUploadDialog && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-zinc-900 border border-white/10 rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-white text-lg font-semibold">上传素材</h2>
              <button
                onClick={() => { setShowUploadDialog(false); resetUploadForm(); }}
                className="text-white/40 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* File selector */}
              <div>
                <label className="block text-white/60 text-sm mb-1.5">选择文件</label>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-white/10 rounded-lg p-6 text-center cursor-pointer hover:border-pink-500/30 transition-colors"
                >
                  {uploadFile ? (
                    <div className="text-white text-sm">{uploadFile.name}</div>
                  ) : (
                    <>
                      <Upload className="w-8 h-8 text-white/20 mx-auto mb-2" />
                      <p className="text-white/40 text-sm">点击选择文件</p>
                    </>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setUploadFile(e.target.files[0]);
                      if (!uploadName) setUploadName(e.target.files[0].name);
                    }
                  }}
                />
              </div>

              {/* Name */}
              <div>
                <label className="block text-white/60 text-sm mb-1.5">名称</label>
                <input
                  type="text"
                  value={uploadName}
                  onChange={(e) => setUploadName(e.target.value)}
                  placeholder="素材名称"
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-pink-500/50"
                />
              </div>

              {/* Type */}
              <div>
                <label className="block text-white/60 text-sm mb-1.5">类型</label>
                <select
                  value={uploadType}
                  onChange={(e) => setUploadType(e.target.value as Asset['type'])}
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-pink-500/50 appearance-none"
                >
                  <option value="image" className="bg-zinc-900">图片</option>
                  <option value="video" className="bg-zinc-900">视频</option>
                  <option value="audio" className="bg-zinc-900">音频</option>
                  <option value="document" className="bg-zinc-900">文档</option>
                </select>
              </div>

              {/* Category */}
              <div>
                <label className="block text-white/60 text-sm mb-1.5">分类</label>
                <input
                  type="text"
                  value={uploadCategory}
                  onChange={(e) => setUploadCategory(e.target.value)}
                  placeholder="如：人物、场景、道具"
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-pink-500/50"
                />
              </div>

              {/* Tags */}
              <div>
                <label className="block text-white/60 text-sm mb-1.5">标签（逗号分隔）</label>
                <input
                  type="text"
                  value={uploadTags}
                  onChange={(e) => setUploadTags(e.target.value)}
                  placeholder="标签1,标签2,标签3"
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-pink-500/50"
                />
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={() => { setShowUploadDialog(false); resetUploadForm(); }}
                  className="px-4 py-2 text-white/60 hover:text-white text-sm transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={handleUpload}
                  disabled={!uploadFile || uploading}
                  className="px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-500 text-white text-sm font-medium rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {uploading && <Loader2 className="w-4 h-4 animate-spin" />}
                  {uploading ? '上传中...' : '上传'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-zinc-900 border border-white/10 rounded-2xl p-6 w-full max-w-sm shadow-2xl">
            <h2 className="text-white text-lg font-semibold mb-2">确认删除</h2>
            <p className="text-white/60 text-sm mb-6">确定要删除此资产吗？此操作无法撤销。</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="px-4 py-2 text-white/60 hover:text-white text-sm transition-colors"
              >
                取消
              </button>
              <button
                onClick={() => handleDelete(showDeleteConfirm)}
                disabled={deleteLoading}
                className="px-4 py-2 bg-red-500/80 text-white text-sm font-medium rounded-lg hover:bg-red-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {deleteLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                删除
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
