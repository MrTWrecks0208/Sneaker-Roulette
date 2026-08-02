import { safeLocalStorage } from './utils';

export type SubscriptionTier = 'free' | 'pro' | 'premium';
export type BillingCycle = 'monthly' | 'yearly';

export interface TierConfig {
  id: SubscriptionTier;
  name: string;
  badge: string;
  subtitle: string;
  monthlyPrice: number;
  yearlyPrice: number; // total per year
  maxPairs: number;
  maxImagesPerCard: number;
  lastWornAllowed: boolean;
  importAllowed: boolean;
  maxSpinsPerDay: number;
  features: { text: string; included: boolean }[];
  highlight?: boolean;
  tag?: string;
}

export const TIER_CONFIGS: Record<SubscriptionTier, TierConfig> = {
  free: {
    id: 'free',
    name: 'Free',
    badge: 'Hobbyist',
    subtitle: 'Essential features for casual collectors starting out.',
    monthlyPrice: 0,
    yearlyPrice: 0,
    maxPairs: 10,
    maxImagesPerCard: 1,
    lastWornAllowed: false,
    importAllowed: false,
    maxSpinsPerDay: 3,
    features: [
      { text: 'Add up to 10 pairs', included: true },
      { text: '1 image per card', included: true },
      { text: '3 wheel spins max per day', included: true },
      { text: 'No \'Last Worn\' field', included: false },
      { text: 'No batch Import (CSV/JSON/XLSX)', included: false },
    ],
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    badge: 'Enthusiast',
    subtitle: 'Designed for active sneaker lovers with growing closets.',
    monthlyPrice: 5,
    yearlyPrice: 50,
    maxPairs: 30,
    maxImagesPerCard: 3,
    lastWornAllowed: true,
    importAllowed: true,
    maxSpinsPerDay: 10,
    highlight: true,
    tag: 'MOST POPULAR',
    features: [
      { text: 'Add up to 30 pairs', included: true },
      { text: 'Up to 3 images per card', included: true },
      { text: '10 wheel spins max per day', included: true },
      { text: '\'Last Worn\' date tracking field', included: true },
      { text: 'Batch Import (CSV, JSON, XLSX)', included: true },
    ],
  },
  premium: {
    id: 'premium',
    name: 'Premium',
    badge: 'Sneakerhead',
    subtitle: 'The ultimate experience for master sneaker collectors.',
    monthlyPrice: 10,
    yearlyPrice: 100,
    maxPairs: Infinity,
    maxImagesPerCard: Infinity,
    lastWornAllowed: true,
    importAllowed: true,
    maxSpinsPerDay: Infinity,
    tag: 'BEST VALUE',
    features: [
      { text: 'Unlimited pairs in collection', included: true },
      { text: 'Unlimited images per card', included: true },
      { text: 'Unlimited wheel spins per day', included: true },
      { text: 'All data fields (\'Last Worn\', etc.)', included: true },
      { text: 'Batch Import (CSV, JSON, XLSX)', included: true },
      { text: 'VIP Sneakerhead Badge', included: true },
    ],
  },
};

const STORAGE_KEY_TIER = 'sneaker_subscription_tier';
const STORAGE_KEY_SPINS_PREFIX = 'sneaker_daily_spins_';

export function getSubscriptionTier(): SubscriptionTier {
  const saved = safeLocalStorage.getItem(STORAGE_KEY_TIER);
  if (saved === 'pro' || saved === 'premium' || saved === 'free') {
    return saved;
  }
  return 'free';
}

export function setSubscriptionTier(tier: SubscriptionTier): void {
  safeLocalStorage.setItem(STORAGE_KEY_TIER, tier);
  window.dispatchEvent(new Event('subscription-updated'));
}

export function getTodayDateString(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

export function getDailySpinCount(): number {
  const today = getTodayDateString();
  const val = safeLocalStorage.getItem(STORAGE_KEY_SPINS_PREFIX + today);
  if (val) {
    const num = parseInt(val, 10);
    if (!isNaN(num)) return num;
  }
  return 0;
}

export function incrementDailySpinCount(): number {
  const today = getTodayDateString();
  const current = getDailySpinCount();
  const next = current + 1;
  safeLocalStorage.setItem(STORAGE_KEY_SPINS_PREFIX + today, next.toString());
  window.dispatchEvent(new Event('spins-updated'));
  return next;
}

export function canSpin(tier: SubscriptionTier): { allowed: boolean; remaining: number; max: number } {
  const max = TIER_CONFIGS[tier].maxSpinsPerDay;
  if (max === Infinity) {
    return { allowed: true, remaining: Infinity, max: Infinity };
  }
  const count = getDailySpinCount();
  const remaining = Math.max(0, max - count);
  return { allowed: count < max, remaining, max };
}

export function canAddPair(currentCount: number, tier: SubscriptionTier): { allowed: boolean; max: number } {
  const max = TIER_CONFIGS[tier].maxPairs;
  if (max === Infinity) return { allowed: true, max: Infinity };
  return { allowed: currentCount < max, max };
}

export function canImport(tier: SubscriptionTier): boolean {
  return TIER_CONFIGS[tier].importAllowed;
}

export function canUseLastWorn(tier: SubscriptionTier): boolean {
  return TIER_CONFIGS[tier].lastWornAllowed;
}

export function getMaxImages(tier: SubscriptionTier): number {
  return TIER_CONFIGS[tier].maxImagesPerCard;
}
