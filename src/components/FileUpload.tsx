import { useState, useRef } from 'react';
import { SneakerInsert, HEIGHTS, BRANDS, CONDITION_OPTIONS, buildName } from '../lib/supabase';
import { Upload, FileText, X, AlertCircle, CheckCircle2, FileCode, FileSpreadsheet, Download, Sparkles } from 'lucide-react';
import * as XLSX from 'xlsx';
import Papa from 'papaparse';

interface FileUploadProps {
  onImport: (sneakers: SneakerInsert[]) => Promise<unknown>;
  onClose: () => void;
}

interface ParseError {
  row: number;
  message: string;
}

function normalizeField(rawKey: string): string {
  const key = rawKey.toLowerCase().trim().replace(/[_\s-]+/g, '');
  const map: Record<string, string> = {
    name: 'name', title: 'name', shoe: 'name', sneaker: 'name', shoename: 'name', sneakername: 'name', full_name: 'name',
    brand: 'brand', shoebrand: 'brand', sneakerbrand: 'brand', make: 'brand', manufacturer: 'brand',
    model: 'model', shoemodel: 'model', sneakermodel: 'model', silhouette: 'model', line: 'model',
    variant: 'variant', edition: 'variant', version: 'variant', submodel: 'variant',
    colorway: 'colorway', color_way: 'colorway', scheme: 'colorway',
    height: 'height', top: 'height', cut: 'height',
    style: 'style', styles: 'style', category: 'style', categories: 'style', tags: 'style', type: 'style',
    color: 'color', colors: 'color', swatches: 'color',
    worn: 'worn', timesworn: 'worn', wearcount: 'worn', count: 'worn', wears: 'worn', uses: 'worn',
    imageurl: 'image_url', image: 'image_url', img: 'image_url', photo: 'image_url', picture: 'image_url', url: 'image_url', imagelink: 'image_url',
    condition: 'condition', status: 'condition', state: 'condition',
    datesworn: 'dates_worn', weardates: 'dates_worn', history: 'dates_worn',
    lastworn: 'last_worn', lastworndate: 'last_worn', lastwear: 'last_worn',
    images: 'images', gallery: 'images', photos: 'images',
  };
  return map[key] || key;
}

function parseArrayField(val: unknown): string[] {
  if (Array.isArray(val)) return val.map(String).filter(Boolean);
  if (typeof val === 'string') {
    const trimmed = val.trim();
    if (!trimmed) return [];
    if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
      try {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed)) return parsed.map(String).filter(Boolean);
      } catch {
        // Ignore JSON parse error
      }
    }
    return trimmed.split(/[,;|]/).map(s => s.trim()).filter(Boolean);
  }
  return [];
}

function getString(val: unknown): string {
  if (val === null || val === undefined) return '';
  return String(val).trim();
}

function parseRow(row: Record<string, unknown>): SneakerInsert | null {
  const normalized: Record<string, unknown> = {};
  for (const [key, val] of Object.entries(row)) {
    if (val !== undefined && val !== null && val !== '') {
      normalized[normalizeField(key)] = val;
    }
  }

  let brand = getString(normalized.brand);
  let model = getString(normalized.model);
  const variant = getString(normalized.variant);
  const colorway = getString(normalized.colorway);
  const explicitName = getString(normalized.name);

  // Smart fallback if brand or model is omitted but full name is supplied
  if (!brand || !model) {
    if (explicitName) {
      if (!brand) {
        const matchedBrand = BRANDS.find(b =>
          explicitName.toLowerCase().startsWith(b.toLowerCase() + ' ') ||
          explicitName.toLowerCase() === b.toLowerCase()
        );
        if (matchedBrand) {
          brand = matchedBrand;
          if (!model) {
            model = explicitName.slice(matchedBrand.length).trim() || 'Sneaker';
          }
        } else {
          brand = 'Other';
          if (!model) model = explicitName;
        }
      } else if (!model) {
        const brandLower = brand.toLowerCase();
        if (explicitName.toLowerCase().startsWith(brandLower)) {
          model = explicitName.slice(brand.length).trim() || 'Sneaker';
        } else {
          model = explicitName;
        }
      }
    }
  }

  if (!brand || !model) return null;

  const name = explicitName || buildName(brand, model, variant, colorway);
  const heightRaw = getString(normalized.height);
  const height = HEIGHTS.includes(heightRaw as typeof HEIGHTS[number])
    ? heightRaw
    : 'Low';

  const conditionRaw = getString(normalized.condition);
  const condition = CONDITION_OPTIONS.find(c => c.toLowerCase() === conditionRaw.toLowerCase()) || (conditionRaw ? conditionRaw : undefined);

  const datesWorn = parseArrayField(normalized.dates_worn);
  const images = parseArrayField(normalized.images);

  return {
    name,
    brand,
    model,
    variant,
    colorway,
    height,
    style: parseArrayField(normalized.style),
    color: parseArrayField(normalized.color),
    worn: Number(normalized.worn) || (datesWorn.length > 0 ? datesWorn.length : 0),
    image_url: getString(normalized.image_url),
    ...(images.length > 0 ? { images } : {}),
    ...(datesWorn.length > 0 ? { dates_worn: datesWorn } : {}),
    ...(condition ? { condition } : {}),
    ...(getString(normalized.last_worn) ? { last_worn: getString(normalized.last_worn) } : {}),
  };
}

