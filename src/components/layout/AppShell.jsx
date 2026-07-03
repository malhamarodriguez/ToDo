import { useEffect } from 'react'
import { Sparkles, X } from 'lucide-react'
import { Sidebar } from './Sidebar'
import { Topbar } from './Topbar'
import { MobileTabBar, MobileDrawer } from './MobileNav'
import { Toaster, Button } from '../ui'
import { TaskModal } from '../app/TaskModal'
import { CommandPalette } from '../app/CommandPalette'
import { UpgradeModal } from '../app/UpgradeModal'
import { WeeklyReview } from '../app/WeeklyReview'
import { useApp } from '../../context/AppContext'
import { useData } from '../../context/DataContext'
import { MODULES } from '../../lib/data'
import { resolveMode } from '../../lib/theme'
import { exitDemo } from '../../lib/demo'

// Aviso persistente del modo demo, con salida clara hacia el registro.
function DemoBanner() {
  const { demo } = useData()
  if (!demo) return null
  const toSignup = () => {
    exitDemo()
    location.hash = '#/acceso'
    location.reload()
  }
  const leave = () => {
    exitDemo()
    location.hash = '#/'
    location.reload()
  }
  return (
    <div className="sticky top-16 z-20 flex items-center gap-3 border-b border-accent/25 bg-accent/[0.08] px-4 py-2 text-[13px] backdrop-blur sm:px-6">
      <Sparkles size={14} className="shrink-0 text-accent" />
      <span className="min-w-0 truncate text-ink">
        Estás en la <strong>demo</strong> — juega sin miedo, nada se guarda en la nube.
      </span>
      <Button variant="primary" size="sm" className="ml-auto shrink-0" onClick={toSignup}>
        Crear mi cuenta
      </Button>
      <button onClick={leave} className="grid h-7 w-7 shrink-0 place-items-center rounded-md text-subtle hover:bg-surface-2 hover:text-ink" aria-label="Salir de la demo">
        <X size={15} />
      </button>
    </div>
  )
}

function SkeletonPage() {
  return (
    <div className="mx-auto w-full max-w-content px-4 py-8 sm:px-6 lg:px-8">
      <div className="skeleton h-8 w-64 rounded-lg" />
      <div className="mt-3 skeleton h-4 w-40 rounded" />
      <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="skeleton h-28 rounded-xl" />
        ))}
      </div>
      <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-12">
        <div className="skeleton h-72 rounded-xl lg:col-span-8" />
        <div className="skeleton h-72 rounded-xl lg:col-span-4" />
      </div>
    </div>
  )
}

// Atajos de teclado globales: N (nueva tarea), T (tema), 1-7 (módulos)
function useShortcuts() {
  const { setQuickAdd, update, settings, navigate, paletteOpen, taskModal } = useApp()
  useEffect(() => {
    const onKey = (e) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return
      const el = e.target
      if (el.closest?.('input, textarea, select, [contenteditable]')) return
      if (paletteOpen || taskModal) return
      const k = e.key.toLowerCase()
      if (k === 'n') {
        e.preventDefault()
        setQuickAdd(true)
      } else if (k === 't') {
        e.preventDefault()
        update({ mode: resolveMode(settings.mode) === 'dark' ? 'light' : 'dark' })
      } else if (/^[1-7]$/.test(k)) {
        const visible = settings.modules.filter((m) => !m.hidden)
        const target = visible[Number(k) - 1]
        if (target && MODULES.find((m) => m.id === target.id)) navigate(target.id)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [setQuickAdd, update, settings, navigate, paletteOpen, taskModal])
}

export function AppShell({ children }) {
  const { loading } = useData()
  useShortcuts()

  return (
    <div className="app-canvas flex min-h-[100dvh] text-ink">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar />
        <DemoBanner />
        <main className="flex-1 overflow-x-hidden pb-28 lg:pb-0">
          {loading ? <SkeletonPage /> : children}
        </main>
      </div>

      <MobileTabBar />
      <MobileDrawer />
      <TaskModal />
      <CommandPalette />
      <UpgradeModal />
      <WeeklyReview />
      <Toaster />
    </div>
  )
}
