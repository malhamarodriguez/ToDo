// Hábitos personalizados: definiciones y registro diario viven en los
// ajustes del usuario (se sincronizan solos; sin cambios de esquema).
// settings.habits: [{ id, name, color }]
// settings.habitLog: { 'YYYY-MM-DD': [habitId, ...] }
import { todayISO } from './utils'

const isoDaysAgo = (n) => {
  const d = new Date()
  d.setDate(d.getDate() - n)
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset())
  return d.toISOString().slice(0, 10)
}

export const habitDoneOn = (log, iso, id) => Boolean(log?.[iso]?.includes(id))

export function toggleHabitLog(log = {}, id, iso = todayISO()) {
  const day = new Set(log[iso] || [])
  day.has(id) ? day.delete(id) : day.add(id)
  const next = { ...log, [iso]: [...day] }
  if (!next[iso].length) delete next[iso]
  return next
}

// Racha actual (hoy cuenta si está marcado; si no, se mide hasta ayer)
export function habitStreak(log = {}, id) {
  let streak = 0
  let offset = habitDoneOn(log, todayISO(), id) ? 0 : 1
  for (let i = offset; i < 400; i++) {
    if (habitDoneOn(log, isoDaysAgo(i), id)) streak++
    else break
  }
  return streak
}

// Últimos 7 días (para los puntos de la semana), de más antiguo a hoy
export function habitWeek(log = {}, id) {
  return [...Array(7)].map((_, i) => {
    const iso = isoDaysAgo(6 - i)
    return { iso, done: habitDoneOn(log, iso, id) }
  })
}

export const HABIT_COLORS = [
  '243 76% 64%', '158 64% 44%', '36 92% 55%', '342 80% 62%',
  '213 90% 58%', '262 72% 64%', '22 90% 56%', '188 78% 44%',
]
