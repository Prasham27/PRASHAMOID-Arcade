import { create } from 'zustand';
import type { SnackItem } from './snack-items';

/** How long the character holds the snack before it auto-clears, in ms. */
const HOLD_DURATION_MS = 2800;

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
  /**
   * Called when the player picks an item from the vending machine.
   * Sets heldItem, increments consumptionId, then auto-clears heldItem
   * after HOLD_DURATION_MS. Subsequent consume() calls cancel and reset
   * the timer.
   */
  consume: (item: SnackItem) => void;
  /** Manually clear (used for testing or character unmount). */
  clear: () => void;
}

export const usePlayerInventory = create<PlayerInventoryState>((set, get) => ({
  heldItem: null,
  consumptionId: 0,

  consume: (item) => {
    // Cancel any previous auto-clear so the new item lives the full duration.
    if (timeoutHandle !== null) {
      window.clearTimeout(timeoutHandle);
      timeoutHandle = null;
    }
    set((s) => ({
      heldItem: item,
      consumptionId: s.consumptionId + 1,
    }));
    // Only register a timer in browser contexts (SSR-safe).
    if (typeof window !== 'undefined') {
      timeoutHandle = window.setTimeout(() => {
        timeoutHandle = null;
        // Only clear if no fresh consume() raced past us.
        if (get().heldItem === item) {
          set({ heldItem: null });
        }
      }, HOLD_DURATION_MS);
    }
  },

  clear: () => {
    if (timeoutHandle !== null) {
      window.clearTimeout(timeoutHandle);
      timeoutHandle = null;
    }
    set({ heldItem: null });
  },
}));
