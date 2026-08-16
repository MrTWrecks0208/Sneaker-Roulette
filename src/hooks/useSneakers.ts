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
    thumbnail_url: '/icons/sportshoe.png',
    image_url: '/icons/sportshoe.png',
    images: ['/icons/sportshoe.png', '/icons/sportshoe-white.png'],
    dates_worn: [
      new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(),
      new Date(Date.now() - 14 * 24 * 3600 * 1000).toISOString(),
      new Date(Date.now() - 28 * 24 * 3600 * 1000).toISOString(),
      new Date(Date.now() - 42 * 24 * 3600 * 1000).toISOString(),
      new Date(Date.now() - 56 * 24 * 3600 * 1000).toISOString(),
    ],
    last_worn: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(),
    created_at: new Date(Date.now() - 60 * 24 * 3600 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(),
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
    thumbnail_url: '/icons/sportshoe-white.png',
    image_url: '/icons/sportshoe-white.png',
    images: ['/icons/sportshoe-white.png', '/icons/sportshoe.png'],
    dates_worn: [
      new Date(Date.now() - 10 * 24 * 3600 * 1000).toISOString(),
      new Date(Date.now() - 25 * 24 * 3600 * 1000).toISOString(),
      new Date(Date.now() - 40 * 24 * 3600 * 1000).toISOString(),
    ],
    last_worn: new Date(Date.now() - 10 * 24 * 3600 * 1000).toISOString(),
    created_at: new Date(Date.now() - 45 * 24 * 3600 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 10 * 24 * 3600 * 1000).toISOString(),
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
    thumbnail_url: '/icons/sportshoe.png',
    image_url: '/icons/sportshoe.png',
    images: ['/icons/sportshoe.png'],
    dates_worn: [
      new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString(),
      new Date(Date.now() - 4 * 24 * 3600 * 1000).toISOString(),
      new Date(Date.now() - 8 * 24 * 3600 * 1000).toISOString(),
      new Date(Date.now() - 12 * 24 * 3600 * 1000).toISOString(),
      new Date(Date.now() - 16 * 24 * 3600 * 1000).toISOString(),
    ],
    last_worn: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString(),
    created_at: new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString(),
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

function extractMissingColumn(errorMessage?: string): string | null {
  if (!errorMessage) return null;
  const match =
    errorMessage.match(/could not find the\s+['"]?([a-zA-Z0-9_]+)['"]?\s+column/i) ||
    errorMessage.match(/column\s+['"]?([a-zA-Z0-9_]+)['"]?\s+of relation/i) ||
    errorMessage.match(/column\s+['"]?([a-zA-Z0-9_]+)['"]?\s+does not exist/i) ||
    errorMessage.match(/attribute\s+['"]?([a-zA-Z0-9_]+)['"]?\s+does not exist/i) ||
    errorMessage.match(/column\s+['"]?([a-zA-Z0-9_]+)['"]?\s+not found/i);
  return match ? match[1] : null;
}

// Resilient insert helper that automatically recovers if unmigrated columns do not exist in the database table
async function resilientSupabaseInsert(basePayload: Record<string, unknown>) {
  const currentPayload: Record<string, unknown> = { ...basePayload };
  const removedColumns = new Set<string>();

  for (let attempt = 0; attempt < 12; attempt++) {
    const { data, error } = await supabase
      .from('sneakers')
      .insert(currentPayload)
      .select();

    if (!error) {
      return { data, error: null };
    }

    const isColumnMissingError =
      error.code === '42703' ||
      error.code === 'PGRST204' ||
      (error.message &&
        (error.message.toLowerCase().includes('column') ||
         error.message.toLowerCase().includes('schema cache') ||
         error.message.toLowerCase().includes('does not exist') ||
         error.message.toLowerCase().includes('not found')));

    if (isColumnMissingError) {
      const missingCol = extractMissingColumn(error.message);

      if (missingCol && missingCol in currentPayload && !removedColumns.has(missingCol)) {
        console.warn(`Supabase table missing column "${missingCol}". Retrying insert without it...`);
        removedColumns.add(missingCol);
        delete currentPayload[missingCol];
        continue;
      }

      // Check candidate optional columns to strip in priority order
      const candidateCols = ['dates_worn', 'images', 'thumbnail_url', 'last_worn', 'condition', 'variant', 'user_id', 'height', 'style', 'color'];
      const nextCandidate = candidateCols.find(c => c in currentPayload && !removedColumns.has(c));
      if (nextCandidate) {
        console.warn(`Retrying insert without optional column "${nextCandidate}"...`);
        removedColumns.add(nextCandidate);
        delete currentPayload[nextCandidate];
        continue;
      }
    }

    // If it's another error (e.g. RLS policy violation or auth mismatch)
    return { data: null, error };
  }

  return { data: null, error: { message: 'Insert failed after multiple schema adaptation attempts' } };
}

// Resilient update helper
async function resilientSupabaseUpdate(id: string, userId: string, basePayload: Record<string, unknown>) {
  const currentPayload: Record<string, unknown> = { ...basePayload };
  const removedColumns = new Set<string>();

  for (let attempt = 0; attempt < 12; attempt++) {
    const { data, error } = await supabase
      .from('sneakers')
      .update(currentPayload)
      .eq('id', id)
      .select();

    if (!error) {
      return { data, error: null };
    }

    const isColumnMissingError =
      error.code === '42703' ||
      error.code === 'PGRST204' ||
      (error.message &&
        (error.message.toLowerCase().includes('column') ||
         error.message.toLowerCase().includes('schema cache') ||
         error.message.toLowerCase().includes('does not exist') ||
         error.message.toLowerCase().includes('not found')));

    if (isColumnMissingError) {
      const missingCol = extractMissingColumn(error.message);

      if (missingCol && missingCol in currentPayload && !removedColumns.has(missingCol)) {
        console.warn(`Supabase table missing column "${missingCol}". Retrying update without it...`);
        removedColumns.add(missingCol);
        delete currentPayload[missingCol];
        continue;
      }

      const candidateCols = ['dates_worn', 'images', 'thumbnail_url', 'last_worn', 'condition', 'variant', 'user_id', 'height', 'style', 'color'];
      const nextCandidate = candidateCols.find(c => c in currentPayload && !removedColumns.has(c));
      if (nextCandidate) {
        console.warn(`Retrying update without optional column "${nextCandidate}"...`);
        removedColumns.add(nextCandidate);
        delete currentPayload[nextCandidate];
        continue;
      }
    }

    return { data: null, error };
  }

  return { data: null, error: { message: 'Update failed after multiple schema adaptation attempts' } };
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
        .or(`user_id.eq.${userId},user_id.is.null`)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      const fetchedSneakers = (data || []) as Sneaker[];
      setSneakers(fetchedSneakers);
      setUsingLocalStorageFallback(false);
      // Sync cache
      try {
        safeLocalStorage.setItem(`sneakers_inventory_${userId}`, JSON.stringify(fetchedSneakers));
      } catch (cacheErr) {
        console.debug('Failed to sync sneakers cache:', cacheErr);
      }
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
      } catch (fallbackErr) {
        console.debug('Fallback localStorage read error:', fallbackErr);
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
    if (!userId) {
      throw new Error('You must be signed in to add sneakers.');
    }
    const name = sneaker.name?.trim() || buildName(sneaker.brand, sneaker.model, sneaker.variant || '', sneaker.colorway);
    
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

    // Get active session user id to avoid RLS auth mismatch
    let activeAuthId = userId;
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      if (sessionData?.session?.user?.id) {
        activeAuthId = sessionData.session.user.id;
      }
    } catch (e) {
      console.warn('Could not verify session user id:', e);
    }

    const payload: Record<string, unknown> = {
      name,
      brand: sneaker.brand || '',
      model: sneaker.model || '',
      variant: sneaker.variant || '',
      colorway: sneaker.colorway || '',
      height: sneaker.height || 'Low',
      style: Array.isArray(sneaker.style) ? sneaker.style : [],
      color: Array.isArray(sneaker.color) ? sneaker.color : [],
      condition: sneaker.condition || 'Deadstock (DS)',
      worn: typeof sneaker.worn === 'number' ? sneaker.worn : (parseInt(String(sneaker.worn), 10) || 0),
      last_worn: sneaker.last_worn || null,
      thumbnail_url: sneaker.thumbnail_url || sneaker.image_url || '',
      image_url: sneaker.image_url || sneaker.thumbnail_url || '',
      images: Array.isArray(sneaker.images) ? sneaker.images : [],
      dates_worn: Array.isArray(sneaker.dates_worn) ? sneaker.dates_worn : [],
      user_id: activeAuthId,
    };

    // Remove any undefined properties
    Object.keys(payload).forEach(key => {
      if (payload[key] === undefined) {
        delete payload[key];
      }
    });

    const { data, error: insertError } = await resilientSupabaseInsert(payload);

    if (insertError) {
      console.warn('Supabase addSneaker failed with schema error, saving to local locker cache:', insertError);
      const fallbackSneaker: Sneaker = {
        ...sneaker,
        id: crypto.randomUUID?.() || Math.random().toString(36).substring(2, 11),
        name,
        variant: sneaker.variant || '',
        user_id: userId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      const updated = [fallbackSneaker, ...sneakers];
      saveToStorage(updated);
      return fallbackSneaker;
    }

    if (data && data.length > 0) {
      const createdItem = data[0] as Sneaker;
      setSneakers(prev => [createdItem, ...prev.filter(s => s.id !== createdItem.id)]);
      try {
        const storageKey = `sneakers_inventory_${userId}`;
        const stored = safeLocalStorage.getItem(storageKey);
        const list: Sneaker[] = stored ? JSON.parse(stored) : [];
        safeLocalStorage.setItem(storageKey, JSON.stringify([createdItem, ...list.filter(s => s.id !== createdItem.id)]));
      } catch (cacheErr) {
        console.debug('Failed to cache new sneaker locally:', cacheErr);
      }
      return createdItem;
    } else {
      // If Supabase returned no data, fallback gracefully
      const fallbackSneaker: Sneaker = {
        ...sneaker,
        id: crypto.randomUUID?.() || Math.random().toString(36).substring(2, 11),
        name,
        variant: sneaker.variant || '',
        user_id: userId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      const updated = [fallbackSneaker, ...sneakers];
      saveToStorage(updated);
      return fallbackSneaker;
    }
  };

  const addSneakersBatch = async (sneakersData: SneakerInsert[]) => {
    if (!userId) return null;
    
    const isLiveMode = isSupabaseConfigured && userId !== 'guest-user-bypass' && isValidUuid(userId) && !usingLocalStorageFallback;

    if (!isLiveMode) {
      const withNames: Sneaker[] = sneakersData.map(s => {
        const name = s.name?.trim() || buildName(s.brand, s.model, s.variant || '', s.colorway);
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
      let activeAuthId = userId;
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        if (sessionData?.session?.user?.id) {
          activeAuthId = sessionData.session.user.id;
        }
      } catch (sessErr) {
        console.debug('Could not get session in batch insert:', sessErr);
      }

      // Try inserting individually with resilient schema adaptation
      const insertedList: Sneaker[] = [];
      for (const s of sneakersData) {
        const name = s.name?.trim() || buildName(s.brand, s.model, s.variant || '', s.colorway);
        const payload: Record<string, unknown> = {
          name,
          brand: s.brand || '',
          model: s.model || '',
          variant: s.variant || '',
          colorway: s.colorway || '',
          height: s.height || 'Low',
          style: Array.isArray(s.style) ? s.style : [],
          color: Array.isArray(s.color) ? s.color : [],
          condition: s.condition || 'Deadstock (DS)',
          worn: typeof s.worn === 'number' ? s.worn : (parseInt(String(s.worn), 10) || 0),
          last_worn: s.last_worn || null,
          thumbnail_url: s.thumbnail_url || s.image_url || '',
          image_url: s.image_url || s.thumbnail_url || '',
          images: Array.isArray(s.images) ? s.images : [],
          dates_worn: Array.isArray(s.dates_worn) ? s.dates_worn : [],
          user_id: activeAuthId,
        };

        const { data, error } = await resilientSupabaseInsert(payload);
        if (!error && data && data.length > 0) {
          insertedList.push(data[0] as Sneaker);
        } else {
          insertedList.push({
            ...s,
            id: crypto.randomUUID?.() || Math.random().toString(36).substring(2, 11),
            name,
            variant: s.variant || '',
            user_id: userId,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });
        }
      }

      const updated = [...insertedList, ...sneakers];
      saveToStorage(updated);
      return insertedList;
    } catch (e) {
      console.warn('Supabase addSneakersBatch error, falling back to local storage:', e);
      const withNames: Sneaker[] = sneakersData.map(s => {
        const name = s.name?.trim() || buildName(s.brand, s.model, s.variant || '', s.colorway);
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
  };

  const updateSneaker = async (id: string, updates: Partial<SneakerInsert>) => {
    if (!userId) return null;

    const isLiveMode = isSupabaseConfigured && userId !== 'guest-user-bypass' && isValidUuid(userId) && !usingLocalStorageFallback;

    if (!isLiveMode) {
      const current = sneakers.find(s => String(s.id) === String(id));
      if (!current) return null;

      const b = updates.brand !== undefined ? updates.brand : current.brand;
      const m = updates.model !== undefined ? updates.model : current.model;
      const v = updates.variant !== undefined ? updates.variant : current.variant;
      const c = updates.colorway !== undefined ? updates.colorway : current.colorway;
      const name = updates.name?.trim() || buildName(b, m, v, c);

      const updatedSneaker: Sneaker = {
        ...current,
        ...updates,
        variant: v || '',
        name,
        updated_at: new Date().toISOString(),
      };

      const updatedList = sneakers.map(s => String(s.id) === String(id) ? updatedSneaker : s);
      saveToStorage(updatedList);
      return updatedSneaker;
    }

    try {
      const current = sneakers.find(s => String(s.id) === String(id));
      const b = updates.brand !== undefined ? updates.brand : current?.brand || '';
      const m = updates.model !== undefined ? updates.model : current?.model || '';
      const v = updates.variant !== undefined ? updates.variant : current?.variant || '';
      const c = updates.colorway !== undefined ? updates.colorway : current?.colorway || '';
      const name = updates.name?.trim() || buildName(b, m, v, c);

      const payload: Record<string, unknown> = {
        name,
        variant: v,
        updated_at: new Date().toISOString(),
      };

      if (updates.brand !== undefined) payload.brand = updates.brand;
      if (updates.model !== undefined) payload.model = updates.model;
      if (updates.colorway !== undefined) payload.colorway = updates.colorway;
      if (updates.height !== undefined) payload.height = updates.height;
      if (updates.style !== undefined) payload.style = updates.style;
      if (updates.color !== undefined) payload.color = updates.color;
      if (updates.condition !== undefined) payload.condition = updates.condition;
      if (updates.worn !== undefined) payload.worn = updates.worn;
      if (updates.last_worn !== undefined) payload.last_worn = updates.last_worn;
      if (updates.dates_worn !== undefined) payload.dates_worn = updates.dates_worn;
      if (updates.thumbnail_url !== undefined) payload.thumbnail_url = updates.thumbnail_url;
      if (updates.image_url !== undefined) payload.image_url = updates.image_url;
      if (updates.images !== undefined) payload.images = updates.images;

      const { data, error } = await resilientSupabaseUpdate(id, userId, payload);

      if (error) {
        console.warn('Supabase update failed, updating local state:', error);
      }

      if (data && data.length > 0) {
        const updatedItem = data[0] as Sneaker;
        setSneakers(prev => prev.map(s => String(s.id) === String(id) ? updatedItem : s));
        return updatedItem;
      } else {
        if (current) {
          const updatedSneaker: Sneaker = {
            ...current,
            ...updates,
            variant: v || '',
            name,
            updated_at: new Date().toISOString(),
          } as Sneaker;
          const updatedList = sneakers.map(s => String(s.id) === String(id) ? updatedSneaker : s);
          saveToStorage(updatedList);
          return updatedSneaker;
        }
        return null;
      }
    } catch (e) {
      console.error('Supabase updateSneaker error:', e);
      const current = sneakers.find(s => String(s.id) === String(id));
      if (current) {
        const b = updates.brand !== undefined ? updates.brand : current.brand;
        const m = updates.model !== undefined ? updates.model : current.model;
        const v = updates.variant !== undefined ? updates.variant : current.variant;
        const c = updates.colorway !== undefined ? updates.colorway : current.colorway;
        const name = updates.name?.trim() || buildName(b, m, v, c);
        const updatedSneaker: Sneaker = {
          ...current,
          ...updates,
          variant: v || '',
          name,
          updated_at: new Date().toISOString(),
        } as Sneaker;
        const updatedList = sneakers.map(s => String(s.id) === String(id) ? updatedSneaker : s);
        saveToStorage(updatedList);
        return updatedSneaker;
      }
      return null;
    }
  };

  const deleteSneaker = async (id: string) => {
    if (!userId) return false;

    const isLiveMode = isSupabaseConfigured && userId !== 'guest-user-bypass' && isValidUuid(userId) && !usingLocalStorageFallback;

    if (!isLiveMode) {
      const updatedList = sneakers.filter(s => String(s.id) !== String(id));
      saveToStorage(updatedList);
      return true;
    }

    try {
      const { error } = await supabase
        .from('sneakers')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setSneakers(prev => prev.filter(s => String(s.id) !== String(id)));
      return true;
    } catch (e) {
      console.error('Supabase deleteSneaker error:', e);
      throw e;
    }
  };

  const incrementWorn = async (id: string) => {
    const sneaker = sneakers.find(s => String(s.id) === String(id));
    if (!sneaker) return null;
    const nowIso = new Date().toISOString();
    const existingDates = Array.isArray(sneaker.dates_worn) ? sneaker.dates_worn : [];
    const updatedDates = [nowIso, ...existingDates];
    return updateSneaker(id, { 
      worn: (sneaker.worn || 0) + 1,
      last_worn: nowIso,
      dates_worn: updatedDates,
    });
  };

  const decrementWorn = async (id: string) => {
    const sneaker = sneakers.find(s => String(s.id) === String(id));
    if (!sneaker) return null;
    const currentWorn = sneaker.worn || 0;
    if (currentWorn <= 0) return sneaker;
    const newWorn = currentWorn - 1;
    const existingDates = Array.isArray(sneaker.dates_worn) ? sneaker.dates_worn : [];
    const updatedDates = existingDates.slice(1);
    const lastWorn = updatedDates.length > 0 ? updatedDates[0] : null;
    return updateSneaker(id, { 
      worn: newWorn,
      last_worn: lastWorn ?? undefined,
      dates_worn: updatedDates,
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
    decrementWorn,
  };
}
