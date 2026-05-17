// PRASHAMOID — Asteroids variant. Single canvas, requestAnimationFrame loop.
// Designed for a casual player to reach 3000+ within 60s.

import { InputState } from './input';
import { v, vAddMut, vScale, vWrap, vDist, type Vec2 } from './vector';

const SHIP_THRUST = 220;        // px/sec^2
const SHIP_ROT = 3.6;            // rad/sec
const SHIP_MAX_SPEED = 320;
const SHIP_FRICTION = 0.992;     // per frame at 60fps
const BULLET_SPEED = 480;
const BULLET_LIFE_SEC = 1.0;
const FIRE_COOLDOWN_SEC = 0.18;
const INVULN_SEC = 2.0;

const ASTEROID_BASE_SPEED = 60;
const ASTEROID_SIZES = [42, 24, 14] as const;
const ASTEROID_SCORES = [20, 50, 100] as const;
const INITIAL_LARGE = 3;

interface Ship {
  pos: Vec2;
  vel: Vec2;
  rot: number;
  cooldown: number;
  invuln: number;
}

interface Bullet {
  pos: Vec2;
  vel: Vec2;
  life: number;
}

interface Asteroid {
  pos: Vec2;
  vel: Vec2;
  size: 0 | 1 | 2; // 0 = large
  rot: number;
  spin: number;
  shape: number[]; // jitter offsets per vertex for craggy shape
}

export interface GameSnapshot {
  score: number;
  lives: number;
  gameOver: boolean;
  paused: boolean;
  invuln: boolean;
  elapsedSec: number;
}

export type SnapshotListener = (s: GameSnapshot) => void;

export class Prashamoid {
  private ctx: CanvasRenderingContext2D;
  private w: number;
  private h: number;
  private input = new InputState();
  private ship: Ship;
  private bullets: Bullet[] = [];
  private asteroids: Asteroid[] = [];
  private score = 0;
  private lives = 3;
  private gameOver = false;
  private paused = false;
  private elapsed = 0;
  private lastT = 0;
  private rafId = 0;
  private listeners: SnapshotListener[] = [];
  private spawnTimer = 0;
  private dieFlash = 0;
  private visibilityHandler?: () => void;

  constructor(canvas: HTMLCanvasElement) {
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('canvas 2d unsupported');
    this.ctx = ctx;
    this.w = canvas.width;
    this.h = canvas.height;
    this.ship = {
      pos: v(this.w / 2, this.h / 2),
      vel: v(),
      rot: -Math.PI / 2,
      cooldown: 0,
      invuln: INVULN_SEC,
    };
    for (let i = 0; i < INITIAL_LARGE; i++) this.spawnAsteroid(0);
  }

  start() {
    this.input.attach();
    this.visibilityHandler = () => {
      if (document.hidden) this.paused = true;
      this.emit();
    };
    document.addEventListener('visibilitychange', this.visibilityHandler);
    this.lastT = performance.now();
    this.loop(this.lastT);
  }

  stop() {
    cancelAnimationFrame(this.rafId);
    this.input.detach();
    if (this.visibilityHandler) {
      document.removeEventListener('visibilitychange', this.visibilityHandler);
    }
  }

  togglePause() {
    if (this.gameOver) return;
    this.paused = !this.paused;
    this.emit();
  }

  onSnapshot(fn: SnapshotListener) {
    this.listeners.push(fn);
    fn(this.snapshot());
  }

  snapshot(): GameSnapshot {
    return {
      score: this.score,
      lives: this.lives,
      gameOver: this.gameOver,
      paused: this.paused,
      invuln: this.ship.invuln > 0,
      elapsedSec: this.elapsed,
    };
  }

  private emit() {
    const s = this.snapshot();
    for (const fn of this.listeners) fn(s);
  }

  private loop = (t: number) => {
    const dtRaw = (t - this.lastT) / 1000;
    this.lastT = t;
    const dt = Math.min(dtRaw, 0.05); // cap to 50ms to survive tab freezes

    if (this.input.consumeOnce('Escape')) this.togglePause();

    if (!this.paused && !this.gameOver) {
      this.update(dt);
    }
    this.draw();

    this.rafId = requestAnimationFrame(this.loop);
  };

