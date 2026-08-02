import { useState, useEffect, useCallback } from 'react';
import {
  SubscriptionTier,
  getSubscriptionTier,
  setSubscriptionTier,
  getDailySpinCount,
  canSpin,
  canAddPair,
  canImport,
  canUseLastWorn,
  getMaxImages,
  TIER_CONFIGS,
} from '../lib/subscription';

export function useSubscription() {
  const [tier, setTierState] = useState<SubscriptionTier>(getSubscriptionTier);
  const [spinCount, setSpinCount] = useState<number>(getDailySpinCount);

  useEffect(() => {
    const handleUpdate = () => {
      setTierState(getSubscriptionTier());
      setSpinCount(getDailySpinCount());
    };

    window.addEventListener('subscription-updated', handleUpdate);
    window.addEventListener('spins-updated', handleUpdate);
    return () => {
      window.removeEventListener('subscription-updated', handleUpdate);
      window.removeEventListener('spins-updated', handleUpdate);
    };
  }, []);

  const changeTier = useCallback((newTier: SubscriptionTier) => {
    setSubscriptionTier(newTier);
    setTierState(newTier);
  }, []);

  const spinStatus = canSpin(tier);
  const config = TIER_CONFIGS[tier];

  return {
    tier,
    config,
    changeTier,
    spinCount,
    spinStatus,
    checkAddPairAllowed: (currentCount: number) => canAddPair(currentCount, tier),
    isImportAllowed: canImport(tier),
    isLastWornAllowed: canUseLastWorn(tier),
    maxImages: getMaxImages(tier),
  };
}
