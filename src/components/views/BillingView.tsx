import React, { useState, useEffect } from 'react';
import { useLocalization } from '../../locales/index.tsx';
import {
  Wallet,
  CreditCard,
  Building,
  AlertCircle,
  FileCheck2,
  ExternalLink,
  DollarSign,
  Landmark,
  Database,
  Plus,
  Clock,
  CheckCircle2,
  X,
} from 'lucide-react';
import { IRAQI_PAYMENT_GATEWAYS, PaymentService } from '../../services/paymentService.ts';
import type { PaymentRecord, PaymentGatewayType } from '../../types/index.ts';
import { useAuth } from '../../context/AuthContext.tsx';

export const BillingView: React.FC = () => {
  const { t, language } = useLocalization();
  const { user } = useAuth();
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [isIntentModalOpen, setIsIntentModalOpen] = useState(false);
  const [amountUSD, setAmountUSD] = useState<number>(50);
  const [selectedGateway, setSelectedGateway] = useState<PaymentGatewayType>('fastpay');
  const [intentSuccess, setIntentSuccess] = useState<string | null>(null);
  const [intentError, setIntentError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const reloadPayments = async () => {
    setLoading(true);
    try {
      const list = await PaymentService.getPayments(user?.id);
      setPayments(list);
    } catch (e) {
      console.error('Failed to load payments from Firestore:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    reloadPayments();
  }, [user?.id]);

  const handleCreateIntent = async (e: React.FormEvent) => {
    e.preventDefault();
    setIntentError(null);
    setIntentSuccess(null);

    if (amountUSD < 50) {
      setIntentError('Minimum advertising deposit is $50.00 USD (equivalent to 1 day TikTok ad spend).');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await PaymentService.createPaymentIntent({
        amountUSD,
        gateway: selectedGateway,
      });

      if (res.success && res.payment) {
        setIntentSuccess(`Payment intent record ${res.payment.id} persisted to Cloud Firestore in status 'pending_payment'.`);
        await reloadPayments();
        setTimeout(() => {
          setIsIntentModalOpen(false);
          setIntentSuccess(null);
        }, 1800);
      } else {
        setIntentError(res.error || 'Failed to create payment intent.');
      }
    } catch (err) {
      setIntentError(err instanceof Error ? err.message : 'Database error creating payment intent.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="pb-4 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white">{t.billing.title}</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">{t.billing.subtitle}</p>
        </div>

        <button
          onClick={() => {
            setIntentError(null);
            setIntentSuccess(null);
            setIsIntentModalOpen(true);
          }}
          className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors shadow-sm shadow-blue-500/20 flex items-center gap-1.5"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>{t.billing.depositBtn} (Stage Intent)</span>
        </button>
      </div>

      {/* Database Connection Banner */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <div className="text-slate-300 font-medium flex items-center gap-1.5">
            <Database className="w-3.5 h-3.5 text-cyan-400" />
            <span>Ledger Database: <code className="text-cyan-300 font-mono text-[11px]">/payments</code> in Cloud Firestore</span>
          </div>
        </div>
        <div className="flex items-center gap-3 text-slate-400 text-[11px]">
          <span>Security: <strong className="text-slate-200">ABAC Strict Rules</strong></span>
          <span>•</span>
          <span>User: <strong className="text-slate-200">{user ? user.email : 'Signed Out'}</strong></span>
          <span>•</span>
          <span>Records: <strong className="text-slate-200">{payments.length}</strong></span>
        </div>
      </div>

      {/* Honest Balance Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <div className="text-xs text-slate-400 mb-1">{t.billing.currentBalance}</div>
          <div className="text-2xl font-bold text-white font-mono tabular-nums">
            $0.00 <span className="text-sm font-normal text-slate-500">USD</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1">0 IQD (Available balance requires cleared settlement)</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <div className="text-xs text-slate-400 mb-1">{t.billing.pendingEscrow}</div>
          <div className="text-2xl font-bold text-amber-400 font-mono tabular-nums">
            ${payments.filter(p => p.status === 'pending_payment').reduce((acc, p) => acc + p.amount, 0).toFixed(2)}{' '}
            <span className="text-sm font-normal text-slate-500">USD</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Staged in database awaiting gateway settlement</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <div className="text-xs text-slate-400 mb-1">{t.billing.totalSpent}</div>
          <div className="text-2xl font-bold text-cyan-400 font-mono tabular-nums">
            $0.00 <span className="text-sm font-normal text-slate-500">USD</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Verified TikTok ad spend</div>
        </div>
      </div>

      {/* Honest Gateway Staging Notice */}
      <div className="p-4 bg-slate-900 border border-blue-500/30 rounded-2xl flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div className="space-y-1 text-xs">
          <div className="font-bold text-white">Payment Architecture Disclosure</div>
          <p className="text-slate-300 leading-relaxed">
            {t.billing.gatewayPendingNotice}
          </p>
        </div>
      </div>

      {/* Iraqi Payment Gateways Integration Status */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
        <h2 className="text-base font-bold text-white">{t.billing.gatewaysTitle}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {IRAQI_PAYMENT_GATEWAYS.map((gw) => (
            <div
              key={gw.id}
              className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2 text-xs"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-white text-sm">{gw.name}</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-950/60 text-amber-400 border border-amber-500/30">
                  Staging Prepared
                </span>
              </div>
              <p className="text-slate-400 leading-relaxed">
                {language === 'ckb'
                  ? gw.descriptionCkb
                  : language === 'ar'
                  ? gw.descriptionAr
                  : gw.descriptionEn}
              </p>
              <div className="pt-2 border-t border-slate-800 text-[10px] text-slate-500">
                <span className="font-semibold text-slate-400">Merchant Prerequisite: </span>
                {gw.merchantLicensingRequired}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Transaction History Ledger */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-white">{t.billing.transactionsTitle}</h2>
          <span className="text-xs text-slate-500">Cloud Firestore persistent records</span>
        </div>

        {loading ? (
          <div className="py-8 text-center text-xs text-slate-400">Loading ledger records...</div>
        ) : payments.length === 0 ? (
          <div className="text-center py-8 text-xs text-slate-500 space-y-2">
            <div>{t.billing.noTransactions}</div>
            <p className="text-[11px] text-slate-600">
              Click &quot;Stage Intent&quot; to test creating a persistent payment request record in Firestore.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="text-[11px] uppercase bg-slate-950 text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="p-3">Reference ID</th>
                  <th className="p-3">Gateway</th>
                  <th className="p-3">Amount USD</th>
                  <th className="p-3">Equivalent IQD</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                {payments.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-800/40">
                    <td className="p-3 font-mono text-[11px] text-cyan-400">{p.id}</td>
                    <td className="p-3 uppercase font-medium">{p.gateway}</td>
                    <td className="p-3 font-mono font-semibold">${p.amount.toFixed(2)}</td>
                    <td className="p-3 font-mono text-slate-400">{(p.amount * 1310).toLocaleString()} IQD</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-950/60 text-amber-400 border border-amber-500/30">
                        {p.status}
                      </span>
                    </td>
                    <td className="p-3 text-[11px] text-slate-400">
                      {new Date(p.createdAt).toLocaleDateString()} {new Date(p.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Stage Payment Intent Modal */}
      {isIntentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Landmark className="w-5 h-5 text-cyan-400" />
                <h3 className="text-base font-bold text-white">Stage Payment Intent</h3>
              </div>
              <button
                onClick={() => setIsIntentModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              In accordance with Phase 3 security guidelines, payment intent requests are recorded in the Cloud Firestore database ledger without simulating artificial balance additions.
            </p>

            {intentError && (
              <div className="p-3 bg-red-950/60 border border-red-500/40 rounded-xl text-xs text-red-300">
                {intentError}
              </div>
            )}

            {intentSuccess && (
              <div className="p-3 bg-emerald-950/60 border border-emerald-500/40 rounded-xl text-xs text-emerald-300 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{intentSuccess}</span>
              </div>
            )}

            <form onSubmit={handleCreateIntent} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-slate-300 font-medium">Select Gateway</label>
                <div className="grid grid-cols-2 gap-2">
                  {IRAQI_PAYMENT_GATEWAYS.map((gw) => (
                    <button
                      key={gw.id}
                      type="button"
                      onClick={() => setSelectedGateway(gw.id)}
                      className={`p-2.5 rounded-xl border text-start transition-all ${
                        selectedGateway === gw.id
                          ? 'bg-blue-600/20 border-cyan-500 text-white'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <div className="font-semibold text-xs text-white">{gw.name}</div>
                      <div className="text-[10px] text-slate-500">{gw.currency}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-medium">Deposit Amount (USD)</label>
                <input
                  type="number"
                  min="50"
                  step="10"
                  value={amountUSD}
                  onChange={(e) => setAmountUSD(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white font-mono text-sm focus:border-cyan-500 outline-none"
                  required
                />
                <div className="text-[11px] text-slate-400 flex justify-between pt-1">
                  <span>Official Rate: 1,310 IQD / USD</span>
                  <span className="font-mono text-cyan-300">{(amountUSD * 1310).toLocaleString()} IQD</span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsIntentModalOpen(false)}
                  className="px-4 py-2 text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 disabled:opacity-50 rounded-lg transition-colors"
                >
                  {isSubmitting ? 'Recording to Firestore...' : 'Persist Intent Record'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
