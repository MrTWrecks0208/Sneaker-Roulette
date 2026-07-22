import { useState } from 'react';
import { Sneaker } from '../lib/supabase';
import { Trash2, Edit3, Footprints, ChevronLeft, ChevronRight, X, Calendar, Activity, Eye, Maximize2 } from 'lucide-react';
import { COLOR_HEX } from '../lib/colors';
import { BrandLogo } from './BrandLogo';

interface SneakerCardProps {
  sneaker: Sneaker;
  onEdit: (sneaker: Sneaker) => void;
  onDelete: (id: string) => void;
}

export interface WearStats {
  last1m: number;
  last3m: number;
  last6m: number;
  last12m: number;
  frequencyText: string;
}

export function calculateWearStats(
  datesWorn?: string[] | null,
  totalWornCount: number = 0,
  lastWornDateStr?: string | null,
  createdAtStr?: string | null
): WearStats {
  const nowMs = Date.now();

  const ms1m = 30 * 24 * 60 * 60 * 1000;
  const ms3m = 90 * 24 * 60 * 60 * 1000;
  const ms6m = 180 * 24 * 60 * 60 * 1000;
  const ms12m = 365 * 24 * 60 * 60 * 1000;

  const validTimes: number[] = [];
  if (datesWorn && Array.isArray(datesWorn)) {
    for (const d of datesWorn) {
      if (!d) continue;
      const t = new Date(d).getTime();
      if (!isNaN(t)) {
        validTimes.push(t);
      }
    }
  }

  let l1 = 0;
  let l3 = 0;
  let l6 = 0;
  let l12 = 0;

  if (validTimes.length > 0) {
    validTimes.forEach(t => {
      const diff = nowMs - t;
      if (diff >= 0) {
        if (diff <= ms1m) l1++;
        if (diff <= ms3m) l3++;
        if (diff <= ms6m) l6++;
        if (diff <= ms12m) l12++;
      }
    });
  } else if (totalWornCount > 0) {
    if (lastWornDateStr) {
      const lwTime = new Date(lastWornDateStr).getTime();
      if (!isNaN(lwTime)) {
        const diff = nowMs - lwTime;
        if (diff <= ms1m) l1 = Math.min(totalWornCount, 1);
        if (diff <= ms3m) l3 = Math.min(totalWornCount, 1);
        if (diff <= ms6m) l6 = Math.min(totalWornCount, 1);
        if (diff <= ms12m) l12 = Math.min(totalWornCount, 1);
      }
    }
  }

  let frequencyText = 'Never worn';
  const totalWears = validTimes.length > 0 ? validTimes.length : totalWornCount;

  if (totalWears > 0) {
    let earliestTime = validTimes.length > 0 ? Math.min(...validTimes) : 0;
    if (!earliestTime && createdAtStr) {
      earliestTime = new Date(createdAtStr).getTime();
    }
    if (!earliestTime && lastWornDateStr) {
      earliestTime = new Date(lastWornDateStr).getTime();
    }

    const daysSpan = earliestTime && !isNaN(earliestTime)
      ? Math.max(1, Math.ceil((nowMs - earliestTime) / (24 * 60 * 60 * 1000)))
      : 30;

    const avgDaysBetween = Math.max(1, Math.round(daysSpan / totalWears));
    const wearsPerMonthVal = totalWears / (daysSpan / 30);
    const wearsPerMonth = wearsPerMonthVal >= 10 ? Math.round(wearsPerMonthVal) : parseFloat(wearsPerMonthVal.toFixed(1));

    if (avgDaysBetween === 1) {
      frequencyText = 'Every day (~30x / mo)';
    } else if (avgDaysBetween < 7) {
      frequencyText = `Every ~${avgDaysBetween} days (~${wearsPerMonth}x / mo)`;
    } else if (avgDaysBetween <= 30) {
      frequencyText = `Every ~${avgDaysBetween} days (~${wearsPerMonth}x / mo)`;
    } else {
      const months = Math.round(avgDaysBetween / 30);
      frequencyText = months <= 1 ? 'About 1x / month' : `Once every ~${months} months`;
    }
  }

  return {
    last1m: l1,
    last3m: l3,
    last6m: l6,
    last12m: l12,
    frequencyText,
  };
}

