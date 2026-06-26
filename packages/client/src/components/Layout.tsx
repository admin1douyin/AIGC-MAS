import { useState } from 'react';
import { Outlet, NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Film,
  Bot,
  Menu,
  X,
  Sparkles,
  User,
  CreditCard,
  LogOut,
  FolderOpen,
  Bell,
  Store,
} from 'lucide-react';
import { useAuth } from '../lib/AuthContext';

const navItems = [
  { path: '/', label: '总览', icon: LayoutDashboard },
  { path: '/projects', label: '项目管理', icon: Film },
  { path: '/assets', label: '素材管理', icon: FolderOpen },
  { path: '/agent-market', label: '智能体市场', icon: Store },
  { path: '/agents', label: '我的智能体', icon: Bot },
  { path: '/notifications', label: '通知', icon: Bell },
];

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-bg flex">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? 'w-64' : 'w-20'
        } bg-white border-r border-border transition-all duration-300 flex flex-col`}
      >
        {/* Logo */}
        <div className="h-16 flex items-center px-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-primary-light flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            {sidebarOpen && (
              <div>
                <h1 className="font-bold text-text-primary text-sm">AIGC-MAS</h1>
                <p className="text-xs text-text-secondary">多智能体视频平台</p>
              </div>
            )}
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 px-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.path === '/'
                ? location.pathname === '/'
                : location.pathname.startsWith(item.path);
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-text-secondary hover:bg-bg-surface-hover hover:text-text-primary'
                }`}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {sidebarOpen && <span>{item.label}</span>}
              </NavLink>
            );
          })}
        </nav>

        {/* Toggle */}
        <div className="p-3 border-t border-border">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-text-secondary hover:bg-bg-surface-hover rounded-lg text-sm"
          >
            {sidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            {sidebarOpen && <span>收起</span>}
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-16 bg-white border-b border-border flex items-center justify-between px-6">
          <div>
            <h2 className="text-lg font-semibold text-text-primary">
              {getPageTitle(location.pathname)}
            </h2>
          </div>
          <div className="flex items-center gap-4">
            {/* Subscription Badge */}
            <button
              onClick={() => navigate('/subscription')}
              className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 text-primary text-sm font-medium rounded-full hover:bg-primary/20 transition-colors"
            >
              <CreditCard className="w-4 h-4" />
              升级专业版
            </button>

            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-3 hover:bg-bg-surface-hover rounded-lg p-2 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-primary-light flex items-center justify-center text-white text-sm font-medium">
                  {user?.user_metadata?.name?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                <span className="text-sm text-text-primary font-medium">
                  {user?.user_metadata?.name || '用户'}
                </span>
              </button>

              {/* Dropdown Menu */}
              {userMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setUserMenuOpen(false)}
                  />
                  <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl border border-border shadow-lg z-20 py-2">
                    <div className="px-4 py-2 border-b border-border">
                      <p className="text-sm font-medium text-text-primary">
                        {user?.user_metadata?.name || '用户'}
                      </p>
                      <p className="text-xs text-text-secondary truncate">
                        {user?.email}
                      </p>
                    </div>
                    <div className="py-1">
                      <button
                        onClick={() => {
                          setUserMenuOpen(false);
                          navigate('/profile');
                        }}
                        className="w-full flex items-center gap-3 px-4 py-2 text-sm text-text-secondary hover:bg-bg-surface-hover transition-colors"
                      >
                        <User className="w-4 h-4" />
                        个人中心
                      </button>
                      <button
                        onClick={() => {
                          setUserMenuOpen(false);
                          navigate('/subscription');
                        }}
                        className="w-full flex items-center gap-3 px-4 py-2 text-sm text-text-secondary hover:bg-bg-surface-hover transition-colors"
                      >
                        <CreditCard className="w-4 h-4" />
                        订阅管理
                      </button>
                    </div>
                    <div className="border-t border-border pt-1">
                      <button
                        onClick={handleSignOut}
                        className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        退出登录
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

function getPageTitle(path: string): string {
  if (path === '/') return '总览看板';
  if (path.startsWith('/projects/new')) return '新建项目';
  if (path.startsWith('/projects/') && path.includes('/script')) return '脚本编辑器';
  if (path.startsWith('/projects/')) return '项目详情';
  if (path.startsWith('/projects')) return '项目管理';
  if (path.startsWith('/agent-market')) return '智能体市场';
  if (path.startsWith('/agents')) return '我的智能体';
  if (path.startsWith('/assets')) return '素材管理';
  if (path.startsWith('/notifications')) return '通知中心';
  if (path.startsWith('/profile')) return '个人中心';
  if (path.startsWith('/subscription')) return '订阅管理';
  return '';
}
