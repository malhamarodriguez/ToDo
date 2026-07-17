import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react'
import { applyTheme, resolveMode } from '../lib/theme'
import { MODULES, HOME_WIDGETS, QUICK_ACTIONS, moduleName } from '../lib/data'
import { uid, configureMoney, configureLocale } from '../lib/utils'

const FONT_SCALES = { sm: '14.5px', md: '16px', lg: '17.5px', xl: '19px' }

const AppCtx = createContext(null)
export const useApp = () => useContext(AppCtx)

export const DEFAULT_SETTINGS = {
  schemaVersion: 2,
  name: '',
  role: '',
  motto: '',
  mode: 'dark', // dark | light | system | franja
  accent: null, // null = el del preset; {id,hsl,fg} = acento rápido
  salary: 0,
  hideOnboarding: false,
  modules: MODULES.map((m) => ({ id: m.id, hidden: false })),
  // Personalización
  moduleNames: {}, // { negocio: 'Estudios', ... }
  moduleIcons: {}, // { negocio: 'GraduationCap', ... }
  quickActions: QUICK_ACTIONS.map((q) => ({ id: q.id, hidden: false })),
  habits: [], // [{ id, name, color }]
  habitLog: {}, // { 'YYYY-MM-DD': [habitId] }
  homeWidgets: HOME_WIDGETS.map((w) => ({ id: w.id, hidden: false })),
  fontScale: 'md', // sm | md | lg | xl
  currency: 'EUR',
  privacy: false, // ocultar cantidades
  startModule: 'inicio',
  // Tema (v2): preset + ajustes finos encima
  preset: 'electrico',
  themeOverrides: {}, // { dark: {bg,...}, light: {...} } — editor de tema
  font: null, // null = la del preset
  radius: null, // px; null = el del preset
  shadow: null, // glow | soft | flat; null = el del preset
  borderW: null, // fino | medio | grueso
  headingWeight: null, // ligero | normal | fuerte
  density: 'normal', // compacta | normal | comoda
  anim: 'completas', // completas | reducidas | ninguna
  bgFx: null, // blooms | solido | degradado | malla | puntos
  moduleAccents: {}, // { finanzas: {hsl,fg}, ... }
  appName: '', // nombre de la instancia ('' = Summa)
  appIcon: '', // emoji para el logo ('' = Σ)
  greeting: '', // saludo con {nombre} {fecha} {hora}
  sidebarCollapsed: false,
  // Ajuste fino por módulo
  weekStart: 'lunes', // lunes | domingo
  timeFormat: '24h', // 24h | 12h
  numberLocale: 'es-ES', // es-ES (1.234,56) | en-US (1,234.56)
  doneBehavior: 'tachar', // tachar | ocultar (tareas completadas)
  priorityNames: {}, // { alta: 'Urgente', ... }
  priorityColors: {}, // { alta: '0 80% 60%', ... }
  units: { weight: 'kg', distance: 'km' },
  goalStyle: 'barra', // barra | anillo | numero
  journalFont: 'sans', // sans | serif
  journalWidth: 'normal', // normal | estrecho
  financeCategories: [], // [{ name, color }]
  moduleViews: {}, // { negocio: 'lista', ... }
}

// Migración de esquema: v1 (pre-presets) → v2. Nunca borra nada
// que no entienda; los datos del usuario no se tocan.
export function migrateSettings(raw) {
  if (!raw || typeof raw !== 'object') return {}
  const s = { ...raw }
  if ((s.schemaVersion || 1) < 2) {
    delete s.direction // el sistema de "direcciones" lo sustituyen los presets
    // El acento antiguo por defecto (cian o índigo migrado) pasa a
    // "seguir al preset"; los personalizados se conservan tal cual.
    if (s.accent && (s.accent.id === 'electrico' || s.accent.id === 'indigo')) s.accent = null
    s.preset = 'electrico'
    s.schemaVersion = 2
  }
  return s
}

