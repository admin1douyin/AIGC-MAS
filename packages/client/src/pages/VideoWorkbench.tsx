import { useState, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Plus,
  Type,
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
  Package,
  Download,
  CheckSquare,
  ExternalLink,
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

const NODE_TYPES = [
  { type: 'script', label: '短视频脚本', icon: FileText },
  { type: 'storyboard', label: '分镜', icon: Layers },
  { type: 'asset', label: '资产', icon: Package },
  { type: 'preview', label: '预演图', icon: ImageIcon },
  { type: 'video', label: '视频', icon: Video },
  { type: 'text', label: '文本', icon: Type },
  { type: 'image', label: '图片', icon: ImageIcon },
  { type: 'audio', label: '音频', icon: Music },
  { type: 'upload', label: '上传', icon: Upload },
  { type: 'history', label: '从生成历史选择', icon: History },
];

const ASSET_CATEGORIES = [
  { key: 'all', label: '全部' },
  { key: 'character', label: '人物' },
  { key: 'scene', label: '场景' },
  { key: 'prop', label: '道具' },
];

const MOCK_ASSETS = [
  { id: '1', name: '豆浆打包杯', category: 'prop', image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=300&h=300&fit=crop' },
  { id: '2', name: '外卖头盔', category: 'prop', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=300&fit=crop' },
  { id: '3', name: '早餐煎饼车', category: 'prop', image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=300&h=300&fit=crop' },
];

const MOCK_VIDEO_TASKS = [
  { id: 'smv_2071576896524503840', type: '视频生成', progress: 0, status: 'processing', time: '2026-06-28 20:58:08', points: '-0' },
  { id: 'smv_2071189716727533568', type: '视频生成', progress: 100, status: 'completed', time: '2026-06-28 19:35:14', points: '-120' },
  { id: 'smv_207118912540033024', type: '视频生成', progress: 100, status: 'completed', time: '2026-06-28 19:08:59', points: '-120' },
  { id: 'smv_2071188828116985872', type: '视频生成', progress: 100, status: 'completed', time: '2026-06-28 19:07:52', points: '-120' },
  { id: 'smv_2071185749698080768', type: '视频生成', progress: 100, status: 'completed', time: '2026-06-28 18:55:38', points: '-120' },
  { id: 'smv_2071133247389375104', type: '视频生成', progress: 100, status: 'completed', time: '2026-06-28 18:06:15', points: '-120' },
  { id: 'smv_20711331753876810752', type: '视频生成', progress: 100, status: 'completed', time: '2026-06-28 18:06:13', points: '-120' },
  { id: 'smv_2071186589833684480', type: '视频生成', progress: 100, status: 'completed', time: '2026-06-28 17:35:48', points: '-120' },
];

export default function VideoWorkbench() {
  const { id: projectId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLDivElement>(null);
  const [nodes, setNodes] = useState<WorkbenchNode[]>([]);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [showNodeMenu, setShowNodeMenu] = useState(false);
  const [nodeMenuPosition, setNodeMenuPosition] = useState({ x: 0, y: 0 });
  const [showAssetLibrary, setShowAssetLibrary] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
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
      x: nodeMenuPosition.x - 100 + pan.x,
      y: nodeMenuPosition.y - 40 + pan.y,
      width: 280,
      height: type === 'script' ? 200 : type === 'preview' ? 220 : 180,
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
    setDraggingNode(nodeId);
    setDragOffset({
      x: e.clientX - rect.left - (node.x - pan.x),
      y: e.clientY - rect.top - (node.y - pan.y),
    });
    setSelectedNode(nodeId);
    setShowNodeMenu(false);
  };

  const handleCanvasMouseMove = useCallback((e: React.MouseEvent) => {
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();

    if (draggingNode) {
      setNodes((prev) =>
        prev.map((n) =>
          n.id === draggingNode
            ? { ...n, x: e.clientX - rect.left - dragOffset.x + pan.x, y: e.clientY - rect.top - dragOffset.y + pan.y }
            : n
        )
      );
    } else if (isPanning) {
      setPan({
        x: dragStart.x - e.clientX + pan.x * 0 + e.clientX * 0,
        y: dragStart.y - e.clientY + pan.y * 0 + e.clientY * 0,
      });
      setPan((prev) => ({
        x: prev.x + (dragStart.x - e.clientX) * -1 + 0,
        y: prev.y + (dragStart.y - e.clientY) * -1 + 0,
      }));
      setDragStart({ x: e.clientX, y: e.clientY });
    }
  }, [draggingNode, dragOffset, isPanning, dragStart, pan]);

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

  return (
    <div className="h-screen bg-black flex flex-col overflow-hidden">
      {/* Top Bar */}
      <header className="h-12 bg-black/80 backdrop-blur border-b border-white/10 flex items-center justify-between px-4 flex-shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(`/app/projects/${projectId}`)}
            className="p-1.5 text-white/60 hover:text-white hover:bg-white/10 rounded transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-gradient-to-br from-pink-500 to-purple-500 flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-white text-sm font-medium">{projectName}</span>
            <span className="text-white/40 text-sm">|</span>
            <span className="text-pink-400 text-sm font-medium">{projectMode}</span>
            <button className="p-1 text-white/40 hover:text-white/60">
              <Settings className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button className="flex items-center gap-1.5 px-3 py-1 text-white/80 hover:text-white text-sm transition-colors">
            <Sparkles className="w-4 h-4 text-yellow-400" />
            邀请有礼
          </button>
          <button
            onClick={() => setShowVideoDetail(true)}
            className="flex items-center gap-1.5 px-3 py-1 text-white/80 hover:text-white text-sm transition-colors"
          >
            <Film className="w-4 h-4" />
            视频详细
          </button>
          <div className="flex items-center gap-1.5 px-3 py-1 bg-white/5 rounded-full">
            <div className="w-3 h-3 rounded-full bg-pink-500" />
            <span className="text-white text-sm font-medium">2780.4</span>
          </div>
          <button className="px-3 py-1 bg-gradient-to-r from-pink-500 to-purple-500 text-white text-sm font-medium rounded-full hover:opacity-90 transition-opacity">
            订阅
          </button>
          <button className="p-1.5 text-white/60 hover:text-white hover:bg-white/10 rounded transition-colors">
            <div className="w-4 h-4 relative">
              <div className="absolute top-0 left-0 w-1.5 h-1.5 rounded-full bg-red-500" />
              <div className="absolute bottom-0 right-0 w-1.5 h-1.5 rounded-full bg-red-500" />
            </div>
          </button>
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-pink-500 to-purple-500 flex items-center justify-center text-white text-xs font-medium">
            U
          </div>
        </div>
      </header>

      {/* Main Canvas Area */}
      <div className="flex-1 relative overflow-hidden">
        {/* Canvas */}
        <div
          ref={canvasRef}
          className="absolute inset-0 cursor-crosshair"
          style={{
            backgroundImage: `
              radial-gradient(circle at 1px 1px, rgba(255,255,255,0.08) 1px, transparent 0)
            `,
            backgroundSize: `${20 * (zoom / 100)}px ${20 * (zoom / 100)}px`,
            backgroundPosition: `${pan.x % (20 * (zoom / 100))}px ${pan.y % (20 * (zoom / 100))}px`,
          }}
          onClick={handleCanvasClick}
          onContextMenu={handleCanvasRightClick}
          onMouseMove={handleCanvasMouseMove}
          onMouseUp={handleCanvasMouseUp}
          onMouseLeave={handleCanvasMouseUp}
          onMouseDown={handleMiddleMouseDown}
        >
          {/* Empty state hint */}
          {nodes.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center">
                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-3">
                  <MousePointer2 className="w-5 h-5 text-white/40" />
                </div>
                <p className="text-white/40 text-sm">右键画布 添加短视频脚本 或 分镜镜头</p>
              </div>
            </div>
          )}

          {/* Nodes */}
          {nodes.map((node) => (
            <div
              key={node.id}
              className={`absolute rounded-lg border transition-shadow ${
                selectedNode === node.id
                  ? 'border-pink-500 shadow-lg shadow-pink-500/20'
                  : 'border-white/10 hover:border-white/20'
              }`}
              style={{
                left: node.x - pan.x,
                top: node.y - pan.y,
                width: node.width,
                minHeight: node.height,
                transform: `scale(${zoom / 100})`,
                transformOrigin: 'top left',
              }}
              onMouseDown={(e) => handleNodeMouseDown(e, node.id)}
              onClick={(e) => {
                e.stopPropagation();
                setSelectedNode(node.id);
              }}
            >
              {/* Node Header */}
              <div className="bg-white/5 backdrop-blur border-b border-white/10 px-3 py-2 rounded-t-lg flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="w-3.5 h-3.5 text-white/60" />
                  <span className="text-white/80 text-xs font-medium">{node.title}</span>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteNode(node.id);
                  }}
                  className="p-0.5 text-white/40 hover:text-white hover:bg-white/10 rounded transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>

              {/* Node Content */}
              <div className="bg-black/40 backdrop-blur p-3 rounded-b-lg">
                {node.type === 'script' && (
                  <div className="space-y-2">
                    <div className="text-white/90 text-sm leading-relaxed">
                      纯天然海南椰子，3个叶子萃取1瓶椰子水；
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-white/40 text-xs">脚本节点</span>
                    </div>
                  </div>
                )}
                {node.type === 'preview' && (
                  <div className="space-y-3">
                    <div className="aspect-video bg-white/5 rounded-lg flex items-center justify-center border border-white/10">
                      <ImageIcon className="w-8 h-8 text-white/20" />
                    </div>
                    <div className="flex gap-2">
                      <button className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-white/5 hover:bg-white/10 text-white/70 text-xs rounded border border-white/10 transition-colors">
                        <Upload className="w-3.5 h-3.5" />
                        本地上传预演图
                      </button>
                      <button className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-white/5 hover:bg-white/10 text-white/70 text-xs rounded border border-white/10 transition-colors">
                        <History className="w-3.5 h-3.5" />
                        历史上传预演图
                      </button>
                    </div>
                  </div>
                )}
                {node.type === 'storyboard' && (
                  <div className="space-y-2">
                    <div className="aspect-video bg-gradient-to-br from-pink-500/20 to-purple-500/20 rounded-lg flex items-center justify-center border border-white/10">
                      <Layers className="w-8 h-8 text-white/40" />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-white/40 text-xs">分镜节点</span>
                      <button className="flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-pink-500 to-purple-500 text-white text-xs rounded-full">
                        <Sparkles className="w-3 h-3" />
                        生成分镜 · 2
                      </button>
                    </div>
                  </div>
                )}
                {node.type !== 'script' && node.type !== 'preview' && node.type !== 'storyboard' && (
                  <div className="py-4 text-center">
                    <div className="w-8 h-8 mx-auto mb-2 rounded-lg bg-white/5 flex items-center justify-center">
                      {node.type === 'video' && <Video className="w-4 h-4 text-white/40" />}
                      {node.type === 'image' && <ImageIcon className="w-4 h-4 text-white/40" />}
                      {node.type === 'audio' && <Music className="w-4 h-4 text-white/40" />}
                      {node.type === 'text' && <Type className="w-4 h-4 text-white/40" />}
                      {node.type === 'asset' && <Package className="w-4 h-4 text-white/40" />}
                    </div>
                    <p className="text-white/40 text-xs">{node.title}</p>
                  </div>
                )}
              </div>

              {/* Connection points */}
              <div
                className="absolute -left-1.5 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white/20 border-2 border-black/50 hover:bg-pink-500 cursor-pointer transition-colors"
              />
              <div
                className="absolute -right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white/20 border-2 border-black/50 hover:bg-pink-500 cursor-pointer transition-colors"
              />
            </div>
          ))}

          {/* Right click menu */}
          {showNodeMenu && (
            <div
              className="absolute z-50 bg-zinc-900/95 backdrop-blur border border-white/10 rounded-xl py-2 w-48 shadow-2xl"
              style={{ left: nodeMenuPosition.x, top: nodeMenuPosition.y }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="px-3 py-1.5 text-white/40 text-xs font-medium">添加节点</div>
              {NODE_TYPES.map((nodeType) => {
                const Icon = nodeType.icon;
                return (
                  <button
                    key={nodeType.type}
                    onClick={() => addNode(nodeType.type)}
                    className="w-full flex items-center gap-2 px-3 py-2 text-white/70 hover:bg-white/10 hover:text-white text-sm transition-colors"
                  >
                    <Icon className="w-4 h-4" />
                    {nodeType.label}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Bottom Toolbar */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-zinc-900/90 backdrop-blur border border-white/10 rounded-full px-2 py-1.5">
          <button
            onClick={() => setShowAssetLibrary(true)}
            className="w-9 h-9 flex items-center justify-center bg-gradient-to-br from-pink-500 to-purple-500 text-white rounded-full hover:opacity-90 transition-opacity"
            title="添加节点"
          >
            <Plus className="w-5 h-5" />
          </button>
          <div className="w-px h-5 bg-white/10 mx-1" />
          <button className="w-9 h-9 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 rounded-full transition-colors">
            <MousePointer2 className="w-4 h-4" />
          </button>
          <button className="w-9 h-9 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 rounded-full transition-colors">
            <Move className="w-4 h-4" />
          </button>
          <div className="w-px h-5 bg-white/10 mx-1" />
          <button className="w-9 h-9 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 rounded-full transition-colors">
            <Settings className="w-4 h-4" />
          </button>
          <button className="w-9 h-9 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 rounded-full transition-colors">
            <Layers className="w-4 h-4" />
          </button>
          <div className="w-px h-5 bg-white/10 mx-1" />
          <button className="w-9 h-9 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 rounded-full transition-colors">
            <Grid3X3 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setShowSettings(true)}
            className="w-9 h-9 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 rounded-full transition-colors"
          >
            <Settings className="w-4 h-4" />
          </button>
          <button className="w-9 h-9 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 rounded-full transition-colors">
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>

        {/* Bottom Left Zoom Controls */}
        <div className="absolute bottom-4 left-4 flex items-center gap-1 bg-zinc-900/90 backdrop-blur border border-white/10 rounded-lg px-1 py-1">
          <button className="w-7 h-7 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 rounded transition-colors">
            <div className="w-3 h-3 border border-current rounded" />
          </button>
          <button className="w-7 h-7 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 rounded transition-colors">
            <Move className="w-4 h-4" />
          </button>
          <button
            onClick={handleZoomOut}
            className="w-7 h-7 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 rounded transition-colors"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <span className="text-white/60 text-xs px-1 min-w-[42px] text-center">{zoom}%</span>
          <button
            onClick={handleZoomIn}
            className="w-7 h-7 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 rounded transition-colors"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
        </div>

        {/* Right Sidebar - Node Properties */}
        {selectedNode && (
          <div className="absolute top-4 right-4 w-72 bg-zinc-900/90 backdrop-blur border border-white/10 rounded-xl overflow-hidden">
            <div className="px-3 py-2 border-b border-white/10 flex items-center justify-between">
              <span className="text-white/80 text-sm font-medium">节点属性</span>
              <button
                onClick={() => setSelectedNode(null)}
                className="p-1 text-white/40 hover:text-white transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="p-3 space-y-3 max-h-[calc(100vh-200px)] overflow-y-auto">
              <div>
                <label className="text-white/40 text-xs mb-1.5 block">节点标题</label>
                <input
                  type="text"
                  value={nodes.find((n) => n.id === selectedNode)?.title || ''}
                  onChange={(e) => {
                    setNodes((prev) =>
                      prev.map((n) =>
                        n.id === selectedNode ? { ...n, title: e.target.value } : n
                      )
                    );
                  }}
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-pink-500/50"
                />
              </div>
              <div>
                <label className="text-white/40 text-xs mb-1.5 block">节点描述</label>
                <textarea
                  rows={3}
                  placeholder="输入节点描述..."
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-pink-500/50 resize-none"
                />
              </div>
              {nodes.find((n) => n.id === selectedNode)?.type === 'preview' && (
                <button className="w-full flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-pink-500 to-purple-500 text-white text-sm font-medium rounded-lg hover:opacity-90 transition-opacity">
                  <Sparkles className="w-4 h-4" />
                  生成预演图 · 3.8
                </button>
              )}
              {nodes.find((n) => n.id === selectedNode)?.type === 'storyboard' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-white/60 text-sm">镜头数量</span>
                    <div className="flex items-center gap-2">
                      <button className="w-6 h-6 flex items-center justify-center bg-white/5 hover:bg-white/10 text-white/60 rounded transition-colors">
                        -
                      </button>
                      <span className="text-white text-sm w-6 text-center">1</span>
                      <button className="w-6 h-6 flex items-center justify-center bg-white/5 hover:bg-white/10 text-white/60 rounded transition-colors">
                        +
                      </button>
                    </div>
                  </div>
                  <button className="w-full flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-pink-500 to-purple-500 text-white text-sm font-medium rounded-lg hover:opacity-90 transition-opacity">
                    <Sparkles className="w-4 h-4" />
                    生成分镜 · 2
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Right sidebar user list */}
        {!selectedNode && (
          <div className="absolute top-4 right-4 w-10 bg-zinc-900/90 backdrop-blur border border-white/10 rounded-xl py-2 flex flex-col items-center gap-2">
            <button className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
              <div className="w-5 h-5 border-l-2 border-r-2 border-current" />
            </button>
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="w-7 h-7 rounded-full bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center text-white text-xs"
              >
                {String.fromCharCode(64 + i)}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Asset Library Modal */}
      {showAssetLibrary && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="w-[800px] max-h-[70vh] bg-zinc-900 border border-white/10 rounded-2xl overflow-hidden flex flex-col">
            {/* Header */}
            <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FolderOpen className="w-5 h-5 text-pink-400" />
                <h3 className="text-white font-semibold">资产库</h3>
              </div>
              <button
                onClick={() => setShowAssetLibrary(false)}
                className="p-1.5 text-white/40 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Tabs */}
            <div className="px-5 pt-4 flex items-center gap-2">
              <button
                onClick={() => setAssetTab('projects')}
                className={`px-4 py-1.5 text-sm font-medium rounded-full transition-colors ${
                  assetTab === 'projects'
                    ? 'bg-pink-500 text-white'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                我的项目
              </button>
              <button
                onClick={() => setAssetTab('scripts')}
                className={`px-4 py-1.5 text-sm font-medium rounded-full transition-colors ${
                  assetTab === 'scripts'
                    ? 'bg-pink-500 text-white'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                我的剧本
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 flex overflow-hidden">
              {/* Project list */}
              <div className="w-48 border-r border-white/10 p-3 overflow-y-auto">
                <div className="text-white/40 text-xs mb-2 px-2">项目</div>
                {['001', '002', '003', '测试1', '测试2', '测试3', '测试4', '测试5', '测试6', '测试7', '测试8', '测试9', '测试10'].map(
                  (item, idx) => (
                    <button
                      key={idx}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                        idx === 1
                          ? 'bg-pink-500/20 text-pink-400'
                          : 'text-white/60 hover:bg-white/5 hover:text-white'
                      }`}
                    >
                      {item}
                    </button>
                  )
                )}
              </div>

              {/* Asset grid */}
              <div className="flex-1 p-4 overflow-y-auto">
                {/* Category tabs */}
                <div className="flex items-center gap-2 mb-4">
                  {ASSET_CATEGORIES.map((cat) => (
                    <button
                      key={cat.key}
                      onClick={() => setAssetCategory(cat.key)}
                      className={`px-3 py-1 text-sm font-medium rounded-full transition-colors ${
                        assetCategory === cat.key
                          ? 'bg-pink-500 text-white'
                          : 'text-white/60 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                  <div className="flex-1" />
                  <div className="relative">
                    <Search className="w-4 h-4 text-white/40 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="搜索"
                      className="pl-9 pr-4 py-1.5 bg-white/5 border border-white/10 rounded-full text-white text-sm focus:outline-none focus:border-pink-500/50 w-40"
                    />
                  </div>
                </div>

                {/* Asset grid */}
                <div className="grid grid-cols-3 gap-3">
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
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                        <div className="flex items-center justify-between">
                          <span className="text-white text-xs">{asset.name}</span>
                          <button className="p-0.5 text-white/40 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity">
                            <div className="w-3 h-3 flex items-center justify-center">
                              <div className="w-1 h-1 bg-current rounded-full" />
                              <div className="absolute w-1 h-3 bg-current" />
                              <div className="absolute w-3 h-1 bg-current" />
                            </div>
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
            </div>

            {/* Footer */}
            <div className="px-5 py-3 border-t border-white/10 flex items-center justify-between">
              <button className="flex items-center gap-2 px-4 py-2 bg-pink-500/20 text-pink-400 text-sm font-medium rounded-full hover:bg-pink-500/30 transition-colors">
                <Upload className="w-4 h-4" />
                导入素材
              </button>
              <div className="flex items-center gap-3">
                <span className="text-white/40 text-xs">
                  已选择 {selectedAssets.length} 项
                </span>
                <button className="flex items-center gap-1.5 px-3 py-1.5 text-white/60 hover:text-white text-sm transition-colors">
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
      )}

      {/* Settings Modal */}
      {showSettings && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="w-[560px] max-h-[70vh] bg-zinc-900 border border-white/10 rounded-2xl overflow-hidden flex flex-col">
            {/* Header */}
            <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-pink-400" />
                <h3 className="text-white font-semibold">设置</h3>
              </div>
              <button
                onClick={() => setShowSettings(false)}
                className="p-1.5 text-white/40 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 p-5 overflow-y-auto space-y-6">
              <p className="text-white/60 text-sm">
                设置尺寸、分辨率、模型、风格、色彩饱和度和方向精准可控。
              </p>

              {/* 尺寸 */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-4 h-4 border border-white/40 rounded-sm" />
                  <span className="text-white/80 text-sm font-medium">尺寸</span>
                </div>
                <div className="flex gap-2">
                  {['16:9', '9:16', '21:9'].map((ratio) => (
                    <button
                      key={ratio}
                      className={`px-4 py-2 text-sm rounded-lg border transition-colors ${
                        ratio === '16:9'
                          ? 'bg-pink-500/20 border-pink-500 text-pink-400'
                          : 'bg-white/5 border-white/10 text-white/60 hover:border-white/20'
                      }`}
                    >
                      {ratio}
                    </button>
                  ))}
                </div>
              </div>

              {/* 分辨率 */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-4 h-4 border border-white/40" />
                  <span className="text-white/80 text-sm font-medium">分辨率</span>
                </div>
                <div className="flex gap-2">
                  {['480P', '720P', '1080P'].map((res) => (
                    <button
                      key={res}
                      className={`px-4 py-2 text-sm rounded-lg border transition-colors ${
                        res === '1080P'
                          ? 'bg-pink-500/20 border-pink-500 text-pink-400'
                          : 'bg-white/5 border-white/10 text-white/60 hover:border-white/20'
                      }`}
                    >
                      {res}
                    </button>
                  ))}
                </div>
              </div>

              {/* 模型 */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-4 h-4 rounded-full border border-white/40" />
                  <span className="text-white/80 text-sm font-medium">模型</span>
                </div>
                <div className="flex gap-2">
                  {['Seedance 2.0', 'Seedance 2.0 Fast', 'Seedance 2.0 Mini'].map(
                    (model) => (
                      <button
                        key={model}
                        className={`px-4 py-2 text-sm rounded-lg border transition-colors ${
                          model === 'Seedance 2.0'
                            ? 'bg-pink-500/20 border-pink-500 text-pink-400'
                            : 'bg-white/5 border-white/10 text-white/60 hover:border-white/20'
                        }`}
                      >
                        {model}
                      </button>
                    )
                  )}
                </div>
              </div>

              {/* 时长 */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-4 h-4 border-l-2 border-white/40" />
                  <span className="text-white/80 text-sm font-medium">时长</span>
                </div>
                <div className="grid grid-cols-5 gap-2">
                  {['4S', '5S', '6S', '7S', '8S', '9S', '10S', '11S', '12S', '13S', '14S', '15S'].map(
                    (duration) => (
                      <button
                        key={duration}
                        className={`py-2 text-sm rounded-lg border transition-colors ${
                          duration === '15S'
                            ? 'bg-pink-500/20 border-pink-500 text-pink-400'
                            : 'bg-white/5 border-white/10 text-white/60 hover:border-white/20'
                        }`}
                      >
                        {duration}
                      </button>
                    )
                  )}
                </div>
              </div>

              {/* 风格 */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-4 h-4 border border-white/40 rotate-45" />
                  <span className="text-white/80 text-sm font-medium">风格</span>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { name: '真人风格', img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop' },
                    { name: '动漫风格', img: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=100&h=100&fit=crop' },
                    { name: '3D卡通', img: 'https://images.unsplash.com/photo-1612036782180-6f0b6cd846fe?w=100&h=100&fit=crop' },
                    { name: '赛博朋克', img: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=100&h=100&fit=crop' },
                  ].map((style, idx) => (
                    <button
                      key={idx}
                      className={`rounded-lg overflow-hidden border-2 transition-colors ${
                        idx === 0
                          ? 'border-pink-500'
                          : 'border-transparent hover:border-white/20'
                      }`}
                    >
                      <img src={style.img} alt={style.name} className="w-full aspect-square object-cover" />
                      <div className="py-1 text-center text-xs text-white/60 bg-white/5">
                        {style.name}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Summary */}
              <div className="pt-2">
                <p className="text-white/40 text-xs">
                  已选择：16:9尺寸—1080P分辨率—Seedance 2.0模型—15S时长—真人风格—默认色彩饱和度
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="px-5 py-4 border-t border-white/10 flex items-center justify-between">
              <span className="text-white/40 text-sm">视频： 8.3 /秒</span>
              <button
                onClick={() => setShowSettings(false)}
                className="px-6 py-2 bg-gradient-to-r from-pink-500 to-purple-500 text-white font-medium rounded-xl hover:opacity-90 transition-opacity"
              >
                确定
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Video Detail Modal */}
      {showVideoDetail && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="w-[900px] max-h-[75vh] bg-zinc-900 border border-white/10 rounded-2xl overflow-hidden flex flex-col">
            {/* Header */}
            <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Film className="w-5 h-5 text-pink-400" />
                <h3 className="text-white font-semibold">视频详情</h3>
              </div>
              <button
                onClick={() => setShowVideoDetail(false)}
                className="p-1.5 text-white/40 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Tabs */}
            <div className="px-5 pt-4">
              <div className="flex items-center gap-2 bg-white/5 rounded-full p-1">
                {[
                  { key: 'all', label: '全部' },
                  { key: 'processing', label: '进行中' },
                  { key: 'completed', label: '已完成' },
                  { key: 'failed', label: '已失败' },
                ].map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setVideoDetailTab(tab.key as any)}
                    className={`flex-1 py-2 text-sm font-medium rounded-full transition-colors ${
                      videoDetailTab === tab.key
                        ? 'bg-white/10 text-white'
                        : 'text-white/60 hover:text-white'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Table */}
            <div className="flex-1 overflow-y-auto p-5">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left py-3 text-xs font-medium text-white/40">任务号</th>
                    <th className="text-left py-3 text-xs font-medium text-white/40">生成类型</th>
                    <th className="text-left py-3 text-xs font-medium text-white/40">生成进度</th>
                    <th className="text-left py-3 text-xs font-medium text-white/40">生成状态</th>
                    <th className="text-left py-3 text-xs font-medium text-white/40">时间</th>
                    <th className="text-left py-3 text-xs font-medium text-white/40">消耗积分</th>
                    <th className="text-right py-3 text-xs font-medium text-white/40">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {MOCK_VIDEO_TASKS
                    .filter((task) => {
                      if (videoDetailTab === 'all') return true;
                      if (videoDetailTab === 'processing') return task.status === 'processing';
                      if (videoDetailTab === 'completed') return task.status === 'completed';
                      if (videoDetailTab === 'failed') return task.status === 'failed';
                      return true;
                    })
                    .map((task) => (
                      <tr key={task.id} className="hover:bg-white/5">
                        <td className="py-3">
                          <span className="text-white/70 text-sm font-mono">{task.id}</span>
                        </td>
                        <td className="py-3">
                          <span className="text-white/70 text-sm">{task.type}</span>
                        </td>
                        <td className="py-3">
                          <span className="text-white/70 text-sm">{task.progress}%</span>
                        </td>
                        <td className="py-3">
                          <span
                            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                              task.status === 'completed'
                                ? 'bg-green-500/20 text-green-400'
                                : task.status === 'processing'
                                ? 'bg-orange-500/20 text-orange-400'
                                : 'bg-red-500/20 text-red-400'
                            }`}
                          >
                            {task.status === 'completed'
                              ? '已完成'
                              : task.status === 'processing'
                              ? '正在生成中'
                              : '失败'}
                          </span>
                        </td>
                        <td className="py-3">
                          <span className="text-white/50 text-sm">{task.time}</span>
                        </td>
                        <td className="py-3">
                          <span className="text-pink-400 text-sm font-medium">{task.points}</span>
                        </td>
                        <td className="py-3 text-right">
                          <button className="inline-flex items-center gap-1 px-3 py-1.5 border border-white/20 text-white/80 text-sm rounded-full hover:bg-white/10 transition-colors">
                            <ExternalLink className="w-3.5 h-3.5" />
                            打开
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Back to top button */}
      <button
        onClick={handleResetView}
        className="absolute bottom-4 right-4 w-10 h-10 bg-zinc-900/90 backdrop-blur border border-white/10 rounded-full flex items-center justify-center text-white/60 hover:text-white hover:bg-zinc-800 transition-all"
      >
        <div className="w-3 h-3 border-t-2 border-l-2 border-current -rotate-45" />
      </button>
    </div>
  );
}