  private update(dt: number) {
    this.elapsed += dt;
    // Ship rotation + thrust
    if (this.input.has('KeyA') || this.input.has('ArrowLeft')) {
      this.ship.rot -= SHIP_ROT * dt;
    }
    if (this.input.has('KeyD') || this.input.has('ArrowRight')) {
      this.ship.rot += SHIP_ROT * dt;
    }
    if (this.input.has('KeyW') || this.input.has('ArrowUp')) {
      this.ship.vel.x += Math.cos(this.ship.rot) * SHIP_THRUST * dt;
      this.ship.vel.y += Math.sin(this.ship.rot) * SHIP_THRUST * dt;
    }
    // Clamp speed
    const sp = Math.hypot(this.ship.vel.x, this.ship.vel.y);
    if (sp > SHIP_MAX_SPEED) vScale(this.ship.vel, SHIP_MAX_SPEED / sp);
    // Friction
    vScale(this.ship.vel, SHIP_FRICTION);
    // Position
    this.ship.pos.x += this.ship.vel.x * dt;
    this.ship.pos.y += this.ship.vel.y * dt;
    vWrap(this.ship.pos, this.w, this.h);

    if (this.ship.invuln > 0) this.ship.invuln -= dt;
    if (this.ship.cooldown > 0) this.ship.cooldown -= dt;

    // Fire
    if (
      (this.input.has('Space') || this.input.has('KeyJ')) &&
      this.ship.cooldown <= 0
    ) {
      this.bullets.push({
        pos: v(this.ship.pos.x, this.ship.pos.y),
        vel: v(
          Math.cos(this.ship.rot) * BULLET_SPEED,
          Math.sin(this.ship.rot) * BULLET_SPEED,
        ),
        life: BULLET_LIFE_SEC,
      });
      this.ship.cooldown = FIRE_COOLDOWN_SEC;
    }

    // Bullets
    for (let i = this.bullets.length - 1; i >= 0; i--) {
      const b = this.bullets[i];
      b.pos.x += b.vel.x * dt;
      b.pos.y += b.vel.y * dt;
      vWrap(b.pos, this.w, this.h);
      b.life -= dt;
      if (b.life <= 0) this.bullets.splice(i, 1);
    }

    // Asteroids
    for (const a of this.asteroids) {
      a.pos.x += a.vel.x * dt;
      a.pos.y += a.vel.y * dt;
      a.rot += a.spin * dt;
      vWrap(a.pos, this.w, this.h);
    }

    // Spawn more large asteroids over time so the game escalates
    this.spawnTimer -= dt;
    if (this.spawnTimer <= 0) {
      // Ramp interval from 3s to 1.5s over first 60s
      const ramp = Math.min(1, this.elapsed / 60);
      const interval = 3.0 - 1.5 * ramp;
      this.spawnTimer = interval;
      // Avoid pile-up if player is already overwhelmed
      const large = this.asteroids.filter((a) => a.size === 0).length;
      if (large < 6) this.spawnAsteroid(0);
    }

    // Collisions: bullets vs asteroids
    for (let i = this.asteroids.length - 1; i >= 0; i--) {
      const a = this.asteroids[i];
      const r = ASTEROID_SIZES[a.size];
      for (let j = this.bullets.length - 1; j >= 0; j--) {
        const b = this.bullets[j];
        if (vDist(a.pos, b.pos) < r) {
          this.bullets.splice(j, 1);
          this.score += ASTEROID_SCORES[a.size];
          if (a.size < 2) {
            // split into 2 smaller
            const next = (a.size + 1) as 0 | 1 | 2;
            for (let k = 0; k < 2; k++) {
              this.asteroids.push(this.spawnAt(a.pos.x, a.pos.y, next));
            }
          }
          this.asteroids.splice(i, 1);
          this.emit();
          break;
        }
      }
    }

    // Collisions: ship vs asteroids
    if (this.ship.invuln <= 0) {
      for (const a of this.asteroids) {
        const r = ASTEROID_SIZES[a.size];
        if (vDist(a.pos, this.ship.pos) < r + 8) {
          this.lives -= 1;
          this.dieFlash = 0.5;
          if (this.lives <= 0) {
            this.gameOver = true;
          } else {
            this.ship.pos.x = this.w / 2;
            this.ship.pos.y = this.h / 2;
            this.ship.vel.x = 0;
            this.ship.vel.y = 0;
            this.ship.invuln = INVULN_SEC;
          }
          this.emit();
          break;
        }
      }
    }

    if (this.dieFlash > 0) this.dieFlash -= dt;
  }

