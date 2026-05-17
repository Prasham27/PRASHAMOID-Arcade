import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const alt = 'PRASHAMOID ARCADE — portfolio for Prasham';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OG() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          background: '#0b0014',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          fontFamily: 'monospace',
          color: '#f5e8ff',
          backgroundImage:
            'linear-gradient(rgba(54,16,82,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(54,16,82,0.5) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      >
        <div
          style={{
            fontSize: 26,
            color: '#7a5a96',
            letterSpacing: 8,
            marginBottom: 30,
          }}
        >
          ◆ PRASHAMOID ARCADE ◆
        </div>
        <div
          style={{
            fontSize: 130,
            color: '#ff2c9f',
            textShadow: '0 0 30px rgba(255,44,159,0.6)',
            letterSpacing: 6,
          }}
        >
          PRASHAM
        </div>
        <div
          style={{
            fontSize: 28,
            color: '#00f0ff',
            textShadow: '0 0 12px rgba(0,240,255,0.5)',
            letterSpacing: 8,
            marginTop: 20,
          }}
        >
          INSERT COIN TO START
        </div>
        <div
          style={{
            fontSize: 18,
            color: '#ffe600',
            letterSpacing: 5,
            marginTop: 40,
          }}
        >
          ESTABLISHED 2023 · GANDHINAGAR · IN
        </div>
      </div>
    ),
    { ...size },
  );
}