export default function SneakerCard({ sneaker, onEdit, onDelete }: SneakerCardProps) {
  const [isEnlarged, setIsEnlarged] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const stats = calculateWearStats(
    sneaker.dates_worn,
    sneaker.worn,
    sneaker.last_worn,
    sneaker.created_at
  );

  // Gallery (max 5)
  const gallery: string[] = [];
  if (Array.isArray(sneaker.gallery_images) && sneaker.gallery_images.length > 0) {
    gallery.push(...sneaker.gallery_images.filter(Boolean).slice(0, 5));
  }
  if (gallery.length === 0 && sneaker.image_url) {
    gallery.push(sneaker.image_url);
  }

  const getConditionBadgeStyle = (cond?: string | null) => {
    if (!cond) return 'bg-zinc-100 text-zinc-600 border-zinc-200';
    const c = cond.toLowerCase();
    if (c === 'ds' || c.includes('deadstock')) return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    if (c === 'vnds') return 'bg-teal-50 text-teal-700 border-teal-200';
    if (c === 'excellent') return 'bg-blue-50 text-blue-700 border-blue-200';
    if (c === 'good') return 'bg-amber-50 text-amber-700 border-amber-200';
    if (c === 'fair') return 'bg-orange-50 text-orange-700 border-orange-200';
    if (c === 'beat' || c.includes('beater')) return 'bg-rose-50 text-rose-700 border-rose-200';
    return 'bg-purple-50 text-purple-700 border-purple-200';
  };

  const handleCardClick = (e: React.MouseEvent) => {
    // Open enlarged view when clicking card
    e.stopPropagation();
    setIsEnlarged(true);
  };

  return (
    <>
      {/* ================= GRID CARD ================= */}
      <div 
        onClick={handleCardClick}
        className="group relative w-full max-w-[288px] h-[395px] mx-auto perspective-1000 select-none cursor-pointer"
        title="Click to enlarge details"
      >
        <div
          className="relative w-full h-full transition-transform duration-700 transform-style-3d group-hover:rotate-y-180"
        >
          {/* ================= FRONT SIDE ================= */}
          <div className="absolute inset-0 w-full h-full backface-hidden bg-white rounded-xl overflow-hidden shadow-md group-hover:shadow-2xl ring-1 ring-black/5 transition-all duration-300 flex flex-col justify-between">
            {/* Image Container */}
            <div className="relative p-4 bg-gradient-to-br from-gray-50 to-gray-100 aspect-square flex items-center justify-center overflow-hidden">
              {sneaker.image_url ? (
                <img
                  src={sneaker.image_url}
                  alt={sneaker.name}
                  className="w-full h-full p-6 object-contain transition-transform duration-300 group-hover:scale-105"
                />
              ) : (
                <Footprints className="w-12 h-12 text-gray-300" />
              )}

              {/* Brand Logo in Upper Right Corner */}
              <div className="absolute z-10 top-[18px] right-[24px] transition-opacity duration-200 pointer-events-none">
                <BrandLogo brand={sneaker.brand} sneakerName={sneaker.name} />
              </div>

              {/* Hover action buttons + Enlarge icon */}
              <div className="absolute top-2 right-2 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-20">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsEnlarged(true);
                    setIsEnlargedFlipped(false);
                  }}
                  className="p-1.5 bg-white/90 backdrop-blur-sm rounded-lg border border-gray-200 text-gray-700 hover:text-blue-600 hover:bg-white transition-colors"
                  title="Enlarge card view"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(sneaker);
                  }}
                  className="p-1.5 bg-white/90 backdrop-blur-sm rounded-lg border border-gray-200 text-gray-700 hover:text-gray-900 hover:bg-white transition-colors"
                  title="Edit sneaker"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(sneaker.id);
                  }}
                  className="p-1.5 bg-white/90 backdrop-blur-sm rounded-lg border border-gray-200 text-red-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                  title="Delete sneaker"
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

              {/* Expand Hint Overlay on Bottom Right */}
              <div className="absolute bottom-2 right-2 px-2 py-0.5 bg-blue-600/90 text-white rounded-md text-[9px] font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center gap-1 shadow-sm">
                <Maximize2 className="w-2.5 h-2.5" />
                <span>Expand</span>
              </div>
            </div>

            {/* Content Container */}
            <div className="p-3 space-y-1.5 flex-1 flex flex-col justify-between">
              <div>
                <h3 className="font-bold text-sm text-gray-900 leading-tight line-clamp-2 h-9" title={sneaker.name}>
                  {sneaker.name || 'Unnamed Sneaker'}
                </h3>

                {sneaker.style.length > 0 && (
                  <p className="text-xs text-gray-600 mt-0.5">
                    {sneaker.style.join(', ')}
                  </p>
                )}
              </div>

              <div>
                {/* Color swatches */}
                {sneaker.color.length > 0 && (
                  <div className="flex items-center flex-wrap gap-1.5 pt-1">
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
          </div>

          {/* ================= BACK SIDE ================= */}
          <div className="absolute inset-0 w-full h-full backface-hidden rotate-y-180 bg-white border border-gray-200 rounded-xl p-3.5 shadow-xl flex flex-col justify-between overflow-hidden text-gray-900">
            {/* Top Bar with Name */}
            <div className="border-b border-gray-100 pb-2">
              <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider block">Sneaker Details</span>
              <h4 className="text-xs font-bold text-gray-900 truncate" title={sneaker.name}>
                {sneaker.name}
              </h4>
            </div>

            {/* Gallery (Max 5 images) */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[10px] text-gray-500 font-medium">
                <span>Gallery ({gallery.length}/5)</span>
                <span className="text-[9px] text-gray-400">Click image to enlarge</span>
              </div>

              <div className="grid grid-cols-5 gap-1.5 bg-gray-50 p-1.5 rounded-lg border border-gray-100 h-16 items-center">
                {gallery.map((imgUrl, idx) => (
                  <button
                    key={`${imgUrl}-${idx}`}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setLightboxIndex(idx);
                    }}
                    className="relative group/thumb w-full h-12 rounded-md overflow-hidden bg-white border border-gray-200 hover:border-blue-500 hover:shadow-sm transition-all focus:outline-none"
                    title={`View photo ${idx + 1}`}
                  >
                    <img src={imgUrl} alt={`Gallery ${idx + 1}`} className="w-full h-full object-contain p-0.5" />
                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover/thumb:opacity-100 transition-opacity flex items-center justify-center">
                      <Eye className="w-3 h-3 text-white" />
                    </div>
                  </button>
                ))}

                {/* Fill empty slots up to 5 */}
                {Array.from({ length: Math.max(0, 5 - gallery.length) }).map((_, idx) => (
                  <div
                    key={`empty-${idx}`}
                    className="w-full h-12 rounded-md border border-dashed border-gray-200 bg-gray-100/50 flex items-center justify-center text-gray-300 text-[10px]"
                  >
                    -
                  </div>
                ))}
              </div>
            </div>

            {/* Condition Section */}
            <div className="flex items-center justify-between bg-gray-50 px-2.5 py-1.5 rounded-lg border border-gray-100">
              <span className="text-[11px] font-semibold text-gray-600">Condition:</span>
              <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold border ${getConditionBadgeStyle(sneaker.condition)}`}>
                {sneaker.condition || 'Not specified'}
              </span>
            </div>

            {/* Wear Counts (1, 3, 6, 12 Months) */}
            <div>
              <div className="flex items-center gap-1 mb-1 text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                <Calendar className="w-3 h-3 text-blue-500" />
                <span>Wear Counts</span>
              </div>
              <div className="grid grid-cols-4 gap-1.5 text-center">
                <div className="bg-gray-50 border border-gray-100 p-1.5 rounded-lg">
                  <span className="block text-[9px] text-gray-400 font-medium">1 Mo</span>
                  <span className="text-xs font-bold text-gray-900">{stats.last1m}x</span>
                </div>
                <div className="bg-gray-50 border border-gray-100 p-1.5 rounded-lg">
                  <span className="block text-[9px] text-gray-400 font-medium">3 Mo</span>
                  <span className="text-xs font-bold text-gray-900">{stats.last3m}x</span>
                </div>
                <div className="bg-gray-50 border border-gray-100 p-1.5 rounded-lg">
                  <span className="block text-[9px] text-gray-400 font-medium">6 Mo</span>
                  <span className="text-xs font-bold text-gray-900">{stats.last6m}x</span>
                </div>
                <div className="bg-gray-50 border border-gray-100 p-1.5 rounded-lg">
                  <span className="block text-[9px] text-gray-400 font-medium">12 Mo</span>
                  <span className="text-xs font-bold text-gray-900">{stats.last12m}x</span>
                </div>
              </div>
            </div>

            {/* Wear Frequency */}
            <div className="bg-blue-50/60 border border-blue-100 rounded-lg p-2 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-blue-600" />
                <span className="text-[10px] font-bold text-blue-900">Wear Frequency:</span>
              </div>
              <span className="text-[11px] font-extrabold text-blue-700 truncate max-w-[140px]" title={stats.frequencyText}>
                {stats.frequencyText}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ================= ENLARGED CARD LIGHTBOX MODAL ================= */}
      {isEnlarged && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 sm:p-6 overflow-y-auto"
          onClick={() => setIsEnlarged(false)}
        >
          <div
            className="relative w-full max-w-[460px] h-[610px] my-auto perspective-1000 select-none"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Lightbox Button */}
            <button
              type="button"
              onClick={() => setIsEnlarged(false)}
              className="absolute -top-11 right-0 p-2 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded-full transition-colors cursor-pointer z-50 flex items-center gap-1 text-xs font-medium"
              title="Close expanded view"
            >
              <span>Close</span>
              <X className="w-5 h-5" />
            </button>

            {/* Enlarged Card Container */}
            <div className="relative w-full h-full bg-white rounded-2xl overflow-hidden shadow-2xl border border-gray-100 flex flex-col justify-between">
              {/* === ENLARGED FRONT SIDE === */}
              <div className="absolute inset-0 w-full h-full backface-hidden bg-white rounded-2xl overflow-hidden shadow-2xl border border-gray-100 flex flex-col justify-between">
                {/* Big Image Section */}
                <div className="relative p-6 bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50 h-[360px] flex items-center justify-center overflow-hidden">
                  {sneaker.image_url ? (
                    <img
                      src={sneaker.image_url}
                      alt={sneaker.name}
                      className="w-full h-full p-4 object-contain drop-shadow-md"
                    />
                  ) : (
                    <Footprints className="w-20 h-20 text-gray-300" />
                  )}

                  {/* Brand Logo in Top Right */}
                  <div className="absolute z-10 top-5 right-6 scale-125 origin-top-right">
                    <BrandLogo brand={sneaker.brand} sneakerName={sneaker.name} />
                  </div>

                  {/* Action Buttons */}
                  <div className="absolute bottom-4 right-4 flex gap-2 z-20">
                    <button
                      type="button"
                      onClick={() => {
                        setIsEnlarged(false);
                        onEdit(sneaker);
                      }}
                      className="px-3 py-1.5 bg-white/90 backdrop-blur-md rounded-xl border border-gray-200 text-gray-700 hover:text-gray-900 hover:bg-white transition-colors text-xs font-medium flex items-center gap-1.5 shadow-sm"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-blue-600" />
                      <span>Edit</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsEnlarged(false);
                        onDelete(sneaker.id);
                      }}
                      className="px-3 py-1.5 bg-white/90 backdrop-blur-md rounded-xl border border-gray-200 text-red-500 hover:text-red-700 hover:bg-red-50 transition-colors text-xs font-medium flex items-center gap-1.5 shadow-sm"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete</span>
                    </button>
                  </div>

                  {/* Worn Badge */}
                  {sneaker.worn > 0 && (
                    <div className="absolute bottom-4 left-4 px-3 py-1 bg-black/80 backdrop-blur-md rounded-lg text-xs text-white font-semibold flex items-center gap-1">
                      <Footprints className="w-3.5 h-3.5 text-blue-400" />
                      <span>Worn {sneaker.worn} times</span>
                    </div>
                  )}
                </div>

                {/* Content Section */}
                <div className="p-5 flex-1 flex flex-col justify-between bg-white">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">
                        {sneaker.brand || 'Sneaker'}
                      </span>
                      {sneaker.height && (
                        <span className="text-[11px] font-medium text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                          {sneaker.height}
                        </span>
                      )}
                    </div>
                    <h3 className="font-extrabold text-xl text-gray-900 leading-snug">
                      {sneaker.name || 'Unnamed Sneaker'}
                    </h3>

                    {sneaker.style.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {sneaker.style.map((st, idx) => (
                          <span key={idx} className="text-xs font-semibold px-2.5 py-0.5 bg-gray-100 text-gray-700 rounded-md">
                            {st}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Color Swatches & Footer */}
                  <div className="pt-3 border-t border-gray-100 space-y-2">
                    {sneaker.color.length > 0 && (
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-400 font-medium">Colorway:</span>
                        <div className="flex items-center gap-2">
                          {sneaker.color.map((c, idx) => {
                            const val = COLOR_HEX[c] || (c.startsWith('#') ? c : '#cccccc');
                            const isImage = val.startsWith('/') || val.startsWith('data:') || val.includes('assets/') || val.includes('blob:');
                            return (
                              <div key={`${c}-${idx}`} className="flex items-center gap-1">
                                <div
                                  className="w-4 h-4 rounded-full border border-gray-900 shadow-xs bg-center bg-cover"
                                  style={isImage ? { backgroundImage: `url(${val})` } : { backgroundColor: val }}
                                />
                                <span className="text-xs text-gray-600 font-medium">{c}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between text-xs text-gray-500 font-medium">
                      <span>Last Worn:</span>
                      <span className="text-gray-900 bg-gray-100 px-2.5 py-1 rounded-lg font-bold">
                        {formatLastWorn(sneaker.last_worn)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* === ENLARGED BACK SIDE === */}
              <div className="absolute inset-0 w-full h-full backface-hidden rotate-y-180 bg-white border border-gray-200 rounded-2xl p-5 shadow-2xl flex flex-col justify-between overflow-hidden text-gray-900">
                {/* Header with Name */}
                <div className="border-b border-gray-100 pb-3">
                  <span className="text-[10px] font-extrabold text-blue-600 uppercase tracking-widest block">Collection Specs</span>
                  <h4 className="text-base font-extrabold text-gray-900 truncate" title={sneaker.name}>
                    {sneaker.name}
                  </h4>
                </div>

                {/* Photo Gallery (Max 5) */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-bold text-gray-700">
                    <span>Photo Gallery ({gallery.length}/5)</span>
                    <span className="text-[10px] text-gray-400 font-normal">Click image to inspect full screen</span>
                  </div>

                  <div className="grid grid-cols-5 gap-2 bg-gray-50 p-2 rounded-xl border border-gray-100 items-center">
                    {gallery.map((imgUrl, idx) => (
                      <button
                        key={`${imgUrl}-${idx}`}
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setLightboxIndex(idx);
                        }}
                        className="relative group/thumb w-full h-16 rounded-lg overflow-hidden bg-white border border-gray-200 hover:border-blue-500 hover:shadow-md transition-all focus:outline-none"
                        title={`View photo ${idx + 1}`}
                      >
                        <img src={imgUrl} alt={`Gallery ${idx + 1}`} className="w-full h-full object-contain p-1" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/thumb:opacity-100 transition-opacity flex items-center justify-center">
                          <Eye className="w-4 h-4 text-white" />
                        </div>
                      </button>
                    ))}

                    {/* Empty slots */}
                    {Array.from({ length: Math.max(0, 5 - gallery.length) }).map((_, idx) => (
                      <div
                        key={`empty-enlarge-${idx}`}
                        className="w-full h-16 rounded-lg border border-dashed border-gray-200 bg-gray-100/50 flex items-center justify-center text-gray-300 text-xs"
                      >
                        -
                      </div>
                    ))}
                  </div>
                </div>

                {/* Condition Section */}
                <div className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded-xl border border-gray-100">
                  <span className="text-xs font-bold text-gray-700">Condition Rating:</span>
                  <span className={`px-3 py-1 rounded-full text-xs font-extrabold border ${getConditionBadgeStyle(sneaker.condition)}`}>
                    {sneaker.condition || 'Not specified'}
                  </span>
                </div>

                {/* Detailed Wear Metrics */}
                <div>
                  <div className="flex items-center gap-1.5 mb-2 text-xs font-bold text-gray-500 uppercase tracking-wider">
                    <Calendar className="w-3.5 h-3.5 text-blue-500" />
                    <span>Wear History Metrics</span>
                  </div>
                  <div className="grid grid-cols-4 gap-2 text-center">
                    <div className="bg-gray-50 border border-gray-100 p-2 rounded-xl">
                      <span className="block text-[10px] text-gray-400 font-semibold">1 Month</span>
                      <span className="text-base font-black text-gray-900">{stats.last1m}x</span>
                    </div>
                    <div className="bg-gray-50 border border-gray-100 p-2 rounded-xl">
                      <span className="block text-[10px] text-gray-400 font-semibold">3 Months</span>
                      <span className="text-base font-black text-gray-900">{stats.last3m}x</span>
                    </div>
                    <div className="bg-gray-50 border border-gray-100 p-2 rounded-xl">
                      <span className="block text-[10px] text-gray-400 font-semibold">6 Months</span>
                      <span className="text-base font-black text-gray-900">{stats.last6m}x</span>
                    </div>
                    <div className="bg-gray-50 border border-gray-100 p-2 rounded-xl">
                      <span className="block text-[10px] text-gray-400 font-semibold">1 Year</span>
                      <span className="text-base font-black text-gray-900">{stats.last12m}x</span>
                    </div>
                  </div>
                </div>

                {/* Wear Frequency */}
                <div className="bg-blue-50/70 border border-blue-100 rounded-xl p-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-blue-600" />
                    <span className="text-xs font-extrabold text-blue-950">Average Wear Frequency:</span>
                  </div>
                  <span className="text-xs font-black text-blue-700 bg-white/80 px-2.5 py-1 rounded-lg border border-blue-200">
                    {stats.frequencyText}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= FULLSCREEN GALLERY LIGHTBOX MODAL ================= */}
      {lightboxIndex !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-lg p-4"
          onClick={() => setLightboxIndex(null)}
        >
          <div
            className="relative max-w-3xl w-full flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setLightboxIndex(null)}
              className="absolute -top-12 right-0 p-2 text-white/80 hover:text-white transition-colors cursor-pointer flex items-center gap-1 text-xs font-medium"
              title="Close photo viewer"
            >
              <span>Close</span>
              <X className="w-6 h-6" />
            </button>

            {/* Main Image */}
            <div className="relative w-full bg-zinc-950 border border-zinc-800 rounded-2xl p-6 flex items-center justify-center min-h-[340px] max-h-[75vh] shadow-2xl">
              <img
                src={gallery[lightboxIndex]}
                alt={`Sneaker photo ${lightboxIndex + 1}`}
                className="max-h-[68vh] w-auto max-w-full object-contain rounded-lg"
              />
            </div>

            {/* Navigation Controls */}
            <div className="flex items-center justify-between w-full mt-4 px-2 text-white">
              <button
                type="button"
                onClick={() => setLightboxIndex((lightboxIndex - 1 + gallery.length) % gallery.length)}
                disabled={gallery.length <= 1}
                className="p-3 rounded-full bg-white/10 hover:bg-white/20 text-white disabled:opacity-20 disabled:hover:bg-white/10 transition-all cursor-pointer"
                title="Previous photo"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>

              <div className="text-center">
                <span className="text-sm font-bold text-zinc-200 block">
                  {sneaker.name}
                </span>
                <span className="text-xs text-zinc-400 font-medium">
                  Photo {lightboxIndex + 1} of {gallery.length}
                </span>
              </div>

              <button
                type="button"
                onClick={() => setLightboxIndex((lightboxIndex + 1) % gallery.length)}
                disabled={gallery.length <= 1}
                className="p-3 rounded-full bg-white/10 hover:bg-white/20 text-white disabled:opacity-20 disabled:hover:bg-white/10 transition-all cursor-pointer"
                title="Next photo"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

const formatLastWorn = (dateString?: string | null) => {
  if (!dateString) return 'Never';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Never';
    const now = new Date();

    if (date.toDateString() === now.toDateString()) {
      return 'Today';
    }

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