  private spawnAsteroid(size: 0 | 1 | 2) {
    // Spawn from a random edge with inward velocity
    const edge = Math.floor(Math.random() * 4);
    let x = 0;
    let y = 0;
    if (edge === 0) {
      x = 0;
      y = Math.random() * this.h;
    } else if (edge === 1) {
      x = this.w;
      y = Math.random() * this.h;
    } else if (edge === 2) {
      x = Math.random() * this.w;
      y = 0;
    } else {
      x = Math.random() * this.w;
      y = this.h;
    }
    this.asteroids.push(this.spawnAt(x, y, size));
  }

  private spawnAt(x: number, y: number, size: 0 | 1 | 2): Asteroid {
    const angle = Math.random() * Math.PI * 2;
    const speed = ASTEROID_BASE_SPEED + Math.random() * 30 + size * 20;
    return {
      pos: v(x, y),
      vel: v(Math.cos(angle) * speed, Math.sin(angle) * speed),
      size,
      rot: Math.random() * Math.PI * 2,
      spin: (Math.random() - 0.5) * 1.2,
      shape: Array.from({ length: 8 }, () => 0.7 + Math.random() * 0.5),
    };
  }

  private draw() {
    const c = this.ctx;
    // Clear with a slight trail
    c.fillStyle = 'rgba(11, 0, 20, 0.92)';
    c.fillRect(0, 0, this.w, this.h);

    // Subtle grid background
    c.strokeStyle = 'rgba(54, 16, 82, 0.5)';
    c.lineWidth = 1;
    c.beginPath();
    for (let gx = 0; gx < this.w; gx += 40) {
      c.moveTo(gx, 0);
      c.lineTo(gx, this.h);
    }
    for (let gy = 0; gy < this.h; gy += 40) {
      c.moveTo(0, gy);
      c.lineTo(this.w, gy);
    }
    c.stroke();

    // Die flash overlay
    if (this.dieFlash > 0) {
      c.fillStyle = `rgba(255, 44, 159, ${this.dieFlash * 0.4})`;
      c.fillRect(0, 0, this.w, this.h);
    }

    // Asteroids
    c.strokeStyle = '#00f0ff';
    c.lineWidth = 1.5;
    for (const a of this.asteroids) {
      const r = ASTEROID_SIZES[a.size];
      c.save();
      c.translate(a.pos.x, a.pos.y);
      c.rotate(a.rot);
      c.beginPath();
      for (let i = 0; i < a.shape.length; i++) {
        const ang = (i / a.shape.length) * Math.PI * 2;
        const rr = r * a.shape[i];
        const x = Math.cos(ang) * rr;
        const y = Math.sin(ang) * rr;
        if (i === 0) c.moveTo(x, y);
        else c.lineTo(x, y);
      }
      c.closePath();
      c.stroke();
      c.restore();
    }

    // Bullets
    c.fillStyle = '#ffe600';
    for (const b of this.bullets) {
      c.beginPath();
      c.arc(b.pos.x, b.pos.y, 2.5, 0, Math.PI * 2);
      c.fill();
    }

    // Ship
    if (this.ship.invuln <= 0 || Math.floor(this.elapsed * 12) % 2 === 0) {
      c.strokeStyle = '#ff2c9f';
      c.lineWidth = 2;
      c.save();
      c.translate(this.ship.pos.x, this.ship.pos.y);
      c.rotate(this.ship.rot);
      c.beginPath();
      c.moveTo(12, 0);
      c.lineTo(-8, -7);
      c.lineTo(-4, 0);
      c.lineTo(-8, 7);
      c.closePath();
      c.stroke();
      // Thrust flicker
      if (
        (this.input.has('KeyW') || this.input.has('ArrowUp')) &&
        Math.random() > 0.4
      ) {
        c.strokeStyle = '#ffe600';
        c.beginPath();
        c.moveTo(-4, -3);
        c.lineTo(-12, 0);
        c.lineTo(-4, 3);
        c.stroke();
      }
      c.restore();
    }

    // Pause overlay
    if (this.paused) {
      c.fillStyle = 'rgba(11, 0, 20, 0.7)';
      c.fillRect(0, 0, this.w, this.h);
      c.fillStyle = '#ffe600';
      c.font = '20px "Press Start 2P", monospace';
      c.textAlign = 'center';
      c.fillText('PAUSED', this.w / 2, this.h / 2);
      c.fillStyle = '#c7a8e8';
      c.font = '14px "VT323", monospace';
      c.fillText('press ESC to resume', this.w / 2, this.h / 2 + 28);
    }
  }
}
