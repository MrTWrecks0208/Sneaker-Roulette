import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

class MemoryStorage implements Storage {
  private store: Record<string, string> = {};

  get length(): number {
    return Object.keys(this.store).length;
  }

  clear(): void {
    this.store = {};
  }

  getItem(key: string): string | null {
    return this.store[key] !== undefined ? this.store[key] : null;
  }

  key(index: number): string | null {
    const keys = Object.keys(this.store);
    return keys[index] || null;
  }

  removeItem(key: string): void {
    delete this.store[key];
  }

  setItem(key: string, value: string): void {
    this.store[key] = String(value);
  }
}

const getSafeStorage = (): Storage => {
  try {
    const testKey = '__storage_test__';
    window.localStorage.setItem(testKey, testKey);
    window.localStorage.removeItem(testKey);
    return window.localStorage;
  } catch (e) {
    console.warn('localStorage is blocked or unavailable. Falling back to in-memory storage.', e);
    return new MemoryStorage();
  }
};

export const safeLocalStorage = getSafeStorage();

export function parseDatesWorn(datesWorn: unknown): string[] {
  if (!datesWorn) return [];

  let rawList: unknown[] = [];

  if (Array.isArray(datesWorn)) {
    rawList = datesWorn;
  } else if (typeof datesWorn === 'string') {
    const trimmed = datesWorn.trim();
    if (!trimmed) return [];
    if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
      try {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed)) {
          rawList = parsed;
        } else {
          rawList = [trimmed];
        }
      } catch {
        rawList = trimmed.split(/[,;\n]+/);
      }
    } else {
      rawList = trimmed.split(/[,;\n]+/);
    }
  }

  const validIsoDates: string[] = [];

  for (const item of rawList) {
    if (item === null || item === undefined) continue;
    const str = String(item).trim().replace(/^['"]|['"]$/g, '');
    if (!str) continue;

    const d = new Date(str);
    if (!isNaN(d.getTime())) {
      validIsoDates.push(d.toISOString());
    }
  }

  // Sort descending (most recent wear first)
  return validIsoDates.sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
}

export function reconcileSneakerWearData<T extends { worn?: number; dates_worn?: unknown; last_worn?: string | null }>(sneaker: T): T & { worn: number; dates_worn: string[]; last_worn: string | null } {
  const dates = parseDatesWorn(sneaker.dates_worn);
  const rawWorn = Number(sneaker.worn) || 0;
  const effectiveWorn = Math.max(rawWorn, dates.length);

  let effectiveLastWorn = sneaker.last_worn ? new Date(sneaker.last_worn).toISOString() : null;
  if (isNaN(new Date(effectiveLastWorn || '').getTime())) {
    effectiveLastWorn = null;
  }

  if (dates.length > 0) {
    const newestDateIso = dates[0]; // sorted desc
    if (!effectiveLastWorn || new Date(newestDateIso).getTime() > new Date(effectiveLastWorn).getTime()) {
      effectiveLastWorn = newestDateIso;
    }
  }

  return {
    ...sneaker,
    worn: effectiveWorn,
    dates_worn: dates,
    last_worn: effectiveLastWorn,
  };
}

export function formatDateYMD(dateString?: string | null): string {
  if (!dateString) return 'Never';
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return 'Never';
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}/${month}/${day}`;
}

export function formatLastWorn(dateString?: string | null): string {
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

    return formatDateYMD(dateString);
  } catch {
    return 'Never';
  }
}

