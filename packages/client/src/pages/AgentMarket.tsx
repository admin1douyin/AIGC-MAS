import { useState } from 'react';
import {
  Bot,
  Search,
  Filter,
  Star,
  Users,
  Award,
  CheckCircle,
} from 'lucide-react';

const mockAgents = [
  {
    id: '1',
    name: '项目经理',
    role: 'project_manager',
    description: '负责整体项目规划、进度跟踪和团队协调，确保项目按时高质量交付',
    capabilities: ['项目规划', '任务分配', '进度跟踪', '风险管理', '质量把控', '团队协调'],
    personality: ['严谨', '高效', '目标导向'],
    rating: 4.9,
    usageCount: 12580,
    successRate: 98.5,
    price: '免费',
    tier: '基础',
    icon: '👔',
  },
  {
    id: '2',
    name: '编剧',
    role: 'script_writer',
    description: '负责视频脚本创作、剧情设计和台词撰写，擅长创作吸引人的故事内容',
    capabilities: ['剧本创作', '角色设计', '剧情编排', '台词撰写', '分镜脚本', '节奏把控'],
    personality: ['创意丰富', '故事感强', '细腻'],
    rating: 4.8,
    usageCount: 9820,
    successRate: 97.2,
    price: '免费',
    tier: '基础',
    icon: '✍️',
  },
  {
    id: '3',
    name: '分镜师',
    role: 'storyboard_artist',
    description: '负责分镜设计、视觉构图和画面规划，将脚本转化为专业的视觉语言',
    capabilities: ['分镜设计', '视觉构图', '镜头语言', '场景设计', '画面节奏', '运镜设计'],
    personality: ['视觉感强', '细致', '有空间感'],
    rating: 4.7,
    usageCount: 8540,
    successRate: 96.8,
    price: '免费',
    tier: '基础',
    icon: '🎬',
  },
  {
    id: '4',
    name: '配音演员',
    role: 'voice_actor',
    description: '负责旁白配音、角色配音和语音合成，提供专业的音频录制服务',
    capabilities: ['旁白配音', '角色配音', '语音合成', '情感表达', '语速控制', '语气把握'],
    personality: ['表现力强', '声音有磁性', '情感丰富'],
    rating: 4.9,
    usageCount: 7620,
    successRate: 98.1,
    price: '专业版',
    tier: '高级',
    icon: '🎙️',
  },
  {
    id: '5',
    name: '视频剪辑师',
    role: 'video_editor',
    description: '负责视频剪辑、特效制作和后期合成，将素材剪辑成完整的视频作品',
    capabilities: ['视频剪辑', '特效制作', '调色', '转场设计', '成品输出', '节奏把控'],
    personality: ['节奏感强', '技术娴熟', '追求完美'],
    rating: 4.8,
    usageCount: 9150,
    successRate: 97.6,
    price: '免费',
    tier: '基础',
    icon: '✂️',
  },
  {
    id: '6',
    name: '营销策划师',
    role: 'marketing_strategist',
    description: '负责营销策略制定、卖点提炼和传播规划，帮助视频获得更好的传播效果',
    capabilities: ['市场分析', '营销策略', '卖点提炼', '传播规划', '效果评估', '用户洞察'],
    personality: ['市场敏感度高', '策略性强', '数据驱动'],
    rating: 4.6,
    usageCount: 6280,
    successRate: 95.4,
    price: '专业版',
    tier: '高级',
    icon: '📊',
  },
  {
    id: '7',
    name: '品牌分析师',
    role: 'brand_analyst',
    description: '负责品牌分析、定位和视觉规范，确保视频内容符合品牌调性',
    capabilities: ['品牌分析', '品牌定位', '视觉规范', '竞品分析', '调性把控', '品牌故事'],
    personality: ['品牌思维', '洞察力强', '系统化'],
    rating: 4.5,
    usageCount: 5430,
    successRate: 94.8,
    price: '专业版',
    tier: '高级',
    icon: '🏷️',
  },
  {
    id: '8',
    name: '文化研究员',
    role: 'culture_researcher',
    description: '负责文化调研、地方特色挖掘和内容策划，为文旅视频提供文化支撑',
    capabilities: ['文化调研', '地方特色', '历史研究', '民俗挖掘', '内容策划', '故事挖掘'],
    personality: ['好奇心强', '研究型', '文化底蕴深'],
    rating: 4.7,
    usageCount: 4180,
    successRate: 96.2,
    price: '专业版',
    tier: '高级',
    icon: '📚',
  },
  {
    id: '9',
    name: '音乐设计师',
    role: 'music_composer',
    description: '负责背景音乐、音效设计和音频制作，为视频增添情感氛围',
    capabilities: ['配乐创作', '音效设计', '音频混音', '情绪音乐', '版权音乐', '声音设计'],
    personality: ['音乐感强', '细腻', '有创造力'],
    rating: 4.8,
    usageCount: 6850,
    successRate: 97.3,
    price: '专业版',
    tier: '高级',
    icon: '🎵',
  },
  {
    id: '10',
    name: '质量审核员',
    role: 'quality_inspector',
    description: '负责内容质量审核、合规检查和最终验收，确保输出达到商用标准',
    capabilities: ['质量审核', '合规检查', '内容审查', '技术质检', '最终验收', '标准把控'],
    personality: ['严谨', '细致', '原则性强'],
    rating: 4.9,
    usageCount: 8920,
    successRate: 99.1,
    price: '免费',
    tier: '基础',
    icon: '✅',
  },
];

