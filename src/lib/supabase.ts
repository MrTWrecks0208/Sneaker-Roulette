import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Sneaker {
  id: string;
  name: string;
  brand: string;
  model: string;
  variant: string;
  colorway: string;
  height: string;
  style: string[];
  color: string[];
  worn: number;
  image_url: string;
  created_at: string;
  updated_at: string;
}

export type SneakerInsert = Omit<Sneaker, 'id' | 'created_at' | 'updated_at'>;

export const BRANDS = [
'A Bathing Ape', 'Adidas', 'Alexander McQueen', 'Allbirds', 'ASICS', 'Balenciaga',
'Brooks', 'Clarks', 'Cole Haan', 'Common Projects', 'Converse', 'ECCO', 'Fila',
'Gucci', 'Hoka', 'Jordan', 'Li-Ning', 'Louis Vuitton', 'Maison Margiela', 'Mizuno',
'Moonstar', 'New Balance', 'Nike', 'Off-White', 'On Running', 'Other', 'Prada', 'Puma',
'Reebok', 'Rick Owens', 'Salomon', 'Saucony', 'Skechers', "Sperry's", 'Under Armour',
'Vans', 'Versace',
] as const;

export const HEIGHTS = ['Low', 'Mid', 'High'] as const;

export const STYLES = [
  'Athletic', 'Basketball', 'Boat', 'Boot', 'Canvas', 'Casual', 
  'Cross-Training', 'Driving', 'Fashion', 'Formal', 'Gym', 'Lifestyle', 'Low-Profile', 'Running', 'Semi-Formal',
  'Skate', 'Slip-On', 'Soccer', 'Sock', 'Walking',
] as const;

export const COLORS = [
  'White', 'Ivory', 'Black', 'Gunmetal', 'Dark Gray', 'Gray', 'Light Gray', 'Dark Brown', 'Brown', 'Tan',
  'Beige', 'Red', 'Crimson', 'Orange', 'Light Yellow', 'Yellow', 'Mint', 'Lime Green',
  'Green', 'Forest Green', 'Olive', 'Teal', 'Turquoise', 'Light Blue', 'Aqua', 'Blue', 'Navy', 'Indigo',
  'Purple', 'Maroon', 'Burgundy', 'Magenta', 'Pink', 'Hot Pink', 'Gold', 'Silver', 'Reflective Silver',
  'Glow', 'Iridescent', 'Ice', 'Multicolor',
] as const;

export function buildName(brand: string, model: string, variant: string, colorway: string): string {
  return [brand, model, variant, colorway].filter(Boolean).join(' ');
}
