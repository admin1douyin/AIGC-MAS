import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Save,
  Undo,
  Redo,
  Play,
  Download,
  Eye,
  Pencil,
  Clock,
  Volume2,
  Camera,
  Music,
  Tag,
  Loader2,
  ArrowLeft,
  Plus,
} from 'lucide-react';
import { scriptApi, ScriptScene, VideoScript } from '../services/scriptApi';

const DEFAULT_SCENE: ScriptScene = {
  sceneNumber: 1,
  title: '新场景',
  duration: 15,
  location: '',
  description: '',
  cameraAngle: '中景',
  voiceover: '',
  dialogue: '',
  bgm: '',
  emotion: '专业',
};

export default function ScriptEditor() {
  const { id: projectId } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [script, setScript] = useState<VideoScript | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingScene, setEditingScene] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<'preview' | 'edit'>('preview');
  const [activeScene, setActiveScene] = useState(0);
  const [history, setHistory] = useState<ScriptScene[][]>([]);
  const [future, setFuture] = useState<ScriptScene[][]>([]);

  const loadScript = useCallback(async () => {
    if (!projectId) return;
    try {
      setLoading(true);
      const result = await scriptApi.list(projectId);
      if (result.success && result.data && result.data.length > 0) {
        const latest = result.data[0];
        const full = await scriptApi.get(latest.id);
        if (full.success && full.data) {
          setScript(full.data);
        } else {
          setScript(latest);
        }
      } else {
        // No script yet - leave null to show empty state
        setScript(null);
      }
    } catch (err) {
      console.error('Failed to load script:', err);
      setError('加载脚本失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    loadScript();
  }, [loadScript]);

  const scenes: ScriptScene[] = script?.scenes || [];

  const updateScene = (sceneIndex: number, field: string, value: string) => {
    if (!script) return;
    const nextScenes = scenes.map((s, i) =>
      i === sceneIndex ? { ...s, [field]: value } : s
    );
    setHistory((h) => [...h, scenes]);
    setFuture([]);
    setScript({ ...script, scenes: nextScenes });
  };

  const addScene = () => {
    if (!script) return;
    const newScene: ScriptScene = {
      ...DEFAULT_SCENE,
      sceneNumber: scenes.length + 1,
      title: `场景 ${scenes.length + 1}`,
    };
    setHistory((h) => [...h, scenes]);
    setFuture([]);
    setScript({ ...script, scenes: [...scenes, newScene] });
    setActiveScene(scenes.length);
    setViewMode('edit');
    setEditingScene(scenes.length);
  };

  const handleUndo = () => {
    if (history.length === 0 || !script) return;
    const prev = history[history.length - 1];
    setHistory((h) => h.slice(0, -1));
    setFuture((f) => [scenes, ...f]);
    setScript({ ...script, scenes: prev });
    if (activeScene >= prev.length) setActiveScene(Math.max(0, prev.length - 1));
  };

  const handleRedo = () => {
    if (future.length === 0 || !script) return;
    const next = future[0];
    setFuture((f) => f.slice(1));
    setHistory((h) => [...h, scenes]);
    setScript({ ...script, scenes: next });
  };

  const handleCreateScript = async () => {
    if (!projectId) return;
    try {
      setSaving(true);
      const result = await scriptApi.create({
        projectId,
        title: '未命名脚本',
        scenes: [{ ...DEFAULT_SCENE }],
      });
      if (result.success && result.data) {
        setScript(result.data);
        setViewMode('edit');
        setEditingScene(0);
      }
    } catch (err: any) {
      alert(err?.message || '创建脚本失败');
    } finally {
      setSaving(false);
    }
  };

  const handleSave = async () => {
    if (!script) return;
    try {
      setSaving(true);
      const result = await scriptApi.update(script.id, {
        title: script.title,
        scenes: script.scenes,
      });
      if (result.success && result.data) {
        setScript(result.data);
        setHistory([]);
        setFuture([]);
      }
    } catch (err: any) {
      alert(err?.message || '保存失败');
    } finally {
      setSaving(false);
    }
  };

  const handleDownload = () => {
    if (!script) return;
    const content = `# ${script.title}\n\n版本: v${script.version}\n总时长: ${script.totalDuration}秒\n场景数: ${scenes.length}\n\n${scenes
      .map((s, i) => `## 场景 ${i + 1}${s.title ? `: ${s.title}` : ''}\n\n- 时长: ${s.duration || 0}秒\n- 地点: ${s.location || '-'}\n- 镜头: ${s.cameraAngle || '-'}\n- 情绪: ${s.emotion || '-'}\n\n**场景描述:**\n${s.description || '-'}\n\n**旁白:**\n${s.voiceover || '-'}\n\n**对话:**\n${s.dialogue || '-'}\n\n**背景音乐:**\n${s.bgm || '-'}\n`)
      .join('\n---\n\n')}`;
    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${script.title || 'script'}-v${script.version}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getEmotionStyle = (emotion: string) => {
    const map: Record<string, string> = {
      庄重: 'bg-blue-100 text-blue-600',
      活力: 'bg-green-100 text-green-600',
      专业: 'bg-purple-100 text-purple-600',
      信任: 'bg-emerald-100 text-emerald-600',
      希望: 'bg-amber-100 text-amber-600',
      温馨: 'bg-pink-100 text-pink-600',
    };
    return map[emotion] || 'bg-slate-100 text-slate-600';
  };

  if (loading) {
    return (
      <div className="text-center py-16">
        <Loader2 className="w-10 h-10 mx-auto text-blue-500 animate-spin mb-3" />
        <p className="text-slate-500">正在加载脚本...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500 mb-4">{error}</p>
        <button
          onClick={loadScript}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          重新加载
        </button>
      </div>
    );
  }

  // Empty state - no script exists yet
  if (!script) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(`/app/projects/${projectId}`)}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">脚本编辑器</h1>
            <p className="text-slate-500 mt-1">该项目还没有脚本，点击下方按钮创建</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <Pencil className="w-16 h-16 mx-auto text-slate-300 mb-4" />
          <h3 className="text-lg font-semibold text-slate-700 mb-2">开始编写脚本</h3>
          <p className="text-slate-500 mb-6">创建一个新脚本，开始您的视频创作之旅</p>
          <button
            onClick={handleCreateScript}
            disabled={saving}
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
            创建脚本
          </button>
        </div>
      </div>
    );
  }

  const totalDuration = scenes.reduce((acc, s) => acc + (s.duration || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(`/app/projects/${projectId}`)}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">
              <input
                type="text"
                value={script.title}
                onChange={(e) => setScript({ ...script, title: e.target.value })}
                className="bg-transparent border-b-2 border-transparent hover:border-slate-200 focus:border-blue-500 focus:outline-none text-2xl font-bold text-slate-800"
              />
            </h1>
            <p className="text-slate-500 mt-1">
              共 {scenes.length} 个场景，总时长 {totalDuration} 秒 · v{script.version}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode('preview')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                viewMode === 'preview'
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Eye className="w-4 h-4" />
              预览
            </button>
            <button
              onClick={() => setViewMode('edit')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                viewMode === 'edit'
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Pencil className="w-4 h-4" />
              编辑
            </button>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleUndo}
              disabled={history.length === 0}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              title="撤销"
            >
              <Undo className="w-5 h-5" />
            </button>
            <button
              onClick={handleRedo}
              disabled={future.length === 0}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              title="重做"
            >
              <Redo className="w-5 h-5" />
            </button>
            <button
              onClick={handleDownload}
              className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              title="下载脚本"
            >
              <Download className="w-5 h-5" />
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
              保存修改
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Scene List */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-800">场景列表</h3>
              <button
                onClick={addScene}
                className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                title="添加场景"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-2">
              {scenes.map((scene, index) => (
                <div
                  key={index}
                  onClick={() => {
                    setActiveScene(index);
                    if (viewMode === 'edit') {
                      setEditingScene(index);
                    }
                  }}
                  className={`p-3 rounded-lg cursor-pointer transition-all ${
                    activeScene === index
                      ? 'bg-blue-50 border-2 border-blue-500'
                      : 'border border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                        activeScene === index ? 'bg-blue-500 text-white' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {index + 1}
                      </span>
                      <div>
                        <div className="font-medium text-slate-800 text-sm">{scene.title || `场景 ${index + 1}`}</div>
                        <div className="text-xs text-slate-500 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {scene.duration || 0}秒
                        </div>
                      </div>
                    </div>
                    <button className="p-1 text-slate-400 hover:text-blue-600">
                      <Play className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
              {scenes.length === 0 && (
                <p className="text-center text-slate-400 text-sm py-4">暂无场景</p>
              )}
            </div>
          </div>
        </div>

        {/* Preview/Edit Area */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            {scenes.length > 0 && scenes[activeScene] && (() => {
              const scene = scenes[activeScene];
              const isEditing = viewMode === 'edit' && editingScene === activeScene;
              return (
                <div className="space-y-6">
                  {/* Scene Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <span className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center text-xl font-bold">
                        {activeScene + 1}
                      </span>
                      <div>
                        {isEditing ? (
                          <input
                            type="text"
                            value={scene.title || ''}
                            onChange={(e) => updateScene(activeScene, 'title', e.target.value)}
                            className="text-xl font-bold text-slate-800 bg-transparent border-b-2 border-blue-500 focus:outline-none"
                          />
                        ) : (
                          <h2 className="text-xl font-bold text-slate-800">{scene.title || `场景 ${activeScene + 1}`}</h2>
                        )}
                        <div className="flex items-center gap-4 mt-1 text-sm text-slate-500">
                          <span className="flex items-center gap-1">
                            <Camera className="w-4 h-4" />
                            {isEditing ? (
                              <input
                                type="text"
                                value={scene.cameraAngle || ''}
                                onChange={(e) => updateScene(activeScene, 'cameraAngle', e.target.value)}
                                className="w-20 bg-transparent border-b border-slate-300 focus:outline-none focus:border-blue-500"
                              />
                            ) : (scene.cameraAngle || '-')}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {isEditing ? (
                              <input
                                type="number"
                                value={scene.duration || 0}
                                onChange={(e) => updateScene(activeScene, 'duration', e.target.value)}
                                className="w-16 bg-transparent border-b border-slate-300 focus:outline-none focus:border-blue-500"
                              />
                            ) : `${scene.duration || 0}秒`}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs ${getEmotionStyle(scene.emotion || '')}`}>
                            {scene.emotion || '专业'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Location */}
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Tag className="w-4 h-4 text-slate-400" />
                    拍摄地点：
                    {isEditing ? (
                      <input
                        type="text"
                        value={scene.location || ''}
                        onChange={(e) => updateScene(activeScene, 'location', e.target.value)}
                        className="flex-1 bg-transparent border-b border-slate-300 focus:outline-none focus:border-blue-500"
                      />
                    ) : (scene.location || '-')}
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      场景描述
                    </label>
                    {isEditing ? (
                      <textarea
                        value={scene.description || ''}
                        onChange={(e) => updateScene(activeScene, 'description', e.target.value)}
                        rows={3}
                        className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                      />
                    ) : (
                      <div className="p-4 bg-slate-50 rounded-lg text-slate-700 whitespace-pre-line">
                        {scene.description || '暂无描述'}
                      </div>
                    )}
                  </div>

                  {/* Voiceover */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
                      <Volume2 className="w-4 h-4" />
                      旁白
                    </label>
                    {isEditing ? (
                      <textarea
                        value={scene.voiceover || ''}
                        onChange={(e) => updateScene(activeScene, 'voiceover', e.target.value)}
                        rows={2}
                        className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                      />
                    ) : (
                      <div className="p-4 bg-blue-50 rounded-lg text-blue-800 border-l-4 border-blue-500 whitespace-pre-line">
                        {scene.voiceover || '暂无旁白'}
                      </div>
                    )}
                  </div>

                  {/* Dialogue */}
                  {(scene.dialogue || isEditing) && (
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        对话
                      </label>
                      {isEditing ? (
                        <textarea
                          value={scene.dialogue || ''}
                          onChange={(e) => updateScene(activeScene, 'dialogue', e.target.value)}
                          rows={3}
                          className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                        />
                      ) : (
                        <div className="p-4 bg-purple-50 rounded-lg text-purple-800 border-l-4 border-purple-500 whitespace-pre-line">
                          {scene.dialogue || '暂无对话'}
                        </div>
                      )}
                    </div>
                  )}

                  {/* BGM */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
                      <Music className="w-4 h-4" />
                      背景音乐
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={scene.bgm || ''}
                        onChange={(e) => updateScene(activeScene, 'bgm', e.target.value)}
                        className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    ) : (
                      <div className="p-3 bg-green-50 rounded-lg text-green-800 inline-flex items-center gap-2">
                        <Music className="w-4 h-4" />
                        {scene.bgm || '暂无配乐'}
                      </div>
                    )}
                  </div>
                </div>
              );
            })()}
            {scenes.length === 0 && (
              <div className="text-center py-8 text-slate-400">
                <p>暂无场景，点击左侧"+"按钮添加场景</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
