'use client';

import { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CharacterPreview, HOODIE_HEX } from './PixelCharacter';
import {
  usePlayerAppearance,
  type GogglesType,
  type HatType,
  type HoodieColor,
} from '@/lib/playerAppearance';
import { cn } from '@/lib/cn';

export interface AvatarCustomizationModalProps {
  open: boolean;
  onClose: () => void;
}

const HOODIE_OPTIONS: HoodieColor[] = [
  'cyan',
  'pink',
  'yellow',
  'green',
  'red',
  'white',
];

const HAT_OPTIONS: { id: HatType; label: string; tint: string }[] = [
  { id: 'none', label: 'NONE', tint: '#7a5a96' },
  { id: 'beanie', label: 'BEANIE', tint: '#ffe600' },
  { id: 'cap', label: 'CAP', tint: '#ff2c9f' },
  { id: 'headphones', label: 'PHONES', tint: '#39ff14' },
  { id: 'crown', label: 'CROWN', tint: '#ffe600' },
];

const GOGGLES_OPTIONS: { id: GogglesType; label: string; tint: string }[] = [
  { id: 'none', label: 'NONE', tint: '#7a5a96' },
  { id: 'pixel-goggles', label: 'PIXEL', tint: '#00f0ff' },
  { id: 'visor', label: 'VISOR', tint: '#00f0ff' },
  { id: 'shades', label: 'SHADES', tint: '#0b0014' },
];

/** Tiny visual preview tile for picker buttons. Just a colored square. */
function SwatchTile({
  color,
  selected,
  ringColor = '#00f0ff',
}: {
  color: string;
  selected: boolean;
  ringColor?: string;
}) {
  return (
    <div
      className="pointer-events-none"
      style={{
        width: 28,
        height: 28,
        background: color,
        border: `2px solid ${selected ? ringColor : '#050009'}`,
        boxShadow: selected
          ? `0 0 8px ${ringColor}, inset 0 0 0 2px rgba(0,0,0,0.5)`
          : 'inset 0 0 0 2px rgba(0,0,0,0.5), 0 2px 0 rgba(0,0,0,0.6)',
      }}
    />
  );
}

