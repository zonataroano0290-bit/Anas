import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  query,
  where,
} from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType } from './firebase.ts';
import type { BusinessProfileRecord } from '../types/index.ts';

/**
 * Phase 3 Real Firestore Business Profile Service
 * Manages dedicated commercial entities in /businesses
 * Validates with server verification API
 */
export const BusinessService = {
  /**
   * Get business profile by ID
   */
  async getBusinessById(businessId: string): Promise<BusinessProfileRecord | null> {
    try {
      const snap = await getDoc(doc(db, 'businesses', businessId));
      if (!snap.exists()) return null;
      return snap.data() as BusinessProfileRecord;
    } catch (err) {
      handleFirestoreError(err, OperationType.GET, `businesses/${businessId}`);
    }
  },

  /**
   * Get businesses owned by current user
   */
  async getMyBusinesses(ownerId?: string): Promise<BusinessProfileRecord[]> {
    const currentUid = ownerId || auth.currentUser?.uid;
    if (!currentUid) return [];

    try {
      const q = query(
        collection(db, 'businesses'),
        where('ownerId', '==', currentUid)
      );
      const snapshot = await getDocs(q);
      const list: BusinessProfileRecord[] = [];
      snapshot.forEach((snap) => {
        list.push(snap.data() as BusinessProfileRecord);
      });
      return list;
    } catch (err) {
      handleFirestoreError(err, OperationType.GET, 'businesses');
    }
  },

  /**
   * Register or save business profile in Firestore
   */
  async saveBusiness(
    business: Partial<BusinessProfileRecord> & { businessName: string; businessCategory: string }
  ): Promise<{ success: boolean; business?: BusinessProfileRecord; error?: string }> {
    const currentUid = auth.currentUser?.uid;
    if (!currentUid) {
      return { success: false, error: 'Authentication required to create a business profile.' };
    }

    const businessId = business.id || `biz_${currentUid}_${Date.now()}`;
    const now = new Date().toISOString();

    // Check with server-side business verification service
    let initialVerification: 'unverified' | 'pending_verification' = 'unverified';
    try {
      const verifyResp = await fetch('/api/businesses/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessName: business.businessName,
          commercialRegistrationNumber: business.commercialRegistrationNumber,
          taxIdentificationNumber: business.taxIdentificationNumber,
          country: business.country || 'Iraq',
        }),
      });
      const verifyData = await verifyResp.json();
      if (verifyData.recommendedVerificationStatus) {
        initialVerification = verifyData.recommendedVerificationStatus;
      }
    } catch (e) {
      console.warn('Server business validation check warning:', e);
    }

    const record: BusinessProfileRecord = {
      id: businessId,
      ownerId: currentUid,
      businessName: business.businessName.trim(),
      businessCategory: business.businessCategory.trim(),
      country: business.country || 'Iraq',
      region: business.region || 'Kurdistan',
      city: business.city || 'Erbil',
      contactEmail: business.contactEmail || auth.currentUser?.email || '',
      contactPhone: business.contactPhone || '',
      website: business.website || '',
      commercialRegistrationNumber: business.commercialRegistrationNumber || '',
      taxIdentificationNumber: business.taxIdentificationNumber || '',
      verificationStatus: business.verificationStatus || initialVerification,
      createdAt: business.createdAt || now,
      updatedAt: now,
    };

    try {
      await setDoc(doc(db, 'businesses', businessId), record);
      return { success: true, business: record };
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `businesses/${businessId}`);
    }
  },

  /**
   * Update permitted business fields (verificationStatus is protected by rules!)
   */
  async updateBusiness(
    businessId: string,
    updates: Partial<BusinessProfileRecord>
  ): Promise<{ success: boolean; error?: string }> {
    const sanitized = { ...updates };
    // Strip privileged fields to prevent rule rejections
    delete sanitized.verificationStatus;
    delete sanitized.ownerId;
    delete sanitized.id;
    delete sanitized.createdAt;

    try {
      await updateDoc(doc(db, 'businesses', businessId), {
        ...sanitized,
        updatedAt: new Date().toISOString(),
      });
      return { success: true };
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `businesses/${businessId}`);
    }
  },
};
