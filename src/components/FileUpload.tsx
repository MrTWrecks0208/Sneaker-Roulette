import { useState, useRef } from 'react';
import { SneakerInsert, HEIGHTS, buildName } from '../lib/supabase';
import { Upload, FileText, X, AlertCircle, CheckCircle2 } from 'lucide-react';
import * as XLSX from 'xlsx';
import Papa from 'papaparse';
import { parseDatesWorn, reconcileSneakerWearData } from '../lib/utils';

interface FileUploadProps {
  onImport: (sneakers: SneakerInsert[]) => Promise<unknown>;
  onClose: () => void;
}

interface ParseError {
  row: number;
  message: string;
}

function normalizeField(rawKey: string): string {
  const key = rawKey.toLowerCase().trim().replace(/[_\s]+/g, '');
  const map: Record<string, string> = {
    name: 'name', brand: 'brand', model: 'model', variant: 'variant',
    colorway: 'colorway', height: 'height', style: 'style', styles: 'style',
    color: 'color', colors: 'color', worn: 'worn',
    imageurl: 'image_url', image: 'image_url', img: 'image_url',
    galleryimages: 'gallery_images', gallery: 'gallery_images', galleryimage: 'gallery_images',
    sneakerbrand: 'brand', sneakermodel: 'model', shoename: 'name',
    shoebrand: 'brand', shoemodel: 'model', sneaker: 'name',
    datesworn: 'dates_worn', dates: 'dates_worn', wearhistory: 'dates_worn',
    history: 'dates_worn', wears: 'dates_worn', weardates: 'dates_worn',
    lastworn: 'last_worn', lastwornat: 'last_worn', last_worn: 'last_worn',
  };
  return map[key] || key;
}

function parseArrayField(val: unknown): string[] {
  if (Array.isArray(val)) return val.map(String);
  if (typeof val === 'string') {
    try {
      const parsed = JSON.parse(val);
      if (Array.isArray(parsed)) return parsed.map(String);
    } catch {
      // Ignore invalid JSON parsing
    }
    return val.split(/[,;]/).map(s => s.trim()).filter(Boolean);
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
    normalized[normalizeField(key)] = val;
  }

  const brand = getString(normalized.brand);
  const model = getString(normalized.model);
  const colorway = getString(normalized.colorway);

  if (!brand || !model) return null;

  const rawDates = normalized.dates_worn || normalized.dates || normalized.wearhistory || normalized.history || normalized.weardates;
  const dates_worn = parseDatesWorn(rawDates);
  const rawWorn = Number(normalized.worn) || 0;
  const effectiveWorn = Math.max(rawWorn, dates_worn.length);
  let last_worn = getString(normalized.last_worn) || null;
  if (!last_worn && dates_worn.length > 0) {
    last_worn = dates_worn[0];
  }

  return reconcileSneakerWearData({
    name: buildName(brand, model, getString(normalized.variant), colorway),
    brand,
    model,
    variant: getString(normalized.variant),
    colorway,
    height: HEIGHTS.includes(getString(normalized.height) as typeof HEIGHTS[number])
      ? getString(normalized.height) : 'Low',
    style: parseArrayField(normalized.style),
    color: parseArrayField(normalized.color),
    worn: effectiveWorn,
    dates_worn,
    last_worn,
    image_url: getString(normalized.image_url),
    gallery_images: parseArrayField(normalized.gallery_images),
  });
}

