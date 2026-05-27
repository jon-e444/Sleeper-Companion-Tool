import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['var(--font-display)', 'sans-serif'],
        body: ['var(--font-body)', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace'],
      },
      colors: {
        espn: {
          red: '#cc0000',
          navy: '#001f5b',
          gold: '#f5a623',
        },
        surface: {
          DEFAULT: '#111827',
          2: '#1a2233',
          3: '#1f2d42',
        },
      },
      animation: {
        'scroll-left': 'scroll-left 40s linear infinite',
        'pulse-slow': 'pulse 2s ease-in-out infinite',
        blink: 'blink 1.2s ease-in-out infinite',
      },
      keyframes: {
        'scroll-left': {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        blink: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.3' },
        },
      },
    },
  },
  plugins: [],
};
export default config;
