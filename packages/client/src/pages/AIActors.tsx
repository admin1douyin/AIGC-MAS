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
  Gift,
  Video,
  Bell,
  Settings,
  Download,
  Star,
} from 'lucide-react';

const navItems = [
  { key: 'home', label: '首页', icon: Home },
  { key: 'assets', label: '资产库', icon: FolderOpen },
  { key: 'ai_actors', label: 'AI演员', icon: User },
];

const actorCategories = [
  { key: 'all', label: '全部' },
  { key: 'male', label: '男性' },
  { key: 'female', label: '女性' },
  { key: 'anime', label: '动漫' },
  { key: 'realistic', label: '写实' },
];

const mockActors = [
  {
    id: '1',
    name: '林小雨',
    category: 'female',
    style: 'realistic',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&h=400&fit=crop',
    rating: 4.8,
    uses: 1234,
  },
  {
    id: '2',
    name: '张明远',
    category: 'male',
    style: 'realistic',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=400&fit=crop',
    rating: 4.7,
    uses: 987,
  },
  {
    id: '3',
    name: '樱花少女',
    category: 'female',
    style: 'anime',
    image: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=300&h=400&fit=crop',
    rating: 4.9,
    uses: 2345,
  },
  {
    id: '4',
    name: '武士少年',
    category: 'male',
    style: 'anime',
    image: 'https://images.unsplash.com/photo-1612036782180-6f0b6cd846fe?w=300&h=400&fit=crop',
    rating: 4.6,
    uses: 876,
  },
  {
    id: '5',
    name: '职场精英',
    category: 'female',
    style: 'realistic',
    image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&h=400&fit=crop',
    rating: 4.5,
    uses: 654,
  },
  {
    id: '6',
    name: '阳光男孩',
    category: 'male',
    style: 'realistic',
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&h=400&fit=crop',
    rating: 4.7,
    uses: 1123,
  },
  {
    id: '7',
    name: '精灵公主',
    category: 'female',
    style: 'anime',
    image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&h=400&fit=crop',
    rating: 4.8,
    uses: 1876,
  },
  {
    id: '8',
    name: '侠客行',
    category: 'male',
    style: 'anime',
    image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=300&h=400&fit=crop',
    rating: 4.6,
    uses: 765,
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

export default function AIActors() {
  const navigate = useNavigate();
  const [activeNav, setActiveNav] = useState('ai_actors');
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const handleNavClick = (key: string) => {
    setActiveNav(key);
    if (key === 'home') {
      navigate('/app');
    } else if (key === 'assets') {
      navigate('/app/assets');
    }
  };

  const filteredActors = mockActors.filter((actor) => {
    const matchesCategory =
      activeCategory === 'all' ||
      actor.category === activeCategory ||
      actor.style === activeCategory;
    const matchesSearch = actor.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

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

        {/* AI Actors Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="px-6 py-4 border-b border-white/10">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-white text-xl font-bold">AI演员库</h1>
                <p className="text-white/50 text-sm mt-1">选择适合您视频的AI演员形象</p>
              </div>
              <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-500 text-white text-sm font-medium rounded-full hover:opacity-90 transition-opacity">
                <Plus className="w-4 h-4" />
                创建演员
              </button>
            </div>

            {/* Category tabs + search */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                {actorCategories.map((cat) => (
                  <button
                    key={cat.key}
                    onClick={() => setActiveCategory(cat.key)}
                    className={`px-4 py-1.5 text-sm font-medium rounded-full transition-colors ${
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
                  placeholder="搜索演员..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-4 py-1.5 bg-white/5 border border-white/10 rounded-full text-white text-sm focus:outline-none focus:border-pink-500/50 w-48"
                />
              </div>
            </div>
          </div>

          {/* Actors Grid */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {filteredActors.map((actor) => (
                <div
                  key={actor.id}
                  className="group relative rounded-xl overflow-hidden bg-white/5 border border-white/10 hover:border-pink-500/50 transition-all cursor-pointer"
                >
                  {/* Image */}
                  <div className="aspect-[3/4] relative overflow-hidden">
                    <img
                      src={actor.image}
                      alt={actor.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                    {/* Top badge */}
                    <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 bg-black/50 backdrop-blur rounded-full">
                      <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                      <span className="text-white text-xs font-medium">{actor.rating}</span>
                    </div>

                    {/* Bottom info */}
                    <div className="absolute bottom-0 left-0 right-0 p-3">
                      <h3 className="text-white font-semibold mb-1">{actor.name}</h3>
                      <div className="flex items-center justify-between">
                        <span className="text-white/60 text-xs">使用 {actor.uses} 次</span>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button className="p-1.5 bg-white/20 backdrop-blur rounded-full hover:bg-white/30 transition-colors">
                            <Download className="w-3.5 h-3.5 text-white" />
                          </button>
                          <button className="p-1.5 bg-pink-500 backdrop-blur rounded-full hover:bg-pink-600 transition-colors">
                            <Plus className="w-3.5 h-3.5 text-white" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