type TierType = 'all' | '基础' | '高级';

export default function AgentMarket() {
  const [agents] = useState(mockAgents);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTier, setSelectedTier] = useState<TierType>('all');
  const [sortBy, setSortBy] = useState<'rating' | 'usage' | 'success'>('rating');

  const filteredAgents = agents
    .filter((agent) => {
      const matchesSearch = agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        agent.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesTier = selectedTier === 'all' || agent.tier === selectedTier;
      return matchesSearch && matchesTier;
    })
    .sort((a, b) => {
      if (sortBy === 'rating') return b.rating - a.rating;
      if (sortBy === 'usage') return b.usageCount - a.usageCount;
      return b.successRate - a.successRate;
    });

  const getTierStyle = (tier: string) => {
    switch (tier) {
      case '基础':
        return 'bg-emerald-100 text-emerald-700';
      case '高级':
        return 'bg-blue-100 text-blue-700';
      default:
        return 'bg-slate-100 text-slate-600';
    }
  };

  const getPriceStyle = (price: string) => {
    if (price === '免费') return 'text-emerald-600';
    return 'text-blue-600';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">智能体市场</h1>
        <p className="text-slate-500 mt-1">
          探索平台上的专业智能体，选择适合您项目的AI合作伙伴
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: '智能体总数', value: agents.length, icon: Bot },
          { label: '累计使用次数', value: '10万+', icon: Users },
          { label: '平均成功率', value: '97%', icon: CheckCircle },
        ].map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div key={idx} className="bg-white rounded-xl p-4 border border-slate-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                  <Icon className="w-5 h-5 text-slate-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-slate-800">{stat.value}</div>
                  <div className="text-sm text-slate-500">{stat.label}</div>
                </div>
              </div>
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
              placeholder="搜索智能体名称或描述..."
              className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex gap-2">
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <select
                value={selectedTier}
                onChange={(e) => setSelectedTier(e.target.value as TierType)}
                className="pl-10 pr-8 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white cursor-pointer"
              >
                <option value="all">全部等级</option>
                <option value="基础">基础版</option>
                <option value="高级">专业版</option>
              </select>
            </div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white cursor-pointer"
            >
              <option value="rating">按评分排序</option>
              <option value="usage">按使用次数排序</option>
              <option value="success">按成功率排序</option>
            </select>
          </div>
        </div>
      </div>

      {/* Agents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAgents.map((agent) => (
          <div
            key={agent.id}
            className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:border-blue-300 hover:shadow-lg transition-all"
          >
            {/* Header */}
            <div className="p-5">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center text-3xl">
                    {agent.icon}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 text-lg">{agent.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`px-2 py-0.5 rounded-full text-xs ${getTierStyle(agent.tier)}`}>
                        {agent.tier}
                      </span>
                      <span className={`text-sm font-medium ${getPriceStyle(agent.price)}`}>
                        {agent.price}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <p className="text-sm text-slate-600 mt-4 line-clamp-2">
                {agent.description}
              </p>
            </div>

            {/* Stats */}
            <div className="px-5 py-3 bg-slate-50 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                  <span className="text-sm font-medium text-slate-700">{agent.rating}</span>
                  <span className="text-xs text-slate-400">评分</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4 text-blue-500" />
                  <span className="text-sm font-medium text-slate-700">{(agent.usageCount / 1000).toFixed(1)}k</span>
                  <span className="text-xs text-slate-400">使用</span>
                </div>
                <div className="flex items-center gap-1">
                  <Award className="w-4 h-4 text-emerald-500" />
                  <span className="text-sm font-medium text-slate-700">{agent.successRate}%</span>
                  <span className="text-xs text-slate-400">成功</span>
                </div>
              </div>
            </div>

            {/* Capabilities */}
            <div className="p-5 border-t border-slate-100">
              <div className="text-xs font-medium text-slate-500 mb-2">能力标签</div>
              <div className="flex flex-wrap gap-2">
                {agent.capabilities.slice(0, 4).map((cap, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 bg-blue-50 text-blue-600 rounded-full text-xs"
                  >
                    {cap}
                  </span>
                ))}
              </div>
            </div>

            {/* Personality */}
            <div className="p-5 bg-gradient-to-br from-blue-50/50 to-purple-50/50">
              <div className="text-xs font-medium text-slate-500 mb-2">性格特质</div>
              <div className="flex flex-wrap gap-2">
                {agent.personality.map((p, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 bg-white text-slate-600 rounded-full text-xs border border-slate-200"
                  >
                    {p}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredAgents.length === 0 && (
        <div className="text-center py-12">
          <Bot className="w-16 h-16 mx-auto text-slate-300 mb-4" />
          <p className="text-slate-500">未找到匹配的智能体</p>
        </div>
      )}
    </div>
  );
}