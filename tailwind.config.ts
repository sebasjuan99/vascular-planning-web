import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ['class'],
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Vascular Planning design tokens
        'vp-red':    '#C0392B',
        'vp-blue':   '#1A3A6B',
        'vp-dark':   '#0f172a',
        'vp-muted':  '#94a3b8',
        'vp-border': '#e2e8f0',
        'vp-surface':'#f8fafc',
        // Clinical redesign tokens
        'clinical-blue': '#0058bc',
        'clinical-container': '#0070eb',
        'clinical-light': '#d8e2ff',
        'clinical-dark': '#001a41',
        'surface-dim': '#d9dadc',
        'surface-container': '#eeeef0',
        'surface-container-low': '#f3f3f5',
        'surface-container-high': '#e8e8ea',
        'surface-container-highest': '#e2e2e4',
        'on-surface': '#1a1c1d',
        'on-surface-variant': '#414755',
        'outline-variant': '#c1c6d7',
        // shadcn CSS variable colors
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      boxShadow: {
        'apple': '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
        'apple-lg': '0 20px 40px rgba(0, 88, 188, 0.04)',
        'glass': '0 8px 32px rgba(0, 0, 0, 0.06)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}

export default config
