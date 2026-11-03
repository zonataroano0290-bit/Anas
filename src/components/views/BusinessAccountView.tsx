import React, { useState, useEffect } from 'react';
import { useLocalization } from '../../locales/index.tsx';
import { useAuth } from '../../context/AuthContext.tsx';
import {
  Building2,
  ShieldAlert,
  CheckCircle2,
  FileText,
  Users,
  Upload,
  AlertCircle,
  Briefcase,
} from 'lucide-react';
import type { BusinessProfile } from '../../types/index.ts';

export const BusinessAccountView: React.FC = () => {
  const { t } = useLocalization();
  const { currentUser, updateProfile } = useAuth();

  const bp = currentUser?.businessProfile;

  const [companyName, setCompanyName] = useState(bp?.companyName || '');
  const [crNumber, setCrNumber] = useState(bp?.commercialRegistrationNumber || '');
  const [taxNumber, setTaxNumber] = useState(bp?.taxIdentificationNumber || '');
  const [address, setAddress] = useState(bp?.businessAddress || '');
  const [city, setCity] = useState(bp?.city || 'Erbil');
  const [industry, setIndustry] = useState(bp?.industry || 'Commercial / E-Commerce');
  const [contactEmail, setContactEmail] = useState(bp?.contactEmail || currentUser?.email || '');
  const [contactPhone, setContactPhone] = useState(bp?.contactPhone || currentUser?.phone || '');

  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (currentUser?.businessProfile) {
      const b = currentUser.businessProfile;
      setCompanyName(b.companyName || '');
      setCrNumber(b.commercialRegistrationNumber || '');
      setTaxNumber(b.taxIdentificationNumber || '');
      setAddress(b.businessAddress || '');
      setCity(b.city || 'Erbil');
      setIndustry(b.industry || 'Commercial / E-Commerce');
      setContactEmail(b.contactEmail || currentUser.email);
      setContactPhone(b.contactPhone || currentUser.phone || '');
    }
  }, [currentUser]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    setSaving(true);
    setErrorMsg(null);

    const updatedBp: BusinessProfile = {
      companyName: companyName.trim() || currentUser.name,
      commercialRegistrationNumber: crNumber.trim(),
      taxIdentificationNumber: taxNumber.trim(),
      businessAddress: address.trim(),
      city: city.trim(),
      governorate: 'IQ-ER',
      contactEmail: contactEmail.trim(),
      contactPhone: contactPhone.trim(),
      industry: industry.trim(),
      verificationStatus: bp?.verificationStatus || 'unverified',
      teamMembers: bp?.teamMembers || [
        {
          id: 'tm_owner',
          name: currentUser.name,
          email: currentUser.email,
          role: 'owner',
          addedAt: new Date().toISOString(),
        },
      ],
    };

    try {
      await updateProfile({
        businessProfile: updatedBp,
      });
      setSuccessMsg(true);
      setTimeout(() => setSuccessMsg(false), 3000);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to update business profile in Firestore.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="pb-4 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white">{t.businessAccount.title}</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">{t.businessAccount.subtitle}</p>
        </div>

        <span className="px-3 py-1 rounded-lg text-xs font-semibold bg-blue-950 text-cyan-300 border border-blue-500/30 self-start sm:self-auto flex items-center gap-1.5">
          <Briefcase className="w-3.5 h-3.5" />
          <span>
            {currentUser?.role === 'business'
              ? 'Business Advertiser Account'
              : `${currentUser?.role || 'Guest'} Account`}
          </span>
        </span>
      </div>

      {successMsg && (
        <div className="p-3 bg-emerald-950/40 border border-emerald-500/40 rounded-xl text-xs text-emerald-300 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>Business profile details updated in Firestore.</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-3 bg-red-950/40 border border-red-500/40 rounded-xl text-xs text-red-300 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-400" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Security & Admin Privilege Notice Banner */}
      <div className="p-4 bg-slate-900 border border-amber-500/30 rounded-2xl flex items-start gap-3">
        <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div className="space-y-1 text-xs">
          <div className="font-bold text-white">Role Security & Zero-Trust Authorization</div>
          <p className="text-slate-300 leading-relaxed">
            {t.businessAccount.adminNotice}
          </p>
        </div>
      </div>

      {/* Business Details Form */}
      <form onSubmit={handleSave} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <Building2 className="w-4 h-4 text-cyan-400" />
          <span>{t.businessAccount.companyDetails}</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="space-y-1">
            <label className="text-slate-400">{t.businessAccount.companyName}</label>
            <input
              type="text"
              required
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="e.g. Al-Mashriq Commercial Co."
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="space-y-1">
            <label className="text-slate-400">{t.businessAccount.crNumber}</label>
            <input
              type="text"
              value={crNumber}
              onChange={(e) => setCrNumber(e.target.value)}
              placeholder="e.g. IQ-KR-2026-98124"
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white font-mono focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="space-y-1">
            <label className="text-slate-400">{t.businessAccount.taxNumber}</label>
            <input
              type="text"
              value={taxNumber}
              onChange={(e) => setTaxNumber(e.target.value)}
              placeholder="e.g. TIN-9921448"
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white font-mono focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="space-y-1">
            <label className="text-slate-400">{t.businessAccount.city}</label>
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="Erbil, Sulaymaniyah, Baghdad..."
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="sm:col-span-2 space-y-1">
            <label className="text-slate-400">{t.businessAccount.address}</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="e.g. Gulan Street, opposite World Trade Center"
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="space-y-1">
            <label className="text-slate-400">Business Sector / Industry</label>
            <input
              type="text"
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="space-y-1">
            <label className="text-slate-400">Contact Phone</label>
            <input
              type="text"
              value={contactPhone}
              onChange={(e) => setContactPhone(e.target.value)}
              placeholder="+964 750 123 4567"
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white font-mono focus:outline-none focus:border-cyan-500"
            />
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-5 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold text-xs rounded-lg transition-colors shadow-sm shadow-blue-500/20"
          >
            {saving ? 'Saving...' : 'Save Business Profile'}
          </button>
        </div>
      </form>

      {/* Verification Documents Upload Area */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-3">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <FileText className="w-4 h-4 text-cyan-400" />
          <span>{t.businessAccount.documentsTitle}</span>
        </h2>
        <p className="text-xs text-slate-400">{t.businessAccount.documentsDesc}</p>

        <div className="p-6 border-2 border-dashed border-slate-800 hover:border-slate-700 rounded-xl text-center space-y-2">
          <Upload className="w-6 h-6 text-slate-500 mx-auto" />
          <div className="text-xs text-slate-300 font-medium">
            Upload Commercial Registration or Chamber of Commerce Certificate (PDF/JPG)
          </div>
          <div className="text-[10px] text-slate-500">Max file size: 15MB</div>
        </div>
      </div>

      {/* Team Members & Organization Roles */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Users className="w-4 h-4 text-cyan-400" />
            <span>{t.businessAccount.teamTitle}</span>
          </h2>
          <span className="text-xs text-slate-400">Team permissions hierarchy</span>
        </div>

        <div className="divide-y divide-slate-800 bg-slate-950 rounded-xl border border-slate-800">
          {(bp?.teamMembers || [
            {
              id: 'tm_owner',
              name: currentUser?.name || 'Account Owner',
              email: currentUser?.email || 'owner@domain.iq',
              role: 'owner',
              addedAt: new Date().toISOString(),
            },
          ]).map((member) => (
            <div key={member.id} className="p-3.5 flex items-center justify-between text-xs">
              <div>
                <div className="font-semibold text-white">{member.name}</div>
                <div className="text-slate-500 text-[11px] font-mono">{member.email}</div>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-900 border border-slate-700 text-cyan-300 uppercase">
                {member.role}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
