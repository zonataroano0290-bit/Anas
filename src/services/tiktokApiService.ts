import type { TikTokApiConfigReport } from '../types/index.ts';

/**
 * Official TikTok Marketing API Service Boundary
 * Reference documentation: https://business-api.tiktok.com/portal/docs
 * 
 * Rules:
 * 1. Private credentials (TIKTOK_APP_SECRET, TIKTOK_ACCESS_TOKEN) NEVER enter client code.
 * 2. All calls route to server-side endpoints (/api/tiktok/*).
 * 3. Does not fake approval, delivery, or token status.
 */

export const TIKTOK_API_BASE_URL = 'https://business-api.tiktok.com/open_api/v1.3';

export const TIKTOK_REQUIRED_SCOPES = [
  'ads_management',  // Create and manage campaigns, ad groups, budgets, ads
  'ads_read',        // Read performance metrics and ad status
  'video.upload',    // Upload video assets directly to TikTok Video Library
  'business_data',   // Access Business Center ad account bindings
];

export async function fetchTikTokApiStatus(): Promise<TikTokApiConfigReport> {
  try {
    const response = await fetch('/api/tiktok/status');
    if (!response.ok) {
      throw new Error(`Server returned HTTP ${response.status}`);
    }
    return await response.json();
  } catch (err) {
    console.warn('Unable to reach server-side TikTok API endpoint, using Phase 1 architectural default', err);
    return {
      apiVersion: 'v1.3',
      documentationUrl: 'https://business-api.tiktok.com/portal/docs',
      serverEndpointConfigured: false,
      hasAppId: false,
      hasAppSecret: false,
      hasAccessToken: false,
      hasAdAccountId: false,
      environment: 'unconfigured',
      requiredScopes: TIKTOK_REQUIRED_SCOPES,
      pendingRequirements: [
        'Register Developer Account on TikTok for Business',
        'Create TikTok Developer App and request Marketing API approval',
        'Configure TIKTOK_APP_ID and TIKTOK_APP_SECRET in server environment',
        'Complete OAuth 2.0 authorization with advertiser Ad Account',
      ],
    };
  }
}

/**
 * Formats a campaign into the exact official TikTok Marketing API payload structure
 * Reference: POST /v1.3/campaign/create/ & POST /v1.3/adgroup/create/ & POST /v1.3/ad/create/
 */
export function formatTikTokApiPayload(campaign: any) {
  return {
    campaign_creation_payload: {
      advertiser_id: campaign.tiktokIntegration?.adAccountId || 'PENDING_OAUTH_AUTH',
      campaign_name: campaign.name,
      objective_type: campaign.objective,
      budget_mode: campaign.budget.type === 'DAILY' ? 'BUDGET_MODE_DAY' : 'BUDGET_MODE_TOTAL',
      budget: campaign.budget.amountUSD,
      special_industries: [],
    },
    adgroup_creation_payload: {
      advertiser_id: campaign.tiktokIntegration?.adAccountId || 'PENDING_OAUTH_AUTH',
      adgroup_name: `${campaign.name} - AdGroup 1`,
      placement_type: 'PLACEMENT_TYPE_AUTOMATIC',
      placements: ['PLACEMENT_TIKTOK'],
      location_ids: campaign.audience.locations, // ISO 3166-2 Iraqi governorates
      languages: campaign.audience.languages,
      age_groups: campaign.audience.ageRanges,
      gender: campaign.audience.gender === 'ALL' ? 'GENDER_UNLIMITED' : campaign.audience.gender === 'MALE' ? 'GENDER_MALE' : 'GENDER_FEMALE',
      schedule_type: campaign.schedule.scheduleType === 'CONTINUOUS' ? 'SCHEDULE_START_END' : 'SCHEDULE_FIXED_RANGE',
      start_time: campaign.schedule.startDate,
      end_time: campaign.schedule.endDate,
    },
    ad_creative_payload: {
      advertiser_id: campaign.tiktokIntegration?.adAccountId || 'PENDING_OAUTH_AUTH',
      ad_name: `${campaign.name} - Creative 1`,
      ad_format: 'SINGLE_VIDEO',
      video_id: campaign.creative.videoFileName || 'PENDING_VIDEO_UPLOAD',
      ad_text: campaign.creative.adText,
      call_to_action: campaign.creative.callToAction,
      landing_page_url: campaign.creative.destinationUrl,
      display_name: campaign.creative.displayAccountName,
    },
    api_metadata: {
      api_version: 'v1.3',
      specification_source: 'https://business-api.tiktok.com/portal/docs',
      readiness_state: 'READY_FOR_OFFICIAL_GATEWAY',
    },
  };
}
