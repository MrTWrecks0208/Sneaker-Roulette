import { useState, useEffect, useRef } from 'react';
import { Sneaker } from '../lib/supabase';
import { Trash2, Edit3, Footprints, X, ChevronLeft, ChevronRight, Maximize2, Plus, Minus } from 'lucide-react';
import { COLOR_HEX } from '../lib/colors';
import { BrandLogo } from './BrandLogo';
import { getConditionBadgeStyle, calculateWearStats } from '../lib/sneakerHelpers';

interface SneakerCardProps {
  sneaker: Sneaker;
  onEdit: (sneaker: Sneaker) => void;
  onDelete: (id: string) => void;
  onIncrementWorn?: (id: string) => void;
  onDecrementWorn?: (id: string) => void;
}

export default function SneakerCard({ sneaker, onEdit, onDelete, onIncrementWorn, onDecrementWorn }: SneakerCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [isEnlarged, setIsEnlarged] = useState(false);
  const [isEnlargedFlipped, setIsEnlargedFlipped] = useState(false);
  const [lightboxData, setLightboxData] = useState<{ sneakerName: string; images: string[]; index: number } | null>(null);

  const clickTimerRef = useRef<NodeJS.Timeout | null>(null);
  const enlargedClickTimerRef = useRef<NodeJS.Timeout | null>(null);

  const handleCardClick = (e: React.MouseEvent) => {
    // Don't handle if user clicked interactive buttons, inputs, or links directly
    if ((e.target as HTMLElement).closest('button, input, a, [role="button"]')) return;

    if (clickTimerRef.current) {
      clearTimeout(clickTimerRef.current);
      clickTimerRef.current = null;
      // Double click in succession: expand to forefront
      setIsEnlarged(true);
    } else {
      clickTimerRef.current = setTimeout(() => {
        clickTimerRef.current = null;
        // Single click: flip card over
        setIsFlipped(prev => !prev);
      }, 250);
    }
  };

  const handleEnlargedCardClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if ((e.target as HTMLElement).closest('button, input, a, [role="button"]')) return;

    if (enlargedClickTimerRef.current) {
      clearTimeout(enlargedClickTimerRef.current);
      enlargedClickTimerRef.current = null;
      // Double click on enlarged view closes enlarged view
      setIsEnlarged(false);
    } else {
      enlargedClickTimerRef.current = setTimeout(() => {
        enlargedClickTimerRef.current = null;
        // Single click flips enlarged card
        setIsEnlargedFlipped(prev => !prev);
      }, 250);
    }
  };

  const galleryImages = sneaker.images && sneaker.images.length > 0 
    ? sneaker.images 
    : (sneaker.thumbnail_url ? [sneaker.thumbnail_url] : []);

  const openLightbox = (index: number) => {
    if (galleryImages.length === 0) return;
    setLightboxData({
      sneakerName: sneaker.name || 'Sneaker',
      images: galleryImages,
      index,
    });
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (lightboxData) {
          setLightboxData(null);
        } else if (isEnlarged) {
          setIsEnlarged(false);
        }
      } else if (lightboxData && e.key === 'ArrowLeft') {
        setLightboxData(prev => prev ? { ...prev, index: (prev.index - 1 + prev.images.length) % prev.images.length } : null);
      } else if (lightboxData && e.key === 'ArrowRight') {
        setLightboxData(prev => prev ? { ...prev, index: (prev.index + 1) % prev.images.length } : null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxData, isEnlarged]);

  return (
    <>
      {/* Flip Card Container */}
      <div
        onClick={handleCardClick}
        title="Click to flip • Double-click to expand"
        className="group relative w-full max-w-[288px] h-[415px] mx-auto cursor-pointer [perspective:1000px] select-none"
      >
        <CardInner 
          sneaker={sneaker} 
          onEdit={onEdit} 
          onDelete={onDelete} 
          onIncrementWorn={onIncrementWorn}
          onDecrementWorn={onDecrementWorn}
          galleryImages={galleryImages}
          onOpenLightbox={openLightbox}
          isFlipped={isFlipped}
        />
      </div>

      {/* Enlarged Modal View (With Blurry Backdrop) */}
      {isEnlarged && (
        <div
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-lg flex items-center justify-center p-4 animate-in fade-in duration-200 select-none"
          onClick={() => setIsEnlarged(false)}
        >
          {/* Floating Close Button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsEnlarged(false);
            }}
            className="absolute top-4 right-4 sm:top-6 sm:right-6 z-50 p-2.5 bg-white/90 hover:bg-white text-gray-800 rounded-full shadow-2xl border border-gray-200 transition-transform duration-200 hover:scale-110 cursor-pointer"
            title="Close enlarged view"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Scaled-up Card */}
          <div
            className="group relative w-[340px] sm:w-[380px] h-[500px] sm:h-[540px] cursor-pointer [perspective:1200px]"
            onClick={handleEnlargedCardClick}
            title="Click to flip • Double-click to close"
          >
            <CardInner 
              sneaker={sneaker} 
              onEdit={onEdit} 
              onDelete={onDelete} 
              onIncrementWorn={onIncrementWorn}
              onDecrementWorn={onDecrementWorn}
              galleryImages={galleryImages}
              onOpenLightbox={openLightbox}
              isFlipped={isEnlargedFlipped}
              isScaled 
            />
          </div>
        </div>
      )}

      {/* Lightbox Carousel Modal at Forefront */}
      {lightboxData && (
        <div
          className="fixed inset-0 z-60 bg-black/95 backdrop-blur-md flex flex-col justify-between items-center p-4 sm:p-6 text-white animate-in fade-in duration-200"
          onClick={(e) => {
            e.stopPropagation();
            setLightboxData(null);
          }}
        >
          {/* Lightbox Header */}
          <div className="w-full max-w-4xl flex items-center justify-between z-10" onClick={(e) => e.stopPropagation()}>
            <div>
              <h3 className="font-bold text-base sm:text-lg text-white line-clamp-1">{lightboxData.sneakerName}</h3>
              <p className="text-xs text-gray-400">
                Image {lightboxData.index + 1} of {lightboxData.images.length}
              </p>
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setLightboxData(null);
              }}
              className="p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
              title="Close Lightbox"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Lightbox Stage (Center) */}
          <div
            className="relative w-full max-w-4xl flex-1 flex items-center justify-center my-2 sm:my-4 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {lightboxData.images.length > 1 && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setLightboxData(prev => prev ? {
                    ...prev,
                    index: (prev.index - 1 + prev.images.length) % prev.images.length
                  } : null);
                }}
                className="absolute left-2 sm:left-4 z-20 p-2.5 sm:p-3 bg-black/60 hover:bg-black/90 text-white rounded-full transition-transform hover:scale-110 border border-white/20 shadow-xl"
                title="Previous Image"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
            )}

            <img
              src={lightboxData.images[lightboxData.index]}
              alt={`${lightboxData.sneakerName} view ${lightboxData.index + 1}`}
              className="max-h-[65vh] sm:max-h-[75vh] max-w-full object-contain rounded-lg shadow-2xl transition-all duration-300"
            />

            {lightboxData.images.length > 1 && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setLightboxData(prev => prev ? {
                    ...prev,
                    index: (prev.index + 1) % prev.images.length
                  } : null);
                }}
                className="absolute right-2 sm:right-4 z-20 p-2.5 sm:p-3 bg-black/60 hover:bg-black/90 text-white rounded-full transition-transform hover:scale-110 border border-white/20 shadow-xl"
                title="Next Image"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            )}
          </div>

          {/* Lightbox Filmstrip Thumbnails */}
          {lightboxData.images.length > 1 && (
            <div className="w-full max-w-2xl flex items-center justify-center gap-2 overflow-x-auto p-2 bg-black/40 rounded-xl border border-white/10" onClick={(e) => e.stopPropagation()}>
              {lightboxData.images.map((img, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setLightboxData(prev => prev ? { ...prev, index: idx } : null);
                  }}
                  className={`w-12 h-12 rounded-lg overflow-hidden border-2 transition-all ${idx === lightboxData.index ? 'border-blue-500 scale-105 opacity-100' : 'border-transparent opacity-50 hover:opacity-80'}`}
                >
                  <img src={img} alt="thumb" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
}

function InteractiveWornBadge({
  worn,
  onIncrement,
  onDecrement,
  isScaled = false,
}: {
  worn: number;
  onIncrement: (e: React.MouseEvent) => void;
  onDecrement: (e: React.MouseEvent) => void;
  isScaled?: boolean;
}) {
  const [isHovered, setIsHovered] = useState(false);

  const containerClasses = isScaled
    ? 'w-24 h-7.5 text-xs rounded-lg'
    : 'w-[82px] h-7 text-[10px] rounded-md';

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`relative inline-flex items-center justify-center border border-slate-700/80 shadow-md backdrop-blur-md overflow-hidden transition-colors select-none ${containerClasses} ${
        isHovered ? 'bg-slate-900/95 border-slate-600' : 'bg-slate-800/90 hover:bg-slate-700/95 text-white font-bold cursor-pointer'
      }`}
    >
      {isHovered ? (
        <div className="flex w-full h-full divide-x divide-slate-800">
          <button
            type="button"
            onClick={onDecrement}
            className="w-1/2 h-full bg-rose-500/15 hover:bg-rose-500/30 text-rose-400 hover:text-rose-300 font-bold flex items-center justify-center transition-colors cursor-pointer"
            title="Decrease wear count (-1)"
          >
            <Minus className={isScaled ? 'w-5 h-5' : 'w-4 h-4'} />
          </button>
          <button
            type="button"
            onClick={onIncrement}
            className="w-1/2 h-full bg-emerald-500/15 hover:bg-emerald-500/30 text-emerald-400 hover:text-emerald-300 font-bold flex items-center justify-center transition-colors cursor-pointer"
            title="Increase wear count (+1)"
          >
            <Plus className={isScaled ? 'w-5 h-5' : 'w-4 h-4'} />
          </button>
        </div>
      ) : (
        <span className="font-bold text-white whitespace-nowrap">
          Worn {worn || 0}x
        </span>
      )}
    </div>
  );
}

