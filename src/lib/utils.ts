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
  if (Array.isArray(datesWorn)) {
    return datesWorn.filter((d): d is string => typeof d === 'string' && d.trim().length > 0);
  }
  if (typeof datesWorn === 'string') {
    try {
      const parsed = JSON.parse(datesWorn);
      if (Array.isArray(parsed)) {
        return parsed.filter((d): d is string => typeof d === 'string' && d.trim().length > 0);
      }
    } catch {
      return datesWorn.split(',').map(s => s.trim()).filter(Boolean);
    }
  }
  return [];
}
