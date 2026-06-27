import { useState, useEffect } from 'react';
import { Check, Zap, Crown, Building } from 'lucide-react';
import { useAuth } from '../lib/AuthContext';
import { supabase } from '../lib/supabase';

const plans = [
  {
    id: 'free',
    name: '基础版',
    price: '免费',
    period: '',
    description: '适合个人体验和小型项目',
    icon: Zap,
    gradient: 'from-slate-500 to-slate-600',
    features: [
      '每月 3 个视频项目',
      '基础 AI 智能体',
      '720P 画质输出',
      '社区支持',
      '标准处理速度',
    ],
    limitations: [
      '无高级智能体',
      '有水印',
      '不支持商用',
    ],
    cta: '当前方案',
    popular: false,
  },
  {
    id: 'pro',
    name: '专业版',
    price: '¥299',
    period: '/月',
    description: '适合专业创作者和小型团队',
    icon: Crown,
    gradient: 'from-primary to-primary-light',
    features: [
      '无限视频项目',
      '全部 12 个 AI 智能体',
      '1080P 画质输出',
      '优先技术支持',
      '自定义品牌水印',
      '批量导出',
      '无处理队列',
      '可用于商业目的',
    ],
    limitations: [],
    cta: '立即订阅',
    popular: true,
  },
  {
    id: 'enterprise',
    name: '企业版',
    price: '定制',
    period: '',
    description: '适合大型企业和机构客户',
    icon: Building,
    gradient: 'from-amber-500 to-amber-600',
    features: [
      '专业版全部功能',
      '专属客户经理',
      'API 接口接入',
      '私有化部署选项',
      '定制化智能体训练',
      'SLA 服务保障',
      '发票开具',
      '团队协作管理',
    ],
    limitations: [],
    cta: '联系销售',
    popular: false,
  },
];

interface SubscriptionData {
  plan: string;
  status: string;
  credits: number;
  usedCredits: number;
}

