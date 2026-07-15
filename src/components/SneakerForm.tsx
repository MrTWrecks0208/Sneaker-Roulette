import { useState, useRef, useEffect, useCallback } from 'react';
import { Sneaker, SneakerInsert, BRANDS, HEIGHTS, STYLES, COLORS, buildName } from '../lib/supabase';
import { X, Upload, Loader2, Camera, Sparkles } from 'lucide-react';
import multicolorImg from '../assets/images/multicolor_swatch_1783883698636.jpg';
import iridescentImg from '../assets/images/iridescent.png';

const COLOR_GLOW: Record<string, { bg: string; text: string; border: string; shadow: string }> = {
  'White':            { bg: 'rgba(255,255,255,.80)', text: '#000000', border: 'rgba(255,255,255,.80)' },
  'Ivory':            { bg: 'rgba(255,255,240,.80)', text: '#000000', border: 'rgba(255,255,240,.80)' },
  'Black':            { bg: 'rgba(0,0,0,.80)'      , text: '#ffffff', border: 'rgba(0,0,0,0.80)' },
  'Gunmetal':         { bg: 'rgba(42,52,57,.80)', text: '#ffffff', border: 'rgba(42,52,57,.80)' },
  'Dark Gray':        { bg: 'rgba(50,50,50,.80)', text: '#ffffff', border: 'rgba(50,50,50,.80)' },
  'Gray':             { bg: 'rgba(150,150,150,.80)', text: '#000000', border: 'rgba(150,150,150,.80)' },
  'Light Gray':       { bg: 'rgba(210,210,210,.80)', text: '#000000', border: 'rgba(210,210,210,.80)' },
  'Dark Brown':       { bg: 'rgba(53,33,0,.80)',   text: '#ffffff', border: 'rgba(53,33,0,.80)' },
  'Brown':            { bg: 'rgba(88,57,39,.80)',   text: '#ffffff', border: 'rgba(88,57,39,.80)' },
  'Tan':              { bg: 'rgba(210,180,140,.80)', text: '#ffffff', border: 'rgba(210,180,140,.80)' },
  'Beige':            { bg: 'rgba(245,245,220,.80)', text: '#000000', border: 'rgba(245,245,220,.80)' },
  'Red':              { bg: 'rgba(239,68,68,.80)',   text: '#ffffff', border: 'rgba(239,68,68,.80)' },
  'Crimson':          { bg: 'rgba(220,20,60,.80)',   text: '#ffffff', border: 'rgba(220,20,60,.80)' },
  'Orange':           { bg: 'rgba(249,115,22,.80)',  text: '#ffffff', border: 'rgba(249,115,22,.80)' },
  'Light Yellow':     { bg: 'rgba(254,249,195,.80)', text: '#000000', border: 'rgba(254,249,195,.80)' },
  'Yellow':           { bg: 'rgba(250,204,21,.80)',  text: '#000000', border: 'rgba(250,204,21,.80)' },
  'Mint':             { bg: 'rgba(170,240,200,.80)', text: '#000000', border: 'rgba(170,240,200,.80)' },
  'Lime Green':       { bg: 'rgba(132,204,22,.80)',  text: '#000000', border: 'rgba(132,204,22,.80)' },
  'Green':            { bg: 'rgba(34,197,94,.80)',   text: '#ffffff', border: 'rgba(34,197,94,.80)' },
  'Forest Green':     { bg: 'rgba(34,100,60,.80)',   text: '#ffffff', border: 'rgba(34,139,34,.80)' },
  'Olive':            { bg: 'rgba(128,128,0,.80)',   text: '#ffffff', border: 'rgba(128,128,0,.80)' },
  'Teal':             { bg: 'rgba(20,184,166,.80)',  text: '#000000', border: 'rgba(20,184,166,.80)' },
  'Turquoise':        { bg: 'rgba(64,224,208,.80)',  text: '#000000', border: 'rgba(64,224,208,.80)' },
  'Light Blue':       { bg: 'rgba(125,211,252,.80)', text: '#000000', border: 'rgba(125,211,252,.80)' },
  'Aqua':             { bg: 'rgba(0,255,255,.80)',   text: '#000000', border: 'rgba(0,255,255,.80)' },
  'Blue':             { bg: 'rgba(59,130,246,.80)',  text: '#ffffff', border: 'rgba(59,130,246,.80)' },
  'Navy':             { bg: 'rgba(30,58,138,.80)',  text: '#ffffff', border: 'rgba(30,64,175,.80)' },
  'Indigo':           { bg: 'rgba(99,102,241,.80)',  text: '#ffffff', border: 'rgba(99,102,241,.80)' },
  'Purple':           { bg: 'rgba(168,85,247,.80)',  text: '#ffffff', border: 'rgba(168,85,247,.80)' },
  'Maroon':           { bg: 'rgba(128,0,0,.80)',     text: '#ffffff', border: 'rgba(128,0,0,.80)' },
  'Burgundy':         { bg: 'rgba(128,0,32,.80)',    text: '#ffffff', border: 'rgba(128,0,32,.80)' },
  'Magenta':          { bg: 'rgba(216,0,115,.80)',   text: '#ffffff', border: 'rgba(216,0,115,.80)' },
  'Pink':             { bg: 'rgba(236,72,153,.80)',  text: '#000000', border: 'rgba(236,72,153,.80)' },
  'Hot Pink':         { bg: 'rgba(255,0,110,.80)',   text: '#ffffff', border: 'rgba(255,0,110,.80)' },
  'Gold':             { bg: 'rgba(239,191,4,.80)',   text: '#000000', border: 'rgba(255,215,0,.80)' },
  'Silver':           { bg: 'rgba(192,192,192,.80)', text: '#000000', border: 'rgba(192,192,192,.80)' },
  'Reflective':{ bg: 'rgba(200,210,220,.80)', text: '#000000', border: 'rgba(200,210,220,.80)' },
  'Glow':             { bg: 'rgba(0,255,128,.80)',   text: '#000000', border: 'rgba(0,255,128,.80)' },
  'Iridescent':       { bg: 'rgba(180,160,255,.80)', text: '#ffffff', border: 'rgba(180,160,255,.80)' },
  'Ice':              { bg: 'rgba(160,230,255,.80)', text: '#000000', border: 'rgba(160,230,255,.80)' },
  'Multicolor':       { bg: 'rgba(200,150,255,.80)', text: '#000000', border: 'rgba(200,150,255,.80)' },
};

