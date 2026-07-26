import { useState } from 'react';
import { Sneaker } from '../lib/supabase';
import { Trash2, Edit3, Footprints, X } from 'lucide-react';
import { COLOR_HEX } from '../lib/colors';
import { BrandLogo } from './BrandLogo';

interface SneakerCardProps {
  sneaker: Sneaker;
  onEdit: (sneaker: Sneaker) => void;
  onDelete: (id: string) => void;
}

export default function SneakerCard({ sneaker, onEdit, onDelete }: SneakerCardProps) {
  const [isEnlarged, setIsEnlarged] = useState(false);

  const handleCardClick = (e: React.MouseEvent) => {
    // Only enlarge if not clicking interactive buttons directly
    if ((e.target as HTMLElement).closest('button')) return;
    setIsEnlarged(true);
  };

  return (
    <>
      {/* Flip Card Container */}
      <div
        onClick={handleCardClick}
        className="group relative w-full max-w-[288px] h-[370px] mx-auto cursor-pointer [perspective:1000px]"
      >
        <CardInner sneaker={sneaker} onEdit={onEdit} onDelete={onDelete} />
      </div>

      {/* Enlarged Modal View (With Blurry Backdrop) */}
      {isEnlarged && (
        <div
          className="fixed inset-0 z-50 bg-black/65 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setIsEnlarged(false)}
        >
          {/* Floating Close Button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsEnlarged(false);
            }}
            className="absolute top-4 right-4 sm:top-6 sm:right-6 z-50 p-2.5 bg-white/90 hover:bg-white text-gray-800 rounded-full shadow-xl border border-gray-200 transition-transform duration-200 hover:scale-110"
            title="Close enlarged view"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Scaled-up Card */}
          <div
            className="group relative w-[340px] sm:w-[380px] h-[440px] sm:h-[490px] cursor-pointer [perspective:1200px] animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <CardInner sneaker={sneaker} onEdit={onEdit} onDelete={onDelete} isScaled />
          </div>
        </div>
      )}
    </>
  );
}

