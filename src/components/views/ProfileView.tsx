import React, { useState, useEffect } from 'react';
import { useLocalization } from '../../locales/index.tsx';
import { useAuth } from '../../context/AuthContext.tsx';
import {
  User,
  Globe,
  Lock,
  Shield,
  Smartphone,
  CheckCircle2,
  AlertCircle,
  Mail,
  Send,
  Building2,
} from 'lucide-react';
import { sendEmailVerification } from 'firebase/auth';
import type { Language } from '../../types/index.ts';

export const ProfileView: React.FC = () => {
  const { t, language, setLanguage } = useLocalization();
  const { currentUser, firebaseUser, updateProfile, resetPassword } = useAuth();

  const [name, setName] = useState(currentUser?.name || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [verificationSent, setVerificationSent] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  useEffect(() => {
    if (currentUser) {
      setName(currentUser.name);
      setPhone(currentUser.phone || '');
    }
  }, [currentUser]);

  const handleLangChange = async (lang: Language) => {
    setLanguage(lang);
    if (currentUser) {
      try {
        await updateProfile({ language: lang });
      } catch (e) {
        console.warn('Language preference saved locally', e);
      }
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    setSaving(true);
    setErrorMsg(null);

    try {
      await updateProfile({
        name: name.trim(),
        phone: phone.trim(),
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  const handleSendVerification = async () => {
    if (!firebaseUser) return;
    try {
      await sendEmailVerification(firebaseUser);
      setVerificationSent(true);
      setTimeout(() => setVerificationSent(false), 5000);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Could not send verification email.');
    }
  };

  const handleSendPasswordReset = async () => {
    if (!currentUser?.email) return;
    try {
      await resetPassword(currentUser.email);
      setResetSent(true);
      setTimeout(() => setResetSent(false), 5000);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to send password reset email.');
    }
  };

  if (!currentUser) {
    return (
      <div className="p-8 text-center bg-slate-900 border border-slate-800 rounded-2xl space-y-3">
        <User className="w-10 h-10 text-slate-500 mx-auto" />
        <h3 className="text-base font-bold text-white">Sign In Required</h3>
        <p className="text-xs text-slate-400">
          Please sign in to view and manage your advertiser account profile.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="pb-4 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white">{t.profile.title}</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">{t.profile.subtitle}</p>
        </div>

        <span
          className={`px-3 py-1 rounded-lg text-xs font-mono font-semibold uppercase self-start sm:self-auto ${
            currentUser.role === 'admin'
              ? 'bg-amber-950 text-amber-300 border border-amber-500/40'
              : currentUser.role === 'business'
              ? 'bg-blue-950 text-cyan-300 border border-blue-500/30'
              : 'bg-slate-900 text-slate-300 border border-slate-800'
          }`}
        >
          {currentUser.role} Account
        </span>
      </div>

      {savedSuccess && (
        <div className="p-3 bg-emerald-950/40 border border-emerald-500/40 rounded-xl text-xs text-emerald-300 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>Profile changes saved to Firestore database.</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-3 bg-red-950/40 border border-red-500/40 rounded-xl text-xs text-red-300 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-400" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Account Verification Status Card */}
      <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              currentUser.isEmailVerified
                ? 'bg-emerald-950/80 border border-emerald-500/40 text-emerald-400'
                : 'bg-amber-950/80 border border-amber-500/40 text-amber-400'
            }`}
          >
            {currentUser.isEmailVerified ? (
              <CheckCircle2 className="w-5 h-5" />
            ) : (
              <Mail className="w-5 h-5" />
            )}
          </div>
          <div className="space-y-0.5 text-xs">
            <div className="font-semibold text-white">
              {currentUser.isEmailVerified
                ? 'Firebase Email Verified'
                : 'Email Verification Pending'}
            </div>
            <div className="text-slate-400 text-[11px] font-mono">{currentUser.email}</div>
          </div>
        </div>

        {!currentUser.isEmailVerified && (
          <button
            onClick={handleSendVerification}
            disabled={verificationSent}
            className="px-3 py-1.5 text-xs font-semibold text-cyan-400 hover:text-white bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-lg transition-colors flex items-center gap-1.5 self-start sm:self-auto"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{verificationSent ? 'Verification Link Sent!' : 'Send Verification Email'}</span>
          </button>
        )}
      </div>

      {/* Personal Info Form */}
      <form onSubmit={handleSaveProfile} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <User className="w-4 h-4 text-cyan-400" />
          <span>{t.profile.personalInfo}</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="space-y-1">
            <label className="text-slate-400">{t.profile.name}</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="space-y-1">
            <label className="text-slate-400">Authenticated Email (Immutable)</label>
            <input
              type="email"
              disabled
              value={currentUser.email}
              className="w-full px-3 py-2 bg-slate-950/60 border border-slate-800 rounded-lg text-slate-400 font-mono cursor-not-allowed"
            />
          </div>

          <div className="space-y-1">
            <label className="text-slate-400">{t.profile.phone}</label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+964 750 000 0000"
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white font-mono focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="space-y-1">
            <label className="text-slate-400">Account Authorization Role</label>
            <div className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-300 font-semibold capitalize flex items-center justify-between">
              <span>{currentUser.role} Advertiser</span>
              {currentUser.role === 'admin' && (
                <span className="text-[10px] text-amber-400 font-mono">Server Verified</span>
              )}
            </div>
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-5 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold text-xs rounded-lg transition-colors shadow-sm shadow-blue-500/20"
          >
            {saving ? 'Saving...' : t.common.save}
          </button>
        </div>
      </form>

      {/* Language Preferences */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <Globe className="w-4 h-4 text-cyan-400" />
          <span>{t.profile.languageSelection}</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <button
            type="button"
            onClick={() => handleLangChange('ckb')}
            className={`p-3 rounded-xl border text-start transition-all ${
              language === 'ckb'
                ? 'bg-blue-600/20 border-cyan-500 text-white font-semibold'
                : 'bg-slate-950 border-slate-800 text-slate-400'
            }`}
          >
            <div>کوردی (سۆرانی)</div>
            <div className="text-[10px] text-slate-500 mt-1">Kurdish Sorani (Default) · RTL</div>
          </button>

          <button
            type="button"
            onClick={() => handleLangChange('ar')}
            className={`p-3 rounded-xl border text-start transition-all ${
              language === 'ar'
                ? 'bg-blue-600/20 border-cyan-500 text-white font-semibold'
                : 'bg-slate-950 border-slate-800 text-slate-400'
            }`}
          >
            <div>العربية</div>
            <div className="text-[10px] text-slate-500 mt-1">Arabic · RTL</div>
          </button>

          <button
            type="button"
            onClick={() => handleLangChange('en')}
            className={`p-3 rounded-xl border text-start transition-all ${
              language === 'en'
                ? 'bg-blue-600/20 border-cyan-500 text-white font-semibold'
                : 'bg-slate-950 border-slate-800 text-slate-400'
            }`}
          >
            <div>English</div>
            <div className="text-[10px] text-slate-500 mt-1">English · LTR</div>
          </button>
        </div>
      </div>

      {/* Password Management */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <Lock className="w-4 h-4 text-cyan-400" />
          <span>Password & Security</span>
        </h2>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-slate-950 rounded-xl border border-slate-800 text-xs">
          <div className="space-y-0.5">
            <div className="font-semibold text-white">Reset Password</div>
            <div className="text-slate-400">
              Send a secure password reset link to your verified email address.
            </div>
          </div>

          <button
            onClick={handleSendPasswordReset}
            disabled={resetSent}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 rounded-lg font-medium transition-colors whitespace-nowrap self-start sm:self-auto"
          >
            {resetSent ? 'Reset Email Sent!' : 'Send Password Reset'}
          </button>
        </div>
      </div>
    </div>
  );
};
