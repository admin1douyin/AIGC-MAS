import { useState } from 'react';
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
} from 'lucide-react';

const mockScript = {
  id: '1',
  title: '企业宣传片脚本',
  version: 1,
  totalDuration: 180,
  createdAt: '2024-01-15',
  scenes: [
    {
      id: 1,
      sceneNumber: 1,
      title: '开场画面',
      duration: 15,
      location: '企业大楼外部',
      description: '航拍企业大楼外观，展示现代化建筑风格',
      cameraAngle: '全景',
      voiceover: '欢迎来到创新科技的前沿阵地',
      dialogue: '',
      bgm: '激昂大气的背景音乐',
      emotion: '庄重',
    },
    {
      id: 2,
      sceneNumber: 2,
      title: '团队介绍',
      duration: 25,
      location: '办公室内部',
      description: '展示团队成员工作场景，体现团队协作精神',
      cameraAngle: '中景',
      voiceover: '我们汇聚了行业顶尖人才',
      dialogue: '',
      bgm: '轻松愉悦的背景音乐',
      emotion: '活力',
    },
    {
      id: 3,
      sceneNumber: 3,
      title: '产品展示',
      duration: 30,
      location: '产品展示区',
      description: '特写展示核心产品功能和特点',
      cameraAngle: '特写',
      voiceover: '每一款产品都凝聚着我们的智慧与匠心',
      dialogue: '',
      bgm: '科技感背景音乐',
      emotion: '专业',
    },
    {
      id: 4,
      sceneNumber: 4,
      title: '客户案例',
      duration: 20,
      location: '会议室',
      description: '展示客户合作案例和成功数据',
      cameraAngle: '中景',
      voiceover: '已经服务超过1000家企业客户',
      dialogue: '',
      bgm: '信任感背景音乐',
      emotion: '信任',
    },
    {
      id: 5,
      sceneNumber: 5,
      title: '未来展望',
      duration: 20,
      location: '未来概念场景',
      description: '展示企业愿景和未来规划',
      cameraAngle: '全景',
      voiceover: '携手共进，共创美好未来',
      dialogue: '',
      bgm: '充满希望的背景音乐',
      emotion: '希望',
    },
    {
      id: 6,
      sceneNumber: 6,
      title: '结尾',
      duration: 10,
      location: '企业大楼夜景',
      description: '企业logo展示，联系方式',
      cameraAngle: '全景',
      voiceover: '期待与您的合作',
      dialogue: '',
      bgm: '收尾音乐',
      emotion: '温馨',
    },
  ],
};

export default function ScriptEditor() {
  const [script, setScript] = useState(mockScript);
  const [editingScene, setEditingScene] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<'preview' | 'edit'>('preview');
  const [activeScene, setActiveScene] = useState(0);

  const updateScene = (sceneId: number, field: string, value: string) => {
    setScript({
      ...script,
      scenes: script.scenes.map((s) =>
        s.id === sceneId ? { ...s, [field]: value } : s
      ),
    });
  };

  const handleSave = () => {
    setScript({ ...script, version: script.version + 1 });
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">脚本编辑器</h1>
          <p className="text-slate-500 mt-1">
            编辑和预览视频脚本内容，共 {script.scenes.length} 个场景，总时长 {script.totalDuration} 秒
          </p>
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
            <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
              <Undo className="w-5 h-5" />
            </button>
            <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
              <Redo className="w-5 h-5" />
            </button>
            <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
              <Download className="w-5 h-5" />
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
            >
              <Save className="w-5 h-5" />
              保存修改
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Scene List */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <h3 className="font-semibold text-slate-800 mb-4">场景列表</h3>
            <div className="space-y-2">
              {script.scenes.map((scene, index) => (
                <div
                  key={scene.id}
                  onClick={() => {
                    setActiveScene(index);
                    if (viewMode === 'edit') {
                      setEditingScene(scene.id);
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
                        {scene.sceneNumber}
                      </span>
                      <div>
                        <div className="font-medium text-slate-800 text-sm">{scene.title}</div>
                        <div className="text-xs text-slate-500 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {scene.duration}秒
                        </div>
                      </div>
                    </div>
                    <button className="p-1 text-slate-400 hover:text-blue-600">
                      <Play className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Preview/Edit Area */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            {script.scenes.length > 0 && (() => {
              const scene = script.scenes[activeScene];
              return (
                <div className="space-y-6">
                  {/* Scene Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <span className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center text-xl font-bold">
                        {scene.sceneNumber}
                      </span>
                      <div>
                        <h2 className="text-xl font-bold text-slate-800">{scene.title}</h2>
                        <div className="flex items-center gap-4 mt-1 text-sm text-slate-500">
                          <span className="flex items-center gap-1">
                            <Camera className="w-4 h-4" />
                            {scene.cameraAngle}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {scene.duration}秒
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs ${getEmotionStyle(scene.emotion)}`}>
                            {scene.emotion}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Location */}
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Tag className="w-4 h-4 text-slate-400" />
                    拍摄地点：{scene.location}
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      场景描述
                    </label>
                    {viewMode === 'edit' && editingScene === scene.id ? (
                      <textarea
                        value={scene.description}
                        onChange={(e) => updateScene(scene.id, 'description', e.target.value)}
                        rows={3}
                        className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                      />
                    ) : (
                      <div className="p-4 bg-slate-50 rounded-lg text-slate-700">
                        {scene.description}
                      </div>
                    )}
                  </div>

                  {/* Voiceover */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
                      <Volume2 className="w-4 h-4" />
                      旁白
                    </label>
                    {viewMode === 'edit' && editingScene === scene.id ? (
                      <textarea
                        value={scene.voiceover}
                        onChange={(e) => updateScene(scene.id, 'voiceover', e.target.value)}
                        rows={2}
                        className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                      />
                    ) : (
                      <div className="p-4 bg-blue-50 rounded-lg text-blue-800 border-l-4 border-blue-500">
                        {scene.voiceover}
                      </div>
                    )}
                  </div>

                  {/* Dialogue */}
                  {scene.dialogue && (
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        对话
                      </label>
                      {viewMode === 'edit' && editingScene === scene.id ? (
                        <textarea
                          value={scene.dialogue}
                          onChange={(e) => updateScene(scene.id, 'dialogue', e.target.value)}
                          rows={3}
                          className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                        />
                      ) : (
                        <div className="p-4 bg-purple-50 rounded-lg text-purple-800 border-l-4 border-purple-500 whitespace-pre-line">
                          {scene.dialogue}
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
                    {viewMode === 'edit' && editingScene === scene.id ? (
                      <input
                        type="text"
                        value={scene.bgm}
                        onChange={(e) => updateScene(scene.id, 'bgm', e.target.value)}
                        className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    ) : (
                      <div className="p-3 bg-green-50 rounded-lg text-green-800 inline-flex items-center gap-2">
                        <Music className="w-4 h-4" />
                        {scene.bgm}
                      </div>
                    )}
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      </div>
    </div>
  );
}