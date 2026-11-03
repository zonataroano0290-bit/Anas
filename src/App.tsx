import React, { useState } from 'react';
import { LocalizationProvider, useLocalization } from './locales/index.tsx';
import { AuthProvider, useAuth } from './context/AuthContext.tsx';
import { Navbar } from './components/Navbar.tsx';
import { Sidebar } from './components/Sidebar.tsx';
import { LandingView } from './components/views/LandingView.tsx';
import { DashboardView } from './components/views/DashboardView.tsx';
import { CampaignsView } from './components/views/CampaignsView.tsx';
import { CreateCampaignView } from './components/views/CreateCampaignView.tsx';
import { CreativesView } from './components/views/CreativesView.tsx';
import { AudienceView } from './components/views/AudienceView.tsx';
import { AnalyticsView } from './components/views/AnalyticsView.tsx';
import { BillingView } from './components/views/BillingView.tsx';
import { NotificationsView } from './components/views/NotificationsView.tsx';
import { ProfileView } from './components/views/ProfileView.tsx';
import { BusinessAccountView } from './components/views/BusinessAccountView.tsx';
import { HelpSupportView } from './components/views/HelpSupportView.tsx';
import { Phase1ReportModal } from './components/Phase1ReportModal.tsx';
import { AuthModal } from './components/auth/AuthModal.tsx';
import { Menu, X, Lock, LogIn, Sparkles, UserPlus } from 'lucide-react';

function ProtectedRouteGuard({
  children,
  onOpenAuth,
}: {
  children: React.ReactNode;
  onOpenAuth: (mode: 'login' | 'register') => void;
}) {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center space-y-3">
        <div className="w-8 h-8 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin" />
        <span className="text-xs text-slate-400">Verifying authenticated session...</span>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="max-w-md mx-auto my-12 p-8 bg-slate-900 border border-slate-800 rounded-2xl text-center space-y-4 shadow-xl">
        <div className="w-12 h-12 mx-auto rounded-xl bg-blue-950/80 border border-blue-500/30 flex items-center justify-center text-cyan-400">
          <Lock className="w-6 h-6" />
        </div>
        <div className="space-y-1">
          <h2 className="text-base font-bold text-white">Protected Advertiser Workspace</h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            Campaign management, creative assets, and billing are protected. Sign in or register an
            account to access your secure advertiser console.
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => onOpenAuth('login')}
            className="w-full sm:w-auto px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <LogIn className="w-4 h-4" />
            <span>Sign In</span>
          </button>
          <button
            onClick={() => onOpenAuth('register')}
            className="w-full sm:w-auto px-5 py-2.5 bg-slate-950 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 rounded-lg font-medium text-xs transition-colors flex items-center justify-center gap-2"
          >
            <UserPlus className="w-4 h-4" />
            <span>Create Account</span>
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

function MainApp() {
  const { t } = useLocalization();
  const { currentUser } = useAuth();
  const [currentView, setCurrentView] = useState<string>('landing');
  const [selectedCampaignId, setSelectedCampaignId] = useState<string | null>(null);
  const [reportOpen, setReportOpen] = useState<boolean>(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [authModalOpen, setAuthModalOpen] = useState<boolean>(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');

  const handleNavigate = (view: string) => {
    setCurrentView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectCampaign = (id: string) => {
    setSelectedCampaignId(id);
    setCurrentView('campaigns');
  };

  const handleOpenAuth = (mode: 'login' | 'register') => {
    setAuthModalMode(mode);
    setAuthModalOpen(true);
  };

  const isLanding = currentView === 'landing';
  const isPublicView = currentView === 'landing' || currentView === 'audience' || currentView === 'help';

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Top Navigation */}
      <Navbar
        currentView={currentView}
        onNavigate={handleNavigate}
        onOpenReport={() => setReportOpen(true)}
      />

      {/* Main Layout Area */}
      {isLanding ? (
        <main className="flex-1">
          <LandingView
            onNavigate={handleNavigate}
            onOpenReport={() => setReportOpen(true)}
          />
        </main>
      ) : (
        <div className="flex-1 flex max-w-7xl w-full mx-auto">
          {/* Sidebar */}
          <Sidebar
            currentView={currentView}
            onNavigate={handleNavigate}
            onOpenReport={() => setReportOpen(true)}
            mobileOpen={mobileMenuOpen}
            setMobileOpen={setMobileMenuOpen}
          />

          {/* Main Content Area */}
          <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8">
            {/* Mobile Sidebar Toggle Button */}
            <div className="lg:hidden mb-4 flex items-center justify-between pb-2 border-b border-slate-800">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold bg-slate-900 border border-slate-800 rounded-lg text-slate-300 hover:text-white"
                aria-label="Toggle Navigation Menu"
              >
                {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
                <span>Navigation Menu</span>
              </button>
              <span className="text-xs text-slate-400 capitalize">{currentView}</span>
            </div>

            {/* View router with route protection */}
            {isPublicView ? (
              <>
                {currentView === 'audience' && <AudienceView />}
                {currentView === 'help' && <HelpSupportView />}
              </>
            ) : (
              <ProtectedRouteGuard onOpenAuth={handleOpenAuth}>
                {currentView === 'dashboard' && (
                  <DashboardView
                    onNavigate={handleNavigate}
                    onSelectCampaign={handleSelectCampaign}
                  />
                )}
                {currentView === 'campaigns' && (
                  <CampaignsView
                    onNavigate={handleNavigate}
                    selectedCampaignId={selectedCampaignId}
                    onClearSelectedCampaign={() => setSelectedCampaignId(null)}
                  />
                )}
                {currentView === 'createCampaign' && (
                  <CreateCampaignView
                    onNavigate={handleNavigate}
                    onCampaignCreated={handleSelectCampaign}
                  />
                )}
                {currentView === 'creatives' && <CreativesView />}
                {currentView === 'analytics' && <AnalyticsView />}
                {currentView === 'billing' && <BillingView />}
                {currentView === 'notifications' && <NotificationsView />}
                {currentView === 'profile' && <ProfileView />}
                {currentView === 'businessAccount' && <BusinessAccountView />}
              </ProtectedRouteGuard>
            )}
          </main>
        </div>
      )}

      {/* Phase 1 & 2 Acceptance Report Modal */}
      <Phase1ReportModal isOpen={reportOpen} onClose={() => setReportOpen(false)} />

      {/* Authentication Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialMode={authModalMode}
        onSuccess={() => {
          handleNavigate('dashboard');
        }}
      />
    </div>
  );
}

export default function App() {
  return (
    <LocalizationProvider>
      <AuthProvider>
        <MainApp />
      </AuthProvider>
    </LocalizationProvider>
  );
}
