import test from 'node:test';
import assert from 'node:assert/strict';
import {
  canTransitionStatus,
  validateCampaignBudget,
  validateCreativeSpecs,
  validateAudienceSelection,
  OFFICIAL_USD_TO_IQD_RATE,
  IRAQI_GOVERNORATES,
} from './rules.ts';

test('Iraqi governorates directory contains Kurdistan and federal Iraqi governorates', () => {
  const erbil = IRAQI_GOVERNORATES.find((g) => g.code === 'IQ-ER');
  assert.ok(erbil, 'Erbil must be in governorates list');
  assert.equal(erbil?.nameCkb, 'هەولێر');
  assert.equal(erbil?.region, 'Kurdistan');

  const baghdad = IRAQI_GOVERNORATES.find((g) => g.code === 'IQ-BG');
  assert.ok(baghdad, 'Baghdad must be in governorates list');
  assert.equal(baghdad?.nameAr, 'بغداد');
});

test('Campaign lifecycle transitions allow legitimate progression', () => {
  // Draft to awaiting_configuration
  const step1 = canTransitionStatus('draft', 'awaiting_configuration');
  assert.equal(step1.allowed, true);

  // Draft to pending_review
  const step2 = canTransitionStatus('draft', 'pending_review');
  assert.equal(step2.allowed, true);

  // Pending review to pending_approval
  const step3 = canTransitionStatus('pending_review', 'pending_approval');
  assert.equal(step3.allowed, true);

  // Pending approval to ready_to_submit
  const step4 = canTransitionStatus('pending_approval', 'ready_to_submit');
  assert.equal(step4.allowed, true);
});

test('Campaign lifecycle STRICTLY forbids submission or activation without live TikTok API', () => {
  // Ready to submit -> submitted_to_tiktok without API authorization
  const stepFail = canTransitionStatus('ready_to_submit', 'submitted_to_tiktok', {
    isTikTokApiAuthorized: false,
  });
  assert.equal(stepFail.allowed, false);
  assert.match(stepFail.reason || '', /TikTok Marketing API access is not configured/);

  // Ready to submit -> submitted_to_tiktok with verified API authorization
  const stepSuccess = canTransitionStatus('ready_to_submit', 'submitted_to_tiktok', {
    isTikTokApiAuthorized: true,
  });
  assert.equal(stepSuccess.allowed, true);

  // Submitted to TikTok -> active without API authorization
  const activeFail = canTransitionStatus('submitted_to_tiktok', 'active', {
    isTikTokApiAuthorized: false,
  });
  assert.equal(activeFail.allowed, false);
  assert.match(activeFail.reason || '', /TikTok Marketing API webhooks/);
});

test('Budget validation enforces TikTok daily minimum ($50 USD) and calculates IQD equivalent', () => {
  // Under minimum daily budget
  const underBudget = validateCampaignBudget(30, 'DAILY');
  assert.equal(underBudget.isValid, false);
  assert.match(underBudget.errors[0], /minimum daily campaign budget of \$50.00/);

  // Valid daily budget
  const validDaily = validateCampaignBudget(75, 'DAILY');
  assert.equal(validDaily.isValid, true);
  assert.equal(validDaily.errors.length, 0);
  assert.equal(validDaily.convertedIQD, 75 * OFFICIAL_USD_TO_IQD_RATE);

  // Lifetime minimum
  const underLifetime = validateCampaignBudget(80, 'LIFETIME');
  assert.equal(underLifetime.isValid, false);

  const validLifetime = validateCampaignBudget(150, 'LIFETIME');
  assert.equal(validLifetime.isValid, true);
});

test('Creative validator checks TikTok In-Feed ad specs (length, size, ad text, url)', () => {
  // Valid creative
  const valid = validateCreativeSpecs({
    durationSeconds: 12,
    fileSizeBytes: 15 * 1024 * 1024,
    aspectRatio: '9:16',
    adText: 'سەردانی ماڵپەڕی میکمیک سپۆنسەر بکە بۆ ڕیکلامی تیکتۆک',
    destinationUrl: 'https://mikmiksponsor.iq',
  });
  assert.equal(valid.isValid, true);
  assert.equal(valid.errors.length, 0);

  // Duration too short (< 5s)
  const tooShort = validateCreativeSpecs({
    durationSeconds: 3,
    fileSizeBytes: 10 * 1024 * 1024,
    aspectRatio: '9:16',
    adText: 'تێستی ڕیکلام',
    destinationUrl: 'https://example.com',
  });
  assert.equal(tooShort.isValid, false);
  assert.match(tooShort.errors[0], /duration must be at least 5 seconds/);

  // Text too long (> 100 chars)
  const longText = 'ا'.repeat(120);
  const textOverflow = validateCreativeSpecs({
    durationSeconds: 15,
    fileSizeBytes: 10 * 1024 * 1024,
    aspectRatio: '9:16',
    adText: longText,
    destinationUrl: 'https://example.com',
  });
  assert.equal(textOverflow.isValid, false);
  assert.match(textOverflow.errors[0], /cannot exceed 100 characters/);
});

test('Audience targeting validates location codes', () => {
  const validAudience = validateAudienceSelection({
    locations: ['IQ-ER', 'IQ-SU', 'IQ-BG'],
    languages: ['ckb', 'ar'],
    ageRanges: ['18-24', '25-34'],
  });
  assert.equal(validAudience.isValid, true);

  const invalidAudience = validateAudienceSelection({
    locations: ['INVALID-CODE'],
    languages: ['ckb'],
    ageRanges: ['18-24'],
  });
  assert.equal(invalidAudience.isValid, false);
  assert.match(invalidAudience.errors[0], /Invalid location code/);
});
