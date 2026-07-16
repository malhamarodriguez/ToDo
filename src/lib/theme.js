// Tema: presets de acento, direcciones y aplicación al DOM.

export const ACCENTS = [
  { id: 'electrico', name: 'Cian eléctrico', hsl: '186 100% 50%', fg: '187 100% 7%' },
  { id: 'indigo', name: 'Índigo', hsl: '243 76% 64%', fg: '0 0% 100%' },
  { id: 'violeta', name: 'Violeta', hsl: '262 72% 64%', fg: '0 0% 100%' },
  { id: 'azul', name: 'Azul', hsl: '213 90% 58%', fg: '0 0% 100%' },
  { id: 'esmeralda', name: 'Esmeralda', hsl: '158 64% 44%', fg: '0 0% 100%' },
  { id: 'lima', name: 'Lima', hsl: '88 58% 48%', fg: '90 60% 8%' },
  { id: 'ambar', name: 'Ámbar', hsl: '36 92% 55%', fg: '30 45% 12%' },
  { id: 'naranja', name: 'Naranja', hsl: '22 90% 56%', fg: '0 0% 100%' },
  { id: 'rosa', name: 'Rosa', hsl: '342 80% 62%', fg: '0 0% 100%' },
  { id: 'rojo', name: 'Rojo', hsl: '358 70% 58%', fg: '0 0% 100%' },
]

export const DIRECTIONS = [
  {
    id: 'eclipse',
    name: 'Eclipse',
    tagline: 'Frío · preciso · índigo',
    desc: 'Slate azulado, tipografía geométrica (Space Grotesk) y un sutil halo de acento. Evoluciona el estilo Linear hacia algo más afilado.',
    defaultAccent: 'indigo',
  },
  {
    id: 'calido',
    name: 'Cálido',
    tagline: 'Editorial · sereno · ámbar',
    desc: 'Graphite/papel templado, titulares en serif (Fraunces) y radios más suaves. Más cercano a Notion, con personalidad humana.',
    defaultAccent: 'ambar',
  },
]

// Contraste automático para acentos personalizados.
export function fgForHsl(h, s, l) {
  // Luminancia aproximada a partir de HSL.
  const lum = l / 100
  const sat = s / 100
  const boost = sat > 0.5 && h > 30 && h < 210 ? 0.14 : 0
  return lum + boost >= 0.6 ? '187 100% 7%' : '0 0% 100%'
}

export function customAccent(h, s = 72, l = 60) {
  return {
    id: 'custom',
    name: 'Personalizado',
    hsl: `${h} ${s}% ${l}%`,
    fg: fgForHsl(h, s, l),
  }
}

export function resolveMode(mode) {
  if (mode === 'system') {
    return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark'
  }
  return mode
}

export function applyTheme(settings) {
  const root = document.documentElement
  root.setAttribute('data-mode', resolveMode(settings.mode))
  root.setAttribute('data-direction', settings.direction)
  if (settings.accent) {
    root.style.setProperty('--accent', settings.accent.hsl)
    root.style.setProperty('--accent-fg', settings.accent.fg)
  }
  const meta = document.querySelector('meta[name="theme-color"]')
  if (meta) meta.setAttribute('content', resolveMode(settings.mode) === 'dark' ? '#0a0b10' : '#f8fafb')
}
