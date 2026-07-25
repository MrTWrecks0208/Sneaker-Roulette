import { useState, useEffect } from 'react';
import { Sneaker } from '../lib/supabase';
import { Trash2, Edit3, Footprints, ChevronLeft, ChevronRight, X, Calendar, Activity, Eye, Maximize2 } from 'lucide-react';
import { COLOR_HEX } from '../lib/colors';
import { BrandLogo } from './BrandLogo';
import { formatLastWorn, parseGalleryImages } from '../lib/utils';
import { calculateWearStats, getHeightBadgeStyle } from '../lib/sneakerHelpers';

interface SneakerCardProps {
  sneaker: Sneaker;
  onEdit: (sneaker: Sneaker) => void;
  onDelete: (id: string) => void;
}

export default function SneakerCard({ sneaker, onEdit, onDelete }: SneakerCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const stats = calculateWearStats(
    sneaker.dates_worn,
    sneaker.worn,
    sneaker.last_worn
  );

  // Gallery (all photos: main + gallery)
  const gallery = parseGalleryImages(sneaker.gallery_images, sneaker.image_url);
  const [activeImgIdx, setActiveImgIdx] = useState(0);

  // Keyboard navigation for Lightbox Carousel
  useEffect(() => {
    if (lightboxIndex === null) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setLightboxIndex(null);
      } else if (e.key === 'ArrowLeft') {
        setLightboxIndex((prev) => (prev !== null ? (prev - 1 + gallery.length) % gallery.length : 0));
      } else if (e.key === 'ArrowRight') {
        setLightboxIndex((prev) => (prev !== null ? (prev + 1) % gallery.length : 0));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxIndex, gallery.length]);

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
    e.stopPropagation();
    setIsFlipped(!isFlipped);
  };

  const openLightbox = (e: React.MouseEvent, index: number = activeImgIdx) => {
    e.stopPropagation();
    setLightboxIndex(index);
  };

  return (
    <>
      {/* ================= SNEAKER CARD ================= */}
      <div 
        onClick={handleCardClick}
        className="group relative w-full max-w-[288px] h-[395px] mx-auto perspective-1000 select-none cursor-pointer"
        title="Click card to flip"
      >
        <div
          className={`relative w-full h-full transition-transform duration-700 transform-style-3d ${
            isFlipped ? 'rotate-y-180' : ''
          }`}
        >
          {/* ================= FRONT SIDE ================= */}
          <div className="absolute inset-0 w-full h-full backface-hidden bg-white rounded-xl overflow-hidden shadow-md group-hover:shadow-2xl ring-1 ring-black/5 transition-all duration-300 flex flex-col justify-between">
            {/* Image Container */}
            <div className="relative p-4 bg-gradient-to-br from-gray-50 to-gray-100 aspect-square flex items-center justify-center overflow-hidden">
              {gallery.length > 0 ? (
                <img
                  src={gallery[activeImgIdx] || sneaker.image_url}
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

              
              {/* Height Pill & Photo Carousel Controls on Bottom Right */}
              <div className="absolute bottom-2 right-2 z-10 flex items-center gap-1.5">
                {sneaker.height && (
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold shadow-xs shrink-0 ${getHeightBadgeStyle(sneaker.height)}`}>
                    {sneaker.height}
                  </span>
                )}

                {gallery.length > 1 && (
                  <div 
                    className="flex items-center gap-1 z-20"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      type="button"
                      onClick={() => setActiveImgIdx((activeImgIdx - 1 + gallery.length) % gallery.length)}
                      className="p-1 bg-black/60 hover:bg-black text-white rounded-md backdrop-blur-xs transition-colors cursor-pointer"
                      title="Previous photo"
                    >
                      <ChevronLeft className="w-3 h-3" />
                    </button>
                    <span className="px-1.5 py-0.5 bg-black/70 text-white rounded-md text-[9px] font-bold backdrop-blur-xs">
                      {activeImgIdx + 1}/{gallery.length}
                    </span>
                    <button
                      type="button"
                      onClick={() => setActiveImgIdx((activeImgIdx + 1) % gallery.length)}
                      className="p-1 bg-black/60 hover:bg-black text-white rounded-md backdrop-blur-xs transition-colors cursor-pointer"
                      title="Next photo"
                    >
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>

              {/* Worn Count Badge on Bottom Left */}
              <div className="absolute bottom-2 left-2 z-10 flex items-center gap-1">
                <div className="px-2 py-0.5 bg-black/60 text-white rounded-md text-[10px] font-semibold shadow-sm backdrop-blur-xs">
                  <span>worn {sneaker.worn || 0}x</span>
                </div>
              </div>
            </div>

            {/* Content Container */}
            <div className="p-3 space-y-1.5 flex-1 flex flex-col justify-between">
              <div>
                <h3 className="font-bold text-sm text-gray-900 leading-tight line-clamp-2 h-9" title={sneaker.name}>
                  {sneaker.name || 'Unnamed Sneaker'}
                </h3>

                {/* Styles */}
                <div className="mt-1">
                  {sneaker.style && sneaker.style.length > 0 ? (
                    <p className="text-xs text-gray-600 truncate" title={sneaker.style.join(', ')}>
                      {sneaker.style.join(', ')}
                    </p>
                  ) : (
                    <span className="text-xs text-gray-400 italic">No style specified</span>
                  )}
                </div>
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
                    {formatLastWorn(sneaker.last_worn, sneaker.worn)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* ================= BACK SIDE ================= */}
          <div className="absolute inset-0 w-full h-full backface-hidden rotate-y-180 bg-white border border-gray-200 rounded-xl p-3.5 shadow-xl flex flex-col justify-between overflow-hidden text-gray-900">
            {/* Top Bar with Name & Actions */}
            <div className="border-b border-gray-100 pb-2 flex items-center justify-between gap-2">
              <div className="min-w-0 flex-1">
                <h4 className="text-xs font-bold text-gray-900" title={sneaker.name}>
                  {sneaker.name}
                </h4>
              </div>

              {/* Action Buttons (Edit, Delete, Enlarge) */}
              <div className="flex items-center gap-1 shrink-0 z-20">
                <button
                  type="button"
                  onClick={(e) => openLightbox(e, activeImgIdx)}
                  className="p-1.5 bg-gray-100 hover:bg-blue-50 text-gray-600 hover:text-blue-600 rounded-lg transition-colors border border-gray-200 cursor-pointer"
                  title="Enlarge details & photos"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(sneaker);
                  }}
                  className="p-1.5 bg-gray-100 hover:bg-zinc-200 text-gray-700 hover:text-black rounded-lg transition-colors border border-gray-200 cursor-pointer"
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
                  className="p-1.5 bg-gray-100 hover:bg-red-50 text-red-500 hover:text-red-700 rounded-lg transition-colors border border-gray-200 cursor-pointer"
                  title="Delete sneaker"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Gallery Section */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[10px] text-gray-500 font-medium">
                <span>Gallery ({gallery.length})</span>
              </div>

              <div className="grid grid-cols-5 gap-1.5 bg-gray-50 p-1.5 rounded-lg border border-gray-100 min-h-[64px] max-h-28 overflow-y-auto items-center">
                {gallery.map((imgUrl, idx) => (
                  <button
                    key={`${imgUrl.slice(0, 30)}-${idx}`}
                    type="button"
                    onClick={(e) => openLightbox(e, idx)}
                    className="relative group/thumb w-full h-12 rounded-md overflow-hidden bg-white border border-gray-200 hover:border-blue-500 hover:shadow-sm transition-all focus:outline-none cursor-pointer"
                    title={`Enlarge photo ${idx + 1} in Lightbox Carousel`}
                  >
                    <img src={imgUrl} alt={`Gallery ${idx + 1}`} className="w-full h-full object-contain p-0.5" />
                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover/thumb:opacity-100 transition-opacity flex items-center justify-center">
                      <Eye className="w-3 h-3 text-white" />
                    </div>
                  </button>
                ))}

                {/* Fill empty slots if less than 5 */}
                {gallery.length < 5 && Array.from({ length: 5 - gallery.length }).map((_, idx) => (
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
            <div className="flex items-center justify-between">
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

      {/* ================= ENLARGED LIGHTBOX & DETAILS MODAL ================= */}
      {lightboxIndex !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 overflow-y-auto"
          onClick={() => setLightboxIndex(null)}
        >
          <div
            className="relative max-w-3xl w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-5 shadow-2xl my-auto text-white flex flex-col gap-4"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-3">
                <BrandLogo brand={sneaker.brand} sneakerName={sneaker.name} />
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-white leading-tight">
                    {sneaker.name || 'Unnamed Sneaker'}
                  </h3>
                  <div className="flex items-center gap-2 mt-0.5 text-xs text-zinc-400">
                    <span>{sneaker.brand || 'Sneaker'}</span>
                    {sneaker.height && (
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${getHeightBadgeStyle(sneaker.height)}`}>
                        {sneaker.height}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setLightboxIndex(null);
                    onEdit(sneaker);
                  }}
                  className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer"
                  title="Edit sneaker"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setLightboxIndex(null)}
                  className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer"
                  title="Close viewer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Main Lightbox Image Display */}
            <div className="relative bg-zinc-950 border border-zinc-800 rounded-xl p-4 flex items-center justify-center min-h-[300px] sm:min-h-[380px] max-h-[50vh] overflow-hidden">
              <img
                src={gallery[lightboxIndex] || sneaker.image_url}
                alt={`Sneaker photo ${lightboxIndex + 1}`}
                className="max-h-[46vh] w-auto max-w-full object-contain rounded-lg"
              />

              {/* Prev / Next Arrows */}
              {gallery.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={() => setLightboxIndex((lightboxIndex - 1 + gallery.length) % gallery.length)}
                    className="absolute left-3 p-2.5 rounded-full bg-black/60 hover:bg-black text-white transition-all cursor-pointer backdrop-blur-xs"
                    title="Previous photo (Left Arrow)"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => setLightboxIndex((lightboxIndex + 1) % gallery.length)}
                    className="absolute right-3 p-2.5 rounded-full bg-black/60 hover:bg-black text-white transition-all cursor-pointer backdrop-blur-xs"
                    title="Next photo (Right Arrow)"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>

                  <div className="absolute bottom-3 px-3 py-1 bg-black/70 rounded-full text-xs font-semibold text-zinc-300 backdrop-blur-xs">
                    Photo {lightboxIndex + 1} of {gallery.length}
                  </div>
                </>
              )}
            </div>

            {/* Thumbnail Strip at Bottom of Lightbox */}
            {gallery.length > 1 && (
              <div className="flex items-center justify-center gap-2 overflow-x-auto py-1">
                {gallery.map((imgUrl, idx) => (
                  <button
                    key={`lightbox-strip-${idx}`}
                    type="button"
                    onClick={() => setLightboxIndex(idx)}
                    className={`w-12 h-12 rounded-lg overflow-hidden border-2 transition-all cursor-pointer bg-zinc-950 shrink-0 ${
                      lightboxIndex === idx ? 'border-blue-500 scale-105 shadow-md' : 'border-zinc-800 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={imgUrl} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-contain p-0.5" />
                  </button>
                ))}
              </div>
            )}

            {/* Sneaker Details & Wear Metrics Section in Enlarged View */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-zinc-800 text-xs">
              {/* Left Column: Style, Color, Condition */}
              <div className="space-y-2 bg-zinc-950/60 p-3 rounded-xl border border-zinc-800">
                <div>
                  <span className="text-zinc-400 block font-medium">Style Tags:</span>
                  <span className="text-zinc-200 font-semibold">
                    {sneaker.style && sneaker.style.length > 0 ? sneaker.style.join(', ') : 'None'}
                  </span>
                </div>

                <div>
                  <span className="text-zinc-400 block font-medium mb-1">Colorway:</span>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {sneaker.color.map((c, idx) => {
                      const val = COLOR_HEX[c] || (c.startsWith('#') ? c : '#cccccc');
                      const isImage = val.startsWith('/') || val.startsWith('data:') || val.includes('assets/') || val.includes('blob:');
                      return (
                        <div key={`${c}-${idx}`} className="flex items-center gap-1 bg-zinc-800 px-2 py-0.5 rounded-md">
                          <div
                            className="w-3 h-3 rounded-full border border-zinc-600 bg-center bg-cover"
                            style={isImage ? { backgroundImage: `url(${val})` } : { backgroundColor: val }}
                          />
                          <span className="text-zinc-300 text-[11px]">{c}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-zinc-800">
                  <span className="text-zinc-400 font-medium">Condition:</span>
                  <span className={`px-2 py-0.5 rounded text-[11px] font-bold border ${getConditionBadgeStyle(sneaker.condition)}`}>
                    {sneaker.condition || 'Not specified'}
                  </span>
                </div>
              </div>

              {/* Right Column: Wear Counts & Frequency */}
              <div className="space-y-2 bg-zinc-950/60 p-3 rounded-xl border border-zinc-800 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-zinc-400 mb-1.5 font-medium">
                    <span>Wear History (Total: {sneaker.worn || 0}x)</span>
                    <span className="text-[11px] text-zinc-400">
                      Last: {formatLastWorn(sneaker.last_worn, sneaker.worn)}
                    </span>
                  </div>

                  <div className="grid grid-cols-4 gap-1.5 text-center">
                    <div className="bg-zinc-900 border border-zinc-800 p-1.5 rounded-lg">
                      <span className="block text-[9px] text-zinc-500 font-medium">1 Mo</span>
                      <span className="text-xs font-bold text-zinc-200">{stats.last1m}x</span>
                    </div>
                    <div className="bg-zinc-900 border border-zinc-800 p-1.5 rounded-lg">
                      <span className="block text-[9px] text-zinc-500 font-medium">3 Mo</span>
                      <span className="text-xs font-bold text-zinc-200">{stats.last3m}x</span>
                    </div>
                    <div className="bg-zinc-900 border border-zinc-800 p-1.5 rounded-lg">
                      <span className="block text-[9px] text-zinc-500 font-medium">6 Mo</span>
                      <span className="text-xs font-bold text-zinc-200">{stats.last6m}x</span>
                    </div>
                    <div className="bg-zinc-900 border border-zinc-800 p-1.5 rounded-lg">
                      <span className="block text-[9px] text-zinc-500 font-medium">12 Mo</span>
                      <span className="text-xs font-bold text-zinc-200">{stats.last12m}x</span>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-950/40 border border-blue-900/50 rounded-lg p-2 flex items-center justify-between mt-1">
                  <div className="flex items-center gap-1.5 text-blue-300">
                    <Activity className="w-3.5 h-3.5" />
                    <span className="font-bold text-[11px]">Wear Frequency:</span>
                  </div>
                  <span className="text-blue-200 font-extrabold text-[11px]">
                    {stats.frequencyText}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
