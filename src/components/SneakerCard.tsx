import { Sneaker } from '../lib/supabase';
import { Trash2, Edit3, Footprints } from 'lucide-react';

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
  'Blue': '#0000ff', 'Navy': '#000080', 'Indigo': '#4b0082', 'Purple': '#a020f0',
  'Maroon': '#800000', 'Burgundy': '#800020', 'Magenta': '#ff00ff', 'Pink': '#ffc0cb',
  'Hot Pink': '#ff1493', 'Gold': '#ffd700', 'Silver': '#c0c0c0', 'Reflective Silver': '#e8e8e8',
  'Glow': '#00ff80', 'Iridescent': '#b469ff', 'Ice': '#b0e6ff', 'Multicolor': '#ff69b4',
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
          <div className="absolute bottom-3 left-3 px-2 py-1 bg-black/70 backdrop-blur-sm rounded-md text-xs text-white font-medium">
            Worn {sneaker.worn}x
          </div>
        )}
      </div>

      {/* Content Container */}
      <div className="p-4 space-y-3">
        {/* Title */}
        <h3 className="font-bold text-gray-900 leading-tight line-clamp-2" title={sneaker.name}>
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
          <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
            {sneaker.color.slice(0, 6).map((c, idx) => (
              <div
                key={`${c}-${idx}`}
                className="w-5 h-5 rounded-full border-2 border-gray-200 hover:border-gray-400 transition-colors"
                style={{ backgroundColor: COLOR_HEX[c] || '#cccccc' }}
                title={c}
              />
            ))}
            {sneaker.color.length > 6 && (
              <span className="text-xs text-gray-500">+{sneaker.color.length - 6}</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
