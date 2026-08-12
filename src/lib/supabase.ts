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
  thumbnail_url?: string;
  image_url?: string;
  images?: string[];
  dates_worn?: string[] | null;
  condition?: string;
  last_worn?: string | null;
  user_id?: string;
  created_at: string;
  updated_at: string;
}

export type SneakerInsert = Omit<Sneaker, 'id' | 'created_at' | 'updated_at'>;

export const CONDITION_OPTIONS = [
  'Deadstock (DS)',
  'Very Near Deadstock (VNDS)',
  'Excellent',
  'Very Good',
  'Good',
  'Fair',
  'Poor',
  'Beaters',
];

export const BRAND_CATEGORIES = [
  {
    category: 'ATHLETIC',
    brands: [
      '361°', 'Adidas', 'AKTR', 'Altra', 'And1', 'ANTA', 'Avia', 'Champion',
      'Columbia', 'Etonic', 'Ewing', 'Fila', 'Fitville', 'Hoka', 'Jordan',
      'Karhu', 'Li-Ning', 'Lotto', 'Merrell', 'Mizuno', 'Nike', 'On Running',
      'Peak', 'Pony', 'Qiaodan', 'Reebok', 'Rigorer', 'Ryka', 'Salomon',
      'Speedland', 'Topo Athletics', 'Tracksmith', 'Under Armour',
    ],
  },
  {
    category: 'DESIGNER/FASHION',
    brands: [
      'A Bathing Ape', 'Alexander McQueen', 'Alohas', 'Amiri', 'Ann Demeulemeester', 'AUTRY', 'Axel Arigato', 'Balenciaga',
      'Balmain', 'Bottega Veneta', 'Burberry', 'Brooks', 'Christian Louboutin',
      'Coach', 'Cole Haan', 'Diadora', 'Dior', 'Dries Van Noten', 'Fear of God', 'Fendi',
      'Ferragamo', 'Givenchy', 'Golden Goose', 'Gucci', 'Hermés', 'Jacquemus',
      'Jimmy Choo', 'Kate Spade', 'Kenneth Cole', 'Lanvin', 'Louis Vuitton',
      'Maison Margiela', 'Maison Mihara Yasuhiro', 'Michael Kors', 'Moncler', 'Off-White', 'Onitsuka Tiger',
      'Other', 'Prada', 'Raf Simons', 'Rick Owens', 'Tom Ford', 'Tory Burch',
      'Versace', 'Saint Laurent (YSL)',
    ],
  },
  {
    category: 'SKATE',
    brands: [
      'Adio', 'Airwalk', 'Axion', 'Circa', 'DC', 'DVS', 'Element', 'éS', 'Emerica', 'Etnies', 'Fallen', 'Globe',
      'Lakai', 'Nike SB', 'Osiris', 'Supra', 'Vans',
    ],
  },
  {
    category: 'CASUAL/LIFESTYLE',
    brands: [
      'Allbirds', 'ASICS', 'Bata', 'Birkenstock', 'Cariuma',
      'Common Projects', 'Converse', 'Crocs', 'ECCO', 'Filling Pieces', 'K-Swiss',
      'KangaROOS', 'Keds', 'Moonstar', 'New Balance', 'Nothing New', 'OOfos',
      'Puma', "Rothy's", 'Saucony', 'SeaVees', 'Skechers', "Sperry",
      'Thousand Fell', 'Toms', 'Tretorn', 'Zegna',
    ],
  },
  {
    category: 'BOOTS',
    brands: [
      'August Special', 'Blundstone', 'Chippewa', 'Clarks', 'Danner',
      'Dr. Martens', 'Meermin', 'Oak Street Bootmakers', 'Parkhurst',
      'Red Wing', 'Thorogood', 'Thursday', 'Timberland', 'UGG', 'Viberg',
      'Wolverine',
    ],
  },
] as const;

export const BRANDS = BRAND_CATEGORIES.flatMap(c => c.brands);

export const HEIGHTS = ['Low', 'Mid', 'High'] as const;

export const STYLES = [
  'Athletic', 'Basketball', 'Boat', 'Boot', 'Canvas', 'Casual', 
  'Cross-Training', 'Driving', 'Fashion', 'Formal', 'Gym', 'Lifestyle', 'Low-Profile', 'Running', 'Semi-Formal',
  'Skate', 'Slip-On', 'Soccer', 'Sock', 'Walking',
] as const;

export const COLORS = [
  'White', 'Ivory', 'Black', 'Gunmetal', 'Dark Gray', 'Gray', 'Light Gray', 'Dark Brown', 'Brown', 'Tan',
  'Beige', 'Red', 'Crimson', 'Coral', 'Orange', 'Light Yellow', 'Yellow', 'Mint', 'Lime',
  'Green', 'Forest Green', 'Olive', 'Teal', 'Turquoise', 'Light Blue', 'Aqua', 'Blue', 'Navy', 'Indigo',
  'Purple', 'Maroon', 'Burgundy', 'Magenta', 'Pink', 'Hot Pink', 'Gold', 'Silver', 'Reflective',
  'Glow', 'Iridescent', 'Ice', 'Multicolor', 'Paua', 'Light Green', 'Cyan Blue', 'Citrus', 'Gum',
  'Green Cyan', 'Carolina Blue', 'Platinum',
] as const;

export function buildName(brand: string, model: string, variant: string, colorway: string): string {
  return [brand, model, variant, colorway].filter(Boolean).join(' ');
}
