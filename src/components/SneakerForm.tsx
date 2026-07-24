import { useState, useRef, useEffect, useCallback } from 'react';
import { Sneaker, SneakerInsert, BRANDS, BRAND_CATEGORIES, HEIGHTS, STYLES, COLORS, CONDITIONS, buildName } from '../lib/supabase';
import { X, Upload, Loader2, Camera, Sparkles, HelpCircle, GripVertical, Star, Calendar, Plus, ListFilter } from 'lucide-react';
import multicolorImg from '../assets/images/multicolor_swatch_1783883698636.jpg';
import iridescentImg from '../assets/images/iridescent.png';
import { parseDatesWorn } from '../lib/utils';

const COLOR_GLOW: Record<string, { bg: string; text: string; border: string; shadow?: string }> = {
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
  'Reflective':       { bg: 'rgba(200,210,220,.80)', text: '#000000', border: 'rgba(200,210,220,.80)' },
  'Glow':             { bg: 'rgba(190,253,183,.80)', text: '#000000', border: 'rgba(190,253,183,.80)' },
  'Iridescent':       { bg: 'rgba(180,160,255,.80)', text: '#ffffff', border: 'rgba(180,160,255,.80)' },
  'Ice':              { bg: 'rgba(160,230,255,.80)', text: '#000000', border: 'rgba(160,230,255,.80)' },
  'Multicolor':       { bg: 'rgba(200,150,255,.80)', text: '#000000', border: 'rgba(200,150,255,.80)' },
  'Paua':             { bg: 'rgba(67,59,112,.80)',   text: '#ffffff', border: 'rgba(67,59,112,.80)' },
  'Light Green':      { bg: 'rgba(144,219,194,.80)', text: '#000000', border: 'rgba(144,219,194,.80)' },
  'Cyan Blue':        { bg: 'rgba(11,184,235,.80)',  text: '#ffffff', border: 'rgba(11,184,235,.80)' },
  'Citrus':           { bg: 'rgba(235,154,0,.80)',   text: '#000000', border: 'rgba(235,154,0,.80)' },
  'Gum':              { bg: 'rgba(133,103,75,.80)',  text: '#ffffff', border: 'rgba(133,103,75,.80)' },
  'Green Cyan':       { bg: 'rgba(124,206,175,.80)', text: '#000000', border: 'rgba(124,206,175,.80)' },
  'Carolina Blue':    { bg: 'rgba(114,172,214,.80)', text: '#000000', border: 'rgba(114,172,214,.80)' },
  'Platinum':         { bg: 'rgba(217,217,217,.80)', text: '#000000', border: 'rgba(217,217,217,.80)' },
};

