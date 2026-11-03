import {
  collection,
  doc,
  getDocs,
  setDoc,
  query,
} from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType } from './firebase.ts';
import type { CampaignEvent, CampaignEventType } from '../types/index.ts';

/**
 * Phase 3 Real Firestore Campaign Event Service
 * Records and queries immutable audit logs in /campaigns/{campaignId}/events
 */
export const CampaignEventService = {
  /**
   * Log an audit event for a campaign
   */
  async recordEvent(
    campaignId: string,
    eventType: CampaignEventType,
    details?: Record<string, unknown>,
    source: 'client' | 'server_worker' | 'tiktok_webhook' | 'admin' = 'client'
  ): Promise<CampaignEvent> {
    const currentUid = auth.currentUser?.uid || 'system_worker';
    const eventId = `evt_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const now = new Date().toISOString();

    const event: CampaignEvent = {
      id: eventId,
      campaignId,
      ownerId: currentUid,
      eventType,
      timestamp: now,
      source,
      details,
    };

    try {
      await setDoc(doc(db, 'campaigns', campaignId, 'events', eventId), event);
      return event;
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `campaigns/${campaignId}/events/${eventId}`);
    }
  },

  /**
   * Fetch all audit events for a campaign
   */
  async getCampaignEvents(campaignId: string): Promise<CampaignEvent[]> {
    try {
      const q = query(collection(db, 'campaigns', campaignId, 'events'));
      const snapshot = await getDocs(q);
      const events: CampaignEvent[] = [];
      snapshot.forEach((snap) => {
        events.push(snap.data() as CampaignEvent);
      });
      events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      return events;
    } catch (err) {
      handleFirestoreError(err, OperationType.GET, `campaigns/${campaignId}/events`);
    }
  },
};