export default function FileUpload({ onImport, onClose }: FileUploadProps) {
  const [dragging, setDragging] = useState(false);
  const [preview, setPreview] = useState<SneakerInsert[]>([]);
  const [errors, setErrors] = useState<ParseError[]>([]);
  const [importing, setImporting] = useState(false);
  const [imported, setImported] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileType, setFileType] = useState<'csv' | 'json' | 'xlsx' | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = (file: File) => {
    const ext = file.name.split('.').pop()?.toLowerCase();
    setFileName(file.name);
    setErrors([]);
    setPreview([]);

    const reader = new FileReader();

    if (ext === 'json') {
      setFileType('json');
      reader.onload = (e) => {
        try {
          const text = e.target?.result as string;
          const data = JSON.parse(text);
          let items: Record<string, unknown>[] = [];
          if (Array.isArray(data)) {
            items = data;
          } else if (typeof data === 'object' && data !== null) {
            const arrayKey = Object.keys(data).find(k => Array.isArray((data as Record<string, unknown>)[k]));
            if (arrayKey) {
              items = (data as Record<string, unknown>)[arrayKey] as Record<string, unknown>[];
            } else {
              items = [data as Record<string, unknown>];
            }
          }
          processItems(items);
        } catch {
          setErrors([{ row: 0, message: 'Invalid JSON format. Please ensure valid syntax.' }]);
        }
      };
      reader.readAsText(file);
    } else if (ext === 'csv') {
      setFileType('csv');
      reader.onload = (e) => {
        try {
          const result = Papa.parse(e.target?.result as string, {
            header: true,
            skipEmptyLines: 'greedy',
            transformHeader: (h) => h.trim(),
          });
          processItems(result.data as Record<string, unknown>[]);
        } catch {
          setErrors([{ row: 0, message: 'Failed to parse CSV file format.' }]);
        }
      };
      reader.readAsText(file);
    } else if (['xlsx', 'xls'].includes(ext || '')) {
      setFileType('xlsx');
      reader.onload = (e) => {
        try {
          const wb = XLSX.read(e.target?.result, { type: 'array' });
          const sheetName = wb.SheetNames[0];
          if (sheetName && wb.Sheets[sheetName]) {
            const data = XLSX.utils.sheet_to_json<Record<string, unknown>>(wb.Sheets[sheetName], { defval: '' });
            processItems(data);
          } else {
            setErrors([{ row: 0, message: 'The Excel workbook is empty or has no sheets.' }]);
          }
        } catch {
          setErrors([{ row: 0, message: 'Failed to read Excel (.xlsx) file.' }]);
        }
      };
      reader.readAsArrayBuffer(file);
    } else {
      setErrors([{ row: 0, message: 'Unsupported file type. Please upload a .csv, .json, or .xlsx file.' }]);
    }
  };

  const processItems = (items: Record<string, unknown>[]) => {
    if (!items || items.length === 0) {
      setErrors([{ row: 0, message: 'The file contains no data rows.' }]);
      return;
    }

    const parsed: SneakerInsert[] = [];
    const errs: ParseError[] = [];

    items.forEach((item, i) => {
      const result = parseRow(item);
      if (result) {
        parsed.push(result);
      } else {
        const normalized: Record<string, unknown> = {};
        for (const [key, val] of Object.entries(item)) {
          normalized[normalizeField(key)] = val;
        }
        const missing: string[] = [];
        if (!getString(normalized.brand) && !getString(normalized.name)) missing.push('Brand');
        if (!getString(normalized.model) && !getString(normalized.name)) missing.push('Model');
        errs.push({ row: i + 1, message: `Missing ${missing.join(', ')}` });
      }
    });

    setPreview(parsed);
    setErrors(errs);
  };

  const handleImport = async () => {
    if (preview.length === 0) return;
    setImporting(true);
    await onImport(preview);
    setImporting(false);
    setImported(true);
  };

  const downloadSampleTemplate = (format: 'csv' | 'json' | 'xlsx') => {
    const sampleData = [
      {
        Brand: 'Nike',
        Model: 'Air Jordan 1',
        Variant: 'Retro High OG',
        Colorway: 'Bred',
        Height: 'High',
        Style: 'Basketball, Lifestyle',
        Color: 'Black, Red, White',
        'Times Worn': 5,
        Condition: 'Very Good',
        'Image URL': 'https://images.unsplash.com/photo-1552346154-21d32810aba3'
      },
      {
        Brand: 'Adidas',
        Model: 'Yeezy Boost 350',
        Variant: 'V2',
        Colorway: 'Zebra',
        Height: 'Low',
        Style: 'Lifestyle',
        Color: 'White, Black',
        'Times Worn': 12,
        Condition: 'Excellent',
        'Image URL': 'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2'
      }
    ];

    if (format === 'csv') {
      const csvStr = Papa.unparse(sampleData);
      const blob = new Blob([csvStr], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'sneaker_roulette_sample.csv');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else if (format === 'json') {
      const jsonStr = JSON.stringify(sampleData, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'sneaker_roulette_sample.json');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else if (format === 'xlsx') {
      const worksheet = XLSX.utils.json_to_sheet(sampleData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Sneakers');
      XLSX.writeFile(workbook, 'sneaker_roulette_sample.xlsx');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 bg-black/80 backdrop-blur-md">
      <div className="bg-zinc-900 border border-zinc-800 rounded-t-2xl sm:rounded-2xl w-full sm:max-w-2xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-zinc-800 sticky top-0 bg-zinc-900/95 backdrop-blur-sm z-10">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 border border-blue-500/20 rounded-xl text-blue-400">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-zinc-100">Import Sneaker Collection</h2>
              <p className="text-xs text-zinc-400">Supports CSV, JSON, and Excel (.xlsx) files</p>
            </div>
          </div>
          <button 
            type="button"
            onClick={onClose} 
            className="p-1.5 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 sm:p-6 space-y-5">
          {!imported ? (
            <>
              {/* Format pills */}
              <div className="flex items-center justify-between text-xs text-zinc-400 bg-zinc-950/60 p-3 rounded-xl border border-zinc-800">
                <span className="font-medium text-zinc-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                  Supported formats:
                </span>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-md font-mono font-medium text-[11px] flex items-center gap-1">
                    <FileSpreadsheet className="w-3 h-3" /> .CSV
                  </span>
                  <span className="px-2 py-1 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-md font-mono font-medium text-[11px] flex items-center gap-1">
                    <FileCode className="w-3 h-3" /> .JSON
                  </span>
                  <span className="px-2 py-1 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-md font-mono font-medium text-[11px] flex items-center gap-1">
                    <FileSpreadsheet className="w-3 h-3" /> .XLSX
                  </span>
                </div>
              </div>

              {/* Drop Zone */}
              <div
                onDragOver={e => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={e => { 
                  e.preventDefault(); 
                  setDragging(false); 
                  if (e.dataTransfer.files[0]) { 
                    processFile(e.dataTransfer.files[0]); 
                  } 
                }}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
                  dragging 
                    ? 'border-blue-500 bg-blue-500/10 scale-[0.99]' 
                    : 'border-zinc-700/80 bg-zinc-950/30 hover:border-zinc-500 hover:bg-zinc-950/60'
                }`}
              >
                <div className="w-12 h-12 rounded-2xl bg-zinc-800/80 border border-zinc-700/60 flex items-center justify-center mx-auto mb-3 shadow-inner">
                  <Upload className="w-6 h-6 text-blue-400" />
                </div>
                <p className="text-sm font-semibold text-zinc-200 mb-1">
                  Drop your file here or click to browse
                </p>
                <p className="text-xs text-zinc-500 mb-3">
                  Upload .csv, .json, or .xlsx spreadsheets
                </p>

                {fileName && (
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-500/20 text-blue-300 border border-blue-500/30 rounded-lg text-xs font-medium">
                    {fileType === 'json' ? <FileCode className="w-3.5 h-3.5" /> : <FileSpreadsheet className="w-3.5 h-3.5" />}
                    <span>Loaded: {fileName}</span>
                  </div>
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,.json,.xlsx,.xls,application/json,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
                  onChange={e => e.target.files?.[0] && processFile(e.target.files[0])}
                  className="hidden"
                />
              </div>

              {/* Download Sample Templates Section */}
              <div className="pt-1 border-t border-zinc-800/80 flex items-center justify-between text-xs">
                <span className="text-zinc-400">Need a starting template?</span>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => downloadSampleTemplate('csv')}
                    className="px-2.5 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg transition-colors inline-flex items-center gap-1 text-[11px] cursor-pointer"
                    title="Download sample CSV file"
                  >
                    <Download className="w-3 h-3 text-emerald-400" /> .CSV
                  </button>
                  <button
                    type="button"
                    onClick={() => downloadSampleTemplate('json')}
                    className="px-2.5 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg transition-colors inline-flex items-center gap-1 text-[11px] cursor-pointer"
                    title="Download sample JSON file"
                  >
                    <Download className="w-3 h-3 text-amber-400" /> .JSON
                  </button>
                  <button
                    type="button"
                    onClick={() => downloadSampleTemplate('xlsx')}
                    className="px-2.5 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg transition-colors inline-flex items-center gap-1 text-[11px] cursor-pointer"
                    title="Download sample XLSX file"
                  >
                    <Download className="w-3 h-3 text-blue-400" /> .XLSX
                  </button>
                </div>
              </div>

              {/* Parsing Errors */}
              {errors.length > 0 && (
                <div className="bg-red-950/30 border border-red-500/30 rounded-xl p-4 space-y-1">
                  <div className="flex items-center gap-2 mb-1">
                    <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                    <span className="text-xs font-bold text-red-300 uppercase tracking-wider">
                      {errors.length === 1 && errors[0].row === 0 ? 'File Error' : `${errors.length} Row Validation Warning${errors.length > 1 ? 's' : ''}`}
                    </span>
                  </div>
                  <div className="max-h-28 overflow-y-auto space-y-1 pr-1">
                    {errors.map((err, i) => (
                      <p key={i} className="text-xs text-red-400/90 leading-tight font-mono">
                        {err.row > 0 ? `Row ${err.row}: ${err.message}` : err.message}
                      </p>
                    ))}
                  </div>
                </div>
              )}

              {/* Parsed Preview */}
              {preview.length > 0 && (
                <div className="space-y-3 pt-2 border-t border-zinc-800">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">
                      Ready to Import ({preview.length} Sneaker{preview.length > 1 ? 's' : ''})
                    </span>
                    <span className="text-xs text-emerald-400 font-medium flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Validated
                    </span>
                  </div>

                  <div className="max-h-52 overflow-y-auto space-y-2 pr-1">
                    {preview.map((s, i) => (
                      <div key={i} className="flex items-center gap-3 p-3 bg-zinc-950/80 rounded-xl border border-zinc-800 hover:border-zinc-700 transition-colors">
                        {s.image_url ? (
                          <img src={s.image_url} alt={s.name} className="w-9 h-9 object-contain rounded bg-zinc-900 border border-zinc-800 p-0.5 shrink-0" />
                        ) : (
                          <div className="w-9 h-9 rounded bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-500 shrink-0">
                            <FileText className="w-4 h-4" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-zinc-100 truncate">{s.name}</p>
                          <p className="text-[11px] text-zinc-400 truncate">
                            <span className="text-zinc-300">{s.brand}</span> • {s.model} {s.colorway ? `(${s.colorway})` : ''}
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="text-[10px] font-semibold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                            {s.height}
                          </span>
                          <p className="text-[10px] text-zinc-500 mt-0.5">worn: {s.worn}x</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={handleImport}
                    disabled={importing}
                    className="w-full py-3 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-500 disabled:opacity-50 transition-colors shadow-lg cursor-pointer flex items-center justify-center gap-2"
                  >
                    {importing ? 'Importing Sneakers...' : `Import ${preview.length} Sneaker${preview.length > 1 ? 's' : ''}`}
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-10 space-y-3">
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto text-emerald-400 animate-in zoom-in-95 duration-200">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-base font-bold text-zinc-100">Collection Imported Successfully!</h3>
                <p className="text-xs text-zinc-400 mt-1">Your sneakers have been added to Sneaker Roulette.</p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="mt-4 px-6 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer"
              >
                Close Window
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

