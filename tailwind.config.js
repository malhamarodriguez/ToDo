// Escala de espaciado en calc() sobre --space: la "densidad" de Ajustes
// (compacta/normal/cómoda) escala paddings, gaps y tamaños en toda la app.
const SPACING = { px: '1px', 0: '0px' }
for (const k of [0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5, 6, 7, 8, 9, 10, 11, 12, 14, 16, 18, 20, 22, 24, 28, 32, 36, 40, 44, 48, 52, 56, 60, 64, 72, 80, 96]) {
  SPACING[k] = `calc(${k * 0.25}rem * var(--space, 1))`
}

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class', '[data-mode="dark"]'],
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    spacing: SPACING,
    extend: {
      colors: {
        // Surfaces & neutrals — all driven by CSS variables so the
        // theme (dark/light) and the visual "direction" can swap them.
        bg: 'hsl(var(--bg) / <alpha-value>)',
        surface: 'hsl(var(--surface) / <alpha-value>)',
        'surface-2': 'hsl(var(--surface-2) / <alpha-value>)',
        elevated: 'hsl(var(--elevated) / <alpha-value>)',
        line: 'hsl(var(--border) / <alpha-value>)',
        'line-strong': 'hsl(var(--border-strong) / <alpha-value>)',

        ink: 'hsl(var(--text) / <alpha-value>)',
        muted: 'hsl(var(--text-muted) / <alpha-value>)',
        subtle: 'hsl(var(--text-subtle) / <alpha-value>)',

        // Configurable accent
        accent: {
          DEFAULT: 'hsl(var(--accent) / <alpha-value>)',
          fg: 'hsl(var(--accent-fg) / <alpha-value>)',
        },

        // Semantic
        success: 'hsl(var(--success) / <alpha-value>)',
        warning: 'hsl(var(--warning) / <alpha-value>)',
        danger: 'hsl(var(--danger) / <alpha-value>)',
        info: 'hsl(var(--info) / <alpha-value>)',
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['var(--font-display)', 'var(--font-sans)', 'sans-serif'],
        mono: ['var(--font-mono)', 'ui-monospace', 'monospace'],
      },
      fontSize: {
        '2xs': ['0.6875rem', { lineHeight: '1rem', letterSpacing: '0.02em' }],
      },
      borderRadius: {
        sm: 'calc(var(--radius) - 6px)',
        DEFAULT: 'calc(var(--radius) - 4px)',
        md: 'calc(var(--radius) - 2px)',
        lg: 'var(--radius)',
        xl: 'calc(var(--radius) + 4px)',
        '2xl': 'calc(var(--radius) + 10px)',
        '3xl': 'calc(var(--radius) + 18px)',
      },
      boxShadow: {
        xs: 'var(--shadow-xs)',
        sm: 'var(--shadow-sm)',
        DEFAULT: 'var(--shadow)',
        md: 'var(--shadow)',
        lg: 'var(--shadow-lg)',
        xl: 'var(--shadow-xl)',
        glow: 'var(--shadow-glow)',
        'inner-line': 'inset 0 0 0 1px hsl(var(--border) / 0.7)',
      },
      spacing: {
        gutter: 'clamp(1rem, 1rem + 1vw, 2rem)',
      },
      borderWidth: {
        DEFAULT: 'var(--border-w, 1px)',
      },
      maxWidth: {
        content: '1440px',
      },
      transitionTimingFunction: {
        smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
        spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
      keyframes: {
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        'fade-up': {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'scale-in': {
          from: { opacity: '0', transform: 'scale(0.96)' },
          to: { opacity: '1', transform: 'scale(1)' },
        },
        'slide-up': {
          from: { transform: 'translateY(100%)' },
          to: { transform: 'translateY(0)' },
        },
        'toast-in': {
          from: { opacity: '0', transform: 'translateY(12px) scale(0.98)' },
          to: { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.25s var(--ease, ease) both',
        'fade-up': 'fade-up 0.35s cubic-bezier(0.4,0,0.2,1) both',
        'scale-in': 'scale-in 0.18s cubic-bezier(0.34,1.56,0.64,1) both',
        'slide-up': 'slide-up 0.3s cubic-bezier(0.4,0,0.2,1) both',
        'toast-in': 'toast-in 0.3s cubic-bezier(0.34,1.56,0.64,1) both',
      },
    },
  },
  plugins: [],
}