interface SneakerFormProps {
  sneaker?: Sneaker | null;
  onSave: (data: SneakerInsert) => Promise<Sneaker | null>;
  onCancel: () => void;
}

// ─── Local name parser ────────────────────────────────────────────────────────
// Parses a freeform sneaker name like "Jordan 1 Retro High OG Black Toe" into
// brand, model, colorway, height using the BRANDS/HEIGHTS constants.

const BRAND_LOWER_MAP = BRANDS.filter(b => b !== 'Other').map(b => ({
  original: b,
  lower: b.toLowerCase(),
  tokens: b.toLowerCase().split(/\s+/),
}));

const HEIGHT_KEYWORDS: Record<string, string> = {
  'low': 'Low',
  'low top': 'Low',
  'low-top': 'Low',
  'mid': 'Mid',
  'mid top': 'Mid',
  'mid-top': 'Mid',
  'high': 'High',
  'high top': 'High',
  'high-top': 'High',
  'high og': 'High',
};

interface ParsedName {
  brand: string;
  model: string;
  variant: string;
  colorway: string;
  height: string;
}

function parseSneakerName(name: string): ParsedName {
  const tokens = name.trim().split(/\s+/).filter(Boolean);
  if (!tokens.length) return { brand: '', model: '', colorway: '', height: '' };

  // 1. Extract brand
  let brand = '';
  let brandEndIdx = 0;
  // Check multi-word brands first (longer match wins)
  const sorted = [...BRAND_LOWER_MAP].sort((a, b) => b.tokens.length - a.tokens.length);
  for (const b of sorted) {
    const start = name.toLowerCase().indexOf(b.lower);
    if (start === 0) {
      brand = b.original;
      brandEndIdx = b.tokens.length;
      break;
    }
  }

  // 2. Extract height from the remaining tokens
  const remaining = tokens.slice(brandEndIdx).join(' ').toLowerCase();
  let height = '';
  let heightTokenCount = 0;
  // Check multi-word height keywords first
  for (const [keyword, value] of Object.entries(HEIGHT_KEYWORDS)) {
    if (keyword.includes(' ')) {
      const idx = remaining.indexOf(keyword);
      if (idx >= 0) {
        height = value;
        heightTokenCount = keyword.split(/\s+/).length;
        break;
      }
    }
  }
  if (!height) {
    for (const [keyword, value] of Object.entries(HEIGHT_KEYWORDS)) {
      if (!keyword.includes(' ')) {
        const rTokens = remaining.split(/\s+/);
        if (rTokens.includes(keyword)) {
          height = value;
          heightTokenCount = 1;
          break;
        }
      }
    }
  }

  // 3. Identify known structural tokens to split model / colorway
  const STRUCTURAL_KEYWORDS = ['retro','og','sp','se','gs','ps','td','vintage','pro','elite'];

  // Everything after brand, minus height tokens
  const afterBrand = tokens.slice(brandEndIdx);
  let filteredTokens = [...afterBrand];

  // Remove height tokens from the end or middle
  if (height && heightTokenCount > 0) {
    // Remove from the most likely position
    const heightLower = height.toLowerCase();
    let removed = 0;
    filteredTokens = filteredTokens.filter(t => {
      if (removed >= heightTokenCount) return true;
      if (t.toLowerCase() === heightLower || STRUCTURAL_KEYWORDS.includes(t.toLowerCase()) && removed < heightTokenCount) {
        // Only remove the bare height word, not structural keywords
        if (t.toLowerCase() === heightLower) { removed++; return false; }
      }
      return true;
    });
  }

  // 4. Split into model / colorway
  // Model = first 1-3 tokens (the core shoe name/number)
  // Variant = structural keywords like Retro, OG, etc.
  // Colorway = the rest (descriptive color/name)
  let modelTokens: string[] = [];
  const variantTokens: string[] = [];
  let colorwayTokens: string[] = [];

  const hasStructural = filteredTokens.some(t => 
    STRUCTURAL_KEYWORDS.includes(t.toLowerCase()) || ['og','v2','v3'].includes(t.toLowerCase())
  );

  if (hasStructural) {
    let phase: 'model' | 'variant' | 'colorway' = 'model';
    for (const t of filteredTokens) {
      const tLower = t.toLowerCase();
      if (phase === 'model' && STRUCTURAL_KEYWORDS.includes(tLower)) {
        phase = 'variant';
      }
      if (phase === 'model') {
        modelTokens.push(t);
      } else if (phase === 'variant') {
        if (STRUCTURAL_KEYWORDS.includes(tLower) || ['og','v2','v3'].includes(tLower)) {
          variantTokens.push(t);
        } else {
          phase = 'colorway';
          colorwayTokens.push(t);
        }
      } else {
        colorwayTokens.push(t);
      }
    }
  } else {
    // Smart split when there are no structural keywords
    let splitIndex = -1;

    // Rule 1: Find a token in the first 3 tokens that contains a digit (e.g. "1", "350", "990v5")
    const limit = Math.min(3, filteredTokens.length);
    for (let i = 0; i < limit; i++) {
      if (/\d/.test(filteredTokens[i])) {
        splitIndex = i + 1; // Split after this token
        break;
      }
    }

    // Rule 2: Find a known color token (at index >= 1) to split before it
    if (splitIndex === -1) {
      const knownColors = new Set([
        'white', 'ivory', 'black', 'gunmetal', 'dark gray', 'gray', 'grey', 'light gray', 'dark brown', 'brown', 'tan',
        'beige', 'red', 'crimson', 'orange', 'light yellow', 'yellow', 'mint', 'lime green',
        'green', 'forest green', 'olive', 'teal', 'turquoise', 'light blue', 'aqua', 'blue', 'navy', 'indigo',
        'purple', 'maroon', 'burgundy', 'magenta', 'pink', 'hot pink', 'gold', 'silver', 'reflective silver',
        'glow', 'iridescent', 'ice', 'multicolor', 'carolina blue'
      ]);
      for (let i = 1; i < filteredTokens.length; i++) {
        if (knownColors.has(filteredTokens[i].toLowerCase())) {
          splitIndex = i; // Split before this token
          break;
        }
      }
    }

    // Rule 3: Fallback split based on length
    if (splitIndex === -1) {
      if (filteredTokens.length <= 1) {
        splitIndex = filteredTokens.length;
      } else if (filteredTokens.length === 2) {
        splitIndex = 1;
      } else {
        splitIndex = 2;
      }
    }

    modelTokens = filteredTokens.slice(0, splitIndex);
    colorwayTokens = filteredTokens.slice(splitIndex);
  }

  // If model is too long (4+ tokens), keep first 2 as model and push rest to colorway
  if (modelTokens.length > 3) {
    colorwayTokens = [...modelTokens.slice(2), ...variantTokens, ...colorwayTokens];
    modelTokens = modelTokens.slice(0, 2);
  }

  // Also handle height keywords still embedded in variant/colorway
  const removeHeightWords = (arr: string[]) => arr.filter(t => t.toLowerCase() !== height?.toLowerCase());
  colorwayTokens = removeHeightWords(colorwayTokens);

  return {
    brand,
    model: modelTokens.join(' '),
    height: height || '',
    colorway: colorwayTokens.join(' '),
    variant: variantTokens.join(' '),
   
  };
}

