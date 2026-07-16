import { createPortal } from 'react-dom'
import { Menu, Settings, X, Plus, ShieldCheck } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { useData } from '../../context/DataContext'
import { MODULES, moduleName, moduleIcon } from '../../lib/data'
import { ICONS } from './icons'
import { Logo } from './Logo'
import { Avatar } from '../ui'
import { cx } from '../../lib/utils'

export function MobileTabBar() {
  const { route, navigate, settings, setNavOpen, setQuickAdd } = useApp()
  const visible = settings.modules.filter((m) => !m.hidden).map((m) => m.id)
  const main = ['inicio', 'negocio', 'finanzas', 'deporte'].filter((id) => visible.includes(id)).slice(0, 4)
  const items = main.map((id) => MODULES.find((m) => m.id === id))

  return (
    <>
      {/* Botón flotante de nueva tarea */}
      <button
        onClick={() => setQuickAdd(true)}
        aria-label="Nueva tarea"
        className="fixed bottom-20 right-4 z-30 grid h-14 w-14 place-items-center rounded-2xl bg-accent text-accent-fg shadow-glow transition-transform active:scale-90 lg:hidden"
        style={{ marginBottom: 'env(safe-area-inset-bottom)' }}
      >
        <Plus size={26} strokeWidth={2.4} />
      </button>
      <nav className="fixed inset-x-0 bottom-0 z-30 flex items-stretch border-t border-line glass pb-[env(safe-area-inset-bottom)] lg:hidden">
      {items.map((m) => {
        const Icon = ICONS[moduleIcon(settings, m.id)]
        const active = route === m.id
        return (
          <button
            key={m.id}
            onClick={() => navigate(m.id)}
            className={cx(
              'flex flex-1 flex-col items-center gap-1 py-2.5 text-2xs font-medium transition-colors',
              active ? 'text-accent' : 'text-subtle'
            )}
          >
            <Icon size={21} strokeWidth={active ? 2.4 : 2} />
            {moduleName(settings, m.id)}
          </button>
        )
      })}
      <button
        onClick={() => setNavOpen(true)}
        className="flex flex-1 flex-col items-center gap-1 py-2.5 text-2xs font-medium text-subtle"
      >
        <Menu size={21} />
        Más
      </button>
      </nav>
    </>
  )
}

export function MobileDrawer() {
  const { navOpen, setNavOpen, route, navigate, settings } = useApp()
  const { isAdmin } = useData()
  if (!navOpen) return null
  const mods = settings.modules
    .filter((m) => !m.hidden)
    .map((m) => MODULES.find((x) => x.id === m.id))
    .filter(Boolean)

  return createPortal(
    <div className="fixed inset-0 z-50 lg:hidden">
      <div className="absolute inset-0 bg-black/55 backdrop-blur-sm animate-fade-in" onClick={() => setNavOpen(false)} />
      <div className="absolute inset-y-0 left-0 flex w-[82%] max-w-xs flex-col border-r border-line bg-surface shadow-xl animate-fade-up">
        <div className="flex items-center justify-between px-5 pb-2 pt-6">
          <Logo onClick={() => navigate('inicio')} />
          <button
            onClick={() => setNavOpen(false)}
            className="grid h-9 w-9 place-items-center rounded-lg text-muted hover:bg-surface-2 hover:text-ink"
          >
            <X size={18} />
          </button>
        </div>
        <nav className="flex-1 space-y-1 overflow-y-auto p-3">
          {mods.map((m) => {
            const Icon = ICONS[moduleIcon(settings, m.id)]
            const active = route === m.id
            return (
              <button
                key={m.id}
                onClick={() => navigate(m.id)}
                className={cx(
                  'flex w-full items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition-colors',
                  active ? 'bg-accent/12 text-accent' : 'text-muted hover:bg-surface-2 hover:text-ink'
                )}
              >
                <Icon size={20} strokeWidth={active ? 2.4 : 2} />
                {moduleName(settings, m.id)}
              </button>
            )
          })}

          {isAdmin && (
            <button
              onClick={() => navigate('admin')}
              className={cx(
                'flex w-full items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition-colors',
                route === 'admin' ? 'bg-accent/12 text-accent' : 'text-muted hover:bg-surface-2 hover:text-ink'
              )}
            >
              <ShieldCheck size={20} strokeWidth={route === 'admin' ? 2.4 : 2} />
              Gestión
            </button>
          )}
        </nav>
        <div className="border-t border-line p-3">
          <button
            onClick={() => navigate('ajustes')}
            className="flex w-full items-center gap-3 rounded-lg p-2 hover:bg-surface-2"
          >
            <Avatar name={settings.name} size={36} />
            <div className="min-w-0 flex-1 text-left leading-tight">
              <p className="truncate text-sm font-semibold text-ink">{settings.name}</p>
              <p className="truncate text-2xs text-subtle">Ver ajustes</p>
            </div>
            <Settings size={17} className="text-subtle" />
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}
