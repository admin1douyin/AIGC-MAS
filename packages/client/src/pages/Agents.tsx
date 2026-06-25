import { useState, useEffect } from 'react';
import { Bot, Zap, Shield, Clock, Users } from 'lucide-react';
import { agentApi } from '../services/agentApi';

export default function Agents() {
  const [agents, setAgents] = useState<any[]>([]);
  const [registry, setRegistry] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAgents();
  }, []);

  const loadAgents = async () => {
    try {
      const [agentsRes, registryRes]: any[] = await Promise.all([
        agentApi.list(),
        agentApi.getRegistry(),
      ]);
      if (agentsRes.success) setAgents(agentsRes.data);
      if (registryRes.success) setRegistry(registryRes.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const stats = [
    { label: '智能体类型', value: registry.length, icon: Bot, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: '活跃智能体', value: agents.filter(a => a.status === 'working').length, icon: Zap, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: '空闲智能体', value: agents.filter(a => a.status === 'idle').length, icon: Clock, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: '协作项目', value: new Set(agents.map(a => a.projectId).filter(Boolean)).size, icon: Users, color: 'text-purple-600', bg: 'bg-purple-50' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">智能体管理</h1>
        <p className="text-slate-500 mt-1">管理和监控平台中的 AI 智能体</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div key={idx} className="bg-white rounded-xl p-5 border border-slate-200">
              <div className={`w-10 h-10 ${stat.bg} rounded-lg flex items-center justify-center mb-3`}>
                <Icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <div className="text-2xl font-bold text-slate-800">{stat.value}</div>
              <div className="text-sm text-slate-500">{stat.label}</div>
            </div>
          );
        })}
      </div>

      {/* Agent Registry */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h2 className="text-lg font-semibold text-slate-800 mb-4">智能体角色</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {registry.map((agent, idx) => (
            <div
              key={idx}
              className="p-4 border border-slate-200 rounded-xl hover:border-slate-300 hover:shadow-sm transition-all"
            >
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center flex-shrink-0">
                  <Bot className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-slate-800">{agent.name}</h3>
                  <p className="text-sm text-slate-500 mt-0.5">{agent.description}</p>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-1.5">
                {agent.capabilities?.slice(0, 4).map((cap: string, i: number) => (
                  <span
                    key={i}
                    className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-xs"
                  >
                    {cap}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Active Agents */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-800">智能体实例</h2>
          <span className="text-sm text-slate-500">共 {agents.length} 个</span>
        </div>

        {loading ? (
          <div className="text-center py-12 text-slate-400">加载中...</div>
        ) : agents.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            <Bot className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>暂无智能体实例</p>
            <p className="text-sm mt-1">启动项目后将自动创建智能体</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">
                    智能体
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">
                    角色
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">
                    状态
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">
                    当前任务
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">
                    更新时间
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {agents.map((agent) => (
                  <tr key={agent.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                          <Bot className="w-5 h-5 text-white" />
                        </div>
                        <span className="font-medium text-slate-800">{agent.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600">
                      {agent.role}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${getAgentStatusStyle(agent.status)}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${getAgentStatusDot(agent.status)}`} />
                        {getAgentStatusLabel(agent.status)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-500">
                      {agent.currentTaskId || '-'}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-500">
                      {new Date(agent.updatedAt).toLocaleString('zh-CN')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Agent Workflow */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h2 className="text-lg font-semibold text-slate-800 mb-6">协作工作流</h2>
        <div className="flex items-center justify-between flex-wrap gap-4">
          {[
            { name: '项目经理', desc: '项目规划与协调', color: 'from-blue-500 to-blue-600' },
            { name: '品牌/文化分析', desc: '深度调研分析', color: 'from-purple-500 to-purple-600' },
            { name: '编剧', desc: '脚本内容创作', color: 'from-pink-500 to-rose-600' },
            { name: '分镜师', desc: '视觉画面设计', color: 'from-amber-500 to-orange-600' },
            { name: '配音演员', desc: '语音合成录制', color: 'from-emerald-500 to-teal-600' },
            { name: '音乐设计', desc: '配乐音效制作', color: 'from-cyan-500 to-blue-600' },
            { name: '视频剪辑', desc: '剪辑合成输出', color: 'from-violet-500 to-purple-600' },
            { name: '质量审核', desc: '最终质量验收', color: 'from-slate-500 to-slate-700' },
          ].map((step, idx) => (
            <div key={idx} className="flex items-center">
              <div className="flex flex-col items-center">
                <div className={`w-14 h-14 rounded-full bg-gradient-to-br ${step.color} flex items-center justify-center text-white shadow-lg`}>
                  <span className="text-lg font-bold">{idx + 1}</span>
                </div>
                <div className="mt-2 text-center">
                  <div className="text-sm font-medium text-slate-800">{step.name}</div>
                  <div className="text-xs text-slate-500">{step.desc}</div>
                </div>
              </div>
              {idx < 7 && (
                <div className="w-6 h-0.5 bg-slate-200 mx-2 hidden md:block" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Features */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          {
            icon: Zap,
            title: '高效协同',
            desc: '多智能体并行协作，大幅提升制作效率',
            color: 'text-amber-500',
          },
          {
            icon: Shield,
            title: '质量保障',
            desc: '多层级质量审核，确保输出内容品质',
            color: 'text-emerald-500',
          },
          {
            icon: Users,
            title: '角色丰富',
            desc: '10+ 专业角色智能体，覆盖全流程',
            color: 'text-blue-500',
          },
        ].map((item, idx) => {
          const Icon = item.icon;
          return (
            <div key={idx} className="bg-white rounded-xl p-5 border border-slate-200">
              <Icon className={`w-8 h-8 ${item.color} mb-3`} />
              <h3 className="font-semibold text-slate-800 mb-1">{item.title}</h3>
              <p className="text-sm text-slate-500">{item.desc}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function getAgentStatusLabel(status: string) {
  const map: Record<string, string> = {
    idle: '空闲',
    working: '工作中',
    paused: '暂停',
    error: '异常',
  };
  return map[status] || status;
}

function getAgentStatusStyle(status: string) {
  const map: Record<string, string> = {
    idle: 'bg-slate-100 text-slate-600',
    working: 'bg-blue-100 text-blue-700',
    paused: 'bg-amber-100 text-amber-700',
    error: 'bg-red-100 text-red-700',
  };
  return map[status] || 'bg-slate-100 text-slate-600';
}

function getAgentStatusDot(status: string) {
  const map: Record<string, string> = {
    idle: 'bg-slate-400',
    working: 'bg-blue-500 animate-pulse',
    paused: 'bg-amber-500',
    error: 'bg-red-500',
  };
  return map[status] || 'bg-slate-400';
}
