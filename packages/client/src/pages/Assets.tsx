import { useState } from 'react';
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
} from 'lucide-react';

const navItems = [
  { key: 'home', label: '首页', icon: Home },
  { key: 'assets', label: '资产库', icon: FolderOpen },
  { key: 'ai_actors', label: 'AI演员', icon: User },
];

const assetTabs = [
  { key: 'projects', label: '我的项目' },
  { key: 'scripts', label: '我的剧本' },
];

const categories = [
  { key: 'all', label: '全部' },
  { key: 'character', label: '人物' },
  { key: 'scene', label: '场景' },
  { key: 'prop', label: '道具' },
];

const mockProjects = [
  { id: '1', name: '001' },
  { id: '2', name: '002' },
  { id: '3', name: '003' },
  { id: '4', name: '测试1' },
  { id: '5', name: '测试2' },
  { id: '6', name: '测试3' },
  { id: '7', name: '测试4' },
  { id: '8', name: '测试5' },
  { id: '9', name: '测试6' },
  { id: '10', name: '测试7' },
  { id: '11', name: '测试8' },
  { id: '12', name: '测试9' },
  { id: '13', name: '测试10' },
];

const mockAssets = [
  {
    id: '1',
    name: '豆浆打包杯',
    category: 'prop',
    type: 'image',
    image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=300&h=300&fit=crop',
  },
  {
    id: '2',
    name: '外卖头盔',
    category: 'prop',
    type: 'image',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=300&fit=crop',
  },
  {
    id: '3',
    name: '早餐煎饼车',
    category: 'prop',
    type: 'image',
    image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=300&h=300&fit=crop',
  },
  {
    id: '4',
    name: '古风美女',
    category: 'character',
    type: 'image',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop',
  },
  {
    id: '5',
    name: '城市夜景',
    category: 'scene',
    type: 'image',
    image: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=300&h=300&fit=crop',
  },
  {
    id: '6',
    name: '咖啡杯',
    category: 'prop',
    type: 'image',
    image: 'https://images.unsplash.com/photo-1519710164239-da123dc03ef4?w=300&h=300&fit=crop',
  },
];

const mockSidebarProjects = [
  { id: 'p1', name: '测试狼人' },
  { id: 'p2', name: 'demo' },
  { id: 'p3', name: '123456' },
  { id: 'p4', name: '吸血鬼3' },
  { id: 'p5', name: '吸血鬼2' },
  { id: 'p6', name: '吸血鬼1' },
  { id: 'p7', name: 'test' },
  { id: 'p8', name: '测试电商' },
  { id: 'p9', name: '电商模式' },
  { id: 'p10', name: '测试10' },
];

export default function Assets() {
  const navigate = useNavigate();
  const [activeNav, setActiveNav] = useState('assets');
  const [activeTab, setActiveTab] = useState('projects');
  const [activeCategory, setActiveCategory] = useState('all');
  const [selectedProject, setSelectedProject] = useState('2');
  const [selectedAssets, setSelectedAssets] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const handleNavClick = (key: string) => {
    setActiveNav(key);
    if (key === 'home') {
      navigate('/app');
    }
  };

  const toggleAssetSelection = (id: string) => {
    setSelectedAssets((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]
    );
  };

  const filteredAssets = mockAssets.filter((asset) => {
    const matchesCategory = activeCategory === 'all' || asset.category === activeCategory;
    const matchesSearch = asset.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const toggleSelectAll = () => {
    if (selectedAssets.length === filteredAssets.length) {
      setSelectedAssets([]);
    } else {
      setSelectedAssets(filteredAssets.map((a) => a.id));
    }
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
            <span className="text-white font-bold text-base">麦预演</span>
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
              {mockSidebarProjects.map((project) => (
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
              ))}
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
            <span className="text-white font-semibold">麦预演</span>
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
              U
            </div>
          </div>
        </header>

        {/* Asset Library Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Project list sidebar */}
          <div className="w-48 border-r border-white/10 bg-black/30 overflow-y-auto py-4 px-2">
            <div className="text-white/40 text-xs mb-2 px-2">项目</div>
            {mockProjects.map((project) => (
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
            ))}
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

              {/* Category tabs + search */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  {categories.map((cat) => (
                    <button
                      key={cat.key}
                      onClick={() => setActiveCategory(cat.key)}
                      className={`px-3 py-1 text-sm font-medium rounded-full transition-colors ${
                        activeCategory === cat.key
                          ? 'bg-pink-500 text-white'
                          : 'text-white/60 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
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

            {/* Asset grid */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {filteredAssets.map((asset) => (
                  <div
                    key={asset.id}
                    onClick={() => toggleAssetSelection(asset.id)}
                    className={`group relative aspect-square rounded-lg overflow-hidden border-2 cursor-pointer transition-all ${
                      selectedAssets.includes(asset.id)
                        ? 'border-pink-500'
                        : 'border-transparent hover:border-white/20'
                    }`}
                  >
                    <img
                      src={asset.image}
                      alt={asset.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
                      <div className="flex items-center justify-between">
                        <span className="text-white text-sm">{asset.name}</span>
                        <button className="p-1 text-white/40 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity">
                          <MoreHorizontal className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    {selectedAssets.includes(asset.id) && (
                      <div className="absolute top-2 right-2 w-5 h-5 bg-pink-500 rounded-full flex items-center justify-center">
                        <CheckSquare className="w-3 h-3 text-white" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-3 border-t border-white/10 flex items-center justify-between">
              <button className="flex items-center gap-2 px-4 py-2 bg-pink-500/20 text-pink-400 text-sm font-medium rounded-full hover:bg-pink-500/30 transition-colors">
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
                <button className="flex items-center gap-1.5 px-3 py-1.5 text-white/60 hover:text-white text-sm transition-colors">
                  <Download className="w-4 h-4" />
                  批量下载
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
