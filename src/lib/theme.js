// ============================================================
// Summa · Motor de temas
// Un preset = tema completo (superficies, texto, acento, viz,
// fuente, radios, sombras y fondo) con variante clara y oscura.
// "Eléctrico" reproduce píxel a píxel el diseño de serie.
// La resolución final se cachea en summa:boot-theme para que
// index.html la reponga antes del primer pintado (sin FOUC).
// ============================================================

// ---------- Utilidades de color ----------
export function hslToRgb(h, s, l) {
  s /= 100
  l /= 100
  const k = (n) => (n + h / 30) % 12
  const a = s * Math.min(l, 1 - l)
  const f = (n) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)))
  return [f(0), f(8), f(4)].map((v) => Math.round(v * 255))
}

export function hslToHex(triplet) {
  const [h, s, l] = parseTriplet(triplet)
  return (
    '#' +
    hslToRgb(h, s, l)
      .map((v) => v.toString(16).padStart(2, '0'))
      .join('')
  )
}

export function hexToHsl(hex) {
  let c = hex.replace('#', '')
  if (c.length === 3) c = c.split('').map((x) => x + x).join('')
  const r = parseInt(c.slice(0, 2), 16) / 255
  const g = parseInt(c.slice(2, 4), 16) / 255
  const b = parseInt(c.slice(4, 6), 16) / 255
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const l = (max + min) / 2
  let h = 0
  let s = 0
  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) * 60
    else if (max === g) h = ((b - r) / d + 2) * 60
    else h = ((r - g) / d + 4) * 60
  }
  return `${Math.round(h)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`
}

export function parseTriplet(t) {
  const m = String(t).trim().match(/^([\d.]+)\s+([\d.]+)%\s+([\d.]+)%$/)
  return m ? [Number(m[1]), Number(m[2]), Number(m[3])] : [0, 0, 0]
}

function relLuminance(triplet) {
  const [h, s, l] = parseTriplet(triplet)
  const lin = hslToRgb(h, s, l).map((v) => {
    const c = v / 255
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
  })
  return 0.2126 * lin[0] + 0.7152 * lin[1] + 0.0722 * lin[2]
}

// Ratio de contraste WCAG entre dos tripletas HSL (1..21)
export function contrastRatio(a, b) {
  const la = relLuminance(a)
  const lb = relLuminance(b)
  const [hi, lo] = la >= lb ? [la, lb] : [lb, la]
  return (hi + 0.05) / (lo + 0.05)
}

// Texto legible sobre un color: tinta oscura o blanco, por contraste real.
const DARK_INK = '220 40% 8%'
export function fgForTriplet(triplet) {
  return contrastRatio(triplet, DARK_INK) >= contrastRatio(triplet, '0 0% 100%')
    ? DARK_INK
    : '0 0% 100%'
}

// Compat: firma antigua (h, s, l)
export function fgForHsl(h, s, l) {
  return fgForTriplet(`${h} ${s}% ${l}%`)
}

export function customAccent(h, s = 72, l = 60) {
  const hsl = `${h} ${s}% ${l}%`
  return { id: 'custom', name: 'Personalizado', hsl, fg: fgForTriplet(hsl) }
}

// ---------- Acentos rápidos ----------
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

// ---------- Tipografías (carga bajo demanda) ----------
// Geist y JetBrains Mono van estáticas en index.css; el resto se
// importa dinámicamente (Vite trocea el CSS por familia).
export const FAMILIES = [
  { id: 'geist', name: 'Geist', hint: 'La de serie', css: "'Geist Variable', ui-sans-serif, system-ui, sans-serif", load: null },
  { id: 'inter', name: 'Inter', hint: 'Neutra y versátil', css: "'Inter Variable', ui-sans-serif, system-ui, sans-serif", load: () => import('@fontsource-variable/inter') },
  { id: 'hanken', name: 'Hanken Grotesk', hint: 'Humanista elegante', css: "'Hanken Grotesk Variable', ui-sans-serif, system-ui, sans-serif", load: () => import('@fontsource-variable/hanken-grotesk') },
  { id: 'space', name: 'Space Grotesk', hint: 'Geométrica con carácter', css: "'Space Grotesk Variable', ui-sans-serif, system-ui, sans-serif", load: () => import('@fontsource-variable/space-grotesk') },
  { id: 'nunito', name: 'Nunito Sans', hint: 'Redonda y amable', css: "'Nunito Sans Variable', ui-sans-serif, system-ui, sans-serif", load: () => import('@fontsource-variable/nunito-sans') },
  { id: 'serif', name: 'Source Serif', hint: 'Serif de lectura', css: "'Source Serif 4 Variable', Georgia, 'Times New Roman', serif", load: () => import('@fontsource-variable/source-serif-4') },
  { id: 'fraunces', name: 'Fraunces', hint: 'Serif editorial', css: "'Fraunces Variable', Georgia, serif", load: () => import('@fontsource-variable/fraunces') },
  { id: 'mono', name: 'JetBrains Mono', hint: 'Todo monoespaciado', css: "'JetBrains Mono Variable', ui-monospace, monospace", load: null },
  { id: 'system', name: 'Sistema', hint: 'La de tu dispositivo, 0 descarga', css: "ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif", load: null },
]

