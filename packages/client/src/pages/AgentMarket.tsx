import { useState, useEffect } from 'react';
import {
  Bot,
  Search,
  Filter,
  Star,
  Users,
  Award,
  CheckCircle,
  Loader2,
} from 'lucide-react';
import { agentApi } from '../services/agentApi';

interface RegistryAgent {
  role: string;
  name: string;
  description: string;
  capabilities: string[];
  personality?: string[];
  systemPrompt?: string;
}

// Role-based metadata: tier, price, icon, and indicative stats
const ROLE_META: Record<string, { tier: '基础' | '高级'; price: string; icon: string; rating: number; usageCount: number; successRate: number }> = {
  project_manager: { tier: '基础', price: '免费', icon: '👔', rating: 4.9, usageCount: 12580, successRate: 98.5 },
  creative_director: { tier: '高级', price: '专业版', icon: '🎨', rating: 4.8, usageCount: 7320, successRate: 97.4 },
  script_writer: { tier: '基础', price: '免费', icon: '✍️', rating: 4.8, usageCount: 9820, successRate: 97.2 },
  storyboard_artist: { tier: '基础', price: '免费', icon: '🎬', rating: 4.7, usageCount: 8540, successRate: 96.8 },
  voice_actor: { tier: '高级', price: '专业版', icon: '🎙️', rating: 4.9, usageCount: 7620, successRate: 98.1 },
  video_editor: { tier: '基础', price: '免费', icon: '✂️', rating: 4.8, usageCount: 9150, successRate: 97.6 },
  marketing_strategist: { tier: '高级', price: '专业版', icon: '📊', rating: 4.6, usageCount: 6280, successRate: 95.4 },
  brand_analyst: { tier: '高级', price: '专业版', icon: '🏷️', rating: 4.5, usageCount: 5430, successRate: 94.8 },
  culture_researcher: { tier: '高级', price: '专业版', icon: '📚', rating: 4.7, usageCount: 4180, successRate: 96.2 },
  music_composer: { tier: '高级', price: '专业版', icon: '🎵', rating: 4.8, usageCount: 6850, successRate: 97.3 },
  quality_inspector: { tier: '基础', price: '免费', icon: '✅', rating: 4.9, usageCount: 8920, successRate: 99.1 },
  data_analyst: { tier: '高级', price: '专业版', icon: '📈', rating: 4.6, usageCount: 3260, successRate: 95.9 },
};

type TierType = 'all' | '基础' | '高级';

interface DisplayAgent extends RegistryAgent {
  tier: '基础' | '高级';
  price: string;
  icon: string;
  rating: number;
  usageCount: number;
  successRate: number;
}

export default function AgentMarket() {
  const [agents, setAgents] = useState<DisplayAgent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTier, setSelectedTier] = useState<TierType>('all');
  const [sortBy, setSortBy] = useState<'rating' | 'usage' | 'success'>('rating');

  useEffect(() => {
    loadAgents();
  }, []);

  const loadAgents = async () => {
    try {
      setLoading(true);
      const result = await agentApi.getRegistry();
      if (result.success && Array.isArray(result.data)) {
        const mapped: DisplayAgent[] = result.data.map((agent: RegistryAgent) => {
          const meta = ROLE_META[agent.role] || { tier: '基础' as const, price: '免费', icon: '🤖', rating: 4.5, usageCount: 1000, successRate: 95.0 };
          return {
            ...agent,
            tier: meta.tier,
            price: meta.price,
            icon: meta.icon,
            rating: meta.rating,
            usageCount: meta.usageCount,
            successRate: meta.successRate,
          };
        });
        setAgents(mapped);
      } else {
        setError('加载智能体失败');
      }
    } catch (err) {
      console.error('Failed to load agents:', err);
      setError('加载智能体失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

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
          { label: '智能体总数', value: loading ? '-' : agents.length, icon: Bot },
          { label: '累计使用次数', value: '10万+', icon: Users },
          { label: '平均成功率', value: loading ? '-' : (agents.length ? `${Math.round(agents.reduce((acc, a) => acc + a.successRate, 0) / agents.length * 10) / 10}%` : '97%'), icon: CheckCircle },
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

      {/* Loading State */}
      {loading && (
        <div className="text-center py-16">
          <Loader2 className="w-10 h-10 mx-auto text-blue-500 animate-spin mb-3" />
          <p className="text-slate-500">正在加载智能体列表...</p>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="text-center py-12">
          <Bot className="w-16 h-16 mx-auto text-slate-300 mb-4" />
          <p className="text-slate-500 mb-4">{error}</p>
          <button
            onClick={loadAgents}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            重新加载
          </button>
        </div>
      )}

      {/* Agents Grid */}
      {!loading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAgents.map((agent) => (
            <div
              key={agent.role}
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
              {agent.personality && agent.personality.length > 0 && (
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
              )}
            </div>
          ))}
        </div>
      )}

      {!loading && !error && filteredAgents.length === 0 && (
        <div className="text-center py-12">
          <Bot className="w-16 h-16 mx-auto text-slate-300 mb-4" />
          <p className="text-slate-500">未找到匹配的智能体</p>
        </div>
      )}
    </div>
  );
}
