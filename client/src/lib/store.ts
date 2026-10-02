import { useSyncExternalStore } from "react";
import type { AllergenId, FeedingMethod } from "../../../shared/types.ts";
import { toIsoDate } from "../../../shared/logic/age.ts";

export type Eczema = "yok" | "hafif" | "siddetli";
export type Reaction = "sevdi" | "notr" | "sevmedi" | "reaksiyon";

export interface Profile {
  name: string;
  birthDate: string;
  gestationWeeks?: number;
  method: FeedingMethod;
  eczema: Eczema;
  allergies: AllergenId[];
}

export interface TriedEntry {
  firstDate: string;
  lastDate: string;
  reaction: Reaction;
  count: number;
}

export interface AllergenEntry {
  introducedAt?: string;
  lastGivenAt?: string;
  timesGiven: number;
}

export interface AppState {
  profile?: Profile;
  tried: Record<string, TriedEntry>;
  allergens: Partial<Record<AllergenId, AllergenEntry>>;
  favorites: string[];
  checklist: Record<string, string[]>;
  shuffle: Record<string, number>;
  shopping: Record<string, boolean>;
}

const KEY = "minik-tabak:v1";
const EMPTY: AppState = { tried: {}, allergens: {}, favorites: [], checklist: {}, shuffle: {}, shopping: {} };

function load(): AppState {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return EMPTY;
    return { ...EMPTY, ...JSON.parse(raw) };
  } catch {
    return EMPTY;
  }
}

let state: AppState = load();
const listeners = new Set<() => void>();

function persist() {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    // Gizli sekme vb. — veriler yalnızca bu oturumda kalır
  }
}

export function getState(): AppState {
  return state;
}

export function update(fn: (draft: AppState) => AppState) {
  state = fn(state);
  persist();
  listeners.forEach((l) => l());
}

export function useStore<T>(selector: (s: AppState) => T): T {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => selector(state),
  );
}

export const today = () => toIsoDate(new Date(Date.now() - new Date().getTimezoneOffset() * 60_000));

// ---------- Eylemler ----------

export const actions = {
  saveProfile(profile: Profile) {
    update((s) => ({ ...s, profile }));
  },
  markTried(foodId: string, reaction: Reaction) {
    const d = today();
    update((s) => {
      const prev = s.tried[foodId];
      const entry: TriedEntry = prev
        ? { ...prev, lastDate: d, reaction, count: prev.count + 1 }
        : { firstDate: d, lastDate: d, reaction, count: 1 };
      return { ...s, tried: { ...s.tried, [foodId]: entry } };
    });
  },
  setReaction(foodId: string, reaction: Reaction) {
    update((s) => {
      const prev = s.tried[foodId];
      if (!prev) return s;
      return { ...s, tried: { ...s.tried, [foodId]: { ...prev, reaction } } };
    });
  },
  untry(foodId: string) {
    update((s) => {
      const { [foodId]: _removed, ...rest } = s.tried;
      return { ...s, tried: rest };
    });
  },
  introduceAllergen(id: AllergenId) {
    const d = today();
    update((s) => {
      const prev = s.allergens[id];
      return {
        ...s,
        allergens: {
          ...s.allergens,
          [id]: { introducedAt: prev?.introducedAt ?? d, lastGivenAt: d, timesGiven: (prev?.timesGiven ?? 0) + 1 },
        },
      };
    });
  },
  resetAllergen(id: AllergenId) {
    update((s) => {
      const { [id]: _removed, ...rest } = s.allergens;
      return { ...s, allergens: rest };
    });
  },
  toggleAllergy(id: AllergenId) {
    update((s) => {
      if (!s.profile) return s;
      const has = s.profile.allergies.includes(id);
      const allergies = has ? s.profile.allergies.filter((a) => a !== id) : [...s.profile.allergies, id];
      return { ...s, profile: { ...s.profile, allergies } };
    });
  },
  toggleFavorite(recipeId: string) {
    update((s) => ({
      ...s,
      favorites: s.favorites.includes(recipeId) ? s.favorites.filter((f) => f !== recipeId) : [...s.favorites, recipeId],
    }));
  },
  toggleCheck(date: string, itemId: string) {
    update((s) => {
      const list = s.checklist[date] ?? [];
      const next = list.includes(itemId) ? list.filter((i) => i !== itemId) : [...list, itemId];
      // Yalnızca son 30 günü sakla
      const kept = Object.fromEntries(Object.entries({ ...s.checklist, [date]: next }).sort().slice(-30));
      return { ...s, checklist: kept };
    });
  },
  reshuffle(date: string) {
    update((s) => ({ ...s, shuffle: { [date]: (s.shuffle[date] ?? 0) + 1 } }));
  },
  toggleShopping(key: string) {
    update((s) => ({ ...s, shopping: { ...s.shopping, [key]: !s.shopping[key] } }));
  },
  clearShopping() {
    update((s) => ({ ...s, shopping: {} }));
  },
  importData(data: AppState) {
    update(() => ({ ...EMPTY, ...data }));
  },
  resetAll() {
    update(() => EMPTY);
  },
};

/** Plan API'sine gönderilecek parametreler */
export function lastAllergenIntro(allergens: AppState["allergens"]): string | undefined {
  return Object.values(allergens)
    .map((a) => a?.introducedAt)
    .filter((d): d is string => Boolean(d))
    .sort()
    .at(-1);
}