const loadedFonts = new Set(['geist', 'mono', 'system'])
export async function loadFont(id) {
  const fam = FAMILIES.find((f) => f.id === id)
  if (!fam || loadedFonts.has(id) || !fam.load) return
  loadedFonts.add(id)
  try {
    await fam.load()
  } catch {
    loadedFonts.delete(id)
  }
}

// ---------- Opciones de forma y sensación ----------
export const DENSITIES = [
  { id: 'compacta', name: 'Compacta', space: 0.875 },
  { id: 'normal', name: 'Normal', space: 1 },
  { id: 'comoda', name: 'Cómoda', space: 1.1 },
]
export const ANIMS = [
  { id: 'completas', name: 'Completas' },
  { id: 'reducidas', name: 'Reducidas' },
  { id: 'ninguna', name: 'Ninguna' },
]
export const BORDER_WIDTHS = [
  { id: 'fino', name: 'Fino', px: '1px' },
  { id: 'medio', name: 'Medio', px: '1.5px' },
  { id: 'grueso', name: 'Grueso', px: '2px' },
]
export const HEADING_WEIGHTS = [
  { id: 'ligero', name: 'Ligero', w: 600 },
  { id: 'normal', name: 'Normal', w: 700 },
  { id: 'fuerte', name: 'Fuerte', w: 800 },
]
export const SHADOW_STYLES = [
  { id: 'glow', name: 'Brillo' },
  { id: 'soft', name: 'Suave' },
  { id: 'flat', name: 'Plana' },
]
export const BG_FX = [
  { id: 'blooms', name: 'Halos' },
  { id: 'solido', name: 'Sólido' },
  { id: 'degradado', name: 'Degradado' },
  { id: 'malla', name: 'Malla' },
  { id: 'puntos', name: 'Puntos' },
]

// ---------- Semánticos base (cualquier preset puede matizarlos) ----------
const SEMANTICS = {
  success: '152 56% 46%',
  warning: '38 92% 55%',
  danger: '358 70% 60%',
  info: '213 90% 62%',
}

// ---------- Sombras por estilo y modo ----------
function shadowSet(style, mode) {
  if (style === 'flat') {
    return {
      '--shadow-xs': 'none',
      '--shadow-sm': 'none',
      '--shadow': 'none',
      '--shadow-lg': mode === 'dark' ? '0 14px 34px -16px rgb(0 0 0 / 0.5)' : '0 14px 34px -18px rgb(16 24 40 / 0.12)',
      '--shadow-xl': mode === 'dark' ? '0 28px 56px -20px rgb(0 0 0 / 0.6)' : '0 28px 56px -22px rgb(16 24 40 / 0.16)',
      '--shadow-glow': '0 0 0 1px hsl(var(--accent) / 0.55)',
    }
  }
  const base =
    mode === 'dark'
      ? {
          '--shadow-xs': '0 1px 2px 0 rgb(0 0 0 / 0.4)',
          '--shadow-sm': '0 2px 4px -1px rgb(0 0 0 / 0.4), 0 1px 2px -1px rgb(0 0 0 / 0.5)',
          '--shadow': '0 10px 28px -8px rgb(0 0 0 / 0.55), 0 2px 6px -2px rgb(0 0 0 / 0.4)',
          '--shadow-lg': '0 20px 44px -14px rgb(0 0 0 / 0.62), 0 4px 12px -4px rgb(0 0 0 / 0.5)',
          '--shadow-xl': '0 36px 70px -18px rgb(0 0 0 / 0.72)',
        }
      : {
          '--shadow-xs': '0 1px 2px 0 rgb(16 24 40 / 0.06)',
          '--shadow-sm': '0 1px 3px 0 rgb(16 24 40 / 0.08), 0 1px 2px -1px rgb(16 24 40 / 0.06)',
          '--shadow': '0 10px 28px -10px rgb(16 24 40 / 0.14), 0 2px 6px -2px rgb(16 24 40 / 0.06)',
          '--shadow-lg': '0 20px 44px -16px rgb(16 24 40 / 0.16)',
          '--shadow-xl': '0 36px 70px -20px rgb(16 24 40 / 0.2)',
        }
  const glow =
    style === 'glow'
      ? mode === 'dark'
        ? '0 0 0 1px hsl(var(--accent) / 0.45), 0 0 18px hsl(var(--accent) / 0.35), 0 0 44px -8px hsl(var(--accent) / 0.4)'
        : '0 0 0 1px hsl(var(--accent) / 0.28), 0 12px 30px -10px hsl(var(--accent) / 0.32)'
      : mode === 'dark'
        ? '0 0 0 1px hsl(var(--accent) / 0.35), 0 10px 26px -10px hsl(var(--accent) / 0.35)'
        : '0 0 0 1px hsl(var(--accent) / 0.25), 0 10px 26px -10px hsl(var(--accent) / 0.3)'
  return { ...base, '--shadow-glow': glow }
}