interface SneakerFormProps {
  sneaker?: Sneaker | null;
  onSave: (data: SneakerInsert) => Promise<Sneaker | null>;
  onCancel: () => void;
  onOpenFaq?: () => void;
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
  if (!tokens.length) return { brand: '', model: '', variant: '', colorway: '', height: '' };

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
        'purple', 'maroon', 'burgundy', 'magenta', 'pink', 'hot pink', 'gold', 'silver', 'reflective',
        'glow', 'iridescent', 'ice', 'multicolor', 'carolina blue', 'paua', 'light green', 'cyan blue',
        'citrus', 'gum', 'green cyan', 'platinum'
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

export default function SneakerForm({ sneaker, onSave, onCancel, onOpenFaq }: SneakerFormProps) {
  const [nameInput, setNameInput] = useState(sneaker ? buildName(sneaker.brand, sneaker.model, sneaker.variant || '', sneaker.colorway) : '');
  const [brand, setBrand] = useState(sneaker?.brand || '');
  const [model, setModel] = useState(sneaker?.model || '');
  const [height, setHeight] = useState(sneaker?.height || '');
  const [variant, setVariant] = useState(sneaker?.variant || '');
  const [colorway, setColorway] = useState(sneaker?.colorway || '');
  const [style, setStyle] = useState<string[]>(sneaker?.style || []);
  const [color, setColor] = useState<string[]>(sneaker?.color || []);
  const [worn, setWorn] = useState(sneaker?.worn || 0);
  const [lastWornAt, setLastWornAt] = useState<string>(sneaker?.last_worn || '');
  const [condition, setCondition] = useState<string>(sneaker?.condition || '');
  const [datesWornList, setDatesWornList] = useState<string[]>(() => parseDatesWorn(sneaker?.dates_worn));
  const [newDateInput, setNewDateInput] = useState<string>('');
  const [bulkDatesInput, setBulkDatesInput] = useState<string>('');
  const [showBulkDates, setShowBulkDates] = useState<boolean>(false);
  
  // Multi-image list state
  const [images, setImages] = useState<string[]>(() => {
    if (sneaker) {
      const list = [sneaker.image_url, ...(sneaker.gallery_images || [])].filter(Boolean);
      const unique: string[] = [];
      list.forEach(item => { if (!unique.includes(item)) unique.push(item); });
      return unique;
    }
    return [];
  });

  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [isDraggingFiles, setIsDraggingFiles] = useState(false);

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
      setLastWornAt(sneaker.last_worn || '');
      setCondition(sneaker.condition || '');
      setDatesWornList(parseDatesWorn(sneaker.dates_worn));

      const list = [sneaker.image_url, ...(sneaker.gallery_images || [])].filter(Boolean);
      const unique: string[] = [];
      list.forEach(item => { if (!unique.includes(item)) unique.push(item); });
      setImages(unique);
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

  const handleMultipleImagesUpload = async (files: FileList | File[]) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      const fileArray = Array.from(files);
      const readPromises = fileArray.map(
        file =>
          new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = e => resolve((e.target?.result as string) || '');
            reader.onerror = reject;
            reader.readAsDataURL(file);
          })
      );
      const newUrls = await Promise.all(readPromises);
      const validUrls = newUrls.filter(Boolean);
      setImages(prev => {
        const combined = [...prev, ...validUrls];
        const unique: string[] = [];
        combined.forEach(img => { if (!unique.includes(img)) unique.push(img); });
        return unique.slice(0, 10);
      });
    } catch (err) {
      console.error('Upload error:', err);
    } finally {
      setUploading(false);
    }
  };

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingFiles(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleMultipleImagesUpload(e.dataTransfer.files);
    }
  };

  const handleFileDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.types && Array.from(e.dataTransfer.types).includes('Files')) {
      setIsDraggingFiles(true);
    }
  };

  const handleFileDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingFiles(false);
  };

  // Drag and drop reordering of uploaded images to pick main image
  const handleItemDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', index.toString());
  };

  const handleItemDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (draggedIndex !== null && draggedIndex !== index) {
      setDragOverIndex(index);
    }
  };

  const handleItemDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    e.stopPropagation();
    if (draggedIndex !== null && draggedIndex !== dropIndex) {
      setImages(prev => {
        const result = [...prev];
        const [removed] = result.splice(draggedIndex, 1);
        result.splice(dropIndex, 0, removed);
        return result;
      });
    }
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const setAsMainImage = (index: number) => {
    if (index === 0) return;
    setImages(prev => {
      const result = [...prev];
      const [selected] = result.splice(index, 1);
      result.unshift(selected);
      return result;
    });
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleLookup = async () => {
    const q = nameInput.trim();
    if (!q) return;
    setLookingUp(true);
    setLookupMessage(null);
    setSuggestions([]);
    try {
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

  const handleAddWearDate = (dateStr: string) => {
    if (!dateStr) return;
    const updated = parseDatesWorn([dateStr, ...datesWornList]);
    setDatesWornList(updated);
    setWorn(prev => Math.max(prev, updated.length));
    if (updated.length > 0) {
      setLastWornAt(updated[0]);
    }
    setNewDateInput('');
  };

  const handleAddBulkDates = () => {
    if (!bulkDatesInput.trim()) return;
    const updated = parseDatesWorn([bulkDatesInput, ...datesWornList]);
    setDatesWornList(updated);
    setWorn(prev => Math.max(prev, updated.length));
    if (updated.length > 0) {
      setLastWornAt(updated[0]);
    }
    setBulkDatesInput('');
    setShowBulkDates(false);
  };

  const handleRemoveWearDate = (index: number) => {
    const updated = datesWornList.filter((_, i) => i !== index);
    setDatesWornList(updated);
    if (updated.length > 0) {
      setLastWornAt(updated[0]);
    } else {
      setLastWornAt('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const finalName = autoName || nameInput;
    const mainImg = images[0] || '';
    const galleryList = images.slice(1);

    const finalDates = parseDatesWorn(datesWornList);
    const effectiveWorn = Math.max(worn, finalDates.length);
    let effectiveLastWorn = lastWornAt ? new Date(lastWornAt).toISOString() : null;
    if (!effectiveLastWorn && finalDates.length > 0) {
      effectiveLastWorn = finalDates[0];
    }

    await onSave({
      name: finalName,
      brand,
      model,
      variant,
      colorway,
      height: height || 'Low',
      style,
      color,
      worn: effectiveWorn,
      last_worn: effectiveLastWorn,
      image_url: mainImg,
      condition: condition || null,
      gallery_images: galleryList,
      dates_worn: finalDates,
    });
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-zinc-900 border border-zinc-800 rounded-t-2xl sm:rounded-2xl w-full sm:max-w-2xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-zinc-800 sticky top-0 bg-zinc-900 z-10">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold text-zinc-100">
              {sneaker ? 'Edit Sneaker' : 'Add Sneaker'}
            </h2>
            {onOpenFaq && (
              <button
                type="button"
                onClick={onOpenFaq}
                className="flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 bg-blue-500/10 hover:bg-blue-500/20 px-2.5 py-1 rounded-lg border border-blue-500/20 transition-colors cursor-pointer"
                title="View Photo Guide & FAQ"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">FAQ &amp; Photo Guide</span>
              </button>
            )}
          </div>
          <button onClick={onCancel} className="p-1 text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer">
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
              {BRAND_CATEGORIES.map(group => (
                <optgroup key={group.category} label={group.category} className="bg-zinc-900 text-zinc-400 font-semibold tracking-wider">
                  {group.brands.map(b => (
                    <option key={b} value={b} className="bg-zinc-900 text-zinc-200 font-normal">
                      {b}
                    </option>
                  ))}
                </optgroup>
              ))}
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

          {/* Condition, Worn, and Last Worn Date */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1.5 uppercase tracking-wider">Condition</label>
              <select
                value={condition}
                onChange={e => setCondition(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2.5 text-sm text-zinc-200 focus:outline-none focus:border-blue-500 transition-colors"
              >
                <option value="">Select Condition...</option>
                {CONDITIONS.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1.5 uppercase tracking-wider">Times Worn</label>
              <input
                type="number"
                min="0"
                value={worn}
                onChange={e => setWorn(parseInt(e.target.value) || 0)}
                className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2.5 text-sm text-zinc-200 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1.5 uppercase tracking-wider">Last Worn Date</label>
              <input
                type="date"
                value={lastWornAt ? lastWornAt.split('T')[0] : ''}
                onChange={e => {
                  const val = e.target.value;
                  setLastWornAt(val ? new Date(val).toISOString() : '');
                }}
                className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2.5 text-sm text-zinc-200 focus:outline-none focus:border-blue-500 transition-colors [color-scheme:dark]"
              />
            </div>
          </div>

          {/* Wear History & Logged Dates */}
          <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-3.5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-400" />
                <span className="text-xs font-bold text-zinc-200 uppercase tracking-wider">
                  Logged Wear Dates ({datesWornList.length})
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowBulkDates(!showBulkDates)}
                className="text-xs text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1 cursor-pointer"
              >
                <ListFilter className="w-3.5 h-3.5" />
                {showBulkDates ? 'Hide Paste Area' : 'Paste List of Dates'}
              </button>
            </div>

            {/* Quick Single Date Add */}
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={newDateInput}
                onChange={e => setNewDateInput(e.target.value)}
                className="bg-zinc-900 border border-zinc-700 rounded-lg px-2.5 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-blue-500 [color-scheme:dark]"
              />
              <button
                type="button"
                onClick={() => handleAddWearDate(newDateInput)}
                disabled={!newDateInput}
                className="px-3 py-1.5 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-500 disabled:opacity-40 transition-colors flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Date
              </button>
            </div>

            {/* Bulk Dates Paste Area */}
            {showBulkDates && (
              <div className="space-y-2 p-2.5 bg-zinc-900/80 border border-zinc-800 rounded-lg">
                <label className="block text-[11px] font-medium text-zinc-400">
                  Paste array of dates or list (e.g. <code className="text-zinc-300">2024-05-01, 2024-05-10, 2024-06-15</code> or <code className="text-zinc-300">["2024-05-01", "2024-05-10"]</code>):
                </label>
                <textarea
                  rows={3}
                  value={bulkDatesInput}
                  onChange={e => setBulkDatesInput(e.target.value)}
                  placeholder="2024-01-15, 2024-02-01, 2024-03-10..."
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-lg p-2 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-blue-500 font-mono"
                />
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowBulkDates(false)}
                    className="px-2.5 py-1 bg-zinc-800 text-zinc-400 hover:text-zinc-200 text-xs rounded-md cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleAddBulkDates}
                    disabled={!bulkDatesInput.trim()}
                    className="px-3 py-1 bg-emerald-600 text-white text-xs font-medium rounded-md hover:bg-emerald-500 disabled:opacity-40 cursor-pointer"
                  >
                    Import Dates
                  </button>
                </div>
              </div>
            )}

            {/* Dates Pill List */}
            {datesWornList.length > 0 ? (
              <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto pr-1">
                {datesWornList.map((isoStr, idx) => (
                  <span
                    key={`${isoStr}-${idx}`}
                    className="px-2 py-0.5 bg-zinc-900 border border-zinc-700 text-zinc-300 text-xs rounded-md flex items-center gap-1.5 group"
                  >
                    <span>{isoStr.split('T')[0]}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveWearDate(idx)}
                      className="text-zinc-500 hover:text-red-400 transition-colors cursor-pointer"
                      title="Remove date"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-xs text-zinc-500 italic">No wear dates recorded yet. Add dates above to automatically compute wear frequencies and wear counts.</p>
            )}
          </div>

          {/* Image Upload & Drag/Drop Gallery */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <div>
                <label className="block text-xs font-medium text-zinc-400 uppercase tracking-wider">
                  Sneaker Photos ({images.length})
                </label>
                <p className="text-[11px] text-zinc-500 mt-0.5">
                  Upload multiple photos. <span className="text-blue-400 font-semibold">Drag &amp; drop</span> thumbnails to select the <span className="text-amber-400 font-semibold">Main Cover Image</span> (first photo).
                </p>
              </div>
              {onOpenFaq && (
                <button
                  type="button"
                  onClick={onOpenFaq}
                  className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 font-medium cursor-pointer shrink-0"
                  title="How to get the best sneaker photos"
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Photo Guide</span>
                </button>
              )}
            </div>

            {/* Drag and Drop File Upload Area */}
            <div
              onDrop={handleFileDrop}
              onDragOver={handleFileDragOver}
              onDragLeave={handleFileDragLeave}
              className={`p-4 rounded-xl border-2 border-dashed transition-all duration-200 flex flex-col items-center justify-center gap-3 text-center ${
                isDraggingFiles
                  ? 'border-blue-500 bg-blue-500/10'
                  : 'border-zinc-700 hover:border-zinc-600 bg-zinc-950'
              }`}
            >
              {/* Thumbnail Grid with Drag and Drop Reordering */}
              {images.length > 0 ? (
                <div className="w-full space-y-2">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {images.map((imgUrl, index) => {
                      const isMain = index === 0;
                      const isDraggingThis = draggedIndex === index;
                      const isOverThis = dragOverIndex === index;

                      return (
                        <div
                          key={`${imgUrl.slice(0, 30)}-${index}`}
                          draggable
                          onDragStart={(e) => handleItemDragStart(e, index)}
                          onDragOver={(e) => handleItemDragOver(e, index)}
                          onDrop={(e) => handleItemDrop(e, index)}
                          onDragEnd={() => { setDraggedIndex(null); setDragOverIndex(null); }}
                          className={`relative group rounded-xl overflow-hidden border transition-all duration-200 aspect-square bg-zinc-900 cursor-grab active:cursor-grabbing ${
                            isMain
                              ? 'border-amber-500/80 ring-2 ring-amber-500/30'
                              : isOverThis
                              ? 'border-blue-400 ring-2 ring-blue-400/50 scale-105 z-10'
                              : 'border-zinc-800 hover:border-zinc-600'
                          } ${isDraggingThis ? 'opacity-40 scale-95' : 'opacity-100'}`}
                        >
                          <img
                            src={imgUrl}
                            alt={`Sneaker photo ${index + 1}`}
                            className="w-full h-full object-cover pointer-events-none"
                          />

                          {/* Top Badge: Main Photo vs Gallery */}
                          <div className="absolute top-1.5 left-1.5 z-10">
                            {isMain ? (
                              <span className="px-1.5 py-0.5 bg-emerald-600 text-white font-bold text-[9px] rounded flex items-center gap-0.5 shadow">
                                <Star className="w-2.5 h-2.5 fill-white" />
                                MAIN
                              </span>
                            ) : (
                              <span className="px-1.5 py-0.5 bg-zinc-900/80 text-zinc-300 font-semibold text-[9px] rounded backdrop-blur-sm border border-zinc-700">
                                #{index + 1}
                              </span>
                            )}
                          </div>

                          {/* Drag Handle Indicator */}
                          <div className="absolute top-1.5 right-7 opacity-0 group-hover:opacity-100 transition-opacity bg-black/60 backdrop-blur-sm rounded p-0.5 text-zinc-300 pointer-events-none">
                            <GripVertical className="w-3.5 h-3.5" />
                          </div>

                          {/* Delete Button */}
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute top-1.5 right-1.5 z-10 p-1 bg-black/70 hover:bg-red-600 text-zinc-300 hover:text-white rounded transition-colors"
                            title="Remove photo"
                          >
                            <X className="w-3 h-3" />
                          </button>

                          {/* Quick 'Set as Main' overlay button if not main */}
                          {!isMain && (
                            <button
                              type="button"
                              onClick={() => setAsMainImage(index)}
                              className="absolute bottom-1.5 left-1.5 right-1.5 z-10 py-1 px-2 bg-black/80 hover:bg-amber-500 hover:text-black text-amber-400 text-[10px] font-bold rounded opacity-0 group-hover:opacity-100 transition-all text-center flex items-center justify-center gap-1 backdrop-blur-sm"
                            >
                              <Star className="w-2.5 h-2.5" />
                              Make Main
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="py-4 flex flex-col items-center justify-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400">
                    <Upload className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-zinc-300">
                      Drag &amp; drop photos here or use buttons below
                    </p>
                    <p className="text-[10px] text-zinc-500 mt-0.5">
                      Supports JPG, PNG, WEBP (multiple files allowed)
                    </p>
                  </div>
                </div>
              )}

              {/* Upload Buttons */}
              <div className="flex flex-wrap gap-2 justify-center w-full pt-1">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="px-3.5 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium rounded-lg border border-zinc-700 transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-40"
                >
                  {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5 text-blue-400" />}
                  <span>Add Photos</span>
                </button>
                <button
                  type="button"
                  onClick={() => cameraInputRef.current?.click()}
                  disabled={uploading}
                  className="px-3.5 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium rounded-lg border border-zinc-700 transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-40"
                >
                  <Camera className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Take Photo</span>
                </button>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={e => e.target.files && handleMultipleImagesUpload(e.target.files)}
                className="hidden"
              />
              <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={e => e.target.files && handleMultipleImagesUpload(e.target.files)}
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
