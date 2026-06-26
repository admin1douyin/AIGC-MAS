import { useState } from 'react';
import {
  Bell,
  CheckCircle,
  AlertCircle,
  Info,
  X,
} from 'lucide-react';

const mockNotifications = [
  {
    id: '1',
    type: 'success',
    title: '项目已完成',
    content: '您的项目「企业宣传片」已完成制作，可在项目详情页查看成品',
    projectName: '企业宣传片',
    createdAt: '2分钟前',
    read: false,
  },
  {
    id: '2',
    type: 'info',
    title: '智能体任务完成',
    content: '编剧智能体已完成剧本创作，请审核脚本内容',
    projectName: '短剧项目',
    createdAt: '15分钟前',
    read: false,
  },
  {
    id: '3',
    type: 'warning',
    title: '项目需要审核',
    content: '项目「文旅宣传」的分镜设计已完成，等待您的审核确认',
    projectName: '文旅宣传',
    createdAt: '1小时前',
    read: true,
  },
  {
    id: '4',
    type: 'info',
    title: '新项目创建成功',
    content: '您创建了新项目「品牌推广视频」，智能体正在准备工作',
    projectName: '品牌推广视频',
    createdAt: '2小时前',
    read: true,
  },
  {
    id: '5',
    type: 'success',
    title: '支付成功',
    content: '您的专业版订阅已开通，享受无限项目和高级功能',
    createdAt: '昨天',
    read: true,
  },
  {
    id: '6',
    type: 'info',
    title: '智能体市场更新',
    content: '新增「音乐设计师」智能体，可在智能体市场查看详情',
    createdAt: '昨天',
    read: true,
  },
];

type NotificationType = 'success' | 'info' | 'warning' | 'error';

export default function Notifications() {
  const [notifications, setNotifications] = useState(mockNotifications);
  const [filterType, setFilterType] = useState<NotificationType | 'all'>('all');

  const filteredNotifications = notifications.filter((n) => {
    return filterType === 'all' || n.type === filterType;
  });

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllAsRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, read: true })));
  };

  const markAsRead = (id: string) => {
    setNotifications(
      notifications.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const deleteNotification = (id: string) => {
    setNotifications(notifications.filter((n) => n.id !== id));
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'success':
        return CheckCircle;
      case 'warning':
        return AlertCircle;
      case 'error':
        return AlertCircle;
      default:
        return Info;
    }
  };

  const getTypeStyle = (type: string) => {
    switch (type) {
      case 'success':
        return 'text-emerald-600 bg-emerald-50';
      case 'warning':
        return 'text-amber-600 bg-amber-50';
      case 'error':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-blue-600 bg-blue-50';
    }
  };

  const getTypeBgStyle = (type: string) => {
    switch (type) {
      case 'success':
        return 'border-l-4 border-emerald-500';
      case 'warning':
        return 'border-l-4 border-amber-500';
      case 'error':
        return 'border-l-4 border-red-500';
      default:
        return 'border-l-4 border-blue-500';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">通知中心</h1>
          <p className="text-slate-500 mt-1">
            {unreadCount > 0 ? `您有 ${unreadCount} 条未读通知` : '暂无未读通知'}
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            全部标为已读
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2">
        {[
          { key: 'all' as const, label: '全部', icon: Bell },
          { key: 'success' as const, label: '成功', icon: CheckCircle },
          { key: 'info' as const, label: '信息', icon: Info },
          { key: 'warning' as const, label: '提醒', icon: AlertCircle },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = filterType === tab.key;
          const count = notifications.filter((n) => tab.key === 'all' || n.type === tab.key).length;
          return (
            <button
              key={tab.key}
              onClick={() => setFilterType(tab.key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
              {count > 0 && (
                <span className={`px-2 py-0.5 rounded-full text-xs ${
                  isActive ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'
                }`}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Notifications List */}
      <div className="space-y-4">
        {filteredNotifications.length > 0 ? (
          filteredNotifications.map((notification) => {
            const Icon = getTypeIcon(notification.type);
            return (
              <div
                key={notification.id}
                onClick={() => markAsRead(notification.id)}
                className={`bg-white rounded-xl border border-slate-200 p-4 cursor-pointer transition-all ${
                  !notification.read ? 'ring-2 ring-blue-100' : ''
                } ${getTypeBgStyle(notification.type)}`}
              >
                <div className="flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-lg ${getTypeStyle(notification.type)} flex items-center justify-center flex-shrink-0`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium text-slate-800">{notification.title}</h3>
                      <span className="text-xs text-slate-400">{notification.createdAt}</span>
                    </div>
                    <p className="text-sm text-slate-600 mt-1">{notification.content}</p>
                    {notification.projectName && (
                      <div className="flex items-center gap-2 mt-3">
                        <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded-full text-xs">
                          {notification.projectName}
                        </span>
                      </div>
                    )}
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteNotification(notification.id);
                    }}
                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
            <Bell className="w-16 h-16 mx-auto text-slate-300 mb-4" />
            <p className="text-slate-500">暂无通知</p>
          </div>
        )}
      </div>
    </div>
  );
}