// ---------- Presets ----------
// Cada variante define: bg, surface, surface2, elevated, border,
// borderStrong, text, textMuted, textSubtle, accent, accentFg,
// viz[6] y opcionalmente semánticos.
export const PRESETS = [
  {
    id: 'electrico',
    name: 'Eléctrico',
    tagline: 'Cian sobre obsidiana — el Summa de serie',
    font: 'geist',
    radius: 6,
    shadow: 'glow',
    bgFx: 'blooms',
    dark: {
      bg: '228 23% 5%', surface: '225 20% 11%', surface2: '227 20% 14%', elevated: '228 19% 17%',
      border: '228 16% 19%', borderStrong: '227 12% 30%',
      text: '252 17% 90%', textMuted: '210 10% 70%', textSubtle: '214 8% 50%',
      accent: '186 100% 50%', accentFg: '187 100% 7%',
      viz: ['186 100% 50%', '258 100% 66%', '158 64% 48%', '36 92% 55%', '342 80% 62%', '213 90% 58%'],
    },
    light: {
      bg: '200 27% 98%', surface: '0 0% 100%', surface2: '200 13% 95%', elevated: '0 0% 100%',
      border: '195 6% 89%', borderStrong: '196 6% 76%',
      text: '195 8% 11%', textMuted: '196 12% 32%', textSubtle: '197 8% 46%',
      accent: '186 100% 50%', accentFg: '187 100% 7%',
      viz: ['187 92% 40%', '258 84% 60%', '158 60% 40%', '36 90% 48%', '342 74% 54%', '213 85% 50%'],
    },
  },
  {
    id: 'ejecutivo',
    name: 'Ejecutivo',
    tagline: 'Índigo profundo y Hanken — precisión clásica',
    font: 'hanken',
    radius: 10,
    shadow: 'soft',
    bgFx: 'blooms',
    dark: {
      bg: '225 22% 6%', surface: '225 18% 10%', surface2: '225 17% 13%', elevated: '225 16% 16%',
      border: '225 14% 19%', borderStrong: '225 11% 31%',
      text: '227 18% 91%', textMuted: '226 10% 69%', textSubtle: '226 7% 49%',
      accent: '243 76% 64%', accentFg: '0 0% 100%',
      viz: ['243 76% 64%', '188 78% 50%', '158 64% 48%', '36 92% 55%', '342 80% 62%', '262 72% 64%'],
    },
    light: {
      bg: '228 30% 98%', surface: '0 0% 100%', surface2: '227 20% 95%', elevated: '0 0% 100%',
      border: '227 12% 89%', borderStrong: '227 10% 77%',
      text: '228 15% 12%', textMuted: '227 10% 34%', textSubtle: '227 7% 48%',
      accent: '243 70% 58%', accentFg: '0 0% 100%',
      viz: ['243 70% 58%', '188 74% 40%', '158 60% 40%', '36 90% 48%', '342 74% 54%', '262 64% 56%'],
    },
  },
  {
    id: 'noche',
    name: 'Noche',
    tagline: 'Negro OLED con azul hielo',
    font: 'inter',
    radius: 8,
    shadow: 'flat',
    bgFx: 'solido',
    dark: {
      bg: '0 0% 0%', surface: '240 5% 6%', surface2: '240 5% 9%', elevated: '240 5% 12%',
      border: '240 5% 14%', borderStrong: '240 4% 27%',
      text: '220 15% 92%', textMuted: '222 8% 68%', textSubtle: '223 6% 47%',
      accent: '199 95% 60%', accentFg: '204 100% 8%',
      viz: ['199 95% 60%', '258 90% 68%', '158 60% 50%', '38 92% 56%', '340 80% 64%', '60 90% 55%'],
    },
    light: {
      bg: '220 15% 97%', surface: '0 0% 100%', surface2: '220 12% 94%', elevated: '0 0% 100%',
      border: '220 8% 88%', borderStrong: '220 7% 76%',
      text: '222 12% 12%', textMuted: '221 8% 34%', textSubtle: '221 6% 48%',
      accent: '201 90% 40%', accentFg: '0 0% 100%',
      viz: ['201 90% 40%', '258 80% 60%', '158 58% 38%', '38 90% 46%', '340 72% 54%', '60 70% 38%'],
    },
  },
  {
    id: 'papel',
    name: 'Papel',
    tagline: 'Crema cálida con titulares serif',
    font: 'nunito',
    displayFont: 'fraunces',
    radius: 12,
    shadow: 'soft',
    bgFx: 'solido',
    dark: {
      bg: '32 14% 8%', surface: '33 13% 11%', surface2: '33 12% 14%', elevated: '32 11% 17%',
      border: '33 11% 19%', borderStrong: '34 9% 32%',
      text: '38 25% 88%', textMuted: '36 12% 66%', textSubtle: '36 9% 48%',
      accent: '24 70% 56%', accentFg: '20 80% 8%',
      viz: ['24 70% 56%', '200 45% 55%', '150 40% 50%', '45 80% 55%', '340 50% 60%', '262 40% 62%'],
    },
    light: {
      bg: '42 42% 96%', surface: '45 50% 99%', surface2: '42 30% 92%', elevated: '45 50% 99%',
      border: '40 22% 85%', borderStrong: '40 16% 71%',
      text: '32 18% 14%', textMuted: '33 10% 36%', textSubtle: '34 8% 50%',
      accent: '18 65% 46%', accentFg: '0 0% 100%',
      viz: ['18 65% 46%', '200 45% 42%', '150 42% 36%', '42 85% 44%', '340 50% 52%', '262 40% 55%'],
    },
  },
  {
    id: 'bosque',
    name: 'Bosque',
    tagline: 'Verdes profundos y musgo',
    font: 'nunito',
    radius: 10,
    shadow: 'soft',
    bgFx: 'degradado',
    dark: {
      bg: '160 22% 5%', surface: '158 18% 9%', surface2: '157 16% 12%', elevated: '156 15% 15%',
      border: '156 13% 17%', borderStrong: '153 10% 30%',
      text: '140 14% 90%', textMuted: '142 8% 66%', textSubtle: '143 6% 47%',
      accent: '95 55% 55%', accentFg: '100 70% 7%',
      viz: ['95 55% 55%', '38 90% 55%', '170 60% 45%', '200 70% 55%', '340 60% 58%', '58 70% 52%'],
    },
    light: {
      bg: '110 25% 97%', surface: '0 0% 100%', surface2: '110 16% 93%', elevated: '0 0% 100%',
      border: '110 10% 86%', borderStrong: '112 8% 72%',
      text: '150 20% 10%', textMuted: '148 10% 32%', textSubtle: '146 7% 46%',
      accent: '140 45% 34%', accentFg: '0 0% 100%',
      viz: ['140 45% 34%', '38 88% 46%', '170 58% 34%', '200 68% 42%', '340 55% 50%', '58 60% 36%'],
    },
  },
  {
    id: 'terminal',
    name: 'Terminal',
    tagline: 'Fósforo verde, todo monoespaciado',
    font: 'mono',
    displayFont: 'mono',
    radius: 0,
    shadow: 'flat',
    bgFx: 'malla',
    dark: {
      bg: '150 10% 4%', surface: '150 9% 6%', surface2: '150 8% 9%', elevated: '150 8% 11%',
      border: '145 15% 15%', borderStrong: '140 15% 28%',
      text: '125 45% 78%', textMuted: '127 25% 58%', textSubtle: '128 15% 42%',
      accent: '130 90% 52%', accentFg: '140 100% 5%',
      viz: ['130 90% 52%', '170 80% 45%', '60 90% 50%', '95 70% 55%', '200 80% 55%', '32 90% 55%'],
      success: '130 90% 45%', warning: '55 95% 50%', danger: '5 90% 55%', info: '180 85% 50%',
    },
    light: {
      bg: '90 12% 95%', surface: '80 15% 98%', surface2: '85 10% 91%', elevated: '80 15% 98%',
      border: '90 8% 83%', borderStrong: '92 7% 68%',
      text: '140 60% 12%', textMuted: '138 25% 30%', textSubtle: '136 15% 44%',
      accent: '140 90% 26%', accentFg: '0 0% 100%',
      viz: ['140 90% 26%', '170 80% 30%', '60 90% 30%', '95 70% 32%', '200 80% 36%', '32 90% 38%'],
    },
  },
  {
    id: 'contraste',
    name: 'Alto contraste',
    tagline: 'Máxima legibilidad, AAA',
    font: 'system',
    radius: 4,
    shadow: 'flat',
    bgFx: 'solido',
    borderW: 'grueso',
    dark: {
      bg: '0 0% 0%', surface: '0 0% 5%', surface2: '0 0% 9%', elevated: '0 0% 12%',
      border: '0 0% 42%', borderStrong: '0 0% 62%',
      text: '0 0% 100%', textMuted: '0 0% 90%', textSubtle: '0 0% 76%',
      accent: '55 100% 55%', accentFg: '0 0% 0%',
      viz: ['55 100% 55%', '195 100% 60%', '130 100% 55%', '30 100% 60%', '320 100% 70%', '0 0% 100%'],
      success: '135 100% 45%', warning: '45 100% 50%', danger: '0 100% 62%', info: '200 100% 60%',
    },
    light: {
      bg: '0 0% 100%', surface: '0 0% 100%', surface2: '0 0% 94%', elevated: '0 0% 100%',
      border: '0 0% 35%', borderStrong: '0 0% 15%',
      text: '0 0% 0%', textMuted: '0 0% 15%', textSubtle: '0 0% 30%',
      accent: '243 100% 36%', accentFg: '0 0% 100%',
      viz: ['243 100% 36%', '195 100% 26%', '130 100% 22%', '25 100% 34%', '320 100% 30%', '0 0% 0%'],
      success: '140 100% 24%', warning: '35 100% 32%', danger: '0 100% 38%', info: '210 100% 34%',
    },
  },
  {
    id: 'amanecer',
    name: 'Amanecer',
    tagline: 'Coral y lila, luz templada',
    font: 'inter',
    radius: 14,
    shadow: 'soft',
    bgFx: 'degradado',
    dark: {
      bg: '278 22% 8%', surface: '277 19% 12%', surface2: '276 18% 15%', elevated: '275 17% 18%',
      border: '275 15% 21%', borderStrong: '274 11% 33%',
      text: '290 20% 91%', textMuted: '288 10% 68%', textSubtle: '287 7% 50%',
      accent: '340 90% 66%', accentFg: '345 100% 10%',
      viz: ['340 90% 66%', '268 70% 66%', '25 90% 60%', '200 70% 58%', '160 55% 50%', '315 60% 64%'],
    },
    light: {
      bg: '28 70% 97%', surface: '0 0% 100%', surface2: '26 50% 94%', elevated: '0 0% 100%',
      border: '25 30% 87%', borderStrong: '25 22% 72%',
      text: '335 30% 15%', textMuted: '330 12% 38%', textSubtle: '328 9% 52%',
      accent: '349 80% 56%', accentFg: '0 0% 100%',
      viz: ['349 80% 56%', '268 70% 58%', '25 90% 48%', '200 70% 44%', '160 55% 38%', '315 60% 52%'],
    },
  },
  {
    id: 'tinta',
    name: 'Tinta',
    tagline: 'Blanco y negro con un solo rojo',
    font: 'space',
    radius: 2,
    shadow: 'flat',
    bgFx: 'solido',
    dark: {
      bg: '0 0% 5%', surface: '0 0% 8%', surface2: '0 0% 11%', elevated: '0 0% 14%',
      border: '0 0% 17%', borderStrong: '0 0% 30%',
      text: '0 0% 94%', textMuted: '0 0% 68%', textSubtle: '0 0% 48%',
      accent: '358 75% 54%', accentFg: '0 0% 100%',
      viz: ['0 0% 85%', '358 75% 54%', '0 0% 60%', '0 0% 40%', '358 45% 40%', '0 0% 25%'],
    },
    light: {
      bg: '0 0% 99%', surface: '0 0% 100%', surface2: '0 0% 95%', elevated: '0 0% 100%',
      border: '0 0% 88%', borderStrong: '0 0% 70%',
      text: '0 0% 7%', textMuted: '0 0% 32%', textSubtle: '0 0% 47%',
      accent: '358 80% 46%', accentFg: '0 0% 100%',
      viz: ['0 0% 15%', '358 80% 46%', '0 0% 40%', '0 0% 60%', '358 50% 60%', '0 0% 75%'],
    },
  },
  {
    id: 'neon',
    name: 'Neón',
    tagline: 'Magenta y cian sobre violeta nocturno',
    font: 'space',
    radius: 10,
    shadow: 'glow',
    bgFx: 'blooms',
    dark: {
      bg: '260 35% 7%', surface: '259 30% 11%', surface2: '258 28% 14%', elevated: '257 26% 17%',
      border: '257 24% 21%', borderStrong: '256 18% 33%',
      text: '270 35% 92%', textMuted: '268 15% 70%', textSubtle: '266 10% 52%',
      accent: '320 95% 64%', accentFg: '325 100% 9%',
      viz: ['320 95% 64%', '190 95% 55%', '258 100% 70%', '60 95% 60%', '150 80% 55%', '30 95% 60%'],
    },
    light: {
      bg: '262 45% 97%', surface: '0 0% 100%', surface2: '260 35% 94%', elevated: '0 0% 100%',
      border: '258 22% 88%', borderStrong: '257 16% 74%',
      text: '262 30% 14%', textMuted: '260 12% 36%', textSubtle: '258 9% 50%',
      accent: '315 85% 45%', accentFg: '0 0% 100%',
      viz: ['315 85% 45%', '190 90% 32%', '258 85% 56%', '55 80% 34%', '150 70% 32%', '30 90% 42%'],
    },
  },
]

