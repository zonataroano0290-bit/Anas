import React, { useState } from 'react';
import { useLocalization } from '../../locales/index.tsx';
import { Bell, CheckCheck, Info, ShieldAlert, Sparkles } from 'lucide-react';

interface NotificationItem {
  id: string;
  title: string;
  body: string;
  type: 'info' | 'compliance' | 'update';
  timestamp: string;
  read: boolean;
}

export const NotificationsView: React.FC = () => {
  const { t } = useLocalization();

  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: 'notif_1',
      title: 'Phase 1 Architecture Deployed',
      body: 'MikMik Sponsor Phase 1 self-service advertising architecture has been initialized with Iraqi governorate targeting and dual-currency budgeting.',
      type: 'info',
      timestamp: 'Today at 10:00 AM',
      read: false,
    },
    {
      id: 'notif_2',
      title: 'TikTok Marketing API v1.3 Guard Active',
      body: 'Direct ad dispatch is safeguarded. Live campaign delivery will be unlocked once enterprise developer keys and Ad Account OAuth are provisioned.',
      type: 'compliance',
      timestamp: 'Yesterday',
      read: false,
    },
    {
      id: 'notif_3',
      title: 'Dual-Currency Exchange Rate Sync',
      body: 'Standard exchange rate for Iraqi Dinar reference calibrated to 1,310 IQD per 1 USD according to Central Bank of Iraq standards.',
      type: 'update',
      timestamp: '3 days ago',
      read: true,
    },
  ]);

  const markAllRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, read: true })));
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="pb-4 border-b border-slate-800 flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white">{t.notifications.title}</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">{t.notifications.subtitle}</p>
        </div>

        <button
          onClick={markAllRead}
          className="text-xs text-cyan-400 hover:text-cyan-300 font-medium flex items-center gap-1.5"
        >
          <CheckCheck className="w-4 h-4" />
          <span>{t.notifications.markAllRead}</span>
        </button>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {notifications.map((n) => (
          <div
            key={n.id}
            className={`p-4 rounded-xl border transition-all ${
              n.read
                ? 'bg-slate-900/40 border-slate-800/80 text-slate-400'
                : 'bg-slate-900 border-slate-800 text-slate-200'
            }`}
          >
            <div className="flex items-start gap-3">
              <div
                className={`p-2 rounded-lg shrink-0 ${
                  n.type === 'compliance'
                    ? 'bg-amber-500/10 text-amber-400'
                    : n.type === 'info'
                    ? 'bg-cyan-500/10 text-cyan-400'
                    : 'bg-blue-500/10 text-blue-400'
                }`}
              >
                {n.type === 'compliance' ? (
                  <ShieldAlert className="w-4 h-4" />
                ) : (
                  <Info className="w-4 h-4" />
                )}
              </div>

              <div className="space-y-1 flex-1 text-xs">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-white">{n.title}</h3>
                  <span className="text-[10px] text-slate-500">{n.timestamp}</span>
                </div>
                <p className="text-slate-400 leading-relaxed">{n.body}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
