// Configuración estática de la app (sin datos de ejemplo).
// Todos los datos del usuario viven en Supabase y empiezan vacíos.

export const PRIORITIES = {
  alta: { id: 'alta', label: 'Alta', hsl: '358 70% 60%' },
  media: { id: 'media', label: 'Media', hsl: '36 92% 55%' },
  baja: { id: 'baja', label: 'Baja', hsl: '213 70% 60%' },
}

// Prioridad con nombre/color personalizados por el usuario.
// Los datos guardan siempre alta/media/baja; solo cambia cómo se ven.
export function prioMeta(settings, id) {
  const base = PRIORITIES[id] || PRIORITIES.media
  return {
    ...base,
    label: settings?.priorityNames?.[base.id]?.trim() || base.label,
    hsl: settings?.priorityColors?.[base.id] || base.hsl,
  }
}

// Paleta sugerida para proyectos / categorías nuevas
export const COLOR_CHOICES = [
  '243 76% 64%', '262 72% 64%', '213 90% 58%', '188 78% 44%',
  '158 64% 44%', '88 58% 48%', '36 92% 55%', '22 90% 56%',
  '342 80% 62%', '358 70% 58%',
]

export const findProject = (projects, id) => projects?.find((p) => p.id === id)

export const AREAS = ['Negocio', 'Finanzas', 'Salud', 'Personal']

export const MOODS = {
  enfocado: { label: 'Enfocado', tone: 'accent' },
  motivado: { label: 'Motivado', tone: 'success' },
  cansado: { label: 'Cansado', tone: 'warning' },
  neutro: { label: 'Neutro', tone: 'neutral' },
}

// Catálogo de logros; "got" se calcula a partir de la actividad real.
export const ACHIEVEMENTS = [
  { id: 'a1', name: 'Primer entreno', icon: 'dumbbell', need: (s) => s.total >= 1 },
  { id: 'a2', name: 'Racha de 7 días', icon: 'flame', need: (s) => s.streak >= 7 },
  { id: 'a3', name: '10 entrenos', icon: 'trophy', need: (s) => s.total >= 10 },
  { id: 'a4', name: 'Racha de 30 días', icon: 'flame', need: (s) => s.streak >= 30 },
  { id: 'a5', name: '50 entrenos', icon: 'medal', need: (s) => s.total >= 50 },
  { id: 'a6', name: '100 entrenos', icon: 'trophy', need: (s) => s.total >= 100 },
]

// Construye la rejilla anual (tipo GitHub) a partir de fechas ISO con conteo.
export function streakFromDates(isoDates = [], days = 363) {
  const counts = {}
  isoDates.forEach((d) => {
    const key = String(d).slice(0, 10)
    counts[key] = (counts[key] || 0) + 1
  })
  const out = []
  for (let i = days; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const key = d.toISOString().slice(0, 10)
    const c = counts[key] || 0
    out.push({ date: d, level: c === 0 ? 0 : Math.min(4, c + 1) })
  }
  return out
}

export const MODULES = [
  { id: 'inicio', name: 'Inicio', icon: 'Home' },
  { id: 'negocio', name: 'Negocio', icon: 'Briefcase' },
  { id: 'finanzas', name: 'Finanzas', icon: 'Wallet' },
  { id: 'deporte', name: 'Deporte', icon: 'Dumbbell' },
  { id: 'metas', name: 'Metas', icon: 'Target' },
  { id: 'diario', name: 'Diario', icon: 'NotebookPen' },
  { id: 'calendario', name: 'Calendario', icon: 'Calendar' },
  { id: 'fiscal', name: 'Fiscal', icon: 'Landmark' },
  { id: 'ventures', name: 'Ventures', icon: 'Layers' },
]

// Nombre de módulo personalizado por el usuario ("Negocio" → "Estudios"…)
export const moduleName = (settings, id) => {
  const custom = settings?.moduleNames?.[id]
  if (custom && String(custom).trim()) return String(custom).trim()
  return MODULES.find((m) => m.id === id)?.name || id
}

// Bloques del Inicio que se pueden mostrar/ocultar
export const HOME_WIDGETS = [
  { id: 'onboarding', label: 'Primeros pasos' },
  { id: 'quick', label: 'Accesos rápidos' },
  { id: 'focus', label: 'Enfoque de hoy' },
  { id: 'tasks', label: 'Tareas de hoy' },
  { id: 'habits', label: 'Hábitos' },
  { id: 'workout', label: 'Entreno de hoy' },
  { id: 'agenda', label: 'Agenda de hoy' },
  { id: 'goals', label: 'Metas' },
  { id: 'finance', label: 'Franja financiera' },
]

// Accesos rápidos del Inicio (configurables)
export const QUICK_ACTIONS = [
  { id: 'task', label: 'Nueva tarea' },
  { id: 'expense', label: 'Registrar gasto' },
  { id: 'journal', label: 'Anotar en diario' },
  { id: 'workout', label: 'Nuevo entreno' },
  { id: 'review', label: 'Revisión semanal' },
]

// Iconos elegibles para los módulos (clic sobre el icono en Ajustes)
export const ICON_CHOICES = [
  'Home', 'Briefcase', 'Wallet', 'Dumbbell', 'Target', 'NotebookPen', 'Calendar', 'Landmark',
  'BookOpen', 'GraduationCap', 'Heart', 'Palette', 'Music', 'Plane', 'ShoppingBag', 'Coffee',
]

export const moduleIcon = (settings, id) => {
  const custom = settings?.moduleIcons?.[id]
  if (custom && ICON_CHOICES.includes(custom)) return custom
  return MODULES.find((m) => m.id === id)?.icon || 'Home'
}

// Glifo del módulo: icono del set o un emoji del usuario
// (guardado como "emoji:🚀" en moduleIcons).
export const moduleEmoji = (settings, id) => {
  const custom = settings?.moduleIcons?.[id]
  return typeof custom === 'string' && custom.startsWith('emoji:') ? custom.slice(6) : null
}

// Emojis sugeridos para módulos e icono de la app
export const EMOJI_CHOICES = [
  '🏠', '💼', '💶', '🏋️', '🎯', '📓', '📅', '🚀', '📚', '🎨',
  '🧠', '❤️', '✈️', '🛒', '☕', '🌱', '⚽', '🎸', '💡', '🔥',
]
