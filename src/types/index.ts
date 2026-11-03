export type Language = 'ckb' | 'ar' | 'en';
export type Direction = 'rtl' | 'ltr';

export type UserRole = 'individual' | 'business' | 'admin';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  language: Language;
  avatarUrl?: string;
  isEmailVerified: boolean;
  businessProfile?: BusinessProfile;
  createdAt: string;
}

export interface BusinessProfile {
  companyName: string;
  commercialRegistrationNumber: string;
  taxIdentificationNumber: string;
  businessAddress: string;
  city: string;
  governorate: string;
  contactEmail: string;
  contactPhone: string;
  industry: string;
  verificationStatus: 'unverified' | 'pending_verification' | 'verified' | 'rejected';
  verificationDocuments?: string[];
  teamMembers?: TeamMember[];
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: 'owner' | 'manager' | 'analyst';
  addedAt: string;
}

export type CampaignStatus =
  | 'draft'
  | 'awaiting_configuration'
  | 'pending_review'
  | 'pending_approval'
  | 'ready_to_submit'
  | 'submitted_to_tiktok'
  | 'active'
  | 'paused'
  | 'rejected'
  | 'completed'
  | 'failed';

export type CampaignObjective =
  | 'TRAFFIC'
  | 'CONVERSIONS'
  | 'VIDEO_VIEWS'
  | 'REACH'
  | 'LEAD_GENERATION';

export type BudgetType = 'DAILY' | 'LIFETIME';

export interface CampaignBudget {
  type: BudgetType;
  amountUSD: number;
  amountIQD: number;
  exchangeRate: number; // e.g. 1310 IQD per USD
}

export interface CampaignSchedule {
  scheduleType: 'CONTINUOUS' | 'SCHEDULED';
  startDate: string;
  endDate?: string;
}

export interface AudienceTargeting {
  locations: string[]; // e.g. ['IQ-ER' (Erbil), 'IQ-SU' (Sulaymaniyah), 'IQ-BG' (Baghdad)]
  languages: ('ckb' | 'ar' | 'en')[];
  ageRanges: string[]; // e.g. ['18-24', '25-34', '35-44', '45-54']
  gender: 'ALL' | 'MALE' | 'FEMALE';
  interests: string[];
}

export interface AdCreative {
  id: string;
  ownerId?: string;
  name: string;
  videoFileName: string;
  videoFileUrl?: string;
  storagePath?: string;
  fileSizeBytes: number;
  durationSeconds: number;
  aspectRatio: '9:16' | '1:1' | '16:9';
  resolution: string;
  adText: string; // Max 100 characters for TikTok In-Feed Ads
  callToAction:
    | 'LEARN_MORE'
    | 'SHOP_NOW'
    | 'SIGN_UP'
    | 'CONTACT_US'
    | 'DOWNLOAD'
    | 'ORDER_NOW';
  destinationUrl: string;
  displayAccountName: string;
  uploadStatus?: 'pending' | 'uploaded' | 'failed';
  reviewStatus?: 'draft' | 'pending_review' | 'approved' | 'rejected';
  fileType?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface TikTokIntegrationState {
  isLinkedToAdAccount: boolean;
  adAccountId?: string;
  tiktokCampaignId?: string;
  tiktokAdGroupId?: string;
  tiktokAdId?: string;
  submissionStatusNote: string;
  apiReadinessCheck: boolean;
  lastSyncAttempt?: string;
}

export interface Campaign {
  id: string;
  ownerId: string;
  name: string;
  objective: CampaignObjective;
  status: CampaignStatus;
  statusNote?: string;
  advertiserType: 'individual' | 'business';
  budget: CampaignBudget;
  schedule: CampaignSchedule;
  audience: AudienceTargeting;
  creative: AdCreative;
  tiktokIntegration: TikTokIntegrationState;
  createdAt: string;
  updatedAt: string;
}

export interface BusinessProfileRecord {
  id: string;
  ownerId: string;
  businessName: string;
  businessCategory: string;
  country: string;
  region: string;
  city: string;
  contactEmail: string;
  contactPhone: string;
  website?: string;
  commercialRegistrationNumber?: string;
  taxIdentificationNumber?: string;
  verificationStatus: 'unverified' | 'pending_verification' | 'verified' | 'rejected';
  verificationNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export type CampaignEventType =
  | 'created'
  | 'status_changed'
  | 'budget_updated'
  | 'creative_bound'
  | 'submitted_to_provider'
  | 'provider_sync'
  | 'error_logged';

export interface CampaignEvent {
  id: string;
  campaignId: string;
  ownerId: string;
  eventType: CampaignEventType;
  timestamp: string;
  source: 'client' | 'server_worker' | 'tiktok_webhook' | 'admin';
  providerReference?: string;
  details?: Record<string, unknown>;
}

export type PaymentGatewayType = 'fastpay' | 'zaincash' | 'fib' | 'card';
export type PaymentStatus =
  | 'draft_request'
  | 'pending_payment'
  | 'completed'
  | 'failed'
  | 'refunded';

export interface PaymentRecord {
  id: string;
  ownerId: string;
  campaignId?: string;
  amount: number;
  currency: 'IQD' | 'USD';
  gateway: PaymentGatewayType;
  status: PaymentStatus;
  providerTxId?: string;
  merchantNote?: string;
  createdAt: string;
  updatedAt: string;
}

export interface IraqiGovernorate {
  code: string; // ISO 3166-2:IQ
  nameEn: string;
  nameCkb: string;
  nameAr: string;
  region: 'Kurdistan' | 'Central' | 'Southern' | 'Northern' | 'Western';
  estimatedAudienceSize: number;
}

export interface IraqiPaymentGateway {
  id: PaymentGatewayType;
  name: string;
  descriptionEn: string;
  descriptionCkb: string;
  descriptionAr: string;
  currency: 'IQD' | 'USD';
  status: 'pending_commercial_agreement' | 'available_sandbox' | 'live';
  merchantLicensingRequired: string;
}

export interface TikTokApiConfigReport {
  apiVersion: string;
  documentationUrl: string;
  serverEndpointConfigured: boolean;
  hasAppId: boolean;
  hasAppSecret: boolean;
  hasAccessToken: boolean;
  hasAdAccountId: boolean;
  environment: 'sandbox' | 'production' | 'unconfigured';
  requiredScopes: string[];
  pendingRequirements: string[];
}