export default function Subscription() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [loadingSubscription, setLoadingSubscription] = useState(true);

  useEffect(() => {
    if (user) {
      loadSubscription();
    } else {
      setLoadingSubscription(false);
    }
  }, [user]);

  const loadSubscription = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const response = await fetch('/api/auth/subscription', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      });
      const result = await response.json();
      if (result.success) {
        setSubscription(result.data);
      }
    } catch (error) {
      console.error('Failed to load subscription:', error);
    } finally {
      setLoadingSubscription(false);
    }
  };

  const handleSubscribe = async (planId: string) => {
    if (!user) {
      alert('请先登录后再订阅');
      return;
    }

    if (planId === 'enterprise') {
      window.location.href = 'mailto:sales@aigc-mas.com?subject=企业版咨询';
      return;
    }

    if (planId === 'free') {
      return;
    }

    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        alert('请先登录');
        return;
      }

      // Create order and redirect to Alipay
      const response = await fetch('/api/payments/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          plan: planId,
          amount: planId === 'pro' ? 29900 : 0, // in cents
        }),
      });

      const result = await response.json();

      if (result.success && result.data?.paymentUrl) {
        // Redirect to Alipay payment page (production or sandbox)
        // The backend returns the appropriate paymentUrl based on ALIPAY_* env vars
        window.location.href = result.data.paymentUrl;
      } else if (result.success && result.data?.mode === 'mock') {
        // Mock mode without a real payment URL - update subscription locally
        alert('订单已创建（演示模式），订阅已激活');
        loadSubscription();
      } else {
        alert(result.error?.message || '创建订单失败');
      }
    } catch (error: any) {
      alert(error.message || '创建订单失败');
    } finally {
      setLoading(false);
    }
  };

  const currentPlan = subscription?.plan || 'free';

  return (
    <div className="max-w-6xl mx-auto">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold text-text-primary mb-4">选择适合您的方案</h1>
        <p className="text-text-secondary max-w-2xl mx-auto">
          从个人创作者到企业团队，总有一款适合您。升级即可解锁更多高级功能和无限创作可能。
        </p>
      </div>

      {loadingSubscription ? (
        <div className="text-center py-12 text-text-secondary">加载中...</div>
      ) : (
        <>
          {user && subscription && subscription.plan !== 'free' && (
            <div className="mb-8 p-4 bg-green-50 border border-green-200 rounded-xl text-center">
              <p className="text-green-700">
                当前订阅：<strong>{plans.find(p => p.id === subscription.plan)?.name}</strong>
                {subscription.credits > 0 && ` · 剩余 ${subscription.credits - subscription.usedCredits} 积分`}
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map((plan) => {
              const Icon = plan.icon;
              const isCurrentPlan = currentPlan === plan.id;
              
              return (
                <div
                  key={plan.id}
                  className={`relative bg-white rounded-2xl border p-6 transition-all ${
                    plan.popular 
                      ? 'border-primary shadow-lg shadow-primary/10 scale-105' 
                      : 'border-border'
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-primary text-white text-sm font-medium rounded-full">
                      最受欢迎
                    </div>
                  )}

                  {/* Plan Header */}
                  <div className="text-center mb-6">
                    <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${plan.gradient} flex items-center justify-center mx-auto mb-4`}>
                      <Icon className="w-7 h-7 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-text-primary">{plan.name}</h3>
                    <p className="text-sm text-text-secondary mt-1">{plan.description}</p>
                  </div>

                  {/* Price */}
                  <div className="text-center mb-6">
                    <span className="text-4xl font-bold text-text-primary">{plan.price}</span>
                    {plan.period && (
                      <span className="text-text-tertiary">{plan.period}</span>
                    )}
                  </div>

                  {/* Features */}
                  <div className="space-y-3 mb-6">
                    {plan.features.map((feature, idx) => (
                      <div key={idx} className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-state-success flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-text-secondary">{feature}</span>
                      </div>
                    ))}
                    {plan.limitations.map((limitation, idx) => (
                      <div key={idx} className="flex items-start gap-3 opacity-50">
                        <span className="w-5 h-5 flex items-center justify-center text-state-error flex-shrink-0">×</span>
                        <span className="text-sm text-text-secondary">{limitation}</span>
                      </div>
                    ))}
                  </div>

                  {/* CTA Button */}
                  <button
                    onClick={() => handleSubscribe(plan.id)}
                    disabled={loading || isCurrentPlan}
                    className={`w-full py-3 font-medium rounded-xl transition-all ${
                      isCurrentPlan
                        ? 'bg-bg-surface text-text-secondary cursor-default'
                        : plan.popular
                          ? 'bg-gradient-primary text-white hover:opacity-90'
                          : 'bg-primary text-white hover:bg-primary-light'
                    } disabled:opacity-50`}
                  >
                    {loading ? '处理中...' : isCurrentPlan ? '当前方案' : plan.cta}
                  </button>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* FAQ Section */}
      <div className="mt-16">
        <h2 className="text-2xl font-bold text-text-primary text-center mb-8">常见问题</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {[
            {
              q: '订阅后可以退款吗？',
              a: '订阅之日起 7 天内可申请全额退款，逾期不支持退款但可取消续费。',
            },
            {
              q: '如何升级或降级方案？',
              a: '您可以随时在个人中心升级方案，降级将在当前订阅周期结束后生效。',
            },
            {
              q: '企业版有哪些定制选项？',
              a: '企业版支持私有化部署、定制智能体训练、专属 API 接口和 SLA 保障。',
            },
            {
              q: '免费版项目数量用完怎么办？',
              a: '您可以等待次月重置，或升级到专业版获取无限项目额度。',
            },
          ].map((faq, idx) => (
            <div key={idx} className="bg-white rounded-xl border border-border p-5">
              <h4 className="font-semibold text-text-primary mb-2">{faq.q}</h4>
              <p className="text-sm text-text-secondary">{faq.a}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Payment Methods */}
      <div className="mt-12 text-center">
        <p className="text-text-tertiary text-sm mb-4">支付方式</p>
        <div className="flex items-center justify-center gap-6 opacity-50">
          <div className="flex items-center gap-2">
            <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
              <path d="M2.5 19h19v2h-19v-2zm19.57-9.36c-.21-.8-1.04-1.28-1.84-1.06l-5.13 1.37-.34-3.37c-.12-.77-1.02-1.2-1.77-1.06-.8.21-1.28 1.04-1.06 1.84l1.62 4.94-2.89 6.77c-.21.8.27 1.62 1.06 1.84.8.21 1.62-.27 1.84-1.06l3.66-8.63c.12-.07.21-.14.28-.21h.01l4.92 1.32c.8.21 1.62-.27 1.84-1.06.21-.8-.27-1.62-1.06-1.84l-1.32-.36 1.32-3.77c.21-.8-.27-1.62-1.06-1.84-.8-.21-1.62.27-1.84 1.06l-1.65 4.71-2.89-6.77c-.21-.8-1.04-1.28-1.84-1.06-.8.21-1.28 1.04-1.06 1.84l1.62 4.94-2.89 6.77c-.21.8.27 1.62 1.06 1.84.8.21 1.62-.27 1.84-1.06l4.92-11.62c.21-.8-.27-1.62-1.06-1.84z"/>
            </svg>
            <span className="font-medium text-text-secondary">支付宝</span>
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
              <path d="M4.5 4.5v15h15v-15h-15zm13.683 9.954c.081-.27.126-.558.126-.854 0-.902-.721-1.635-1.612-1.635-.598 0-1.102.31-1.424.777-.29-.466-.795-.777-1.424-.777-.891 0-1.612.733-1.612 1.635 0 .296.045.584.126.854H6.183v-1.04c.567.384 1.236.608 1.939.608h6.735c.703 0 1.372-.224 1.939-.608v1.04H18.183z"/>
            </svg>
            <span className="font-medium text-text-secondary">微信支付</span>
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-6h2v2h-2v-2zm0-8h2v6h-2V6z"/>
            </svg>
            <span className="font-medium text-text-secondary">银行卡</span>
          </div>
        </div>
      </div>
    </div>
  );
}

