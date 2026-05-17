import { create } from 'zustand';
import type { SnackItem } from './snack-items';

/** Safety-net auto-clear if the throw-away flow never fires (e.g., the
 *  player navigates away mid-consume). Long enough that the normal
 *  consume → walk-to-trash → throw sequence always completes first. */
const AUTO_CLEAR_SAFETY_MS = 12_000;
const STORAGE_KEY = 'arcade.snackInventory';
const HISTORY_CAP = 50;

/** A single past consumption — used to remember what was eaten this session. */
export interface ConsumedEntry {
  itemId: string;
  at: number;
}

interface PersistedShape {
  consumedHistory: ConsumedEntry[];
  trashedCount: number;
  /** FIFO queue of the most recent items tossed into the can; oldest
   *  fall off when this is at TRASH_QUEUE_CAP. Persisted so the visible
   *  pile in the trash survives a page reload. */
  recentThrown: string[];
}

/** Max wrappers visibly stacked at the top of the trash can. */
export const TRASH_QUEUE_CAP = 6;

/** Module-level handle so a fresh consume() can cancel the previous auto-clear. */
let timeoutHandle: number | null = null;

interface PlayerInventoryState {
  /** The item currently held by the character; null when nothing held. */
  heldItem: SnackItem | null;
  /**
   * Increments each time consume() fires; lets the character re-trigger
   * the eat/drink animation even when the same item is selected twice.
   */
  consumptionId: number;
  /** Every snack the visitor has eaten/drunk this session, newest-first.
   *  Persisted to sessionStorage so it survives page reloads inside the
   *  same browser tab. Capped at HISTORY_CAP entries. */
  consumedHistory: ConsumedEntry[];
  /** Count of wrappers/cans thrown into the trash this session. */
  trashedCount: number;
  /** Recent wrapper IDs (newest-first) sitting in the trash can. Capped at
   *  TRASH_QUEUE_CAP — older entries roll off when new ones arrive. */
  recentThrown: string[];
  /** True once we've read sessionStorage. */
  hydrated: boolean;
  /**
   * Called when the player picks an item from the vending machine.
   * Sets heldItem, increments consumptionId, appends to history, and
   * arms a long safety-net auto-clear. The expected flow is for the
   * caller to follow up with throwAway() after the walk-to-trash; if
   * that never happens, the safety timer eventually clears heldItem.
   */
  consume: (item: SnackItem) => void;
  /** Called after the character has walked to the trash. Clears the held
   *  item and bumps trashedCount. */
  throwAway: () => void;
  /** Manually clear (used for testing or character unmount). */
  clear: () => void;
  /** Internal — flips hydrated true after sessionStorage is read. */
  _hydrate: (s: Partial<PersistedShape>) => void;
}

function persist(state: PersistedShape): void {
  if (typeof window === 'undefined') return;
  try {
    window.sessionStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        consumedHistory: state.consumedHistory.slice(0, HISTORY_CAP),
        trashedCount: state.trashedCount,
        recentThrown: state.recentThrown.slice(0, TRASH_QUEUE_CAP),
      }),
    );
  } catch {
    /* sessionStorage unavailable or full — ignore */
  }
}

export const usePlayerInventory = create<PlayerInventoryState>((set, get) => ({
  heldItem: null,
  consumptionId: 0,
  consumedHistory: [],
  trashedCount: 0,
  recentThrown: [],
  hydrated: false,

  consume: (item) => {
    if (timeoutHandle !== null) {
      window.clearTimeout(timeoutHandle);
      timeoutHandle = null;
    }
    const entry: ConsumedEntry = { itemId: item.id, at: Date.now() };
    set((s) => {
      const nextHistory = [entry, ...s.consumedHistory].slice(0, HISTORY_CAP);
      persist({
        consumedHistory: nextHistory,
        trashedCount: s.trashedCount,
        recentThrown: s.recentThrown,
      });
      return {
        heldItem: item,
        consumptionId: s.consumptionId + 1,
        consumedHistory: nextHistory,
      };
    });
    if (typeof window !== 'undefined') {
      timeoutHandle = window.setTimeout(() => {
        timeoutHandle = null;
        if (get().heldItem === item) {
          set({ heldItem: null });
        }
      }, AUTO_CLEAR_SAFETY_MS);
    }
  },

  throwAway: () => {
    if (timeoutHandle !== null) {
      window.clearTimeout(timeoutHandle);
      timeoutHandle = null;
    }
    set((s) => {
      if (!s.heldItem) return s; // nothing to throw
      const nextTrashed = s.trashedCount + 1;
      // FIFO queue capped at TRASH_QUEUE_CAP — newest first; oldest fall off.
      const nextRecent = [s.heldItem.id, ...s.recentThrown].slice(
        0,
        TRASH_QUEUE_CAP,
      );
      persist({
        consumedHistory: s.consumedHistory,
        trashedCount: nextTrashed,
        recentThrown: nextRecent,
      });
      return {
        heldItem: null,
        trashedCount: nextTrashed,
        recentThrown: nextRecent,
      };
    });
  },

  clear: () => {
    if (timeoutHandle !== null) {
      window.clearTimeout(timeoutHandle);
      timeoutHandle = null;
    }
    set({ heldItem: null });
  },

  _hydrate: (s) => set(s),
}));

/** Read persisted snack history from sessionStorage. Safe to call multiple
 *  times — subsequent calls after the first are no-ops. Intended to be
 *  invoked once from a top-level mount-once helper component. */
export function hydratePlayerInventory(): void {
  if (typeof window === 'undefined') return;
  const st = usePlayerInventory.getState();
  if (st.hydrated) return;
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed: unknown = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') {
        const p = parsed as Record<string, unknown>;
        const next: Partial<PersistedShape> = {};
        if (Array.isArray(p.consumedHistory)) {
          next.consumedHistory = (p.consumedHistory as unknown[])
            .filter(
              (e): e is ConsumedEntry =>
                !!e &&
                typeof e === 'object' &&
                typeof (e as ConsumedEntry).itemId === 'string' &&
                typeof (e as ConsumedEntry).at === 'number',
            )
            .slice(0, HISTORY_CAP);
        }
        if (typeof p.trashedCount === 'number' && p.trashedCount >= 0) {
          next.trashedCount = Math.floor(p.trashedCount);
        }
        if (Array.isArray(p.recentThrown)) {
          next.recentThrown = (p.recentThrown as unknown[])
            .filter((v): v is string => typeof v === 'string')
            .slice(0, TRASH_QUEUE_CAP);
        }
        st._hydrate(next);
      }
    }
  } catch {
    /* corrupt JSON — ignore */
  }
  usePlayerInventory.setState({ hydrated: true });
}