export const DEFAULT_PRESET = 'electrico'

export function getPreset(id) {
  return PRESETS.find((p) => p.id === id) || PRESETS[0]
}

// ---------- Modo ----------
export function resolveMode(mode) {
  if (mode === 'system') {
    return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark'
  }
  if (mode === 'franja') {
    const h = new Date().getHours()
    return h >= 7 && h < 21 ? 'light' : 'dark'
  }
  return mode === 'light' ? 'light' : 'dark'
}

// ---------- Resolución de tokens ----------
// Orden de fusión: preset[modo] → acento rápido → ediciones del
// editor de tema (themeOverrides[modo]). Devuelve el mapa completo
// de variables CSS + metadatos para el boot y el navegador.
export function resolveTokens(settings, mode, route) {
  const preset = getPreset(settings.preset || DEFAULT_PRESET)
  const base = { ...SEMANTICS, ...preset[mode] }
  const over = settings.themeOverrides?.[mode] || {}
  const t = { ...base, ...over }

  // Acento: módulo actual > editor > acento rápido > preset
  let accent = t.accent
  let accentFg = t.accentFg
  if (!over.accent && settings.accent?.hsl) {
    accent = settings.accent.hsl
    accentFg = settings.accent.fg || fgForTriplet(accent)
  }
  const modAccent = route && settings.moduleAccents?.[route]
  if (modAccent?.hsl) {
    accent = modAccent.hsl
    accentFg = modAccent.fg || fgForTriplet(accent)
  }

  const fontId = settings.font || preset.font
  const displayId = settings.font ? settings.font : preset.displayFont || preset.font
  const font = FAMILIES.find((f) => f.id === fontId) || FAMILIES[0]
  const display = FAMILIES.find((f) => f.id === displayId) || font

  const radius = settings.radius ?? preset.radius
  const shadowStyle = settings.shadow || preset.shadow
  const density = DENSITIES.find((d) => d.id === (settings.density || 'normal')) || DENSITIES[1]
  const borderW = BORDER_WIDTHS.find((b) => b.id === (settings.borderW || preset.borderW || 'fino')) || BORDER_WIDTHS[0]
  const headingW = HEADING_WEIGHTS.find((h) => h.id === (settings.headingWeight || 'normal')) || HEADING_WEIGHTS[1]
  const viz = t.viz || PRESETS[0][mode].viz

  const vars = {
    '--bg': t.bg,
    '--surface': t.surface,
    '--surface-2': t.surface2,
    '--elevated': t.elevated,
    '--border': t.border,
    '--border-strong': t.borderStrong,
    '--text': t.text,
    '--text-muted': t.textMuted,
    '--text-subtle': t.textSubtle,
    '--accent': accent,
    '--accent-fg': accentFg,
    '--success': t.success,
    '--warning': t.warning,
    '--danger': t.danger,
    '--info': t.info,
    '--viz-1': viz[0],
    '--viz-2': viz[1],
    '--viz-3': viz[2],
    '--viz-4': viz[3],
    '--viz-5': viz[4],
    '--viz-6': viz[5],
    '--radius': `${radius}px`,
    '--border-w': borderW.px,
    '--space': String(density.space),
    '--heading-weight': String(headingW.w),
    '--font-sans': font.css,
    '--font-display': display.css,
    '--font-mono': FAMILIES.find((f) => f.id === 'mono').css,
    ...shadowSet(shadowStyle, mode),
  }

  return {
    vars,
    mode,
    attrs: {
      'data-mode': mode,
      'data-anim': settings.anim || 'completas',
      'data-bgfx': settings.bgFx || preset.bgFx || 'blooms',
    },
    themeColor: hslToHex(t.bg),
    fonts: [fontId, displayId],
  }
}