export function AvatarCustomizationModal({
  open,
  onClose,
}: AvatarCustomizationModalProps) {
  const hoodieColor = usePlayerAppearance((s) => s.hoodieColor);
  const hatType = usePlayerAppearance((s) => s.hatType);
  const gogglesType = usePlayerAppearance((s) => s.gogglesType);
  const setHoodieColor = usePlayerAppearance((s) => s.setHoodieColor);
  const setHatType = usePlayerAppearance((s) => s.setHatType);
  const setGogglesType = usePlayerAppearance((s) => s.setGogglesType);
  const reset = usePlayerAppearance((s) => s.reset);

  // ESC to close
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          key="changing-modal"
          className="fixed inset-0 z-[200] flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="changing-room-title"
        >
          {/* Backdrop */}
          <button
            type="button"
            aria-label="Close customization"
            onClick={onClose}
            className="absolute inset-0 cursor-default"
            style={{
              background: 'rgba(4, 0, 10, 0.78)',
              backdropFilter: 'blur(6px)',
              WebkitBackdropFilter: 'blur(6px)',
            }}
          />

          {/* Mirror frame */}
          <motion.div
            className="relative"
            style={{
              width: 720,
              maxWidth: 'calc(100vw - 32px)',
              height: 540,
              maxHeight: 'calc(100vh - 32px)',
              background:
                'linear-gradient(180deg, #15082a 0%, #07000f 100%)',
              border: '4px solid #00f0ff',
              boxShadow:
                '0 0 24px #00f0ffaa, 0 0 60px rgba(0,240,255,0.4), 0 24px 40px rgba(0,0,0,0.85), inset 0 0 0 2px rgba(0,0,0,0.6)',
            }}
            initial={{ scale: 0.92, y: 8 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.94, y: 8 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
          >
            {/* Top neon header */}
            <div
              className="absolute left-0 right-0"
              style={{
                top: -2,
                height: 44,
                background:
                  'linear-gradient(180deg, #1c0a30 0%, #0a0118 100%)',
                borderBottom: '2px solid #00f0ff',
                boxShadow: 'inset 0 0 18px rgba(0,240,255,0.25)',
              }}
            >
              <div
                id="changing-room-title"
                className="flex h-full w-full items-center justify-center font-pixel uppercase tracking-widest"
                style={{ fontSize: 14 }}
              >
                <span
                  style={{
                    color: '#ff2c9f',
                    textShadow:
                      '0 0 6px #ff2c9f, 0 0 14px rgba(255,44,159,0.7)',
                  }}
                >
                  CHANGING ROOM
                </span>
                <span
                  className="mx-3"
                  style={{
                    color: '#7a5a96',
                    fontSize: 12,
                  }}
                >
                  //
                </span>
                <span
                  style={{
                    color: '#00f0ff',
                    textShadow:
                      '0 0 6px #00f0ff, 0 0 14px rgba(0,240,255,0.7)',
                  }}
                >
                  CUSTOMIZE YOUR LOOK
                </span>
              </div>
            </div>

            {/* Content area (below header) */}
            <div
              className="absolute"
              style={{
                left: 0,
                right: 0,
                top: 44,
                bottom: 56,
              }}
            >
              <div className="flex h-full w-full">
                {/* === Left half: mirror preview === */}
                <div
                  className="relative flex items-center justify-center"
                  style={{
                    flex: '1 1 0',
                    background:
                      'linear-gradient(180deg, #1c0a30 0%, #050009 70%, #07000f 100%)',
                    borderRight: '2px solid #00f0ff',
                    boxShadow:
                      'inset 0 0 30px rgba(0,240,255,0.25), inset 0 0 80px rgba(0,0,0,0.85)',
                  }}
                >
                  {/* "Mirror" inner frame */}
                  <div
                    className="absolute"
                    style={{
                      left: 18,
                      right: 18,
                      top: 18,
                      bottom: 18,
                      border: '2px dashed rgba(0,240,255,0.55)',
                      boxShadow: 'inset 0 0 20px rgba(0,240,255,0.15)',
                    }}
                  />
                  {/* Scanline overlay */}
                  <div
                    aria-hidden
                    className="pointer-events-none absolute inset-0"
                    style={{
                      backgroundImage:
                        'repeating-linear-gradient(0deg, rgba(0,0,0,0.18) 0 1px, transparent 1px 3px)',
                    }}
                  />
                  <CharacterPreview
                    scale={4}
                    hoodieColor={hoodieColor}
                    hatType={hatType}
                    gogglesType={gogglesType}
                    animated
                  />
                  <div
                    className="absolute font-pixel uppercase tracking-widest"
                    style={{
                      left: 0,
                      right: 0,
                      bottom: 8,
                      textAlign: 'center',
                      fontSize: 8,
                      color: '#7a5a96',
                      letterSpacing: '0.2em',
                    }}
                  >
                    // MIRROR //
                  </div>
                </div>

                {/* === Right half: pickers === */}
                <div
                  className="overflow-y-auto p-4"
                  style={{
                    flex: '1 1 0',
                  }}
                >
                  {/* HOODIE */}
                  <PickerSection title="HOODIE COLOR">
                    <div className="flex flex-wrap gap-2">
                      {HOODIE_OPTIONS.map((c) => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => setHoodieColor(c)}
                          className="flex flex-col items-center gap-1 p-1 focus:outline-none"
                          aria-label={`Hoodie color: ${c}`}
                          aria-pressed={hoodieColor === c}
                        >
                          <SwatchTile
                            color={HOODIE_HEX[c].body}
                            selected={hoodieColor === c}
                          />
                          <span
                            className={cn(
                              'font-pixel uppercase tracking-widest',
                              hoodieColor === c
                                ? 'text-cyan'
                                : 'text-text-dim',
                            )}
                            style={{ fontSize: 7 }}
                          >
                            {c}
                          </span>
                        </button>
                      ))}
                    </div>
                  </PickerSection>

                  {/* HAT */}
                  <PickerSection title="HAT">
                    <div className="flex flex-wrap gap-2">
                      {HAT_OPTIONS.map((h) => (
                        <button
                          key={h.id}
                          type="button"
                          onClick={() => setHatType(h.id)}
                          className="flex flex-col items-center gap-1 p-1 focus:outline-none"
                          aria-label={`Hat: ${h.label}`}
                          aria-pressed={hatType === h.id}
                        >
                          <SwatchTile
                            color={h.tint}
                            selected={hatType === h.id}
                          />
                          <span
                            className={cn(
                              'font-pixel uppercase tracking-widest',
                              hatType === h.id
                                ? 'text-cyan'
                                : 'text-text-dim',
                            )}
                            style={{ fontSize: 7 }}
                          >
                            {h.label}
                          </span>
                        </button>
                      ))}
                    </div>
                  </PickerSection>

                  {/* GOGGLES */}
                  <PickerSection title="GOGGLES">
                    <div className="flex flex-wrap gap-2">
                      {GOGGLES_OPTIONS.map((g) => (
                        <button
                          key={g.id}
                          type="button"
                          onClick={() => setGogglesType(g.id)}
                          className="flex flex-col items-center gap-1 p-1 focus:outline-none"
                          aria-label={`Goggles: ${g.label}`}
                          aria-pressed={gogglesType === g.id}
                        >
                          <SwatchTile
                            color={g.tint}
                            selected={gogglesType === g.id}
                          />
                          <span
                            className={cn(
                              'font-pixel uppercase tracking-widest',
                              gogglesType === g.id
                                ? 'text-cyan'
                                : 'text-text-dim',
                            )}
                            style={{ fontSize: 7 }}
                          >
                            {g.label}
                          </span>
                        </button>
                      ))}
                    </div>
                  </PickerSection>

                  <div
                    className="mt-4 font-pixel uppercase tracking-widest"
                    style={{ fontSize: 7, color: '#7a5a96' }}
                  >
                    Changes save automatically.
                  </div>
                </div>
              </div>
            </div>

            {/* === Bottom bar: ESC + RESET === */}
            <div
              className="absolute left-0 right-0 flex items-center justify-between px-4"
              style={{
                bottom: 0,
                height: 56,
                background:
                  'linear-gradient(180deg, #07000f 0%, #0a0118 100%)',
                borderTop: '2px solid #00f0ff',
                boxShadow: 'inset 0 0 14px rgba(0,240,255,0.2)',
              }}
            >
              <button
                type="button"
                onClick={() => reset()}
                className="border-2 px-3 py-1 font-pixel uppercase tracking-widest focus:outline-none"
                style={{
                  fontSize: 9,
                  color: '#ffe600',
                  borderColor: '#ffe600',
                  background: 'rgba(255,230,0,0.08)',
                  textShadow: '0 0 4px #ffe600',
                  boxShadow:
                    '0 0 8px rgba(255,230,0,0.35), inset 0 0 8px rgba(255,230,0,0.12)',
                }}
              >
                [ RESET TO DEFAULT ]
              </button>

              <button
                type="button"
                onClick={onClose}
                className="border-2 px-3 py-1 font-pixel uppercase tracking-widest focus:outline-none"
                style={{
                  fontSize: 9,
                  color: '#00f0ff',
                  borderColor: '#00f0ff',
                  background: 'rgba(0,240,255,0.08)',
                  textShadow: '0 0 4px #00f0ff',
                  boxShadow:
                    '0 0 8px rgba(0,240,255,0.35), inset 0 0 8px rgba(0,240,255,0.12)',
                }}
              >
                [ ESC // EXIT ]
              </button>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

function PickerSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-4">
      <div
        className="mb-2 font-pixel uppercase tracking-widest"
        style={{
          fontSize: 9,
          color: '#ff2c9f',
          textShadow: '0 0 4px #ff2c9f',
          letterSpacing: '0.2em',
        }}
      >
        {title}
      </div>
      {children}
    </div>
  );
}
