import React, { useState, useEffect } from 'react';
import {
  User as UserIcon,
  Crown,
  Sliders,
  Bell,
  Lock,
  Info,
  X,
  Camera,
  Pencil,
  Check,
  AlertCircle,
  Footprints,
  Calendar,
  Sparkles,
  Flame,
  Upload,
  Trash2,
  ChevronRight,
  Zap,
  ArrowRight,
  CheckCircle2,
  Moon,
  Sun,
  Laptop
} from 'lucide-react';
import { User } from '@supabase/supabase-js';
import { Sneaker, BRANDS } from '../lib/supabase';
import { SubscriptionTier, TIER_CONFIGS, setSubscriptionTier } from '../lib/subscription';
import { safeLocalStorage } from '../lib/utils';

export interface UserPreferences {
  defaultRouletteFilter: string;
  excludeRecentlyWorn: string;
  favoriteBrands: string[];
  defaultSort: string;
  theme: 'Dark' | 'Light' | 'System';
}

export const DEFAULT_PREFERENCES: UserPreferences = {
  defaultRouletteFilter: 'All Sneakers',
  excludeRecentlyWorn: 'Last 3 days',
  favoriteBrands: ['Nike', 'Jordan', 'Adidas'],
  defaultSort: 'created_at-desc',
  theme: 'Dark',
};

