// Tiny keyboard state tracker for the game.
export class InputState {
  keys = new Set<string>();
  private cleanup?: () => void;

  attach(target: Window | HTMLElement = window) {
    const onDown = (e: KeyboardEvent) => {
      this.keys.add(e.code);
      // Prevent space / arrows from scrolling the page during play
      if (
        e.code === 'Space' ||
        e.code === 'ArrowUp' ||
        e.code === 'ArrowDown' ||
        e.code === 'ArrowLeft' ||
        e.code === 'ArrowRight'
      ) {
        e.preventDefault();
      }
    };
    const onUp = (e: KeyboardEvent) => {
      this.keys.delete(e.code);
    };
    target.addEventListener('keydown', onDown as EventListener);
    target.addEventListener('keyup', onUp as EventListener);
    this.cleanup = () => {
      target.removeEventListener('keydown', onDown as EventListener);
      target.removeEventListener('keyup', onUp as EventListener);
    };
  }

  detach() {
    this.cleanup?.();
    this.cleanup = undefined;
    this.keys.clear();
  }

  has(code: string): boolean {
    return this.keys.has(code);
  }

  /** Consume a key — true if was pressed; useful for one-shot keys like Esc. */
  consumeOnce(code: string): boolean {
    if (this.keys.has(code)) {
      this.keys.delete(code);
      return true;
    }
    return false;
  }
}
