import { Sneaker } from '../lib/supabase';
import { Trash2, Edit3, Footprints } from 'lucide-react';
import { COLOR_HEX } from '../lib/colors';
import { BrandLogo } from './BrandLogo';

interface SneakerCardProps {
  sneaker: Sneaker;
  onEdit: (sneaker: Sneaker) => void;
  onDelete: (id: string) => void;
}

export default function SneakerCard({ sneaker, onEdit, onDelete }: SneakerCardProps) {
  return (
    <div className="group relative bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300 w-full max-w-[288px] mx-auto">
      {/* Image Container */}
      <div className="relative p-4 bg-gradient-to-br from-gray-50 to-gray-100 aspect-square flex items-center justify-center overflow-hidden">
        {sneaker.image_url ? (
          <img
            src={sneaker.image_url}
            alt={sneaker.name}
            className="w-full h-full p-6 object-contain"
          />
        ) : (
          <Footprints className="w-12 h-12 text-gray-300" />
        )}

        {/* Brand Logo in Upper Right Corner */}
        {(sneaker.brand || sneaker.name?.toLowerCase().includes('adidas yeezy')) && (
          <div className={`absolute z-10 transition-opacity duration-200 pointer-events-none ${
            sneaker.name?.toLowerCase().includes('adidas yeezy')
              ? 'top-[21px] right-[32px]'
              : sneaker.brand.toLowerCase().trim().includes('nike')
              ? 'top-[38px] right-[27px]'
              : sneaker.brand.toLowerCase().trim().includes('jordan')
              ? 'top-[23px] right-[32px]'
              : sneaker.brand.toLowerCase().trim().includes('adidas')
              ? 'top-[21px] right-[32px]'
              : 'top-[28px] right-[42px]'
          }`}>
            <BrandLogo brand={sneaker.name?.toLowerCase().includes('adidas yeezy') ? 'adidas yeezy' : sneaker.brand} />
          </div>
        )}

        {/* Hover action buttons */}
        <div className="absolute top-2 right-2 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <button
            onClick={() => onEdit(sneaker)}
            className="p-1.5 bg-white/90 backdrop-blur-sm rounded-lg border border-gray-200 text-gray-700 hover:text-gray-900 hover:bg-white transition-colors"
          >
            <Edit3 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onDelete(sneaker.id)}
            className="p-1.5 bg-white/90 backdrop-blur-sm rounded-lg border border-gray-200 text-red-400 hover:text-red-600 hover:bg-red-50 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Worn count badge */}
        {sneaker.worn > 0 && (
          <div className="absolute bottom-2 left-2 px-2 pt-0.5 pb-1 bg-black/70 backdrop-blur-sm rounded-md text-[10px] text-white font-medium">
            Worn {sneaker.worn}x
          </div>
        )}
      </div>

      {/* Content Container */}
      <div className="p-2 space-y-1">
        {/* Title */}
        <h3 className="font-bold text-sm text-gray-900 leading-tight line-clamp-2 h-9" title={sneaker.name}>
          {sneaker.name || 'Unnamed Sneaker'}
        </h3>

        {/* Styles */}
        {sneaker.style.length > 0 && (
          <p className="text-xs text-gray-600 -mt-1">
            {sneaker.style.join(', ')}
          </p>
        )}

        {/* Color swatches */}
        {sneaker.color.length > 0 && (
          <div className="flex items-center flex-wrap gap-1.5 pt-2">
            {sneaker.color.map((c, idx) => {
              const val = COLOR_HEX[c] || (c.startsWith('#') ? c : '#cccccc');
              const isImage = val.startsWith('/') || val.startsWith('data:') || val.includes('assets/') || val.includes('blob:');
              return (
                <div
                  key={`${c}-${idx}`}
                  className="w-3.5 h-3.5 rounded-full border border-gray-900 hover:scale-125 transition-all duration-200 bg-center bg-cover"
                  style={isImage ? { backgroundImage: `url(${val})` } : { backgroundColor: val }}
                  title={c}
                />
              );
            })}
          </div>
        )}

        {/* Last Worn Footer */}
        <div className="pt-2 border-t border-gray-100 mt-2 flex items-center justify-between text-[10px] text-gray-500 font-medium">
          <span>Last Worn:</span>
          <span className="text-gray-700 bg-gray-100 px-1.5 py-0.5 rounded-md font-semibold">
            {formatLastWorn(sneaker.last_worn)}
          </span>
        </div>
      </div>
    </div>
  );
}

const formatLastWorn = (dateString?: string | null) => {
  if (!dateString) return 'Never';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Never';
    const now = new Date();
    
    // Check if it's today
    if (date.toDateString() === now.toDateString()) {
      return 'Today';
    }
    
    // Check if it's yesterday
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    }
    
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays < 7) {
      return `${diffDays} days ago`;
    }
    
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  } catch {
    return 'Never';
  }
};
