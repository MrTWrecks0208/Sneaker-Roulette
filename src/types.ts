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
