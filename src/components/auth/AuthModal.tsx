import React, { useState } from 'react';
import { useLocalization } from '../../locales/index.tsx';
import { useAuth } from '../../context/AuthContext.tsx';
import {
  X,
  Lock,
  Mail,
  User,
  Phone,
  Building2,
  Globe,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  ArrowRight,
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'register';
  onSuccess?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'login',
  onSuccess,
}) => {
  const { t, language } = useLocalization();
  const { login, register, resetPassword } = useAuth();

  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>(initialMode);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Form Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<'individual' | 'business'>('individual');

  // Business Fields
  const [companyName, setCompanyName] = useState('');
  const [industry, setIndustry] = useState('E-Commerce & Retail');
  const [city, setCity] = useState('Erbil (هەولێر)');
  const [website, setWebsite] = useState('');

  if (!isOpen) return null;

  const getCleanAuthError = (err: any): string => {
    const code = err?.code || '';
    if (code === 'auth/email-already-in-use') {
      return language === 'ckb'
        ? 'ئەم ئیمەیڵە پێشتر بەکارهاتووە. تکایە چوونەژوورەوە هەڵبژێرە.'
        : language === 'ar'
        ? 'البريد الإلكتروني مسجل مسبقاً. يرجى تسجيل الدخول.'
        : 'This email is already registered. Please sign in.';
    }
    if (code === 'auth/wrong-password' || code === 'auth/invalid-credential') {
      return language === 'ckb'
        ? 'ئیمەیڵ یان وشەی تێپەڕ هەڵەیە.'
        : language === 'ar'
        ? 'البريد الإلكتروني أو كلمة المرور غير صحيحة.'
        : 'Invalid email or password.';
    }
    if (code === 'auth/user-not-found') {
      return language === 'ckb'
        ? 'هیچ هەژمارێک بەم ئیمەیڵە نەدۆزرایەوە.'
        : language === 'ar'
        ? 'لم يتم العثور على حساب بهذا البريد.'
        : 'No account found with this email.';
    }
    if (code === 'auth/weak-password') {
      return language === 'ckb'
        ? 'وشەی تێپەڕ دەبێت لانیکەم ٦ پیت یان ژمارە بێت.'
        : language === 'ar'
        ? 'يجب أن تتكون كلمة المرور من ٦ أحرف على الأقل.'
        : 'Password must be at least 6 characters.';
    }
    return err?.message || 'Authentication error. Please check your credentials.';
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    try {
      await login(email, password);
      onClose();
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setErrorMsg(getCleanAuthError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (password.length < 6) {
      setErrorMsg(
        language === 'ckb'
          ? 'وشەی تێپەڕ دەبێت لانیکەم ٦ پیت بێت.'
          : 'Password must be at least 6 characters.'
      );
      return;
    }

    setLoading(true);

    try {
      await register({
        email,
        password,
        name,
        phone,
        role,
        language,
        businessProfile:
          role === 'business'
            ? {
                companyName: companyName || name,
                industry,
                city,
                businessAddress: `${city}, Iraq`,
                contactEmail: email,
                contactPhone: phone,
                verificationStatus: 'unverified',
              }
            : undefined,
      });

      onClose();
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setErrorMsg(getCleanAuthError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      await resetPassword(email);
      setSuccessMsg(
        language === 'ckb'
          ? 'بەستەری گۆڕینی وشەی تێپەڕ نێردرا بۆ ئیمەیڵەکەت.'
          : language === 'ar'
          ? 'تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني.'
          : 'Password reset link sent to your email.'
      );
    } catch (err: any) {
      setErrorMsg(getCleanAuthError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-xs">
              MM
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">{t.common.appName}</h2>
              <p className="text-[11px] text-slate-400">
                {language === 'ckb'
                  ? mode === 'login'
                    ? 'چوونەژوورەوە بۆ هەژماری ڕیکلامکار'
                    : mode === 'register'
                    ? 'دروستکردنی هەژماری نوێی ڕیکلامکار'
                    : 'نوێکردنەوەی وشەی تێپەڕ'
                  : language === 'ar'
                  ? mode === 'login'
                    ? 'تسجيل الدخول إلى حساب المعلن'
                    : mode === 'register'
                    ? 'إنشاء حساب معلن جديد'
                    : 'إعادة تعيين كلمة المرور'
                  : mode === 'login'
                  ? 'Sign in to advertiser account'
                  : mode === 'register'
                  ? 'Create new advertiser account'
                  : 'Reset your password'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Selector Tabs (Sign In vs Register) */}
        {mode !== 'forgot' && (
          <div className="grid grid-cols-2 p-1.5 bg-slate-950/60 border-b border-slate-800 text-xs">
            <button
              onClick={() => {
                setMode('login');
                setErrorMsg(null);
              }}
              className={`py-2 rounded-lg font-medium transition-all ${
                mode === 'login'
                  ? 'bg-slate-900 text-white font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {language === 'ckb'
                ? 'چوونەژوورەوە'
                : language === 'ar'
                ? 'تسجيل الدخول'
                : 'Sign In'}
            </button>
            <button
              onClick={() => {
                setMode('register');
                setErrorMsg(null);
              }}
              className={`py-2 rounded-lg font-medium transition-all ${
                mode === 'register'
                  ? 'bg-slate-900 text-white font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {language === 'ckb'
                ? 'دروستکردنی هەژمار'
                : language === 'ar'
                ? 'إنشاء حساب'
                : 'Register'}
            </button>
          </div>
        )}

        {/* Error / Success Notifications */}
        {errorMsg && (
          <div className="m-4 mb-0 p-3 bg-red-950/40 border border-red-500/40 rounded-xl text-xs text-red-300 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="m-4 mb-0 p-3 bg-emerald-950/40 border border-emerald-500/40 rounded-xl text-xs text-emerald-300 flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Modal Form Body */}
        <div className="p-6 overflow-y-auto max-h-[75vh]">
          {/* 1. Login Form */}
          {mode === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-slate-300 font-medium">
                  {language === 'ckb'
                    ? 'ناونیشانی ئیمەیڵ'
                    : language === 'ar'
                    ? 'البريد الإلكتروني'
                    : 'Email Address'}
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute start-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="email"
                    required
                    dir="ltr"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@domain.iq"
                    className="w-full ps-9 pe-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white text-left focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-slate-300 font-medium">
                    {language === 'ckb'
                      ? 'وشەی تێپەڕ'
                      : language === 'ar'
                      ? 'كلمة المرور'
                      : 'Password'}
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setMode('forgot');
                      setErrorMsg(null);
                    }}
                    className="text-[11px] text-cyan-400 hover:underline"
                  >
                    {language === 'ckb'
                      ? 'وشەی تێپەڕت لەبیرچووە؟'
                      : language === 'ar'
                      ? 'نسيت كلمة المرور؟'
                      : 'Forgot Password?'}
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute start-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="password"
                    required
                    dir="ltr"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full ps-9 pe-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white text-left focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold rounded-lg transition-colors shadow-md shadow-blue-500/20"
              >
                {loading
                  ? language === 'ckb'
                    ? 'پشتڕاستکردنەوە...'
                    : language === 'ar'
                    ? 'جاري التحقق...'
                    : 'Authenticating...'
                  : language === 'ckb'
                  ? 'چوونەژوورەوە'
                  : language === 'ar'
                  ? 'تسجيل الدخول'
                  : 'Sign In'}
              </button>
            </form>
          )}

          {/* 2. Register Form */}
          {mode === 'register' && (
            <form onSubmit={handleRegister} className="space-y-4 text-xs">
              {/* Account Type Selection */}
              <div className="space-y-1.5">
                <label className="text-slate-300 font-medium">
                  {language === 'ckb'
                    ? 'جۆری هەژمار'
                    : language === 'ar'
                    ? 'فئة الحساب'
                    : 'Account Category'}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setRole('individual')}
                    className={`p-2.5 rounded-lg border text-start transition-all ${
                      role === 'individual'
                        ? 'bg-blue-600/20 border-cyan-500 text-white font-semibold'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    <div>{t.common.individual}</div>
                    <div className="text-[10px] text-slate-500">
                      {language === 'ckb'
                        ? 'ڕیکلامکاری سەربەخۆ / کەسی'
                        : language === 'ar'
                        ? 'معلن فردي / شخصي'
                        : 'Solo creator / Individual'}
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRole('business')}
                    className={`p-2.5 rounded-lg border text-start transition-all ${
                      role === 'business'
                        ? 'bg-blue-600/20 border-cyan-500 text-white font-semibold'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    <div>{t.common.business}</div>
                    <div className="text-[10px] text-slate-500">
                      {language === 'ckb'
                        ? 'کۆمپانیا / فرۆشگا / بریکار'
                        : language === 'ar'
                        ? 'شركة / متجر / وكالة'
                        : 'Company / Store / Agency'}
                    </div>
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-medium">
                  {language === 'ckb'
                    ? 'ناوی تەواو / ناوی سەرەکی'
                    : language === 'ar'
                    ? 'الاسم الكامل / جهة الاتصال'
                    : 'Full Name / Account Contact'}
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute start-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={language === 'ckb' ? 'بۆ نموونە: کاروان عەلی' : language === 'ar' ? 'مثال: أحمد علي' : 'e.g. Karwan Ali'}
                    className="w-full ps-9 pe-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-medium">
                  {language === 'ckb'
                    ? 'ناونیشانی ئیمەیڵ'
                    : language === 'ar'
                    ? 'البريد الإلكتروني'
                    : 'Email Address'}
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute start-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="email"
                    required
                    dir="ltr"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@company.iq"
                    className="w-full ps-9 pe-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white text-left focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-medium">
                  {language === 'ckb'
                    ? 'وشەی تێپەڕ (لانیکەم ٦ پیت)'
                    : language === 'ar'
                    ? 'كلمة المرور (٦ أحرف على الأقل)'
                    : 'Password (Min 6 characters)'}
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute start-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="password"
                    required
                    minLength={6}
                    dir="ltr"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full ps-9 pe-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white text-left focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-medium">
                  {language === 'ckb'
                    ? 'ژمارەی مۆبایل (ئارەزوومەندانە)'
                    : language === 'ar'
                    ? 'رقم الهاتف (اختياري)'
                    : 'Phone Number (Optional)'}
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 absolute start-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="text"
                    dir="ltr"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+964 750 000 0000"
                    className="w-full ps-9 pe-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white font-mono text-left"
                  />
                </div>
              </div>

              {/* Additional Business Details if Business Role is selected */}
              {role === 'business' && (
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-3">
                  <div className="text-[11px] font-semibold text-cyan-400">
                    {language === 'ckb'
                      ? 'زانیاری پرۆفایلی بازرگانی'
                      : language === 'ar'
                      ? 'معلومات الملف التجاري'
                      : 'Business Profile Information'}
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-400">
                      {language === 'ckb'
                        ? 'ناوی کۆمپانیا یان فرۆشگا'
                        : language === 'ar'
                        ? 'اسم الشركة أو المتجر'
                        : 'Business / Store Name'}
                    </label>
                    <input
                      type="text"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder={language === 'ckb' ? 'بۆ نموونە: فرۆشگای هاوچەرخ' : language === 'ar' ? 'مثال: متجر بغداد للأزياء' : 'e.g. Hawler Fashion Store'}
                      className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded text-white text-xs"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-slate-400">
                        {language === 'ckb'
                          ? 'کەرتی کار'
                          : language === 'ar'
                          ? 'القطاع'
                          : 'Industry'}
                      </label>
                      <input
                        type="text"
                        value={industry}
                        onChange={(e) => setIndustry(e.target.value)}
                        className="w-full px-2 py-1.5 bg-slate-900 border border-slate-800 rounded text-white text-xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-slate-400">
                        {language === 'ckb'
                          ? 'شار / پارێزگا'
                          : language === 'ar'
                          ? 'المدينة / المحافظة'
                          : 'City / Region'}
                      </label>
                      <input
                        type="text"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="w-full px-2 py-1.5 bg-slate-900 border border-slate-800 rounded text-white text-xs"
                      />
                    </div>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold rounded-lg transition-colors shadow-md shadow-blue-500/20"
              >
                {loading
                  ? language === 'ckb'
                    ? 'دروستکردنی هەژمار...'
                    : language === 'ar'
                    ? 'جاري إنشاء الحساب...'
                    : 'Creating Account...'
                  : language === 'ckb'
                  ? 'تەواوکردنی دروستکردنی هەژمار'
                  : language === 'ar'
                  ? 'إتمام إنشاء الحساب'
                  : 'Create Account'}
              </button>
            </form>
          )}

          {/* 3. Forgot Password Form */}
          {mode === 'forgot' && (
            <form onSubmit={handleForgot} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-slate-300 font-medium">
                  {language === 'ckb'
                    ? 'ئیمەیڵی هەژمارەکەت'
                    : language === 'ar'
                    ? 'البريد الإلكتروني لحسابك'
                    : 'Your Account Email'}
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute start-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="email"
                    required
                    dir="ltr"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@domain.iq"
                    className="w-full ps-9 pe-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white text-left"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setErrorMsg(null);
                    setSuccessMsg(null);
                  }}
                  className="text-slate-400 hover:text-white"
                >
                  {language === 'ckb'
                    ? 'گەڕانەوە بۆ چوونەژوورەوە'
                    : language === 'ar'
                    ? 'العودة لتسجيل الدخول'
                    : 'Back to Sign In'}
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg transition-colors"
                >
                  {loading
                    ? language === 'ckb'
                      ? 'ناردن...'
                      : language === 'ar'
                      ? 'جاري الإرسال...'
                      : 'Sending...'
                    : language === 'ckb'
                    ? 'ناردنی بەستەری نوێکردنەوە'
                    : language === 'ar'
                    ? 'إرسال رابط التعيين'
                    : 'Send Reset Link'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
