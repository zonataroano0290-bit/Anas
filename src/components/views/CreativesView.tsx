import React, { useState, useEffect } from 'react';
import { useLocalization } from '../../locales/index.tsx';
import {
  Film,
  Upload,
  CheckCircle2,
  AlertTriangle,
  Play,
  Trash2,
  Tv,
  FileVideo,
  X,
} from 'lucide-react';
import type { AdCreative } from '../../types/index.ts';
import { CreativeService } from '../../services/creativeService.ts';
import { validateCreativeSpecs } from '../../utils/rules.ts';

import { useAuth } from '../../context/AuthContext.tsx';
import { Database } from 'lucide-react';

export const CreativesView: React.FC = () => {
  const { t } = useLocalization();
  const { user } = useAuth();
  const [creatives, setCreatives] = useState<AdCreative[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // New creative form state
  const [name, setName] = useState('Spring Brand Spotlight');
  const [duration, setDuration] = useState<number>(12);
  const [aspectRatio, setAspectRatio] = useState<'9:16' | '1:1' | '16:9'>('9:16');
  const [adText, setAdText] = useState('ناوازەترین ئۆفەری بەهارە لەگەڵ گەیاندنی بەلاش!');
  const [callToAction, setCallToAction] = useState<
    'LEARN_MORE' | 'SHOP_NOW' | 'SIGN_UP' | 'CONTACT_US' | 'DOWNLOAD' | 'ORDER_NOW'
  >('SHOP_NOW');
  const [destinationUrl, setDestinationUrl] = useState('https://mikmik.iq');
  const [displayAccountName, setDisplayAccountName] = useState('MikMik Kurd');

  const reloadCreatives = async () => {
    setLoading(true);
    try {
      const list = await CreativeService.getCreatives(user?.id);
      setCreatives(list);
    } catch (err) {
      console.error('Failed to load creatives from Firestore:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    reloadCreatives();
  }, [user?.id]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const effectiveOwnerId = user?.id || 'anonymous_user';

    const newCr: AdCreative = {
      id: `cr_${Date.now()}`,
      ownerId: effectiveOwnerId,
      name,
      videoFileName: `video_${Date.now()}_9x16.mp4`,
      fileSizeBytes: 18 * 1024 * 1024,
      durationSeconds: duration,
      aspectRatio,
      resolution: aspectRatio === '9:16' ? '1080x1920' : aspectRatio === '1:1' ? '1080x1080' : '1920x1080',
      adText,
      callToAction,
      destinationUrl,
      displayAccountName,
      fileType: 'video/mp4',
      uploadStatus: 'uploaded',
      reviewStatus: 'draft',
      createdAt: new Date().toISOString(),
    };

    const res = await CreativeService.saveCreative(newCr);
    if (res.success) {
      setIsUploadOpen(false);
      await reloadCreatives();
    } else {
      setErrorMsg(res.errors?.join(' ') || 'Validation error');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Delete this creative?')) {
      await CreativeService.deleteCreative(id);
      await reloadCreatives();
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white">{t.creatives.title}</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">{t.creatives.subtitle}</p>
        </div>

        <button
          onClick={() => setIsUploadOpen(true)}
          className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors flex items-center gap-2 shadow-sm shadow-blue-500/20"
        >
          <Upload className="w-4 h-4" />
          <span>{t.creatives.uploadBtn}</span>
        </button>
      </div>

      {/* Specifications Notice Banner */}
      <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-2">
        <div className="text-xs font-semibold text-cyan-400 flex items-center gap-1.5">
          <Tv className="w-4 h-4" />
          <span>TikTok In-Feed Ads Official Creative Specifications</span>
        </div>
        <p className="text-xs text-slate-400 leading-relaxed">{t.creatives.specsNotice}</p>
      </div>

      {/* Creative Assets Grid */}
      {creatives.length === 0 ? (
        <div className="text-center py-16 px-4 bg-slate-900/40 rounded-2xl border border-slate-800 space-y-3">
          <Film className="w-8 h-8 text-slate-600 mx-auto" />
          <p className="text-sm text-slate-400">{t.creatives.noCreatives}</p>
          <button
            onClick={() => setIsUploadOpen(true)}
            className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors inline-block"
          >
            {t.creatives.uploadBtn}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {creatives.map((cr) => (
            <div
              key={cr.id}
              className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm flex flex-col justify-between"
            >
              {/* Top video thumbnail simulation */}
              <div className="relative h-44 bg-slate-950 flex items-center justify-center border-b border-slate-800">
                <div className="w-10 h-10 rounded-full bg-blue-600/30 border border-blue-500/40 flex items-center justify-center text-cyan-400">
                  <Play className="w-4 h-4 ms-0.5" />
                </div>
                <div className="absolute top-3 end-3 px-2 py-0.5 bg-black/60 backdrop-blur-md rounded text-[10px] font-mono tabular-nums text-slate-300">
                  {cr.durationSeconds}s
                </div>
                <div className="absolute bottom-3 start-3 px-2 py-0.5 bg-black/60 backdrop-blur-md rounded text-[10px] font-mono text-cyan-400">
                  {cr.aspectRatio} Vertical
                </div>
              </div>

              {/* Details */}
              <div className="p-4 space-y-3">
                <div>
                  <h3 className="font-semibold text-white text-sm truncate">{cr.name}</h3>
                  <div className="text-[11px] text-slate-400 truncate">@{cr.displayAccountName}</div>
                </div>

                <p className="text-xs text-slate-300 line-clamp-2 bg-slate-950 p-2 rounded-lg border border-slate-800/80">
                  &quot;{cr.adText}&quot;
                </p>

                <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-400 pt-1">
                  <div>Resolution: <span className="text-slate-200">{cr.resolution}</span></div>
                  <div>CTA: <span className="text-cyan-400 font-semibold">{cr.callToAction}</span></div>
                </div>

                <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-[10px] text-slate-500 font-mono">
                    {new Date(cr.createdAt).toLocaleDateString()}
                  </span>
                  <button
                    onClick={() => handleDelete(cr.id)}
                    className="text-slate-500 hover:text-red-400 p-1 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Modal */}
      {isUploadOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-white text-base">{t.creatives.uploadBtn}</h3>
              <button
                onClick={() => setIsUploadOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {errorMsg && (
              <div className="p-3 bg-red-950/40 border border-red-500/40 rounded-lg text-xs text-red-300">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-slate-300 font-medium">Creative Title</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-300 font-medium">
                    Duration: <span className="font-mono text-cyan-400">{duration}s</span>
                  </label>
                  <input
                    type="range"
                    min="5"
                    max="60"
                    value={duration}
                    onChange={(e) => setDuration(Number(e.target.value))}
                    className="w-full accent-cyan-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-medium">Aspect Ratio</label>
                  <select
                    value={aspectRatio}
                    onChange={(e: any) => setAspectRatio(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white"
                  >
                    <option value="9:16">9:16 Vertical (Native)</option>
                    <option value="1:1">1:1 Square</option>
                    <option value="16:9">16:9 Horizontal</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between">
                  <label className="text-slate-300 font-medium">Ad Caption</label>
                  <span className="text-[10px] text-slate-500">{adText.length}/100</span>
                </div>
                <textarea
                  rows={2}
                  value={adText}
                  onChange={(e) => setAdText(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-300 font-medium">CTA Button</label>
                  <select
                    value={callToAction}
                    onChange={(e: any) => setCallToAction(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white"
                  >
                    <option value="SHOP_NOW">Shop Now</option>
                    <option value="LEARN_MORE">Learn More</option>
                    <option value="SIGN_UP">Sign Up</option>
                    <option value="CONTACT_US">Contact Us</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-medium">Display Brand Name</label>
                  <input
                    type="text"
                    value={displayAccountName}
                    onChange={(e) => setDisplayAccountName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white"
                  >
                  </input>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsUploadOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors"
                >
                  {t.common.cancel}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg transition-colors"
                >
                  {t.common.save}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
