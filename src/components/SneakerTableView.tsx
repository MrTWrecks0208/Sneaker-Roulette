import { Sneaker } from '../lib/supabase';
import { Trash2, Edit3, Footprints, Plus } from 'lucide-react';
import { COLOR_HEX } from '../lib/colors';
import { BrandLogo } from './BrandLogo';

interface SneakerTableViewProps {
  sneakers: Sneaker[];
  onEdit: (sneaker: Sneaker) => void;
  onDelete: (id: string) => void;
  onIncrementWorn: (id: string) => void;
}

export default function SneakerTableView({
  sneakers,
  onEdit,
  onDelete,
  onIncrementWorn
}: SneakerTableViewProps) {
  return (
    <div className="w-full mt-8 overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950/40 backdrop-blur-sm">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[700px] border-collapse text-left">
          <thead>
            <tr className="border-b border-zinc-800 bg-zinc-900/50">
              <th scope="col" className="py-4 px-5 text-xs font-bold text-zinc-400 uppercase tracking-widest">Sneaker</th>
              <th scope="col" className="py-4 px-5 text-xs font-bold text-zinc-400 uppercase tracking-widest">Brand</th>
              <th scope="col" className="py-4 px-5 text-xs font-bold text-zinc-400 uppercase tracking-widest">Height</th>
              <th scope="col" className="py-4 px-5 text-xs font-bold text-zinc-400 uppercase tracking-widest">Styles</th>
              <th scope="col" className="py-4 px-5 text-xs font-bold text-zinc-400 uppercase tracking-widest">Colors</th>
              <th scope="col" className="py-4 px-5 text-xs font-bold text-zinc-400 uppercase tracking-widest text-center">Wears</th>
              <th scope="col" className="py-4 px-5 text-xs font-bold text-zinc-400 uppercase tracking-widest text-center">Last Worn</th>
              <th scope="col" className="py-4 px-5 text-xs font-bold text-zinc-400 uppercase tracking-widest text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-850">
            {sneakers.map(sneaker => (
              <tr key={sneaker.id} className="hover:bg-zinc-900/30 transition-colors group">
                {/* 1. Thumbnail & Name */}
                <td className="py-3 px-5 whitespace-nowrap">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-zinc-950 border border-zinc-800 rounded-lg flex items-center justify-center p-1.5 flex-shrink-0 overflow-hidden">
                      {sneaker.image_url ? (
                        <img
                          src={sneaker.image_url}
                          alt={sneaker.name}
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <Footprints className="w-4 h-4 text-zinc-700" />
                      )}
                    </div>
                    <span className="font-bold text-sm text-zinc-200 group-hover:text-zinc-100 max-w-[180px] truncate" title={sneaker.name}>
                      {sneaker.name || 'Unnamed Sneaker'}
                    </span>
                  </div>
                </td>

                {/* 2. Brand */}
                <td className="py-3 px-5">
                  {sneaker.brand ? (
                    <div className="flex items-center max-h-5 scale-75 origin-left">
                      <BrandLogo brand={sneaker.brand} />
                    </div>
                  ) : (
                    <span className="text-zinc-600 italic text-xs">None</span>
                  )}
                </td>

                {/* 3. Height */}
                <td className="py-3 px-5 whitespace-nowrap">
                  {sneaker.height ? (
                    <span className="px-2 py-0.5 bg-zinc-800/80 border border-zinc-750 rounded text-[10px] text-zinc-300 font-semibold uppercase tracking-wider">
                      {sneaker.height}
                    </span>
                  ) : (
                    <span className="text-zinc-600 text-xs">-</span>
                  )}
                </td>

                {/* 4. Styles */}
                <td className="py-3 px-5 max-w-[200px]">
                  {sneaker.style.length > 0 ? (
                    <span className="text-xs text-zinc-400 block truncate" title={sneaker.style.join(', ')}>
                      {sneaker.style.join(', ')}
                    </span>
                  ) : (
                    <span className="text-zinc-600 italic text-xs">None</span>
                  )}
                </td>

                {/* 5. Colors */}
                <td className="py-3 px-5">
                  {sneaker.color.length > 0 ? (
                    <div className="flex items-center gap-1">
                      {sneaker.color.map((c, idx) => {
                        const val = COLOR_HEX[c] || (c.startsWith('#') ? c : '#cccccc');
                        const isImage = val.startsWith('/') || val.startsWith('data:') || val.includes('assets/') || val.includes('blob:');
                        return (
                          <div
                            key={`${c}-${idx}`}
                            className="w-3.5 h-3.5 rounded-full border border-zinc-850 bg-center bg-cover flex-shrink-0"
                            style={isImage ? { backgroundImage: `url(${val})` } : { backgroundColor: val }}
                            title={c}
                          />
                        );
                      })}
                    </div>
                  ) : (
                    <span className="text-zinc-600 italic text-xs">None</span>
                  )}
                </td>

                {/* 6. Wear count & Quick button */}
                <td className="py-3 px-5 text-center whitespace-nowrap">
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-xs font-bold text-zinc-300">{sneaker.worn}x</span>
                    <button
                      onClick={() => onIncrementWorn(sneaker.id)}
                      title="Log wear count (+1)"
                      className="p-1 bg-red-600/10 hover:bg-red-600 text-red-400 hover:text-white border border-red-500/20 hover:border-red-500 rounded-md transition-all cursor-pointer"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </td>

                {/* Last Worn */}
                <td className="py-3 px-5 text-center whitespace-nowrap text-xs text-zinc-400">
                  <span className="bg-zinc-900 px-2 py-1 rounded border border-zinc-800 text-zinc-300 font-semibold">
                    {formatLastWorn(sneaker.last_worn)}
                  </span>
                </td>

                {/* 7. Action Buttons */}
                <td className="py-3 px-5 text-right whitespace-nowrap">
                  <div className="flex items-center justify-end gap-1.5">
                    <button
                      onClick={() => onEdit(sneaker)}
                      className="p-1.5 bg-zinc-800/40 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 border border-zinc-800 rounded-lg transition-all cursor-pointer"
                      title="Edit sneaker"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onDelete(sneaker.id)}
                      className="p-1.5 bg-zinc-850/20 hover:bg-red-500/10 text-zinc-500 hover:text-red-400 border border-zinc-800 rounded-lg transition-all cursor-pointer"
                      title="Delete sneaker"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
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
