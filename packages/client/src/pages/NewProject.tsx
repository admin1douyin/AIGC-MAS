import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Film, Building2, MapPin, Zap, Check, Sparkles } from 'lucide-react';
import { projectApi } from '../services/projectApi';

const projectTypes = [
  {
    type: 'short_drama' as const,
    title: '短剧生产',
    desc: 'AI多智能体全流程协作，批量生产高质量短剧内容',
    icon: Film,
    gradient: 'from-primary to-warm',
    features: ['智能剧本创作', '角色自动设定', '分镜自动生成', '配音剪辑一体化'],
  },
  {
    type: 'corporate_video' as const,
    title: '企业视频营销',
    desc: '品牌分析+营销策划+视频制作，一站式企业解决方案',
    icon: Building2,
    gradient: 'from-teal to-primary',
    features: ['品牌深度分析', '营销方案策划', '专业脚本撰写', '高质量成片'],
  },
  {
    type: 'tourism_promo' as const,
    title: '文旅宣传',
    desc: '文化挖掘+故事创作+视觉呈现，打造地方文旅名片',
    icon: MapPin,
    gradient: 'from-warm to-state-warning',
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
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="mb-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-text-tertiary hover:text-text-primary mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          返回
        </button>
        <h1 className="vp-display text-3xl mb-2">新建项目</h1>
        <p className="vp-caption">创建一个新的AI视频制作项目</p>
      </div>

      <div className="flex items-center justify-center mb-10">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center">
            <div
              className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${
                step >= s
                  ? 'bg-gradient-primary text-white shadow-glow'
                  : 'bg-bg-surface text-text-tertiary border border-border'
              }`}
            >
              {step > s ? <Check className="w-4 h-4" /> : s}
            </div>
            {s < 3 && (
              <div
                className={`w-16 h-0.5 mx-3 ${
                  step > s ? 'bg-gradient-primary' : 'bg-border'
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {step === 1 && (
        <div className="space-y-6">
          <h2 className="vp-heading text-xl">选择项目类型</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {projectTypes.map((pt) => {
              const Icon = pt.icon;
              const isSelected = selectedType === pt.type;
              return (
                <div
                  key={pt.type}
                  onClick={() => setSelectedType(pt.type)}
                  className={`cursor-pointer p-6 rounded-xl transition-all duration-300 ${
                    isSelected
                      ? 'vp-glow-border bg-bg-surface scale-[1.02]'
                      : 'card-surface hover:scale-[1.01]'
                  }`}
                >
                  <div
                    className={`w-14 h-14 rounded-xl bg-gradient-to-br ${pt.gradient} flex items-center justify-center mb-5 shadow-lg`}
                  >
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{pt.title}</h3>
                  <p className="vp-caption text-sm mb-5">{pt.desc}</p>
                  <ul className="space-y-2">
                    {pt.features.map((f, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-sm">
                        <Check className="w-4 h-4 text-state-success flex-shrink-0" />
                        <span className="text-text-secondary">{f}</span>
                      </li>
                    ))}
                  </ul>
                  {isSelected && (
                    <div className="mt-5 pt-4 border-t border-border flex items-center gap-2 text-primary text-sm font-medium">
                      <Check className="w-4 h-4" />
                      已选择
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="flex justify-end pt-4">
            <button
              onClick={() => setStep(2)}
              disabled={!selectedType}
              className="btn-primary gap-2 disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none"
            >
              下一步
              <Zap className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-6 card-surface p-8">
          <h2 className="vp-heading text-xl">基本信息</h2>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              项目名称 <span className="text-state-error">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="请输入项目名称"
              className="w-full px-4 py-3 bg-bg border border-border rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-colors text-text-primary placeholder:text-text-tertiary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              项目描述
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="简要描述项目内容和目标"
              rows={3}
              className="w-full px-4 py-3 bg-bg border border-border rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-colors text-text-primary placeholder:text-text-tertiary resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              视频标题
            </label>
            <input
              type="text"
              value={formData.brief.title}
              onChange={(e) => setFormData({ ...formData, brief: { ...formData.brief, title: e.target.value } })}
              placeholder="视频成品的标题"
              className="w-full px-4 py-3 bg-bg border border-border rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-colors text-text-primary placeholder:text-text-tertiary"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                目标受众
              </label>
              <input
                type="text"
                value={formData.brief.targetAudience}
                onChange={(e) => setFormData({ ...formData, brief: { ...formData.brief, targetAudience: e.target.value } })}
                placeholder="如：18-35岁年轻人群"
                className="w-full px-4 py-3 bg-bg border border-border rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-colors text-text-primary placeholder:text-text-tertiary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                视频时长（秒）
              </label>
              <input
                type="number"
                value={formData.brief.duration}
                onChange={(e) => setFormData({ ...formData, brief: { ...formData.brief, duration: parseInt(e.target.value) || 0 } })}
                className="w-full px-4 py-3 bg-bg border border-border rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-colors text-text-primary placeholder:text-text-tertiary"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              风格
            </label>
            <input
              type="text"
              value={formData.brief.style}
              onChange={(e) => setFormData({ ...formData, brief: { ...formData.brief, style: e.target.value } })}
              placeholder="如：电影感、科技感、小清新、治愈系"
              className="w-full px-4 py-3 bg-bg border border-border rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-colors text-text-primary placeholder:text-text-tertiary"
            />
          </div>

          <div className="flex justify-between pt-4 border-t border-border">
            <button
              onClick={() => setStep(1)}
              className="btn-secondary"
            >
              上一步
            </button>
            <button
              onClick={() => setStep(3)}
              disabled={!formData.name}
              className="btn-primary disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none"
            >
              下一步
            </button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-6 card-surface p-8">
          <h2 className="vp-heading text-xl flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            详细需求
          </h2>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              项目目标
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={objectiveInput}
                onChange={(e) => setObjectiveInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addObjective())}
                placeholder="输入目标后按回车添加"
                className="flex-1 px-4 py-2.5 bg-bg border border-border rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-colors text-text-primary placeholder:text-text-tertiary"
              />
              <button
                onClick={addObjective}
                className="px-4 py-2.5 bg-bg-surface hover:bg-bg-surface-hover text-text-secondary rounded-lg text-sm transition-colors border border-border"
              >
                添加
              </button>
            </div>
            {formData.brief.objectives.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.brief.objectives.map((obj, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary-bg text-primary-light rounded-full text-sm border border-primary/20"
                  >
                    {obj}
                    <button
                      onClick={() => setFormData({
                        ...formData,
                        brief: { ...formData.brief, objectives: formData.brief.objectives.filter((_, i) => i !== idx) },
                      })}
                      className="hover:text-primary transition-colors"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              核心信息
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={keyMessageInput}
                onChange={(e) => setKeyMessageInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addKeyMessage())}
                placeholder="输入核心信息后按回车添加"
                className="flex-1 px-4 py-2.5 bg-bg border border-border rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-colors text-text-primary placeholder:text-text-tertiary"
              />
              <button
                onClick={addKeyMessage}
                className="px-4 py-2.5 bg-bg-surface hover:bg-bg-surface-hover text-text-secondary rounded-lg text-sm transition-colors border border-border"
              >
                添加
              </button>
            </div>
            {formData.brief.keyMessages.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.brief.keyMessages.map((msg, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-teal/10 text-teal rounded-full text-sm border border-teal/20"
                  >
                    {msg}
                    <button
                      onClick={() => setFormData({
                        ...formData,
                        brief: { ...formData.brief, keyMessages: formData.brief.keyMessages.filter((_, i) => i !== idx) },
                      })}
                      className="hover:text-teal-light transition-colors"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              详细需求说明
            </label>
            <textarea
              value={formData.brief.requirements}
              onChange={(e) => setFormData({ ...formData, brief: { ...formData.brief, requirements: e.target.value } })}
              placeholder="详细描述您的需求和特殊要求..."
              rows={4}
              className="w-full px-4 py-3 bg-bg border border-border rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-colors text-text-primary placeholder:text-text-tertiary resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              标签
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                placeholder="输入标签后按回车添加"
                className="flex-1 px-4 py-2.5 bg-bg border border-border rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-colors text-text-primary placeholder:text-text-tertiary"
              />
              <button
                onClick={addTag}
                className="px-4 py-2.5 bg-bg-surface hover:bg-bg-surface-hover text-text-secondary rounded-lg text-sm transition-colors border border-border"
              >
                添加
              </button>
            </div>
            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-warm/10 text-warm rounded-full text-sm border border-warm/20"
                  >
                    {tag}
                    <button onClick={() => removeTag(tag)} className="hover:text-warm-light transition-colors">
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-between pt-5 border-t border-border">
            <button
              onClick={() => setStep(2)}
              className="btn-secondary"
            >
              上一步
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitting || !formData.name}
              className="btn-primary gap-2 disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none"
            >
              {submitting ? '创建中...' : '创建项目'}
              <Sparkles className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
