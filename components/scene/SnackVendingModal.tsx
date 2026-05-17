'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Sprite } from '@/components/icons/Sprite';
import { cn } from '@/lib/cn';
import { usePlayerInventory } from '@/lib/playerInventory';
import {
  SNACK_ITEMS,
  type SnackItem,
} from '@/lib/snack-items';

export interface SnackVendingModalProps {
  open: boolean;
  onClose: () => void;
}

type TabId = 'energy-drink' | 'soda' | 'snack';

interface TabCfg {
  id: TabId;
  label: string;
  /** Item types that belong to this tab. */
  matches: SnackItem['type'][];
}

const TABS: TabCfg[] = [
  { id: 'energy-drink', label: 'ENERGY', matches: ['energy-drink'] },
  { id: 'soda', label: 'SODA', matches: ['soda'] },
  { id: 'snack', label: 'SNACKS', matches: ['chips', 'candy'] },
];

/**
 * A pixel-art zoomed-in vending machine. Opens over the arcade scene.
 * Hover items to preview their flavor; click to "vend" — fires the
 * playerInventory store and closes the modal so the character can show
 * the item in-hand.
 */
export function SnackVendingModal({ open, onClose }: SnackVendingModalProps) {
  const consume = usePlayerInventory((s) => s.consume);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [closing, setClosing] = useState(false);

  // Reset transient state every time the modal re-opens
  useEffect(() => {
    if (open) {
      setClosing(false);
      setHoveredId(null);
    }
  }, [open]);

  const requestClose = useCallback(() => {
    // Smooth 200ms fade-out, then signal the parent.
    setClosing(true);
    window.setTimeout(() => onClose(), 200);
  }, [onClose]);

  // ESC key + [E] also closes (matches the arcade's [E] return convention).
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        requestClose();
        return;
      }
      if (e.code === 'KeyE' || e.key === 'e' || e.key === 'E') {
        e.preventDefault();
        requestClose();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, requestClose]);

  const handleSelect = useCallback(
    (item: SnackItem) => {
      consume(item);
      requestClose();
    },
    [consume, requestClose],
  );

  const hovered = useMemo(
    () =>
      hoveredId ? SNACK_ITEMS.find((s) => s.id === hoveredId) ?? null : null,
    [hoveredId],
  );

  // Group items by tab — we draw all 3 rows simultaneously inside the shelf
  // grid (rather than gating by tab) so the layout always shows 12 cells.
  // The tabs simply highlight which row is "yours" — visual flair.
  const rows: { tab: TabCfg; items: SnackItem[] }[] = useMemo(() => {
    return TABS.map((tab) => ({
      tab,
      items: SNACK_ITEMS.filter((s) => tab.matches.includes(s.type)),
    }));
  }, []);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Vending unit"
      onClick={requestClose}
      className={cn(
        'fixed inset-0 z-[100] flex items-center justify-center',
        'bg-bg/95 backdrop-blur-md',
      )}
      style={{
        opacity: closing ? 0 : 1,
        transition: 'opacity 200ms ease-out',
      }}
    >
      {/* === Modal frame (zoomed-in vending unit) === */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative font-pixel text-text"
        style={{
          width: 640,
          maxWidth: 'min(640px, 96vw)',
          height: 720,
          maxHeight: 'min(720px, 94vh)',
          background:
            'linear-gradient(180deg, #1c0e30 0%, #14072a 40%, #07000f 100%)',
          border: '3px solid #050009',
          boxShadow: [
            '0 0 40px rgba(255,230,0,0.4)',
            '0 0 80px rgba(168,92,255,0.3)',
            '0 30px 60px rgba(0,0,0,0.85)',
            'inset 2px 2px 0 rgba(255,255,255,0.08)',
            'inset -2px -2px 0 rgba(0,0,0,0.7)',
          ].join(', '),
          transform: closing ? 'scale(0.96)' : 'scale(1)',
          transition: 'transform 200ms ease-out',
        }}
      >
        {/* === Top bar: insert credit + exit === */}
        <div
          className="absolute left-3 right-3 flex items-center justify-between"
          style={{ top: 10, height: 26 }}
        >
          <span
            className="text-[10px] tracking-widest text-yellow"
            style={{ textShadow: '0 0 6px #ffe600aa' }}
          >
            VENDING UNIT // INSERT FREE CREDIT
          </span>
          <button
            type="button"
            onClick={requestClose}
            aria-label="Close vending unit"
            className="border-2 border-pink bg-bg-2/80 px-2 py-0.5 text-[10px] tracking-widest text-pink hover:bg-pink hover:text-bg focus:outline-none"
            style={{ boxShadow: '0 0 8px rgba(255,44,159,0.55)' }}
          >
            [ ESC // EXIT ]
          </button>
        </div>

        {/* === Marquee header (mimics the cabinet POWER-UPS sign) === */}
        <div
          className="absolute left-4 right-4 overflow-hidden border-2 border-yellow text-center uppercase tracking-widest"
          style={{
            top: 44,
            height: 30,
            color: '#ffe600',
            fontSize: 13,
            lineHeight: '26px',
            background:
              'linear-gradient(180deg, rgba(255,230,0,0.22), rgba(255,230,0,0.06) 50%, rgba(255,230,0,0.22))',
            textShadow: '0 0 4px #ffe600, 0 0 12px #ffe600aa',
            boxShadow:
              'inset 0 0 12px rgba(255,230,0,0.45), 0 0 10px rgba(255,230,0,0.55)',
          }}
        >
          SNACKS &amp; FUEL
          {/* Marquee scanlines */}
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              backgroundImage:
                'repeating-linear-gradient(0deg, rgba(0,0,0,0.18) 0 1px, transparent 1px 3px)',
            }}
          />
        </div>

        {/* === Tab strip: ENERGY / SODA / SNACKS === */}
        <div
          className="absolute left-4 right-4 flex gap-2"
          style={{ top: 84, height: 26 }}
        >
          {TABS.map((tab, i) => {
            const c = i === 0 ? '#00f0ff' : i === 1 ? '#ff2c9f' : '#ffe600';
            return (
              <div
                key={tab.id}
                className="flex flex-1 items-center justify-center border-2 text-[10px] tracking-widest"
                style={{
                  borderColor: c,
                  color: c,
                  background:
                    'linear-gradient(180deg, rgba(255,255,255,0.04), rgba(0,0,0,0.4))',
                  textShadow: `0 0 4px ${c}, 0 0 10px ${c}88`,
                  boxShadow: `inset 0 0 8px ${c}33`,
                }}
              >
                {tab.label}
              </div>
            );
          })}
        </div>

        {/* === Glass display window with shelves === */}
        <div
          className="absolute left-4 right-4 overflow-hidden border-2 border-black"
          style={{
            top: 120,
            height: 480,
            background:
              'linear-gradient(180deg, #04000a 0%, #0a0118 60%, #02000a 100%)',
            boxShadow: [
              'inset 0 0 24px 6px rgba(0,0,0,0.9)',
              'inset 0 0 30px rgba(0,240,255,0.15)',
            ].join(', '),
          }}
        >
          {/* 3 shelves, each containing 4 items */}
          {rows.map((row, ri) => (
            <div
              key={row.tab.id}
              className="absolute left-0 right-0"
              style={{
                top: ri * 160,
                height: 156,
                padding: '8px 8px 0',
              }}
            >
              {/* Shelf items */}
              <div className="grid h-full grid-cols-4 gap-2 pb-3">
                {row.items.map((item) => {
                  const isHovered = hoveredId === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleSelect(item)}
                      onMouseEnter={() => setHoveredId(item.id)}
                      onMouseLeave={() =>
                        setHoveredId((cur) => (cur === item.id ? null : cur))
                      }
                      aria-label={`Vend ${item.name}`}
                      className="group relative flex flex-col items-center justify-end focus:outline-none"
                      style={{
                        border: `2px solid ${item.accentColor}`,
                        background:
                          'linear-gradient(180deg, rgba(255,255,255,0.04), rgba(0,0,0,0.55))',
                        boxShadow: isHovered
                          ? `0 0 18px ${item.accentColor}cc, 0 0 36px ${item.accentColor}55, inset 0 0 14px ${item.accentColor}44`
                          : `0 0 8px ${item.accentColor}55, inset 0 0 10px ${item.accentColor}22`,
                        transform: isHovered
                          ? 'translateY(-3px) scale(1.04)'
                          : 'translateY(0) scale(1)',
                        transition: 'all 140ms ease-out',
                        cursor: 'pointer',
                      }}
                    >
                      {/* Item sprite */}
                      <div className="flex flex-1 items-center justify-center pt-2">
                        <Sprite
                          def={item.spriteShelf}
                          scale={3}
                          ariaLabel={item.name}
                        />
                      </div>
                      {/* Item label strip */}
                      <div
                        className="absolute left-0 right-0 truncate text-center text-[8px] tracking-widest"
                        style={{
                          bottom: 2,
                          color: item.accentColor,
                          textShadow: `0 0 4px ${item.accentColor}aa`,
                        }}
                      >
                        {item.name}
                      </div>
                    </button>
                  );
                })}
              </div>
              {/* Shelf bottom hairline divider */}
              <div
                aria-hidden
                className="absolute left-0 right-0"
                style={{
                  bottom: 0,
                  height: 2,
                  background:
                    'linear-gradient(90deg, transparent, rgba(205,210,218,0.55), transparent)',
                }}
              />
            </div>
          ))}

          {/* Glass reflection */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                'linear-gradient(135deg, rgba(255,255,255,0.07) 0%, transparent 45%, rgba(0,240,255,0.05) 100%)',
            }}
          />
          {/* Scanlines */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              backgroundImage:
                'repeating-linear-gradient(0deg, rgba(0,0,0,0.22) 0 1px, transparent 1px 3px)',
            }}
          />
        </div>

        {/* === Status strip (rotating flavor text) === */}
        <div
          className="absolute left-4 right-4 flex items-center border-2 border-border bg-bg-2/85 px-3"
          style={{
            top: 610,
            height: 30,
            boxShadow: 'inset 0 0 10px rgba(0,0,0,0.6)',
          }}
        >
          <span
            className="text-[10px] tracking-widest"
            style={{
              color: hovered ? hovered.accentColor : '#cdd2da',
              textShadow: hovered
                ? `0 0 6px ${hovered.accentColor}aa`
                : '0 0 4px rgba(205,210,218,0.4)',
            }}
          >
            {hovered
              ? `> ${hovered.name} :: ${hovered.flavor}`
              : '> SELECT AN ITEM // PRESS [E] OR [ESC] TO RETURN'}
          </span>
        </div>

        {/* === Coin slot panel (decorative, like the cabinets) === */}
        <div
          className="absolute left-4 right-4 border-2 border-black"
          style={{
            top: 648,
            height: 28,
            background: 'linear-gradient(180deg, #2a1448, #170828)',
            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.08)',
          }}
        >
          <div className="flex h-full w-full items-center justify-between px-3">
            <div className="flex items-center gap-2">
              <span
                className="rounded-sm"
                style={{
                  display: 'inline-block',
                  width: 18,
                  height: 3,
                  background: '#ffe600',
                  boxShadow: '0 0 6px #ffe600',
                }}
              />
              <span className="text-[8px] tracking-widest text-text-muted">
                FREE PLAY // 00 CREDIT
              </span>
            </div>
            <div className="flex gap-1">
              {['A', '1', '2', '3', '4'].map((k) => (
                <span
                  key={k}
                  className="text-[7px] tracking-widest"
                  style={{
                    display: 'inline-block',
                    width: 10,
                    height: 10,
                    lineHeight: '10px',
                    textAlign: 'center',
                    background: '#0a0118',
                    color: '#7a5a96',
                    border: '1px solid #361052',
                  }}
                >
                  {k}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* === Delivery slot (the dramatic opening at the bottom) === */}
        <div
          className="absolute left-4 right-4 border-2 border-black overflow-hidden"
          style={{
            top: 682,
            height: 28,
            background: 'linear-gradient(180deg, #050009 0%, #000000 100%)',
            boxShadow:
              'inset 0 4px 8px rgba(0,0,0,0.9), inset 0 -1px 0 rgba(255,255,255,0.04)',
          }}
        >
          <div className="flex h-full w-full items-center justify-center">
            <span
              className="text-[8px] tracking-widest"
              style={{
                color: '#7a5a96',
                textShadow: '0 0 4px rgba(122,90,150,0.6)',
              }}
            >
              // DELIVERY SLOT //
            </span>
          </div>
          {/* Flap lip */}
          <div
            aria-hidden
            className="absolute inset-x-2"
            style={{
              top: 2,
              height: 2,
              background: '#1a0a2a',
            }}
          />
        </div>
      </div>
    </div>
  );
}
