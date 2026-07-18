// ============================================================
// Summa · Metas
// Una meta puede ser manual (value/target) o VINCULADA a un dato
// real de la app: entonces su valor se calcula en vivo y no se
// desactualiza nunca.
// ============================================================
import { clamp, todayISO } from './utils'

const monthOf = (iso) => String(iso || '').slice(0, 7)
const quarterOf = (iso) => {
  const [y, m] = String(iso).split('-').map(Number)
  return `${y}-Q${Math.ceil(m / 3)}`
}

export const GOAL_METRICS = [
  { id: 'facturacion_mes', name: 'Facturación del mes (€)' },
  { id: 'facturacion_tri', name: 'Facturación del trimestre (€)' },
  { id: 'entrenos_mes', name: 'Entrenos este mes' },
  { id: 'ahorro_total', name: 'Ahorro acumulado (€)' },
  { id: 'patrimonio', name: 'Patrimonio neto (€)' },
]

export function metricValue(id, data = {}) {
  const movements = data.movements || []
  const workouts = data.workouts || []
  const savings = data.savings || []
  const holdings = data.holdings || []
  const hoy = todayISO()
  switch (id) {
    case 'facturacion_mes':
      return movements
        .filter((m) => Number(m.amount) > 0 && monthOf(m.date) === monthOf(hoy))
        .reduce((a, m) => a + Number(m.amount), 0)
    case 'facturacion_tri':
      return movements
        .filter((m) => Number(m.amount) > 0 && quarterOf(m.date) === quarterOf(hoy))
        .reduce((a, m) => a + Number(m.amount), 0)
    case 'entrenos_mes':
      return workouts.filter((w) => monthOf(w.date) === monthOf(hoy)).length
    case 'ahorro_total':
      return savings.reduce((a, s) => a + Number(s.value), 0)
    case 'patrimonio':
      return holdings.reduce((a, h) => a + (h.kind === 'liability' ? -Number(h.value) : Number(h.value)), 0)
    default:
      return 0
  }
}

export const goalValue = (g, data) => (g.metric ? metricValue(g.metric, data) : Number(g.value))

export function goalPct(g, data) {
  const v = goalValue(g, data)
  if (g.type === 'percent' && !g.metric) return clamp(Math.round(v), 0, 100)
  if (g.invert) return clamp(Math.round((Number(g.target) / Math.max(v, 1)) * 100), 0, 100)
  return clamp(Math.round((v / Math.max(Number(g.target), 1)) * 100), 0, 100)
}
