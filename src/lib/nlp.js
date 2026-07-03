// Captura con lenguaje natural: "Llamar a Alpha mañana !alta #consultoría"
// → fecha límite, prioridad y proyecto detectados; el título queda limpio.
import { todayISO } from './utils'

const DOW = { lunes: 1, martes: 2, miércoles: 3, miercoles: 3, jueves: 4, viernes: 5, sábado: 6, sabado: 6, domingo: 0 }

function iso(d) {
  const x = new Date(d)
  x.setMinutes(x.getMinutes() - x.getTimezoneOffset())
  return x.toISOString().slice(0, 10)
}

export function parseTask(text, projects = []) {
  let title = ` ${text} `
  const out = { due: null, priority: null, projectId: null, chips: [] }

  // Prioridad: !alta / !media / !baja
  const pr = title.match(/\s!(alta|media|baja)\b/i)
  if (pr) {
    out.priority = pr[1].toLowerCase()
    out.chips.push({ k: 'prio', label: `! ${out.priority}` })
    title = title.replace(pr[0], ' ')
  }

  // Proyecto: #texto (coincide por prefijo, sin tildes ni mayúsculas)
  const norm = (s) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
  const pj = title.match(/\s#([\wáéíóúñ·.-]+)/i)
  if (pj && projects.length) {
    const hit = projects.find((p) => norm(p.name).includes(norm(pj[1])))
    if (hit) {
      out.projectId = hit.id
      out.chips.push({ k: 'proj', label: `# ${hit.name}` })
      title = title.replace(pj[0], ' ')
    }
  }

  // Fecha: hoy / mañana / pasado mañana / día de la semana
  const dm = title.match(/\s(pasado mañana|mañana|hoy|lunes|martes|miércoles|miercoles|jueves|viernes|sábado|sabado|domingo)\b/i)
  if (dm) {
    const w = dm[1].toLowerCase()
    const d = new Date()
    if (w === 'mañana') d.setDate(d.getDate() + 1)
    else if (w === 'pasado mañana') d.setDate(d.getDate() + 2)
    else if (w !== 'hoy') {
      const target = DOW[w]
      let delta = (target - d.getDay() + 7) % 7
      if (delta === 0) delta = 7
      d.setDate(d.getDate() + delta)
    }
    out.due = iso(d)
    out.chips.push({ k: 'due', label: `📅 ${w} · ${out.due.slice(8, 10)}/${out.due.slice(5, 7)}` })
    title = title.replace(dm[0], ' ')
  }

  out.title = title.replace(/\s+/g, ' ').trim()
  return out
}

// ---- Recurrencia guardada como etiqueta (sin cambios de esquema) ----
export const RECUR_OPTIONS = [
  { value: '', label: 'No' },
  { value: 'daily', label: 'Diaria' },
  { value: 'weekly', label: 'Semanal' },
  { value: 'monthly', label: 'Mensual' },
]

export const getRecur = (task) =>
  (task?.tags || []).find((t) => String(t).startsWith('recur:'))?.slice(6) || ''

export const withRecur = (tags = [], recur) => {
  const rest = (tags || []).filter((t) => !String(t).startsWith('recur:'))
  return recur ? [...rest, `recur:${recur}`] : rest
}

export function nextDue(due, recur) {
  const base = /^\d{4}-\d{2}-\d{2}$/.test(due || '') ? new Date(due + 'T00:00:00') : new Date()
  const today = new Date(todayISO() + 'T00:00:00')
  const from = base < today ? today : base
  const d = new Date(from)
  if (recur === 'daily') d.setDate(d.getDate() + 1)
  else if (recur === 'weekly') d.setDate(d.getDate() + 7)
  else if (recur === 'monthly') d.setMonth(d.getMonth() + 1)
  return iso(d)
}
