import { useState, useEffect, useCallback } from 'react';
import { supabase, Sneaker, SneakerInsert, buildName } from '../lib/supabase';
import { safeLocalStorage } from '../lib/utils';

const DEFAULT_SNEAKERS: Sneaker[] = [
  {
    id: '1',
    name: 'Nike Air Jordan 1 Retro High Chicago',
    brand: 'Nike',
    model: 'Air Jordan 1',
    variant: 'Retro High',
    colorway: 'Chicago',
    height: 'High',
    style: ['Athletic', 'Basketball', 'Lifestyle'],
    color: ['White', 'Red', 'Black'],
    worn: 12,
    image_url: '/icons/sportshoe.png',
    condition: 'VNDS (Very Near Deadstock)',
    gallery_images: ['/icons/sportshoe.png', '/icons/sportshoe-white.png'],
    dates_worn: [
      new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(),
      new Date(Date.now() - 12 * 24 * 3600 * 1000).toISOString(),
      new Date(Date.now() - 25 * 24 * 3600 * 1000).toISOString(),
      new Date(Date.now() - 45 * 24 * 3600 * 1000).toISOString(),
      new Date(Date.now() - 70 * 24 * 3600 * 1000).toISOString(),
      new Date(Date.now() - 110 * 24 * 3600 * 1000).toISOString(),
      new Date(Date.now() - 150 * 24 * 3600 * 1000).toISOString(),
      new Date(Date.now() - 200 * 24 * 3600 * 1000).toISOString(),
      new Date(Date.now() - 250 * 24 * 3600 * 1000).toISOString(),
      new Date(Date.now() - 300 * 24 * 3600 * 1000).toISOString(),
      new Date(Date.now() - 330 * 24 * 3600 * 1000).toISOString(),
      new Date(Date.now() - 360 * 24 * 3600 * 1000).toISOString(),
    ],
    last_worn: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(),
    created_at: new Date(Date.now() - 365 * 24 * 3600 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 365 * 24 * 3600 * 1000).toISOString(),
  },
  {
    id: '2',
    name: 'Adidas Yeezy Boost 350 V2 Zebra',
    brand: 'Adidas',
    model: 'Yeezy Boost 350',
    variant: 'V2',
    colorway: 'Zebra',
    height: 'Low',
    style: ['Lifestyle', 'Casual'],
    color: ['White', 'Black'],
    worn: 5,
    image_url: '/icons/sportshoe-white.png',
    condition: 'Deadstock (DS)',
    gallery_images: ['/icons/sportshoe-white.png'],
    dates_worn: [
      new Date(Date.now() - 10 * 24 * 3600 * 1000).toISOString(),
      new Date(Date.now() - 40 * 24 * 3600 * 1000).toISOString(),
      new Date(Date.now() - 90 * 24 * 3600 * 1000).toISOString(),
      new Date(Date.now() - 160 * 24 * 3600 * 1000).toISOString(),
      new Date(Date.now() - 220 * 24 * 3600 * 1000).toISOString(),
    ],
    last_worn: new Date(Date.now() - 10 * 24 * 3600 * 1000).toISOString(),
    created_at: new Date(Date.now() - 250 * 24 * 3600 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 250 * 24 * 3600 * 1000).toISOString(),
  },
  {
    id: '3',
    name: 'Converse Chuck Taylor All Star Classic Black',
    brand: 'Converse',
    model: 'Chuck Taylor All Star',
    variant: 'Classic',
    colorway: 'Black',
    height: 'High',
    style: ['Lifestyle', 'Casual', 'Canvas'],
    color: ['Black', 'White'],
    worn: 24,
    image_url: '/icons/sportshoe.png',
    condition: 'Good',
    gallery_images: ['/icons/sportshoe.png', '/icons/sportshoe-white.png'],
    dates_worn: Array.from({ length: 24 }, (_, i) => new Date(Date.now() - (i + 1) * 14 * 24 * 3600 * 1000).toISOString()),
    last_worn: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString(),
    created_at: new Date(Date.now() - 365 * 24 * 3600 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 365 * 24 * 3600 * 1000).toISOString(),
  },
];

