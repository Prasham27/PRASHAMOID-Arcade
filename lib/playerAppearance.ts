'use client';

import { create } from 'zustand';

export type HoodieColor =
  | 'cyan'
  | 'pink'
  | 'yellow'
  | 'green'
  | 'red'
  | 'white';
export type HatType =
  | 'none'
  | 'beanie'
  | 'cap'
  | 'headphones'
  | 'crown';
export type GogglesType =
  | 'none'
  | 'pixel-goggles'
  | 'visor'
  | 'shades';

export interface PlayerAppearanceState {
  hoodieColor: HoodieColor;
  hatType: HatType;
  gogglesType: GogglesType;
  /** Becomes true after sessionStorage hydration runs once. Until then,
   *  treat the values above as defaults. */
  hydrated: boolean;
  setHoodieColor: (c: HoodieColor) => void;
  setHatType: (h: HatType) => void;
  setGogglesType: (g: GogglesType) => void;
  reset: () => void;
  /** Internal — flips hydrated true after first sessionStorage read. */
  _markHydrated: () => void;
  /** Internal — bulk-replace state from a persisted snapshot. */
  _hydrate: (s: Partial<PlayerAppearanceState>) => void;
}

const DEFAULTS = {
  hoodieColor: 'cyan' as HoodieColor,
  hatType: 'none' as HatType,
  // Default to savage 8-bit shades for the cool look (was 'none').
  gogglesType: 'shades' as GogglesType,
};

const STORAGE_KEY = 'arcade.appearance';

const HOODIE_VALUES: readonly HoodieColor[] = [
  'cyan',
  'pink',
  'yellow',
  'green',
  'red',
  'white',
];
const HAT_VALUES: readonly HatType[] = [
  'none',
  'beanie',
  'cap',
  'headphones',
  'crown',
];
const GOGGLES_VALUES: readonly GogglesType[] = [
  'none',
  'pixel-goggles',
  'visor',
  'shades',
];

function isHoodieColor(v: unknown): v is HoodieColor {
  return typeof v === 'string' && HOODIE_VALUES.includes(v as HoodieColor);
}
function isHatType(v: unknown): v is HatType {
  return typeof v === 'string' && HAT_VALUES.includes(v as HatType);
}
function isGogglesType(v: unknown): v is GogglesType {
  return typeof v === 'string' && GOGGLES_VALUES.includes(v as GogglesType);
}

function persist(state: {
  hoodieColor: HoodieColor;
  hatType: HatType;
  gogglesType: GogglesType;
}) {
  if (typeof window === 'undefined') return;
  try {
    window.sessionStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        hoodieColor: state.hoodieColor,
        hatType: state.hatType,
        gogglesType: state.gogglesType,
      }),
    );
  } catch {
    /* sessionStorage unavailable — ignore */
  }
}

export const usePlayerAppearance = create<PlayerAppearanceState>(
  (set, get) => ({
    ...DEFAULTS,
    hydrated: false,
    setHoodieColor: (c) => {
      set({ hoodieColor: c });
      const s = get();
      persist({
        hoodieColor: c,
        hatType: s.hatType,
        gogglesType: s.gogglesType,
      });
    },
    setHatType: (h) => {
      set({ hatType: h });
      const s = get();
      persist({
        hoodieColor: s.hoodieColor,
        hatType: h,
        gogglesType: s.gogglesType,
      });
    },
    setGogglesType: (g) => {
      set({ gogglesType: g });
      const s = get();
      persist({
        hoodieColor: s.hoodieColor,
        hatType: s.hatType,
        gogglesType: g,
      });
    },
    reset: () => {
      set(DEFAULTS);
      persist(DEFAULTS);
    },
    _markHydrated: () => set({ hydrated: true }),
    _hydrate: (s) => set(s),
  }),
);

/** Hydrate the store from sessionStorage. Safe to call multiple times
 *  (subsequent calls after the first are no-ops). Intended to be invoked
 *  from a top-level mount-once helper component. */
export function hydratePlayerAppearance(): void {
  if (typeof window === 'undefined') return;
  const st = usePlayerAppearance.getState();
  if (st.hydrated) return;
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed: unknown = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') {
        const p = parsed as Record<string, unknown>;
        const next: Partial<PlayerAppearanceState> = {};
        if (isHoodieColor(p.hoodieColor)) next.hoodieColor = p.hoodieColor;
        if (isHatType(p.hatType)) next.hatType = p.hatType;
        if (isGogglesType(p.gogglesType)) next.gogglesType = p.gogglesType;
        st._hydrate(next);
      }
    }
  } catch {
    /* corrupt JSON — ignore */
  }
  st._markHydrated();
}
