// ============================================================
// Summa · Multi-venture
// Un venture = un frente de tu vida/negocio (nombre, color, emoji).
// El etiquetado es OPCIONAL: una fila sin venture cuenta como
// "Personal", y quien no use ventures no los ve por ningún sitio.
// ============================================================
import { todayISO, weekStartsMonday } from './utils'

export const DEFAULT_VENTURES = [
  { id: 'alh', name: 'ALH Partners', color: '213 90% 58%', icon: '🤝' },
  { id: 'comercia', name: 'Comercia', color: '36 92% 55%', icon: '🛒' },
  { id: 'sedari', name: 'Sedari', color: '262 72% 64%', icon: '🧩' },
  { id: 'umbral', name: 'UMBRAL', color: '158 64% 44%', icon: '🚪', maxPct: 50 },
  { id: 'personal', name: 'Personal', color: '186 100% 50%', icon: '🌱', fixed: true },
]

export const venturesOf = (settings) =>
  Array.isArray(settings?.ventures) && settings.ventures.length ? settings.ventures : DEFAULT_VENTURES

export const ventureById = (settings, id) => {
  const list = venturesOf(settings)
  return list.find((v) => v.id === id) || list.find((v) => v.id === 'personal') || list[0]
}

// id efectivo de una fila: sin etiqueta (o venture borrado) = personal
export const rowVenture = (settings, row) => {
  const id = row?.venture || 'personal'
  return venturesOf(settings).some((v) => v.id === id) ? id : 'personal'
}

// Filtro por chip: 'todos' | ventureId
export const ventureFilter = (settings, rows, sel) =>
  !sel || sel === 'todos' ? rows : rows.filter((r) => rowVenture(settings, r) === sel)

// ¿Hay alguna fila etiquetada (≠ personal)? Si no, los chips no se muestran.
export const anyTagged = (rows) => rows.some((r) => r.venture && r.venture !== 'personal')

// Ventures presentes en un conjunto de filas (para pintar solo chips útiles)
export function usedVentures(settings, rows) {
  const ids = new Set(rows.map((r) => rowVenture(settings, r)))
  return venturesOf(settings).filter((v) => ids.has(v.id))
}

// ---------- Time tracking ligero (vive en settings.timeLog) ----------
// Entrada: { id, venture, mins, date }
export function weekRange(d = new Date()) {
  const day = d.getDay()
  const offset = weekStartsMonday() ? (day + 6) % 7 : day
  const from = new Date(d)
  from.setDate(d.getDate() - offset)
  const to = new Date(from)
  to.setDate(from.getDate() + 6)
  const iso = (x) => {
    const y = new Date(x)
    y.setMinutes(y.getMinutes() - y.getTimezoneOffset())
    return y.toISOString().slice(0, 10)
  }
  return { from: iso(from), to: iso(to) }
}

// Reparto de la semana actual en % por venture (solo ventures con tiempo)
export function weekShare(settings) {
  const log = Array.isArray(settings?.timeLog) ? settings.timeLog : []
  const { from, to } = weekRange()
  const mins = {}
  let total = 0
  for (const e of log) {
    const d = String(e.date || '').slice(0, 10)
    if (d < from || d > to) continue
    const id = venturesOf(settings).some((v) => v.id === e.venture) ? e.venture : 'personal'
    mins[id] = (mins[id] || 0) + Number(e.mins || 0)
    total += Number(e.mins || 0)
  }
  const parts = venturesOf(settings)
    .filter((v) => mins[v.id])
    .map((v) => ({
      venture: v,
      mins: mins[v.id],
      pct: total ? Math.round((mins[v.id] / total) * 100) : 0,
      over: v.maxPct != null && total > 0 && (mins[v.id] / total) * 100 > v.maxPct,
    }))
  return { total, parts }
}

// Registrar un bloque (devuelve el timeLog nuevo, recortado a 120 días)
export function addTimeBlock(settings, { venture, mins, date }) {
  const log = Array.isArray(settings?.timeLog) ? settings.timeLog : []
  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - 120)
  const min = cutoff.toISOString().slice(0, 10)
  return [
    ...log.filter((e) => String(e.date || '').slice(0, 10) >= min),
    { id: Math.random().toString(36).slice(2, 9), venture, mins: Number(mins), date: date || todayISO() },
  ]
}
