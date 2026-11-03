import React from 'react';
import { useLocalization } from '../locales/index.tsx';
import {
  LayoutDashboard,
  Layers,
  PlusCircle,
  Film,
  Users2,
  BarChart3,
  Wallet,
  Bell,
  UserCheck,
  Building2,
  HelpCircle,
  FileCheck2,
} from 'lucide-react';

interface SidebarProps {
  currentView: string;
  onNavigate: (view: string) => void;
  onOpenReport: () => void;
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onNavigate,
  onOpenReport,
  mobileOpen,
  setMobileOpen,
}) => {
  const { t } = useLocalization();

  const menuItems = [
    { id: 'dashboard', label: t.nav.dashboard, icon: LayoutDashboard },
    { id: 'campaigns', label: t.nav.campaigns, icon: Layers },
    { id: 'createCampaign', label: t.nav.createCampaign, icon: PlusCircle },
    { id: 'creatives', label: t.nav.creatives, icon: Film },
    { id: 'audience', label: t.nav.audience, icon: Users2 },
    { id: 'analytics', label: t.nav.analytics, icon: BarChart3 },
    { id: 'billing', label: t.nav.billing, icon: Wallet },
    { id: 'notifications', label: t.nav.notifications, icon: Bell },
    { id: 'profile', label: t.nav.profile, icon: UserCheck },
    { id: 'businessAccount', label: t.nav.businessAccount, icon: Building2 },
    { id: 'help', label: t.nav.help, icon: HelpCircle },
  ];

  const handleNav = (id: string) => {
    onNavigate(id);
    setMobileOpen(false);
  };

  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed lg:sticky top-16 z-30 h-[calc(100vh-4rem)] w-64 bg-slate-950 border-e border-slate-800 flex flex-col justify-between py-4 px-3 transition-transform duration-200 lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0 rtl:translate-x-full rtl:lg:translate-x-0'
        }`}
      >
        <div className="space-y-1 overflow-y-auto pr-1">
          <div className="px-3 pb-2 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            {t.common.appName} · Console
          </div>

          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNav(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2 text-xs font-medium rounded-lg transition-colors text-start whitespace-nowrap shrink-0 ${
                  isActive
                    ? 'bg-blue-600/15 text-cyan-400 font-semibold border border-blue-500/20'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-cyan-400' : 'text-slate-500'}`} />
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Phase 1 Acceptance Report link at bottom of sidebar */}
        <div className="pt-3 border-t border-slate-800/80">
          <button
            onClick={() => {
              onOpenReport();
              setMobileOpen(false);
            }}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-cyan-400 bg-cyan-950/40 hover:bg-cyan-900/40 border border-cyan-500/30 rounded-lg transition-colors text-start"
          >
            <FileCheck2 className="w-4 h-4 shrink-0 text-cyan-400" />
            <span className="truncate">{t.nav.phase1Report}</span>
          </button>
          <div className="mt-2 px-3 text-[10px] text-slate-500 flex items-center justify-between">
            <span>Phase 1 Foundation</span>
            <span className="text-slate-600">v1.3 Spec</span>
          </div>
        </div>
      </aside>
    </>
  );
};
