import { useState, useCallback } from 'react';
import { Sneaker } from '../lib/supabase';
import { Shuffle, Check, X, Filter, Footprints, Sparkles, Paintbrush } from 'lucide-react';

const HighTopSneaker = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    {/* Base Sole */}
    <path d="M 3 19 C 3 19 3 17.5 4.5 17.5 L 20 17.5 C 21 17.5 21 19 21 19 Z" />
    {/* Outer boundary of the high-top sneaker */}
    <path d="M 4.5 17.5 L 4.5 7 C 4.5 6 5.5 5.5 6.5 5.5 L 9 5.5 C 10 5.5 10.5 6.5 11 7.5 L 14 11.5 L 18.5 12.5 C 20 13 20.5 14.5 20 16 L 19.5 17.5" />
    {/* Toe Cap */}
    <path d="M 17 13 C 18 14 19.5 15.5 19.5 17.5" />
    {/* Heel collar / panel details */}
    <path d="M 4.5 9 C 6 9 7.5 9 8.5 8.5" />
    {/* Laces / eyelets */}
    <path d="M 10 7 L 12 9" />
    <path d="M 11 8.5 L 13 10.5" />
    <path d="M 12 10 L 14 12" />
    {/* Side stripe / swoosh-like aesthetic curve */}
    <path d="M 7 13.5 C 10 13.5 12 14.5 15.5 13" />
  </svg>
);

type PickerFilter = 'least_worn' | 'style' | 'color' | 'random';

interface SneakerPickerProps {
  sneakers: Sneaker[];
  onWear: (id: string) => Promise<unknown>;
  onClose: () => void;
}