// ---------- "Sorpréndeme": tema aleatorio con armonía real ----------
// Elige un tono base y un esquema de color (análogo, complementario,
// triádico o split), construye superficies y texto con luminosidades
// seguras y valida el contraste — nunca devuelve ruido ilegible.
const SCHEMES = [
  { id: 'analogo', name: 'análogo', dh: 35 },
  { id: 'complementario', name: 'complementario', dh: 180 },
  { id: 'triadico', name: 'triádico', dh: 120 },
  { id: 'split', name: 'split', dh: 150 },
]
const rnd = (a, b) => a + Math.random() * (b - a)
const ri = (a, b) => Math.round(rnd(a, b))

export function surpriseTheme() {
  const h = ri(0, 359)
  const scheme = SCHEMES[ri(0, SCHEMES.length - 1)]
  const h2 = (h + scheme.dh + ri(-12, 12) + 360) % 360
  const sBg = ri(10, 26)

  // Acento: saturado y con luminosidad media-alta; el texto encima
  // lo decide fgForTriplet por contraste real.
  const accD = `${h2} ${ri(72, 98)}% ${ri(52, 64)}%`
  const accL = `${h2} ${ri(65, 92)}% ${ri(34, 46)}%`

  const vizFrom = (base, sat, lumD, lumL, mode) =>
    [0, 1, 2, 3, 4, 5].map((i) => {
      const hh = (base + i * 55) % 360
      return `${hh} ${sat}% ${mode === 'dark' ? lumD : lumL}%`
    })

  const dark = {
    bg: `${h} ${sBg}% ${ri(4, 7)}%`,
    surface: `${h} ${Math.max(8, sBg - 4)}% ${ri(9, 12)}%`,
    surface2: `${h} ${Math.max(7, sBg - 5)}% ${ri(13, 15)}%`,
    elevated: `${h} ${Math.max(6, sBg - 6)}% ${ri(16, 18)}%`,
    border: `${h} ${Math.max(6, sBg - 6)}% ${ri(18, 21)}%`,
    borderStrong: `${h} ${Math.max(5, sBg - 8)}% ${ri(29, 33)}%`,
    text: `${h} ${ri(10, 20)}% ${ri(89, 93)}%`,
    textMuted: `${h} ${ri(6, 12)}% ${ri(66, 71)}%`,
    textSubtle: `${h} ${ri(4, 9)}% ${ri(46, 52)}%`,
    accent: accD,
    accentFg: fgForTriplet(accD),
    viz: vizFrom(h2, ri(70, 90), ri(55, 62), 0, 'dark'),
  }
  const light = {
    bg: `${h} ${ri(20, 45)}% ${ri(96, 98)}%`,
    surface: '0 0% 100%',
    surface2: `${h} ${ri(12, 25)}% ${ri(92, 94)}%`,
    elevated: '0 0% 100%',
    border: `${h} ${ri(8, 16)}% ${ri(86, 89)}%`,
    borderStrong: `${h} ${ri(6, 12)}% ${ri(72, 77)}%`,
    text: `${h} ${ri(10, 25)}% ${ri(10, 14)}%`,
    textMuted: `${h} ${ri(6, 14)}% ${ri(32, 38)}%`,
    textSubtle: `${h} ${ri(5, 10)}% ${ri(46, 52)}%`,
    accent: accL,
    accentFg: fgForTriplet(accL),
    viz: vizFrom(h2, ri(60, 85), 0, ri(34, 44), 'light'),
  }

  // Garantía de legibilidad: si algún par clave no llega a AA, se corrige.
  if (contrastRatio(dark.text, dark.bg) < 7) dark.text = `${h} 15% 92%`
  if (contrastRatio(light.text, light.bg) < 7) light.text = `${h} 20% 12%`

  return {
    name: `Tono ${h2}º ${scheme.name}`,
    overrides: { dark, light },
    radius: [0, 4, 6, 8, 10, 12, 14, 16][ri(0, 7)],
    shadow: SHADOW_STYLES[ri(0, 2)].id,
    bgFx: BG_FX[ri(0, BG_FX.length - 1)].id,
  }
}

