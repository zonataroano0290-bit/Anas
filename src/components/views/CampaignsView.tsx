import React, { useState, useEffect } from 'react';
import { useLocalization } from '../../locales/index.tsx';
import {
  Layers,
  Search,
  Filter,
  PlusCircle,
  Download,
  Upload,
  Eye,
  Trash2,
  AlertTriangle,
  Code2,
  CheckCircle2,
  X,
  FileJson,
  ShieldAlert,
} from 'lucide-react';
import type { Campaign, CampaignStatus } from '../../types/index.ts';
import { CampaignService } from '../../services/campaignService.ts';
import { formatTikTokApiPayload } from '../../services/tiktokApiService.ts';
import { ALLOWED_TRANSITIONS, canTransitionStatus } from '../../utils/rules.ts';

import { useAuth } from '../../context/AuthContext.tsx';
import { Database } from 'lucide-react';

interface CampaignsViewProps {
  onNavigate: (view: string) => void;
  selectedCampaignId?: string | null;
  onClearSelectedCampaign?: () => void;
}

export const CampaignsView: React.FC<CampaignsViewProps> = ({
  onNavigate,
  selectedCampaignId,
  onClearSelectedCampaign,
}) => {
  const { t } = useLocalization();
  const { user } = useAuth();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [activeModalCampaign, setActiveModalCampaign] = useState<Campaign | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const reloadCampaigns = async () => {
    setLoading(true);
    try {
      const list = await CampaignService.getCampaigns(user?.id);
      setCampaigns(list);
    } catch (err) {
      console.error('Failed to load campaigns from Firestore:', err);
      setActionError('Error retrieving campaigns from Cloud Firestore.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    reloadCampaigns();
  }, [user?.id]);

  useEffect(() => {
    if (selectedCampaignId) {
      CampaignService.getCampaignById(selectedCampaignId).then((found) => {
        if (found) setActiveModalCampaign(found);
      });
    }
  }, [selectedCampaignId]);

  const handleExportJson = async () => {
    try {
      const jsonStr = await CampaignService.exportCampaignsAsJson(user?.id);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `mikmik_campaigns_${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      setActionError('Failed to export campaigns.');
    }
  };

  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      const content = evt.target?.result as string;
      const res = await CampaignService.importCampaignsFromJson(content);
      if (res.success) {
        setActionSuccess(`Successfully persisted ${res.count} campaign(s) to Firestore.`);
        reloadCampaigns();
      } else {
        setActionError(res.error || 'Failed to import JSON file.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleDelete = async (id: string) => {
    if (window.confirm(t.campaigns.deleteConfirm)) {
      try {
        await CampaignService.deleteCampaign(id);
        await reloadCampaigns();
        if (activeModalCampaign?.id === id) {
          setActiveModalCampaign(null);
        }
      } catch (e) {
        setActionError('Failed to delete campaign from database.');
      }
    }
  };

  const handleStatusTransition = async (campaign: Campaign, newStatus: CampaignStatus) => {
    setActionError(null);
    setActionSuccess(null);

    const check = canTransitionStatus(campaign.status, newStatus, {
      isTikTokApiAuthorized: false, // Phase 3 honest rule: No live API authorized yet
    });

    if (!check.allowed) {
      setActionError(check.reason || 'Status transition not allowed.');
      return;
    }

    const res = await CampaignService.updateStatus(campaign.id, newStatus, {
      userEmail: user?.email,
    });
    if (res.success) {
      setActionSuccess(`Status transitioned to ${t.statusLabels[newStatus]} in Firestore.`);
      await reloadCampaigns();
      const updated = await CampaignService.getCampaignById(campaign.id);
      if (updated) setActiveModalCampaign(updated);
    } else {
      setActionError(res.error || 'Failed to update status.');
    }
  };

  const filtered = campaigns.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white">{t.campaigns.title}</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">{t.campaigns.subtitle}</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <label className="cursor-pointer px-3 py-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-900 border border-slate-800 rounded-lg hover:border-slate-700 transition-colors flex items-center gap-1.5">
            <Upload className="w-3.5 h-3.5 text-cyan-400" />
            <span>{t.campaigns.importBtn}</span>
            <input type="file" accept=".json" onChange={handleImportJson} className="hidden" />
          </label>

          <button
            onClick={handleExportJson}
            disabled={campaigns.length === 0}
            className="px-3 py-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-900 border border-slate-800 rounded-lg hover:border-slate-700 disabled:opacity-50 transition-colors flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5 text-blue-400" />
            <span>{t.campaigns.exportBtn}</span>
          </button>

          <button
            onClick={() => onNavigate('createCampaign')}
            className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors flex items-center gap-1.5 shadow-sm shadow-blue-500/20"
          >
            <PlusCircle className="w-4 h-4" />
            <span>{t.campaigns.newCampaignBtn}</span>
          </button>
        </div>
      </div>

      {/* Database Connection Banner */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <div className="text-slate-300 font-medium flex items-center gap-1.5">
            <Database className="w-3.5 h-3.5 text-cyan-400" />
            <span>Cloud Firestore: <code className="text-cyan-300 font-mono text-[11px]">ai-studio-mikmiksponsor-e30ad243-6166-45af-86d4-6c410667bd49</code></span>
          </div>
        </div>
        <div className="flex items-center gap-3 text-slate-400 text-[11px]">
          <span>Security: <strong className="text-slate-200">ABAC Deployed</strong></span>
          <span>•</span>
          <span>Scope: <strong className="text-slate-200">{user ? user.email : 'Signed Out'}</strong></span>
          <span>•</span>
          <span>Total Records: <strong className="text-slate-200">{campaigns.length}</strong></span>
        </div>
      </div>

      {/* Notifications / Alerts */}
      {actionError && (
        <div className="p-4 bg-red-950/40 border border-red-500/40 rounded-xl text-xs text-red-300 flex items-start gap-3">
          <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <div className="font-semibold text-red-200">Enforcement Notice</div>
            <div>{actionError}</div>
          </div>
          <button onClick={() => setActionError(null)} className="ms-auto text-red-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {actionSuccess && (
        <div className="p-4 bg-emerald-950/40 border border-emerald-500/40 rounded-xl text-xs text-emerald-300 flex items-center justify-between">
          <span>{actionSuccess}</span>
          <button onClick={() => setActionSuccess(null)} className="text-emerald-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Filters and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-900/60 p-3 rounded-xl border border-slate-800">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute start-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder={t.campaigns.searchPlaceholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full ps-9 pe-4 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-cyan-500"
          >
            <option value="all">{t.campaigns.filterAll}</option>
            <option value="draft">{t.statusLabels.draft}</option>
            <option value="awaiting_configuration">{t.statusLabels.awaiting_configuration}</option>
            <option value="pending_review">{t.statusLabels.pending_review}</option>
            <option value="pending_approval">{t.statusLabels.pending_approval}</option>
            <option value="ready_to_submit">{t.statusLabels.ready_to_submit}</option>
            <option value="submitted_to_tiktok">{t.statusLabels.submitted_to_tiktok}</option>
            <option value="active">{t.statusLabels.active}</option>
            <option value="paused">{t.statusLabels.paused}</option>
            <option value="rejected">{t.statusLabels.rejected}</option>
            <option value="completed">{t.statusLabels.completed}</option>
            <option value="failed">{t.statusLabels.failed}</option>
          </select>
        </div>
      </div>

      {/* Campaigns Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        {filtered.length === 0 ? (
          <div className="text-center py-16 px-4 space-y-3">
            <Layers className="w-8 h-8 text-slate-600 mx-auto" />
            <p className="text-sm text-slate-400">
              {campaigns.length === 0
                ? t.dashboard.noCampaignsYet
                : 'No campaigns match your search and filter criteria.'}
            </p>
            {campaigns.length === 0 && (
              <button
                onClick={() => onNavigate('createCampaign')}
                className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors inline-block"
              >
                {t.wizard.title}
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-start text-xs">
              <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4 text-start">{t.campaigns.tableHeaders.name}</th>
                  <th className="py-3 px-4 text-start">{t.campaigns.tableHeaders.objective}</th>
                  <th className="py-3 px-4 text-start">{t.campaigns.tableHeaders.status}</th>
                  <th className="py-3 px-4 text-start">{t.campaigns.tableHeaders.budget}</th>
                  <th className="py-3 px-4 text-start">{t.campaigns.tableHeaders.locations}</th>
                  <th className="py-3 px-4 text-start">{t.campaigns.tableHeaders.created}</th>
                  <th className="py-3 px-4 text-end">{t.campaigns.tableHeaders.actions}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filtered.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 font-semibold text-white">
                      <div>{c.name}</div>
                      <div className="text-[10px] text-slate-500 font-mono">{c.id}</div>
                    </td>
                    <td className="py-3 px-4 text-slate-300">{c.objective}</td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1.5 font-medium text-cyan-400">
                        <span>{t.statusLabels[c.status] || c.status}</span>
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono tabular-nums text-slate-200">
                      <div>${c.budget.amountUSD} USD</div>
                      <div className="text-[10px] text-slate-500">
                        {c.budget.amountIQD?.toLocaleString()} IQD
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-400">
                      {c.audience.locations.length} governorates
                    </td>
                    <td className="py-3 px-4 text-slate-500 font-mono tabular-nums">
                      {new Date(c.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-end space-s-2">
                      <button
                        onClick={() => setActiveModalCampaign(c)}
                        className="px-2.5 py-1 text-xs text-cyan-400 hover:text-cyan-300 font-medium hover:bg-cyan-950/40 rounded transition-colors"
                      >
                        {t.common.viewDetails}
                      </button>
                      <button
                        onClick={() => handleDelete(c.id)}
                        className="p-1 text-slate-500 hover:text-red-400 rounded transition-colors"
                        title={t.common.delete}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Campaign Detail Drawer / Modal */}
      {activeModalCampaign && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white">{activeModalCampaign.name}</h3>
                <div className="text-xs text-slate-400 mt-0.5">
                  ID: <span className="font-mono text-cyan-400">{activeModalCampaign.id}</span>
                </div>
              </div>
              <button
                onClick={() => {
                  setActiveModalCampaign(null);
                  if (onClearSelectedCampaign) onClearSelectedCampaign();
                }}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6 text-xs text-slate-300">
              {/* Lifecycle Status Bar */}
              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-300">Current Lifecycle Status:</span>
                  <span className="px-2.5 py-0.5 rounded text-cyan-400 font-bold bg-cyan-950/60 border border-cyan-500/30">
                    {t.statusLabels[activeModalCampaign.status]}
                  </span>
                </div>
                <p className="text-slate-400 leading-relaxed">
                  {t.statusDescriptions[activeModalCampaign.status]}
                </p>

                {/* Transition Actions */}
                <div className="pt-2 border-t border-slate-800 flex flex-wrap items-center gap-2">
                  <span className="text-slate-500 font-medium me-1">Available Transitions:</span>
                  {(ALLOWED_TRANSITIONS[activeModalCampaign.status] || []).map((nextStatus) => (
                    <button
                      key={nextStatus}
                      onClick={() => handleStatusTransition(activeModalCampaign, nextStatus)}
                      className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 rounded transition-colors text-xs"
                    >
                      Move to {t.statusLabels[nextStatus]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Campaign Configuration Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 space-y-1">
                  <div className="text-slate-500">Objective</div>
                  <div className="font-semibold text-white">{activeModalCampaign.objective}</div>
                </div>

                <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 space-y-1">
                  <div className="text-slate-500">Budget Mode & Amount</div>
                  <div className="font-semibold text-white font-mono tabular-nums">
                    ${activeModalCampaign.budget.amountUSD} USD ({activeModalCampaign.budget.type})
                  </div>
                  <div className="text-[10px] text-slate-400">
                    ~ {activeModalCampaign.budget.amountIQD?.toLocaleString()} IQD
                  </div>
                </div>

                <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 space-y-1">
                  <div className="text-slate-500">Targeted Iraqi Governorates</div>
                  <div className="font-semibold text-white">
                    {activeModalCampaign.audience.locations.join(', ')}
                  </div>
                </div>

                <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 space-y-1">
                  <div className="text-slate-500">Audience Demographics</div>
                  <div className="font-semibold text-white">
                    Gender: {activeModalCampaign.audience.gender} · Ages: {activeModalCampaign.audience.ageRanges.join(', ')}
                  </div>
                </div>
              </div>

              {/* Ad Creative & Text */}
              <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800 space-y-2">
                <div className="font-semibold text-white">In-Feed Ad Creative Specification</div>
                <div className="grid grid-cols-2 gap-2 text-slate-400">
                  <div>Video Format: {activeModalCampaign.creative.aspectRatio} Vertical</div>
                  <div>Duration: {activeModalCampaign.creative.durationSeconds}s</div>
                  <div>Display Brand: {activeModalCampaign.creative.displayAccountName}</div>
                  <div>CTA Button: {activeModalCampaign.creative.callToAction}</div>
                </div>
                <div className="pt-2 border-t border-slate-800">
                  <span className="text-slate-500 block mb-1">Ad Caption:</span>
                  <p className="text-slate-200 bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                    {activeModalCampaign.creative.adText}
                  </p>
                </div>
              </div>

              {/* TikTok Marketing API Payload Preview */}
              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="font-semibold text-cyan-400 flex items-center gap-1.5">
                    <Code2 className="w-4 h-4" />
                    <span>{t.campaigns.tiktokPayloadPreview}</span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono">v1.3 In-Feed Schema</span>
                </div>
                <pre className="p-3 bg-slate-900/90 rounded-lg text-[11px] font-mono text-slate-300 overflow-x-auto max-h-48">
                  {JSON.stringify(formatTikTokApiPayload(activeModalCampaign), null, 2)}
                </pre>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-800 bg-slate-950 flex items-center justify-between">
              <button
                onClick={() => handleDelete(activeModalCampaign.id)}
                className="px-3 py-1.5 text-xs text-red-400 hover:text-red-300 font-medium transition-colors"
              >
                Delete Campaign
              </button>
              <button
                onClick={() => setActiveModalCampaign(null)}
                className="px-4 py-2 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
