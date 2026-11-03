import type { CampaignStatus, IraqiGovernorate } from '../types/index.ts';

/**
 * Iraqi Governorates with official ISO codes, Kurdish/Arabic/English names,
 * and estimated digital audience demographics in Iraq & Kurdistan.
 */
export const IRAQI_GOVERNORATES: IraqiGovernorate[] = [
  { code: 'IQ-ER', nameEn: 'Erbil (Hawler)', nameCkb: 'هەولێر', nameAr: 'أربيل', region: 'Kurdistan', estimatedAudienceSize: 1850000 },
  { code: 'IQ-SU', nameEn: 'Sulaymaniyah', nameCkb: 'سلێمانی', nameAr: 'السليمانية', region: 'Kurdistan', estimatedAudienceSize: 1720000 },
  { code: 'IQ-DH', nameEn: 'Duhok', nameCkb: 'دهۆک', nameAr: 'دهوك', region: 'Kurdistan', estimatedAudienceSize: 950000 },
  { code: 'IQ-BG', nameEn: 'Baghdad', nameCkb: 'بەغدا', nameAr: 'بغداد', region: 'Central', estimatedAudienceSize: 5200000 },
  { code: 'IQ-BA', nameEn: 'Basra', nameCkb: 'بەسرە', nameAr: 'البصرة', region: 'Southern', estimatedAudienceSize: 2100000 },
  { code: 'IQ-NI', nameEn: 'Nineveh (Mosul)', nameCkb: 'نەینەوا (موسڵ)', nameAr: 'نينوى (الموصل)', region: 'Northern', estimatedAudienceSize: 2300000 },
  { code: 'IQ-KI', nameEn: 'Kirkuk', nameCkb: 'کەرکووک', nameAr: 'كركوك', region: 'Northern', estimatedAudienceSize: 1100000 },
  { code: 'IQ-NA', nameEn: 'Najaf', nameCkb: 'نەجەف', nameAr: 'النجف', region: 'Southern', estimatedAudienceSize: 1050000 },
  { code: 'IQ-KA', nameEn: 'Karbala', nameCkb: 'کەربەلا', nameAr: 'كربلاء', region: 'Central', estimatedAudienceSize: 920000 },
  { code: 'IQ-AN', nameEn: 'Anbar', nameCkb: 'ئەنبار', nameAr: 'الأنبار', region: 'Western', estimatedAudienceSize: 1150000 },
  { code: 'IQ-BB', nameEn: 'Babil (Hilla)', nameCkb: 'بابل (حلە)', nameAr: 'بابل (الحلة)', region: 'Central', estimatedAudienceSize: 1300000 },
  { code: 'IQ-DI', nameEn: 'Diyala', nameCkb: 'دیالە', nameAr: 'ديالى', region: 'Central', estimatedAudienceSize: 1020000 },
  { code: 'IQ-WA', nameEn: 'Wasit (Kut)', nameCkb: 'واسیت (کوت)', nameAr: 'واسط (الكوت)', region: 'Central', estimatedAudienceSize: 840000 },
  { code: 'IQ-MA', nameEn: 'Maysan (Amara)', nameCkb: 'مەیسان (عمارە)', nameAr: 'ميسان (العمارة)', region: 'Southern', estimatedAudienceSize: 760000 },
  { code: 'IQ-DQ', nameEn: 'Dhi Qar (Nasiriyah)', nameCkb: 'زیقار (ناصریە)', nameAr: 'ذي قار (الناصرية)', region: 'Southern', estimatedAudienceSize: 1250000 },
  { code: 'IQ-MU', nameEn: 'Muthanna (Samawah)', nameCkb: 'موسەننا (سەماوە)', nameAr: 'المثنى (السماوة)', region: 'Southern', estimatedAudienceSize: 580000 },
  { code: 'IQ-QA', nameEn: 'Al-Qadisiyyah (Diwaniyah)', nameCkb: 'قادسیە (دیوانیە)', nameAr: 'القادسية (الديوانية)', region: 'Southern', estimatedAudienceSize: 820000 },
  { code: 'IQ-SD', nameEn: 'Saladin (Tikrit)', nameCkb: 'سەڵاحەددین (تکریت)', nameAr: 'صلاح الدين (تكريت)', region: 'Northern', estimatedAudienceSize: 980000 },
  { code: 'IQ-HL', nameEn: 'Halabja', nameCkb: 'هەڵەبجە', nameAr: 'حلبجة', region: 'Kurdistan', estimatedAudienceSize: 220000 },
];

/**
 * Standard USD to IQD exchange rate reference (Official CBI reference)
 */
export const OFFICIAL_USD_TO_IQD_RATE = 1310;

/**
 * Allowed lifecycle transitions for MikMik Sponsor campaigns.
 * Notice: A campaign CANNOT enter 'submitted_to_tiktok' or 'active' unless explicitly
 * authorized and confirmed by a trusted backend with live TikTok API access.
 */
export const ALLOWED_TRANSITIONS: Record<CampaignStatus, CampaignStatus[]> = {
  draft: ['awaiting_configuration', 'pending_review'],
  awaiting_configuration: ['draft', 'pending_review'],
  pending_review: ['draft', 'pending_approval', 'rejected'],
  pending_approval: ['ready_to_submit', 'rejected', 'draft'],
  ready_to_submit: ['submitted_to_tiktok', 'paused', 'draft'],
  submitted_to_tiktok: ['active', 'rejected', 'failed'],
  active: ['paused', 'completed', 'failed'],
  paused: ['active', 'completed'],
  rejected: ['draft'],
  completed: [],
  failed: ['draft', 'ready_to_submit'],
};

