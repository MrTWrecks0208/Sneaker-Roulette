import { useState, useEffect, useCallback } from 'react';
import { supabase, Sneaker, SneakerInsert, buildName } from '../lib/supabase';

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
    created_at: new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString(),
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
    created_at: new Date(Date.now() - 15 * 24 * 3600 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 15 * 24 * 3600 * 1000).toISOString(),
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
    created_at: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString(),
  },
];

// Check if live Supabase keys are configured
export const isSupabaseConfigured = !!(
  import.meta.env.VITE_SUPABASE_URL &&
  import.meta.env.VITE_SUPABASE_URL !== 'https://placeholder.supabase.co' &&
  import.meta.env.VITE_SUPABASE_ANON_KEY &&
  import.meta.env.VITE_SUPABASE_ANON_KEY !== 'placeholder'
);

export function useSneakers() {
  const [sneakers, setSneakers] = useState<Sneaker[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSneakers = useCallback(async () => {
    setLoading(true);
    setError(null);

    if (!isSupabaseConfigured) {
      // LocalStorage mode
      try {
        const stored = localStorage.getItem('sneakers_inventory');
        if (stored) {
          setSneakers(JSON.parse(stored));
        } else {
          localStorage.setItem('sneakers_inventory', JSON.stringify(DEFAULT_SNEAKERS));
          setSneakers(DEFAULT_SNEAKERS);
        }
      } catch (e) {
        console.error('Error fetching sneakers from localStorage:', e);
      }
      setLoading(false);
      return;
    }

    // Live Supabase mode
    try {
      const { data, error } = await supabase
        .from('sneakers')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      setSneakers(data || []);
    } catch (e: unknown) {
      const err = e as Error;
      console.error('Error querying Supabase database:', err);
      setError(err.message || 'Failed to connect to Supabase database.');
      // Graceful fallback to localStorage on network or table failure
      try {
        const stored = localStorage.getItem('sneakers_inventory');
        setSneakers(stored ? JSON.parse(stored) : DEFAULT_SNEAKERS);
      } catch {
        // Fallback silently if localStorage fails or is empty
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSneakers();
  }, [fetchSneakers]);

  const addSneaker = async (sneaker: SneakerInsert) => {
    const name = buildName(sneaker.brand, sneaker.model, sneaker.variant || '', sneaker.colorway);
    
    if (!isSupabaseConfigured) {
      const newSneaker: Sneaker = {
        ...sneaker,
        id: crypto.randomUUID?.() || Math.random().toString(36).substring(2, 11),
        name,
        variant: sneaker.variant || '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      const updated = [newSneaker, ...sneakers];
      localStorage.setItem('sneakers_inventory', JSON.stringify(updated));
      setSneakers(updated);
      return newSneaker;
    }

    try {
      const { data, error } = await supabase
        .from('sneakers')
        .insert({
          ...sneaker,
          name,
          variant: sneaker.variant || '',
        })
        .select()
        .single();

      if (error) throw error;
      setSneakers(prev => [data, ...prev]);
      return data;
    } catch (e) {
      console.error('Supabase addSneaker error:', e);
      return null;
    }
  };

  const addSneakersBatch = async (sneakersData: SneakerInsert[]) => {
    if (!isSupabaseConfigured) {
      const withNames: Sneaker[] = sneakersData.map(s => {
        const name = buildName(s.brand, s.model, s.variant || '', s.colorway);
        return {
          ...s,
          id: crypto.randomUUID?.() || Math.random().toString(36).substring(2, 11),
          name,
          variant: s.variant || '',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
      });
      const updated = [...withNames, ...sneakers];
      localStorage.setItem('sneakers_inventory', JSON.stringify(updated));
      setSneakers(updated);
      return withNames;
    }

    try {
      const formatted = sneakersData.map(s => ({
        ...s,
        name: buildName(s.brand, s.model, s.variant || '', s.colorway),
        variant: s.variant || '',
      }));

      const { data, error } = await supabase
        .from('sneakers')
        .insert(formatted)
        .select();

      if (error) throw error;
      setSneakers(prev => [...(data || []), ...prev]);
      return data || [];
    } catch (e) {
      console.error('Supabase addSneakersBatch error:', e);
      return null;
    }
  };

  const updateSneaker = async (id: string, updates: Partial<SneakerInsert>) => {
    if (!isSupabaseConfigured) {
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
      localStorage.setItem('sneakers_inventory', JSON.stringify(updatedList));
      setSneakers(updatedList);
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
        .select()
        .single();

      if (error) throw error;
      setSneakers(prev => prev.map(s => s.id === id ? data : s));
      return data;
    } catch (e) {
      console.error('Supabase updateSneaker error:', e);
      return null;
    }
  };

  const deleteSneaker = async (id: string) => {
    if (!isSupabaseConfigured) {
      const updatedList = sneakers.filter(s => s.id !== id);
      localStorage.setItem('sneakers_inventory', JSON.stringify(updatedList));
      setSneakers(updatedList);
      return true;
    }

    try {
      const { error } = await supabase
        .from('sneakers')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setSneakers(prev => prev.filter(s => s.id !== id));
      return true;
    } catch (e) {
      console.error('Supabase deleteSneaker error:', e);
      return false;
    }
  };

  const incrementWorn = async (id: string) => {
    const sneaker = sneakers.find(s => s.id === id);
    if (!sneaker) return null;
    return updateSneaker(id, { worn: sneaker.worn + 1 });
  };

  return {
    sneakers,
    loading,
    error,
    isSupabaseConfigured,
    fetchSneakers,
    addSneaker,
    addSneakersBatch,
    updateSneaker,
    deleteSneaker,
    incrementWorn,
  };
}
