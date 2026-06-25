import { useState } from 'react';
import { User, Mail, Phone, Building, Shield, CreditCard, Bell, LogOut } from 'lucide-react';
import { useAuth } from '../lib/AuthContext';
import { supabase } from '../lib/supabase';

export default function Profile() {
  const { user, signOut } = useAuth();
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState({
    name: user?.user_metadata?.name || '',
    phone: '',
    company: '',
    bio: '',
  });

  const handleSave = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        data: { name: profile.name }
      });
      if (error) throw error;
      alert('保存成功！');
    } catch (error: any) {
      alert(error.message || '保存失败');
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    window.location.href = '/';
  };

  const menuItems = [
    { icon: User, label: '个人信息', active: true },
    { icon: Shield, label: '账号安全', active: false },
    { icon: CreditCard, label: '订阅管理', active: false },
    { icon: Bell, label: '消息通知', active: false },
  ];

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-text-primary mb-6">个人中心</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="md:col-span-1">
          <div className="bg-white rounded-xl border border-border p-4">
            <div className="text-center mb-6">
              <div className="w-20 h-20 rounded-full bg-gradient-primary mx-auto flex items-center justify-center mb-3">
                <span className="text-white text-2xl font-bold">
                  {profile.name?.charAt(0)?.toUpperCase() || 'U'}
                </span>
              </div>
              <h3 className="font-semibold text-text-primary">{profile.name || '用户'}</h3>
              <p className="text-sm text-text-secondary">{user?.email}</p>
            </div>

            <nav className="space-y-1">
              {menuItems.map((item) => (
                <button
                  key={item.label}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                    item.active 
                      ? 'bg-primary/10 text-primary font-medium' 
                      : 'text-text-secondary hover:bg-bg-surface-hover'
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </button>
              ))}
            </nav>

            <div className="mt-6 pt-4 border-t border-border">
              <button
                onClick={handleSignOut}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                退出登录
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="md:col-span-3">
          <div className="bg-white rounded-xl border border-border p-6">
            <h2 className="text-lg font-semibold text-text-primary mb-6">基本信息</h2>

            <div className="space-y-5">
              {/* Avatar */}
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 rounded-full bg-gradient-primary flex items-center justify-center">
                  <span className="text-white text-2xl font-bold">
                    {profile.name?.charAt(0)?.toUpperCase() || 'U'}
                  </span>
                </div>
                <div>
                  <button className="px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary-light transition-colors">
                    更换头像
                  </button>
                  <p className="text-xs text-text-tertiary mt-2">支持 JPG、PNG 格式，最大 2MB</p>
                </div>
              </div>

              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  姓名
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-tertiary" />
                  <input
                    type="text"
                    value={profile.name}
                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                    className="w-full pl-11 pr-4 py-3 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  邮箱
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-tertiary" />
                  <input
                    type="email"
                    value={user?.email || ''}
                    disabled
                    className="w-full pl-11 pr-4 py-3 border border-border rounded-xl bg-bg/50 text-text-secondary cursor-not-allowed"
                  />
                </div>
                <p className="text-xs text-text-tertiary mt-1.5">邮箱不可修改</p>
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  手机号
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-tertiary" />
                  <input
                    type="tel"
                    value={profile.phone}
                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                    placeholder="请输入手机号"
                    className="w-full pl-11 pr-4 py-3 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  />
                </div>
              </div>

              {/* Company */}
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  公司/组织
                </label>
                <div className="relative">
                  <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-tertiary" />
                  <input
                    type="text"
                    value={profile.company}
                    onChange={(e) => setProfile({ ...profile, company: e.target.value })}
                    placeholder="请输入公司/组织名称"
                    className="w-full pl-11 pr-4 py-3 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  />
                </div>
              </div>

              {/* Bio */}
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  个人简介
                </label>
                <textarea
                  value={profile.bio}
                  onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                  placeholder="简单介绍一下自己..."
                  rows={3}
                  className="w-full px-4 py-3 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
                />
              </div>

              {/* Save Button */}
              <div className="pt-4 border-t border-border">
                <button
                  onClick={handleSave}
                  disabled={loading}
                  className="px-6 py-2.5 bg-primary text-white font-medium rounded-lg hover:bg-primary-light disabled:opacity-50 transition-colors"
                >
                  {loading ? '保存中...' : '保存修改'}
                </button>
              </div>
            </div>
          </div>

          {/* Subscription Card */}
          <div className="bg-white rounded-xl border border-border p-6 mt-6">
            <h2 className="text-lg font-semibold text-text-primary mb-4">当前订阅</h2>
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-primary/5 to-primary/10 rounded-xl">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2 py-0.5 bg-primary text-white text-xs font-medium rounded">免费版</span>
                </div>
                <p className="text-sm text-text-secondary">3 个项目 / 基础智能体 / 720p</p>
              </div>
              <button className="px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary-light transition-colors">
                升级专业版
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
