import { useState, useRef, useCallback, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Plus,
  Image as ImageIcon,
  Music,
  Video,
  Film,
  FileText,
  Layers,
  Upload,
  History,
  Settings,
  ZoomIn,
  ZoomOut,
  Maximize2,
  MousePointer2,
  Move,
  Grid3X3,
  Sparkles,
  X,
  Search,
  FolderOpen,
  Download,
  CheckSquare,
  ChevronLeft,
  ChevronRight,
  Save,
  Undo2,
  Redo2,
  Share2,
  Bell,
  Gift,
  Coins,
  Crown,
  Play,
  Clock,
  Trash2,
  Edit3,
  Wand2,
} from 'lucide-react';

interface WorkbenchNode {
  id: string;
  type: string;
  x: number;
  y: number;
  width: number;
  height: number;
  title: string;
  data?: any;
}

interface SceneItem {
  id: string;
  index: number;
  description: string;
  duration: number;
}

interface StoryboardShot {
  id: string;
  index: number;
  prompt: string;
  duration: number;
  thumbnail?: string;
}

interface VideoTask {
  id: string;
  type: string;
  progress: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  time: string;
  points: number;
  thumbnail?: string;
  videoUrl?: string;
}

interface ProjectItem {
  id: string;
  name: string;
  thumbnail?: string;
  updatedAt: string;
}

interface AssetItem {
  id: string;
  name: string;
  category: string;
  image: string;
}

const NODE_TYPES = [
  { type: 'script', label: '短视频脚本', icon: FileText },
  { type: 'storyboard', label: '分镜', icon: Layers },
  { type: 'video', label: '视频生成', icon: Video },
  { type: 'image', label: '图片', icon: ImageIcon },
  { type: 'audio', label: '音频', icon: Music },
  { type: 'upload', label: '上传', icon: Upload },
  { type: 'history', label: '历史生成', icon: History },
];

const ASSET_CATEGORIES = [
  { key: 'all', label: '全部' },
  { key: 'character', label: '人物' },
  { key: 'scene', label: '场景' },
  { key: 'prop', label: '道具' },
];

const MOCK_PROJECTS: ProjectItem[] = [
  { id: '1', name: '椰子水电商营销', updatedAt: '2小时前' },
  { id: '2', name: '新品发布会宣传片', updatedAt: '昨天' },
  { id: '3', name: '618大促广告', updatedAt: '3天前' },
  { id: '4', name: '品牌故事短片', updatedAt: '1周前' },
  { id: '5', name: '产品使用教程', updatedAt: '2周前' },
  { id: '6', name: '双11预热视频', updatedAt: '1个月前' },
  { id: '7', name: '春节拜年视频', updatedAt: '2个月前' },
];