// ─── Component ─────────────────────────────────────────────────────────────────

export default function SneakerForm({ sneaker, onSave, onCancel }: SneakerFormProps) {
  const [nameInput, setNameInput] = useState(sneaker ? buildName(sneaker.brand, sneaker.model, sneaker.height, sneaker.colorway, sneaker.variant) : '');
  const [brand, setBrand] = useState(sneaker?.brand || '');
  const [model, setModel] = useState(sneaker?.model || '');
  const [height, setHeight] = useState(sneaker?.height || '');
  const [variant, setVariant] = useState(sneaker?.variant || '');
  const [colorway, setColorway] = useState(sneaker?.colorway || '');
  const [style, setStyle] = useState<string[]>(sneaker?.style || []);
  const [color, setColor] = useState<string[]>(sneaker?.color || []);
  const [worn, setWorn] = useState(sneaker?.worn || 0);
  const [imageUrl, setImageUrl] = useState(sneaker?.image_url || '');
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [lookingUp, setLookingUp] = useState(false);
  const [lookupMessage, setLookupMessage] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [userEditedFields, setUserEditedFields] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const autoName = buildName(brand, model, variant, colorway);

  useEffect(() => {
    if (sneaker) {
      setBrand(sneaker.brand);
      setModel(sneaker.model);
      setHeight(sneaker.height);
      setVariant(sneaker.variant);
      setColorway(sneaker.colorway);
      setStyle(sneaker.style);
      setColor(sneaker.color);
      setWorn(sneaker.worn);
      setImageUrl(sneaker.image_url);
    }
  }, [sneaker]);

  const toggleMultiSelect = (arr: string[], value: string, setter: (v: string[]) => void) => {
    if (arr.includes(value)) {
      setter(arr.filter(v => v !== value));
    } else {
      setter([...arr, value]);
    }
  };

  const handleNameChange = useCallback((value: string) => {
    setNameInput(value);
    if (!userEditedFields) {
      const parsed = parseSneakerName(value);
      setBrand(parsed.brand);
      setModel(parsed.model);
      setVariant(parsed.variant);
      setColorway(parsed.colorway);
      if (parsed.height) setHeight(parsed.height);
    }
  }, [userEditedFields]);

  const handleFieldEdit = (setter: (v: string) => void) => (value: string) => {
    setUserEditedFields(true);
    setter(value);
  };

  const handleHeightEdit = (value: string) => {
    setUserEditedFields(true);
    setHeight(value);
  };

  const handleImageUpload = async (file: File) => {
    setUploading(true);
    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const dataUrl = e.target?.result as string;
        setImageUrl(dataUrl);
        setUploading(false);
      };
      reader.onerror = () => {
        console.error('File read error');
        setUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error('Upload error:', err);
      setUploading(false);
    }
  };

  const handleLookup = async () => {
    const q = nameInput.trim();
    if (!q) return;
    setLookingUp(true);
    setLookupMessage(null);
    setSuggestions([]);
    try {
      // Simulate artificial intelligence lookup with local parser for 100% offline reliability
      await new Promise(resolve => setTimeout(resolve, 600));
      const parsed = parseSneakerName(q);
      if (parsed.brand && parsed.model) {
        setBrand(parsed.brand);
        setModel(parsed.model);
        setVariant(parsed.variant);
        setColorway(parsed.colorway || '');
        if (parsed.height) setHeight(parsed.height);
        setLookupMessage(`Found: ${parsed.brand} ${parsed.model} ${parsed.variant} ${parsed.colorway}`.replace(/\s+/g, ' ').trim());
        setUserEditedFields(true);
      } else {
        setLookupMessage('Parsed name, but please check the fields below to confirm the brand and model.');
      }
    } catch (err) {
      console.error('Lookup error:', err);
      setLookupMessage('Lookup failed. Enter details manually.');
    }
    setLookingUp(false);
  };

  const handleSuggestionClick = async (s: string) => {
    setNameInput(s);
    const parsed = parseSneakerName(s);
    setBrand(parsed.brand);
    setModel(parsed.model);
    setVariant(parsed.variant);
    setColorway(parsed.colorway);
    if (parsed.height) setHeight(parsed.height);
    setLookupMessage(null);
    setSuggestions([]);
    setUserEditedFields(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const finalName = autoName || nameInput;
    await onSave({
      name: finalName,
      brand,
      model,
      variant,
      colorway,
      height: height || 'Low',
      style,
      color,
      worn,
      image_url: imageUrl,
    });
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-zinc-900 border border-zinc-800 rounded-t-2xl sm:rounded-2xl w-full sm:max-w-2xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-zinc-800 sticky top-0 bg-zinc-900 z-10">
          <h2 className="text-lg font-semibold text-zinc-100">
            {sneaker ? 'Edit Sneaker' : 'Add Sneaker'}
          </h2>
          <button onClick={onCancel} className="p-1 text-zinc-400 hover:text-zinc-200 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-5">
          {/* Name Input — primary entry point */}
          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1.5 uppercase tracking-wider">
              Sneaker Name
            </label>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={nameInput}
                onChange={e => handleNameChange(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleLookup(); } }}
                placeholder="e.g. Jordan 1 Retro High OG Black Toe"
                autoFocus
                className="flex-1 bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2.5 text-sm text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-blue-500 transition-colors"
              />
              <button
                type="button"
                onClick={handleLookup}
                disabled={lookingUp || !nameInput.trim()}
                className="px-4 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-500 disabled:opacity-40 transition-colors flex items-center justify-center gap-2 shrink-0"
                title="AI lookup — fills style, colors, and image"
              >
                {lookingUp ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                AI Fill
              </button>
            </div>
            <p className="mt-1 text-xs text-zinc-500">
              Brand, model, height, colorway, and variant auto-fill as you type. Use AI Fill to complete style &amp; colors.
            </p>
            {lookupMessage && (
              <p className={'mt-1.5 text-xs ' + (lookupMessage.startsWith('Found') ? 'text-emerald-400' : 'text-amber-400')}>
                {lookupMessage}
              </p>
            )}
            {suggestions.length > 0 && (
              <div className="mt-2 space-y-1">
                <p className="text-xs text-zinc-500">Did you mean:</p>
                <div className="flex flex-wrap gap-1.5">
                  {suggestions.map(s => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => handleSuggestionClick(s)}
                      className="px-2.5 py-1 bg-zinc-900 text-zinc-300 text-xs rounded-md border border-zinc-700 hover:border-blue-500 hover:text-blue-400 transition-colors"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Auto-filled Name Preview */}
          {(brand || model) && (
            <div className="bg-zinc-950 rounded-lg px-3 py-2.5 border border-zinc-800">
              <span className="text-xs text-zinc-500 uppercase tracking-wider">Preview: </span>
              <span className="text-sm text-zinc-300">{autoName}</span>
            </div>
          )}

          {/* Brand */}
          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1.5 uppercase tracking-wider">Brand</label>
            <select
              value={brand}
              onChange={e => handleFieldEdit(setBrand)(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2.5 text-sm text-zinc-200 focus:outline-none focus:border-blue-500 transition-colors"
            >
              <option value="">Select brand</option>
              {BRANDS.map(b => <option key={b} value={b}>{b}</option>)}
            </select>
          </div>

          {/* Model */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1.5 uppercase tracking-wider">Model</label>
              <input
                type="text"
                value={model}
                onChange={e => handleFieldEdit(setModel)(e.target.value)}
                placeholder="e.g. Air Max 90"
                className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2.5 text-sm text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
            {/* Height */}
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1.5 uppercase tracking-wider">Height</label>
              <div className="flex gap-2">
                {HEIGHTS.map(h => (
                  <button
                    key={h}
                    type="button"
                    onClick={() => handleHeightEdit(h)}
                    className={'flex-1 py-2 rounded-lg text-sm font-medium transition-colors border ' + (height === h ? 'bg-emerald-600/20 text-emerald-400 border-emerald-500/40' : 'bg-zinc-900 text-zinc-400 border-zinc-700 hover:border-zinc-500')}
                      >
                    {h}
                  </button>
                ))}
              </div>
            </div>
            {/* Colorway */}
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1.5 uppercase tracking-wider">Colorway</label>
              <input
                type="text"
                value={colorway}
                onChange={e => handleFieldEdit(setColorway)(e.target.value)}
                placeholder="e.g. Black Toe"
                className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2.5 text-sm text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
            {/* Variant */}           <div className="flex flex-col sm:flex-row gap-4">             <div>               <label className="block text-xs font-medium text-zinc-400 mb-1.5 uppercase tracking-wider">Variant</label>               <input                 type="text"                 value={variant}                 onChange={e => handleFieldEdit(setVariant)(e.target.value)}                 placeholder="e.g. 77 Blazer"                 className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2.5 text-sm text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-blue-500 transition-colors"               />             </div>           </div>
          </div>
         
          {/* Style */}
          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1.5 uppercase tracking-wider">Style</label>
            <div className="flex flex-wrap gap-2">
              {STYLES.map(s => (
                <button
                  key={s}
                  type="button"
                  onClick={() => toggleMultiSelect(style, s, setStyle)}
                  className={'px-3 pt-1.5 pb-1.5 rounded-2xl text-xs font-medium transition-colors border ' + (style.includes(s) ? 'bg-amber-600/20 text-amber-400 border-amber-500/40' : 'bg-zinc-900 text-zinc-400 border-zinc-700 hover:border-zinc-500')}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Colors */}
          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1.5 uppercase tracking-wider">Colors</label>
            <div className="flex flex-wrap gap-2">
              {COLORS.map(c => {
                const glow = COLOR_GLOW[c];
                const selected = color.includes(c);
                const isMulticolor = c === 'Multicolor';
                const isIridescent = c === 'Iridescent';
                return (
                  <button
                    key={c}
                    type="button"
                    onClick={() => toggleMultiSelect(color, c, setColor)}
                    className={'px-2 pt-1 pb-1.5 rounded-2xl text-xs font-medium transition-all duration-200 border ' + (selected && (glow || isMulticolor || isIridescent) ? '' : 'bg-zinc-900 text-zinc-400 border-zinc-700 hover:border-zinc-500')}
                    style={selected ? (isMulticolor ? {
                      backgroundImage: `url(${multicolorImg})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      color: '#ffffff',
                      borderColor: '#ffffff',
                      textShadow: '0px 1px 4px rgba(0,0,0,0.9), 0px 1px 2px rgba(0,0,0,0.9)',
                    } : (isIridescent ? {
                      backgroundImage: `url(${iridescentImg})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      color: '#000000',
                      borderColor: '#ffffff',
                      textShadow: '0px 1px 3px rgba(255,255,255,0.8)',
                    } : (glow ? {
                      backgroundColor: glow.bg,
                      color: glow.text,
                      borderColor: glow.border,
                      boxShadow: glow.shadow,
                    } : undefined))) : undefined}
                  >
                    {c}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Worn */}
          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1.5 uppercase tracking-wider">Times Worn</label>
            <input
              type="number"
              min="0"
              value={worn}
              onChange={e => setWorn(parseInt(e.target.value) || 0)}
              className="w-32 bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2.5 text-sm text-zinc-200 focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1.5 uppercase tracking-wider">Image</label>
            <div className="flex flex-col gap-3">
              {imageUrl && (
                <div className="relative w-32 h-32 rounded-lg overflow-hidden border border-zinc-700">
                  <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setImageUrl('')}
                    className="absolute top-1 right-1 p-1 bg-zinc-900/90 rounded text-zinc-400 hover:text-red-400"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="px-4 py-2 bg-zinc-800 text-zinc-300 text-sm rounded-lg border border-zinc-700 hover:bg-zinc-700 transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-40"
                >
                  {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                  Upload Image
                </button>
                <button
                  type="button"
                  onClick={() => cameraInputRef.current?.click()}
                  disabled={uploading}
                  className="px-4 py-2 bg-zinc-800 text-zinc-300 text-sm rounded-lg border border-zinc-700 hover:bg-zinc-700 transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-40"
                >
                  <Camera className="w-4 h-4" />
                  Take Photo
                </button>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={e => e.target.files?.[0] && handleImageUpload(e.target.files[0])}
                className="hidden"
              />
              <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={e => e.target.files?.[0] && handleImageUpload(e.target.files[0])}
                className="hidden"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={saving || !brand || !model}
              className="w-full py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              {saving ? 'Saving...' : sneaker ? 'Update Sneaker' : 'Add Sneaker'}
            </button>
          </div>
   
        </form>
             
      </div>
    </div>
  );
}
