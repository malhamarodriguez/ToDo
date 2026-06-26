import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react'
import { ACCENTS, applyTheme, resolveMode } from '../lib/theme'
import { MODULES } from '../lib/data'
import { uid } from '../lib/utils'

const AppCtx = createContext(null)
export const useApp = () => useContext(AppCtx)

const DEFAULT_SETTINGS = {
  name: '',
  role: '',
  mode: 'dark',
  direction: 'eclipse',
  accent: ACCENTS[0],
  salary: 0,
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
  const [toasts, setToasts] = useState([])
  const [navOpen, setNavOpen] = useState(false)
  const [quickAdd, setQuickAdd] = useState(false)
  const themingTimer = useRef()

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

  useEffect(() => {
    if (settings.mode !== 'system') return
    const mq = window.matchMedia('(prefers-color-scheme: light)')
    const fn = () => applyTheme(settings)
    mq.addEventListener('change', fn)
    return () => mq.removeEventListener('change', fn)
  }, [settings])

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
  // Hidratar ajustes desde el perfil de Supabase sin perder la forma por defecto
  const hydrateSettings = useCallback(
    (incoming) => setSettings((s) => ({ ...DEFAULT_SETTINGS, ...s, ...incoming })),
    []
  )

  const toast = useCallback((opts) => {
    const t = typeof opts === 'string' ? { title: opts } : opts
    const id = uid()
    setToasts((list) => [...list, { id, type: 'default', ...t }])
    setTimeout(() => setToasts((list) => list.filter((x) => x.id !== id)), t.duration || 3800)
  }, [])
  const dismissToast = useCallback((id) => setToasts((l) => l.filter((x) => x.id !== id)), [])

  const value = {
    settings,
    update,
    hydrateSettings,
    resolvedMode: resolveMode(settings.mode),
    route,
    navigate,
    navOpen,
    setNavOpen,
    quickAdd,
    setQuickAdd,
    toasts,
    toast,
    dismissToast,
  }

  return <AppCtx.Provider value={value}>{children}</AppCtx.Provider>
}
