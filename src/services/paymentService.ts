import {
  collection,
  doc,
  getDocs,
  setDoc,
  query,
  where,
} from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType } from './firebase.ts';
import type { IraqiPaymentGateway, PaymentRecord, PaymentGatewayType } from '../types/index.ts';

export const IRAQI_PAYMENT_GATEWAYS: IraqiPaymentGateway[] = [
  {
    id: 'fastpay',
    name: 'FastPay (فاسٹ‌پەی)',
    descriptionEn: 'The leading mobile e-wallet across Erbil, Sulaymaniyah, Duhok, and the Kurdistan Region.',
    descriptionCkb: 'جزدانی سەرەکی و بەربڵاوی هەرێمی کوردستان لە هەولێر، سلێمانی و دهۆک.',
    descriptionAr: 'المحفظة الإلكترونية الرائدة في إقليم كردستان (أربيل، السليمانية، دهوك).',
    currency: 'IQD',
    status: 'pending_commercial_agreement',
    merchantLicensingRequired: 'Kurdistan Regional Government Commercial Registration & Central Bank of Iraq Mobile Money License',
  },
  {
    id: 'zaincash',
    name: 'ZainCash (زین‌کاش)',
    descriptionEn: 'Widely used mobile money provider across Baghdad and central/southern governorates.',
    descriptionCkb: 'جزدانی ئەلیکترۆنی بەربڵاو لە بەغدا، نەجەف، کەربەلا، بەسرە و پارێزگاکانی عێراق.',
    descriptionAr: 'محفظة الدفع الإلكتروني الأكثر انتشاراً في بغداد والوسط والجنوب العراقي.',
    currency: 'IQD',
    status: 'pending_commercial_agreement',
    merchantLicensingRequired: 'CBI E-Payment Provider License (Central Bank of Iraq approval)',
  },
  {
    id: 'fib',
    name: 'First Iraqi Bank (FIB - بانکی یەکەمی عێراقی)',
    descriptionEn: 'Modern digital corporate banking with instant QR and IBAN settlements in Iraq.',
    descriptionCkb: 'بانکی دیجیتاڵی مۆدێرنی عێراق بۆ حەواڵەی خێرا و ئاسانی کۆمپانیاکان.',
    descriptionAr: 'المصرف العراقي الأول - خدمات مصرفية رقمية فورية للشركات والأفراد.',
    currency: 'IQD',
    status: 'pending_commercial_agreement',
    merchantLicensingRequired: 'Commercial Corporate Account & FIB Merchant API Agreement',
  },
  {
    id: 'card',
    name: 'Iraqi & International Cards (Qi Card / Visa / Mastercard)',
    descriptionEn: 'Card processing through Central Bank of Iraq licensed payment switches.',
    descriptionCkb: 'کارتەکانی کەی کارت، ماستەرکارت و ڤیزا لە ڕێگەی سویچی فەرمی بانکی ناوەندی.',
    descriptionAr: 'بطاقات كي كارد وماستركارد وفيزا عبر مقسم الدفع الوطني للبنك المركزي العراقي.',
    currency: 'USD',
    status: 'pending_commercial_agreement',
    merchantLicensingRequired: 'PCI-DSS Compliance Level 1 & CBI Acquirer Merchant ID',
  },
];

/**
 * Phase 3 Real Firestore Payment Ledger Service
 * Prepares real payment intent records without fake client balances.
 */
export const PaymentService = {
  /**
   * Fetch payment transaction history for current user
   */
  async getPayments(ownerId?: string): Promise<PaymentRecord[]> {
    const currentUid = ownerId || auth.currentUser?.uid;
    if (!currentUid) return [];

    try {
      const q = query(
        collection(db, 'payments'),
        where('ownerId', '==', currentUid)
      );
      const snapshot = await getDocs(q);
      const payments: PaymentRecord[] = [];
      snapshot.forEach((snap) => {
        payments.push(snap.data() as PaymentRecord);
      });
      payments.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      return payments;
    } catch (err) {
      handleFirestoreError(err, OperationType.GET, 'payments');
    }
  },

  /**
   * Request server-side payment intent and persist ledger record to Firestore
   */
  async createPaymentIntent(params: {
    amountUSD: number;
    gateway: PaymentGatewayType;
    campaignId?: string;
  }): Promise<{ success: boolean; payment?: PaymentRecord; error?: string }> {
    const currentUid = auth.currentUser?.uid;
    if (!currentUid) {
      return { success: false, error: 'Sign in required to request payment.' };
    }

    // Call trusted server service
    let serverIntent: any = null;
    try {
      const resp = await fetch('/api/payments/intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ownerId: currentUid,
          campaignId: params.campaignId,
          amountUSD: params.amountUSD,
          gateway: params.gateway,
        }),
      });
      const data = await resp.json();
      if (data.created) {
        serverIntent = data.payment;
      }
    } catch (e) {
      console.warn('Server payment intent fallback warning:', e);
    }

    const paymentId = serverIntent?.id || `pay_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const now = new Date().toISOString();

    const record: PaymentRecord = {
      id: paymentId,
      ownerId: currentUid,
      campaignId: params.campaignId,
      amount: params.amountUSD,
      currency: params.gateway === 'card' ? 'USD' : 'IQD',
      gateway: params.gateway,
      status: 'pending_payment',
      providerTxId: serverIntent?.providerTxId || undefined,
      merchantNote: serverIntent?.merchantNote || `Staged deposit via ${params.gateway}`,
      createdAt: now,
      updatedAt: now,
    };

    try {
      await setDoc(doc(db, 'payments', paymentId), record);
      return { success: true, payment: record };
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `payments/${paymentId}`);
    }
  },
};
