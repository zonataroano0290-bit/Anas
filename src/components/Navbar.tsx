import React, { useState } from 'react';
import { useLocalization } from '../locales/index.tsx';
import { useAuth } from '../context/AuthContext.tsx';
import {
  Globe,
  Shield,
  Sparkles,
  ChevronDown,
  User,
  LogOut,
  LogIn,
  CheckCircle2,
  AlertCircle,
  Building2,
} from 'lucide-react';
import type { Language } from '../types/index.ts';
import { AuthModal } from './auth/AuthModal.tsx';

interface NavbarProps {
  currentView: string;
  onNavigate: (view: string) => void;
  onOpenReport: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentView, onNavigate, onOpenReport }) => {
  const { language, setLanguage, t } = useLocalization();
  const { currentUser, logout, isDbConnected } = useAuth();

  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');

  const navLinks = [
    { id: 'landing', label: t.nav.home },
    { id: 'dashboard', label: t.nav.dashboard },
    { id: 'campaigns', label: t.nav.campaigns },
    { id: 'audience', label: t.nav.audience },
    { id: 'help', label: t.nav.help },
  ];

  const handleOpenAuth = (mode: 'login' | 'register') => {
    setAuthModalMode(mode);
    setAuthModalOpen(true);
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-950/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-6">
          {/* Zone 1: Single text wordmark */}
          <button
            onClick={() => onNavigate('landing')}
            className="flex items-center gap-2.5 text-lg font-bold tracking-tight text-white hover:text-cyan-400 transition-colors whitespace-nowrap shrink-0 text-start"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center text-white shadow-md shadow-cyan-500/20">
              <span className="font-extrabold text-sm tracking-tighter">MM</span>
            </div>
            <span>{t.common.appName}</span>
          </button>

          {/* Zone 2: Concise single-line nav links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-300">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => onNavigate(link.id)}
                className={`whitespace-nowrap shrink-0 py-1 transition-colors hover:text-white ${
                  currentView === link.id
                    ? 'text-cyan-400 font-semibold border-b-2 border-cyan-400'
                    : 'text-slate-400'
                }`}
              >
                {link.label}
              </button>
            ))}
          </nav>

          {/* Zone 3: Controls & Auth State */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Language Selector */}
            <div className="relative">
              <button
                onClick={() => setLangMenuOpen(!langMenuOpen)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-900 border border-slate-800 rounded-lg hover:border-slate-700 transition-colors whitespace-nowrap"
                aria-label="Select Language"
              >
                <Globe className="w-3.5 h-3.5 text-cyan-400" />
                <span>
                  {language === 'ckb' ? 'کوردی' : language === 'ar' ? 'العربية' : 'English'}
                </span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {langMenuOpen && (
                <div className="absolute end-0 mt-2 w-36 bg-slate-900 border border-slate-800 rounded-lg shadow-xl py-1 z-50">
                  <button
                    onClick={() => {
                      setLanguage('ckb');
                      setLangMenuOpen(false);
                    }}
                    className={`w-full text-start px-3 py-1.5 text-xs hover:bg-slate-800 transition-colors ${
                      language === 'ckb' ? 'text-cyan-400 font-semibold' : 'text-slate-300'
                    }`}
                  >
                    کوردی (سۆرانی)
                  </button>
                  <button
                    onClick={() => {
                      setLanguage('ar');
                      setLangMenuOpen(false);
                    }}
                    className={`w-full text-start px-3 py-1.5 text-xs hover:bg-slate-800 transition-colors ${
                      language === 'ar' ? 'text-cyan-400 font-semibold' : 'text-slate-300'
                    }`}
                  >
                    العربية
                  </button>
                  <button
                    onClick={() => {
                      setLanguage('en');
                      setLangMenuOpen(false);
                    }}
                    className={`w-full text-start px-3 py-1.5 text-xs hover:bg-slate-800 transition-colors ${
                      language === 'en' ? 'text-cyan-400 font-semibold' : 'text-slate-300'
                    }`}
                  >
                    English
                  </button>
                </div>
              )}
            </div>

            {/* Authentication State: Signed In vs Signed Out */}
            {currentUser ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-lg text-xs transition-colors"
                >
                  <div className="w-5 h-5 rounded-full bg-blue-600/30 border border-blue-500/40 flex items-center justify-center text-cyan-300 text-[10px] font-bold">
                    {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <span className="font-semibold text-white max-w-[100px] sm:max-w-[140px] truncate">
                    {currentUser.name}
                  </span>
                  <span
                    className={`text-[9px] px-1.5 py-0.2 rounded font-mono font-semibold uppercase ${
                      currentUser.role === 'admin'
                        ? 'bg-amber-950 text-amber-400 border border-amber-500/40'
                        : currentUser.role === 'business'
                        ? 'bg-blue-950 text-cyan-300 border border-blue-500/30'
                        : 'bg-slate-800 text-slate-300'
                    }`}
                  >
                    {currentUser.role}
                  </span>
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </button>

                {userMenuOpen && (
                  <div className="absolute end-0 mt-2 w-56 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl py-2 z-50 text-xs text-slate-300">
                    <div className="px-3.5 py-2 border-b border-slate-800 space-y-0.5">
                      <div className="font-semibold text-white truncate">{currentUser.name}</div>
                      <div className="text-[11px] text-slate-400 font-mono truncate">
                        {currentUser.email}
                      </div>
                      <div className="pt-1 flex items-center gap-1.5 text-[10px]">
                        {currentUser.isEmailVerified ? (
                          <span className="text-emerald-400 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Email Verified</span>
                          </span>
                        ) : (
                          <span className="text-amber-400 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            <span>Verification Pending</span>
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="py-1">
                      <button
                        onClick={() => {
                          onNavigate('profile');
                          setUserMenuOpen(false);
                        }}
                        className="w-full text-start px-3.5 py-2 hover:bg-slate-800 text-slate-300 hover:text-white flex items-center gap-2"
                      >
                        <User className="w-3.5 h-3.5 text-cyan-400" />
                        <span>{t.nav.profile}</span>
                      </button>

                      {currentUser.role === 'business' && (
                        <button
                          onClick={() => {
                            onNavigate('businessAccount');
                            setUserMenuOpen(false);
                          }}
                          className="w-full text-start px-3.5 py-2 hover:bg-slate-800 text-slate-300 hover:text-white flex items-center gap-2"
                        >
                          <Building2 className="w-3.5 h-3.5 text-blue-400" />
                          <span>{t.nav.businessAccount}</span>
                        </button>
                      )}
                    </div>

                    <div className="border-t border-slate-800 pt-1">
                      <button
                        onClick={async () => {
                          setUserMenuOpen(false);
                          await logout();
                          onNavigate('landing');
                        }}
                        className="w-full text-start px-3.5 py-2 hover:bg-red-950/40 text-red-400 hover:text-red-300 flex items-center gap-2"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Sign Out (چوونەدەرەوە)</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleOpenAuth('login')}
                  className="px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5"
                >
                  <LogIn className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Sign In</span>
                </button>
                <button
                  onClick={() => handleOpenAuth('register')}
                  className="hidden sm:inline-flex px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors whitespace-nowrap shadow-sm shadow-blue-500/20"
                >
                  Register
                </button>
              </div>
            )}

            {/* Phase 1 & 2 Acceptance Report Link */}
            <button
              onClick={onOpenReport}
              className="px-2.5 py-1.5 text-xs font-medium text-cyan-400 border border-cyan-500/30 bg-cyan-950/30 hover:bg-cyan-900/40 rounded-lg transition-colors whitespace-nowrap hidden lg:flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Report</span>
            </button>
          </div>
        </div>
      </header>

      {/* Authentication Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialMode={authModalMode}
        onSuccess={() => {
          onNavigate('dashboard');
        }}
      />
    </>
  );
};
