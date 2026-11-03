import {
  collection,
  doc,
  getDocs,
  setDoc,
  deleteDoc,
  query,
  where,
} from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType } from './firebase.ts';
import type { AdCreative } from '../types/index.ts';
import { validateCreativeSpecs } from '../utils/rules.ts';

/**
 * Phase 3 Real Firestore Creative Service
 * Stores video creative metadata in Cloud Firestore (/creatives)
 * Validates video assets with server-side API before persisting.
 */
export const CreativeService = {
  /**
   * Fetch all creatives owned by the authenticated user
   */
  async getCreatives(ownerId?: string): Promise<AdCreative[]> {
    const currentUid = ownerId || auth.currentUser?.uid;
    if (!currentUid) {
      return [];
    }

    try {
      const q = query(
        collection(db, 'creatives'),
        where('ownerId', '==', currentUid)
      );
      const snapshot = await getDocs(q);
      const creatives: AdCreative[] = [];
      snapshot.forEach((docSnap) => {
        creatives.push(docSnap.data() as AdCreative);
      });
      return creatives;
    } catch (err) {
      handleFirestoreError(err, OperationType.GET, 'creatives');
    }
  },

  /**
   * Validate creative file with server and persist to Firestore
   */
  async saveCreative(creative: AdCreative): Promise<{ success: boolean; errors?: string[] }> {
    // 1. Client-side rules validation
    const val = validateCreativeSpecs({
      durationSeconds: creative.durationSeconds,
      fileSizeBytes: creative.fileSizeBytes,
      aspectRatio: creative.aspectRatio,
      adText: creative.adText,
      destinationUrl: creative.destinationUrl,
    });

    if (!val.isValid) {
      return { success: false, errors: val.errors };
    }

    // 2. Server-side validation
    try {
      const serverResp = await fetch('/api/creatives/validate-file', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName: creative.videoFileName,
          fileSizeBytes: creative.fileSizeBytes,
          mimeType: creative.fileType || 'video/mp4',
          durationSeconds: creative.durationSeconds,
          aspectRatio: creative.aspectRatio,
        }),
      });
      const serverData = await serverResp.json();
      if (!serverData.valid) {
        return { success: false, errors: serverData.errors || ['Server rejected creative file format.'] };
      }
    } catch (e) {
      console.warn('Server creative validation warning (proceeding with rule checks):', e);
    }

    const currentUid = auth.currentUser?.uid;
    const effectiveOwnerId = creative.ownerId || currentUid || 'anonymous_user';

    const preparedCreative: AdCreative = {
      ...creative,
      ownerId: effectiveOwnerId,
      uploadStatus: creative.uploadStatus || 'uploaded',
      reviewStatus: creative.reviewStatus || 'draft',
      fileType: creative.fileType || 'video/mp4',
      storagePath: creative.storagePath || `creatives/${effectiveOwnerId}/${creative.videoFileName}`,
      updatedAt: new Date().toISOString(),
    };

    try {
      await setDoc(doc(db, 'creatives', preparedCreative.id), preparedCreative);
      return { success: true };
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `creatives/${preparedCreative.id}`);
    }
  },

  /**
   * Delete creative from Firestore
   */
  async deleteCreative(id: string): Promise<boolean> {
    try {
      await deleteDoc(doc(db, 'creatives', id));
      return true;
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `creatives/${id}`);
    }
  },
};
