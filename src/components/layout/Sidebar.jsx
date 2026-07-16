import { Settings, Plus } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { useData } from '../../context/DataContext'
import { MODULES, moduleName, moduleIcon } from '../../lib/data'
import { ICONS } from './icons'
import { Logo } from './Logo'
import { Avatar, Button } from '../ui'
import { cx, eur, signedEur, todayISO } from '../../lib/utils'

function NavItem({ mod, active, onClick }) {
  const Icon = ICONS[mod.icon]
  return (
    <button
      onClick={onClick}
      className={cx(
        'group relative flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
        active ? 'bg-accent/12 text-accent' : 'text-muted hover:bg-surface-2 hover:text-ink'
      )}
    >
      {active && (
        <span className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-accent" />
      )}
      <Icon
        size={19}
        strokeWidth={active ? 2.4 : 2}
        className={cx('shrink-0 transition-transform duration-200', !active && 'group-hover:scale-110')}
      />
      <span>{mod.label}</span>
    </button>
  )
}

export function Sidebar() {
  const { route, navigate, settings, setQuickAdd } = useApp()
  const { movements, holdings } = useData()
  const month = todayISO().slice(0, 7)
  const balanceMes = movements
    .filter((m) => String(m.date).slice(0, 7) === month)
    .reduce((a, m) => a + Number(m.amount), 0)
  const patrimonio = holdings.reduce(
    (a, h) => a + (h.kind === 'liability' ? -Number(h.value) : Number(h.value)),
    0
  )
  const mods = settings.modules
    .filter((m) => !m.hidden)
    .map((m) => {
      const base = MODULES.find((x) => x.id === m.id)
      return base && { ...base, label: moduleName(settings, m.id), icon: moduleIcon(settings, m.id) }
    })
    .filter(Boolean)

  return (
    <aside className="hidden lg:flex lg:w-[264px] xl:w-[280px] shrink-0 flex-col border-r border-line bg-surface/40">
      <div className="px-5 pb-2 pt-6">
        <Logo onClick={() => navigate('inicio')} />
      </div>

      <div className="px-4 pb-3 pt-4">
        <Button variant="primary" size="md" icon={Plus} className="w-full justify-start" onClick={() => setQuickAdd(true)}>
          Nueva tarea
        </Button>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-2">
        <p className="px-3 pb-1.5 pt-2 font-mono text-2xs font-medium uppercase tracking-[0.14em] text-subtle">
          Espacios
        </p>
        {mods.map((m) => (
          <NavItem key={m.id} mod={m} active={route === m.id} onClick={() => navigate(m.id)} />
        ))}
      </nav>

      {/* Resumen financiero discreto */}
      <div className="mx-4 mb-3 rounded-lg border border-line bg-surface-2/60 px-3.5 py-3">
        <div className="flex items-center justify-between text-[13px]">
          <span className="text-subtle">Balance mes</span>
          <span className={cx('font-semibold tabular', balanceMes >= 0 ? 'text-success' : 'text-danger')}>{signedEur(balanceMes)}</span>
        </div>
        <div className="mt-1.5 flex items-center justify-between text-[13px]">
          <span className="text-subtle">Patrimonio</span>
          <span className="font-semibold tabular text-ink">{eur(patrimonio)}</span>
        </div>
      </div>

      <div className="border-t border-line p-3">
        <button
          onClick={() => navigate('ajustes')}
          className={cx(
            'flex w-full items-center gap-3 rounded-lg p-2 text-left transition-colors hover:bg-surface-2',
            route === 'ajustes' && 'bg-surface-2'
          )}
        >
          <Avatar name={settings.name} size={36} />
          <div className="min-w-0 flex-1 leading-tight">
            <p className="truncate text-sm font-semibold text-ink">{settings.name}</p>
            <p className="truncate text-2xs text-subtle">{settings.role}</p>
          </div>
          <Settings size={17} className="text-subtle" />
        </button>
      </div>
    </aside>
  )
}
