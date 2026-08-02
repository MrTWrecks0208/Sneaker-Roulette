import { useState } from 'react';
import {
  SubscriptionTier,
  BillingCycle,
  TIER_CONFIGS,
  getSubscriptionTier,
  setSubscriptionTier,
} from '../lib/subscription';
import {
  X,
  Check,
  Sparkles,
  Crown,
  Zap,
  Lock,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  promptReason?: string | null;
  onSuccessToast?: (msg: string) => void;
}

export default function SubscriptionModal({
  isOpen,
  onClose,
  promptReason,
  onSuccessToast,
}: SubscriptionModalProps) {
  const [currentTier, setCurrentTier] = useState<SubscriptionTier>(getSubscriptionTier);
  const [billingCycle, setBillingCycle] = useState<BillingCycle>('monthly');
  const [submittingTier, setSubmittingTier] = useState<SubscriptionTier | null>(null);

  if (!isOpen) return null;

  const handleSelectTier = (tier: SubscriptionTier) => {
    if (tier === currentTier) return;
    setSubmittingTier(tier);

    setTimeout(() => {
      setSubscriptionTier(tier);
      setCurrentTier(tier);
      setSubmittingTier(null);

      const targetConfig = TIER_CONFIGS[tier];
      const msg = `Successfully upgraded to ${targetConfig.name} (${targetConfig.badge}) Plan! 🎉`;
      if (onSuccessToast) {
        onSuccessToast(msg);
      }
      onClose();
    }, 400);
  };

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-5 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-5xl bg-zinc-950 border border-zinc-800/90 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden my-auto text-zinc-100 flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Subtle Ambient Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-32 bg-blue-600/15 blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="relative z-10 flex items-center justify-between p-5 sm:p-6 border-b border-zinc-800/80 bg-zinc-900/60 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/30 rounded-2xl text-blue-400 shadow-inner">
              <Crown className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
                Sneaker Roulette Membership
              </h2>
              <p className="text-xs sm:text-sm text-zinc-400">
                Unlock higher limits, image galleries, bulk import, and unlimited spins
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-white bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-xl transition-colors cursor-pointer"
            title="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Upgrade Prompt Banner if triggered by a limit */}
        {promptReason && (
          <div className="mx-5 sm:mx-6 mt-4 p-3.5 bg-blue-500/10 border border-blue-500/30 rounded-xl flex items-center gap-3 text-xs sm:text-sm text-blue-300 animate-in fade-in slide-in-from-top-2 duration-300">
            <Sparkles className="w-5 h-5 text-blue-400 shrink-0" />
            <span className="font-medium">{promptReason}</span>
          </div>
        )}

        {/* Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1">
          {/* Monthly / Yearly Billing Toggle */}
          <div className="flex flex-col items-center justify-center gap-2">
            <div className="inline-flex items-center bg-zinc-900/90 border border-zinc-800 p-1.5 rounded-2xl gap-1 shadow-inner">
              <button
                type="button"
                onClick={() => setBillingCycle('monthly')}
                className={`px-5 py-2 text-xs sm:text-sm font-bold rounded-xl transition-all duration-200 cursor-pointer ${
                  billingCycle === 'monthly'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                Monthly Billing
              </button>

              <button
                type="button"
                onClick={() => setBillingCycle('yearly')}
                className={`px-5 py-2 text-xs sm:text-sm font-bold rounded-xl transition-all duration-200 cursor-pointer flex items-center gap-1.5 ${
                  billingCycle === 'yearly'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <span>Yearly Billing</span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-1.5 py-0.5 rounded-md font-extrabold uppercase">
                  Save ~17%
                </span>
              </button>
            </div>
            <p className="text-[11px] text-zinc-500 font-medium">
              {billingCycle === 'yearly' ? '⚡ Billed annually — Enjoy 2 months free per year!' : 'Switch to yearly billing to save up to $20/year'}
            </p>
          </div>

          {/* Pricing Cards Grid with 3D Card Flip */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {(['free', 'pro', 'premium'] as SubscriptionTier[]).map((tierKey) => {
              const tier = TIER_CONFIGS[tierKey];
              const isCurrent = currentTier === tierKey;
              const isFlipped = billingCycle === 'yearly';

              return (
                <div
                  key={tierKey}
                  className="perspective-[1000px] min-h-[460px] sm:min-h-[490px] flex flex-col"
                >
                  {/* Flip Container */}
                  <div
                    className={`relative w-full h-full transition-transform duration-700 [transform-style:preserve-3d] ${
                      isFlipped ? '[transform:rotateY(180deg)]' : ''
                    }`}
                  >
                    {/* FRONT FACE (Monthly) */}
                    <CardFace
                      tier={tier}
                      billingCycle="monthly"
                      isCurrent={isCurrent}
                      isSubmitting={submittingTier === tierKey}
                      onSelect={() => handleSelectTier(tierKey)}
                    />

                    {/* BACK FACE (Yearly - 180 deg turned) */}
                    <CardFace
                      tier={tier}
                      billingCycle="yearly"
                      isCurrent={isCurrent}
                      isSubmitting={submittingTier === tierKey}
                      onSelect={() => handleSelectTier(tierKey)}
                      isBackFace
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-zinc-800 bg-zinc-950/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-zinc-400">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Instant activation. Switch or downgrade plans at any time in settings.</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-semibold rounded-xl transition-colors cursor-pointer w-full sm:w-auto"
          >
            Keep Current Plan
          </button>
        </div>
      </div>
    </div>
  );
}

interface CardFaceProps {
  tier: typeof TIER_CONFIGS['free'];
  billingCycle: BillingCycle;
  isCurrent: boolean;
  isSubmitting: boolean;
  onSelect: () => void;
  isBackFace?: boolean;
}

function CardFace({
  tier,
  billingCycle,
  isCurrent,
  isSubmitting,
  onSelect,
  isBackFace = false,
}: CardFaceProps) {
  const isYearly = billingCycle === 'yearly';
  const price = isYearly ? tier.yearlyPrice : tier.monthlyPrice;
  const monthlyBreakdown = isYearly && tier.yearlyPrice > 0 ? (tier.yearlyPrice / 12).toFixed(2) : null;

  return (
    <div
      className={`absolute inset-0 w-full h-full rounded-2xl p-5 sm:p-6 flex flex-col justify-between border transition-all duration-300 [backface-visibility:hidden] ${
        isBackFace ? '[transform:rotateY(180deg)]' : ''
      } ${
        isCurrent
          ? 'bg-zinc-900/90 border-blue-500/70 ring-2 ring-blue-500/20 shadow-xl'
          : tier.highlight
          ? 'bg-zinc-900/80 border-purple-500/50 shadow-lg hover:border-purple-500/80'
          : 'bg-zinc-900/40 border-zinc-800 hover:border-zinc-700'
      }`}
    >
      <div>
        {/* Top Tag Badges */}
        <div className="flex items-center justify-between mb-3 min-h-[26px]">
          <span className="text-[11px] font-extrabold uppercase tracking-widest px-2.5 py-1 rounded-md bg-zinc-800 text-zinc-300 border border-zinc-700">
            {tier.badge}
          </span>

          {tier.tag && (
            <span
              className={`text-[10px] font-black uppercase tracking-wider px-2 py-1 rounded-md border flex items-center gap-1 ${
                tier.highlight
                  ? 'bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-blue-300 border-blue-500/40'
                  : 'bg-amber-500/10 text-amber-300 border-amber-500/30'
              }`}
            >
              <Zap className="w-3 h-3 text-amber-400" />
              {tier.tag}
            </span>
          )}
          {isCurrent && (
            <span className="text-[10px] font-black uppercase tracking-wider px-2 py-1 rounded-md bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
              Active Plan
            </span>
          )}
        </div>

        {/* Plan Title & Subtitle */}
        <h3 className="text-xl font-bold text-white tracking-tight">{tier.name}</h3>
        <p className="text-xs text-zinc-400 mt-1 min-h-[32px] leading-relaxed">
          {tier.subtitle}
        </p>

        {/* Price Display */}
        <div className="my-4 py-3 border-y border-zinc-800/80">
          <div className="flex items-baseline gap-1">
            <span className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              ${price}
            </span>
            <span className="text-xs font-semibold text-zinc-400">
              {price === 0 ? '' : isYearly ? '/year' : '/month'}
            </span>
          </div>

          {monthlyBreakdown ? (
            <p className="text-[11px] text-emerald-400 font-medium mt-1">
              Equivalent to ~${monthlyBreakdown}/mo (Billed annually)
            </p>
          ) : isYearly && price === 0 ? (
            <p className="text-[11px] text-zinc-500 font-medium mt-1">Free forever</p>
          ) : (
            <p className="text-[11px] text-zinc-500 font-medium mt-1">Billed monthly</p>
          )}
        </div>

        {/* Features List */}
        <div className="space-y-2.5 my-2">
          {tier.features.map((feat, idx) => (
            <div key={idx} className="flex items-start gap-2.5 text-xs">
              {feat.included ? (
                <div className="p-0.5 rounded-full bg-emerald-500/15 text-emerald-400 shrink-0 mt-0.5">
                  <Check className="w-3.5 h-3.5" />
                </div>
              ) : (
                <div className="p-0.5 rounded-full bg-zinc-800 text-zinc-500 shrink-0 mt-0.5">
                  <Lock className="w-3.5 h-3.5" />
                </div>
              )}
              <span
                className={
                  feat.included
                    ? 'text-zinc-200 font-medium'
                    : 'text-zinc-500 line-through'
                }
              >
                {feat.text}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Action / Purchase Button */}
      <div className="mt-5 pt-3 border-t border-zinc-800/60">
        <button
          type="button"
          onClick={onSelect}
          disabled={isCurrent || isSubmitting}
          className={`w-full py-2.5 sm:py-3 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 ${
            isCurrent
              ? 'bg-zinc-800/80 text-zinc-400 border border-zinc-700 cursor-default opacity-80'
              : tier.highlight
              ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white shadow-lg shadow-blue-500/20'
              : 'bg-zinc-800 hover:bg-zinc-700 text-white border border-zinc-700'
          }`}
        >
          {isSubmitting ? (
            <span>Updating Plan...</span>
          ) : isCurrent ? (
            <span className="flex items-center gap-1.5 text-emerald-400">
              <Check className="w-4 h-4" /> Current Plan
            </span>
          ) : (
            <span className="flex items-center gap-1">
              Select {tier.name} ({tier.badge}) <ArrowRight className="w-4 h-4" />
            </span>
          )}
        </button>
      </div>
    </div>
  );
}
