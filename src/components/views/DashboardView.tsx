import React, { useState, useEffect } from 'react';
import { useLocalization } from '../../locales/index.tsx';
import {
  Layers,
  PlusCircle,
  Film,
  Users2,
  Wallet,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  ShieldAlert,
} from 'lucide-react';
import type { Campaign, TikTokApiConfigReport } from '../../types/index.ts';
import { CampaignService } from '../../services/campaignService.ts';
import { fetchTikTokApiStatus } from '../../services/tiktokApiService.ts';

interface DashboardViewProps {
  onNavigate: (view: string) => void;
  onSelectCampaign: (id: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onNavigate, onSelectCampaign }) => {
  const { t } = useLocalization();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [apiReport, setApiReport] = useState<TikTokApiConfigReport | null>(null);
  const [checkingApi, setCheckingApi] = useState(false);

  const loadData = async () => {
    setCampaigns(CampaignService.getAllCampaigns());
    setCheckingApi(true);
    const report = await fetchTikTokApiStatus();
    setApiReport(report);
    setCheckingApi(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const draftsCount = campaigns.filter((c) => c.status === 'draft' || c.status === 'awaiting_configuration').length;
  const readyCount = campaigns.filter((c) => c.status === 'ready_to_submit').length;
  const activeCount = campaigns.filter((c) => c.status === 'active').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white">{t.dashboard.welcome}</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">{t.dashboard.subtitle}</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('createCampaign')}
            className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors flex items-center gap-2 shadow-sm shadow-blue-500/20"
          >
            <PlusCircle className="w-4 h-4" />
            <span>{t.dashboard.newCampaign}</span>
          </button>
        </div>
      </div>

      {/* Operational KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="text-xs text-slate-400 flex items-center justify-between">
            <span>{t.dashboard.totalCampaigns}</span>
            <Layers className="w-4 h-4 text-slate-500" />
          </div>
          <div className="text-2xl font-bold text-white font-mono tabular-nums mt-2">
            {campaigns.length}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Stored in Phase 1 workspace</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="text-xs text-slate-400 flex items-center justify-between">
            <span>{t.dashboard.drafts}</span>
            <span className="w-2 h-2 rounded-full bg-amber-400" />
          </div>
          <div className="text-2xl font-bold text-amber-400 font-mono tabular-nums mt-2">
            {draftsCount}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Awaiting completion / review</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="text-xs text-slate-400 flex items-center justify-between">
            <span>{t.dashboard.readyToSubmit}</span>
            <span className="w-2 h-2 rounded-full bg-cyan-400" />
          </div>
          <div className="text-2xl font-bold text-cyan-400 font-mono tabular-nums mt-2">
            {readyCount}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Configured for TikTok API v1.3</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="text-xs text-slate-400 flex items-center justify-between">
            <span>{t.dashboard.activeCampaigns}</span>
            <span className="w-2 h-2 rounded-full bg-slate-600" />
          </div>
          <div className="text-2xl font-bold text-slate-400 font-mono tabular-nums mt-2">
            {activeCount}
          </div>
          <div className="text-[10px] text-amber-400/90 mt-1 leading-tight flex items-center gap-1">
            <AlertCircle className="w-3 h-3 shrink-0" />
            <span>Requires live TikTok API</span>
          </div>
        </div>
      </div>

      {/* TikTok Marketing API Connection Status Box */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-950 border border-blue-500/30 flex items-center justify-center text-cyan-400">
              <ShieldAlert className="w-4 h-4 text-cyan-400" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">{t.dashboard.tiktokStatusTitle}</h2>
              <div className="text-xs text-slate-400">
                Specification: TikTok Marketing API v1.3 · In-Feed Video Ads
              </div>
            </div>
          </div>
          <button
            onClick={loadData}
            disabled={checkingApi}
            className="px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors flex items-center gap-2 self-start sm:self-auto"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${checkingApi ? 'animate-spin' : ''}`} />
            <span>Check API Endpoint</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 pt-2 text-xs">
          <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
            <span className="text-slate-400 block mb-1">Server API Proxy</span>
            <span className="font-semibold text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Configured (/api/tiktok)</span>
            </span>
          </div>

          <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
            <span className="text-slate-400 block mb-1">TikTok App ID</span>
            <span className="font-semibold text-amber-400 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>Pending Phase 2 Registration</span>
            </span>
          </div>

          <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
            <span className="text-slate-400 block mb-1">Advertiser OAuth Token</span>
            <span className="font-semibold text-slate-400 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>Not Linked</span>
            </span>
          </div>

          <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
            <span className="text-slate-400 block mb-1">Official Documentation</span>
            <a
              href="https://business-api.tiktok.com/portal/docs"
              target="_blank"
              rel="noreferrer"
              className="text-cyan-400 hover:underline flex items-center gap-1 font-semibold"
            >
              <span>business-api.tiktok.com</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        <p className="text-xs text-slate-400 leading-relaxed pt-1">
          {t.dashboard.tiktokStatusDesc}
        </p>
      </div>

      {/* Quick Action Navigation Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <button
          onClick={() => onNavigate('createCampaign')}
          className="p-4 bg-slate-900/60 hover:bg-slate-900 border border-slate-800 hover:border-blue-500/40 rounded-xl transition-all text-start group"
        >
          <PlusCircle className="w-5 h-5 text-blue-400 mb-2 group-hover:scale-110 transition-transform" />
          <div className="text-sm font-semibold text-white">{t.dashboard.newCampaign}</div>
          <div className="text-xs text-slate-400 mt-1">Target Iraqi governorates with In-Feed Ads</div>
        </button>

        <button
          onClick={() => onNavigate('creatives')}
          className="p-4 bg-slate-900/60 hover:bg-slate-900 border border-slate-800 hover:border-cyan-500/40 rounded-xl transition-all text-start group"
        >
          <Film className="w-5 h-5 text-cyan-400 mb-2 group-hover:scale-110 transition-transform" />
          <div className="text-sm font-semibold text-white">{t.dashboard.manageCreatives}</div>
          <div className="text-xs text-slate-400 mt-1">Upload 9:16 vertical video assets</div>
        </button>

        <button
          onClick={() => onNavigate('audience')}
          className="p-4 bg-slate-900/60 hover:bg-slate-900 border border-slate-800 hover:border-purple-500/40 rounded-xl transition-all text-start group"
        >
          <Users2 className="w-5 h-5 text-purple-400 mb-2 group-hover:scale-110 transition-transform" />
          <div className="text-sm font-semibold text-white">{t.dashboard.viewAudience}</div>
          <div className="text-xs text-slate-400 mt-1">Demographics for Kurdistan & Iraq</div>
        </button>

        <button
          onClick={() => onNavigate('billing')}
          className="p-4 bg-slate-900/60 hover:bg-slate-900 border border-slate-800 hover:border-emerald-500/40 rounded-xl transition-all text-start group"
        >
          <Wallet className="w-5 h-5 text-emerald-400 mb-2 group-hover:scale-110 transition-transform" />
          <div className="text-sm font-semibold text-white">{t.dashboard.checkBilling}</div>
          <div className="text-xs text-slate-400 mt-1">FastPay, ZainCash & FIB integrations</div>
        </button>
      </div>

      {/* Recent Campaigns Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-white">{t.dashboard.recentCampaigns}</h2>
          <button
            onClick={() => onNavigate('campaigns')}
            className="text-xs text-cyan-400 hover:text-cyan-300 font-medium flex items-center gap-1"
          >
            <span>View All</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {campaigns.length === 0 ? (
          <div className="text-center py-12 px-4 bg-slate-950/50 rounded-xl border border-slate-800/80 space-y-3">
            <Layers className="w-8 h-8 text-slate-600 mx-auto" />
            <p className="text-sm text-slate-400 max-w-md mx-auto">
              {t.dashboard.noCampaignsYet}
            </p>
            <button
              onClick={() => onNavigate('createCampaign')}
              className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors inline-block"
            >
              {t.wizard.title}
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-start text-xs">
              <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="py-2.5 px-3 text-start">Name</th>
                  <th className="py-2.5 px-3 text-start">Objective</th>
                  <th className="py-2.5 px-3 text-start">Status</th>
                  <th className="py-2.5 px-3 text-start">Budget</th>
                  <th className="py-2.5 px-3 text-end">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {campaigns.slice(0, 5).map((c) => (
                  <tr key={c.id} className="hover:bg-slate-800/50 transition-colors">
                    <td className="py-2.5 px-3 font-medium text-white">{c.name}</td>
                    <td className="py-2.5 px-3 text-slate-300">{c.objective}</td>
                    <td className="py-2.5 px-3">
                      <span className="text-cyan-400 font-medium">
                        {t.statusLabels[c.status] || c.status}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-mono tabular-nums text-slate-200">
                      ${c.budget.amountUSD} USD
                    </td>
                    <td className="py-2.5 px-3 text-end">
                      <button
                        onClick={() => onSelectCampaign(c.id)}
                        className="text-xs text-blue-400 hover:text-blue-300 font-semibold"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