function CardInner({
  sneaker,
  onEdit,
  onDelete,
  isScaled = false,
}: {
  sneaker: Sneaker;
  onEdit: (sneaker: Sneaker) => void;
  onDelete: (id: string) => void;
  isScaled?: boolean;
}) {
  return (
    <div className={`w-full h-full relative transition-transform duration-700 ease-in-out [transform-style:preserve-3d] group-hover:[transform:rotateY(180deg)] ${isScaled ? 'rounded-2xl shadow-2xl' : 'rounded-xl shadow-md hover:shadow-2xl'}`}>
      
      {/* ─── FRONT FACE ─── */}
      <div className={`absolute inset-0 w-full h-full bg-white overflow-hidden [backface-visibility:hidden] flex flex-col justify-between border border-gray-100 ${isScaled ? 'rounded-2xl' : 'rounded-xl'}`}>
        {/* Image Container */}
        <div className={`relative bg-gradient-to-br from-gray-50 to-gray-100 aspect-square flex items-center justify-center overflow-hidden ${isScaled ? 'p-8' : 'p-6'}`}>
          {sneaker.image_url ? (
            <img
              src={sneaker.image_url}
              alt={sneaker.name}
              className={`w-full h-full object-contain transition-transform scale-105 duration-300 ${isScaled ? 'p-10' : 'p-8'}`}
            />
          ) : (
            <Footprints className={isScaled ? 'w-16 h-16 text-gray-300' : 'w-12 h-12 text-gray-300'} />
          )}

          {/* Brand Logo in Upper Right Corner */}
          <div className={`absolute z-10 transition-opacity duration-200 pointer-events-none group-hover:opacity-0 ${isScaled ? 'top-[14px] right-[28px] scale-95' : 'top-[12px] right-[26px] scale-90'}`}>
            <BrandLogo brand={sneaker.brand} sneakerName={sneaker.name} />
          </div>

          {/* Hover action buttons */}
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

          {/* Worn count badge */}
          {sneaker.worn > 0 && (
            <div className={`absolute bottom-2 left-2 px-2 pt-0.5 pb-1 bg-black/70 backdrop-blur-sm rounded-md text-white font-medium ${isScaled ? 'text-xs px-2.5 py-1' : 'text-[10px]'}`}>
              Worn {sneaker.worn}x
            </div>
          )}

          {/* Height badge */}
          {sneaker.height && (
            <div className={`absolute bottom-2 right-2 px-2 pt-0.5 pb-1 bg-emerald-600/50 backdrop-blur-sm rounded-md text-white font-medium ${isScaled ? 'text-xs px-2.5 py-1' : 'text-[10px]'}`}>
              {sneaker.height}
            </div>
          )}
        </div>

        {/* Content Container */}
        <div className={`bg-white space-y-1 ${isScaled ? 'p-4 space-y-1.5' : 'p-3'}`}>
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
            <span className="text-gray-700 bg-gray-100 px-1.5 py-0.5 rounded-md font-semibold">
              {formatLastWorn(sneaker.last_worn)}
            </span>
          </div>
        </div>
      </div>

      {/* ─── BACK FACE ─── */}
      <div className={`absolute inset-0 w-full h-full bg-white text-gray-900 overflow-hidden [backface-visibility:hidden] [transform:rotateY(180deg)] flex flex-col justify-between border border-gray-200 shadow-md ${isScaled ? 'rounded-2xl' : 'rounded-xl'}`}>
        
        {/* Top Image Container on Back Face */}
        <div className={`relative bg-gradient-to-br from-gray-50 to-gray-100 flex items-center aspect-square justify-center overflow-hidden shrink-0 ${isScaled ? 'h-48 p-4' : 'h-36 p-3'}`}>
          {sneaker.image_url ? (
            <img
              src={sneaker.image_url}
              alt={sneaker.name}
              className={`w-full h-full object-contain ${isScaled ? 'p-4' : 'p-3'}`}
            />
          ) : (
            <Footprints className={isScaled ? 'w-12 h-12 text-gray-300' : 'w-10 h-10 text-gray-300'} />
          )}

          {/* Brand Logo in Upper Right Corner */}
          <div className={`absolute z-10 pointer-events-none ${isScaled ? 'top-[18px] right-[24px] scale-110' : 'top-[14px] right-[18px]'}`}>
            <BrandLogo brand={sneaker.brand} sneakerName={sneaker.name} />
          </div>

          {/* Edit / Delete Buttons */}
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
        </div>

        {/* Back Details Body */}
        <div className={`flex-1 flex flex-col justify-between ${isScaled ? 'p-4 space-y-3' : 'p-3 space-y-2'}`}>
          <div className="space-y-2">
            {/* Title */}
            <h4 className={`font-bold text-gray-900 leading-tight line-clamp-1 ${isScaled ? 'text-base' : 'text-sm'}`} title={sneaker.name}>
              {sneaker.name || 'Unnamed Sneaker'}
            </h4>

            {/* Height & Styles Pills (All uniformly colored!) */}
            {(sneaker.height || sneaker.style.length > 0) && (
              <div className="flex flex-wrap items-center gap-1.5">
                {sneaker.height && (
                  <span className={`px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-md font-medium ${isScaled ? 'text-xs' : 'text-[10px]'}`}>
                    {sneaker.height}
                  </span>
                )}
                {sneaker.style.map((st) => (
                  <span
                    key={st}
                    className={`px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-md font-medium ${isScaled ? 'text-xs' : 'text-[10px]'}`}
                  >
                    {st}
                  </span>
                ))}
              </div>
            )}

            {/* Colorway Swatches with Names */}
            {sneaker.color.length > 0 && (
              <div className="flex items-center flex-wrap gap-1.5 pt-0.5">
                {sneaker.color.map((c, idx) => {
                  const val = COLOR_HEX[c] || (c.startsWith('#') ? c : '#cccccc');
                  const isImage = val.startsWith('/') || val.startsWith('data:') || val.includes('assets/') || val.includes('blob:');
                  return (
                    <div key={`${c}-${idx}`} className="flex items-center gap-1 bg-gray-50 px-2 py-0.5 rounded-full border border-gray-200">
                      <div
                        className="w-3 h-3 rounded-full border border-gray-300 bg-center bg-cover"
                        style={isImage ? { backgroundImage: `url(${val})` } : { backgroundColor: val }}
                      />
                      <span className={`text-gray-700 font-medium ${isScaled ? 'text-xs' : 'text-[10px]'}`}>{c}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Stats Footer */}
          <div className={`border-t border-gray-100 flex items-center justify-between text-gray-500 font-medium ${isScaled ? 'pt-2.5 text-xs' : 'pt-2 text-[10px]'}`}>
            <div className="flex items-center gap-1">
              <span>Last Worn:</span>
              <span className="text-gray-700 bg-gray-100 px-1.5 py-0.5 rounded-md font-semibold">
                {formatLastWorn(sneaker.last_worn)}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <span>Worn:</span>
              <span className="text-gray-700 bg-gray-100 px-1.5 py-0.5 rounded-md font-semibold">
                {sneaker.worn}x
              </span>
            </div>
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


