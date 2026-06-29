import { useState, useEffect, useRef } from 'react';
import { Send, Bot, Sparkles, Wand2, Film, Music, Image, FileText, Zap, ChevronRight } from 'lucide-react';
import { chatApi } from '../services/chatApi';
import { useParams } from 'react-router-dom';

export default function ChatAgent() {
  const { projectId } = useParams();
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [quickActions, setQuickActions] = useState<any[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadHistory();
    loadQuickActions();
  }, [projectId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadHistory = async () => {
    if (!projectId) return;
    try {
      const res: any = await chatApi.getHistory(projectId);
      if (res.success && res.data.length > 0) {
        setMessages(res.data);
      } else {
        setMessages([{
          id: 'welcome',
          role: 'assistant',
          content: '您好！我是您的AI视频制作助手。我可以帮您：\n\n• 创作短剧脚本和分镜\n• 设计企业宣传片方案\n• 策划文旅宣传视频\n• 生成视频画面素材\n• 优化视频制作流程\n\n请告诉我您想制作什么类型的视频，或者描述您的创意想法，我来帮您实现！',
          timestamp: new Date().toISOString(),
        }]);
      }
    } catch (e) {
      console.error(e);
      setMessages([{
        id: 'welcome',
        role: 'assistant',
        content: '您好！我是您的AI视频制作助手。我可以帮您创作各类视频内容。请告诉我您的需求！',
        timestamp: new Date().toISOString(),
      }]);
    }
  };

  const loadQuickActions = async () => {
    try {
      const res: any = await chatApi.quickActions(projectId);
      if (res.success) setQuickActions(res.data);
    } catch (e) {
      setQuickActions([
        { icon: 'Film', label: '帮我写一个短剧脚本', prompt: '帮我写一个都市逆袭题材的短剧脚本，要有3集，每集30秒左右' },
        { icon: 'FileText', label: '生成企业宣传片方案', prompt: '帮我生成一个科技公司的企业宣传片方案，时长2分钟' },
        { icon: 'Image', label: '生成视频分镜画面', prompt: '帮我生成一个古风场景的视频分镜画面描述' },
        { icon: 'Music', label: '推荐背景音乐', prompt: '给我推荐适合企业宣传片的背景音乐风格' },
      ]);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: input,
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const res: any = await chatApi.sendMessage({
        projectId,
        message: input,
      });

      if (res.success) {
        setMessages(prev => [...prev, res.data]);
      } else {
        throw new Error(res.error?.message || '发送失败');
      }
    } catch (e: any) {
      setMessages(prev => [...prev, {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: `抱歉，我遇到了一些问题：${e.message || '请稍后重试'}`,
        timestamp: new Date().toISOString(),
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickAction = (prompt: string) => {
    setInput(prompt);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const getIcon = (iconName: string) => {
    const icons: Record<string, any> = { Film, FileText, Image, Music, Wand2, Zap, Sparkles };
    return icons[iconName] || Sparkles;
  };

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col bg-gradient-to-b from-slate-50 to-white">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
          <Bot className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1">
          <h1 className="text-lg font-bold text-slate-800">AI 视频制作助手</h1>
          <p className="text-sm text-slate-500 flex items-center gap-2">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            在线 · 随时为您服务
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs font-medium rounded-full">
            Powered by Multi-Agent
          </span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
              msg.role === 'user' 
                ? 'bg-gradient-to-br from-blue-500 to-blue-600' 
                : 'bg-gradient-to-br from-purple-500 to-pink-500'
            }`}>
              {msg.role === 'user' ? (
                <span className="text-white text-sm font-bold">我</span>
              ) : (
                <Bot className="w-5 h-5 text-white" />
              )}
            </div>
            <div className={`max-w-2xl ${msg.role === 'user' ? 'items-end' : 'items-start'} flex flex-col`}>
              <div className={`px-5 py-3 rounded-2xl whitespace-pre-wrap ${
                msg.role === 'user'
                  ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-tr-md'
                  : 'bg-white border border-slate-200 text-slate-700 rounded-tl-md shadow-sm'
              }`}>
                {msg.content}
              </div>
              <span className="text-xs text-slate-400 mt-1 px-1">
                {new Date(msg.timestamp).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex gap-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div className="bg-white border border-slate-200 px-5 py-4 rounded-2xl rounded-tl-md shadow-sm">
              <div className="flex gap-1.5">
                <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Actions */}
      {messages.length <= 1 && quickActions.length > 0 && (
        <div className="px-6 pb-4">
          <p className="text-sm text-slate-500 mb-3 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500" />
            快速开始
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {quickActions.map((action, idx) => {
              const Icon = getIcon(action.icon);
              return (
                <button
                  key={idx}
                  onClick={() => handleQuickAction(action.prompt)}
                  className="flex items-center gap-3 p-4 bg-white border border-slate-200 rounded-xl hover:border-blue-300 hover:shadow-md transition-all text-left group"
                >
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center group-hover:from-blue-100 group-hover:to-purple-100 transition-colors">
                    <Icon className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-700 truncate">{action.label}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-500 transition-colors" />
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="bg-white border-t border-slate-200 px-6 py-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex gap-3 items-end">
            <div className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="描述您的视频需求，或与AI助手对话..."
                rows={1}
                className="w-full px-5 py-3 bg-transparent resize-none focus:outline-none text-slate-700 placeholder-slate-400 max-h-32"
                style={{ minHeight: '48px' }}
              />
            </div>
            <button
              onClick={handleSend}
              disabled={!input.trim() || loading}
              className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 text-white flex items-center justify-center hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
          <p className="text-xs text-slate-400 mt-2 text-center">
            AI 生成内容仅供参考，请仔细审核后使用
          </p>
        </div>
      </div>
    </div>
  );
}