export default function FileUpload({ onImport, onClose }: FileUploadProps) {
  const [dragging, setDragging] = useState(false);
  const [preview, setPreview] = useState<SneakerInsert[]>([]);
  const [errors, setErrors] = useState<ParseError[]>([]);
  const [importing, setImporting] = useState(false);
  const [imported, setImported] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = (file: File) => {
    const ext = file.name.split('.').pop()?.toLowerCase();
    const reader = new FileReader();

    if (ext === 'json') {
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target?.result as string);
          const items = Array.isArray(data) ? data : [data];
          processItems(items);
        } catch {
          setErrors([{ row: 0, message: 'Invalid JSON format' }]);
        }
      };
      reader.readAsText(file);
    } else if (ext === 'csv') {
      reader.onload = (e) => {
        const result = Papa.parse(e.target?.result as string, { header: true, skipEmptyLines: true });
        processItems(result.data as Record<string, unknown>[]);
      };
      reader.readAsText(file);
    } else if (['xlsx', 'xls'].includes(ext || '')) {
      reader.onload = (e) => {
        const wb = XLSX.read(e.target?.result, { type: 'array' });
        const sheet = wb.Sheets[wb.SheetNames[0]];
        const data = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet);
        processItems(data);
      };
      reader.readAsArrayBuffer(file);
    } else {
      setErrors([{ row: 0, message: 'Unsupported file type. Use .xlsx, .csv, or .json' }]);
    }
  };

  const processItems = (items: Record<string, unknown>[]) => {
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
        if (!getString(normalized.brand)) missing.push('brand');
        if (!getString(normalized.model)) missing.push('model');
        errs.push({ row: i + 1, message: missing.join(', ') });
      }
    });
    setPreview(parsed);
    setErrors(errs);
  };

  const handleImport = async () => {
    setImporting(true);
    await onImport(preview);
    setImporting(false);
    setImported(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-zinc-900 border border-zinc-800 rounded-t-2xl sm:rounded-2xl w-full sm:max-w-2xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-zinc-800 sticky top-0 bg-zinc-900 z-10">
          <h2 className="text-lg font-semibold text-zinc-100">Import Sneakers</h2>
          <button onClick={onClose} className="p-1 text-zinc-400 hover:text-zinc-200 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 sm:p-6 space-y-5">
          {!imported ? (
            <>
              {/* Drop Zone */}
              <div
                onDragOver={e => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={e => { e.preventDefault(); setDragging(false); if (e.dataTransfer.files[0]) { processFile(e.dataTransfer.files[0]); } }}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
                  dragging ? 'border-blue-500 bg-blue-500/5' : 'border-zinc-700 hover:border-zinc-500'
                }`}
              >
                <Upload className="w-10 h-10 text-zinc-500 mx-auto mb-3" />
                <p className="text-sm text-zinc-300 mb-1">Drop your file here or click to browse</p>
                <p className="text-xs text-zinc-500">Supports .xlsx, .csv, .json</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx,.xls,.csv,.json"
                  onChange={e => e.target.files?.[0] && processFile(e.target.files[0])}
                  className="hidden"
                />
              </div>

              {/* Errors */}
              {errors.length > 0 && (
                <div className="bg-red-950/30 border border-red-500/20 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle className="w-4 h-4 text-red-400" />
                    <span className="text-sm font-medium text-red-400">Missing required fields</span>
                  </div>
                  {errors.map((err, i) => (
                    <p key={i} className="text-xs text-red-400/80">Row {err.row}: {err.message}</p>
                  ))}
                </div>
              )}

              {/* Preview */}
              {preview.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-zinc-300">{preview.length} sneakers found</span>
                  </div>
                  <div className="max-h-48 overflow-y-auto space-y-2">
                    {preview.map((s, i) => (
                      <div key={i} className="flex items-center gap-3 p-3 bg-zinc-950 rounded-lg border border-zinc-800">
                        <FileText className="w-4 h-4 text-zinc-500 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-zinc-200 truncate">{s.name}</p>
                          <p className="text-xs text-zinc-500">{s.brand} / {s.model} / {s.colorway}</p>
                        </div>
                        <span className="text-xs text-zinc-500 shrink-0">worn: {s.worn} times</span>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={handleImport}
                    disabled={importing}
                    className="w-full py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-500 disabled:opacity-50 transition-colors"
                  >
                    {importing ? 'Importing...' : `Import ${preview.length} Sneakers`}
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-8">
              <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
              <p className="text-sm text-zinc-300">Sneakers imported successfully!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
