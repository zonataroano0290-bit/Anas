import React, { useState } from 'react';
import { useLocalization } from '../../locales/index.tsx';
import {
  BarChart3,
  ShieldCheck,
  AlertCircle,
  FileCode,
  Download,
  Calendar,
  ExternalLink,
} from 'lucide-react';

export const AnalyticsView: React.FC = () => {
  const { t } = useLocalization();
  const [dateRange, setDateRange] = useState('LAST_7_DAYS');

  const reportSchema = {
    endpoint: 'https://business-api.tiktok.com/open_api/v1.3/report/integrated/get/',
    method: 'GET',
    advertiser_id: 'ADVERTISER_ID_FROM_OAUTH',
    report_type: 'BASIC',
    data_level: 'AUCTION_AD',
    dimensions: ['ad_id', 'stat_time_day'],
    metrics: [
      'spend',
      'impressions',
      'clicks',
      'ctr',
      'cpc',
      'cpm',
      'reach',
      'video_play_actions',
      'video_watched_2s',
      'video_watched_6s',
      'video_views_p100',
      'conversion',
      'cost_per_conversion',
    ],
    status: 'PENDING_OFFICIAL_TIKTOK_API_AUTHENTICATION',
  };

  const handleDownloadSchema = () => {
    const blob = new Blob([JSON.stringify(reportSchema, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tiktok_reporting_schema_v1.3.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="pb-4 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white">{t.analytics.title}</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">{t.analytics.subtitle}</p>
        </div>

        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-slate-400" />
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white"
          >
            <option value="TODAY">Today</option>
            <option value="YESTERDAY">Yesterday</option>
            <option value="LAST_7_DAYS">Last 7 Days</option>
            <option value="LAST_30_DAYS">Last 30 Days</option>
          </select>
        </div>
      </div>

      {/* Honest Policy Notice Banner */}
      <div className="p-5 bg-slate-900 border border-blue-500/30 rounded-2xl space-y-2">
        <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
          <AlertCircle className="w-4 h-4" />
          <span>{t.analytics.honestNoticeTitle}</span>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          {t.analytics.honestNoticeText}
        </p>
        <div className="pt-2 flex items-center gap-3 text-xs">
          <a
            href="https://business-api.tiktok.com/portal/docs"
            target="_blank"
            rel="noreferrer"
            className="text-cyan-400 hover:underline flex items-center gap-1 font-semibold"
          >
            <span>Review TikTok Reporting API Docs</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>

      {/* Metric Definitions & Specifications Matrix */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
        <h2 className="text-base font-bold text-white">
          {t.analytics.metricDefinitionsTitle}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800/80 space-y-1">
            <div className="font-semibold text-white">Impressions</div>
            <div className="text-slate-400 leading-relaxed">{t.analytics.impressionsDef}</div>
          </div>

          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800/80 space-y-1">
            <div className="font-semibold text-white">Clicks & CTR</div>
            <div className="text-slate-400 leading-relaxed">
              {t.analytics.clicksDef} {t.analytics.ctrDef}
            </div>
          </div>

          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800/80 space-y-1">
            <div className="font-semibold text-white">Cost Per Click (CPC)</div>
            <div className="text-slate-400 leading-relaxed">{t.analytics.cpcDef}</div>
          </div>

          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800/80 space-y-1">
            <div className="font-semibold text-white">Video Retention (2s / 6s / 100%)</div>
            <div className="text-slate-400 leading-relaxed">{t.analytics.videoViewsDef}</div>
          </div>
        </div>

        {/* Integration JSON schema preview */}
        <div className="pt-4 border-t border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <div className="text-xs font-semibold text-slate-300 flex items-center gap-2">
              <FileCode className="w-4 h-4 text-cyan-400" />
              <span>Prepared TikTok Integrated Reporting Schema</span>
            </div>
            <button
              onClick={handleDownloadSchema}
              className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-medium"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{t.analytics.exportReportTemplate}</span>
            </button>
          </div>
          <pre className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-[11px] font-mono text-slate-300 overflow-x-auto">
            {JSON.stringify(reportSchema, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
};
