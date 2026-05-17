// Classic Konami code: ↑ ↑ ↓ ↓ ← → ← → B A
export const KONAMI_SEQUENCE: ReadonlyArray<string> = [
  'ArrowUp',
  'ArrowUp',
  'ArrowDown',
  'ArrowDown',
  'ArrowLeft',
  'ArrowRight',
  'ArrowLeft',
  'ArrowRight',
  'KeyB',
  'KeyA',
];

export const KONAMI_UNLOCKED_KEY = 'arcade.konami';

export function matchesKonami(buffer: ReadonlyArray<string>): boolean {
  if (buffer.length < KONAMI_SEQUENCE.length) return false;
  const tail = buffer.slice(-KONAMI_SEQUENCE.length);
  return tail.every((k, i) => k === KONAMI_SEQUENCE[i]);
}