const MOCK_ASSETS: AssetItem[] = [
  { id: 'c1', name: '年轻女性模特', category: 'character', image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&h=300&fit=crop' },
  { id: 'c2', name: '商务男士', category: 'character', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop' },
  { id: 'c3', name: '活力少女', category: 'character', image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=300&h=300&fit=crop' },
  { id: 's1', name: '现代办公室', category: 'scene', image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=300&h=300&fit=crop' },
  { id: 's2', name: '城市夜景', category: 'scene', image: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=300&h=300&fit=crop' },
  { id: 's3', name: '自然森林', category: 'scene', image: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=300&h=300&fit=crop' },
  { id: 'p1', name: '豆浆打包杯', category: 'prop', image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=300&h=300&fit=crop' },
  { id: 'p2', name: '外卖头盔', category: 'prop', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=300&fit=crop' },
  { id: 'p3', name: '早餐煎饼', category: 'prop', image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=300&h=300&fit=crop' },
];

const STYLE_PRESETS = [
  { id: 'realistic', name: '真人风格', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=150&fit=crop' },
  { id: 'anime', name: '动漫风格', image: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=200&h=150&fit=crop' },
  { id: '3d', name: '3D卡通', image: 'https://images.unsplash.com/photo-1612036782180-6f0b6cd846fe?w=200&h=150&fit=crop' },
  { id: 'cyberpunk', name: '赛博朋克', image: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=200&h=150&fit=crop' },
  { id: 'cinematic', name: '电影质感', image: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=200&h=150&fit=crop' },
  { id: 'vintage', name: '复古怀旧', image: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=200&h=150&fit=crop' },
  { id: 'watercolor', name: '水彩画风', image: 'https://images.unsplash.com/photo-1579762715118-a6f1d4b934f1?w=200&h=150&fit=crop' },
  { id: 'oil', name: '油画风格', image: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=200&h=150&fit=crop' },
];

const DURATION_OPTIONS = ['4S', '5S', '6S', '7S', '8S', '9S', '10S', '11S', '12S', '13S', '14S', '15S'];
const RESOLUTION_OPTIONS = ['480P', '720P', '1080P', '4K'];
const RATIO_OPTIONS = ['16:9', '9:16', '21:9'];
const MODEL_OPTIONS = ['Seedance 2.0 Mini', 'Seedance 2.0 Fast', 'Seedance 2.0', 'Seedance 2.5'];

export default function VideoWorkbench() {
  const { id: projectId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [nodes, setNodes] = useState<WorkbenchNode[]>([]);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [showNodeMenu, setShowNodeMenu] = useState(false);
  const [nodeMenuPosition, setNodeMenuPosition] = useState({ x: 0, y: 0 });
  const [showAssetLibrary, setShowAssetLibrary] = useState(false);
  const [showVideoSettings, setShowVideoSettings] = useState(false);
  const [zoom, setZoom] = useState(100);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [draggingNode, setDraggingNode] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [assetTab, setAssetTab] = useState<'projects' | 'scripts'>('projects');
  const [assetCategory, setAssetCategory] = useState('all');
  const [selectedAssets, setSelectedAssets] = useState<string[]>([]);
  const [projectName] = useState('椰子水电商营销');
  const [projectMode] = useState('电商模式');
  const [showVideoDetail, setShowVideoDetail] = useState(false);
  const [videoDetailTab, setVideoDetailTab] = useState<'all' | 'processing' | 'completed' | 'failed'>('all');
  const [leftSidebarCollapsed, setLeftSidebarCollapsed] = useState(false);
  const [videoTasks, setVideoTasks] = useState<VideoTask[]>([]);

  const [settingsRatio, setSettingsRatio] = useState('16:9');
  const [settingsResolution, setSettingsResolution] = useState('1080P');
  const [settingsModel, setSettingsModel] = useState('Seedance 2.0');
  const [settingsDuration, setSettingsDuration] = useState('5S');
  const [settingsStyle, setSettingsStyle] = useState('realistic');

  const [scenes, setScenes] = useState<SceneItem[]>([
    { id: 's1', index: 1, description: '清晨阳光洒进厨房，主角拿起一瓶椰子水', duration: 3 },
    { id: 's2', index: 2, description: '特写镜头，椰子水倒入玻璃杯中，气泡升腾', duration: 2 },
    { id: 's3', index: 3, description: '主角微笑着喝下椰子水，露出满足的表情', duration: 3 },
  ]);

  const [shots, setShots] = useState<StoryboardShot[]>([
    { id: 'shot1', index: 1, prompt: '清晨阳光厨房，年轻女性拿起椰子水，温暖自然光', duration: 3, thumbnail: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=200&h=120&fit=crop' },
    { id: 'shot2', index: 2, prompt: '椰子水倒入玻璃杯特写，清澈液体，气泡升腾', duration: 2, thumbnail: 'https://images.unsplash.com/photo-1534353473418-4cfa6c56fd38?w=200&h=120&fit=crop' },
  ]);

  useEffect(() => {
    const initialNodes: WorkbenchNode[] = [
      {
        id: 'node-script-1',
        type: 'script',
        x: 100,
        y: 150,
        width: 280,
        height: 220,
        title: '短视频脚本',
        data: { scenes },
      },
      {
        id: 'node-storyboard-1',
        type: 'storyboard',
        x: 480,
        y: 150,
        width: 280,
        height: 260,
        title: '分镜',
        data: { shots },
      },
    ];
    setNodes(initialNodes);
  }, []);

  useEffect(() => {
    const mockTasks: VideoTask[] = [
      { id: 'smv_2071576896524503840', type: '视频生成', progress: 35, status: 'processing', time: '2026-06-28 20:58:08', points: 0 },
      { id: 'smv_2071189716727533568', type: '视频生成', progress: 100, status: 'completed', time: '2026-06-28 19:35:14', points: 120, thumbnail: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=200&h=120&fit=crop' },
      { id: 'smv_207118912540033024', type: '视频生成', progress: 100, status: 'completed', time: '2026-06-28 19:08:59', points: 120, thumbnail: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=200&h=120&fit=crop' },
      { id: 'smv_2071188828116985872', type: '视频生成', progress: 100, status: 'completed', time: '2026-06-28 19:07:52', points: 120, thumbnail: 'https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=200&h=120&fit=crop' },
      { id: 'smv_2071185749698080768', type: '视频生成', progress: 100, status: 'failed', time: '2026-06-28 18:55:38', points: 0 },
      { id: 'smv_2071133247389375104', type: '视频生成', progress: 100, status: 'completed', time: '2026-06-28 18:06:15', points: 120, thumbnail: 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=200&h=120&fit=crop' },
    ];
    setVideoTasks(mockTasks);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setVideoTasks((prev) =>
        prev.map((task) => {
          if (task.status === 'processing' && task.progress < 100) {
            const newProgress = Math.min(task.progress + Math.random() * 5, 100);
            return {
              ...task,
              progress: newProgress,
              status: newProgress >= 100 ? 'completed' : 'processing',
            };
          }
          return task;
        })
      );
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleCanvasRightClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    setNodeMenuPosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
    setShowNodeMenu(true);
  }, []);

  const handleCanvasClick = useCallback(() => {
    setShowNodeMenu(false);
    setSelectedNode(null);
  }, []);

  const addNode = (type: string) => {
    const nodeType = NODE_TYPES.find((n) => n.type === type);
    const newNode: WorkbenchNode = {
      id: `node-${Date.now()}`,
      type,
      x: (nodeMenuPosition.x + pan.x) / (zoom / 100),
      y: (nodeMenuPosition.y + pan.y) / (zoom / 100),
      width: 280,
      height: type === 'script' ? 220 : type === 'storyboard' ? 260 : type === 'video' ? 200 : 180,
      title: nodeType?.label || '新节点',
      data: {},
    };
    setNodes((prev) => [...prev, newNode]);
    setShowNodeMenu(false);
    setSelectedNode(newNode.id);
  };

  const handleNodeMouseDown = (e: React.MouseEvent, nodeId: string) => {
    e.stopPropagation();
    const node = nodes.find((n) => n.id === nodeId);
    if (!node || !canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const scale = zoom / 100;
    setDraggingNode(nodeId);
    setDragOffset({
      x: (e.clientX - rect.left) / scale - node.x,
      y: (e.clientY - rect.top) / scale - node.y,
    });
    setSelectedNode(nodeId);
    setShowNodeMenu(false);
  };

  const handleCanvasMouseMove = useCallback((e: React.MouseEvent) => {
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const scale = zoom / 100;

    if (draggingNode) {
      setNodes((prev) =>
        prev.map((n) =>
          n.id === draggingNode
            ? { ...n, x: (e.clientX - rect.left) / scale - dragOffset.x, y: (e.clientY - rect.top) / scale - dragOffset.y }
            : n
        )
      );
    } else if (isPanning) {
      const dx = e.clientX - dragStart.x;
      const dy = e.clientY - dragStart.y;
      setPan((prev) => ({
        x: prev.x + dx,
        y: prev.y + dy,
      }));
      setDragStart({ x: e.clientX, y: e.clientY });
    }
  }, [draggingNode, dragOffset, isPanning, dragStart, zoom]);

  const handleCanvasMouseUp = useCallback(() => {
    setDraggingNode(null);
    setIsPanning(false);
  }, []);

  const handleMiddleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 1) {
      e.preventDefault();
      setIsPanning(true);
      setDragStart({ x: e.clientX, y: e.clientY });
    }
  };

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -10 : 10;
    setZoom((prev) => Math.min(Math.max(prev + delta, 25), 200));
  }, []);

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 10, 200));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 10, 25));
  };

  const handleResetView = () => {
    setZoom(100);
    setPan({ x: 0, y: 0 });
  };

  const deleteNode = (nodeId: string) => {
    setNodes((prev) => prev.filter((n) => n.id !== nodeId));
    if (selectedNode === nodeId) {
      setSelectedNode(null);
    }
  };

  const toggleAssetSelection = (assetId: string) => {
    setSelectedAssets((prev) =>
      prev.includes(assetId)
        ? prev.filter((id) => id !== assetId)
        : [...prev, assetId]
    );
  };

  const filteredAssets = MOCK_ASSETS.filter(
    (a) => assetCategory === 'all' || a.category === assetCategory
  );

  const filteredTasks = videoTasks.filter((task) => {
    if (videoDetailTab === 'all') return true;
    if (videoDetailTab === 'processing') return task.status === 'processing' || task.status === 'pending';
    if (videoDetailTab === 'completed') return task.status === 'completed';
    if (videoDetailTab === 'failed') return task.status === 'failed';
    return true;
  });

  const selectedNodeData = nodes.find((n) => n.id === selectedNode);

  const calculatePoints = () => {
    const baseRate = 8.3;
    const duration = parseInt(settingsDuration);
    const resolutionMultiplier = settingsResolution === '4K' ? 4 : settingsResolution === '1080P' ? 2 : settingsResolution === '720P' ? 1.5 : 1;
    const modelMultiplier = settingsModel === 'Seedance 2.5' ? 1.5 : settingsModel === 'Seedance 2.0' ? 1 : settingsModel === 'Seedance 2.0 Fast' ? 0.8 : 0.5;
    return Math.round(baseRate * duration * resolutionMultiplier * modelMultiplier * 10) / 10;
  };

  const getNodeIcon = (type: string) => {
    const nodeType = NODE_TYPES.find((n) => n.type === type);
    return nodeType?.icon || FileText;
  };

  const renderConnections = () => {
    const scriptNode = nodes.find((n) => n.type === 'script');
    const storyboardNode = nodes.find((n) => n.type === 'storyboard');
    if (!scriptNode || !storyboardNode) return null;

    const scale = zoom / 100;
    const x1 = (scriptNode.x + scriptNode.width) * scale - pan.x;
    const y1 = (scriptNode.y + scriptNode.height / 2) * scale - pan.y;
    const x2 = storyboardNode.x * scale - pan.x;
    const y2 = (storyboardNode.y + storyboardNode.height / 2) * scale - pan.y;

    const midX = (x1 + x2) / 2;
    const path = `M ${x1} ${y1} C ${midX} ${y1}, ${midX} ${y2}, ${x2} ${y2}`;

    return (
      <svg className="absolute inset-0 pointer-events-none" style={{ zIndex: 1 }}>
        <defs>
          <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#ec4899" />
            <stop offset="100%" stopColor="#a855f7" />
          </linearGradient>
        </defs>
        <path d={path} fill="none" stroke="url(#lineGradient)" strokeWidth="2" strokeDasharray="6 4" opacity="0.6" />
        <circle cx={x2} cy={y2} r="4" fill="#ec4899" />
      </svg>
    );
  };

  return (
    <div className="h-screen bg-black flex flex-col overflow-hidden">
      {/* Top Navigation Bar */}
      <header className="h-14 bg-zinc-950/90 backdrop-blur-xl border-b border-white/10 flex items-center justify-between px-4 flex-shrink-0 z-50">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(`/app/projects/${projectId}`)}
            className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="h-6 w-px bg-white/10" />
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-pink-500 to-purple-500 flex items-center justify-center shadow-lg shadow-pink-500/20">
              <Sparkles className="w-4.5 h-4.5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-white text-sm font-semibold">{projectName}</span>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 bg-pink-500/20 text-pink-400 text-xs font-medium rounded-full">
                  {projectMode}
                </span>
              </div>
            </div>
          </div>
          <button className="p-2 text-white/40 hover:text-white hover:bg-white/10 rounded-lg transition-all ml-2">
            <Settings className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-3 py-1.5 text-white/70 hover:text-white hover:bg-white/5 rounded-lg text-sm transition-all">
            <Gift className="w-4 h-4 text-yellow-400" />
            <span className="font-medium">邀请有礼</span>
          </button>
          <button
            onClick={() => setShowVideoDetail(true)}
            className="flex items-center gap-2 px-3 py-1.5 text-white/70 hover:text-white hover:bg-white/5 rounded-lg text-sm transition-all"
          >
            <Film className="w-4 h-4" />
            <span className="font-medium">视频详细</span>
          </button>
          <div className="h-6 w-px bg-white/10 mx-1" />
          <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-xl border border-white/10">
            <Coins className="w-4 h-4 text-yellow-400" />
            <span className="text-white text-sm font-semibold">2,780.4</span>
          </div>
          <button className="flex items-center gap-1.5 px-4 py-1.5 bg-gradient-to-r from-pink-500 to-purple-500 text-white text-sm font-semibold rounded-xl hover:opacity-90 transition-all shadow-lg shadow-pink-500/20">
            <Crown className="w-4 h-4" />
            订阅
          </button>
          <div className="h-6 w-px bg-white/10 mx-1" />
          <button className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-all relative">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
          </button>
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-500 to-purple-500 flex items-center justify-center text-white text-sm font-semibold cursor-pointer hover:ring-2 hover:ring-pink-500/50 transition-all">
            U
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Sidebar - Projects */}
        <div
          className={`${
            leftSidebarCollapsed ? 'w-0' : 'w-60'
          } bg-zinc-950 border-r border-white/10 flex flex-col transition-all duration-300 flex-shrink-0 overflow-hidden`}
        >
          <div className="p-4 border-b border-white/10 flex items-center justify-between">
            <span className="text-white font-semibold text-sm">项目</span>
            <button className="p-1.5 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-lg hover:opacity-90 transition-all">
              <Plus className="w-4 h-4" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {MOCK_PROJECTS.map((project, idx) => (
              <button
                key={project.id}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all ${
                  idx === 0
                    ? 'bg-gradient-to-r from-pink-500/20 to-purple-500/20 border border-pink-500/30'
                    : 'hover:bg-white/5 border border-transparent'
                }`}
              >
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  idx === 0
                    ? 'bg-gradient-to-br from-pink-500 to-purple-500'
                    : 'bg-white/10'
                }`}>
                  <FolderOpen className={`w-5 h-5 ${idx === 0 ? 'text-white' : 'text-white/50'}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className={`text-sm font-medium truncate ${idx === 0 ? 'text-white' : 'text-white/70'}`}>
                    {project.name}
                  </div>
                  <div className="text-xs text-white/40">{project.updatedAt}</div>
                </div>
              </button>
            ))}
          </div>
          <div className="p-2 border-t border-white/10">
            <button
              onClick={() => setLeftSidebarCollapsed(true)}
              className="w-full flex items-center justify-center gap-2 py-2 text-white/50 hover:text-white hover:bg-white/5 rounded-lg text-sm transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
              收起
            </button>
          </div>
        </div>

        {/* Collapsed sidebar toggle */}
        {leftSidebarCollapsed && (
          <div className="absolute left-0 top-1/2 -translate-y-1/2 z-20">
            <button
              onClick={() => setLeftSidebarCollapsed(false)}
              className="p-2 bg-zinc-900 border border-white/10 border-l-0 rounded-r-lg text-white/50 hover:text-white hover:bg-zinc-800 transition-all"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Center Canvas Area */}
        <div ref={containerRef} className="flex-1 relative overflow-hidden">
          {/* Canvas */}
          <div
            ref={canvasRef}
            className="absolute inset-0 cursor-crosshair"
            style={{
              backgroundImage: `
                radial-gradient(circle at 1px 1px, rgba(255,255,255,0.06) 1px, transparent 0)
              `,
              backgroundSize: `${24 * (zoom / 100)}px ${24 * (zoom / 100)}px`,
              backgroundPosition: `${pan.x}px ${pan.y}px`,
            }}
            onClick={handleCanvasClick}
            onContextMenu={handleCanvasRightClick}
            onMouseMove={handleCanvasMouseMove}
            onMouseUp={handleCanvasMouseUp}
            onMouseLeave={handleCanvasMouseUp}
            onMouseDown={handleMiddleMouseDown}
            onWheel={handleWheel}
          >
            {renderConnections()}

            {/* Nodes */}
            {nodes.map((node) => {
              const NodeIcon = getNodeIcon(node.type);
              const scale = zoom / 100;
              return (
                <div
                  key={node.id}
                  className={`absolute rounded-2xl border transition-all ${
                    selectedNode === node.id
                      ? 'border-pink-500/50 shadow-2xl shadow-pink-500/20 z-10'
                      : 'border-white/10 hover:border-white/20'
                  }`}
                  style={{
                    left: node.x * scale - pan.x,
                    top: node.y * scale - pan.y,
                    width: node.width * scale,
                    minHeight: node.height * scale,
                    transformOrigin: 'top left',
                  }}
                  onMouseDown={(e) => handleNodeMouseDown(e, node.id)}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedNode(node.id);
                  }}
                >
                  <div className="h-full backdrop-blur-xl bg-zinc-900/80 rounded-2xl overflow-hidden">
                    {/* Node Header */}
                    <div className="bg-white/5 border-b border-white/10 px-4 py-3 flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-pink-500/20 to-purple-500/20 flex items-center justify-center">
                          <NodeIcon className="w-4 h-4 text-pink-400" />
                        </div>
                        <span className="text-white/90 text-sm font-semibold">{node.title}</span>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteNode(node.id);
                        }}
                        className="p-1 text-white/30 hover:text-white hover:bg-white/10 rounded-lg transition-all"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Node Content */}
                    <div className="p-4">
                      {node.type === 'script' && (
                        <div className="space-y-3">
                          <div className="bg-white/5 rounded-xl p-3 border border-white/10">
                            <div className="text-white/80 text-sm leading-relaxed">
                              纯天然海南椰子，3个叶子萃取1瓶椰子水；
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <FileText className="w-3.5 h-3.5 text-white/40" />
                              <span className="text-white/40 text-xs">{scenes.length} 个场景</span>
                            </div>
                            <button className="flex items-center gap-1 px-2.5 py-1 bg-gradient-to-r from-pink-500 to-purple-500 text-white text-xs font-medium rounded-full">
                              <Edit3 className="w-3 h-3" />
                              编辑
                            </button>
                          </div>
                        </div>
                      )}

                      {node.type === 'storyboard' && (
                        <div className="space-y-3">
                          <div className="grid grid-cols-2 gap-2">
                            {shots.map((shot) => (
                              <div key={shot.id} className="relative aspect-video rounded-lg overflow-hidden bg-white/5 border border-white/10">
                                {shot.thumbnail ? (
                                  <img src={shot.thumbnail} alt="" className="w-full h-full object-cover" />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center">
                                    <Layers className="w-6 h-6 text-white/20" />
                                  </div>
                                )}
                                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-1.5">
                                  <span className="text-white text-xs">镜头 {shot.index}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-white/40 text-xs">{shots.length} 个镜头</span>
                            <button className="flex items-center gap-1 px-2.5 py-1 bg-gradient-to-r from-pink-500 to-purple-500 text-white text-xs font-medium rounded-full">
                              <Wand2 className="w-3 h-3" />
                              生成分镜
                            </button>
                          </div>
                        </div>
                      )}

                      {node.type === 'video' && (
                        <div className="space-y-3">
                          <div className="aspect-video bg-gradient-to-br from-pink-500/20 to-purple-500/20 rounded-xl flex items-center justify-center border border-white/10">
                            <Video className="w-10 h-10 text-white/40" />
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setShowVideoSettings(true);
                              }}
                              className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-white/5 hover:bg-white/10 text-white/70 text-xs rounded-xl border border-white/10 transition-all"
                            >
                              <Settings className="w-3.5 h-3.5" />
                              设置
                            </button>
                            <button className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-gradient-to-r from-pink-500 to-purple-500 text-white text-xs font-semibold rounded-xl hover:opacity-90 transition-all">
                              <Play className="w-3.5 h-3.5" />
                              生成
                            </button>
                          </div>
                        </div>
                      )}

                      {node.type === 'image' && (
                        <div className="py-6 text-center">
                          <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-white/5 flex items-center justify-center">
                            <ImageIcon className="w-6 h-6 text-white/30" />
                          </div>
                          <p className="text-white/40 text-sm">图片节点</p>
                        </div>
                      )}

                      {node.type === 'audio' && (
                        <div className="py-6 text-center">
                          <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-white/5 flex items-center justify-center">
                            <Music className="w-6 h-6 text-white/30" />
                          </div>
                          <p className="text-white/40 text-sm">音频节点</p>
                        </div>
                      )}

                      {node.type === 'upload' && (
                        <div className="py-6 text-center">
                          <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-white/5 flex items-center justify-center">
                            <Upload className="w-6 h-6 text-white/30" />
                          </div>
                          <p className="text-white/40 text-sm">上传节点</p>
                        </div>
                      )}

                      {node.type === 'history' && (
                        <div className="py-6 text-center">
                          <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-white/5 flex items-center justify-center">
                            <History className="w-6 h-6 text-white/30" />
                          </div>
                          <p className="text-white/40 text-sm">历史生成</p>
                        </div>
                      )}
                    </div>

                    {/* Connection points */}
                    <div className="absolute -left-1.5 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white/20 border-2 border-zinc-900 hover:bg-pink-500 cursor-pointer transition-all" />
                    <div className="absolute -right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white/20 border-2 border-zinc-900 hover:bg-pink-500 cursor-pointer transition-all" />
                  </div>
                </div>
              );
            })}

            {/* Right click menu */}
            {showNodeMenu && (
              <div
                className="absolute z-50 bg-zinc-900/95 backdrop-blur-xl border border-white/10 rounded-2xl py-2 w-52 shadow-2xl"
                style={{ left: nodeMenuPosition.x, top: nodeMenuPosition.y }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="px-4 py-2 text-white/40 text-xs font-semibold uppercase tracking-wider">添加节点</div>
                {NODE_TYPES.map((nodeType) => {
                  const Icon = nodeType.icon;
                  return (
                    <button
                      key={nodeType.type}
                      onClick={() => addNode(nodeType.type)}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-white/70 hover:bg-white/10 hover:text-white text-sm transition-all"
                    >
                      <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
                        <Icon className="w-4 h-4 text-pink-400" />
                      </div>
                      {nodeType.label}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Bottom Toolbar */}
          <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-zinc-900/90 backdrop-blur-xl border border-white/10 rounded-full px-2 py-1.5 shadow-2xl">
            <button
              onClick={() => setShowAssetLibrary(true)}
              className="w-10 h-10 flex items-center justify-center bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-full hover:opacity-90 transition-all shadow-lg shadow-pink-500/30"
              title="添加节点"
            >
              <Plus className="w-5 h-5" />
            </button>
            <div className="w-px h-6 bg-white/10 mx-1" />
            <button className="w-9 h-9 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 rounded-full transition-all">
              <MousePointer2 className="w-4 h-4" />
            </button>
            <button className="w-9 h-9 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 rounded-full transition-all">
              <Move className="w-4 h-4" />
            </button>
            <div className="w-px h-6 bg-white/10 mx-1" />
            <button className="w-9 h-9 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 rounded-full transition-all">
              <Save className="w-4 h-4" />
            </button>
            <button className="w-9 h-9 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 rounded-full transition-all">
              <Undo2 className="w-4 h-4" />
            </button>
            <button className="w-9 h-9 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 rounded-full transition-all">
              <Redo2 className="w-4 h-4" />
            </button>
            <div className="w-px h-6 bg-white/10 mx-1" />
            <button className="w-9 h-9 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 rounded-full transition-all">
              <Grid3X3 className="w-4 h-4" />
            </button>
            <button className="w-9 h-9 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 rounded-full transition-all">
              <Share2 className="w-4 h-4" />
            </button>
            <button
              onClick={handleResetView}
              className="w-9 h-9 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 rounded-full transition-all"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>

          {/* Bottom Left Zoom Controls */}
          <div className="absolute bottom-5 left-5 flex items-center gap-1 bg-zinc-900/90 backdrop-blur-xl border border-white/10 rounded-xl px-1.5 py-1.5 shadow-lg">
            <button
              onClick={handleZoomOut}
              className="w-8 h-8 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-all"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="text-white/80 text-xs font-medium px-2 min-w-[48px] text-center">{zoom}%</span>
            <button
              onClick={handleZoomIn}
              className="w-8 h-8 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-all"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <div className="w-px h-5 bg-white/10 mx-1" />
            <button
              onClick={handleResetView}
              className="w-8 h-8 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-all"
              title="重置视图"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Right Properties Panel */}
        {selectedNode && selectedNodeData && (
          <div className="w-80 bg-zinc-950 border-l border-white/10 flex flex-col flex-shrink-0">
            <div className="px-4 py-3.5 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-pink-500/20 to-purple-500/20 flex items-center justify-center">
                  {(() => {
                    const Icon = getNodeIcon(selectedNodeData.type);
                    return <Icon className="w-4 h-4 text-pink-400" />;
                  })()}
                </div>
                <span className="text-white font-semibold text-sm">{selectedNodeData.title}</span>
              </div>
              <button
                onClick={() => setSelectedNode(null)}
                className="p-1.5 text-white/40 hover:text-white hover:bg-white/10 rounded-lg transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-5">
              {/* Node Title */}
              <div>
                <label className="text-white/50 text-xs font-medium mb-2 block">节点标题</label>
                <input
                  type="text"
                  value={selectedNodeData.title}
                  onChange={(e) => {
                    setNodes((prev) =>
                      prev.map((n) =>
                        n.id === selectedNode ? { ...n, title: e.target.value } : n
                      )
                    );
                  }}
                  className="w-full px-3.5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-pink-500/50 focus:bg-white/10 transition-all"
                  placeholder="输入节点标题"
                />
              </div>

              {/* Script Node Properties */}
              {selectedNodeData.type === 'script' && (
                <>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-white/50 text-xs font-medium">场景列表</label>
                      <button
                        onClick={() => {
                          const newScene: SceneItem = {
                            id: `scene-${Date.now()}`,
                            index: scenes.length + 1,
                            description: '新场景描述',
                            duration: 3,
                          };
                          setScenes([...scenes, newScene]);
                        }}
                        className="text-pink-400 text-xs font-medium hover:text-pink-300 transition-colors"
                      >
                        + 添加场景
                      </button>
                    </div>
                    <div className="space-y-2.5">
                      {scenes.map((scene, idx) => (
                        <div key={scene.id} className="bg-white/5 rounded-xl p-3 border border-white/10">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="w-6 h-6 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 text-white text-xs font-semibold flex items-center justify-center flex-shrink-0">
                              {scene.index}
                            </span>
                            <input
                              type="text"
                              value={scene.description}
                              onChange={(e) => {
                                const newScenes = [...scenes];
                                newScenes[idx] = { ...scene, description: e.target.value };
                                setScenes(newScenes);
                              }}
                              className="flex-1 bg-transparent text-white text-sm focus:outline-none"
                            />
                            <button
                              onClick={() => {
                                setScenes(scenes.filter((s) => s.id !== scene.id));
                              }}
                              className="p-1 text-white/30 hover:text-red-400 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="w-3.5 h-3.5 text-white/30" />
                            <input
                              type="number"
                              value={scene.duration}
                              onChange={(e) => {
                                const newScenes = [...scenes];
                                newScenes[idx] = { ...scene, duration: parseInt(e.target.value) || 0 };
                                setScenes(newScenes);
                              }}
                              className="w-16 px-2 py-1 bg-white/5 border border-white/10 rounded-lg text-white/70 text-xs text-center focus:outline-none focus:border-pink-500/50"
                              min="1"
                            />
                            <span className="text-white/40 text-xs">秒</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <button className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white text-sm font-semibold rounded-xl hover:opacity-90 transition-all shadow-lg shadow-pink-500/20">
                    <Wand2 className="w-4 h-4" />
                    AI 优化脚本
                  </button>
                </>
              )}

              {/* Storyboard Node Properties */}
              {selectedNodeData.type === 'storyboard' && (
                <>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-white/50 text-xs font-medium">镜头数量</label>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setShots(shots.slice(0, -1))}
                          className="w-7 h-7 flex items-center justify-center bg-white/5 hover:bg-white/10 text-white/60 rounded-lg transition-all"
                        >
                          -
                        </button>
                        <span className="text-white text-sm font-semibold w-6 text-center">{shots.length}</span>
                        <button
                          onClick={() => {
                            const newShot: StoryboardShot = {
                              id: `shot-${Date.now()}`,
                              index: shots.length + 1,
                              prompt: '新镜头提示词',
                              duration: 3,
                            };
                            setShots([...shots, newShot]);
                          }}
                          className="w-7 h-7 flex items-center justify-center bg-white/5 hover:bg-white/10 text-white/60 rounded-lg transition-all"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {shots.map((shot, idx) => (
                      <div key={shot.id} className="bg-white/5 rounded-xl overflow-hidden border border-white/10">
                        <div className="aspect-video bg-gradient-to-br from-pink-500/10 to-purple-500/10 relative">
                          {shot.thumbnail ? (
                            <img src={shot.thumbnail} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <ImageIcon className="w-8 h-8 text-white/20" />
                            </div>
                          )}
                          <div className="absolute top-2 left-2 px-2 py-0.5 bg-black/60 backdrop-blur rounded-full text-white text-xs font-medium">
                            镜头 {shot.index}
                          </div>
                        </div>
                        <div className="p-3 space-y-2.5">
                          <div>
                            <label className="text-white/40 text-xs mb-1 block">提示词</label>
                            <textarea
                              value={shot.prompt}
                              onChange={(e) => {
                                const newShots = [...shots];
                                newShots[idx] = { ...shot, prompt: e.target.value };
                                setShots(newShots);
                              }}
                              rows={2}
                              className="w-full px-2.5 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-xs focus:outline-none focus:border-pink-500/50 resize-none"
                            />
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="w-3.5 h-3.5 text-white/30" />
                            <input
                              type="number"
                              value={shot.duration}
                              onChange={(e) => {
                                const newShots = [...shots];
                                newShots[idx] = { ...shot, duration: parseInt(e.target.value) || 0 };
                                setShots(newShots);
                              }}
                              className="w-16 px-2 py-1 bg-white/5 border border-white/10 rounded-lg text-white/70 text-xs text-center focus:outline-none focus:border-pink-500/50"
                              min="1"
                            />
                            <span className="text-white/40 text-xs">秒</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <button className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white text-sm font-semibold rounded-xl hover:opacity-90 transition-all shadow-lg shadow-pink-500/20">
                    <Wand2 className="w-4 h-4" />
                    生成全部分镜
                  </button>
                </>
              )}

              {/* Video Node Properties */}
              {selectedNodeData.type === 'video' && (
                <>
                  <div className="bg-gradient-to-br from-pink-500/10 to-purple-500/10 rounded-xl p-4 border border-pink-500/20">
                    <div className="text-white/80 text-sm mb-3 font-medium">生成设置</div>
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-white/50">尺寸</span>
                        <span className="text-white/80">{settingsRatio}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/50">分辨率</span>
                        <span className="text-white/80">{settingsResolution}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/50">模型</span>
                        <span className="text-white/80">{settingsModel}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/50">时长</span>
                        <span className="text-white/80">{settingsDuration}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => setShowVideoSettings(true)}
                      className="w-full mt-3 py-2 bg-white/10 hover:bg-white/20 text-white/80 text-xs font-medium rounded-lg transition-all"
                    >
                      修改设置
                    </button>
                  </div>

                  <button className="w-full flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-pink-500 to-purple-500 text-white text-sm font-semibold rounded-xl hover:opacity-90 transition-all shadow-lg shadow-pink-500/20">
                    <Play className="w-4 h-4" />
                    开始生成视频
                  </button>

                  <div className="flex items-center justify-center gap-2 text-white/40 text-xs">
                    <Coins className="w-3.5 h-3.5 text-yellow-500" />
                    <span>预计消耗 {calculatePoints()} 积分</span>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Video Settings Modal */}
      {showVideoSettings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-[600px] max-h-[85vh] bg-zinc-900 border border-white/10 rounded-3xl overflow-hidden flex flex-col shadow-2xl">
            {/* Header */}
            <div className="px-6 py-5 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500/20 to-purple-500/20 flex items-center justify-center">
                  <Settings className="w-5 h-5 text-pink-400" />
                </div>
                <div>
                  <h3 className="text-white font-bold text-base">视频生成设置</h3>
                  <p className="text-white/40 text-xs mt-0.5">配置视频生成参数，精准控制输出效果</p>
                </div>
              </div>
              <button
                onClick={() => setShowVideoSettings(false)}
                className="p-2 text-white/40 hover:text-white hover:bg-white/10 rounded-xl transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 p-6 overflow-y-auto space-y-7">
              {/* 尺寸 */}
              <div>
                <div className="flex items-center gap-2 mb-3.5">
                  <span className="text-white/90 text-sm font-semibold">尺寸比例</span>
                </div>
                <div className="flex gap-2.5">
                  {RATIO_OPTIONS.map((ratio) => (
                    <button
                      key={ratio}
                      onClick={() => setSettingsRatio(ratio)}
                      className={`flex-1 py-3 text-sm font-medium rounded-xl border-2 transition-all ${
                        settingsRatio === ratio
                          ? 'bg-gradient-to-r from-pink-500/20 to-purple-500/20 border-pink-500 text-pink-400'
                          : 'bg-white/5 border-white/10 text-white/60 hover:border-white/20 hover:text-white/80'
                      }`}
                    >
                      {ratio}
                    </button>
                  ))}
                </div>
              </div>

              {/* 分辨率 */}
              <div>
                <div className="flex items-center gap-2 mb-3.5">
                  <span className="text-white/90 text-sm font-semibold">分辨率</span>
                </div>
                <div className="grid grid-cols-4 gap-2.5">
                  {RESOLUTION_OPTIONS.map((res) => (
                    <button
                      key={res}
                      onClick={() => setSettingsResolution(res)}
                      className={`py-3 text-sm font-medium rounded-xl border-2 transition-all ${
                        settingsResolution === res
                          ? 'bg-gradient-to-r from-pink-500/20 to-purple-500/20 border-pink-500 text-pink-400'
                          : 'bg-white/5 border-white/10 text-white/60 hover:border-white/20 hover:text-white/80'
                      }`}
                    >
                      {res}
                    </button>
                  ))}
                </div>
              </div>

              {/* 模型 */}
              <div>
                <div className="flex items-center gap-2 mb-3.5">
                  <span className="text-white/90 text-sm font-semibold">模型选择</span>
                </div>
                <div className="grid grid-cols-2 gap-2.5">
                  {MODEL_OPTIONS.map((model) => (
                    <button
                      key={model}
                      onClick={() => setSettingsModel(model)}
                      className={`py-3 text-sm font-medium rounded-xl border-2 transition-all ${
                        settingsModel === model
                          ? 'bg-gradient-to-r from-pink-500/20 to-purple-500/20 border-pink-500 text-pink-400'
                          : 'bg-white/5 border-white/10 text-white/60 hover:border-white/20 hover:text-white/80'
                      }`}
                    >
                      {model}
                    </button>
                  ))}
                </div>
              </div>

              {/* 时长 */}
              <div>
                <div className="flex items-center gap-2 mb-3.5">
                  <span className="text-white/90 text-sm font-semibold">视频时长</span>
                </div>
                <div className="grid grid-cols-6 gap-2">
                  {DURATION_OPTIONS.map((duration) => (
                    <button
                      key={duration}
                      onClick={() => setSettingsDuration(duration)}
                      className={`py-2.5 text-sm font-medium rounded-xl border-2 transition-all ${
                        settingsDuration === duration
                          ? 'bg-gradient-to-r from-pink-500/20 to-purple-500/20 border-pink-500 text-pink-400'
                          : 'bg-white/5 border-white/10 text-white/60 hover:border-white/20 hover:text-white/80'
                      }`}
                    >
                      {duration}
                    </button>
                  ))}
                </div>
              </div>

              {/* 风格 */}
              <div>
                <div className="flex items-center gap-2 mb-3.5">
                  <span className="text-white/90 text-sm font-semibold">风格选择</span>
                </div>
                <div className="grid grid-cols-4 gap-3">
                  {STYLE_PRESETS.map((style) => (
                    <button
                      key={style.id}
                      onClick={() => setSettingsStyle(style.id)}
                      className={`rounded-xl overflow-hidden border-2 transition-all group ${
                        settingsStyle === style.id
                          ? 'border-pink-500 ring-2 ring-pink-500/30'
                          : 'border-transparent hover:border-white/20'
                      }`}
                    >
                      <div className="aspect-[4/3] relative overflow-hidden">
                        <img src={style.image} alt={style.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                        <div className="absolute bottom-2 left-0 right-0 px-2">
                          <span className="text-white text-xs font-medium">{style.name}</span>
                        </div>
                        {settingsStyle === style.id && (
                          <div className="absolute top-2 right-2 w-5 h-5 bg-pink-500 rounded-full flex items-center justify-center">
                            <CheckSquare className="w-3 h-3 text-white" />
                          </div>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-white/10 flex items-center justify-between bg-white/5">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <Coins className="w-5 h-5 text-yellow-400" />
                  <span className="text-white/80 text-sm">预计消耗</span>
                </div>
                <span className="text-pink-400 font-bold text-lg">{calculatePoints()}</span>
                <span className="text-white/40 text-sm">积分</span>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowVideoSettings(false)}
                  className="px-5 py-2.5 text-white/60 hover:text-white text-sm font-medium transition-all"
                >
                  取消
                </button>
                <button
                  onClick={() => setShowVideoSettings(false)}
                  className="px-7 py-2.5 bg-gradient-to-r from-pink-500 to-purple-500 text-white text-sm font-semibold rounded-xl hover:opacity-90 transition-all shadow-lg shadow-pink-500/20"
                >
                  确定
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Video Detail Panel - Slide from right */}
      <div
        className={`fixed top-0 right-0 h-full w-[420px] bg-zinc-950 border-l border-white/10 z-50 transform transition-transform duration-300 flex flex-col shadow-2xl ${
          showVideoDetail ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-pink-500/20 to-purple-500/20 flex items-center justify-center">
              <Film className="w-5 h-5 text-pink-400" />
            </div>
            <div>
              <h3 className="text-white font-semibold text-sm">视频任务</h3>
              <p className="text-white/40 text-xs">共 {videoTasks.length} 个任务</p>
            </div>
          </div>
          <button
            onClick={() => setShowVideoDetail(false)}
            className="p-2 text-white/40 hover:text-white hover:bg-white/10 rounded-lg transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="px-4 py-3 border-b border-white/10 flex-shrink-0">
          <div className="flex items-center gap-1 bg-white/5 rounded-xl p-1">
            {[
              { key: 'all', label: '全部', count: videoTasks.length },
              { key: 'processing', label: '生成中', count: videoTasks.filter((t) => t.status === 'processing' || t.status === 'pending').length },
              { key: 'completed', label: '已完成', count: videoTasks.filter((t) => t.status === 'completed').length },
              { key: 'failed', label: '失败', count: videoTasks.filter((t) => t.status === 'failed').length },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setVideoDetailTab(tab.key as any)}
                className={`flex-1 py-2 text-xs font-medium rounded-lg transition-all ${
                  videoDetailTab === tab.key
                    ? 'bg-white/10 text-white'
                    : 'text-white/50 hover:text-white/70'
                }`}
              >
                {tab.label}
                <span className="ml-1 opacity-60">({tab.count})</span>
              </button>
            ))}
          </div>
        </div>

        {/* Task List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {filteredTasks.map((task) => (
            <div key={task.id} className="bg-white/5 rounded-2xl overflow-hidden border border-white/10 hover:border-white/20 transition-all">
              {/* Thumbnail for completed */}
              {task.status === 'completed' && task.thumbnail && (
                <div className="aspect-video relative">
                  <img src={task.thumbnail} alt="" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <button className="absolute inset-0 flex items-center justify-center group">
                    <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur flex items-center justify-center group-hover:bg-white/30 transition-all">
                      <Play className="w-5 h-5 text-white ml-0.5" />
                    </div>
                  </button>
                </div>
              )}

              {/* Content */}
              <div className="p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="text-white/90 text-sm font-medium truncate font-mono">{task.id}</div>
                    <div className="text-white/40 text-xs mt-0.5">{task.type}</div>
                  </div>
                  <span
                    className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium flex-shrink-0 ml-2 ${
                      task.status === 'completed'
                        ? 'bg-green-500/20 text-green-400'
                        : task.status === 'processing' || task.status === 'pending'
                        ? 'bg-orange-500/20 text-orange-400'
                        : 'bg-red-500/20 text-red-400'
                    }`}
                  >
                    {task.status === 'completed'
                      ? '已完成'
                      : task.status === 'processing'
                      ? '生成中'
                      : task.status === 'pending'
                      ? '排队中'
                      : '失败'}
                  </span>
                </div>

                {/* Progress bar for processing */}
                {(task.status === 'processing' || task.status === 'pending') && (
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-white/40 text-xs">生成进度</span>
                      <span className="text-white/60 text-xs font-medium">{Math.round(task.progress)}%</span>
                    </div>
                    <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-pink-500 to-purple-500 rounded-full transition-all duration-500"
                        style={{ width: `${task.progress}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Footer */}
                <div className="flex items-center justify-between pt-2 border-t border-white/5">
                  <div className="flex items-center gap-1.5 text-white/40 text-xs">
                    <Clock className="w-3.5 h-3.5" />
                    {task.time}
                  </div>
                  <div className="flex items-center gap-1.5">
                    {task.status === 'completed' ? (
                      <>
                        <span className="text-pink-400 text-xs font-medium">-{task.points}</span>
                        <Coins className="w-3.5 h-3.5 text-yellow-400" />
                        <button className="p-1.5 text-white/40 hover:text-white hover:bg-white/10 rounded-lg transition-all ml-1">
                          <Download className="w-4 h-4" />
                        </button>
                      </>
                    ) : task.status === 'failed' ? (
                      <button className="text-pink-400 text-xs font-medium hover:text-pink-300 transition-colors">
                        重新生成
                      </button>
                    ) : (
                      <span className="text-white/40 text-xs">消耗中...</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}

          {filteredTasks.length === 0 && (
            <div className="py-16 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-white/5 flex items-center justify-center">
                <Film className="w-8 h-8 text-white/20" />
              </div>
              <p className="text-white/40 text-sm">暂无任务</p>
            </div>
          )}
        </div>
      </div>

      {/* Overlay for video detail */}
      {showVideoDetail && (
        <div
          className="fixed inset-0 bg-black/30 z-40"
          onClick={() => setShowVideoDetail(false)}
        />
      )}

      {/* Asset Library Modal */}
      {showAssetLibrary && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-[850px] max-h-[80vh] bg-zinc-900 border border-white/10 rounded-3xl overflow-hidden flex flex-col shadow-2xl">
            {/* Header */}
            <div className="px-6 py-5 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500/20 to-purple-500/20 flex items-center justify-center">
                  <FolderOpen className="w-5 h-5 text-pink-400" />
                </div>
                <div>
                  <h3 className="text-white font-bold text-base">资产库</h3>
                  <p className="text-white/40 text-xs mt-0.5">管理你的素材资源，快速添加到项目</p>
                </div>
              </div>
              <button
                onClick={() => setShowAssetLibrary(false)}
                className="p-2 text-white/40 hover:text-white hover:bg-white/10 rounded-xl transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Tabs */}
            <div className="px-6 pt-4 flex items-center gap-2">
              <button
                onClick={() => setAssetTab('projects')}
                className={`px-4 py-2 text-sm font-medium rounded-full transition-all ${
                  assetTab === 'projects'
                    ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                我的项目
              </button>
              <button
                onClick={() => setAssetTab('scripts')}
                className={`px-4 py-2 text-sm font-medium rounded-full transition-all ${
                  assetTab === 'scripts'
                    ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                我的脚本
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 flex overflow-hidden">
              {/* Category sidebar */}
              <div className="w-44 border-r border-white/10 p-4 overflow-y-auto">
                <div className="text-white/40 text-xs font-semibold uppercase tracking-wider mb-3 px-2">分类</div>
                <div className="space-y-1">
                  {ASSET_CATEGORIES.map((cat) => (
                    <button
                      key={cat.key}
                      onClick={() => setAssetCategory(cat.key)}
                      className={`w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                        assetCategory === cat.key
                          ? 'bg-pink-500/20 text-pink-400 border border-pink-500/30'
                          : 'text-white/60 hover:bg-white/5 hover:text-white border border-transparent'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Asset grid */}
              <div className="flex-1 p-5 overflow-y-auto">
                {/* Search */}
                <div className="relative mb-4">
                  <Search className="w-4.5 h-4.5 text-white/40 absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="搜索素材..."
                    className="w-full pl-11 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-pink-500/50 focus:bg-white/10 transition-all"
                  />
                </div>

                {/* Grid */}
                <div className="grid grid-cols-3 gap-3.5">
                  {filteredAssets.map((asset) => (
                    <div
                      key={asset.id}
                      onClick={() => toggleAssetSelection(asset.id)}
                      className={`group relative aspect-square rounded-2xl overflow-hidden border-2 cursor-pointer transition-all ${
                        selectedAssets.includes(asset.id)
                          ? 'border-pink-500 ring-2 ring-pink-500/30'
                          : 'border-transparent hover:border-white/20'
                      }`}
                    >
                      <img
                        src={asset.image}
                        alt={asset.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      <div className="absolute bottom-0 left-0 right-0 p-3">
                        <div className="text-white text-sm font-medium truncate">{asset.name}</div>
                        <div className="text-white/50 text-xs mt-0.5 capitalize">{asset.category}</div>
                      </div>
                      {selectedAssets.includes(asset.id) && (
                        <div className="absolute top-3 right-3 w-6 h-6 bg-pink-500 rounded-full flex items-center justify-center shadow-lg">
                          <CheckSquare className="w-3.5 h-3.5 text-white" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-white/10 flex items-center justify-between bg-white/5">
              <button className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-pink-500/20 to-purple-500/20 text-pink-400 text-sm font-medium rounded-xl hover:from-pink-500/30 hover:to-purple-500/30 transition-all border border-pink-500/30">
                <Upload className="w-4 h-4" />
                导入素材
              </button>
              <div className="flex items-center gap-3">
                <span className="text-white/40 text-sm">
                  已选择 <span className="text-white/80 font-medium">{selectedAssets.length}</span> 项
                </span>
                <button className="flex items-center gap-1.5 px-3 py-2 text-white/60 hover:text-white text-sm transition-all">
                  <CheckSquare className="w-4 h-4" />
                  全选
                </button>
                <button className="flex items-center gap-1.5 px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white text-sm font-medium rounded-xl transition-all">
                  <Plus className="w-4 h-4" />
                  添加到项目
                </button>
                <button className="flex items-center gap-1.5 px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white text-sm font-medium rounded-xl transition-all">
                  <Download className="w-4 h-4" />
                  批量下载
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