function loadSettings() {
  try {
    const raw = migrateSettings(JSON.parse(localStorage.getItem('summa:settings') || '{}'))
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
  // Modal global de tarea: null | { mode:'new' } | { mode:'edit', task }
  const [taskModal, setTaskModal] = useState(null)
  // Paleta de comandos (⌘K)
  const [paletteOpen, setPaletteOpen] = useState(false)
  // Temporizador de enfoque: null | { title, endsAt }
  const [focus, setFocus] = useState(null)
  // Modal de mejora a Pro: false | true | 'motivo'
  const [upgradeOpen, setUpgradeOpen] = useState(false)
  // Revisión semanal guiada
  const [reviewOpen, setReviewOpen] = useState(false)
  const themingTimer = useRef()

  useEffect(() => {
    localStorage.setItem('summa:settings', JSON.stringify(settings))
    document.documentElement.classList.add('theming')
    applyTheme(settings, route)
    // Preferencias personales: tamaño de texto, moneda y privacidad
    document.documentElement.style.fontSize = FONT_SCALES[settings.fontScale] || FONT_SCALES.md
    configureMoney({
      currency: settings.currency || 'EUR',
      privacy: Boolean(settings.privacy),
      locale: settings.numberLocale || 'es-ES',
    })
    configureLocale({ timeFormat: settings.timeFormat || '24h', weekStart: settings.weekStart || 'lunes' })
    clearTimeout(themingTimer.current)
    themingTimer.current = setTimeout(
      () => document.documentElement.classList.remove('theming'),
      400
    )
  }, [settings, route])

  // Pantalla inicial configurable (solo si se abre sin ruta)
  const startApplied = useRef(false)
  useEffect(() => {
    if (startApplied.current) return
    startApplied.current = true
    const raw = location.hash.replace('#/', '')
    if (!raw && settings.startModule && settings.startModule !== 'inicio') {
      navigate(settings.startModule)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Título del documento por ruta: "Summa — Finanzas", etc.
  useEffect(() => {
    const FIXED = { inicio: 'Panel', ajustes: 'Ajustes', informe: 'Informe', admin: 'Gestión', acceso: 'Acceso', privacidad: 'Privacidad', terminos: 'Términos' }
    const isModule = MODULES.some((m) => m.id === route)
    const label = FIXED[route] || (isModule ? moduleName(settings, route) : '')
    const app = settings.appName || 'Summa'
    document.title = label ? `${app} — ${label}` : `${app} — Todo cuenta.`
  }, [route, settings.moduleNames, settings.appName]) // eslint-disable-line react-hooks/exhaustive-deps

  // Modos reactivos: "system" sigue al SO; "franja" cambia por hora.
  useEffect(() => {
    if (settings.mode === 'system') {
      const mq = window.matchMedia('(prefers-color-scheme: light)')
      const fn = () => applyTheme(settings, route)
      mq.addEventListener('change', fn)
      return () => mq.removeEventListener('change', fn)
    }
    if (settings.mode === 'franja') {
      const id = setInterval(() => applyTheme(settings, route), 60000)
      return () => clearInterval(id)
    }
  }, [settings, route])

  useEffect(() => {
    const onHash = () => setRoute(location.hash.replace('#/', '') || 'inicio')
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  const navigate = useCallback((to) => {
    location.hash = `#/${to}`
    setRoute(to)
    setNavOpen(false)
    setPaletteOpen(false)
    document.querySelector('main')?.scrollTo({ top: 0 })
  }, [])

  const update = useCallback((patch) => setSettings((s) => ({ ...s, ...patch })), [])
  const hydrateSettings = useCallback(
    // Los ajustes de la nube pueden venir de un dispositivo sin actualizar:
    // se migran igual que los locales.
    (incoming) => setSettings((s) => ({ ...DEFAULT_SETTINGS, ...s, ...migrateSettings(incoming) })),
    []
  )

  const toast = useCallback((opts) => {
    const t = typeof opts === 'string' ? { title: opts } : opts
    const id = uid()
    setToasts((list) => [...list.slice(-3), { id, type: 'default', ...t }])
    setTimeout(() => setToasts((list) => list.filter((x) => x.id !== id)), t.duration || 4200)
  }, [])
  const dismissToast = useCallback((id) => setToasts((l) => l.filter((x) => x.id !== id)), [])

  // API de tareas (compatible con el antiguo setQuickAdd)
  const setQuickAdd = useCallback((v) => setTaskModal(v ? { mode: 'new' } : null), [])
  const openTask = useCallback((task) => setTaskModal({ mode: 'edit', task }), [])

  // Enfoque (pomodoro ligero)
  const startFocus = useCallback((title, mins = 25) => {
    setFocus({ title: title || 'Sesión de enfoque', endsAt: Date.now() + mins * 60000 })
  }, [])
  const stopFocus = useCallback(() => setFocus(null), [])

  const value = {
    settings,
    update,
    hydrateSettings,
    resolvedMode: resolveMode(settings.mode),
    route,
    navigate,
    navOpen,
    setNavOpen,
    taskModal,
    setTaskModal,
    quickAdd: Boolean(taskModal),
    setQuickAdd,
    openTask,
    paletteOpen,
    setPaletteOpen,
    focus,
    startFocus,
    stopFocus,
    upgradeOpen,
    setUpgradeOpen,
    reviewOpen,
    setReviewOpen,
    toasts,
    toast,
    dismissToast,
  }

  return <AppCtx.Provider value={value}>{children}</AppCtx.Provider>
}
