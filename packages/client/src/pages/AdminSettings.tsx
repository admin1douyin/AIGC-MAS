import { useState, useEffect } from 'react';
import {
  Settings,
  Video,
  CreditCard,
  Save,
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertCircle,
  Key,
  Globe,
  Shield,
} from 'lucide-react';
import { adminApi } from '../services/adminApi';
import { useAuth } from '../lib/AuthContext';
import { supabase } from '../lib/supabase';

type TabType = 'seedance' | 'payment';

interface ConfigItem {
  id: string;
  key: string;
  value: string | null;
  description: string | null;
  encrypted: boolean;
  updatedAt: string;
}

export default function AdminSettings() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('seedance');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [configs, setConfigs] = useState<ConfigItem[]>([]);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<{ configured: boolean; status: string; error?: string } | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (user) {
      loadConfigs();
    }
  }, [activeTab, user]);

  const loadConfigs = async () => {
    setLoading(true);
    setMessage(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const result: any = await adminApi.getConfig(activeTab);
      if (result.success) {
        setConfigs(result.data || []);
        const data: Record<string, string> = {};
        result.data?.forEach((item: ConfigItem) => {
          data[item.key] = item.value || '';
        });
        setFormData(data);
      }

      await loadStatus();
    } catch (error: any) {
      console.error('Load configs error:', error);
      setMessage({ type: 'error', text: error.message || '加载配置失败' });
    } finally {
      setLoading(false);
    }
  };

  const loadStatus = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      let result: any;
      if (activeTab === 'seedance') {
        result = await adminApi.getSeedanceStatus();
      } else {
        result = await adminApi.getPaymentStatus();
      }
      if (result.success) {
        setStatus(result.data);
      }
    } catch (error) {
      console.error('Load status error:', error);
    }
  };

  const handleInputChange = (key: string, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setMessage({ type: 'error', text: '请先登录' });
        return;
      }

      const result: any = await adminApi.updateConfig(activeTab, formData);
      if (result.success) {
        setConfigs(result.data || []);
        setMessage({ type: 'success', text: '配置保存成功' });
        loadStatus();
      } else {
        setMessage({ type: 'error', text: result.error?.message || '保存失败' });
      }
    } catch (error: any) {
      console.error('Save config error:', error);
      setMessage({ type: 'error', text: error.message || '保存失败' });
    } finally {
      setSaving(false);
    }
  };

  const handleInitConfigs = async () => {
    setSaving(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const response = await fetch('/api/admin/init-configs', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      });
      const result = await response.json();
      if (result.success) {
        setMessage({ type: 'success', text: `已初始化 ${result.data.created} 个配置项` });
        loadConfigs();
      } else {
        setMessage({ type: 'error', text: result.error?.message || '初始化失败' });
      }
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || '初始化失败' });
    } finally {
      setSaving(false);
    }
  };

  const seedanceFields = [
    { key: 'API_KEY', label: 'API 密钥', type: 'password', icon: Key, placeholder: '请输入 Seedance API Key' },
    { key: 'BASE_URL', label: 'API 地址', type: 'text', icon: Globe, placeholder: 'https://api.seedance.com' },
  ];

  const paymentFields = [
    { key: 'ALIPAY_APP_ID', label: '支付宝应用ID', type: 'text', icon: Shield, placeholder: '请输入应用ID' },
    { key: 'ALIPAY_PRIVATE_KEY', label: '应用私钥', type: 'textarea', icon: Key, placeholder: '请输入应用私钥' },
    { key: 'ALIPAY_PUBLIC_KEY', label: '支付宝公钥', type: 'textarea', icon: Key, placeholder: '请输入支付宝公钥' },
    { key: 'ALIPAY_GATEWAY', label: '网关地址', type: 'text', icon: Globe, placeholder: 'https://openapi.alipay.com/gateway.do' },
    { key: 'ALIPAY_NOTIFY_URL', label: '回调通知地址', type: 'text', icon: Globe, placeholder: 'https://your-domain.com/api/payments/notify' },
  ];

  const fields = activeTab === 'seedance' ? seedanceFields : paymentFields;

  const getStatusIcon = () => {
    if (!status) return null;
    if (status.status === 'connected' || status.status === 'configured') {
      return <CheckCircle className="w-5 h-5 text-green-500" />;
    }
    if (status.status === 'error') {
      return <XCircle className="w-5 h-5 text-red-500" />;
    }
    return <AlertCircle className="w-5 h-5 text-amber-500" />;
  };

  const getStatusText = () => {
    if (!status) return '检测中...';
    const map: Record<string, string> = {
      connected: '连接正常',
      configured: '已配置',
      unconfigured: '未配置',
      error: '连接异常',
    };
    return map[status.status] || status.status;
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-primary-light flex items-center justify-center">
          <Settings className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-text-primary">系统设置</h1>
          <p className="text-sm text-text-secondary">管理系统配置和第三方服务集成</p>
        </div>
      </div>

      {message && (
        <div
          className={`mb-6 p-4 rounded-xl flex items-center gap-3 ${
            message.type === 'success'
              ? 'bg-green-50 border border-green-200 text-green-700'
              : 'bg-red-50 border border-red-200 text-red-700'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle className="w-5 h-5 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
          )}
          <span className="text-sm">{message.text}</span>
        </div>
      )}

      <div className="card-surface overflow-hidden">
        <div className="flex border-b border-border">
          <button
            onClick={() => setActiveTab('seedance')}
            className={`flex items-center gap-2 px-6 py-4 text-sm font-medium transition-colors border-b-2 -mb-px ${
              activeTab === 'seedance'
                ? 'text-primary border-primary'
                : 'text-text-secondary border-transparent hover:text-text-primary'
            }`}
          >
            <Video className="w-4 h-4" />
            Seedance 视频生成
          </button>
          <button
            onClick={() => setActiveTab('payment')}
            className={`flex items-center gap-2 px-6 py-4 text-sm font-medium transition-colors border-b-2 -mb-px ${
              activeTab === 'payment'
                ? 'text-primary border-primary'
                : 'text-text-secondary border-transparent hover:text-text-primary'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            支付配置
          </button>
        </div>

        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              {getStatusIcon()}
              <span className="text-sm font-medium text-text-primary">
                {activeTab === 'seedance' ? 'Seedance API' : '支付宝支付'}：{getStatusText()}
              </span>
              {status?.error && (
                <span className="text-xs text-text-tertiary ml-2">({status.error})</span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={loadConfigs}
                disabled={loading}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-text-secondary hover:text-text-primary hover:bg-bg-surface rounded-lg transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                刷新
              </button>
              {configs.length === 0 && (
                <button
                  onClick={handleInitConfigs}
                  disabled={saving}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-primary hover:bg-primary/10 rounded-lg transition-colors disabled:opacity-50"
                >
                  <Plus className="w-4 h-4" />
                  初始化配置
                </button>
              )}
            </div>
          </div>

          {loading ? (
            <div className="text-center py-12 text-text-secondary">
              <RefreshCw className="w-8 h-8 mx-auto mb-3 animate-spin opacity-50" />
              <p>加载中...</p>
            </div>
          ) : (
            <div className="space-y-5">
              {fields.map((field) => {
                const Icon = field.icon;
                const config = configs.find((c) => c.key === field.key);
                const value = formData[field.key] || '';

                return (
                  <div key={field.key}>
                    <label className="block text-sm font-medium text-text-primary mb-2">
                      <div className="flex items-center gap-2">
                        <Icon className="w-4 h-4 text-text-tertiary" />
                        {field.label}
                        {config?.encrypted && (
                          <span className="text-xs text-text-tertiary font-normal">(加密存储)</span>
                        )}
                      </div>
                    </label>
                    {field.type === 'textarea' ? (
                      <textarea
                        value={value}
                        onChange={(e) => handleInputChange(field.key, e.target.value)}
                        placeholder={field.placeholder}
                        rows={4}
                        className="w-full px-4 py-3 bg-bg-surface border border-border rounded-xl text-text-primary text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 resize-none font-mono"
                      />
                    ) : (
                      <input
                        type={field.type}
                        value={value}
                        onChange={(e) => handleInputChange(field.key, e.target.value)}
                        placeholder={field.placeholder}
                        className="w-full px-4 py-3 bg-bg-surface border border-border rounded-xl text-text-primary text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                      />
                    )}
                    {config?.description && (
                      <p className="mt-1.5 text-xs text-text-tertiary">{config.description}</p>
                    )}
                    {config?.updatedAt && (
                      <p className="mt-1 text-xs text-text-tertiary">
                        最后更新：{new Date(config.updatedAt).toLocaleString('zh-CN')}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          <div className="mt-8 pt-6 border-t border-border flex justify-end">
            <button
              onClick={handleSave}
              disabled={saving || loading}
              className="flex items-center gap-2 px-6 py-2.5 bg-gradient-primary text-white font-medium rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {saving ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              保存配置
            </button>
          </div>
        </div>
      </div>

      <div className="mt-6 card-surface p-5">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-medium text-text-primary mb-1">注意事项</h4>
            <ul className="text-sm text-text-secondary space-y-1">
              <li>• API 密钥等敏感信息将加密存储在数据库中</li>
              <li>• 配置保存后会立即生效，无需重启服务</li>
              <li>• 请确保 API 密钥的安全性，不要泄露给他人</li>
              <li>• 如需更换 API 密钥，请直接在上方输入新密钥并保存</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

function Plus({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}