const AVATAR_PRESETS = [
  { id: '1', label: 'Sneaker Robot', url: 'https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&q=80&w=250' },
  { id: '2', label: 'Cyber Kicks', url: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&q=80&w=250' },
  { id: '3', label: 'Retro High', url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=250' },
  { id: '4', label: 'Urban Runner', url: 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&q=80&w=250' },
  { id: '5', label: 'Minimalist White', url: 'https://images.unsplash.com/photo-1560769629-975ec94e6a86?auto=format&fit=crop&q=80&w=250' },
  { id: '6', label: 'Streetwear Icon', url: 'https://images.unsplash.com/photo-1512374382149-233c42b6a83b?auto=format&fit=crop&q=80&w=250' },
];

export const SORT_OPTIONS = [
  { value: 'created_at-desc', label: 'Newest First' },
  { value: 'created_at-asc', label: 'Oldest First' },
  { value: 'worn-desc', label: 'Most Worn' },
  { value: 'worn-asc', label: 'Least Worn' },
  { value: 'brand-asc', label: 'Brand (A-Z)' },
  { value: 'brand-desc', label: 'Brand (Z-A)' },
  { value: 'style-asc', label: 'Style (A-Z)' },
] as const;

export const ROULETTE_FILTERS = [
  'All Sneakers',
  'Favorites Only',
  'Unworn Only',
  'High Value',
  'Daily Rotation',
] as const;

export const RECENTLY_WORN_OPTIONS = [
  'Last 3 days',
  'Last Week',
  'Last 2 weeks',
  'Last Month',
  'Off',
] as const;

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  sneakers: Sneaker[];
  tier: SubscriptionTier;
  onChangeTier: (newTier: SubscriptionTier) => void;
  onSaveProfile: (data: { username: string; avatarUrl: string; email: string }) => Promise<void> | void;
  onSavePreferences: (prefs: UserPreferences) => void;
  initialPreferences?: UserPreferences;
  onShowToast?: (message: string, type: 'success' | 'error') => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  user,
  sneakers,
  tier,
  onChangeTier,
  onSaveProfile,
  onSavePreferences,
  initialPreferences = DEFAULT_PREFERENCES,
  onShowToast,
}) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'subscription' | 'preferences' | 'notifications' | 'security' | 'about'>('profile');

  // Profile Form State
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [isDraggingAvatar, setIsDraggingAvatar] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Preferences State
  const [preferences, setPreferences] = useState<UserPreferences>(initialPreferences);
  const [brandSearch, setBrandSearch] = useState('');
  const [isBrandDropdownOpen, setIsBrandDropdownOpen] = useState(false);

  // Billing interval state for subscription tab
  const [billingInterval, setBillingInterval] = useState<'monthly' | 'yearly'>('monthly');

  // Sync state on open
  useEffect(() => {
    if (isOpen && user) {
      setUsername(user.user_metadata?.username || user.user_metadata?.full_name || user.email?.split('@')[0] || 'KickCollector23');
      setEmail(user.email || 'kickcollector23@email.com');
      setAvatarUrl(user.user_metadata?.avatar_url || '');
      
      // Load saved preferences from localStorage if exists
      const saved = safeLocalStorage.getItem('sneaker_user_preferences');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setPreferences({ ...DEFAULT_PREFERENCES, ...parsed });
        } catch {
          setPreferences(initialPreferences);
        }
      } else {
        setPreferences(initialPreferences);
      }
    }
  }, [isOpen, user, initialPreferences]);

  if (!isOpen) return null;

  // Calculate statistics
  const totalSneakers = sneakers.length;
  const totalWears = sneakers.reduce((acc, curr) => acc + (Number(curr.worn) || 0), 0);
  
  // Suggested Wears / Roulette Wins stored in localStorage or default count
  const savedRouletteWins = Number(safeLocalStorage.getItem('roulette_wins_count') || '23');

  // Handle Photo upload
  const processAvatarFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      onShowToast?.('Please upload a valid image file.', 'error');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      onShowToast?.('Image file size must be under 10MB.', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const size = 300;
        canvas.width = size;
        canvas.height = size;

        if (ctx) {
          const minDim = Math.min(img.width, img.height);
          const sx = (img.width - minDim) / 2;
          const sy = (img.height - minDim) / 2;
          ctx.drawImage(img, sx, sy, minDim, minDim, 0, 0, size, size);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.90);
          setAvatarUrl(dataUrl);
          onShowToast?.('Photo selected! Click "Save Changes" to apply.', 'success');
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleAvatarFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processAvatarFile(file);
  };

  const handleToggleBrand = (brand: string) => {
    setPreferences(prev => {
      const current = prev.favoriteBrands || [];
      if (brand === 'ALL') {
        return { ...prev, favoriteBrands: ['ALL'] };
      }
      const withoutAll = current.filter(b => b !== 'ALL');
      if (withoutAll.includes(brand)) {
        const next = withoutAll.filter(b => b !== brand);
        return { ...prev, favoriteBrands: next.length === 0 ? ['ALL'] : next };
      } else {
        return { ...prev, favoriteBrands: [...withoutAll, brand] };
      }
    });
  };

  const handleSaveAll = async () => {
    setIsSaving(true);
    try {
      // 1. Save Profile
      await onSaveProfile({ username, avatarUrl, email });

      // 2. Save Preferences
      safeLocalStorage.setItem('sneaker_user_preferences', JSON.stringify(preferences));
      onSavePreferences(preferences);

      onShowToast?.('Settings updated successfully!', 'success');
      onClose();
    } catch (err) {
      console.error(err);
      onShowToast?.('Failed to save settings. Please try again.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // Formatted creation date
  const memberSince = user?.created_at
    ? new Date(user.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : 'May 12, 2024';

  const filteredBrandList = BRANDS.filter(b => b.toLowerCase().includes(brandSearch.toLowerCase()));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-zinc-950 border border-zinc-800/90 rounded-3xl w-full max-w-4xl h-[90vh] max-h-[760px] shadow-2xl flex overflow-hidden animate-in zoom-in-95 duration-150 text-zinc-100">
        
        {/* LEFT SIDEBAR MENU */}
        <aside className="w-48 sm:w-56 shrink-0 bg-zinc-900/90 border-r border-zinc-800 flex flex-col justify-between p-3 sm:p-4 select-none">
          <div className="space-y-6">
            {/* Branding Header */}
            <div className="flex items-center gap-2.5 px-2 pt-1">
              <div className="p-2 bg-zinc-800 rounded-xl border border-zinc-700/60 text-zinc-200 shadow-sm">
                <Footprints className="w-5 h-5 text-white" />
              </div>
              <span className="font-extrabold text-xs tracking-wider text-white uppercase hidden sm:inline">
                KICK LOCKER
              </span>
            </div>

            {/* Navigation Tabs */}
            <nav className="space-y-1">
              <button
                type="button"
                onClick={() => setActiveTab('profile')}
                className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-2xl text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === 'profile'
                    ? 'bg-zinc-800 text-white shadow-md border border-zinc-700/60'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
                }`}
              >
                <UserIcon className="w-4 h-4 shrink-0" />
                <span>Profile</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('subscription')}
                className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-2xl text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === 'subscription'
                    ? 'bg-zinc-800 text-white shadow-md border border-zinc-700/60'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
                }`}
              >
                <Crown className="w-4 h-4 shrink-0 text-amber-400" />
                <span>Subscription</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('preferences')}
                className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-2xl text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === 'preferences'
                    ? 'bg-zinc-800 text-white shadow-md border border-zinc-700/60'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
                }`}
              >
                <Sliders className="w-4 h-4 shrink-0" />
                <span>Preferences</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('notifications')}
                className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-2xl text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === 'notifications'
                    ? 'bg-zinc-800 text-white shadow-md border border-zinc-700/60'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
                }`}
              >
                <Bell className="w-4 h-4 shrink-0 opacity-70" />
                <span>Notifications</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('security')}
                className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-2xl text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === 'security'
                    ? 'bg-zinc-800 text-white shadow-md border border-zinc-700/60'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
                }`}
              >
                <Lock className="w-4 h-4 shrink-0 opacity-70" />
                <span>Security</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('about')}
                className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-2xl text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === 'about'
                    ? 'bg-zinc-800 text-white shadow-md border border-zinc-700/60'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
                }`}
              >
                <Info className="w-4 h-4 shrink-0 opacity-70" />
                <span>About</span>
              </button>
            </nav>
          </div>

          {/* User Badge Footer */}
          <div className="pt-3 border-t border-zinc-800/80 px-2 text-[11px] text-zinc-500 flex items-center justify-between">
            <span className="font-semibold uppercase tracking-wider text-[10px]">Tier: {tier}</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50" />
          </div>
        </aside>

        {/* RIGHT MAIN CONTENT AREA */}
        <main className="flex-1 flex flex-col min-w-0 bg-zinc-950">
          
          {/* Main Top Header */}
          <header className="p-4 sm:px-6 sm:py-5 border-b border-zinc-800/90 flex items-center justify-between bg-zinc-950 shrink-0">
            <h2 className="text-sm sm:text-base font-extrabold tracking-wider text-white uppercase">
              ACCOUNT & SETTINGS
            </h2>
            <button
              onClick={onClose}
              className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-900 rounded-xl transition-colors cursor-pointer focus:outline-none"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </header>

          {/* Scrollable Content Body */}
          <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1 text-left">

            {/* TAB 1: PROFILE */}
            {activeTab === 'profile' && (
              <div className="space-y-6 animate-in fade-in duration-150">
                
                {/* PROFILE CARD */}
                <section className="p-5 sm:p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 space-y-4">
                  <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest">
                    PROFILE
                  </h3>

                  <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 pt-1">
                    
                    {/* Avatar Column */}
                    <div className="flex flex-col items-center gap-3 shrink-0">
                      <div className="relative group">
                        <img
                          src={avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(username || 'SneakerHead')}`}
                          alt="Profile Avatar"
                          className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover border-2 border-zinc-700 bg-zinc-900 shadow-xl"
                          referrerPolicy="no-referrer"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(username)}`;
                          }}
                        />
                        <label className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer">
                          <Camera className="w-6 h-6 text-white" />
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleAvatarFileUpload}
                            className="hidden"
                          />
                        </label>
                      </div>

                      {/* Change Photo Button */}
                      <label className="relative px-3.5 py-1.5 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-xl text-xs font-medium text-zinc-200 cursor-pointer transition-colors flex items-center gap-1.5 shadow-sm">
                        <Camera className="w-3.5 h-3.5 text-zinc-400" />
                        <span>Change Photo</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleAvatarFileUpload}
                          className="hidden"
                        />
                      </label>
                    </div>

                    {/* Profile Fields Details */}
                    <div className="flex-1 w-full space-y-4 text-xs">
                      
                      {/* Display Name */}
                      <div className="border-b border-zinc-800/80 pb-3 flex items-center justify-between gap-2">
                        <div className="space-y-0.5 flex-1">
                          <label className="block text-[11px] font-semibold text-zinc-400">
                            Display Name
                          </label>
                          {isEditingUsername ? (
                            <input
                              type="text"
                              value={username}
                              onChange={(e) => setUsername(e.target.value)}
                              onBlur={() => setIsEditingUsername(false)}
                              autoFocus
                              className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-2.5 py-1 text-xs text-white font-medium focus:outline-none focus:border-red-500"
                            />
                          ) : (
                            <p className="text-sm font-bold text-white tracking-tight">
                              {username || 'KickCollector23'}
                            </p>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => setIsEditingUsername(!isEditingUsername)}
                          className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors"
                          title="Edit Display Name"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Email */}
                      <div className="border-b border-zinc-800/80 pb-3 flex items-center justify-between gap-2">
                        <div className="space-y-0.5 flex-1">
                          <label className="block text-[11px] font-semibold text-zinc-400">
                            Email
                          </label>
                          {isEditingEmail ? (
                            <input
                              type="email"
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              onBlur={() => setIsEditingEmail(false)}
                              autoFocus
                              className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-2.5 py-1 text-xs text-white font-medium focus:outline-none focus:border-red-500"
                            />
                          ) : (
                            <p className="text-xs font-semibold text-zinc-300 truncate">
                              {email || 'kickcollector23@email.com'}
                            </p>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => setIsEditingEmail(!isEditingEmail)}
                          className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors"
                          title="Edit Email"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Member Since */}
                      <div className="border-b border-zinc-800/80 pb-3 flex items-center justify-between">
                        <div>
                          <label className="block text-[11px] font-semibold text-zinc-400">
                            Member Since
                          </label>
                          <p className="text-xs font-semibold text-zinc-200">
                            {memberSince}
                          </p>
                        </div>
                      </div>

                      {/* Sneakers Owned */}
                      <div>
                        <label className="block text-[11px] font-semibold text-zinc-400">
                          Sneakers Owned
                        </label>
                        <p className="text-xs font-extrabold text-white">
                          {totalSneakers} Pairs
                        </p>
                      </div>

                    </div>
                  </div>

                  {/* Preset Avatars Selector */}
                  <div className="pt-2">
                    <span className="text-[11px] font-semibold text-zinc-400 block mb-2">Or choose a preset avatar:</span>
                    <div className="grid grid-cols-6 gap-2">
                      {AVATAR_PRESETS.map((p) => (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => setAvatarUrl(p.url)}
                          className={`relative aspect-square rounded-xl overflow-hidden border transition-all cursor-pointer ${
                            avatarUrl === p.url ? 'border-red-500 ring-2 ring-red-500/40 scale-105' : 'border-zinc-800 hover:border-zinc-600'
                          }`}
                          title={p.label}
                        >
                          <img src={p.url} alt={p.label} className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  </div>
                </section>

                {/* STATS SNAPSHOT SECTION */}
                <section className="p-5 sm:p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 space-y-3">
                  <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest">
                    STATS SNAPSHOT
                  </h3>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
                    
                    {/* Box 1: Sneakers */}
                    <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800/80 flex flex-col items-center justify-center text-center space-y-1">
                      <Footprints className="w-6 h-6 text-zinc-300" />
                      <span className="text-xl sm:text-2xl font-black text-white tracking-tight">
                        {totalSneakers}
                      </span>
                      <span className="text-[11px] font-semibold text-zinc-400">
                        Sneakers
                      </span>
                    </div>

                    {/* Box 2: Total Wears */}
                    <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800/80 flex flex-col items-center justify-center text-center space-y-1">
                      <Calendar className="w-6 h-6 text-zinc-300" />
                      <span className="text-xl sm:text-2xl font-black text-white tracking-tight">
                        {totalWears}
                      </span>
                      <span className="text-[11px] font-semibold text-zinc-400">
                        Total Wears
                      </span>
                    </div>

                    {/* Box 3: Roulette Wins / Suggested Wears */}
                    <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800/80 flex flex-col items-center justify-center text-center space-y-1">
                      <Sparkles className="w-6 h-6 text-zinc-300" />
                      <span className="text-xl sm:text-2xl font-black text-white tracking-tight">
                        {savedRouletteWins}
                      </span>
                      <span className="text-[11px] font-semibold text-zinc-400">
                        Roulette Wins
                      </span>
                    </div>

                    {/* Box 4: Blank Space for Stat to decide later */}
                    <div className="p-4 rounded-xl bg-zinc-950 border border-dashed border-zinc-800 flex flex-col items-center justify-center text-center space-y-1 group">
                      <Flame className="w-6 h-6 text-zinc-600 group-hover:text-amber-500 transition-colors" />
                      <span className="text-xl sm:text-2xl font-black text-zinc-600 tracking-tight">
                        --
                      </span>
                      <span className="text-[10px] font-medium text-zinc-500 italic">
                        Custom Stat
                      </span>
                    </div>

                  </div>
                </section>

              </div>
            )}

            {/* TAB 2: SUBSCRIPTION */}
            {activeTab === 'subscription' && (
              <div className="space-y-6 animate-in fade-in duration-150">
                
                {/* Developer Tester Bypass Bar */}
                <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex flex-wrap items-center justify-between gap-2.5 text-xs">
                  <div className="flex items-center gap-2 text-amber-300 font-bold">
                    <Zap className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>Tester Tier Switcher:</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {(['free', 'pro', 'premium'] as SubscriptionTier[]).map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => {
                          setSubscriptionTier(t);
                          onChangeTier(t);
                          onShowToast?.(`Switched tier to ${t.toUpperCase()}`, 'success');
                        }}
                        className={`px-3 py-1 rounded-lg text-xs font-bold uppercase transition-all cursor-pointer ${
                          tier === t
                            ? 'bg-amber-400 text-zinc-950 font-black shadow-md'
                            : 'bg-zinc-900 text-zinc-300 border border-zinc-800 hover:bg-zinc-800'
                        }`}
                      >
                        {t === 'premium' ? '⚡ Premium (Unlimited)' : t}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Subscription Tier Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {(['free', 'pro', 'premium'] as SubscriptionTier[]).map((tierKey) => {
                    const config = TIER_CONFIGS[tierKey];
                    const isCurrent = tier === tierKey;

                    return (
                      <div
                        key={tierKey}
                        className={`p-5 rounded-2xl border flex flex-col justify-between space-y-4 transition-all ${
                          isCurrent
                            ? 'bg-zinc-900 border-red-500/80 ring-1 ring-red-500/30 shadow-xl'
                            : 'bg-zinc-900/50 border-zinc-800 hover:border-zinc-700'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                              {config.name}
                            </span>
                            {isCurrent && (
                              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-red-500/20 text-red-400 border border-red-500/30 uppercase">
                                Current
                              </span>
                            )}
                          </div>

                          <div className="mb-4">
                            <span className="text-2xl font-black text-white">
                              ${billingInterval === 'yearly' ? (config.yearlyPrice / 12).toFixed(2) : config.monthlyPrice}
                            </span>
                            <span className="text-xs text-zinc-400"> / month</span>
                          </div>

                          <ul className="space-y-2 text-xs">
                            {config.features.map((feat, idx) => (
                              <li key={idx} className="flex items-center gap-2">
                                {feat.included ? (
                                  <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                                ) : (
                                  <X className="w-3.5 h-3.5 text-zinc-600 shrink-0" />
                                )}
                                <span className={feat.included ? 'text-zinc-200' : 'text-zinc-500 line-through'}>
                                  {feat.text}
                                </span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            setSubscriptionTier(tierKey);
                            onChangeTier(tierKey);
                            onShowToast?.(`Selected ${config.name} plan!`, 'success');
                          }}
                          disabled={isCurrent}
                          className={`w-full py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                            isCurrent
                              ? 'bg-zinc-800 text-zinc-400 cursor-default'
                              : 'bg-white hover:bg-zinc-200 text-zinc-950 shadow-md'
                          }`}
                        >
                          {isCurrent ? 'Active Plan' : `Switch to ${config.name}`}
                        </button>
                      </div>
                    );
                  })}
                </div>

              </div>
            )}

            {/* TAB 3: PREFERENCES */}
            {activeTab === 'preferences' && (
              <div className="space-y-6 animate-in fade-in duration-150">
                <section className="p-5 sm:p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 space-y-5">
                  <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest">
                    PREFERENCES
                  </h3>

                  <div className="space-y-4 text-xs">
                    
                    {/* Item 1: Default Roulette Filter */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-800/80 pb-4">
                      <div>
                        <label className="block font-semibold text-white">
                          Default Roulette Filter
                        </label>
                        <p className="text-[11px] text-zinc-400">
                          Initial category filter used when spinning the sneaker wheel.
                        </p>
                      </div>
                      <select
                        value={preferences.defaultRouletteFilter}
                        onChange={(e) => setPreferences({ ...preferences, defaultRouletteFilter: e.target.value })}
                        className="bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500 cursor-pointer min-w-[180px]"
                      >
                        {ROULETTE_FILTERS.map(f => (
                          <option key={f} value={f}>{f}</option>
                        ))}
                      </select>
                    </div>

                    {/* Item 2: Exclude Recently Worn */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-800/80 pb-4">
                      <div>
                        <label className="block font-semibold text-white">
                          Exclude Recently Worn
                        </label>
                        <p className="text-[11px] text-zinc-400">
                          Filter out pairs worn within this timeframe from random selections.
                        </p>
                      </div>
                      <select
                        value={preferences.excludeRecentlyWorn}
                        onChange={(e) => setPreferences({ ...preferences, excludeRecentlyWorn: e.target.value })}
                        className="bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500 cursor-pointer min-w-[180px]"
                      >
                        {RECENTLY_WORN_OPTIONS.map(opt => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    </div>

                    {/* Item 3: Favorite Brands (Multi-select) */}
                    <div className="border-b border-zinc-800/80 pb-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <label className="block font-semibold text-white">
                            Favorite Brands
                          </label>
                          <p className="text-[11px] text-zinc-400">
                            Select preferred brands to prioritize in your feed and roulette.
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleToggleBrand('ALL')}
                          className="text-[11px] font-semibold text-red-400 hover:underline"
                        >
                          {preferences.favoriteBrands?.includes('ALL') ? 'Deselect All' : 'Select All Brands'}
                        </button>
                      </div>

                      {/* Selected Brands Chips */}
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {preferences.favoriteBrands?.includes('ALL') ? (
                          <span className="px-3 py-1 bg-red-500/20 text-red-300 border border-red-500/40 rounded-lg text-xs font-bold">
                            All Brands Selected
                          </span>
                        ) : (
                          preferences.favoriteBrands?.map(b => (
                            <span
                              key={b}
                              className="px-2.5 py-1 bg-zinc-800 text-zinc-200 border border-zinc-700 rounded-lg text-xs font-medium flex items-center gap-1.5"
                            >
                              <span>{b}</span>
                              <button
                                type="button"
                                onClick={() => handleToggleBrand(b)}
                                className="hover:text-white"
                              >
                                &times;
                              </button>
                            </span>
                          ))
                        )}
                      </div>

                      {/* Brand Search Multi-select Container */}
                      <div className="pt-2">
                        <input
                          type="text"
                          placeholder="Search and toggle favorite brands..."
                          value={brandSearch}
                          onChange={(e) => {
                            setBrandSearch(e.target.value);
                            setIsBrandDropdownOpen(true);
                          }}
                          onFocus={() => setIsBrandDropdownOpen(true)}
                          className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-red-500"
                        />

                        {isBrandDropdownOpen && (
                          <div className="mt-2 p-2 bg-zinc-950 border border-zinc-800 rounded-xl max-h-40 overflow-y-auto grid grid-cols-2 sm:grid-cols-3 gap-1 shadow-lg">
                            {filteredBrandList.slice(0, 30).map(b => {
                              const isChecked = preferences.favoriteBrands?.includes('ALL') || preferences.favoriteBrands?.includes(b);
                              return (
                                <button
                                  key={b}
                                  type="button"
                                  onClick={() => handleToggleBrand(b)}
                                  className={`p-1.5 rounded-lg text-left text-xs font-medium flex items-center justify-between transition-colors ${
                                    isChecked
                                      ? 'bg-red-500/15 text-red-300 font-bold'
                                      : 'hover:bg-zinc-900 text-zinc-300'
                                  }`}
                                >
                                  <span className="truncate">{b}</span>
                                  {isChecked && <Check className="w-3.5 h-3.5 text-red-400 shrink-0" />}
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Item 4: Default Sort */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-800/80 pb-4">
                      <div>
                        <label className="block font-semibold text-white">
                          Default Sort
                        </label>
                        <p className="text-[11px] text-zinc-400">
                          Initial sorting order for your sneaker collection.
                        </p>
                      </div>
                      <select
                        value={preferences.defaultSort}
                        onChange={(e) => setPreferences({ ...preferences, defaultSort: e.target.value })}
                        className="bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500 cursor-pointer min-w-[180px]"
                      >
                        {SORT_OPTIONS.map(s => (
                          <option key={s.value} value={s.value}>{s.label}</option>
                        ))}
                      </select>
                    </div>

                    {/* Item 5: Theme */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <label className="block font-semibold text-white">
                          Theme
                        </label>
                        <p className="text-[11px] text-zinc-400">
                          App interface visual theme mode.
                        </p>
                      </div>
                      <div className="flex items-center gap-1 bg-zinc-950 p-1 rounded-xl border border-zinc-800">
                        {(['Dark', 'Light', 'System'] as const).map(t => (
                          <button
                            key={t}
                            type="button"
                            onClick={() => setPreferences({ ...preferences, theme: t })}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                              preferences.theme === t
                                ? 'bg-zinc-800 text-white shadow-sm'
                                : 'text-zinc-400 hover:text-zinc-200'
                            }`}
                          >
                            {t === 'Dark' && <Moon className="w-3.5 h-3.5 text-indigo-400" />}
                            {t === 'Light' && <Sun className="w-3.5 h-3.5 text-amber-400" />}
                            {t === 'System' && <Laptop className="w-3.5 h-3.5 text-zinc-400" />}
                            <span>{t}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                  </div>
                </section>
              </div>
            )}

            {/* TAB 4: NOTIFICATIONS */}
            {activeTab === 'notifications' && (
              <div className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 space-y-4 text-xs animate-in fade-in duration-150">
                <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest">
                  NOTIFICATIONS
                </h3>
                <p className="text-zinc-300 leading-relaxed">
                  Customize drop alerts, daily wear reminders, and sneaker rotation suggestions.
                </p>
                <div className="space-y-3 pt-2">
                  <label className="flex items-center gap-3 p-3 bg-zinc-950 rounded-xl border border-zinc-800 cursor-pointer">
                    <input type="checkbox" defaultChecked className="rounded accent-red-500 w-4 h-4" />
                    <div>
                      <span className="font-bold text-white block">Daily Rotation Reminder</span>
                      <span className="text-[11px] text-zinc-400">Get a daily suggestion for which pair to wear</span>
                    </div>
                  </label>
                  <label className="flex items-center gap-3 p-3 bg-zinc-950 rounded-xl border border-zinc-800 cursor-pointer">
                    <input type="checkbox" defaultChecked className="rounded accent-red-500 w-4 h-4" />
                    <div>
                      <span className="font-bold text-white block">Unworn Pair Alerts</span>
                      <span className="text-[11px] text-zinc-400">Notify when sneakers haven't been worn in over 60 days</span>
                    </div>
                  </label>
                </div>
              </div>
            )}

            {/* TAB 5: SECURITY */}
            {activeTab === 'security' && (
              <div className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 space-y-4 text-xs animate-in fade-in duration-150">
                <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest">
                  SECURITY & PRIVACY
                </h3>
                <p className="text-zinc-300 leading-relaxed">
                  Manage authentication methods, local database security, and device sessions.
                </p>
                <div className="p-4 bg-zinc-950 rounded-xl border border-zinc-800 space-y-2">
                  <span className="font-bold text-white block">Data Storage</span>
                  <span className="text-[11px] text-zinc-400 block">
                    Your collection is securely synced with your encrypted account storage.
                  </span>
                </div>
              </div>
            )}

            {/* TAB 6: ABOUT */}
            {activeTab === 'about' && (
              <div className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 space-y-4 text-xs animate-in fade-in duration-150">
                <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest">
                  ABOUT KICK LOCKER
                </h3>
                <p className="text-zinc-300 leading-relaxed">
                  Kick Locker v2.4.0 — Premium Sneaker Inventory & Rotation Management.
                </p>
                <div className="text-[11px] text-zinc-400 space-y-1 pt-2 border-t border-zinc-800">
                  <p>Built with React, Vite, Tailwind CSS & Supabase.</p>
                  <p>&copy; 2026 Kick Locker Inc. All rights reserved.</p>
                </div>
              </div>
            )}

          </div>

          {/* MAIN FOOTER BUTTONS */}
          <footer className="p-4 sm:px-6 bg-zinc-950 border-t border-zinc-800/90 flex items-center justify-end gap-3 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 rounded-xl border border-zinc-800 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white font-bold text-xs uppercase tracking-wider transition-all cursor-pointer focus:outline-none"
            >
              CANCEL
            </button>
            <button
              type="button"
              onClick={handleSaveAll}
              disabled={isSaving}
              className="px-6 py-2.5 rounded-xl bg-zinc-200 hover:bg-white text-zinc-950 font-black text-xs uppercase tracking-wider shadow-lg transition-all cursor-pointer flex items-center gap-2 disabled:opacity-50"
            >
              {isSaving ? (
                <span>SAVING...</span>
              ) : (
                <span>SAVE CHANGES</span>
              )}
            </button>
          </footer>

        </main>

      </div>
    </div>
  );
};