// ---------- Exportar / importar tema como JSON ----------
const TRIPLET_RE = /^[\d.]{1,6} [\d.]{1,5}% [\d.]{1,5}%$/
const TOKEN_KEYS = [
  'bg', 'surface', 'surface2', 'elevated', 'border', 'borderStrong',
  'text', 'textMuted', 'textSubtle', 'accent', 'accentFg',
  'success', 'warning', 'danger', 'info',
]

export function exportTheme(settings) {
  return {
    kind: 'summa-theme',
    version: 1,
    preset: settings.preset || DEFAULT_PRESET,
    accent: settings.accent || null,
    themeOverrides: settings.themeOverrides || {},
    font: settings.font || null,
    radius: settings.radius ?? null,
    shadow: settings.shadow || null,
    borderW: settings.borderW || null,
    headingWeight: settings.headingWeight || null,
    density: settings.density || 'normal',
    anim: settings.anim || 'completas',
    bgFx: settings.bgFx || null,
  }
}

// Validación estricta: nunca se aplica un JSON malformado.
// Devuelve el parche de ajustes limpio o lanza un Error legible.
export function validateTheme(parsed) {
  if (!parsed || typeof parsed !== 'object') throw new Error('No es un JSON válido')
  if (parsed.kind !== 'summa-theme') throw new Error('No es un archivo de tema de Summa')
  const out = {}

  out.preset = PRESETS.some((p) => p.id === parsed.preset) ? parsed.preset : DEFAULT_PRESET

  if (parsed.accent && typeof parsed.accent === 'object' && TRIPLET_RE.test(parsed.accent.hsl || '')) {
    out.accent = {
      id: 'custom',
      name: 'Personalizado',
      hsl: parsed.accent.hsl,
      fg: TRIPLET_RE.test(parsed.accent.fg || '') ? parsed.accent.fg : fgForTriplet(parsed.accent.hsl),
    }
  } else {
    out.accent = null
  }

  const cleanTokens = (o) => {
    if (!o || typeof o !== 'object') return {}
    const t = {}
    for (const k of TOKEN_KEYS) if (TRIPLET_RE.test(o[k] || '')) t[k] = o[k]
    if (Array.isArray(o.viz)) {
      const viz = o.viz.filter((v) => TRIPLET_RE.test(v || '')).slice(0, 6)
      if (viz.length === 6) t.viz = viz
    }
    return t
  }
  out.themeOverrides = {
    dark: cleanTokens(parsed.themeOverrides?.dark),
    light: cleanTokens(parsed.themeOverrides?.light),
  }

  out.font = FAMILIES.some((f) => f.id === parsed.font) ? parsed.font : null
  out.radius = Number.isFinite(parsed.radius) ? Math.max(0, Math.min(24, Math.round(parsed.radius))) : null
  out.shadow = SHADOW_STYLES.some((s) => s.id === parsed.shadow) ? parsed.shadow : null
  out.borderW = BORDER_WIDTHS.some((b) => b.id === parsed.borderW) ? parsed.borderW : null
  out.headingWeight = HEADING_WEIGHTS.some((hw) => hw.id === parsed.headingWeight) ? parsed.headingWeight : null
  out.density = DENSITIES.some((d) => d.id === parsed.density) ? parsed.density : 'normal'
  out.anim = ANIMS.some((a) => a.id === parsed.anim) ? parsed.anim : 'completas'
  out.bgFx = BG_FX.some((b) => b.id === parsed.bgFx) ? parsed.bgFx : null

  return out
}

const BOOT_KEY = 'summa:boot-theme'

// ---------- Aplicación al DOM ----------
export function applyTheme(settings, route) {
  const resolved = resolveTokens(settings, resolveMode(settings.mode), route)
  const root = document.documentElement

  for (const [k, v] of Object.entries(resolved.attrs)) root.setAttribute(k, v)
  root.removeAttribute('data-direction') // limpieza del sistema antiguo
  for (const [k, v] of Object.entries(resolved.vars)) root.style.setProperty(k, v)

  const meta = document.querySelector('meta[name="theme-color"]')
  if (meta) meta.setAttribute('content', resolved.themeColor)

  resolved.fonts.forEach((id) => loadFont(id))

  // Caché para que index.html reponga el tema antes del primer pintado.
  try {
    localStorage.setItem(
      BOOT_KEY,
      JSON.stringify({ vars: resolved.vars, attrs: resolved.attrs, themeColor: resolved.themeColor })
    )
  } catch {}
}
