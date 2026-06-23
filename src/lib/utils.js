// Utilidades varias.

export function cx(...args) {
  return args
    .flat()
    .filter(Boolean)
    .join(' ')
}

const EUR = new Intl.NumberFormat('es-ES', {
  style: 'currency',
  currency: 'EUR',
  maximumFractionDigits: 0,
})
const EUR2 = new Intl.NumberFormat('es-ES', {
  style: 'currency',
  currency: 'EUR',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

export const eur = (n) => EUR.format(n)
export const eur2 = (n) => EUR2.format(n)
export const signedEur = (n) => `${n > 0 ? '+' : n < 0 ? '−' : ''}${EUR.format(Math.abs(n))}`

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

export { DIAS, MESES }

export function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n))
}

export const uid = () => Math.random().toString(36).slice(2, 9)
