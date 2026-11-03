import React, { useState } from 'react';
import { useLocalization } from '../../locales/index.tsx';
import {
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  Tv,
  Globe,
  Upload,
  Layers,
  Sparkles,
  Info,
  DollarSign,
  Calendar,
  Smartphone,
  ShieldAlert,
} from 'lucide-react';
import type {
  Campaign,
  CampaignObjective,
  BudgetType,
  AudienceTargeting,
  AdCreative,
} from '../../types/index.ts';
import {
  IRAQI_GOVERNORATES,
  OFFICIAL_USD_TO_IQD_RATE,
  validateCampaignBudget,
  validateCreativeSpecs,
  validateAudienceSelection,
} from '../../utils/rules.ts';
import { CampaignService } from '../../services/campaignService.ts';
import { CampaignEventService } from '../../services/eventService.ts';
import { useAuth } from '../../context/AuthContext.tsx';

interface CreateCampaignViewProps {
  onNavigate: (view: string) => void;
  onCampaignCreated: (id: string) => void;
}

export const CreateCampaignView: React.FC<CreateCampaignViewProps> = ({
  onNavigate,
  onCampaignCreated,
}) => {
  const { t, direction } = useLocalization();
  const { user } = useAuth();

  const [currentStep, setCurrentStep] = useState<number>(1);
  const [formErrors, setFormErrors] = useState<string[]>([]);

  // Form State
  const [name, setName] = useState('New Spring In-Feed Campaign');
  const [advertiserType, setAdvertiserType] = useState<'individual' | 'business'>('business');
  const [objective, setObjective] = useState<CampaignObjective>('TRAFFIC');

  // Audience
  const [selectedLocations, setSelectedLocations] = useState<string[]>([
    'IQ-ER', // Erbil
    'IQ-SU', // Sulaymaniyah
    'IQ-DH', // Duhok
  ]);
  const [selectedLanguages, setSelectedLanguages] = useState<('ckb' | 'ar' | 'en')[]>([
    'ckb',
    'ar',
  ]);
  const [selectedAges, setSelectedAges] = useState<string[]>(['18-24', '25-34', '35-44']);
  const [gender, setGender] = useState<'ALL' | 'MALE' | 'FEMALE'>('ALL');

  // Creative
  const [adText, setAdText] = useState('کڕینی باشترین بەرهەمەکان بە گەیاندنی خێرا بۆ هەموو عێراق');
  const [callToAction, setCallToAction] = useState<
    'LEARN_MORE' | 'SHOP_NOW' | 'SIGN_UP' | 'CONTACT_US' | 'DOWNLOAD' | 'ORDER_NOW'
  >('SHOP_NOW');
  const [destinationUrl, setDestinationUrl] = useState('https://example.com/shop');
  const [displayAccountName, setDisplayAccountName] = useState('MikMik Official');
  const [videoDuration, setVideoDuration] = useState<number>(15);
  const [videoAspectRatio, setVideoAspectRatio] = useState<'9:16' | '1:1' | '16:9'>('9:16');
  const [videoFileName, setVideoFileName] = useState('promo_video_vertical_1080p.mp4');

  // Budget
  const [budgetType, setBudgetType] = useState<BudgetType>('DAILY');
  const [budgetUSD, setBudgetUSD] = useState<number>(75);
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState('');

  // Calculations
  const convertedIQD = Math.round(budgetUSD * OFFICIAL_USD_TO_IQD_RATE);

  const selectKurdistan = () => {
    setSelectedLocations(['IQ-ER', 'IQ-SU', 'IQ-DH', 'IQ-HL']);
  };

  const selectAllIraq = () => {
    setSelectedLocations(IRAQI_GOVERNORATES.map((g) => g.code));
  };

  const clearLocations = () => {
    setSelectedLocations([]);
  };

  const toggleLocation = (code: string) => {
    if (selectedLocations.includes(code)) {
      setSelectedLocations(selectedLocations.filter((c) => c !== code));
    } else {
      setSelectedLocations([...selectedLocations, code]);
    }
  };

  const validateCurrentStep = (): boolean => {
    const errors: string[] = [];

    if (currentStep === 1) {
      if (!name.trim()) errors.push('Campaign name is required.');
    } else if (currentStep === 2) {
      const audVal = validateAudienceSelection({
        locations: selectedLocations,
        languages: selectedLanguages,
        ageRanges: selectedAges,
      });
      if (!audVal.isValid) errors.push(...audVal.errors);
    } else if (currentStep === 3) {
      const crVal = validateCreativeSpecs({
        durationSeconds: videoDuration,
        fileSizeBytes: 24 * 1024 * 1024,
        aspectRatio: videoAspectRatio,
        adText,
        destinationUrl,
      });
      if (!crVal.isValid) errors.push(...crVal.errors);
    } else if (currentStep === 4) {
      const bgVal = validateCampaignBudget(budgetUSD, budgetType);
      if (!bgVal.isValid) errors.push(...bgVal.errors);
      if (!startDate) errors.push('Start date is required.');
    }

    setFormErrors(errors);
    return errors.length === 0;
  };

  const handleNext = () => {
    if (validateCurrentStep()) {
      setCurrentStep((prev) => Math.min(prev + 1, 5));
    }
  };

  const handleBack = () => {
    setFormErrors([]);
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSaveCampaign = async (targetStatus: 'draft' | 'ready_to_submit') => {
    if (!validateCurrentStep()) return;

    const campaignId = `cmp_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const effectiveOwnerId = user?.id || 'anonymous_user';

    const newCampaign: Campaign = {
      id: campaignId,
      ownerId: effectiveOwnerId,
      name,
      objective,
      status: targetStatus,
      advertiserType,
      budget: {
        type: budgetType,
        amountUSD: budgetUSD,
        amountIQD: convertedIQD,
        exchangeRate: OFFICIAL_USD_TO_IQD_RATE,
      },
      schedule: {
        scheduleType: endDate ? 'SCHEDULED' : 'CONTINUOUS',
        startDate,
        endDate: endDate || undefined,
      },
      audience: {
        locations: selectedLocations,
        languages: selectedLanguages,
        ageRanges: selectedAges,
        gender,
        interests: ['E-Commerce', 'Technology', 'Shopping', 'Lifestyle'],
      },
      creative: {
        id: `cr_${Date.now()}`,
        ownerId: effectiveOwnerId,
        name: `${name} Creative`,
        videoFileName,
        fileSizeBytes: 24 * 1024 * 1024,
        durationSeconds: videoDuration,
        aspectRatio: videoAspectRatio,
        resolution: '1080x1920',
        adText,
        callToAction,
        destinationUrl,
        displayAccountName,
        createdAt: new Date().toISOString(),
      },
      tiktokIntegration: {
        isLinkedToAdAccount: false,
        submissionStatusNote:
          'Phase 3: Validated against TikTok Marketing API v1.3 In-Feed Ads specification. Persisted in Cloud Firestore database.',
        apiReadinessCheck: true,
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      const result = await CampaignService.saveCampaign(newCampaign);
      if (result.success) {
        // Record immutable audit event
        try {
          await CampaignEventService.recordEvent(newCampaign.id, 'created', {
            name: newCampaign.name,
            objective: newCampaign.objective,
            budgetUSD,
          });
        } catch (eventErr) {
          console.warn('Campaign event record notice:', eventErr);
        }

        onCampaignCreated(newCampaign.id);
        onNavigate('campaigns');
      } else {
        setFormErrors(result.errors || ['Failed to save campaign to database.']);
      }
    } catch (saveErr) {
      setFormErrors([saveErr instanceof Error ? saveErr.message : 'Database error saving campaign.']);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="pb-4 border-b border-slate-800 flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white">{t.wizard.title}</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Compliant with TikTok Marketing API v1.3 In-Feed Video Ads Specifications
          </p>
        </div>
        <button
          onClick={() => onNavigate('campaigns')}
          className="text-xs text-slate-400 hover:text-white"
        >
          {t.common.cancel}
        </button>
      </div>

      {/* Stepper Progress */}
      <div className="grid grid-cols-5 gap-2 text-xs">
        {[
          { step: 1, label: t.wizard.steps.objective },
          { step: 2, label: t.wizard.steps.audience },
          { step: 3, label: t.wizard.steps.creative },
          { step: 4, label: t.wizard.steps.budget },
          { step: 5, label: t.wizard.steps.review },
        ].map((item) => (
          <div
            key={item.step}
            className={`p-2.5 rounded-lg border text-center transition-all ${
              currentStep === item.step
                ? 'bg-blue-600/20 border-cyan-500 text-cyan-300 font-semibold'
                : currentStep > item.step
                ? 'bg-slate-900 border-emerald-500/30 text-emerald-400 font-medium'
                : 'bg-slate-950 border-slate-800 text-slate-500'
            }`}
          >
            <div className="truncate">{item.label}</div>
          </div>
        ))}
      </div>

      {/* Error alert */}
      {formErrors.length > 0 && (
        <div className="p-4 bg-red-950/40 border border-red-500/40 rounded-xl text-xs text-red-300 space-y-1">
          <div className="font-semibold flex items-center gap-1.5 text-red-200">
            <AlertTriangle className="w-4 h-4 text-red-400" />
            <span>Please resolve the following requirements:</span>
          </div>
          <ul className="list-disc ps-5 space-y-0.5">
            {formErrors.map((err, idx) => (
              <li key={idx}>{err}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Wizard Step Content */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm space-y-6">
        {/* Step 1: Objective & Name */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-200">
                {t.wizard.campaignNameLabel}
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t.wizard.campaignNamePlaceholder}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-200">
                {t.wizard.advertiserTypeLabel}
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setAdvertiserType('individual')}
                  className={`p-3 rounded-xl border text-start transition-all ${
                    advertiserType === 'individual'
                      ? 'bg-blue-600/15 border-blue-500 text-white'
                      : 'bg-slate-950 border-slate-800 text-slate-400'
                  }`}
                >
                  <div className="font-semibold text-xs">{t.common.individual}</div>
                  <div className="text-[11px] text-slate-500 mt-1">
                    Solo creators, micro-brands, freelancers
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setAdvertiserType('business')}
                  className={`p-3 rounded-xl border text-start transition-all ${
                    advertiserType === 'business'
                      ? 'bg-blue-600/15 border-blue-500 text-white'
                      : 'bg-slate-950 border-slate-800 text-slate-400'
                  }`}
                >
                  <div className="font-semibold text-xs">{t.common.business}</div>
                  <div className="text-[11px] text-slate-500 mt-1">
                    Commercial registered companies, organizations
                  </div>
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <label className="block text-xs font-semibold text-slate-200">
                {t.wizard.selectObjective}
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  {
                    id: 'TRAFFIC' as CampaignObjective,
                    name: t.objectives.TRAFFIC,
                    desc: 'Direct prospective buyers from TikTok feed to your website or catalog.',
                  },
                  {
                    id: 'CONVERSIONS' as CampaignObjective,
                    name: t.objectives.CONVERSIONS,
                    desc: 'Drive measurable checkout and lead events via TikTok Pixel.',
                  },
                  {
                    id: 'VIDEO_VIEWS' as CampaignObjective,
                    name: t.objectives.VIDEO_VIEWS,
                    desc: 'Maximize completed 6-second and 15-second In-Feed video watches.',
                  },
                  {
                    id: 'REACH' as CampaignObjective,
                    name: t.objectives.REACH,
                    desc: 'Expose your ad to the widest possible audience at lowest CPM.',
                  },
                  {
                    id: 'LEAD_GENERATION' as CampaignObjective,
                    name: t.objectives.LEAD_GENERATION,
                    desc: 'Capture customer names and phone numbers via instant in-app forms.',
                  },
                ].map((obj) => (
                  <button
                    key={obj.id}
                    type="button"
                    onClick={() => setObjective(obj.id)}
                    className={`p-4 rounded-xl border text-start transition-all ${
                      objective === obj.id
                        ? 'bg-blue-600/15 border-cyan-500 text-white shadow-sm shadow-cyan-500/10'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="font-semibold text-xs text-white">{obj.name}</div>
                    <div className="text-[11px] text-slate-400 mt-1 leading-relaxed">{obj.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Audience & Location */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <label className="text-xs font-semibold text-slate-200">
                  {t.wizard.locationsLabel} ({selectedLocations.length} selected)
                </label>
                <div className="flex items-center gap-2 text-xs">
                  <button
                    type="button"
                    onClick={selectKurdistan}
                    className="text-cyan-400 hover:underline font-medium"
                  >
                    {t.wizard.allKurdistan}
                  </button>
                  <span>·</span>
                  <button
                    type="button"
                    onClick={selectAllIraq}
                    className="text-cyan-400 hover:underline font-medium"
                  >
                    {t.wizard.allIraq}
                  </button>
                  <span>·</span>
                  <button
                    type="button"
                    onClick={clearLocations}
                    className="text-slate-500 hover:text-slate-300"
                  >
                    {t.wizard.clearLocations}
                  </button>
                </div>
              </div>

              {/* Governorates Checkboxes */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-64 overflow-y-auto p-3 bg-slate-950 rounded-xl border border-slate-800">
                {IRAQI_GOVERNORATES.map((gov) => {
                  const isChecked = selectedLocations.includes(gov.code);
                  return (
                    <button
                      key={gov.code}
                      type="button"
                      onClick={() => toggleLocation(gov.code)}
                      className={`p-2.5 rounded-lg border text-start transition-all text-xs flex items-center justify-between ${
                        isChecked
                          ? 'bg-blue-600/20 border-cyan-500/60 text-white'
                          : 'bg-slate-900/60 border-slate-800/80 text-slate-400 hover:bg-slate-900'
                      }`}
                    >
                      <div className="truncate">
                        <div className="font-semibold">{gov.nameCkb} / {gov.nameAr}</div>
                        <div className="text-[10px] text-slate-500">{gov.nameEn}</div>
                      </div>
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {}}
                        className="ms-2 accent-cyan-500"
                      />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Languages */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-200">
                {t.wizard.languagesLabel}
              </label>
              <div className="flex flex-wrap gap-2">
                {[
                  { code: 'ckb' as const, label: 'Kurdish (Sorani)' },
                  { code: 'ar' as const, label: 'Arabic' },
                  { code: 'en' as const, label: 'English' },
                ].map((lang) => {
                  const isSel = selectedLanguages.includes(lang.code);
                  return (
                    <button
                      key={lang.code}
                      type="button"
                      onClick={() => {
                        if (isSel) {
                          if (selectedLanguages.length > 1) {
                            setSelectedLanguages(selectedLanguages.filter((l) => l !== lang.code));
                          }
                        } else {
                          setSelectedLanguages([...selectedLanguages, lang.code]);
                        }
                      }}
                      className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                        isSel
                          ? 'bg-blue-600/20 border-cyan-500 text-cyan-300'
                          : 'bg-slate-950 border-slate-800 text-slate-400'
                      }`}
                    >
                      {lang.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Demographics: Gender & Age */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-200">
                  {t.wizard.genderLabel}
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'ALL' as const, label: t.wizard.genderAll },
                    { id: 'MALE' as const, label: t.wizard.genderMale },
                    { id: 'FEMALE' as const, label: t.wizard.genderFemale },
                  ].map((g) => (
                    <button
                      key={g.id}
                      type="button"
                      onClick={() => setGender(g.id)}
                      className={`py-2 px-2 rounded-lg border text-xs text-center font-medium ${
                        gender === g.id
                          ? 'bg-blue-600/20 border-cyan-500 text-white'
                          : 'bg-slate-950 border-slate-800 text-slate-400'
                      }`}
                    >
                      {g.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-200">
                  {t.wizard.ageLabel}
                </label>
                <div className="flex flex-wrap gap-2">
                  {['18-24', '25-34', '35-44', '45-54', '55+'].map((age) => {
                    const isSel = selectedAges.includes(age);
                    return (
                      <button
                        key={age}
                        type="button"
                        onClick={() => {
                          if (isSel) {
                            if (selectedAges.length > 1) {
                              setSelectedAges(selectedAges.filter((a) => a !== age));
                            }
                          } else {
                            setSelectedAges([...selectedAges, age]);
                          }
                        }}
                        className={`px-2.5 py-1.5 rounded-lg border text-xs font-mono tabular-nums ${
                          isSel
                            ? 'bg-blue-600/20 border-cyan-500 text-cyan-300'
                            : 'bg-slate-950 border-slate-800 text-slate-400'
                        }`}
                      >
                        {age}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Creative & Text + Live TikTok Phone Mockup Preview */}
        {currentStep === 3 && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <div className="lg:col-span-7 space-y-4">
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                <div className="text-xs font-semibold text-white flex items-center gap-1.5">
                  <Tv className="w-4 h-4 text-cyan-400" />
                  <span>{t.creatives.specsNotice}</span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-[11px] text-slate-400">
                  <div>Ratio: 9:16 Vertical</div>
                  <div>Length: 5s - 60s</div>
                  <div>Max size: 500 MB</div>
                </div>
              </div>

              {/* Ad Caption Text */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <label className="font-semibold text-slate-200">
                    {t.wizard.adTextLabel}
                  </label>
                  <span
                    className={`font-mono text-[11px] tabular-nums ${
                      adText.length > 100 ? 'text-red-400 font-bold' : 'text-slate-400'
                    }`}
                  >
                    {adText.length}/100
                  </span>
                </div>
                <textarea
                  rows={2}
                  value={adText}
                  onChange={(e) => setAdText(e.target.value)}
                  placeholder={t.wizard.adTextPlaceholder}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              {/* Call to Action Button Choice */}
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-200">
                  {t.wizard.ctaLabel}
                </label>
                <select
                  value={callToAction}
                  onChange={(e: any) => setCallToAction(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-cyan-500"
                >
                  <option value="LEARN_MORE">Learn More (زیاتر بزانە / اعرف المزيد)</option>
                  <option value="SHOP_NOW">Shop Now (ئێستا بکڕە / تسوق الآن)</option>
                  <option value="SIGN_UP">Sign Up (تۆمارکردن / سجّل الآن)</option>
                  <option value="CONTACT_US">Contact Us (پەیوەندیمان پێوەبکە / تواصل معنا)</option>
                  <option value="DOWNLOAD">Download (داگرتن / تنزيل)</option>
                  <option value="ORDER_NOW">Order Now (ئێستا داوا بکە / اطلب الآن)</option>
                </select>
              </div>

              {/* Destination URL */}
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-200">
                  {t.wizard.destinationUrlLabel}
                </label>
                <input
                  type="url"
                  value={destinationUrl}
                  onChange={(e) => setDestinationUrl(e.target.value)}
                  placeholder={t.wizard.destinationUrlPlaceholder}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              {/* Display Account Brand */}
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-200">
                  {t.wizard.displayAccountLabel}
                </label>
                <input
                  type="text"
                  value={displayAccountName}
                  onChange={(e) => setDisplayAccountName(e.target.value)}
                  placeholder={t.wizard.displayAccountPlaceholder}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              {/* Video Spec Settings */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">
                    Duration: <span className="font-mono text-cyan-400">{videoDuration}s</span>
                  </label>
                  <input
                    type="range"
                    min="5"
                    max="60"
                    value={videoDuration}
                    onChange={(e) => setVideoDuration(Number(e.target.value))}
                    className="w-full accent-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Aspect Ratio</label>
                  <select
                    value={videoAspectRatio}
                    onChange={(e: any) => setVideoAspectRatio(e.target.value)}
                    className="w-full px-2 py-1 bg-slate-950 border border-slate-800 rounded text-xs text-white"
                  >
                    <option value="9:16">9:16 Vertical (Recommended)</option>
                    <option value="1:1">1:1 Square</option>
                    <option value="16:9">16:9 Horizontal</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Live Interactive TikTok Mobile Ad Preview Mockup */}
            <div className="lg:col-span-5 flex flex-col items-center">
              <div className="text-xs font-semibold text-slate-400 mb-2 flex items-center gap-1.5">
                <Smartphone className="w-3.5 h-3.5 text-cyan-400" />
                <span>Live TikTok In-Feed Ad Mockup</span>
              </div>

              {/* Simulated 9:16 Phone Frame */}
              <div className="w-[240px] h-[440px] bg-black rounded-[32px] border-4 border-slate-800 p-2 shadow-2xl relative overflow-hidden flex flex-col justify-between text-white select-none">
                {/* Screen top info */}
                <div className="flex items-center justify-between text-[10px] text-slate-300 pt-1 px-2 z-10">
                  <span className="font-semibold">Following</span>
                  <span className="font-bold border-b-2 border-white pb-0.5">For You</span>
                  <span className="text-slate-400 font-mono">🔍</span>
                </div>

                {/* Vertical video backdrop simulation */}
                <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-blue-950/70 to-black flex items-center justify-center">
                  <div className="text-center p-4">
                    <div className="w-12 h-12 mx-auto rounded-full bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-300 mb-2">
                      ▶
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono">
                      {videoFileName}
                    </div>
                    <div className="text-[9px] text-slate-500 mt-1">
                      {videoDuration}s · {videoAspectRatio}
                    </div>
                  </div>
                </div>

                {/* Right-side social interaction buttons */}
                <div className="absolute end-2 bottom-20 flex flex-col items-center gap-3 z-10 text-[10px]">
                  <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs">
                    👤
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="text-sm">❤️</span>
                    <span className="text-[9px] font-mono">24.5K</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="text-sm">💬</span>
                    <span className="text-[9px] font-mono">1.2K</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="text-sm">↗️</span>
                    <span className="text-[9px] font-mono">Share</span>
                  </div>
                </div>

                {/* Bottom Ad Overlay info */}
                <div className="z-10 p-2 space-y-1.5 bg-gradient-to-t from-black via-black/80 to-transparent">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-[11px]">@{displayAccountName}</span>
                    <span className="text-[9px] px-1 py-0.2 bg-white/20 rounded font-semibold text-slate-200">
                      Sponsored
                    </span>
                  </div>
                  <p className="text-[10px] leading-tight text-slate-200 line-clamp-2">
                    {adText}
                  </p>
                  <div className="text-[9px] text-slate-300 flex items-center gap-1">
                    <span>🎵 Original Sound - {displayAccountName}</span>
                  </div>

                  {/* CTA Button */}
                  <div className="w-full py-1.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-[10px] rounded text-center shadow-lg transition-colors cursor-default">
                    {callToAction.replace('_', ' ')}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Budget & Schedule */}
        {currentStep === 4 && (
          <div className="space-y-6">
            <div className="space-y-3">
              <label className="block text-xs font-semibold text-slate-200">
                {t.wizard.budgetTypeLabel}
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setBudgetType('DAILY')}
                  className={`p-3 rounded-xl border text-start transition-all ${
                    budgetType === 'DAILY'
                      ? 'bg-blue-600/15 border-blue-500 text-white'
                      : 'bg-slate-950 border-slate-800 text-slate-400'
                  }`}
                >
                  <div className="font-semibold text-xs">{t.wizard.dailyBudget}</div>
                  <div className="text-[11px] text-slate-500 mt-1">
                    Spends allocated amount per calendar day (Min: $50 USD)
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setBudgetType('LIFETIME')}
                  className={`p-3 rounded-xl border text-start transition-all ${
                    budgetType === 'LIFETIME'
                      ? 'bg-blue-600/15 border-blue-500 text-white'
                      : 'bg-slate-950 border-slate-800 text-slate-400'
                  }`}
                >
                  <div className="font-semibold text-xs">{t.wizard.lifetimeBudget}</div>
                  <div className="text-[11px] text-slate-500 mt-1">
                    Paced continuously throughout the entire scheduled campaign period
                  </div>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-200">
                  {t.wizard.budgetAmountLabel}
                </label>
                <div className="relative">
                  <DollarSign className="w-4 h-4 absolute start-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="number"
                    min="50"
                    step="5"
                    value={budgetUSD}
                    onChange={(e) => setBudgetUSD(Number(e.target.value))}
                    className="w-full ps-9 pe-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white font-mono tabular-nums focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div className="text-[11px] text-slate-500">
                  TikTok Marketing API minimum daily budget is $50.00 USD.
                </div>
              </div>

              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                <div className="text-xs text-slate-400">{t.wizard.budgetIqdEquivalent}</div>
                <div className="text-xl font-bold text-cyan-400 font-mono tabular-nums">
                  {convertedIQD.toLocaleString()} IQD
                </div>
                <div className="text-[10px] text-slate-500">
                  Central Bank of Iraq (CBI) reference rate: 1,310 IQD per USD
                </div>
              </div>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-200">
                  {t.wizard.startDateLabel}
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-200">
                  {t.wizard.endDateLabel}
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 5: Review & Submission */}
        {currentStep === 5 && (
          <div className="space-y-6">
            <div className="p-4 bg-blue-950/30 border border-blue-500/30 rounded-xl space-y-2">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-cyan-400" />
                <span>Phase 1 Architecture Gate</span>
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                {t.wizard.submitDisabledNotice}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                <div className="text-slate-500">Campaign Name & Type</div>
                <div className="font-semibold text-white">{name}</div>
                <div className="text-slate-400">{advertiserType.toUpperCase()} Account</div>
              </div>

              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                <div className="text-slate-500">Objective</div>
                <div className="font-semibold text-white">{objective}</div>
              </div>

              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                <div className="text-slate-500">Budget</div>
                <div className="font-semibold text-white font-mono tabular-nums">
                  ${budgetUSD} USD ({budgetType}) · {convertedIQD.toLocaleString()} IQD
                </div>
              </div>

              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                <div className="text-slate-500">Audience Coverage</div>
                <div className="font-semibold text-white">
                  {selectedLocations.length} Governorates in Iraq & Kurdistan
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2 text-xs">
              <div className="font-semibold text-white">TikTok In-Feed Ad Creative</div>
              <div className="text-slate-300">
                Brand: <span className="font-semibold text-white">@{displayAccountName}</span>
              </div>
              <div className="text-slate-300">
                Caption: &quot;{adText}&quot;
              </div>
              <div className="text-slate-300">
                Action: <span className="font-semibold text-cyan-400">{callToAction}</span> → {destinationUrl}
              </div>
            </div>

            {/* Actions for saving */}
            <div className="pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => handleSaveCampaign('draft')}
                className="px-4 py-2.5 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
              >
                {t.wizard.saveDraft}
              </button>

              <button
                type="button"
                onClick={() => handleSaveCampaign('ready_to_submit')}
                className="px-6 py-2.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors shadow-md shadow-blue-500/20"
              >
                {t.wizard.saveAndReview}
              </button>
            </div>
          </div>
        )}

        {/* Wizard Navigation Footer */}
        {currentStep < 5 && (
          <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
            <button
              type="button"
              disabled={currentStep === 1}
              onClick={handleBack}
              className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white disabled:opacity-40 transition-colors flex items-center gap-1.5"
            >
              <ArrowLeft className={`w-3.5 h-3.5 ${direction === 'rtl' ? 'rotate-180' : ''}`} />
              <span>{t.common.back}</span>
            </button>

            <button
              type="button"
              onClick={handleNext}
              className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors flex items-center gap-1.5"
            >
              <span>{t.common.next}</span>
              <ArrowRight className={`w-3.5 h-3.5 ${direction === 'rtl' ? 'rotate-180' : ''}`} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