export default function SneakerPicker({ sneakers, onWear, onClose }: SneakerPickerProps) {
  const [filter, setFilter] = useState<PickerFilter>('random');
  const [styleFilters, setStyleFilters] = useState<string[]>([]);
  const [colorFilters, setColorFilters] = useState<string[]>([]);
  const [logicOperator, setLogicOperator] = useState<'AND' | 'OR'>('OR');
  const [selected, setSelected] = useState<Sneaker | null>(null);
  const [picking, setPicking] = useState(false);

  const allStyles = [...new Set(sneakers.flatMap(s => s.style))].sort();
  const allColors = [...new Set(sneakers.flatMap(s => s.color))].sort();

  const toggleStyleFilter = (style: string) => {
    setStyleFilters(prev => 
      prev.includes(style) 
        ? prev.filter(s => s !== style) 
        : [...prev, style]
    );
    setSelected(null);
  };

  const toggleColorFilter = (color: string) => {
    setColorFilters(prev => 
      prev.includes(color) 
        ? prev.filter(c => c !== color) 
        : [...prev, color]
    );
    setSelected(null);
  };

  const pickSneaker = useCallback(() => {
    if (sneakers.length === 0) return;

    let pool = [...sneakers];

    if (filter === 'least_worn') {
      const minWorn = Math.min(...pool.map(s => s.worn));
      pool = pool.filter(s => s.worn === minWorn);
    } else if (filter === 'style' && styleFilters.length > 0) {
      if (logicOperator === 'AND') {
        pool = pool.filter(s => styleFilters.every(sf => s.style.includes(sf)));
      } else {
        pool = pool.filter(s => styleFilters.some(sf => s.style.includes(sf)));
      }
    } else if (filter === 'color' && colorFilters.length > 0) {
      if (logicOperator === 'AND') {
        pool = pool.filter(s => colorFilters.every(cf => s.color.includes(cf)));
      } else {
        pool = pool.filter(s => colorFilters.some(cf => s.color.includes(cf)));
      }
    }

    if (pool.length === 0) {
      setSelected(null);
      return;
    }

    setPicking(true);
    // Animation: cycle through a few options before landing
    let cycles = 0;
    const maxCycles = 12;
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
  }, [sneakers, filter, styleFilters, colorFilters, logicOperator]);

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
                { key: 'random', label: 'Random', icon: Shuffle, activeClass: 'bg-red-500/20 text-red-400 border-red-500/40' },
                { key: 'least_worn', label: 'Least Worn', icon: Footprints, activeClass: 'bg-amber-500/20 text-amber-400 border-amber-500/40' },
                { key: 'style', label: 'Style', icon: HighTopSneaker, activeClass: 'bg-sky-500/20 text-sky-400 border-sky-500/40' },
                { key: 'color', label: 'Color', icon: Paintbrush, activeClass: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40' },
              ] as const).map(({ key, label, icon: Icon, activeClass }) => (
                <button
                  key={key}
                  onClick={() => { setFilter(key); setSelected(null); }}
                  className={`flex flex-col items-center gap-1 py-3 rounded-xl text-xs font-medium transition-all border ${
                    filter === key
                      ? activeClass
                      : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:border-zinc-600'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </button>
              ))}
            </div>

            {filter === 'style' && (
              <div className="space-y-3 mt-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-medium text-zinc-500">Select one or more styles:</span>
                  {styleFilters.length > 0 && (
                    <button
                      onClick={() => { setStyleFilters([]); setSelected(null); }}
                      className="text-[11px] text-zinc-400 hover:text-zinc-200 underline transition-colors"
                    >
                      Clear all
                    </button>
                  )}
                </div>

                {/* Style Logic Selector */}
                <div className="flex items-center gap-1.5 p-1 bg-zinc-950/60 rounded-xl border border-zinc-800/80 max-w-[240px]">
                  <button
                    onClick={() => { setLogicOperator('OR'); setSelected(null); }}
                    className={`flex-1 py-1 px-2.5 text-center rounded-lg text-xs font-semibold transition-all ${
                      logicOperator === 'OR'
                        ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        : 'text-zinc-400 hover:text-zinc-200 border border-transparent'
                    }`}
                  >
                    OR (Any)
                  </button>
                  <button
                    onClick={() => { setLogicOperator('AND'); setSelected(null); }}
                    className={`flex-1 py-1 px-2.5 text-center rounded-lg text-xs font-semibold transition-all ${
                      logicOperator === 'AND'
                        ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        : 'text-zinc-400 hover:text-zinc-200 border border-transparent'
                    }`}
                  >
                    AND (All)
                  </button>
                </div>

                <div className="flex flex-wrap gap-2">
                  {allStyles.map(s => {
                    const isSelected = styleFilters.includes(s);
                    return (
                      <button
                        key={s}
                        onClick={() => toggleStyleFilter(s)}
                        className={`px-3 py-1 rounded-lg text-xs transition-colors border flex items-center gap-1.5 ${
                          isSelected
                            ? 'bg-amber-600/20 text-amber-400 border-amber-500/40'
                            : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:border-zinc-600'
                        }`}
                      >
                        {isSelected && <Check className="w-3.5 h-3.5" />}
                        {s}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {filter === 'color' && (
              <div className="space-y-3 mt-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-medium text-zinc-500">Select one or more colors:</span>
                  {colorFilters.length > 0 && (
                    <button
                      onClick={() => { setColorFilters([]); setSelected(null); }}
                      className="text-[11px] text-zinc-400 hover:text-zinc-200 underline transition-colors"
                    >
                      Clear all
                    </button>
                  )}
                </div>

                {/* Color Logic Selector */}
                <div className="flex items-center gap-1.5 p-1 bg-zinc-950/60 rounded-xl border border-zinc-800/80 max-w-[240px]">
                  <button
                    onClick={() => { setLogicOperator('OR'); setSelected(null); }}
                    className={`flex-1 py-1 px-2.5 text-center rounded-lg text-xs font-semibold transition-all ${
                      logicOperator === 'OR'
                        ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                        : 'text-zinc-400 hover:text-zinc-200 border border-transparent'
                    }`}
                  >
                    OR (Any)
                  </button>
                  <button
                    onClick={() => { setLogicOperator('AND'); setSelected(null); }}
                    className={`flex-1 py-1 px-2.5 text-center rounded-lg text-xs font-semibold transition-all ${
                      logicOperator === 'AND'
                        ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                        : 'text-zinc-400 hover:text-zinc-200 border border-transparent'
                    }`}
                  >
                    AND (All)
                  </button>
                </div>

                <div className="flex flex-wrap gap-2">
                  {allColors.map(c => {
                    const isSelected = colorFilters.includes(c);
                    return (
                      <button
                        key={c}
                        onClick={() => toggleColorFilter(c)}
                        className={`px-3 py-1 rounded-lg text-xs transition-colors border flex items-center gap-1.5 ${
                          isSelected
                            ? 'bg-blue-600/20 text-blue-400 border-blue-500/40'
                            : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:border-zinc-600'
                        }`}
                      >
                        {isSelected && <Check className="w-3.5 h-3.5" />}
                        {c}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Pick Button */}
          {!selected && (
            <button
              onClick={pickSneaker}
              disabled={picking || sneakers.length === 0 || (filter === 'style' && styleFilters.length === 0) || (filter === 'color' && colorFilters.length === 0)}
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
                    <img src={selected.image_url} alt={selected.name} className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Footprints className="w-16 h-16 text-zinc-700" />
                    </div>
                  )}
                </div>
                <div className="p-4 space-y-2">
                  <h3 className="text-base font-semibold text-zinc-100">{selected.name}</h3>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs px-2 pt-0.5 pb-1.5 bg-sky-500/10 text-sky-400 rounded-2xl border border-sky-500/20">{selected.style.join(", ")}</span>
                    <span className="text-xs px-2 pt-0.5 pb-1.5 bg-emerald-500/10 text-emerald-400 rounded-2xl border border-emerald-500/20">{selected.height} Top</span>
                    <span className="text-xs px-2 pt-0.5 pb-1.5 bg-rose-500/10 text-rose-400 rounded-2xl border border-rose-500/20">Worn {selected.worn}x</span>
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

          {selected === null && sneakers.length > 0 && ((filter === 'style' && styleFilters.length === 0) || (filter === 'color' && colorFilters.length === 0)) && (
            <p className="text-xs text-zinc-500 text-center">Select one or more {filter === 'style' ? 'styles' : 'colors'} above to continue</p>
          )}

          {sneakers.length === 0 && (
            <p className="text-sm text-zinc-500 text-center py-4">Add some sneakers first!</p>
          )}
        </div>
      </div>
    </div>
  );
}
