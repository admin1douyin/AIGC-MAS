import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Film,
  Building,
  MapPin,
  Zap,
  Check,
} from 'lucide-react';
import { projectApi } from '../services/projectApi';

const projectTypes = [
  {
    type: 'short_drama' as const,
    title: '短剧生产',
    desc: 'AI 生成短剧剧本、分镜、配音、剪辑全流程自动化',
    icon: Film,
    gradient: 'from-blue-500 to-cyan-500',
    features: ['智能剧本创作', '角色自动设定', '分镜自动生成', '配音剪辑一体化'],
  },
  {
    type: 'corporate_video' as const,
    title: '企业视频营销',
    desc: '企业宣传片、产品视频、营销视频一站式制作服务',
    icon: Building,
    gradient: 'from-emerald-500 to-teal-500',
    features: ['品牌深度分析', '营销方案策划', '专业脚本撰写', '高质量成片'],
  },
  {
    type: 'tourism_promo' as const,
    title: '文旅宣传',
    desc: '地方文旅宣传片、景点介绍、民俗文化视频制作',
    icon: MapPin,
    gradient: 'from-amber-500 to-orange-500',
    features: ['文化深度调研', '景点特色挖掘', '民俗风情展现', '绝美画面呈现'],
  },
];

export default function NewProject() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [selectedType, setSelectedType] = useState<string>('');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    brief: {
      title: '',
      targetAudience: '',
      duration: 120,
      style: '',
      objectives: [] as string[],
      keyMessages: [] as string[],
      requirements: '',
    },
    tags: [] as string[],
  });
  const [tagInput, setTagInput] = useState('');
  const [objectiveInput, setObjectiveInput] = useState('');
  const [keyMessageInput, setKeyMessageInput] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!selectedType || !formData.name) return;
    setSubmitting(true);
    try {
      const res: any = await projectApi.create({
        name: formData.name,
        type: selectedType as any,
        description: formData.description,
        brief: formData.brief,
        tags: formData.tags,
      });
      if (res.success) {
        navigate(`/projects/${res.data.id}`);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData({ ...formData, tags: [...formData.tags, tagInput.trim()] });
      setTagInput('');
    }
  };

  const removeTag = (tag: string) => {
    setFormData({ ...formData, tags: formData.tags.filter((t) => t !== tag) });
  };

  const addObjective = () => {
    if (objectiveInput.trim() && !formData.brief.objectives.includes(objectiveInput.trim())) {
      setFormData({
        ...formData,
        brief: { ...formData.brief, objectives: [...formData.brief.objectives, objectiveInput.trim()] },
      });
      setObjectiveInput('');
    }
  };

  const addKeyMessage = () => {
    if (keyMessageInput.trim() && !formData.brief.keyMessages.includes(keyMessageInput.trim())) {
      setFormData({
        ...formData,
        brief: { ...formData.brief, keyMessages: [...formData.brief.keyMessages, keyMessageInput.trim()] },
      });
      setKeyMessageInput('');
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-700 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          返回
        </button>
        <h1 className="text-2xl font-bold text-slate-800">新建项目</h1>
        <p className="text-slate-500 mt-1">创建一个新的视频制作项目</p>
      </div>

      {/* Steps */}
      <div className="flex items-center justify-center mb-8">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step >= s
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-200 text-slate-500'
              }`}
            >
              {step > s ? <Check className="w-4 h-4" /> : s}
            </div>
            {s < 3 && (
              <div
                className={`w-16 h-0.5 mx-2 ${
                  step > s ? 'bg-blue-600' : 'bg-slate-200'
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step 1: Select Type */}
      {step === 1 && (
        <div className="space-y-6">
          <h2 className="text-lg font-semibold text-slate-800">选择项目类型</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {projectTypes.map((pt) => {
              const Icon = pt.icon;
              const isSelected = selectedType === pt.type;
              return (
                <div
                  key={pt.type}
                  onClick={() => setSelectedType(pt.type)}
                  className={`cursor-pointer p-5 border-2 rounded-xl transition-all ${
                    isSelected
                      ? 'border-blue-500 bg-blue-50/50'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div
                    className={`w-12 h-12 rounded-xl bg-gradient-to-br ${pt.gradient} flex items-center justify-center mb-4`}
                  >
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-slate-800 mb-2">{pt.title}</h3>
                  <p className="text-sm text-slate-500 mb-4">{pt.desc}</p>
                  <ul className="space-y-1.5">
                    {pt.features.map((f, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-sm text-slate-600">
                        <Check className="w-4 h-4 text-emerald-500" />
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>

          <div className="flex justify-end">
            <button
              onClick={() => setStep(2)}
              disabled={!selectedType}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              下一步
              <Zap className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Basic Info */}
      {step === 2 && (
        <div className="space-y-6 bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="text-lg font-semibold text-slate-800">基本信息</h2>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              项目名称 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="请输入项目名称"
              className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              项目描述
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="简要描述项目内容和目标"
              rows={3}
              className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              视频标题
            </label>
            <input
              type="text"
              value={formData.brief.title}
              onChange={(e) => setFormData({ ...formData, brief: { ...formData.brief, title: e.target.value } })}
              placeholder="视频成品的标题"
              className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                目标受众
              </label>
              <input
                type="text"
                value={formData.brief.targetAudience}
                onChange={(e) => setFormData({ ...formData, brief: { ...formData.brief, targetAudience: e.target.value } })}
                placeholder="如：18-35岁年轻人群"
                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                视频时长（秒）
              </label>
              <input
                type="number"
                value={formData.brief.duration}
                onChange={(e) => setFormData({ ...formData, brief: { ...formData.brief, duration: parseInt(e.target.value) || 0 } })}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              风格
            </label>
            <input
              type="text"
              value={formData.brief.style}
              onChange={(e) => setFormData({ ...formData, brief: { ...formData.brief, style: e.target.value } })}
              placeholder="如：电影感、科技感、小清新、治愈系"
              className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex justify-between">
            <button
              onClick={() => setStep(1)}
              className="px-6 py-2.5 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-lg font-medium transition-colors"
            >
              上一步
            </button>
            <button
              onClick={() => setStep(3)}
              disabled={!formData.name}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
            >
              下一步
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Details */}
      {step === 3 && (
        <div className="space-y-6 bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="text-lg font-semibold text-slate-800">详细需求</h2>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              项目目标
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={objectiveInput}
                onChange={(e) => setObjectiveInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addObjective())}
                placeholder="输入目标后按回车添加"
                className="flex-1 px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={addObjective}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-sm"
              >
                添加
              </button>
            </div>
            {formData.brief.objectives.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.brief.objectives.map((obj, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 text-blue-600 rounded-full text-sm"
                  >
                    {obj}
                    <button
                      onClick={() => setFormData({
                        ...formData,
                        brief: { ...formData.brief, objectives: formData.brief.objectives.filter((_, i) => i !== idx) },
                      })}
                      className="hover:text-blue-800"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              核心信息
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={keyMessageInput}
                onChange={(e) => setKeyMessageInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addKeyMessage())}
                placeholder="输入核心信息后按回车添加"
                className="flex-1 px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={addKeyMessage}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-sm"
              >
                添加
              </button>
            </div>
            {formData.brief.keyMessages.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.brief.keyMessages.map((msg, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-600 rounded-full text-sm"
                  >
                    {msg}
                    <button
                      onClick={() => setFormData({
                        ...formData,
                        brief: { ...formData.brief, keyMessages: formData.brief.keyMessages.filter((_, i) => i !== idx) },
                      })}
                      className="hover:text-emerald-800"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              详细需求说明
            </label>
            <textarea
              value={formData.brief.requirements}
              onChange={(e) => setFormData({ ...formData, brief: { ...formData.brief, requirements: e.target.value } })}
              placeholder="详细描述您的需求和特殊要求..."
              rows={4}
              className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              标签
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                placeholder="输入标签后按回车添加"
                className="flex-1 px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={addTag}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-sm"
              >
                添加
              </button>
            </div>
            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-50 text-amber-600 rounded-full text-sm"
                  >
                    {tag}
                    <button onClick={() => removeTag(tag)} className="hover:text-amber-800">
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-between pt-4 border-t border-slate-100">
            <button
              onClick={() => setStep(2)}
              className="px-6 py-2.5 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-lg font-medium transition-colors"
            >
              上一步
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitting || !formData.name}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              {submitting ? '创建中...' : '创建项目'}
              <Zap className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