function CardInner({
  sneaker,
  onEdit,
  onDelete,
  onIncrementWorn,
  onDecrementWorn,
  galleryImages,
  onOpenLightbox,
  isFlipped = false,
  isScaled = false,
}: {
  sneaker: Sneaker;
  onEdit: (sneaker: Sneaker) => void;
  onDelete: (id: string) => void;
  onIncrementWorn?: (id: string) => void;
  onDecrementWorn?: (id: string) => void;
  galleryImages: string[];
  onOpenLightbox: (index: number) => void;
  isFlipped?: boolean;
  isScaled?: boolean;
}) {
  const stats = calculateWearStats(sneaker.dates_worn, sneaker.times_worn, sneaker.last_worn);

  const handleDecrementWear = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDecrementWorn) {
      onDecrementWorn(sneaker.id);
    }
  };

  const handleIncrementWear = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onIncrementWorn) {
      onIncrementWorn(sneaker.id);
    }
  };

  return (
    <div className={`w-full h-full relative transition-transform duration-700 ease-in-out [transform-style:preserve-3d] ${isFlipped ? '[transform:rotateY(180deg)]' : ''} ${isScaled ? 'rounded-2xl shadow-2xl' : 'rounded-xl shadow-md hover:shadow-2xl'}`}>
      
      {/* ─── FRONT FACE ─── */}
      <div className={`absolute inset-0 w-full h-full bg-white overflow-hidden [backface-visibility:hidden] flex flex-col justify-between border border-gray-100 ${isScaled ? 'rounded-2xl' : 'rounded-xl'}`}>
        {/* Image Container */}
        <div className={`relative bg-gradient-to-br from-gray-50 to-gray-100 aspect-square flex items-center justify-center overflow-hidden ${isScaled ? 'p-8' : 'p-6'}`}>
          {sneaker.thumbnail_url ? (
            <img
              src={sneaker.thumbnail_url}
              alt={sneaker.name}
              className={`w-full h-full object-contain transition-transform scale-105 duration-300 ${isScaled ? 'p-10' : 'p-8'}`}
            />
          ) : (
            <Footprints className={isScaled ? 'w-16 h-16 text-gray-300' : 'w-12 h-12 text-gray-300'} />
          )}

          {/* Brand Logo in Upper Right Corner */}
          <div className={`absolute z-10 duration-200 pointer-events-none ${isScaled ? 'top-7 right-10' : 'top-6 right-8'}`}>
            <BrandLogo brand={sneaker.brand} sneakerName={sneaker.name} className={`${isScaled ? 'h-14 sm:h-16' : 'h-12 sm:h-14'} w-auto text-zinc-900 opacity-80`} />
          </div>

          {/* Hover action buttons (Edit & Delete only) */}
          <div className={`absolute z-20 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 ${isScaled ? 'top-3 right-3' : 'top-2 right-2'}`}>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(sneaker);
              }}
              className={`bg-white/90 backdrop-blur-sm rounded-lg border border-gray-200 text-gray-700 hover:text-gray-900 hover:bg-white shadow-sm transition-colors ${isScaled ? 'p-2' : 'p-1.5'}`}
              title="Edit Sneaker"
            >
              <Edit3 className={isScaled ? 'w-4 h-4' : 'w-3.5 h-3.5'} />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(sneaker.id);
              }}
              className={`bg-white/90 backdrop-blur-sm rounded-lg border border-gray-200 text-red-400 hover:text-red-600 hover:bg-red-50 shadow-sm transition-colors ${isScaled ? 'p-2' : 'p-1.5'}`}
              title="Delete Sneaker"
            >
              <Trash2 className={isScaled ? 'w-4 h-4' : 'w-3.5 h-3.5'} />
            </button>
          </div>

          {/* Interactive Worn count badge (50/50 split on hover) */}
          <div className="absolute bottom-2 left-2 z-20">
            <InteractiveWornBadge
              worn={sneaker.worn || 0}
              onIncrement={handleIncrementWear}
              onDecrement={handleDecrementWear}
              isScaled={isScaled}
            />
          </div>

          {/* Height badge */}
          {sneaker.height && (
            <div className={`absolute bottom-2 right-2 px-2 pt-0.5 pb-1 ${
              sneaker.height.toLowerCase().includes('low') ? 'bg-sky-600' :
              sneaker.height.toLowerCase().includes('mid') ? 'bg-amber-600' :
              sneaker.height.toLowerCase().includes('high') ? 'bg-rose-600' : 'bg-emerald-600'
            } backdrop-blur-sm rounded-md font-medium text-white ${isScaled ? 'text-xs px-2.5 py-1' : 'text-[10px]'}`}> 
              {sneaker.height}
            </div>
          )}
        </div>

        {/* Content Container */}
        <div className={`bg-white flex-1 flex flex-col justify-between ${isScaled ? 'p-4' : 'p-3'}`}>
          <h3 className={`font-bold text-gray-900 leading-tight line-clamp-2 ${isScaled ? 'text-base h-11' : 'text-sm h-9'}`} title={sneaker.name}>
            {sneaker.name || 'Unnamed Sneaker'}
          </h3>

          {/* Style pills */}
          {sneaker.style.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {sneaker.style.map((st) => (
                <span
                  key={st}
                  className={`px-1.5 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-md font-medium ${isScaled ? 'text-xs' : 'text-[10px]'}`}
                >
                  {st}
                </span>
              ))}
            </div>
          )}

          {/* Color swatches */}
          {sneaker.color.length > 0 && (
            <div className={`flex items-center flex-wrap ${isScaled ? 'gap-2 pt-1.5' : 'gap-1.5 pt-1'}`}>
              {sneaker.color.map((c, idx) => {
                const val = COLOR_HEX[c] || (c.startsWith('#') ? c : '#cccccc');
                const isImage = val.startsWith('/') || val.startsWith('data:') || val.includes('assets/') || val.includes('blob:');
                return (
                  <div
                    key={`${c}-${idx}`}
                    className={`rounded-full border border-gray-900 hover:scale-125 transition-all duration-200 bg-center bg-cover ${isScaled ? 'w-4 h-4' : 'w-3.5 h-3.5'}`}
                    style={isImage ? { backgroundImage: `url(${val})` } : { backgroundColor: val }}
                    title={c}
                  />
                );
              })}
            </div>
          )}

          {/* Last Worn Footer */}
          <div className={`border-t border-gray-100 flex items-center justify-between text-gray-500 font-medium ${isScaled ? 'pt-2.5 mt-2.5 text-xs' : 'pt-2 mt-2 text-[10px]'}`}>
            <span>Last Worn:</span>
            <span className="text-gray-700 px-1.5 py-0.5 font-semibold">
              {formatLastWorn(sneaker.last_worn)}
            </span>
          </div>
        </div>
      </div>

      {/* ─── BACK FACE ─── */}
      <div className={`absolute inset-0 w-full h-full bg-white text-gray-900 overflow-hidden [backface-visibility:hidden] [transform:rotateY(180deg)] flex flex-col border border-gray-200 shadow-md ${isScaled ? 'rounded-2xl p-4' : 'rounded-xl p-3'}`}>
        
        {/* 1. Name at the Top */}
        <div className={`flex items-start justify-between gap-2 pb-2 border-b border-gray-100 shrink-0 ${isScaled ? 'h-[76px]' : 'h-[64px]'}`}>
          <div className="flex-1 min-w-0 pr-1 flex flex-col justify-start overflow-hidden">
            <div className="flex items-center gap-1.5 mb-1 shrink-0">
              <BrandLogo brand={sneaker.brand} sneakerName={sneaker.name} className="h-4 w-auto text-zinc-900" />
            </div>
            <h4 className={`font-bold text-gray-900 leading-tight break-words ${isScaled ? 'text-base' : 'text-xs sm:text-sm'}`} title={sneaker.name}>
              {sneaker.name || 'Unnamed Sneaker'}
            </h4>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(sneaker);
              }}
              className="p-1 text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
              title="Edit"
            >
              <Edit3 className={isScaled ? 'w-4 h-4' : 'w-3.5 h-3.5'} />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(sneaker.id);
              }}
              className="p-1 text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 rounded-md transition-colors"
              title="Delete"
            >
              <Trash2 className={isScaled ? 'w-4 h-4' : 'w-3.5 h-3.5'} />
            </button>
          </div>
        </div>

        {/* 2. Image Gallery */}
        <div className="my-2 shrink-0">
          <div className="flex items-center justify-between mb-1">
            <span className={`font-semibold text-gray-500 uppercase tracking-wider ${isScaled ? 'text-xs' : 'text-[10px]'}`}>
              Image Gallery ({galleryImages.length})
            </span>
            {galleryImages.length > 0 && (
              <span className={`text-gray-400 font-normal ${isScaled ? 'text-[11px]' : 'text-[9px]'}`}>
                Click to expand
              </span>
            )}
          </div>
          
          {galleryImages.length > 0 ? (
            <div className="grid grid-cols-3 gap-1.5">
              {galleryImages.slice(0, 3).map((img, idx) => (
                <div
                  key={idx}
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenLightbox(idx);
                  }}
                  className={`relative group aspect-square rounded-lg overflow-hidden border border-gray-200 bg-gray-50 cursor-pointer transition-transform hover:scale-105 hover:border-blue-500 shadow-sm ${isScaled ? 'p-1' : 'p-0.5'}`}
                  title="Click to view in Lightbox"
                >
                  <img src={img} alt={`${sneaker.name} gallery ${idx + 1}`} className="w-full h-full object-contain" />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/25 transition-colors flex items-center justify-center">
                    <Maximize2 className="w-3.5 h-3.5 text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-md" />
                  </div>
                  {idx === 0 && (
                    <span className="absolute bottom-0.5 left-0.5 bg-amber-500 text-black text-[8px] font-extrabold px-1 py-0.2 rounded shadow-2xs">Main</span>
                  )}
                  {idx === 2 && galleryImages.length > 3 && (
                    <div className="absolute inset-0 bg-black/60 text-white font-bold text-xs flex items-center justify-center rounded-lg">
                      +{galleryImages.length - 3}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="h-16 bg-gray-50 rounded-lg border border-dashed border-gray-200 flex items-center justify-center text-gray-400 text-xs">
              <Footprints className="w-6 h-6 text-gray-300" />
            </div>
          )}
        </div>

        {/* 3. 4 Small Wear Stats Cards */}
        <div className="my-1.5 shrink-0">
          <div className={`font-semibold text-gray-500 uppercase tracking-wider mb-1 ${isScaled ? 'text-xs' : 'text-[10px]'}`}>
            Wear Counts
          </div>
          <div className="grid grid-cols-4 gap-1 sm:gap-1.5">
            <div className="bg-gradient-to-br from-blue-600/10 to-blue-600/20 border border-blue-700/20 rounded-lg p-1 text-center shadow-2xs">
              <div className={`text-gray-500 font-medium ${isScaled ? 'text-[10px]' : 'text-[9px]'} uppercase leading-none`}>30D</div>
              <div className={`font-extrabold text-gray-900 ${isScaled ? 'text-sm mt-0.5' : 'text-xs mt-0.5'}`}>{stats.last1m}x</div>
            </div>
            <div className="bg-gradient-to-br from-blue-600/10 to-blue-600/20 border border-blue-700/20 rounded-lg p-1 text-center shadow-2xs">
              <div className={`text-gray-500 font-medium ${isScaled ? 'text-[10px]' : 'text-[9px]'} uppercase leading-none`}>3M</div>
              <div className={`font-extrabold text-gray-900 ${isScaled ? 'text-sm mt-0.5' : 'text-xs mt-0.5'}`}>{stats.last3m}x</div>
            </div>
            <div className="bg-gradient-to-br from-blue-600/10 to-blue-600/20 border border-blue-700/20 rounded-lg p-1 text-center shadow-2xs">
              <div className={`text-gray-500 font-medium ${isScaled ? 'text-[10px]' : 'text-[9px]'} uppercase leading-none`}>6M</div>
              <div className={`font-extrabold text-gray-900 ${isScaled ? 'text-sm mt-0.5' : 'text-xs mt-0.5'}`}>{stats.last6m}x</div>
            </div>
            <div className="bg-gradient-to-br from-blue-600/10 to-blue-600/20 border border-blue-700/20 rounded-lg p-1 text-center shadow-2xs">
              <div className={`text-gray-500 font-medium ${isScaled ? 'text-[10px]' : 'text-[9px]'} uppercase leading-none`}>1Y</div>
              <div className={`font-extrabold text-gray-900 ${isScaled ? 'text-sm mt-0.5' : 'text-xs mt-0.5'}`}>{stats.last12m}x</div>
            </div>
          </div>
        </div>

        {/* 4. Condition & Frequency Section Below */}
        <div className="mt-auto pt-1.5 border-t border-gray-100 shrink-0 space-y-1">
          {sneaker.condition && (
            <div className="flex items-center justify-between">
              <span className={`font-semibold text-gray-500 uppercase tracking-wider ${isScaled ? 'text-xs' : 'text-[10px]'}`}>
                Condition:
              </span>
              <span className={`font-semibold border rounded px-1.5 py-0.5 ${getConditionBadgeStyle(sneaker.condition, 'light')} ${isScaled ? 'text-xs' : 'text-[10px]'}`}>
                {sneaker.condition}
              </span>
            </div>
          )}
          <div className="flex items-center justify-between">
            <span className={`font-semibold text-gray-500 uppercase tracking-wider ${isScaled ? 'text-xs' : 'text-[10px]'}`}>
              Wear Frequency:
            </span>
            <span className={`font-semibold italic px-2 py-0.5 ${stats.frequencyText === 'Needs more data' ? 'text-amber-600' : stats.frequencyText === 'Never worn' ? 'text-zinc-500' : 'text-blue-700'} ${isScaled ? 'text-xs' : 'text-[10px]'}`}>
              {stats.frequencyText}
            </span>
          </div>
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

