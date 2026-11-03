import React, { useState } from 'react';
import { useLocalization } from '../../locales/index.tsx';
import {
  ArrowRight,
  ShieldCheck,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Layers,
  MapPin,
  TrendingUp,
  FileCode,
  DollarSign,
  Tv,
} from 'lucide-react';
import { OFFICIAL_USD_TO_IQD_RATE } from '../../utils/rules.ts';

interface LandingViewProps {
  onNavigate: (view: string) => void;
  onOpenReport: () => void;
}

export const LandingView: React.FC<LandingViewProps> = ({ onNavigate, onOpenReport }) => {
  const { t, direction } = useLocalization();
  const [calculatorBudget, setCalculatorBudget] = useState<number>(100);

  // Estimator: In Iraq & Kurdistan, estimated TikTok CPM (Cost Per 1000 Impressions) benchmark is ~$1.80 to $2.40 USD
  const estimatedImpressions = Math.round((calculatorBudget / 2.1) * 1000);
  const estimatedReach = Math.round(estimatedImpressions * 0.75);
  const convertedIQD = Math.round(calculatorBudget * OFFICIAL_USD_TO_IQD_RATE);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* 1. Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 border-b border-slate-800/80">
        {/* Subtle background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-blue-600/10 via-cyan-500/5 to-transparent pointer-events-none blur-3xl -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            {/* Phase 1 Pill */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-950/60 border border-blue-500/30 text-xs font-medium text-cyan-300">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>{t.landing.badge}</span>
            </div>

            {/* Hero Title */}
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
              {t.landing.heroTitle}
            </h1>

            {/* Hero Subtitle */}
            <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl mx-auto">
              {t.landing.heroSubtitle}
            </p>

            {/* CTAs */}
            <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={() => onNavigate('dashboard')}
                className="px-6 py-3 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg shadow-lg shadow-blue-600/30 transition-all flex items-center gap-2"
              >
                <span>{t.landing.launchDashboard}</span>
                <ArrowRight className={`w-4 h-4 ${direction === 'rtl' ? 'rotate-180' : ''}`} />
              </button>

              <button
                onClick={() => onNavigate('createCampaign')}
                className="px-5 py-3 text-sm font-semibold text-slate-200 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-lg transition-colors"
              >
                + {t.nav.createCampaign}
              </button>

              <button
                onClick={onOpenReport}
                className="px-4 py-3 text-sm font-medium text-cyan-400 bg-cyan-950/30 hover:bg-cyan-900/40 border border-cyan-500/30 rounded-lg transition-colors flex items-center gap-2"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>{t.landing.viewReport}</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Transparency & Honesty Policy Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 relative z-10">
        <div className="bg-slate-900/90 border border-blue-500/30 rounded-xl p-5 shadow-xl backdrop-blur-md">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="p-2.5 rounded-lg bg-blue-500/10 border border-blue-500/20 text-cyan-400 shrink-0">
              <AlertTriangle className="w-5 h-5 text-amber-400" />
            </div>
            <div className="space-y-1 flex-1">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span>{t.landing.honestyBannerTitle}</span>
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                {t.landing.honestyBannerText}
              </p>
            </div>
            <a
              href="https://business-api.tiktok.com/portal/docs"
              target="_blank"
              rel="noreferrer"
              className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 underline underline-offset-4 whitespace-nowrap shrink-0"
            >
              TikTok API Docs ↗
            </a>
          </div>
        </div>
      </section>

      {/* 3. How It Works (Campaign Lifecycle) */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="text-2xl font-bold text-white">{t.landing.howItWorksTitle}</h2>
          <p className="text-sm text-slate-400">{t.landing.howItWorksSubtitle}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-3">
            <div className="w-10 h-10 rounded-lg bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <MapPin className="w-5 h-5" />
            </div>
            <h3 className="text-base font-semibold text-white">{t.landing.step1Title}</h3>
            <p className="text-xs text-slate-400 leading-relaxed">{t.landing.step1Desc}</p>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-3">
            <div className="w-10 h-10 rounded-lg bg-cyan-600/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
              <Tv className="w-5 h-5" />
            </div>
            <h3 className="text-base font-semibold text-white">{t.landing.step2Title}</h3>
            <p className="text-xs text-slate-400 leading-relaxed">{t.landing.step2Desc}</p>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-600/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <DollarSign className="w-5 h-5" />
            </div>
            <h3 className="text-base font-semibold text-white">{t.landing.step3Title}</h3>
            <p className="text-xs text-slate-400 leading-relaxed">{t.landing.step3Desc}</p>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-3">
            <div className="w-10 h-10 rounded-lg bg-purple-600/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <FileCode className="w-5 h-5" />
            </div>
            <h3 className="text-base font-semibold text-white">{t.landing.step4Title}</h3>
            <p className="text-xs text-slate-400 leading-relaxed">{t.landing.step4Desc}</p>
          </div>
        </div>
      </section>

      {/* 4. Interactive Budget & Reach Estimator */}
      <section className="py-12 bg-slate-900/40 border-y border-slate-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-xl sm:text-2xl font-bold text-white">{t.landing.calculatorTitle}</h2>
            <p className="text-xs sm:text-sm text-slate-400">{t.landing.calculatorSubtitle}</p>
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-slate-300">Set Planned Budget (USD)</span>
                <span className="font-mono font-bold text-cyan-400 text-lg tabular-nums">
                  ${calculatorBudget} USD
                </span>
              </div>
              <input
                type="range"
                min="50"
                max="1000"
                step="25"
                value={calculatorBudget}
                onChange={(e) => setCalculatorBudget(Number(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
              />
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>Min: $50 (Official TikTok Daily Minimum)</span>
                <span>$500</span>
                <span>$1,000+</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-800">
              <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800/80">
                <div className="text-xs text-slate-400 mb-1">Iraqi Dinar Equivalent</div>
                <div className="text-lg font-bold text-white font-mono tabular-nums">
                  {convertedIQD.toLocaleString()} IQD
                </div>
                <div className="text-[10px] text-slate-500 mt-1">Rate: 1,310 IQD / USD</div>
              </div>

              <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800/80">
                <div className="text-xs text-slate-400 mb-1">Estimated Impressions</div>
                <div className="text-lg font-bold text-cyan-400 font-mono tabular-nums">
                  ~{estimatedImpressions.toLocaleString()}
                </div>
                <div className="text-[10px] text-slate-500 mt-1">Based on ~ $2.10 CPM in Iraq</div>
              </div>

              <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800/80">
                <div className="text-xs text-slate-400 mb-1">Estimated Unique Reach</div>
                <div className="text-lg font-bold text-emerald-400 font-mono tabular-nums">
                  ~{estimatedReach.toLocaleString()} users
                </div>
                <div className="text-[10px] text-slate-500 mt-1">Estimated frequency ~ 1.3x</div>
              </div>
            </div>

            <div className="text-center pt-2">
              <button
                onClick={() => onNavigate('createCampaign')}
                className="px-6 py-2.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors"
              >
                Start Campaign with ${calculatorBudget} USD
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Footer */}
      <footer className="border-t border-slate-800/80 py-10 bg-slate-950 text-slate-400 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-white">{t.common.appName}</span>
            <span>·</span>
            <span>{t.common.tagline}</span>
          </div>
          <div className="flex items-center gap-4 text-slate-500">
            <button onClick={onOpenReport} className="hover:text-cyan-400 transition-colors">
              {t.nav.phase1Report}
            </button>
            <span>·</span>
            <a
              href="https://business-api.tiktok.com/portal/docs"
              target="_blank"
              rel="noreferrer"
              className="hover:text-cyan-400 transition-colors"
            >
              TikTok Marketing API Docs ↗
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};
