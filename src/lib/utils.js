// Utilidades varias.

export function cx(...args) {
  return args
    .flat()
    .filter(Boolean)
    .join(' ')
}

// Dinero configurable: moneda + formato de números + modo privacidad.
let MONEY = { currency: 'EUR', privacy: false, locale: 'es-ES' }
const fmtCache = {}
function moneyFmt(min, max) {
  const k = `${MONEY.locale}-${MONEY.currency}-${min}-${max}`
  return (fmtCache[k] ||= new Intl.NumberFormat(MONEY.locale, {
    style: 'currency',
    currency: MONEY.currency,
    minimumFractionDigits: min,
    maximumFractionDigits: max,
  }))
}
export const configureMoney = (c) => {
  MONEY = { ...MONEY, ...c }
}

// Preferencias regionales: formato de hora y primer día de la semana.
let LOCALE = { timeFormat: '24h', weekStart: 'lunes' }
export const configureLocale = (c) => {
  LOCALE = { ...LOCALE, ...c }
}
export const weekStartsMonday = () => LOCALE.weekStart !== 'domingo'

// "13:30" → "1:30 PM" si el usuario prefiere 12 h.
export function fmtTime(t) {
  if (!t) return t
  if (LOCALE.timeFormat !== '12h') return t
  const m = String(t).match(/^(\d{1,2}):(\d{2})$/)
  if (!m) return t
  let h = Number(m[1])
  const suffix = h >= 12 ? 'PM' : 'AM'
  h = h % 12 || 12
  return `${h}:${m[2]} ${suffix}`
}
const HIDDEN = '•••••'
export const eur = (n) => (MONEY.privacy ? HIDDEN : moneyFmt(0, 0).format(n))
export const eur2 = (n) => (MONEY.privacy ? HIDDEN : moneyFmt(2, 2).format(n))
export const signedEur = (n) =>
  MONEY.privacy ? HIDDEN : `${n > 0 ? '+' : n < 0 ? '−' : ''}${moneyFmt(0, 0).format(Math.abs(n))}`

export const pct = (n) => `${Math.round(n)}%`

export function capitalize(s) {
  return s ? s[0].toUpperCase() + s.slice(1) : s
}

const DIAS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado']
const MESES = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
]

export function longDate(d = new Date()) {
  return `${DIAS[d.getDay()]}, ${d.getDate()} de ${MESES[d.getMonth()]}`
}

export function saludo(d = new Date()) {
  const h = d.getHours()
  if (h < 6) return 'Aún en pie'
  if (h < 13) return 'Buenos días'
  if (h < 20) return 'Buenas tardes'
  return 'Buenas noches'
}

// Saludo personalizable con variables: {nombre}, {fecha}, {hora}.
// Con plantilla vacía se usa el saludo automático de siempre.
export function renderGreeting(template, name, d = new Date()) {
  const t = String(template || '').trim()
  if (!t) return `${saludo(d)}${name ? `, ${name}` : ''}.`
  const hh = String(d.getHours()).padStart(2, '0')
  const mm = String(d.getMinutes()).padStart(2, '0')
  return t
    .replaceAll('{nombre}', name || '')
    .replaceAll('{fecha}', capitalize(longDate(d)))
    .replaceAll('{hora}', `${hh}:${mm}`)
    .replace(/\s{2,}/g, ' ')
    .trim()
}

export { DIAS, MESES }

export function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n))
}

export const uid = () => Math.random().toString(36).slice(2, 9)

const MES_ABBR = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']

export function todayISO() {
  const d = new Date()
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset())
  return d.toISOString().slice(0, 10)
}

// "2026-06-23" → "23 jun"
export function isoShort(iso) {
  if (!iso) return ''
  const [y, m, d] = String(iso).slice(0, 10).split('-').map(Number)
  return `${d} ${MES_ABBR[(m || 1) - 1]}`
}

function isoOf(d) {
  const x = new Date(d)
  x.setMinutes(x.getMinutes() - x.getTimezoneOffset())
  return x.toISOString().slice(0, 10)
}

// ---- Tareas: fecha límite ----
const ISO_RE = /^\d{4}-\d{2}-\d{2}$/
export const isISODate = (s) => ISO_RE.test(String(s || ''))

// Vencida: fecha límite pasada (o marcada a mano) y sin completar
export function taskOverdue(t) {
  if (t.status === 'done') return false
  if (isISODate(t.due)) return t.due < todayISO()
  return Boolean(t.overdue)
}
// De hoy: marcada para hoy o con fecha límite hoy
export function taskToday(t) {
  return Boolean(t.today) || (isISODate(t.due) && t.due === todayISO())
}
// Etiqueta corta de la fecha límite
export function taskDueLabel(t) {
  if (isISODate(t.due)) return relDay(t.due)
  return t.due || ''
}

// Etiqueta relativa: Hoy / Ayer / "23 jun"
export function relDay(iso) {
  if (!iso) return ''
  const key = String(iso).slice(0, 10)
  if (key === todayISO()) return 'Hoy'
  const y = new Date()
  y.setDate(y.getDate() - 1)
  if (key === isoOf(y)) return 'Ayer'
  return isoShort(iso)
}
