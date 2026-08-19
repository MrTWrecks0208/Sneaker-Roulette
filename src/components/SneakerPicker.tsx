import { useState, useCallback } from 'react';
import { Sneaker } from '../lib/supabase';
import { Shuffle, Check, X, Filter, Footprints, Sparkles, Paintbrush, Crown, Lock } from 'lucide-react';
import RouletteAnimation from './RouletteAnimation';
import { useSubscription } from '../hooks/useSubscription';
import { incrementDailySpinCount } from '../lib/subscription';

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
  resultCount: number;
  onOpenSubscriptionModal?: (reason: string) => void;
}

export default function SneakerPicker({ sneakers, onWear, onClose, resultCount, onOpenSubscriptionModal }: SneakerPickerProps) {
  const { config, spinStatus } = useSubscription();
  const [filter, setFilter] = useState<PickerFilter>('random');
  const [styleFilters, setStyleFilters] = useState<string[]>([]);
  const [colorFilters, setColorFilters] = useState<string[]>([]);
  const [logicOperator, setLogicOperator] = useState<'AND' | 'OR'>('OR');
  const [selectedSneakers, setSelectedSneakers] = useState<Sneaker[]>([]);
  const [activeSelectedIndex, setActiveSelectedIndex] = useState<number>(0);
  const [showRoulette, setShowRoulette] = useState(false);
  const [pendingSelection, setPendingSelection] = useState<Sneaker[]>([]);

  const allStyles = [...new Set(sneakers.flatMap(s => s.style))].sort();
  const allColors = [...new Set(sneakers.flatMap(s => s.color))].sort();

  const selected = selectedSneakers[activeSelectedIndex] || null;

  const toggleStyleFilter = (style: string) => {
    setStyleFilters(prev => 
      prev.includes(style) 
        ? prev.filter(s => s !== style) 
        : [...prev, style]
    );
    setSelectedSneakers([]);
  };

  const toggleColorFilter = (color: string) => {
    setColorFilters(prev => 
      prev.includes(color) 
        ? prev.filter(c => c !== color) 
        : [...prev, color]
    );
    setSelectedSneakers([]);
  };

  const pickSneaker = useCallback(() => {
    if (sneakers.length === 0) return;

    if (!spinStatus.allowed) {
      if (onOpenSubscriptionModal) {
        onOpenSubscriptionModal(
          `You've reached your daily limit of ${spinStatus.max} spin(s) on the ${config.name} (${config.badge}) plan. Upgrade to unlock more spins!`
        );
      }
      return;
    }

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
      setSelectedSneakers([]);
      return;
    }

    // Increment daily spin count when spin starts
    incrementDailySpinCount();

    const targetCount = Math.min(resultCount, pool.length);
    const finalPool = [...pool];
    const finalSelection: Sneaker[] = [];
    for (let i = 0; i < targetCount; i++) {
      if (finalPool.length === 0) break;
      const idx = Math.floor(Math.random() * finalPool.length);
      finalSelection.push(finalPool[idx]);
      finalPool.splice(idx, 1);
    }

    setPendingSelection(finalSelection);
    setShowRoulette(true);
  }, [sneakers, filter, styleFilters, colorFilters, logicOperator, resultCount, spinStatus, config, onOpenSubscriptionModal]);

  const handleRouletteComplete = useCallback(() => {
    setShowRoulette(false);
    setSelectedSneakers(pendingSelection);
    setPendingSelection([]);
    setActiveSelectedIndex(0);
  }, [pendingSelection]);

  const handleWear = async () => {
    if (!selected) return;
    await onWear(selected.id);
    onClose();
  };

  const handleReject = () => {
    setSelectedSneakers([]);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-zinc-900 border border-zinc-800 rounded-t-2xl sm:rounded-2xl w-full sm:max-w-md max-h-[95vh] sm:max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-zinc-800 bg-zinc-900 shrink-0">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400 animate-pulse" />
            <h2 className="text-base font-semibold text-zinc-100">
              {selected ? "The Selection" : "What to Wear Today"}
            </h2>
          </div>
          <button onClick={onClose} className="p-1 text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer focus:outline-none">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 sm:p-5 space-y-4 overflow-y-auto">
          {selected ? (
            /* Result Screen */
            <div className="space-y-4">
              {selectedSneakers.length > 1 ? (
                /* List of results if we picked multiple */
                <div className="space-y-3">
                  <span className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1">
                    Select a pair to wear:
                  </span>
                  <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
                    {selectedSneakers.map((sneaker, idx) => {
                      const isHighlighted = idx === activeSelectedIndex;
                      return (
                        <button
                          key={sneaker.id}
                          onClick={() => setActiveSelectedIndex(idx)}
                          className={`w-full text-left flex items-center gap-3 p-2.5 rounded-xl border transition-all cursor-pointer focus:outline-none ${
                            isHighlighted
                              ? 'bg-zinc-100 text-zinc-900 border-zinc-100 shadow-lg scale-[1.01]'
                              : 'bg-zinc-950 text-zinc-300 border-zinc-800/65 hover:border-zinc-700 hover:bg-zinc-900/40'
                          }`}
                        >
                          <div className={`w-14 h-14 rounded-lg bg-zinc-900/60 p-1 flex items-center justify-center shrink-0 border ${isHighlighted ? 'border-zinc-300/60' : 'border-zinc-800/80'}`}>
                            {sneaker.thumbnail_url ? (
                              <img src={sneaker.thumbnail_url} alt={sneaker.name} className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                            ) : (
                              <Footprints className={`w-7 h-7 ${isHighlighted ? 'text-zinc-600' : 'text-zinc-500'}`} />
                            )}
                          </div>
                          <div className="flex-1 min-w-0 space-y-1">
                            <h4 className={`text-xs font-bold truncate ${isHighlighted ? 'text-zinc-900' : 'text-zinc-100'}`}>
                              {sneaker.name}
                            </h4>
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${isHighlighted ? 'bg-zinc-900/10 text-zinc-800 border border-zinc-900/10' : 'bg-sky-500/10 text-sky-400 border border-sky-500/20'}`}>
                                {sneaker.style[0] || 'Sneaker'}
                              </span>
                              <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${isHighlighted ? 'bg-zinc-900/10 text-zinc-800 border border-zinc-900/10' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'}`}>
                                Worn {sneaker.worn}x
                              </span>
                            </div>
                          </div>
                          <div className="shrink-0 pr-1">
                            <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                              isHighlighted ? 'border-zinc-900 bg-zinc-900 text-white' : 'border-zinc-700'
                            }`}>
                              {isHighlighted && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : (
                /* Original Single Card Layout */
                <div className="bg-zinc-950 rounded-xl border border-zinc-800 overflow-hidden transition-all">
                  <div className="aspect-square sm:aspect-video bg-zinc-950 relative overflow-hidden flex items-center justify-center p-2">
                    {selected?.thumbnail_url ? (
                      <img src={selected.thumbnail_url} alt={selected.name} className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Footprints className="w-16 h-16 text-zinc-700" />
                      </div>
                    )}
                  </div>
                  <div className="p-4 space-y-2 border-t border-zinc-800/50">
                    <h3 className="text-base font-semibold text-zinc-100">{selected?.name}</h3>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs px-2.5 py-1 bg-sky-500/10 text-sky-400 rounded-2xl border border-sky-500/20">{selected?.style.join(", ")}</span>
                      <span className="text-xs px-2.5 py-1 bg-emerald-500/10 text-emerald-400 rounded-2xl border border-emerald-500/20">{selected?.height} Top</span>
                      <span className="text-xs px-2.5 py-1 bg-rose-500/10 text-rose-400 rounded-2xl border border-rose-500/20">Worn {selected?.worn}x</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex gap-3">
              <button
                  onClick={handleReject}
                  className="flex-1 py-2.5 bg-rose-600 text-white text-base font-semibold rounded-xl border border-rose-500 hover:bg-rose-500 transition-colors flex items-center justify-center gap-2 cursor-pointer focus:outline-none"
                >
                  <X className="w-5 h-5" /> Try Again
                </button>
                <button
                  onClick={handleWear}
                  className="flex-1 py-2.5 bg-emerald-600 text-white text-base font-semibold rounded-xl hover:bg-emerald-500 transition-colors flex items-center justify-center gap-2 cursor-pointer focus:outline-none"
                >
                  <Check className="w-5 h-5" /> Wear These
                </button>
                
              </div>
            </div>
          ) : (
            /* Filter Selection and Trigger Screen */
            <>
              {/* Filter Selection */}
              <div className="space-y-3">
                <label className="flex items-center gap-2 text-xs font-medium text-zinc-400 uppercase tracking-wider">
                  <Filter className="w-3.5 h-3.5 text-sky-400" /> Filter By
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
                  {([
                    { key: 'random', label: 'Random', icon: Shuffle, activeClass: 'bg-rose-500/20 text-rose-400 border-rose-500/40' },
                    { key: 'least_worn', label: 'Least Worn', icon: Footprints, activeClass: 'bg-amber-500/20 text-amber-400 border-amber-500/40' },
                    { key: 'style', label: 'Style', icon: HighTopSneaker, activeClass: 'bg-sky-500/20 text-sky-400 border-sky-500/40' },
                    { key: 'color', label: 'Color', icon: Paintbrush, activeClass: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40' },
                  ] as const).map(({ key, label, icon: Icon, activeClass }) => (
                    <button
                      key={key}
                      onClick={() => { setFilter(key); setSelectedSneakers([]); }}
                      className={`flex flex-col items-center gap-1 py-2.5 rounded-xl text-xs font-medium transition-all duration-75 border cursor-pointer focus:outline-none ${
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
                  <div className="space-y-2 mt-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-medium text-zinc-500">Select one or more styles:</span>
                      {styleFilters.length > 0 && (
                        <button
                          onClick={() => { setStyleFilters([]); setSelectedSneakers([]); }}
                          className="text-[11px] text-zinc-400 hover:text-zinc-200 underline transition-colors duration-75 cursor-pointer focus:outline-none"
                        >
                          Clear all
                        </button>
                      )}
                    </div>

                    {/* Style Logic Selector */}
                    <div className="flex items-center gap-1.5 p-1 bg-zinc-950/60 rounded-xl border border-zinc-800/80 max-w-[200px]">
                      <button
                        onClick={() => { setLogicOperator('OR'); setSelectedSneakers([]); }}
                        className={`flex-1 py-0.5 px-2 text-center rounded-lg text-[10px] font-semibold transition-all duration-75 cursor-pointer focus:outline-none ${
                          logicOperator === 'OR'
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                            : 'text-zinc-400 hover:text-zinc-200 border border-transparent'
                        }`}
                      >
                        OR (Any)
                      </button>
                      <button
                        onClick={() => { setLogicOperator('AND'); setSelectedSneakers([]); }}
                        className={`flex-1 py-0.5 px-2 text-center rounded-lg text-[10px] font-semibold transition-all duration-75 cursor-pointer focus:outline-none ${
                          logicOperator === 'AND'
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                            : 'text-zinc-400 hover:text-zinc-200 border border-transparent'
                        }`}
                      >
                        AND (All)
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto pr-1">
                      {allStyles.map(s => {
                        const isSelected = styleFilters.includes(s);
                        return (
                          <button
                            key={s}
                            onClick={() => toggleStyleFilter(s)}
                            className={`px-2.5 py-1 rounded-lg text-xs transition-colors duration-75 border flex items-center gap-1 cursor-pointer focus:outline-none ${
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
                  <div className="space-y-2 mt-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-medium text-zinc-500">Select one or more colors:</span>
                      {colorFilters.length > 0 && (
                        <button
                          onClick={() => { setColorFilters([]); setSelectedSneakers([]); }}
                          className="text-[11px] text-zinc-400 hover:text-zinc-200 underline transition-colors duration-75 cursor-pointer focus:outline-none"
                        >
                          Clear all
                        </button>
                      )}
                    </div>

                    {/* Color Logic Selector */}
                    <div className="flex items-center gap-1.5 p-1 bg-zinc-950/60 rounded-xl border border-zinc-800/80 max-w-[200px]">
                      <button
                        onClick={() => { setLogicOperator('OR'); setSelectedSneakers([]); }}
                        className={`flex-1 py-0.5 px-2 text-center rounded-lg text-[10px] font-semibold transition-all duration-75 cursor-pointer focus:outline-none ${
                          logicOperator === 'OR'
                            ? 'bg-blue-500/20 text-blue-400 border-blue-500/30'
                            : 'text-zinc-400 hover:text-zinc-200 border border-transparent'
                        }`}
                      >
                        OR (Any)
                      </button>
                      <button
                        onClick={() => { setLogicOperator('AND'); setSelectedSneakers([]); }}
                        className={`flex-1 py-0.5 px-2 text-center rounded-lg text-[10px] font-semibold transition-all duration-75 cursor-pointer focus:outline-none ${
                          logicOperator === 'AND'
                            ? 'bg-blue-500/20 text-blue-400 border-blue-500/30'
                            : 'text-zinc-400 hover:text-zinc-200 border border-transparent'
                        }`}
                      >
                        AND (All)
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto pr-1">
                      {allColors.map(c => {
                        const isSelected = colorFilters.includes(c);
                        return (
                          <button
                            key={c}
                            onClick={() => toggleColorFilter(c)}
                            className={`px-2.5 py-1 rounded-lg text-xs transition-colors duration-75 border flex items-center gap-1 cursor-pointer focus:outline-none ${
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

              {/* Pick Button & Spin Status */}
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between text-xs px-1">
                  <span className="text-zinc-400 font-medium flex items-center gap-1.5">
                    <Crown className="w-3.5 h-3.5 text-amber-400" />
                    <span>{config.name} ({config.badge}) Plan</span>
                  </span>
                  <span
                    className={`font-semibold px-2 py-0.5 rounded-md text-[11px] border ${
                      spinStatus.max === Infinity
                        ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20'
                        : spinStatus.remaining > 0
                        ? 'bg-blue-500/10 text-blue-300 border-blue-500/20'
                        : 'bg-rose-500/10 text-rose-300 border-rose-500/20'
                    }`}
                  >
                    {spinStatus.max === Infinity
                      ? '⚡ Unlimited Daily Spins'
                      : `🎯 ${spinStatus.remaining} / ${spinStatus.max} spins left today`}
                  </span>
                </div>

                <button
                  onClick={pickSneaker}
                  disabled={showRoulette || sneakers.length === 0 || (filter === 'style' && styleFilters.length === 0) || (filter === 'color' && colorFilters.length === 0)}
                  className={`w-full py-3.5 text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer focus:outline-none disabled:opacity-40 disabled:cursor-not-allowed ${
                    !spinStatus.allowed
                      ? 'bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 shadow-lg shadow-amber-500/20'
                      : 'bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400'
                  }`}
                >
                  {!spinStatus.allowed ? (
                    <>
                      <Lock className="w-5 h-5 text-amber-200" />
                      <span>Daily Spin Limit Reached (Upgrade Plan)</span>
                    </>
                  ) : (
                    <>
                      <Shuffle className="w-5 h-5" />
                      <span>Pick My Sneakers</span>
                    </>
                  )}
                </button>
              </div>

              {sneakers.length > 0 && ((filter === 'style' && styleFilters.length === 0) || (filter === 'color' && colorFilters.length === 0)) && (
                <p className="text-xs text-zinc-500 text-center">Select one or more {filter === 'style' ? 'styles' : 'colors'} above to continue</p>
              )}

              {sneakers.length === 0 && (
                <p className="text-sm text-zinc-500 text-center py-4">Add some sneakers first!</p>
              )}
            </>
          )}
        </div>
      </div>
      {showRoulette && (
        <RouletteAnimation onComplete={handleRouletteComplete} />
      )}
    </div>
  );
}