export const isSupabaseConfigured = !!(
  import.meta.env.VITE_SUPABASE_URL &&
  import.meta.env.VITE_SUPABASE_URL.trim() !== '' &&
  import.meta.env.VITE_SUPABASE_URL !== 'https://placeholder.supabase.co' &&
  !import.meta.env.VITE_SUPABASE_URL.includes('<') &&
  !import.meta.env.VITE_SUPABASE_URL.includes('[') &&
  !import.meta.env.VITE_SUPABASE_URL.includes('your-') &&
  !import.meta.env.VITE_SUPABASE_URL.includes('your_') &&
  import.meta.env.VITE_SUPABASE_ANON_KEY &&
  import.meta.env.VITE_SUPABASE_ANON_KEY.trim() !== '' &&
  import.meta.env.VITE_SUPABASE_ANON_KEY !== 'placeholder' &&
  !import.meta.env.VITE_SUPABASE_ANON_KEY.includes('<') &&
  !import.meta.env.VITE_SUPABASE_ANON_KEY.includes('[') &&
  !import.meta.env.VITE_SUPABASE_ANON_KEY.includes('your-') &&
  !import.meta.env.VITE_SUPABASE_ANON_KEY.includes('your_')
);

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isValidUuid(id?: string): boolean {
  if (!id) return false;
  return UUID_REGEX.test(id);
}

