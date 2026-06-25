import React from 'react';
import { Link } from 'react-router-dom';

const LandingPage: React.FC = () => {
  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-bg text-text-primary">
      <nav className="fixed top-0 left-0 right-0 z-50 glass-nav">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary to-primary-light flex items-center justify-center">
              <span className="text-white font-bold text-sm">AI</span>
            </div>
            <span className="text-xl font-bold tracking-tight">AIGC-MAS</span>
          </div>
          
          <div className="hidden md:flex items-center gap-8">
            <button onClick={() => scrollToSection('features')} className="text-text-secondary hover:text-text-primary transition-colors text-sm">
              功能特性
            </button>
            <button onClick={() => scrollToSection('services')} className="text-text-secondary hover:text-text-primary transition-colors text-sm">
              服务场景
            </button>
            <button onClick={() => scrollToSection('workflow')} className="text-text-secondary hover:text-text-primary transition-colors text-sm">
              工作流程
            </button>
            <button onClick={() => scrollToSection('pricing')} className="text-text-secondary hover:text-text-primary transition-colors text-sm">
              定价方案
            </button>
          </div>
          
          <div className="flex items-center gap-3">
            <Link to="/login" className="btn-secondary text-sm py-2 px-4">
              登录
            </Link>
            <Link to="/register" className="btn-primary text-sm py-2 px-4">
              免费开始
            </Link>
          </div>
        </div>
      </nav>

      <section className="relative pt-32 pb-24 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-gradient-primary rounded-full opacity-10 blur-[120px] animate-hero-glow"></div>
        <div className="absolute top-20 left-10 w-72 h-72 bg-warm rounded-full opacity-5 blur-[80px]"></div>
        <div className="absolute top-40 right-10 w-96 h-96 bg-teal rounded-full opacity-5 blur-[100px]"></div>
        
        <div className="relative max-w-7xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-bg border border-primary/20 mb-8">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
            <span className="text-sm text-primary-light">多智能体协作平台 · 商用级品质</span>
          </div>
          
          <h1 className="vp-display text-5xl md:text-6xl lg:text-7xl mb-6 text-balance">
            用AI多智能体
            <br />
            <span className="vp-gradient-text">重新定义视频创作</span>
          </h1>
          
          <p className="vp-caption text-lg md:text-xl max-w-3xl mx-auto mb-10">
            12+专业AI智能体协同工作，从创意策划到最终交付，
            <br className="hidden md:block" />
            全流程自动化，打造商用级视频内容
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <button 
              onClick={() => scrollToSection('services')} 
              className="btn-primary text-base py-3 px-8 gap-2"
            >
              立即开始创作
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </button>
            <button className="btn-secondary text-base py-3 px-8 gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              观看演示
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {[
              { value: '12+', label: 'AI智能体' },
              { value: '10000+', label: '已创作视频' },
              { value: '98%', label: '客户满意度' },
              { value: '5分钟', label: '快速出片' },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <div className="vp-display text-3xl md:text-4xl mb-2 vp-gradient-text">{stat.value}</div>
                <div className="vp-caption text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="services" className="py-24 bg-bg-elevated/50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <div className="inline-block px-3 py-1 rounded-full bg-primary-bg text-primary-light text-sm mb-4">
              三大业务场景
            </div>
            <h2 className="section-title text-3xl md:text-4xl mb-4">
              覆盖全行业视频创作需求
            </h2>
            <p className="section-subtitle max-w-2xl mx-auto">
              针对不同行业场景深度优化，智能体团队专业分工，让每个项目都达到商用级品质
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: '🎬',
                title: '短剧生产',
                desc: 'AI编剧+分镜+剪辑全流程自动化，批量生产高质量短剧内容',
                features: ['剧本自动生成', '角色形象设计', '多集批量制作', '平台风格适配'],
                gradient: 'from-primary to-warm',
              },
              {
                icon: '🏢',
                title: '企业视频营销',
                desc: '品牌分析+营销策划+视频制作，一站式企业视频解决方案',
                features: ['品牌调性分析', '营销卖点提炼', '多版本素材', '数据效果追踪'],
                gradient: 'from-teal to-primary',
              },
              {
                icon: '🏛️',
                title: '文旅宣传',
                desc: '文化挖掘+故事创作+视觉呈现，打造地方文旅名片',
                features: ['文化深度调研', '故事化叙事', '多语言版本', '景点特色展示'],
                gradient: 'from-warm to-state-warning',
              },
            ].map((service, i) => (
              <div 
                key={i} 
                className="card-surface p-8 group cursor-pointer"
              >
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${service.gradient} flex items-center justify-center text-2xl mb-6 group-hover:scale-110 transition-transform`}>
                  {service.icon}
                </div>
                <h3 className="text-xl font-semibold mb-3">{service.title}</h3>
                <p className="vp-caption mb-6">{service.desc}</p>
                <ul className="space-y-2">
                  {service.features.map((f, j) => (
                    <li key={j} className="flex items-center gap-2 text-sm">
                      <svg className="w-4 h-4 text-state-success flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span className="text-text-secondary">{f}</span>
                    </li>
                  ))}
                </ul>
                <button className="mt-6 text-primary text-sm font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
                  了解更多
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="features" className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <div className="inline-block px-3 py-1 rounded-full bg-primary-bg text-primary-light text-sm mb-4">
              核心能力
            </div>
            <h2 className="section-title text-3xl md:text-4xl mb-4">
              多智能体协作引擎
            </h2>
            <p className="section-subtitle max-w-2xl mx-auto">
              12个专业AI智能体，各司其职、高效协作，媲美真人制作团队
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { icon: '🎯', title: '项目经理', desc: '整体规划与进度把控' },
              { icon: '💡', title: '创意总监', desc: '创意方向与视觉把控' },
              { icon: '📝', title: '专业编剧', desc: '剧本创作与故事打磨' },
              { icon: '🎨', title: '分镜师', desc: '镜头设计与视觉构图' },
              { icon: '🎙️', title: '配音演员', desc: '专业配音与语音合成' },
              { icon: '🎵', title: '音乐设计师', desc: '配乐创作与音效制作' },
              { icon: '✂️', title: '视频剪辑师', desc: '精剪细琢与特效合成' },
              { icon: '✅', title: '质量审核员', desc: '多轮审核确保品质' },
            ].map((agent, i) => (
              <div key={i} className="card-surface p-6 text-center hover:vp-glow-border transition-all">
                <div className="w-12 h-12 mx-auto rounded-lg bg-bg-surface-hover flex items-center justify-center text-2xl mb-4">
                  {agent.icon}
                </div>
                <h4 className="font-semibold mb-1">{agent.title}</h4>
                <p className="vp-caption text-xs">{agent.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="workflow" className="py-24 bg-bg-elevated/50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <div className="inline-block px-3 py-1 rounded-full bg-primary-bg text-primary-light text-sm mb-4">
              工作流程
            </div>
            <h2 className="section-title text-3xl md:text-4xl mb-4">
              四步打造专业级视频
            </h2>
            <p className="section-subtitle max-w-2xl mx-auto">
              简单四步，从想法到成片，AI智能体团队全程代劳
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            {[
              { step: '01', title: '需求输入', desc: '描述你的视频需求，选择场景模板' },
              { step: '02', title: '智能规划', desc: 'AI项目经理制定全流程制作计划' },
              { step: '03', title: '协作生产', desc: '多智能体并行协作，实时查看进度' },
              { step: '04', title: '交付成片', desc: '多轮质量审核后交付成品视频' },
            ].map((step, i) => (
              <div key={i} className="relative">
                <div className="card-surface p-6 h-full">
                  <div className="text-5xl font-bold text-primary/20 mb-4">{step.step}</div>
                  <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
                  <p className="vp-caption text-sm">{step.desc}</p>
                </div>
                {i < 3 && (
                  <div className="hidden md:block absolute top-1/2 -right-3 -translate-y-1/2 z-10">
                    <svg className="w-6 h-6 text-border" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="pricing" className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <div className="inline-block px-3 py-1 rounded-full bg-primary-bg text-primary-light text-sm mb-4">
              定价方案
            </div>
            <h2 className="section-title text-3xl md:text-4xl mb-4">
              灵活定价，满足不同需求
            </h2>
            <p className="section-subtitle max-w-2xl mx-auto">
              从个人创作者到企业团队，总有一款适合你
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {[
              {
                name: '基础版',
                price: '免费',
                period: '',
                desc: '适合个人体验和小型项目',
                features: ['每月5个视频项目', '基础AI智能体', '720P画质输出', '社区支持'],
                cta: '免费开始',
                popular: false,
              },
              {
                name: '专业版',
                price: '¥299',
                period: '/月',
                desc: '适合专业创作者和小型团队',
                features: ['无限视频项目', '全部12个AI智能体', '1080P画质输出', '优先技术支持', '自定义品牌', '批量导出'],
                cta: '立即订阅',
                popular: true,
              },
              {
                name: '企业版',
                price: '定制',
                period: '',
                desc: '适合大型企业和机构客户',
                features: ['专业版全部功能', '专属客户经理', 'API接入', '私有化部署', '定制化训练', 'SLA服务保障'],
                cta: '联系销售',
                popular: false,
              },
            ].map((plan, i) => (
              <div 
                key={i} 
                className={`card-surface p-8 relative ${
                  plan.popular ? 'border-primary/50 shadow-glow scale-105 z-10' : ''
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-primary text-white text-sm font-medium">
                    最受欢迎
                  </div>
                )}
                <h3 className="text-xl font-semibold mb-2">{plan.name}</h3>
                <p className="vp-caption text-sm mb-6">{plan.desc}</p>
                <div className="mb-6">
                  <span className="vp-display text-4xl">{plan.price}</span>
                  <span className="text-text-tertiary">{plan.period}</span>
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((f, j) => (
                    <li key={j} className="flex items-start gap-2 text-sm">
                      <svg className="w-5 h-5 text-state-success flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span className="text-text-secondary">{f}</span>
                    </li>
                  ))}
                </ul>
                <button className={`w-full ${plan.popular ? 'btn-primary' : 'btn-secondary'}`}>
                  {plan.cta}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-primary opacity-10"></div>
        <div className="relative max-w-4xl mx-auto px-6 text-center">
          <h2 className="section-title text-3xl md:text-4xl mb-4">
            准备好开始你的AI视频创作之旅了吗？
          </h2>
          <p className="section-subtitle text-lg mb-8">
            立即注册，免费体验多智能体协作的强大能力
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button className="btn-primary text-base py-3 px-8">
              免费开始使用
            </button>
            <button className="btn-secondary text-base py-3 px-8">
              预约产品演示
            </button>
          </div>
        </div>
      </section>

      <footer className="py-12 border-t border-border">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary-light flex items-center justify-center">
                  <span className="text-white font-bold text-xs">AI</span>
                </div>
                <span className="text-lg font-bold">AIGC-MAS</span>
              </div>
              <p className="vp-caption text-sm">
                多智能体协作的AI视频创作平台
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">产品</h4>
              <ul className="space-y-2 text-sm text-text-secondary">
                <li className="hover:text-text-primary cursor-pointer transition-colors">短剧生产</li>
                <li className="hover:text-text-primary cursor-pointer transition-colors">企业营销</li>
                <li className="hover:text-text-primary cursor-pointer transition-colors">文旅宣传</li>
                <li className="hover:text-text-primary cursor-pointer transition-colors">定价方案</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">资源</h4>
              <ul className="space-y-2 text-sm text-text-secondary">
                <li className="hover:text-text-primary cursor-pointer transition-colors">帮助文档</li>
                <li className="hover:text-text-primary cursor-pointer transition-colors">API文档</li>
                <li className="hover:text-text-primary cursor-pointer transition-colors">案例展示</li>
                <li className="hover:text-text-primary cursor-pointer transition-colors">博客</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">公司</h4>
              <ul className="space-y-2 text-sm text-text-secondary">
                <li className="hover:text-text-primary cursor-pointer transition-colors">关于我们</li>
                <li className="hover:text-text-primary cursor-pointer transition-colors">联系我们</li>
                <li className="hover:text-text-primary cursor-pointer transition-colors">服务条款</li>
                <li className="hover:text-text-primary cursor-pointer transition-colors">隐私政策</li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="vp-caption text-xs">
              © 2024 AIGC-MAS. All rights reserved.
            </p>
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 rounded-full bg-bg-surface flex items-center justify-center cursor-pointer hover:bg-bg-surface-hover transition-colors">
                <svg className="w-4 h-4 text-text-secondary" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </div>
              <div className="w-8 h-8 rounded-full bg-bg-surface flex items-center justify-center cursor-pointer hover:bg-bg-surface-hover transition-colors">
                <svg className="w-4 h-4 text-text-secondary" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.87 1.52 2.34 1.07 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0012 2z"/>
                </svg>
              </div>
              <div className="w-8 h-8 rounded-full bg-bg-surface flex items-center justify-center cursor-pointer hover:bg-bg-surface-hover transition-colors">
                <svg className="w-4 h-4 text-text-secondary" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
