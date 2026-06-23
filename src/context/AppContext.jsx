import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react'
import { ACCENTS, applyTheme, resolveMode } from '../lib/theme'
import { INITIAL_TASKS, MODULES } from '../lib/data'
import { uid } from '../lib/utils'

const AppCtx = createContext(null)
export const useApp = () => useContext(AppCtx)

const DEFAULT_SETTINGS = {
  name: 'Alex',
  role: 'Consultor & founder',
  mode: 'dark', // dark | light | system
  direction: 'eclipse', // eclipse | calido
  accent: ACCENTS[0],
  // orden y visibilidad de módulos
  modules: MODULES.map((m) => ({ id: m.id, hidden: false })),
}

function loadSettings() {
  try {
    const raw = JSON.parse(localStorage.getItem('nucleo:settings') || '{}')
    return { ...DEFAULT_SETTINGS, ...raw }
  } catch {
    return DEFAULT_SETTINGS
  }
}

export function AppProvider({ children }) {
  const [settings, setSettings] = useState(loadSettings)
  const [route, setRoute] = useState(
    () => (typeof location !== 'undefined' && location.hash.replace('#/', '')) || 'inicio'
  )
  const [tasks, setTasks] = useState(INITIAL_TASKS)
  const [entrenoHoy, setEntrenoHoy] = useState(false)
  const [toasts, setToasts] = useState([])
  const [navOpen, setNavOpen] = useState(false)
  const [quickAdd, setQuickAdd] = useState(false)
  const themingTimer = useRef()

  // Persistir + aplicar tema
  useEffect(() => {
    localStorage.setItem('nucleo:settings', JSON.stringify(settings))
    document.documentElement.classList.add('theming')
    applyTheme(settings)
    clearTimeout(themingTimer.current)
    themingTimer.current = setTimeout(
      () => document.documentElement.classList.remove('theming'),
      400
    )
  }, [settings])

  // Reaccionar a cambios del sistema cuando mode = 'system'
  useEffect(() => {
    if (settings.mode !== 'system') return
    const mq = window.matchMedia('(prefers-color-scheme: light)')
    const fn = () => applyTheme(settings)
    mq.addEventListener('change', fn)
    return () => mq.removeEventListener('change', fn)
  }, [settings])

  // Sincronizar ruta con el hash
  useEffect(() => {
    const onHash = () => setRoute(location.hash.replace('#/', '') || 'inicio')
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  const navigate = useCallback((to) => {
    location.hash = `#/${to}`
    setRoute(to)
    setNavOpen(false)
    document.querySelector('main')?.scrollTo({ top: 0 })
  }, [])

  const update = useCallback((patch) => setSettings((s) => ({ ...s, ...patch })), [])

  const toast = useCallback((opts) => {
    const t = typeof opts === 'string' ? { title: opts } : opts
    const id = uid()
    setToasts((list) => [...list, { id, type: 'default', ...t }])
    setTimeout(() => setToasts((list) => list.filter((x) => x.id !== id)), t.duration || 3800)
  }, [])
  const dismissToast = useCallback((id) => setToasts((l) => l.filter((x) => x.id !== id)), [])

  // ---- Acciones de tareas ----
  const toggleTask = useCallback((id) => {
    setTasks((list) =>
      list.map((t) => (t.id === id ? { ...t, status: t.status === 'done' ? 'todo' : 'done' } : t))
    )
  }, [])
  const moveTask = useCallback((id, status) => {
    setTasks((list) => list.map((t) => (t.id === id ? { ...t, status } : t)))
  }, [])
  const addTask = useCallback((task) => {
    setTasks((list) => [{ id: uid(), subtasks: [], tags: [], status: 'todo', ...task }, ...list])
  }, [])

  const value = {
    settings,
    update,
    resolvedMode: resolveMode(settings.mode),
    route,
    navigate,
    navOpen,
    setNavOpen,
    quickAdd,
    setQuickAdd,
    tasks,
    setTasks,
    toggleTask,
    moveTask,
    addTask,
    entrenoHoy,
    setEntrenoHoy,
    toasts,
    toast,
    dismissToast,
  }

  return <AppCtx.Provider value={value}>{children}</AppCtx.Provider>
}