export function useSneakers(userId?: string) {
  const [sneakers, setSneakers] = useState<Sneaker[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [usingLocalStorageFallback, setUsingLocalStorageFallback] = useState(false);

  const fetchSneakers = useCallback(async () => {
    if (!userId) {
      setSneakers([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const isLiveMode = isSupabaseConfigured && userId !== 'guest-user-bypass' && isValidUuid(userId);

    if (!isLiveMode) {
      setUsingLocalStorageFallback(false);
      // Scoped local storage keys by userId to isolate user accounts locally!
      try {
        const storageKey = `sneakers_inventory_${userId}`;
        const stored = safeLocalStorage.getItem(storageKey);
        if (stored) {
          setSneakers(JSON.parse(stored));
        } else {
          // Put default sneakers in first time
          safeLocalStorage.setItem(storageKey, JSON.stringify(DEFAULT_SNEAKERS));
          setSneakers(DEFAULT_SNEAKERS);
        }
      } catch (e) {
        console.error('Error fetching sneakers from localStorage:', e);
      }
      setLoading(false);
      return;
    }

    // Live user-scoped Supabase mode
    try {
      const { data, error } = await supabase
        .from('sneakers')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      setSneakers(data || []);
      setUsingLocalStorageFallback(false);
    } catch (e: unknown) {
      const err = e as Error;
      console.warn('Error querying Supabase database:', err);
      setError(err.message || 'Failed to connect to Supabase database.');
      setUsingLocalStorageFallback(true);
      // Scoped local storage fallback
      try {
        const storageKey = `sneakers_inventory_${userId}`;
        const stored = safeLocalStorage.getItem(storageKey);
        setSneakers(stored ? JSON.parse(stored) : DEFAULT_SNEAKERS);
      } catch {
        // Fallback silently if localStorage fails or is empty
      }
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchSneakers();
  }, [fetchSneakers]);

  const saveToStorage = (updated: Sneaker[]) => {
    if (userId) {
      safeLocalStorage.setItem(`sneakers_inventory_${userId}`, JSON.stringify(updated));
    }
    setSneakers(updated);
  };

  const addSneaker = async (sneaker: SneakerInsert) => {
    if (!userId) return null;
    const name = buildName(sneaker.brand, sneaker.model, sneaker.variant || '', sneaker.colorway);
    
    const isLiveMode = isSupabaseConfigured && userId !== 'guest-user-bypass' && isValidUuid(userId) && !usingLocalStorageFallback;

    if (!isLiveMode) {
      const newSneaker: Sneaker = {
        ...sneaker,
        id: crypto.randomUUID?.() || Math.random().toString(36).substring(2, 11),
        name,
        variant: sneaker.variant || '',
        user_id: userId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      const updated = [newSneaker, ...sneakers];
      saveToStorage(updated);
      return newSneaker;
    }

    try {
      const { data, error } = await supabase
        .from('sneakers')
        .insert({
          ...sneaker,
          name,
          variant: sneaker.variant || '',
          user_id: userId,
        })
        .select()
        .single();

      if (error) throw error;
      setSneakers(prev => [data, ...prev]);
      return data;
    } catch (e) {
      console.warn('Supabase addSneaker error:', e);
      return null;
    }
  };

  const addSneakersBatch = async (sneakersData: SneakerInsert[]) => {
    if (!userId) return null;
    
    const isLiveMode = isSupabaseConfigured && userId !== 'guest-user-bypass' && isValidUuid(userId) && !usingLocalStorageFallback;

    if (!isLiveMode) {
      const withNames: Sneaker[] = sneakersData.map(s => {
        const name = buildName(s.brand, s.model, s.variant || '', s.colorway);
        return {
          ...s,
          id: crypto.randomUUID?.() || Math.random().toString(36).substring(2, 11),
          name,
          variant: s.variant || '',
          user_id: userId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
      });
      const updated = [...withNames, ...sneakers];
      saveToStorage(updated);
      return withNames;
    }

    try {
      const formatted = sneakersData.map(s => ({
        ...s,
        name: buildName(s.brand, s.model, s.variant || '', s.colorway),
        variant: s.variant || '',
        user_id: userId,
      }));

      const { data, error } = await supabase
        .from('sneakers')
        .insert(formatted)
        .select();

      if (error) throw error;
      setSneakers(prev => [...(data || []), ...prev]);
      return data || [];
    } catch (e) {
      console.warn('Supabase addSneakersBatch error:', e);
      return null;
    }
  };

  const updateSneaker = async (id: string, updates: Partial<SneakerInsert>) => {
    if (!userId) return null;

    const isLiveMode = isSupabaseConfigured && userId !== 'guest-user-bypass' && isValidUuid(userId) && !usingLocalStorageFallback;

    if (!isLiveMode) {
      const current = sneakers.find(s => s.id === id);
      if (!current) return null;

      const b = updates.brand !== undefined ? updates.brand : current.brand;
      const m = updates.model !== undefined ? updates.model : current.model;
      const v = updates.variant !== undefined ? updates.variant : current.variant;
      const c = updates.colorway !== undefined ? updates.colorway : current.colorway;
      const name = buildName(b, m, v, c);

      const updatedSneaker: Sneaker = {
        ...current,
        ...updates,
        variant: v || '',
        name,
        updated_at: new Date().toISOString(),
      };

      const updatedList = sneakers.map(s => s.id === id ? updatedSneaker : s);
      saveToStorage(updatedList);
      return updatedSneaker;
    }

    try {
      const current = sneakers.find(s => s.id === id);
      const b = updates.brand !== undefined ? updates.brand : current?.brand || '';
      const m = updates.model !== undefined ? updates.model : current?.model || '';
      const v = updates.variant !== undefined ? updates.variant : current?.variant || '';
      const c = updates.colorway !== undefined ? updates.colorway : current?.colorway || '';
      const name = buildName(b, m, v, c);

      const { data, error } = await supabase
        .from('sneakers')
        .update({
          ...updates,
          name,
          variant: v,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .eq('user_id', userId) // guarantee ownership validation
        .select()
        .single();

      if (error) throw error;
      setSneakers(prev => prev.map(s => s.id === id ? data : s));
      return data;
    } catch (e) {
      console.warn('Supabase updateSneaker error:', e);
      return null;
    }
  };

  const deleteSneaker = async (id: string) => {
    if (!userId) return false;

    const isLiveMode = isSupabaseConfigured && userId !== 'guest-user-bypass' && isValidUuid(userId) && !usingLocalStorageFallback;

    if (!isLiveMode) {
      const updatedList = sneakers.filter(s => s.id !== id);
      saveToStorage(updatedList);
      return true;
    }

    try {
      const { error } = await supabase
        .from('sneakers')
        .delete()
        .eq('id', id)
        .eq('user_id', userId); // guarantee ownership validation

      if (error) throw error;
      setSneakers(prev => prev.filter(s => s.id !== id));
      return true;
    } catch (e) {
      console.warn('Supabase deleteSneaker error:', e);
      return false;
    }
  };

  const incrementWorn = async (id: string) => {
    const sneaker = sneakers.find(s => s.id === id);
    if (!sneaker) return null;
    const nowIso = new Date().toISOString();
    const existingDates = Array.isArray(sneaker.dates_worn) ? sneaker.dates_worn : [];
    return updateSneaker(id, { 
      worn: (sneaker.worn || 0) + 1,
      last_worn: nowIso,
      dates_worn: [nowIso, ...existingDates],
    });
  };

  return {
    sneakers,
    loading,
    error,
    isSupabaseConfigured,
    usingLocalStorageFallback,
    fetchSneakers,
    addSneaker,
    addSneakersBatch,
    updateSneaker,
    deleteSneaker,
    incrementWorn,
  };
}
