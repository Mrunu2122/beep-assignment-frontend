import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: '#0a0d0e',
        surface: {
          DEFAULT: '#111518',
          subtle: '#161c20',
          border: '#232b30',
        },
        brand: {
          DEFAULT: '#10b981', // Emerald / Electric green
          accent: '#22c55e',
          glow: 'rgba(34, 197, 94, 0.15)',
        },
        text: {
          primary: '#f3f4f6',
          secondary: '#9ca3af',
          muted: '#6b7280',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        'glow-sm': '0 0 15px -3px rgba(34, 197, 94, 0.2)',
        'glow-md': '0 0 25px -4px rgba(34, 197, 94, 0.25)',
      }
    },
  },
  plugins: [],
};

export default config;
