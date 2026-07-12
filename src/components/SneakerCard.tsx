import { Sneaker } from '../lib/supabase';
import { Trash2, Edit3, Footprints } from 'lucide-react';
import multicolorImg from '../assets/images/multicolor_swatch_1783883698636.jpg';
import iridescentImg from '../assets/images/iridescent_color_1783660705612.jpg';

interface SneakerCardProps {
  sneaker: Sneaker;
  onEdit: (sneaker: Sneaker) => void;
  onDelete: (id: string) => void;
}

const COLOR_HEX: Record<string, string> = {
  'White': '#ffffff', 'Ivory': '#fffff0', 'Black': '#000000', 'Gunmetal': '#2f4f4f',
  'Dark Gray': '#333333', 'Gray': '#808080', 'Light Gray': '#d3d3d3', 'Dark Brown': '#654321',
  'Brown': '#8b5a2b', 'Tan': '#d2b48c', 'Beige': '#f5f5dc', 'Red': '#dc143c', 'Crimson': '#dc143c',
  'Orange': '#ff8c00', 'Light Yellow': '#ffffe0', 'Yellow': '#ffff00', 'Mint': '#aaf0d1',
  'Lime Green': '#84cc16', 'Green': '#228b22', 'Forest Green': '#228b22', 'Olive': '#6b8e23',
  'Teal': '#008080', 'Turquoise': '#40e0d0', 'Light Blue': '#add8e6', 'Aqua': '#00ffff',
  'Blue': '#0000ff', 'Navy': '#000080', 'Indigo': '#4b0082', 'Purple': '#4b0082',
  'Maroon': '#800000', 'Burgundy': '#800020', 'Magenta': '#ff00ff', 'Pink': '#ffc0cb',
  'Hot Pink': '#ff1493', 'Gold': '#ffd700', 'Silver': '#c0c0c0', 'Reflective': '#e8e8e8',
  'Glow': '#00ff80', 'Iridescent': iridescentImg, 'Ice': '#b2e9f3', 'Multicolor': multicolorImg, 'Paua': '#433b70',
  'Light Green': '#90dbc2', 'Cyan Blue': '#0bb8eb', 'Citrus': '#eb9a00', 'Gum': '#85674b', 'Green Cyan': '#7cceaf',
};

export default function SneakerCard({ sneaker, onEdit, onDelete }: SneakerCardProps) {
  return (
    <div className="group relative bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300 w-full max-w-sm mx-auto">
      {/* Image Container */}
      <div className="relative bg-gradient-to-b from-gray-50 to-gray-100 aspect-square flex items-center justify-center overflow-hidden">
        {sneaker.image_url ? (
          <img
            src={sneaker.image_url}
            alt={sneaker.name}
            className="w-full h-full p-8 object-contain"
          />
        ) : (
          <Footprints className="w-16 h-16 text-gray-300" />
        )}

        {/* Hover action buttons */}
        <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <button
            onClick={() => onEdit(sneaker)}
            className="p-2 bg-white/90 backdrop-blur-sm rounded-lg border border-gray-200 text-gray-700 hover:text-gray-900 hover:bg-white transition-colors"
          >
            <Edit3 className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(sneaker.id)}
            className="p-2 bg-white/90 backdrop-blur-sm rounded-lg border border-gray-200 text-red-400 hover:text-red-600 hover:bg-red-50 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        {/* Worn count badge */}
        {sneaker.worn > 0 && (
          <div className="absolute bottom-3 left-3 px-2.5 pt-1 pb-1.5 bg-black/70 backdrop-blur-sm rounded-md text-xs text-white font-medium">
            Worn {sneaker.worn}x
          </div>
        )}
      </div>

      {/* Content Container */}
      <div className="p-4 space-y-3">
        {/* Title */}
        <h3 className="font-bold text-gray-900 leading-tight line-clamp-2 h-10" title={sneaker.name}>
          {sneaker.name || 'Unnamed Sneaker'}
        </h3>

        {/* Styles */}
        {sneaker.style.length > 0 && (
          <p className="text-sm text-gray-600">
            {sneaker.style.slice(0, 3).join(', ')}
            {sneaker.style.length > 3 && `, +${sneaker.style.length - 3}`}
          </p>
        )}

        {/* Color swatches */}
        {sneaker.color.length > 0 && (
          <div className="flex items-center gap-2 pt-3">
            {sneaker.color.slice(0, 6).map((c, idx) => {
              const val = COLOR_HEX[c] || (c.startsWith('#') ? c : '#cccccc');
              const isImage = val.startsWith('/') || val.startsWith('data:') || val.includes('assets/') || val.includes('blob:');
              return (
                <div
                  key={`${c}-${idx}`}
                  className="w-5 h-5 rounded-full border border-gray-300 hover:scale-125 transition-all duration-200 bg-center bg-cover"
                  style={isImage ? { backgroundImage: `url(${val})` } : { backgroundColor: val }}
                  title={c}
                />
              );
            })}
            {sneaker.color.length > 6 && (
              <span className="text-xs text-gray-500">+{sneaker.color.length - 6}</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
