import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './content/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Arcade palette — bg near-black violet, four-neon accent set
        bg: 'var(--bg)',
        'bg-2': 'var(--bg-2)',
        surface: 'var(--surface)',
        border: 'var(--border)',
        pink: 'var(--pink)',
        cyan: 'var(--cyan)',
        yellow: 'var(--yellow)',
        green: 'var(--green)',
        amber: 'var(--amber)',
        magenta: 'var(--magenta)',
        'electric-blue': 'var(--electric-blue)',
        text: 'var(--text)',
        'text-dim': 'var(--text-dim)',
        'text-muted': 'var(--text-muted)',
      },
      fontFamily: {
        pixel: ['var(--font-pixel)', '"Courier New"', 'monospace'],
        body: ['var(--font-body)', '"Courier New"', 'monospace'],
        score: ['var(--font-score)', 'Menlo', 'monospace'],
        prose: ['var(--font-prose)', 'system-ui', 'sans-serif'],
      },
      transitionTimingFunction: {
        chunky: 'steps(4, end)',
      },
      animation: {
        blink: 'blink 0.8s steps(2, end) infinite',
        scanline: 'scanline 8s linear infinite',
        pulse: 'arcade-pulse 1.4s ease-in-out infinite',
        flicker: 'flicker 4s linear infinite',
      },
      keyframes: {
        blink: {
          '0%, 49%': { opacity: '1' },
          '50%, 100%': { opacity: '0' },
        },
        scanline: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100vh)' },
        },
        'arcade-pulse': {
          '0%, 100%': { opacity: '1', textShadow: 'currentColor 0 0 12px' },
          '50%': { opacity: '0.85', textShadow: 'currentColor 0 0 4px' },
        },
        flicker: {
          '0%, 92%, 100%': { opacity: '1' },
          '93%, 95%': { opacity: '0.92' },
          '94%': { opacity: '0.7' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
