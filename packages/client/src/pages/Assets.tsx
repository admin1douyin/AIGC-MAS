import { useState } from 'react';
import {
  Film,
  Image,
  Music,
  FileText,
  Search,
  Upload,
  Download,
  Trash2,
  FolderOpen,
  Filter,
} from 'lucide-react';

const mockAssets = [
  {
    id: '1',
    name: '片头动画.mp4',
    type: 'video',
    size: '15.2 MB',
    duration: '00:45',
    category: '视频素材',
    createdAt: '2024-01-15',
    projectName: '企业宣传片',
  },
  {
    id: '2',
    name: '主视觉海报.png',
    type: 'image',
    size: '2.1 MB',
    resolution: '1920x1080',
    category: '图片素材',
    createdAt: '2024-01-14',
    projectName: '文旅宣传',
  },
  {
    id: '3',
    name: '背景音乐.wav',
    type: 'audio',
    size: '8.5 MB',
    duration: '02:30',
    category: '音频素材',
    createdAt: '2024-01-14',
    projectName: '短剧项目',
  },
  {
    id: '4',
    name: '剧本大纲.docx',
    type: 'document',
    size: '45 KB',
    category: '文档',
    createdAt: '2024-01-13',
    projectName: '短剧项目',
  },
  {
    id: '5',
    name: '分镜设计稿.jpg',
    type: 'image',
    size: '3.8 MB',
    resolution: '2560x1440',
    category: '图片素材',
    createdAt: '2024-01-13',
    projectName: '企业宣传片',
  },
  {
    id: '6',
    name: '配音录音.mp3',
    type: 'audio',
    size: '5.2 MB',
    duration: '01:45',
    category: '音频素材',
    createdAt: '2024-01-12',
    projectName: '文旅宣传',
  },
];

type AssetType = 'all' | 'video' | 'image' | 'audio' | 'document';

export default function Assets() {
  const [assets, setAssets] = useState(mockAssets);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<AssetType>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [uploading, setUploading] = useState(false);

  const categories = ['all', '视频素材', '图片素材', '音频素材', '文档'];

  const filteredAssets = assets.filter((asset) => {
    const matchesSearch = asset.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'all' || asset.type === filterType;
    const matchesCategory = selectedCategory === 'all' || asset.category === selectedCategory;
    return matchesSearch && matchesType && matchesCategory;
  });

  const getAssetIcon = (type: string) => {
    switch (type) {
      case 'video':
        return Film;
      case 'image':
        return Image;
      case 'audio':
        return Music;
      case 'document':
        return FileText;
      default:
        return FileText;
    }
  };

  const getTypeStyle = (type: string) => {
    switch (type) {
      case 'video':
        return 'bg-blue-100 text-blue-600';
      case 'image':
        return 'bg-emerald-100 text-emerald-600';
      case 'audio':
        return 'bg-purple-100 text-purple-600';
      case 'document':
        return 'bg-amber-100 text-amber-600';
      default:
        return 'bg-slate-100 text-slate-600';
    }
  };

  const handleUpload = () => {
    setUploading(true);
    setTimeout(() => {
      setUploading(false);
    }, 2000);
  };

  const handleDelete = (id: string) => {
    setAssets(assets.filter((a) => a.id !== id));
  };

  const stats = [
    { label: '全部素材', value: assets.length, icon: FolderOpen },
    { label: '视频', value: assets.filter((a) => a.type === 'video').length, icon: Film },
    { label: '图片', value: assets.filter((a) => a.type === 'image').length, icon: Image },
    { label: '音频', value: assets.filter((a) => a.type === 'audio').length, icon: Music },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">素材管理</h1>
          <p className="text-slate-500 mt-1">管理和组织您的视频、图片、音频和文档素材</p>
        </div>
        <button
          onClick={handleUpload}
          disabled={uploading}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
        >
          <Upload className="w-5 h-5" />
          {uploading ? '上传中...' : '上传素材'}
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div key={idx} className="bg-white rounded-xl p-4 border border-slate-200">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                  <Icon className="w-5 h-5 text-slate-600" />
                </div>
                <span className="text-2xl font-bold text-slate-800">{stat.value}</span>
              </div>
              <div className="text-sm text-slate-500 mt-2">{stat.label}</div>
            </div>
          );
        })}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-slate-200 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜索素材名称..."
              className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex gap-2">
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as AssetType)}
                className="pl-10 pr-8 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white cursor-pointer"
              >
                <option value="all">全部类型</option>
                <option value="video">视频</option>
                <option value="image">图片</option>
                <option value="audio">音频</option>
                <option value="document">文档</option>
              </select>
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white cursor-pointer"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat === 'all' ? '全部分类' : cat}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Assets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredAssets.length > 0 ? (
          filteredAssets.map((asset) => {
            const Icon = getAssetIcon(asset.type);
            return (
              <div
                key={asset.id}
                className="bg-white rounded-xl border border-slate-200 p-4 hover:border-blue-300 hover:shadow-md transition-all"
              >
                <div className="flex items-start gap-4">
                  <div className={`w-14 h-14 rounded-xl ${getTypeStyle(asset.type)} flex items-center justify-center flex-shrink-0`}>
                    <Icon className="w-7 h-7" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-slate-800 truncate">{asset.name}</div>
                    <div className="text-xs text-slate-500 mt-1">{asset.size}</div>
                    {asset.duration && (
                      <div className="text-xs text-slate-400">{asset.duration}</div>
                    )}
                    {asset.resolution && (
                      <div className="text-xs text-slate-400">{asset.resolution}</div>
                    )}
                  </div>
                </div>
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded-full text-xs">
                      {asset.category}
                    </span>
                    <span className="text-xs text-slate-400">{asset.projectName}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                      <Download className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(asset.id)}
                      className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="col-span-full text-center py-12">
            <FolderOpen className="w-16 h-16 mx-auto text-slate-300 mb-4" />
            <p className="text-slate-500">暂无素材</p>
            <button
              onClick={handleUpload}
              className="mt-4 text-blue-600 hover:text-blue-700 font-medium"
            >
              上传第一个素材
            </button>
          </div>
        )}
      </div>
    </div>
  );
}