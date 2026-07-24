import { Sneaker } from '../lib/supabase';
import { Trash2, Edit3, Footprints, Plus, Calendar } from 'lucide-react';
import { COLOR_HEX } from '../lib/colors';
import { BrandLogo } from './BrandLogo';
import { formatLastWorn, formatDateYMD } from '../lib/utils';

interface SneakerListViewProps {
  sneakers: Sneaker[];
  onEdit: (sneaker: Sneaker) => void;
  onDelete: (id: string) => void;
  onIncrementWorn: (id: string) => void;
}

export default function SneakerListView({
  sneakers,
  onEdit,
  onDelete,
  onIncrementWorn
}: SneakerListViewProps) {
  return (
    <div className="space-y-3 w-full mt-8">
      {sneakers.map(sneaker => {
        const formattedDate = sneaker.created_at ? formatDateYMD(sneaker.created_at) : null;

        return (
          <div
            key={sneaker.id}
            className="group relative bg-zinc-900/60 hover:bg-zinc-900 border border-zinc-800/80 hover:border-zinc-700 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all duration-200"
          >
            {/* Left: Thumbnail & Name / Brand details */}
            <div className="flex items-center gap-4 min-w-0">
              {/* Image Thumbnail */}
              <div className="relative w-16 h-16 bg-zinc-950 border border-zinc-800/80 rounded-xl flex items-center justify-center p-2 flex-shrink-0 overflow-hidden">
                {sneaker.image_url ? (
                  <img
                    src={sneaker.image_url}
                    alt={sneaker.name}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <Footprints className="w-6 h-6 text-zinc-700" />
                )}
              </div>

              {/* Sneaker Info */}
              <div className="min-w-0 space-y-1">
                <div className="flex items-center flex-wrap gap-2">
                  <h3 className="font-bold text-sm text-zinc-100 truncate max-w-[200px] md:max-w-[300px]" title={sneaker.name}>
                    {sneaker.name || 'Unnamed Sneaker'}
                  </h3>
                  {sneaker.height && (
                    <span className="px-1.5 py-0.5 bg-zinc-800 border border-zinc-700/60 rounded text-[10px] text-zinc-400 font-semibold uppercase tracking-wider">
                      {sneaker.height}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 flex-wrap text-xs text-zinc-400">
                  {/* Brand Display */}
                  <div className="flex items-center max-h-5 scale-75 origin-left -my-1">
                    <BrandLogo brand={sneaker.brand} sneakerName={sneaker.name} />
                  </div>
                  <span className="text-zinc-600">•</span>
                  {/* Styles */}
                  {sneaker.style.length > 0 ? (
                    <span className="truncate max-w-[150px] md:max-w-[250px]">{sneaker.style.join(', ')}</span>
                  ) : (
                    <span className="text-zinc-600 italic">No styles</span>
                  )}
                </div>
              </div>
            </div>

            {/* Right Side: Colors, Worn Counter, Actions */}
            <div className="flex flex-wrap md:flex-nowrap items-center justify-between md:justify-end gap-x-6 gap-y-3 w-full md:w-auto pt-3 md:pt-0 border-t border-zinc-800/60 md:border-t-0">
              {/* Color Swatches */}
              {sneaker.color.length > 0 && (
                <div className="flex items-center gap-1.5 bg-zinc-950/40 border border-zinc-800/40 rounded-lg p-1.5">
                  {sneaker.color.map((c, idx) => {
                    const val = COLOR_HEX[c] || (c.startsWith('#') ? c : '#cccccc');
                    const isImage = val.startsWith('/') || val.startsWith('data:') || val.includes('assets/') || val.includes('blob:');
                    return (
                      <div
                        key={`${c}-${idx}`}
                        className="w-3.5 h-3.5 rounded-full border border-zinc-850 hover:scale-125 transition-all duration-150 bg-center bg-cover flex-shrink-0"
                        style={isImage ? { backgroundImage: `url(${val})` } : { backgroundColor: val }}
                        title={c}
                      />
                    );
                  })}
                </div>
              )}

              {/* Date added */}
              {formattedDate && (
                <div className="hidden lg:flex items-center gap-1.5 text-xs text-zinc-500 whitespace-nowrap">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Added: {formattedDate}</span>
                </div>
              )}

              {/* Last Worn */}
              <div className="hidden sm:flex items-center gap-1.5 text-xs text-zinc-400 bg-zinc-950/30 px-2.5 py-1.5 rounded-xl border border-zinc-800/40 whitespace-nowrap">
                <Calendar className="w-3.5 h-3.5 text-zinc-500" />
                <span className="text-zinc-500">Last Worn:</span>
                <span className="text-zinc-300 font-semibold">{formatLastWorn(sneaker.last_worn)}</span>
              </div>

              {/* Wear Log Action */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onIncrementWorn(sneaker.id)}
                  title="Log a wear (+1)"
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600/10 hover:bg-red-600 text-red-400 hover:text-white border border-red-500/20 hover:border-red-500 rounded-xl text-xs font-semibold tracking-wide transition-all duration-150 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Worn {sneaker.worn}x</span>
                </button>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onEdit(sneaker)}
                  className="p-2 bg-zinc-800/50 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 border border-zinc-800 rounded-xl transition-all duration-150 cursor-pointer"
                  title="Edit sneaker"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onDelete(sneaker.id)}
                  className="p-2 bg-zinc-850/30 hover:bg-red-500/10 text-zinc-500 hover:text-red-400 border border-zinc-800 rounded-xl transition-all duration-150 cursor-pointer"
                  title="Delete sneaker"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