/**
 * Validates whether a state transition is permitted.
 */
export function canTransitionStatus(
  currentStatus: CampaignStatus,
  newStatus: CampaignStatus,
  options?: { isTikTokApiAuthorized?: boolean; isReviewPassed?: boolean }
): { allowed: boolean; reason?: string } {
  const allowedNext = ALLOWED_TRANSITIONS[currentStatus] || [];
  if (!allowedNext.includes(newStatus)) {
    return {
      allowed: false,
      reason: `Transition from '${currentStatus}' to '${newStatus}' is not permitted by campaign lifecycle rules.`,
    };
  }

  // Strict Honesty Gate: Cannot transition to submitted_to_tiktok or active without live API
  if (newStatus === 'submitted_to_tiktok') {
    if (!options?.isTikTokApiAuthorized) {
      return {
        allowed: false,
        reason:
          'Cannot submit campaign to TikTok: Official TikTok Marketing API access is not configured or authorized in this environment.',
      };
    }
  }

  if (newStatus === 'active') {
    if (!options?.isTikTokApiAuthorized) {
      return {
        allowed: false,
        reason:
          'Cannot activate ad campaign: Delivery must be confirmed by TikTok Marketing API webhooks.',
      };
    }
  }

  return { allowed: true };
}

/**
 * TikTok Marketing API budget validation requirements
 * Per TikTok documentation: Daily campaign budget minimum is $50.00 USD.
 * Adgroup minimum daily budget is $20.00 USD.
 */
export function validateCampaignBudget(budgetUSD: number, budgetType: 'DAILY' | 'LIFETIME'): {
  isValid: boolean;
  errors: string[];
  convertedIQD: number;
} {
  const errors: string[] = [];
  const minDailyBudgetUSD = 50.0;
  const minLifetimeBudgetUSD = 100.0;

  if (typeof budgetUSD !== 'number' || isNaN(budgetUSD) || budgetUSD <= 0) {
    errors.push('Budget must be a positive number.');
  } else {
    if (budgetType === 'DAILY' && budgetUSD < minDailyBudgetUSD) {
      errors.push(
        `TikTok Marketing API requires a minimum daily campaign budget of $${minDailyBudgetUSD.toFixed(2)} USD.`
      );
    }
    if (budgetType === 'LIFETIME' && budgetUSD < minLifetimeBudgetUSD) {
      errors.push(
        `TikTok Marketing API requires a minimum lifetime budget of $${minLifetimeBudgetUSD.toFixed(2)} USD.`
      );
    }
  }

  const convertedIQD = Math.round((budgetUSD || 0) * OFFICIAL_USD_TO_IQD_RATE);

  return {
    isValid: errors.length === 0,
    errors,
    convertedIQD,
  };
}

/**
 * TikTok Video Creative specifications validator
 * Per TikTok In-Feed Ads specs:
 * - Aspect Ratio: 9:16 (preferred: 1080x1920), 1:1, or 16:9
 * - Duration: 5s to 60s (9s to 15s recommended for engagement)
 * - Max File Size: 500 MB (524,288,000 bytes)
 * - Ad Text: Max 100 characters for In-Feed Ad text
 */
export function validateCreativeSpecs(creative: {
  durationSeconds: number;
  fileSizeBytes: number;
  aspectRatio: string;
  adText: string;
  destinationUrl?: string;
}): { isValid: boolean; errors: string[]; warnings: string[] } {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Duration
  if (creative.durationSeconds < 5) {
    errors.push('Video duration must be at least 5 seconds.');
  } else if (creative.durationSeconds > 60) {
    errors.push('Video duration cannot exceed 60 seconds for In-Feed Ads.');
  } else if (creative.durationSeconds > 15) {
    warnings.push('TikTok recommends 9 to 15 seconds video length for optimal viewer retention.');
  }

  // File size
  const maxBytes = 500 * 1024 * 1024; // 500MB
  if (creative.fileSizeBytes > maxBytes) {
    errors.push('Video file size exceeds TikTok maximum limit of 500 MB.');
  }

  // Aspect ratio
  if (creative.aspectRatio !== '9:16') {
    warnings.push('Vertical (9:16) format is strongly recommended for native TikTok In-Feed Ads.');
  }

  // Ad text length
  if (!creative.adText || creative.adText.trim().length === 0) {
    errors.push('Ad text is required.');
  } else if (creative.adText.length > 100) {
    errors.push(`Ad text cannot exceed 100 characters (currently ${creative.adText.length} characters).`);
  }

  // Destination URL
  if (creative.destinationUrl) {
    try {
      const parsed = new URL(creative.destinationUrl);
      if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
        errors.push('Destination URL must start with http:// or https://');
      }
    } catch {
      errors.push('Destination URL is not a valid web URL format.');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Validates audience selection for Iraq and Kurdistan
 */
export function validateAudienceSelection(audience: {
  locations: string[];
  languages: string[];
  ageRanges: string[];
}): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!audience.locations || audience.locations.length === 0) {
    errors.push('At least one location in Iraq or Kurdistan must be selected.');
  } else {
    const validCodes = new Set(IRAQI_GOVERNORATES.map((g) => g.code));
    for (const code of audience.locations) {
      if (!validCodes.has(code)) {
        errors.push(`Invalid location code: ${code}`);
      }
    }
  }

  if (!audience.languages || audience.languages.length === 0) {
    errors.push('At least one target language must be selected.');
  }

  if (!audience.ageRanges || audience.ageRanges.length === 0) {
    errors.push('At least one target age range must be selected.');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}
