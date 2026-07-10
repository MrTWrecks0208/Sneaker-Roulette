import { useState } from 'react';
import { useSneakers } from './hooks/useSneakers';
import { useAuth } from './hooks/useAuth';
import SignIn from './components/SignIn';
import { SneakerInsert, Sneaker } from './lib/supabase';
import SneakerCard from './components/SneakerCard';
import SneakerForm from './components/SneakerForm';
import FileUpload from './components/FileUpload';
import SneakerPicker from './components/SneakerPicker';
import {
  Plus, Upload, Search, Footprints,
  SlidersHorizontal, X, AlertCircle, CheckCircle2, Database, LogOut
} from 'lucide-react';
import pinwheelIcon from '../icons/loader-pinwheel.png';

function App() {
  const { user, loading: authLoading, signOut } = useAuth();
  const { sneakers, loading, error, isSupabaseConfigured, addSneaker, addSneakersBatch, updateSneaker, deleteSneaker, incrementWorn } = useSneakers(user?.id);
  const isGuest = user?.id === 'guest-user-bypass';
  const isLive = isSupabaseConfigured && !isGuest;
  const [showForm, setShowForm] = useState(false);
  const [editSneaker, setEditSneaker] = useState<Sneaker | null>(null);
  const [showImport, setShowImport] = useState(false);
  const [showPicker, setShowPicker] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterBrand, setFilterBrand] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  const brands = [...new Set(sneakers.map(s => s.brand))].sort();

  const filtered = sneakers.filter(s => {
    const matchesSearch = !searchQuery ||
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.colorway.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesBrand = !filterBrand || s.brand === filterBrand;
    return matchesSearch && matchesBrand;
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

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this sneaker?')) {
      const ok = await deleteSneaker(id);
      if (ok) showToast('success', 'Sneaker deleted');
      else showToast('error', 'Failed to delete sneaker');
    }
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

  return (
    <div className="min-h-screen bg-zinc-950">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-zinc-950/80 backdrop-blur-xl border-b border-zinc-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center">
                <Footprints className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-lg font-bold text-zinc-100 leading-tight">Sneaker Roulette </h1>
                  {isLive ? (
                    <span className="flex h-2 w-2 relative" title="Connected to Supabase Live">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                  ) : (
                    <span className="flex h-2 w-2 rounded-full bg-amber-500" title="Running in Local Sandbox Mode"></span>
                  )}
                </div>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <p className="text-[10px] text-zinc-500 uppercase tracking-widest leading-none">Inventory</p>
                  <span className="text-[9px] px-1 py-0.5 bg-zinc-900 text-zinc-400 border border-zinc-800/80 rounded">
                    {isLive ? 'Supabase Live' : (isGuest ? 'Guest Sandbox' : 'Local Sandbox')}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowPicker(true)}
                className="hidden sm:flex items-center gap-2 px-4 py-2 bg-emerald-600/10 text-emerald-400 text-sm font-medium rounded-2xl border border-emerald-500/20 hover:bg-emerald-600/20 transition-colors cursor-pointer"
              >
                <img src={pinwheelIcon} alt="" className="w-4 h-4" />
                Spin the Wheel
              </button>
              <button
                onClick={() => setShowImport(true)}
                className="hidden sm:flex items-center gap-2 px-4 py-2 bg-zinc-800 text-white text-sm font-medium rounded-2xl border border-zinc-700 hover:bg-zinc-700 transition-colors cursor-pointer"
              >
                <Upload className="w-4 h-4" />
                Import
              </button>
              <button
                onClick={() => setShowForm(true)}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-2xl hover:bg-red-500 transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Add Sneaker</span>
              </button>

              <div className="h-8 w-px bg-zinc-800/80 mx-1 hidden sm:block" />

              <div className="flex items-center gap-2.5">
                <img
                  src={user.user_metadata?.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(user.email)}`}
                  alt="Avatar"
                  className="w-8 h-8 rounded-xl object-cover border border-zinc-800 bg-zinc-900"
                  referrerPolicy="no-referrer"
                />
                <div className="hidden md:flex flex-col text-left">
                  <span className="text-xs font-semibold text-zinc-200 truncate max-w-[120px]">
                    {user.user_metadata?.username || user.user_metadata?.full_name || user.email.split('@')[0]}
                  </span>
                  <span className="text-[10px] text-zinc-500 truncate max-w-[120px]">
                    {user.email}
                  </span>
                </div>
                <button
                  onClick={() => signOut()}
                  title="Sign Out"
                  className="p-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800/80 hover:border-zinc-700 text-zinc-400 hover:text-red-400 rounded-xl transition-all cursor-pointer"
                >
                  <LogOut className="w-4.5 h-4.5" />
                </button>
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
          <div className="bg-red-500/5 border border-red-500/20 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4 text-red-200">
            <div className="p-2.5 bg-red-500/10 rounded-xl text-red-400 shrink-0">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div className="flex-1 space-y-1">
              <h4 className="text-sm font-semibold text-red-300">Supabase Connection Error</h4>
              <p className="text-xs text-red-400/80 leading-relaxed">
                Vite is using your custom Supabase environment variables but failed to connect: <span className="font-mono text-red-200">{error}</span>. Please verify that your keys are correct and your <code>sneakers</code> table is fully setup in your Supabase SQL editor.
              </p>
            </div>
          </div>
        )}

        {isLive && !error && (
          <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4 text-emerald-200">
            <div className="p-2.5 bg-emerald-500/10 rounded-xl text-emerald-400 shrink-0">
              <Database className="w-5 h-5" />
            </div>
            <div className="flex-1 space-y-1">
              <h4 className="text-sm font-semibold text-emerald-300">Connected to Live Supabase Database</h4>
              <p className="text-xs text-emerald-400/80 leading-relaxed">
                Successfully synchronized! All sneaker additions, spin history, and details are stored directly in your secure cloud-hosted database.
              </p>
            </div>
          </div>
        )}
        {/* Mobile action buttons */}
        <div className="flex sm:hidden gap-2">
          <button
            onClick={() => setShowPicker(true)}
            className="flex-1 flex items-center justify-center gap-2 py-3 bg-emerald-600/10 text-emerald-400 text-sm font-medium rounded-xl border border-emerald-500/20"
          >
            <img src={pinwheelIcon} alt="" className="w-10 h-10" /> Spin the Wheel
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
          <div className="flex items-center gap-3">
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
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`p-2.5 rounded-xl border transition-colors ${
                showFilters ? 'bg-zinc-800 border-zinc-600 text-zinc-200' : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <SlidersHorizontal className="w-4 h-4" />
            </button>
          </div>

          {showFilters && brands.length > 0 && (
            <div className="flex flex-wrap gap-2 animate-in">
              <button
                onClick={() => setFilterBrand('')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border ${
                  !filterBrand ? 'bg-red-600/20 text-red-400 border-red-500/40' : 'bg-zinc-900 text-zinc-400 border-zinc-800'
                }`}
              >
                All Brands
              </button>
              {brands.map(b => (
                <button
                  key={b}
                  onClick={() => setFilterBrand(b === filterBrand ? '' : b)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border ${
                    filterBrand === b ? 'bg-red-600/20 text-red-400 border-red-500/40' : 'bg-zinc-900 text-zinc-400 border-zinc-800'
                  }`}
                >
                  {b}
                </button>
              ))}
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
        ) : (
          <div className="flex flex-none flex-wrap flex-row items-start justify-start gap-3 mt-8">
            {filtered.map(sneaker => (
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
        />
      )}

      {editSneaker && (
        <SneakerForm
          sneaker={editSneaker}
          onSave={handleSave}
          onCancel={() => setEditSneaker(null)}
        />
      )}

      {showImport && (
        <FileUpload
          onImport={handleImport}
          onClose={() => setShowImport(false)}
        />
      )}

      {showPicker && (
        <SneakerPicker
          sneakers={sneakers}
          onWear={handleWear}
          onClose={() => setShowPicker(false)}
        />
      )}
    </div>
  );
}

export default App;
