import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useSneakers } from './hooks/useSneakers';
import { useAuth } from './hooks/useAuth';
import SignIn from './components/SignIn';
import LoadingScreen from './components/LoadingScreen';
import { SneakerInsert, Sneaker } from './lib/supabase';
import { safeLocalStorage } from './lib/utils';
import SneakerCard from './components/SneakerCard';
import SneakerForm from './components/SneakerForm';
import FileUpload from './components/FileUpload';
import SneakerPicker from './components/SneakerPicker';
import SneakerListView from './components/SneakerListView';
import SneakerTableView from './components/SneakerTableView';
import PhotoGuideModal from './components/PhotoGuide';
import SubscriptionModal from './components/SubscriptionModal';
import { useSubscription } from './hooks/useSubscription';
import {
  Plus, Upload, Search, Footprints,
  SlidersHorizontal, X, AlertCircle, CheckCircle2, Database, LogOut,
  ChevronDown, ChevronUp, Copy, Terminal, Check, LifeBuoy, Settings, ArrowUpDown,
  LayoutGrid, List, Table, Crown, User, Loader2, Camera, Image, Trash2
} from 'lucide-react';

const AVATAR_PRESETS = [
  { id: 'preset-1', label: 'SneakerHead', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=SneakerHead' },
  { id: 'preset-2', label: 'KicksKing', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=KicksKing' },
  { id: 'preset-3', label: 'AirJordan', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=AirJordan' },
  { id: 'preset-4', label: 'FreshKicks', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=FreshKicks' },
  { id: 'preset-5', label: 'DunkMaster', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=DunkMaster' },
  { id: 'preset-6', label: 'RetroStyle', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=RetroStyle' },
  { id: 'preset-7', label: 'HeatCheck', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=HeatCheck' },
  { id: 'preset-8', label: 'SoleCollector', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=SoleCollector' },
];

function App() {
  const { user, loading: authLoading, signOut, updateProfile } = useAuth();
  const { sneakers, loading, error, isSupabaseConfigured, usingLocalStorageFallback, addSneaker, addSneakersBatch, updateSneaker, deleteSneaker, incrementWorn } = useSneakers(user?.id);
  const { tier, config, checkAddPairAllowed, canImport } = useSubscription();
  const isGuest = user?.id === 'guest-user-bypass';
  const isLive = isSupabaseConfigured && !isGuest;
  const [showLoading, setShowLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [subscriptionReason, setSubscriptionReason] = useState<string | undefined>(undefined);

  const handleOpenSubscriptionModal = (reason?: string) => {
    setSubscriptionReason(reason);
    setShowSubscriptionModal(true);
  };

  useEffect(() => {
    if (!authLoading && user) {
      const justSignedIn = sessionStorage.getItem('just_signed_in') === 'true';
      if (justSignedIn) {
        sessionStorage.removeItem('just_signed_in');
        setShowLoading(true);
      }
    }
  }, [user, authLoading]);
  const [editSneaker, setEditSneaker] = useState<Sneaker | null>(null);
  const [sneakerToDelete, setSneakerToDelete] = useState<Sneaker | null>(null);
  const [showImport, setShowImport] = useState(false);
  const [showPicker, setShowPicker] = useState(false);
  const [showPhotoGuide, setShowPhotoGuide] = useState(false);
  const [showSqlGuide, setShowSqlGuide] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterBrand, setFilterBrand] = useState('');
  const [filterStyle, setFilterStyle] = useState('');
  const [filterColor, setFilterColor] = useState('');
  const [filterHeight, setFilterHeight] = useState('');
  const [sortBy, setSortBy] = useState<'brand' | 'style' | 'worn' | 'created_at'>('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [showFilters, setShowFilters] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const [viewMode, setViewMode] = useState<'cards' | 'list' | 'table'>(() => {
    const saved = safeLocalStorage.getItem('sneaker_view_mode');
    return (saved === 'cards' || saved === 'list' || saved === 'table') ? saved : 'cards';
  });

  const handleSetViewMode = (mode: 'cards' | 'list' | 'table') => {
    setViewMode(mode);
    safeLocalStorage.setItem('sneaker_view_mode', mode);
  };

  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const sortDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (sortDropdownRef.current && !sortDropdownRef.current.contains(event.target as Node)) {
        setShowSortDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const sortOptions = [
    { field: 'created_at', order: 'desc', label: 'Newest' },
    { field: 'created_at', order: 'asc', label: 'Oldest' },
    { field: 'brand', order: 'asc', label: 'Brand (A-Z)' },
    { field: 'brand', order: 'desc', label: 'Brand (Z-A)' },
    { field: 'style', order: 'asc', label: 'Style (A-Z)' },
    { field: 'style', order: 'desc', label: 'Style (Z-A)' },
    { field: 'worn', order: 'desc', label: 'Wear Count (High to Low)' },
    { field: 'worn', order: 'asc', label: 'Wear Count (Low to High)' },
  ] as const;

  const currentSortOption = sortOptions.find(opt => opt.field === sortBy && opt.order === sortOrder) || sortOptions[0];

  const [pickerResultCount, setPickerResultCount] = useState<number>(() => {
    const saved = safeLocalStorage.getItem('picker_result_count');
    if (saved) {
      const parsed = parseInt(saved, 10);
      if ([1, 3, 5].includes(parsed)) return parsed;
    }
    return 1;
  });
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [settingsTab, setSettingsTab] = useState<'profile' | 'subscription' | 'preferences'>('profile');
  const [showScrollTop, setShowScrollTop] = useState(false);

  const [newUsername, setNewUsername] = useState('');
  const [newAvatarUrl, setNewAvatarUrl] = useState('');
  const [isDraggingAvatar, setIsDraggingAvatar] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileStatus, setProfileStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    if (showSettingsModal && user) {
      setNewUsername(user.user_metadata?.username || user.user_metadata?.full_name || '');
      setNewAvatarUrl(user.user_metadata?.avatar_url || '');
      setProfileStatus(null);
      setSettingsTab('profile');
    }
  }, [showSettingsModal, user]);

  const processAvatarFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setProfileStatus({ type: 'error', message: 'Please upload a valid image file (PNG, JPG, WEBP, GIF).' });
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setProfileStatus({ type: 'error', message: 'Image file size should be under 10MB.' });
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
          setNewAvatarUrl(dataUrl);
          setProfileStatus({ type: 'success', message: 'Photo ready! Click "Save Profile Changes" below.' });
        }
      };
      img.onerror = () => {
        setProfileStatus({ type: 'error', message: 'Could not load image. Please try another image file.' });
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleAvatarFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processAvatarFile(file);
    }
  };

  const handleAvatarDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingAvatar(true);
  };

  const handleAvatarDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingAvatar(false);
  };

  const handleAvatarDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingAvatar(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processAvatarFile(file);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUsername.trim()) return;
    setIsSavingProfile(true);
    setProfileStatus(null);
    const res = await updateProfile({
      username: newUsername.trim(),
      avatarUrl: newAvatarUrl.trim() || undefined,
    });
    setIsSavingProfile(false);
    if (res.success) {
      setProfileStatus({ type: 'success', message: 'Profile updated successfully!' });
      setToast({ type: 'success', message: 'Profile updated successfully!' });
    } else {
      setProfileStatus({ type: 'error', message: res.error || 'Failed to update profile.' });
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    safeLocalStorage.setItem('picker_result_count', pickerResultCount.toString());
  }, [pickerResultCount]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const container = document.getElementById('user-menu-container');
      if (container && !container.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  const availableBrands = [...new Set(sneakers.map(s => s.brand))].filter(Boolean).sort();
  const availableHeights = [...new Set(sneakers.map(s => s.height))].filter(Boolean).sort();
  const availableStyles = [...new Set(sneakers.flatMap(s => s.style || []))].filter(Boolean).sort();
  const availableColors = [...new Set(sneakers.flatMap(s => s.color || []))].filter(Boolean).sort();

  const filtered = sneakers.filter(s => {
    const matchesSearch = !searchQuery ||
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.colorway.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesBrand = !filterBrand || s.brand === filterBrand;
    const matchesHeight = !filterHeight || s.height === filterHeight;
    const matchesStyle = !filterStyle || (Array.isArray(s.style) && s.style.includes(filterStyle));
    const matchesColor = !filterColor || (Array.isArray(s.color) && s.color.includes(filterColor));
    return matchesSearch && matchesBrand && matchesHeight && matchesStyle && matchesColor;
  });

  const sortedAndFiltered = [...filtered].sort((a, b) => {
    let comparison = 0;
    if (sortBy === 'brand') {
      comparison = a.brand.localeCompare(b.brand);
    } else if (sortBy === 'style') {
      const styleA = (a.style || []).join(', ');
      const styleB = (b.style || []).join(', ');
      comparison = styleA.localeCompare(styleB);
    } else if (sortBy === 'worn') {
      comparison = a.worn - b.worn;
    } else if (sortBy === 'created_at') {
      const dateA = new Date(a.created_at || 0).getTime();
      const dateB = new Date(b.created_at || 0).getTime();
      comparison = dateA - dateB;
    }
    return sortOrder === 'asc' ? comparison : -comparison;
  });

  const handleSave = async (data: SneakerInsert) => {
    if (editSneaker) {
      const result = await updateSneaker(editSneaker.id, data);
      setEditSneaker(null);
      if (result) showToast('success', 'Sneaker updated');
      else showToast('error', 'Failed to update sneaker');
      return result;
    }
    const result = await addSneaker(data);
    setShowForm(false);
    if (result) showToast('success', 'Sneaker added');
    else showToast('error', 'Failed to add sneaker');
    return result;
  };

  const handleEdit = (sneaker: Sneaker) => {
    setEditSneaker(sneaker);
  };

  const handleDelete = (id: string) => {
    const s = sneakers.find(x => x.id === id);
    if (s) {
      setSneakerToDelete(s);
    }
  };

  const confirmDelete = async () => {
    if (!sneakerToDelete) return;
    const ok = await deleteSneaker(sneakerToDelete.id);
    if (ok) showToast('success', 'Sneaker deleted');
    else showToast('error', 'Failed to delete sneaker');
    setSneakerToDelete(null);
  };

  const handleImport = async (sneakersData: SneakerInsert[]) => {
    const result = await addSneakersBatch(sneakersData);
    if (result) showToast('success', `Imported ${result.length} sneakers`);
    else showToast('error', 'Failed to import sneakers');
    return result;
  };

  const handleWear = async (id: string) => {
    return incrementWorn(id);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center select-none">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center shadow-xl shadow-red-500/10 animate-bounce">
            <Footprints className="w-6 h-6 text-white" />
          </div>
          <span className="text-sm font-semibold text-zinc-400 uppercase tracking-widest animate-pulse">Loading Locker...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return <SignIn />;
  }

  if (showLoading) {
    return <LoadingScreen onComplete={() => setShowLoading(false)} />;
  }

  return (
    <div className="min-h-screen bg-zinc-950">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-zinc-950/80 backdrop-blur-xl border-b border-zinc-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <img
                  src="https://i.postimg.cc/sgbkTBQW/imageedit-41-6518783016.png"
                  alt="Sneaker Roulette"
                  className="h-16 sm:h-18 w-auto object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowPicker(true)}
                className="hidden sm:flex items-center gap-2 px-4 pt-1.5 py-2 bg-emerald-600/10 text-emerald-400 text-sm font-medium rounded-2xl border border-emerald-500/20 hover:bg-emerald-600/20 transition-colors cursor-pointer"
              >
                <LifeBuoy className="w-5 h-5 text-emerald-400" />
                Spin the Wheel
              </button>
              <button
                onClick={() => {
                  if (!canImport) {
                    handleOpenSubscriptionModal('Batch importing CSV, JSON, or Excel files is available on Pro & Premium plans!');
                  } else {
                    setShowImport(true);
                  }
                }}
                className="hidden sm:flex items-center gap-2 px-4 pt-1.5 pb-2 bg-sky-600/10 text-sky-400 text-sm font-medium rounded-2xl border border-sky-700/20 hover:bg-blue-600/20 transition-colors cursor-pointer"
              >
                <Upload className="w-4 h-4" />
                Import
              </button>
              <button
                onClick={() => {
                  const check = checkAddPairAllowed(sneakers.length);
                  if (!check.allowed) {
                    handleOpenSubscriptionModal(
                      `You've reached your maximum limit of ${check.max} pairs on the ${config.name} (${config.badge}) plan. Upgrade to Pro for 30 pairs or Premium for unlimited pairs!`
                    );
                  } else {
                    setShowForm(true);
                  }
                }}
                className="flex items-center gap-2 px-4 pt-1.5 pb-2 bg-rose-600/10 text-rose-400 text-sm font-medium rounded-2xl border border-rose-700/20 hover:bg-rose-600/20 transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Add Sneaker</span>
              </button>

              <div className="h-8 w-px bg-zinc-800/80 mx-1 hidden sm:block" />

              <div className="flex flex-col items-start gap-1">
                <div className="relative" id="user-menu-container">
                  {/* User Avatar Button */}
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="p-1 hover:bg-zinc-800/60 rounded-xl border border-transparent hover:border-zinc-800/80 transition-all cursor-pointer focus:outline-none shrink-0"
                    title="Account & Settings"
                  >
                    <img
                      src={user.user_metadata?.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(user.email)}`}
                      alt="Avatar"
                      className="w-8.5 h-8.5 rounded-xl object-cover border border-zinc-800 bg-zinc-900"
                      referrerPolicy="no-referrer"
                    />
                  </button>

                  {/* Dropdown Menu */}
                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-64 bg-zinc-900 border border-zinc-800/90 rounded-2xl shadow-2xl overflow-hidden py-1 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                      {/* Account Quick Overview */}
                      <div className="px-4 py-3 border-b border-zinc-800/80 bg-zinc-950/70">
                        <div className="flex items-center gap-3">
                          <img
                            src={user.user_metadata?.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(user.email)}`}
                            alt="Avatar"
                            className="w-10 h-10 rounded-xl object-cover border border-zinc-700 bg-zinc-900 shrink-0"
                            referrerPolicy="no-referrer"
                          />
                          <div className="overflow-hidden min-w-0">
                            <div className="text-xs font-bold text-white truncate flex items-center gap-1.5">
                              <span className="truncate">{user.user_metadata?.username || user.user_metadata?.full_name || user.email.split('@')[0]}</span>
                              <span className={`text-[9px] font-extrabold px-1.5 py-0.2 rounded animate-pulse uppercase tracking-wider border shrink-0 ${
                                tier === 'premium'
                                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                                  : tier === 'pro'
                                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                                  : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                              }`}>
                                {config.badge}
                              </span>
                            </div>
                            <div className="text-[11px] text-zinc-400 truncate mt-0.5">
                              {user.email}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Dropdown Menu Items */}
                      <div className="py-1">
                        <button
                          onClick={() => {
                            setShowUserMenu(false);
                            setShowSettingsModal(true);
                          }}
                          className="w-full px-4 py-3 text-left text-xs font-semibold text-zinc-200 hover:text-white hover:bg-zinc-800/80 transition-colors flex items-center justify-between cursor-pointer focus:outline-none group"
                        >
                          <span className="flex items-center gap-2.5">
                            <Settings className="w-4 h-4 text-zinc-400 group-hover:text-red-400 transition-colors" />
                            <span>Account Settings</span>
                          </span>
                        </button>

                        <div className="h-px bg-zinc-800/60 my-1" />

                        <button
                          onClick={() => {
                            setShowUserMenu(false);
                            signOut();
                          }}
                          className="w-full px-4 py-2.5 text-left text-xs font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors flex items-center gap-2.5 cursor-pointer focus:outline-none"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Supabase connection guide / state banners */}
        {isGuest && (
          <div className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4 text-amber-200">
            <div className="p-2.5 bg-amber-500/10 rounded-xl text-amber-400 shrink-0">
              <Database className="w-5 h-5" />
            </div>
            <div className="flex-1 space-y-1">
              <h4 className="text-sm font-semibold text-amber-300">Guest Sandbox Mode Active</h4>
              <p className="text-xs text-amber-400/80 leading-relaxed">
                You are currently bypassing live database authentication. Your collection, wears, and additions are saved in your browser's offline Local Sandbox cache.
              </p>
            </div>
          </div>
        )}

        {!isSupabaseConfigured && !isGuest && (
          <div className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4 text-amber-200">
            <div className="p-2.5 bg-amber-500/10 rounded-xl text-amber-400 shrink-0">
              <Database className="w-5 h-5" />
            </div>
            <div className="flex-1 space-y-1">
              <h4 className="text-sm font-semibold text-amber-300">Local Sandbox Mode Enabled</h4>
              <p className="text-xs text-amber-400/80 leading-relaxed">
                The application is running in fully functional offline local storage mode. To sync with your live <strong>Supabase Database</strong>, open the <strong>Settings</strong> menu in the top-right corner of AI Studio, then add the following environment variables:
              </p>
              <div className="flex flex-wrap gap-2 mt-2 font-mono text-[10px]">
                <span className="px-2 py-0.5 bg-zinc-950 border border-amber-500/10 rounded text-amber-300">VITE_SUPABASE_URL</span>
                <span className="px-2 py-0.5 bg-zinc-950 border border-amber-500/10 rounded text-amber-300">VITE_SUPABASE_ANON_KEY</span>
              </div>
            </div>
          </div>
        )}

        {isLive && error && (
          <div className="bg-red-500/5 border border-red-500/20 rounded-2xl p-5 space-y-4 text-red-200">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="p-2.5 bg-red-500/10 rounded-xl text-red-400 shrink-0">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div className="flex-1 space-y-1">
                <h4 className="text-sm font-semibold text-red-300">Supabase Connection or Table Missing</h4>
                <p className="text-xs text-red-400/80 leading-relaxed">
                  Vite is using your custom Supabase environment variables but failed to query: <span className="font-mono text-red-200 bg-red-950/40 px-1.5 py-0.5 rounded border border-red-500/10">{error}</span>.
                </p>
                <p className="text-xs text-amber-400/90 font-medium">
                  {usingLocalStorageFallback ? (
                    <span>💡 Active Fallback: The app has automatically fallen back to <strong>Offline Local Storage</strong> so you can still add, edit, delete, and spin sneakers!</span>
                  ) : (
                    <span>🔄 Attempting to query Supabase database...</span>
                  )}
                </p>
              </div>
              <button
                onClick={() => setShowSqlGuide(!showSqlGuide)}
                className="flex items-center gap-1 px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-300 hover:text-white rounded-lg text-xs font-semibold border border-red-500/20 transition-all cursor-pointer self-stretch sm:self-center justify-center"
              >
                <Terminal className="w-3.5 h-3.5" />
                <span>{showSqlGuide ? 'Hide Setup SQL' : 'View Setup SQL'}</span>
                {showSqlGuide ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
            </div>

            {showSqlGuide && (
              <div className="space-y-3 pt-3 border-t border-red-500/10 animate-fadeIn">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-zinc-300">Run this SQL script in your Supabase SQL Editor:</span>
                  <button
                    onClick={() => {
                      const sql = `CREATE TABLE IF NOT EXISTS sneakers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL DEFAULT '',
  brand text NOT NULL DEFAULT '',
  model text NOT NULL DEFAULT '',
  variant text NOT NULL DEFAULT '',
  colorway text NOT NULL DEFAULT '',
  height text NOT NULL DEFAULT 'Low',
  style text[] DEFAULT '{}',
  color text[] DEFAULT '{}',
  worn integer NOT NULL DEFAULT 0,
  image_url text DEFAULT '',
  last_worn timestamptz DEFAULT NULL,
  user_id uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE sneakers ENABLE ROW LEVEL SECURITY;

-- Select policy
CREATE POLICY "Users can view own sneakers"
  ON sneakers FOR SELECT
  TO anon, authenticated
  USING (auth.uid() = user_id OR user_id IS NULL);

-- Insert policy
CREATE POLICY "Users can insert own sneakers"
  ON sneakers FOR INSERT
  TO anon, authenticated
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- Update policy
CREATE POLICY "Users can update own sneakers"
  ON sneakers FOR UPDATE
  TO anon, authenticated
  USING (auth.uid() = user_id OR user_id IS NULL)
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- Delete policy
CREATE POLICY "Users can delete own sneakers"
  ON sneakers FOR DELETE
  TO anon, authenticated
  USING (auth.uid() = user_id OR user_id IS NULL);`;
                      navigator.clipboard.writeText(sql);
                      setCopiedSql(true);
                      setTimeout(() => setCopiedSql(false), 2000);
                    }}
                    className="flex items-center gap-1 px-2.5 py-1 bg-zinc-900 border border-zinc-700 hover:border-zinc-500 text-zinc-300 hover:text-white rounded text-[11px] font-medium transition-all cursor-pointer"
                  >
                    {copiedSql ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span className="text-emerald-400">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copy SQL</span>
                      </>
                    )}
                  </button>
                </div>
                <pre className="text-[10px] font-mono text-zinc-400 bg-zinc-950/80 p-3 rounded-lg border border-zinc-800 max-h-60 overflow-y-auto leading-normal select-all">
{`CREATE TABLE IF NOT EXISTS sneakers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL DEFAULT '',
  brand text NOT NULL DEFAULT '',
  model text NOT NULL DEFAULT '',
  variant text NOT NULL DEFAULT '',
  colorway text NOT NULL DEFAULT '',
  height text NOT NULL DEFAULT 'Low',
  style text[] DEFAULT '{}',
  color text[] DEFAULT '{}',
  worn integer NOT NULL DEFAULT 0,
  image_url text DEFAULT '',
  last_worn timestamptz DEFAULT NULL,
  user_id uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE sneakers ENABLE ROW LEVEL SECURITY;

-- Select policy
CREATE POLICY "Users can view own sneakers"
  ON sneakers FOR SELECT
  TO anon, authenticated
  USING (auth.uid() = user_id OR user_id IS NULL);

-- Insert policy
CREATE POLICY "Users can insert own sneakers"
  ON sneakers FOR INSERT
  TO anon, authenticated
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- Update policy
CREATE POLICY "Users can update own sneakers"
  ON sneakers FOR UPDATE
  TO anon, authenticated
  USING (auth.uid() = user_id OR user_id IS NULL)
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- Delete policy
CREATE POLICY "Users can delete own sneakers"
  ON sneakers FOR DELETE
  TO anon, authenticated
  USING (auth.uid() = user_id OR user_id IS NULL);`}
                </pre>
              </div>
            )}
          </div>
        )}
        {/* Mobile action buttons */}
        <div className="flex sm:hidden gap-2">
          <button
            onClick={() => setShowPicker(true)}
            className="flex-1 flex items-center justify-center gap-2 py-3 bg-emerald-600/10 text-emerald-400 text-sm font-medium rounded-xl border border-emerald-500/20"
          >
            <LifeBuoy className="w-6 h-6 text-emerald-400" /> Spin the Wheel
          </button>
          <button
            onClick={() => setShowImport(true)}
            className="flex-1 flex items-center justify-center gap-2 py-3 bg-zinc-800 text-white text-sm font-medium rounded-xl border border-zinc-700"
          >
            <Upload className="w-4 h-4" /> Import
          </button>
        </div>

        {/* Search & Filters */}
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search sneakers..."
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-red-500 transition-colors"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-3">
              {/* Custom Modern Sort Dropdown */}
              <div className="relative flex-1 sm:flex-initial" ref={sortDropdownRef}>
                <button
                  onClick={() => setShowSortDropdown(!showSortDropdown)}
                  className="w-full sm:w-auto flex items-center justify-between gap-3 bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-zinc-300 hover:text-zinc-100 hover:border-zinc-700 transition-all cursor-pointer select-none"
                >
                  <div className="flex items-center gap-2">
                    <ArrowUpDown className="w-4 h-4 text-zinc-500 flex-shrink-0" />
                    <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Sort:</span>
                    <span className="text-xs font-medium text-zinc-200">{currentSortOption.label}</span>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-zinc-500 transition-transform duration-200 flex-shrink-0 ${showSortDropdown ? 'rotate-180 text-zinc-300' : ''}`} />
                </button>

                {showSortDropdown && (
                  <div className="absolute right-[-30px] mt-2 w-56 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl overflow-hidden z-50 py-1.5 animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="px-3 py-1.5 border-b border-zinc-800/60 mb-1">
                      <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Sort Order</span>
                    </div>
                    {sortOptions.map(option => {
                      const isSelected = sortBy === option.field && sortOrder === option.order;
                      return (
                        <button
                          key={`${option.field}-${option.order}`}
                          onClick={() => {
                            setSortBy(option.field);
                            setSortOrder(option.order);
                            setShowSortDropdown(false);
                          }}
                          className={`w-full text-left px-4 py-2 text-xs flex items-center justify-between transition-colors ${
                            isSelected
                              ? 'bg-red-500/15 text-red-400 font-semibold'
                              : 'text-zinc-400 hover:text-red-400 hover:bg-red-500/10'
                          }`}
                        >
                          <span>{option.label}</span>
                          {isSelected && <Check className="w-3.5 h-3.5 text-red-500 flex-shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* View Mode Switcher */}
              <div className="flex items-center gap-1 bg-zinc-900 border border-zinc-800 rounded-xl p-1 text-zinc-400">
                <button
                  onClick={() => handleSetViewMode('cards')}
                  title="Card View"
                  className={`p-1.5 rounded-lg transition-all flex items-center justify-center cursor-pointer ${
                    viewMode === 'cards' ? 'bg-red-500/15 text-red-400' : 'hover:text-zinc-200 hover:bg-zinc-850'
                  }`}
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleSetViewMode('list')}
                  title="List View"
                  className={`p-1.5 rounded-lg transition-all flex items-center justify-center cursor-pointer ${
                    viewMode === 'list' ? 'bg-red-500/15 text-red-400' : 'hover:text-zinc-200 hover:bg-zinc-850'
                  }`}
                >
                  <List className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleSetViewMode('table')}
                  title="Table View"
                  className={`p-1.5 rounded-lg transition-all flex items-center justify-center cursor-pointer ${
                    viewMode === 'table' ? 'bg-red-500/15 text-red-400' : 'hover:text-zinc-200 hover:bg-zinc-850'
                  }`}
                >
                  <Table className="w-4 h-4" />
                </button>
              </div>

              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`p-2.5 rounded-xl border transition-colors flex items-center justify-center ${
                  showFilters ? 'bg-zinc-800 border-zinc-600 text-zinc-200' : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <SlidersHorizontal className="w-4.5 h-4.5" />
              </button>
            </div>
          </div>

          {showFilters && (
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 space-y-4 animate-in fade-in duration-200">
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                {/* Brand Filter */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block">Brand</label>
                  <select
                    value={filterBrand}
                    onChange={e => setFilterBrand(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-red-500 transition-colors cursor-pointer appearance-none"
                    style={{ backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%2371717a' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><polyline points='6 9 12 15 18 9'></polyline></svg>")`, backgroundPosition: 'right 0.75rem center', backgroundSize: '1rem', backgroundRepeat: 'no-repeat', paddingRight: '2rem' }}
                  >
                    <option value="">All Brands</option>
                    {availableBrands.map(b => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                </div>

                {/* Style Filter */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block">Style</label>
                  <select
                    value={filterStyle}
                    onChange={e => setFilterStyle(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-red-500 transition-colors cursor-pointer appearance-none"
                    style={{ backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%2371717a' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><polyline points='6 9 12 15 18 9'></polyline></svg>")`, backgroundPosition: 'right 0.75rem center', backgroundSize: '1rem', backgroundRepeat: 'no-repeat', paddingRight: '2rem' }}
                  >
                    <option value="">All Styles</option>
                    {availableStyles.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                {/* Color Filter */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block">Color</label>
                  <select
                    value={filterColor}
                    onChange={e => setFilterColor(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-red-500 transition-colors cursor-pointer appearance-none"
                    style={{ backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%2371717a' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><polyline points='6 9 12 15 18 9'></polyline></svg>")`, backgroundPosition: 'right 0.75rem center', backgroundSize: '1rem', backgroundRepeat: 'no-repeat', paddingRight: '2rem' }}
                  >
                    <option value="">All Colors</option>
                    {availableColors.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                {/* Height Filter */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block">Height</label>
                  <select
                    value={filterHeight}
                    onChange={e => setFilterHeight(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-red-500 transition-colors cursor-pointer appearance-none"
                    style={{ backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%2371717a' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><polyline points='6 9 12 15 18 9'></polyline></svg>")`, backgroundPosition: 'right 0.75rem center', backgroundSize: '1rem', backgroundRepeat: 'no-repeat', paddingRight: '2rem' }}
                  >
                    <option value="">All Heights</option>
                    {availableHeights.map(h => (
                      <option key={h} value={h}>{h}</option>
                    ))}
                  </select>
                </div>
              </div>

              {(filterBrand || filterStyle || filterColor || filterHeight) && (
                <div className="flex justify-end pt-1">
                  <button
                    onClick={() => {
                      setFilterBrand('');
                      setFilterStyle('');
                      setFilterColor('');
                      setFilterHeight('');
                    }}
                    className="flex items-center gap-1.5 text-xs font-medium text-red-400 hover:text-red-300 transition-colors cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" /> Clear Filters
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Stats bar */}
        <div className="flex flex-wrap items-center gap-x-6 gap-y-1 text-xs text-zinc-500">
          <span>{sneakers.length} sneakers</span>
          {filtered.length !== sneakers.length && (
            <span>{filtered.length} shown</span>
          )}
          <span>{sneakers.reduce((sum, s) => sum + s.worn, 0)} total wears</span>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-6 h-6 border-2 border-zinc-600 border-t-red-500 rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Footprints className="w-16 h-16 text-zinc-800 mb-4" />
            <h3 className="text-lg font-medium text-zinc-400 mb-1">
              {sneakers.length === 0 ? 'No sneakers yet' : 'No matches found'}
            </h3>
            <p className="text-sm text-zinc-600 max-w-sm">
              {sneakers.length === 0
                ? 'Add your first sneaker or import your collection to get started.'
                : 'Try adjusting your search or filters.'}
            </p>
            {sneakers.length === 0 && (
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowForm(true)}
                  className="px-5 py-2.5 bg-red-600 text-white text-sm font-medium rounded-xl hover:bg-red-500 transition-colors"
                >
                  Add Sneaker
                </button>
                <button
                  onClick={() => setShowImport(true)}
                  className="px-5 py-2.5 bg-zinc-800 text-white text-sm font-medium rounded-xl border border-zinc-700 hover:bg-zinc-700 transition-colors"
                >
                  Import Collection
                </button>
              </div>
            )}
          </div>
        ) : viewMode === 'list' ? (
          <SneakerListView
            sneakers={sortedAndFiltered}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onIncrementWorn={handleWear}
          />
        ) : viewMode === 'table' ? (
          <SneakerTableView
            sneakers={sortedAndFiltered}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onIncrementWorn={handleWear}
          />
        ) : (
          <div className="flex flex-none flex-wrap flex-row items-start justify-start gap-3 mt-8">
            {sortedAndFiltered.map(sneaker => (
              <SneakerCard
                key={sneaker.id}
                sneaker={sneaker}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </main>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-4 left-4 right-4 sm:left-1/2 sm:right-auto sm:-translate-x-1/2 sm:w-auto z-50 animate-in">
          <div className={`flex items-center gap-2 px-4 py-3 rounded-xl border shadow-lg backdrop-blur-sm text-sm font-medium ${
            toast.type === 'success'
              ? 'bg-emerald-950/90 text-emerald-300 border-emerald-500/30'
              : 'bg-red-950/90 text-red-300 border-red-500/30'
          }`}>
            {toast.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            {toast.message}
          </div>
        </div>
      )}

      {/* Modals */}
      {showForm && (
        <SneakerForm
          onSave={handleSave}
          onCancel={() => { setShowForm(false); setEditSneaker(null); }}
          onOpenSubscriptionModal={handleOpenSubscriptionModal}
        />
      )}

      {editSneaker && (
        <SneakerForm
          sneaker={editSneaker}
          onSave={handleSave}
          onCancel={() => setEditSneaker(null)}
          onOpenSubscriptionModal={handleOpenSubscriptionModal}
        />
      )}

      {showImport && (
        <FileUpload
          onImport={handleImport}
          onClose={() => setShowImport(false)}
          onOpenSubscriptionModal={handleOpenSubscriptionModal}
        />
      )}

      {showPicker && (
        <SneakerPicker
          sneakers={sneakers}
          onWear={handleWear}
          onClose={() => setShowPicker(false)}
          resultCount={pickerResultCount}
          onOpenSubscriptionModal={handleOpenSubscriptionModal}
        />
      )}

      <SubscriptionModal
        isOpen={showSubscriptionModal}
        onClose={() => setShowSubscriptionModal(false)}
        triggerReason={subscriptionReason}
      />

      {showPhotoGuide && (
        <PhotoGuideModal
          isOpen={showPhotoGuide}
          onClose={() => setShowPhotoGuide(false)}
        />
      )}

      {/* Account Settings Modal */}
      {showSettingsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-zinc-900 border border-zinc-800/90 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 sm:px-6 sm:py-4 border-b border-zinc-800 bg-zinc-950/80 shrink-0">
              <div className="flex items-center gap-3">
                <Settings className="w-5 h-5 text-red-500 shrink-0" />
                <div>
                  <h2 className="text-base font-bold text-zinc-100">Account Settings</h2>
                  <p className="text-xs text-zinc-400">Manage profile, avatar, subscription & preferences</p>
                </div>
              </div>
              <button
                onClick={() => setShowSettingsModal(false)}
                className="p-1.5 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer focus:outline-none"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Tabs Bar */}
            <div className="flex border-b border-zinc-800 bg-zinc-950/40 px-4 pt-2 gap-1 shrink-0 overflow-x-auto">
              <button
                type="button"
                onClick={() => setSettingsTab('profile')}
                className={`pb-3 px-3 text-xs font-semibold flex items-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                  settingsTab === 'profile'
                    ? 'border-red-500 text-white'
                    : 'border-transparent text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <User className="w-4 h-4 text-red-400" />
                <span>Profile & Avatar</span>
              </button>

              <button
                type="button"
                onClick={() => setSettingsTab('subscription')}
                className={`pb-3 px-3 text-xs font-semibold flex items-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                  settingsTab === 'subscription'
                    ? 'border-amber-500 text-white'
                    : 'border-transparent text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <Crown className="w-4 h-4 text-amber-400" />
                <span>Subscription</span>
              </button>

              <button
                type="button"
                onClick={() => setSettingsTab('preferences')}
                className={`pb-3 px-3 text-xs font-semibold flex items-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                  settingsTab === 'preferences'
                    ? 'border-sky-500 text-white'
                    : 'border-transparent text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <Footprints className="w-4 h-4 text-sky-400" />
                <span>Sneaker Options</span>
              </button>
            </div>
            
            {/* Modal Body */}
            <div className="p-5 overflow-y-auto space-y-5 text-left flex-1">
              {/* TAB 1: PROFILE & AVATAR */}
              {settingsTab === 'profile' && user && (
                <form onSubmit={handleSaveProfile} className="space-y-5">
                  {/* Avatar Live Preview & Header */}
                  <div className="p-4 rounded-2xl bg-zinc-950/90 border border-zinc-800/80 flex items-center gap-4">
                    <div className="relative shrink-0">
                      <img
                        src={newAvatarUrl || user.user_metadata?.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(user.email)}`}
                        alt="Avatar Preview"
                        className="w-16 h-16 rounded-2xl object-cover border-2 border-zinc-700 bg-zinc-900 shadow-md"
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(newUsername || 'SneakerHead')}`;
                        }}
                      />
                      <span className={`absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full text-black font-black text-[9px] shadow-lg ${
                        tier === 'premium'
                          ? 'bg-amber-400 text-zinc-950'
                          : tier === 'pro'
                          ? 'bg-cyan-400 text-zinc-950'
                          : 'bg-emerald-400 text-zinc-950'
                      }`}>
                        <Crown className="w-3 h-3 fill-current" />
                      </span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-bold text-white truncate">
                        {newUsername || user.user_metadata?.username || user.email.split('@')[0]}
                      </div>
                      <div className="text-xs text-zinc-400 truncate">
                        {user.email}
                      </div>
                      <div className="inline-flex items-center gap-1 mt-1 text-[9px] font-extrabold px-2 py-0.5 rounded bg-zinc-800 text-amber-300 border border-zinc-700 uppercase">
                        <Crown className="w-2.5 h-2.5 text-amber-400" />
                        <span>{config.badge} Member</span>
                      </div>
                    </div>
                  </div>

                  {/* Username Handle Input */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider">
                      Username
                    </label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                      <input
                        type="text"
                        required
                        value={newUsername}
                        onChange={(e) => setNewUsername(e.target.value)}
                        placeholder="e.g. SneakerHead99"
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-red-500/80 focus:ring-1 focus:ring-red-500/30 transition-all font-medium"
                      />
                    </div>
                    <p className="text-[11px] text-zinc-500">Visible on your sneaker locker and daily activity.</p>
                  </div>

                  {/* Avatar Upload Box */}
                  <div className="space-y-2">
                    <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider">
                      Avatar Image
                    </label>

                    {/* Drag & Drop / File Selector Box */}
                    <div
                      onDragOver={handleAvatarDragOver}
                      onDragLeave={handleAvatarDragLeave}
                      onDrop={handleAvatarDrop}
                      className={`relative border-2 border-dashed rounded-2xl p-5 text-center transition-all flex flex-col items-center justify-center cursor-pointer ${
                        isDraggingAvatar
                          ? 'border-red-500 bg-red-500/10 scale-[1.01]'
                          : 'border-zinc-800 hover:border-zinc-700 bg-zinc-950/60 hover:bg-zinc-950'
                      }`}
                    >
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarFileUpload}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      />
                      
                      <div className="flex items-center justify-center gap-2 mb-2">
                        <Upload className="w-5 h-5 text-red-500" />
                        <Camera className="w-5 h-5 text-zinc-400" />
                      </div>

                      <span className="text-xs font-bold text-zinc-200">
                        Upload Your Own Photo
                      </span>
                      <span className="text-[11px] text-zinc-400 mt-0.5">
                        Click to browse or drag and drop an image file
                      </span>
                      <span className="text-[10px] text-zinc-500 mt-1">
                        PNG, JPG, WEBP, GIF up to 10MB
                      </span>
                    </div>

                    {/* Preset Avatars or Custom URL options */}
                    <div className="pt-2 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-semibold text-zinc-400">Or pick a preset avatar:</span>
                        {newAvatarUrl && (
                          <button
                            type="button"
                            onClick={() => setNewAvatarUrl('')}
                            className="text-[10px] text-zinc-500 hover:text-zinc-300 flex items-center gap-1 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3 h-3" />
                            <span>Reset Photo</span>
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-8 gap-1.5">
                        {AVATAR_PRESETS.map((preset) => {
                          const isSelected = newAvatarUrl === preset.url;
                          return (
                            <button
                              key={preset.id}
                              type="button"
                              onClick={() => setNewAvatarUrl(preset.url)}
                              className={`relative p-0.5 rounded-xl border transition-all cursor-pointer aspect-square flex items-center justify-center ${
                                isSelected
                                  ? 'bg-red-500/20 border-red-500 ring-2 ring-red-500/30 scale-105'
                                  : 'bg-zinc-950 border-zinc-800 hover:border-zinc-700'
                              }`}
                              title={preset.label}
                            >
                              <img
                                src={preset.url}
                                alt={preset.label}
                                className="w-full h-full object-cover rounded-lg"
                              />
                            </button>
                          );
                        })}
                      </div>


                    </div>
                  </div>

                  {profileStatus && (
                    <div className={`text-xs font-medium flex items-center gap-2 p-3 rounded-xl border ${
                      profileStatus.type === 'success'
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                        : 'bg-red-500/10 border-red-500/30 text-red-400'
                    }`}>
                      {profileStatus.type === 'success' ? <Check className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
                      <span>{profileStatus.message}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isSavingProfile || !newUsername.trim()}
                    className="w-full py-3 bg-red-600 hover:bg-red-500 disabled:bg-zinc-800 disabled:text-zinc-500 text-white text-xs font-bold rounded-xl transition-all cursor-pointer disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-red-600/20"
                  >
                    {isSavingProfile ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Saving Profile Changes...</span>
                      </>
                    ) : (
                      'Save Profile Changes'
                    )}
                  </button>
                </form>
              )}

              {/* TAB 2: SUBSCRIPTION */}
              {settingsTab === 'subscription' && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-xs font-bold text-zinc-300 uppercase tracking-wider">
                    <Crown className="w-4 h-4 text-amber-400" />
                    <span>Your Membership Plan</span>
                  </div>

                  <div className={`p-4 rounded-2xl border flex flex-col gap-3 ${
                    tier === 'premium'
                      ? 'bg-gradient-to-r from-amber-500/15 via-purple-500/10 to-amber-500/10 border-amber-500/40'
                      : tier === 'pro'
                      ? 'bg-gradient-to-r from-blue-500/15 to-cyan-500/10 border-cyan-500/40'
                      : 'bg-zinc-950 border-zinc-800'
                  }`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-black text-white">{config.name} Plan</span>
                        <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded border uppercase tracking-wider ${
                          tier === 'premium'
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                            : tier === 'pro'
                            ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                            : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                        }`}>
                          {config.badge}
                        </span>
                      </div>
                      <Crown className="w-5 h-5 text-amber-400" />
                    </div>

                    <div className="space-y-2 pt-1 text-xs">
                      {config.features.map((feat, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          {feat.included ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                              <span className="text-zinc-200 font-medium">{feat.text}</span>
                            </>
                          ) : (
                            <>
                              <X className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                              <span className="text-zinc-500 line-through decoration-zinc-700">{feat.text}</span>
                            </>
                          )}
                        </div>
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setShowSettingsModal(false);
                        handleOpenSubscriptionModal();
                      }}
                      className="mt-2 w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-extrabold text-xs rounded-xl transition-all cursor-pointer shadow-md shadow-amber-500/20 flex items-center justify-center gap-1.5"
                    >
                      <Crown className="w-4 h-4 fill-current" />
                      <span>{tier === 'free' ? 'Upgrade Plan' : 'Manage Subscription Plans'}</span>
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 3: SNEAKER & PICKER OPTIONS (LAST) */}
              {settingsTab === 'preferences' && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-xs font-bold text-zinc-300 uppercase tracking-wider">
                    <Footprints className="w-4 h-4 text-sky-400" />
                    <span>Sneaker & Picker Options</span>
                  </div>

                  <div className="p-4 rounded-2xl bg-zinc-950/80 border border-zinc-800/80 space-y-3">
                    <div>
                      <label className="block text-xs font-semibold text-zinc-200">
                        Spin the wheel options
                      </label>
                      <p className="text-xs text-zinc-400 mt-0.5">
                        Choose how many sneaker options are presented when you spin the sneaker roulette wheel.
                      </p>
                    </div>

                    <div className="grid grid-cols-3 gap-2.5 pt-1">
                      {([1, 3, 5] as const).map((num) => (
                        <button
                          key={num}
                          type="button"
                          onClick={() => {
                            setPickerResultCount(num);
                            safeLocalStorage.setItem('picker_result_count', num.toString());
                            setToast({ type: 'success', message: `Picker updated to ${num} ${num === 1 ? 'option' : 'options'}` });
                          }}
                          className={`py-3 px-2 rounded-xl text-xs font-bold border transition-all cursor-pointer flex flex-col items-center justify-center gap-1 ${
                            pickerResultCount === num
                              ? 'bg-sky-500/15 text-sky-300 border-sky-500/50 shadow-md shadow-sky-500/10 ring-1 ring-sky-500/30'
                              : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:border-zinc-700 hover:text-zinc-200'
                          }`}
                        >
                          <span className="text-sm font-black">{num}</span>
                          <span className="text-[10px] font-medium opacity-80">{num === 1 ? 'Choice' : 'Choices'}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-zinc-950/80 border-t border-zinc-800/80 flex justify-end shrink-0">
              <button
                onClick={() => setShowSettingsModal(false)}
                className="px-5 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 hover:text-white text-xs font-semibold rounded-xl transition-all cursor-pointer focus:outline-none"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {sneakerToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl flex flex-col animate-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 p-4 sm:p-5 border-b border-zinc-800 bg-zinc-900 shrink-0">
              <div className="p-2 bg-red-500/10 rounded-xl text-red-500 shrink-0">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-zinc-100">Delete Sneaker</h2>
                <p className="text-xs text-zinc-500 mt-0.5">This action is permanent</p>
              </div>
            </div>
            
            <div className="p-5">
              <p className="text-sm text-zinc-300 leading-relaxed">
                Are you sure you want to delete <strong className="text-zinc-100 font-semibold">{sneakerToDelete.name || 'this unnamed sneaker'}</strong> from your locker?
              </p>
            </div>

            <div className="p-4 bg-zinc-950/40 border-t border-zinc-800/60 flex items-center justify-end gap-2.5">
              <button
                onClick={() => setSneakerToDelete(null)}
                className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white text-xs font-semibold rounded-xl transition-all cursor-pointer focus:outline-none"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-red-600/10 hover:shadow-red-500/20 transition-all cursor-pointer focus:outline-none"
              >
                Delete Sneaker
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Back to Top Button */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 15 }}
            onClick={scrollToTop}
            className="fixed bottom-6 right-6 z-50 p-3.5 rounded-full bg-rose-600/20 hover:bg-rose-600/30 text-rose-500 border border-rose-700/20 hover:border-rose-600/45 shadow-xl transition-all cursor-pointer focus:outline-none flex items-center justify-center group"
            title="Back to Top"
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
          >
            <ChevronUp className="w-5 h-5 text-rose-400 group-hover:text-rose-300 transition-colors" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
