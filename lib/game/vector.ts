// Mutable Vec2 — reused in the hot loop to avoid GC pressure.
export interface Vec2 {
  x: number;
  y: number;
}

export function v(x = 0, y = 0): Vec2 {
  return { x, y };
}

export function vAddMut(target: Vec2, src: Vec2): Vec2 {
  target.x += src.x;
  target.y += src.y;
  return target;
}

export function vScale(target: Vec2, k: number): Vec2 {
  target.x *= k;
  target.y *= k;
  return target;
}

export function vWrap(target: Vec2, w: number, h: number): Vec2 {
  if (target.x < 0) target.x += w;
  else if (target.x >= w) target.x -= w;
  if (target.y < 0) target.y += h;
  else if (target.y >= h) target.y -= h;
  return target;
}

export function vDist(a: Vec2, b: Vec2): number {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy);
}
