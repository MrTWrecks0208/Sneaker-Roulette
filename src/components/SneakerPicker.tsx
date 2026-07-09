import { useState, useCallback } from 'react';
import { Sneaker } from '../lib/supabase';
import { Shuffle, Check, X, Filter, Footprints, Sparkles, Paintbrush, Shirt } from 'lucide-react';

type PickerFilter = 'least_worn' | 'style' | 'color' | 'random';

interface SneakerPickerProps {
  sneakers: Sneaker[];
  onWear: (id: string) => Promise<unknown>;
  onClose: () => void;
}

export default function SneakerPicker({ sneakers, onWear, onClose }: SneakerPickerProps) {
  const [filter, setFilter] = useState<PickerFilter>('random');
  const [styleFilter, setStyleFilter] = useState<string>('');
  const [colorFilter, setColorFilter] = useState<string>('');
  const [selected, setSelected] = useState<Sneaker | null>(null);
  const [picking, setPicking] = useState(false);

  const allStyles = [...new Set(sneakers.flatMap(s => s.style))].sort();
  const allColors = [...new Set(sneakers.flatMap(s => s.color))].sort();

  const pickSneaker = useCallback(() => {
    if (sneakers.length === 0) return;

    let pool = [...sneakers];

    if (filter === 'least_worn') {
      const minWorn = Math.min(...pool.map(s => s.worn));
      pool = pool.filter(s => s.worn === minWorn);
    } else if (filter === 'style' && styleFilter) {
      pool = pool.filter(s => s.style.includes(styleFilter));
    } else if (filter === 'color' && colorFilter) {
      pool = pool.filter(s => s.color.includes(colorFilter));
    }

    if (pool.length === 0) {
      setSelected(null);
      return;
    }

    setPicking(true);
    // Animation: cycle through a few options before landing
    let cycles = 0;
    const maxCycles = 8;
    const interval = setInterval(() => {
      const randomIdx = Math.floor(Math.random() * pool.length);
      setSelected(pool[randomIdx]);
      cycles++;
      if (cycles >= maxCycles) {
        clearInterval(interval);
        const finalIdx = Math.floor(Math.random() * pool.length);
        setSelected(pool[finalIdx]);
        setPicking(false);
      }
    }, 120);
  }, [sneakers, filter, styleFilter, colorFilter]);

  const handleWear = async () => {
    if (!selected) return;
    await onWear(selected.id);
    onClose();
  };

  const handleReject = () => {
    setSelected(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-zinc-900 border border-zinc-800 rounded-t-2xl sm:rounded-2xl w-full sm:max-w-lg max-h-[95vh] sm:max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-zinc-800 sticky top-0 bg-zinc-900 z-10">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <h2 className="text-lg font-semibold text-zinc-100">What to Wear Today</h2>
          </div>
          <button onClick={onClose} className="p-1 text-zinc-400 hover:text-zinc-200 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 sm:p-6 space-y-5">
          {/* Filter Selection */}
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-xs font-medium text-zinc-400 uppercase tracking-wider">
              <Filter className="w-3.5 h-3.5" /> Pick By
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {([
                { key: 'random', label: 'Random', icon: Shuffle },
                { key: 'least_worn', label: 'Least Worn', icon: Footprints },
                { key: 'style', label: 'Style', icon: Shirt },
                { key: 'color', label: 'Color', icon: Paintbrush },
              ] as const).map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => { setFilter(key); setSelected(null); }}
                  className={`flex flex-col items-center gap-1 py-3 rounded-xl text-xs font-medium transition-all border ${
                    filter === key
                      ? 'bg-blue-600/20 text-blue-400 border-blue-500/40'
                      : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:border-zinc-600'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </button>
              ))}
            </div>

            {filter === 'style' && (
              <div className="flex flex-wrap gap-2 mt-2">
                {allStyles.map(s => (
                  <button
                    key={s}
                    onClick={() => { setStyleFilter(s); setSelected(null); }}
                    className={`px-3 py-1 rounded-lg text-xs transition-colors border ${
                      styleFilter === s
                        ? 'bg-amber-600/20 text-amber-400 border-amber-500/40'
                        : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:border-zinc-600'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}

            {filter === 'color' && (
              <div className="flex flex-wrap gap-2 mt-2">
                {allColors.map(c => (
                  <button
                    key={c}
                    onClick={() => { setColorFilter(c); setSelected(null); }}
                    className={`px-3 py-1 rounded-lg text-xs transition-colors border ${
                      colorFilter === c
                        ? 'bg-blue-600/20 text-blue-400 border-blue-500/40'
                        : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:border-zinc-600'
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Pick Button */}
          {!selected && (
            <button
              onClick={pickSneaker}
              disabled={picking || sneakers.length === 0 || ((filter === 'style' && !styleFilter) || (filter === 'color' && !colorFilter))}
              className="w-full py-4 bg-gradient-to-r from-blue-600 to-blue-500 text-white font-semibold rounded-xl hover:from-blue-500 hover:to-blue-400 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
            >
              {picking ? (
                <>
                  <Shuffle className="w-5 h-5 animate-spin" />
                  Picking...
                </>
              ) : (
                <>
                  <Shuffle className="w-5 h-5" />
                  Pick My Sneakers
                </>
              )}
            </button>
          )}

          {/* Result */}
          {selected && (
            <div className="space-y-4">
              <div className={`bg-zinc-950 rounded-xl border border-zinc-800 overflow-hidden transition-all ${picking ? 'opacity-60' : ''}`}>
                <div className="aspect-video bg-zinc-950 relative overflow-hidden">
                  {selected.image_url ? (
                    <img src={selected.image_url} alt={selected.name} className="w-full h-full object-contain" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Footprints className="w-16 h-16 text-zinc-700" />
                    </div>
                  )}
                </div>
                <div className="p-4 space-y-2">
                  <h3 className="text-base font-semibold text-zinc-100">{selected.name}</h3>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs px-2 py-0.5 bg-blue-500/10 text-blue-400 rounded-md border border-blue-500/20">{selected.brand}</span>
                    <span className="text-xs px-2 py-0.5 bg-emerald-500/10 text-emerald-400 rounded-md border border-emerald-500/20">{selected.height}</span>
                    <span className="text-xs px-2 py-0.5 bg-zinc-800 text-zinc-400 rounded">Worn {selected.worn}x</span>
                  </div>
                </div>
              </div>

              {!picking && (
                <div className="flex gap-3">
                  <button
                    onClick={handleWear}
                    className="flex-1 py-3 bg-emerald-600 text-white text-sm font-semibold rounded-xl hover:bg-emerald-500 transition-colors flex items-center justify-center gap-2"
                  >
                    <Check className="w-5 h-5" /> Wear These
                  </button>
                  <button
                    onClick={handleReject}
                    className="flex-1 py-3 bg-zinc-800 text-zinc-300 text-sm font-semibold rounded-xl border border-zinc-700 hover:bg-zinc-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <X className="w-5 h-5" /> Try Again
                  </button>
                </div>
              )}
            </div>
          )}

          {selected === null && sneakers.length > 0 && (filter === 'style' && !styleFilter || filter === 'color' && !colorFilter) && (
            <p className="text-xs text-zinc-500 text-center">Select a {filter === 'style' ? 'style' : 'color'} filter above to continue</p>
          )}

          {sneakers.length === 0 && (
            <p className="text-sm text-zinc-500 text-center py-4">Add some sneakers first!</p>
          )}
        </div>
      </div>
    </div>
  );
}
