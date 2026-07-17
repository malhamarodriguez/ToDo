import { Settings, Plus, ShieldCheck, PanelLeftClose, PanelLeftOpen } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { useData } from '../../context/DataContext'
import { MODULES, moduleName } from '../../lib/data'
import { ModuleGlyph } from './ModuleGlyph'
import { Logo, Mark } from './Logo'
import { Avatar, Button, Tooltip } from '../ui'
import { cx, eur, signedEur, todayISO } from '../../lib/utils'

function NavItem({ mod, active, collapsed, settings, onClick }) {
  const btn = (
    <button
      onClick={onClick}
      className={cx(
        'group relative flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
        collapsed && 'justify-center px-0',
        active ? 'bg-accent/12 text-accent' : 'text-muted hover:bg-surface-2 hover:text-ink'
      )}
    >
      {active && (
        <span className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-accent" />
      )}
      <ModuleGlyph
        settings={settings}
        id={mod.id}
        size={19}
        strokeWidth={active ? 2.4 : 2}
        className={cx('shrink-0 transition-transform duration-200', !active && 'group-hover:scale-110')}
      />
      {!collapsed && <span className="truncate">{mod.label}</span>}
    </button>
  )
  return collapsed ? (
    <Tooltip label={mod.label} side="right">
      {btn}
    </Tooltip>
  ) : (
    btn
  )
}

export function Sidebar() {
  const { route, navigate, settings, update, setQuickAdd } = useApp()
  const { movements, holdings, isAdmin } = useData()
  const collapsed = Boolean(settings.sidebarCollapsed)
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
      return base && { ...base, label: moduleName(settings, m.id) }
    })
    .filter(Boolean)

  return (
    <aside
      className={cx(
        'hidden shrink-0 flex-col border-r border-line bg-surface/40 transition-[width] duration-300 lg:flex',
        collapsed ? 'lg:w-[76px]' : 'lg:w-[264px] xl:w-[280px]'
      )}
    >
      <div className={cx('pb-2 pt-6', collapsed ? 'grid place-items-center px-0' : 'px-5')}>
        {collapsed ? (
          <button onClick={() => navigate('inicio')} aria-label="Inicio">
            <Mark size={30} emoji={settings.appIcon || null} />
          </button>
        ) : (
          <Logo
            onClick={() => navigate('inicio')}
            instance={{ name: settings.appName, icon: settings.appIcon }}
          />
        )}
      </div>

      <div className={cx('pb-3 pt-4', collapsed ? 'px-3' : 'px-4')}>
        {collapsed ? (
          <Tooltip label="Nueva tarea" side="right">
            <Button
              variant="primary"
              size="md"
              icon={Plus}
              aria-label="Nueva tarea"
              className="w-full justify-center px-0"
              onClick={() => setQuickAdd(true)}
            />
          </Tooltip>
        ) : (
          <Button variant="primary" size="md" icon={Plus} className="w-full justify-start" onClick={() => setQuickAdd(true)}>
            Nueva tarea
          </Button>
        )}
      </div>

      <nav className={cx('flex-1 space-y-1 overflow-y-auto py-2', collapsed ? 'px-3' : 'px-3')}>
        {!collapsed && (
          <p className="px-3 pb-1.5 pt-2 font-mono text-2xs font-medium uppercase tracking-[0.14em] text-subtle">
            Espacios
          </p>
        )}
        {mods.map((m) => (
          <NavItem
            key={m.id}
            mod={m}
            settings={settings}
            collapsed={collapsed}
            active={route === m.id}
            onClick={() => navigate(m.id)}
          />
        ))}

        {isAdmin && (
          <>
            {!collapsed && (
              <p className="px-3 pb-1.5 pt-5 font-mono text-2xs font-medium uppercase tracking-[0.14em] text-subtle">
                Creador
              </p>
            )}
            <button
              onClick={() => navigate('admin')}
              className={cx(
                'group relative flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
                collapsed && 'justify-center px-0',
                route === 'admin' ? 'bg-accent/12 text-accent' : 'text-muted hover:bg-surface-2 hover:text-ink'
              )}
            >
              {route === 'admin' && (
                <span className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-accent" />
              )}
              <ShieldCheck size={19} strokeWidth={route === 'admin' ? 2.4 : 2} className="shrink-0" />
              {!collapsed && <span>Gestión</span>}
            </button>
          </>
        )}
      </nav>

      {/* Resumen financiero discreto */}
      {!collapsed && (
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
      )}

      <div className={cx('border-t border-line p-3', collapsed && 'grid justify-center gap-2')}>
        {collapsed ? (
          <>
            <Tooltip label="Ajustes" side="right">
              <button
                onClick={() => navigate('ajustes')}
                aria-label="Ajustes"
                className={cx(
                  'grid h-10 w-10 place-items-center rounded-lg transition-colors hover:bg-surface-2',
                  route === 'ajustes' && 'bg-surface-2'
                )}
              >
                <Avatar name={settings.name} size={30} />
              </button>
            </Tooltip>
            <Tooltip label="Expandir menú" side="right">
              <button
                onClick={() => update({ sidebarCollapsed: false })}
                aria-label="Expandir menú"
                className="grid h-10 w-10 place-items-center rounded-lg text-subtle transition-colors hover:bg-surface-2 hover:text-ink"
              >
                <PanelLeftOpen size={18} />
              </button>
            </Tooltip>
          </>
        ) : (
          <div className="flex items-center gap-1">
            <button
              onClick={() => navigate('ajustes')}
              className={cx(
                'flex min-w-0 flex-1 items-center gap-3 rounded-lg p-2 text-left transition-colors hover:bg-surface-2',
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
            <Tooltip label="Plegar menú" side="top">
              <button
                onClick={() => update({ sidebarCollapsed: true })}
                aria-label="Plegar menú"
                className="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-subtle transition-colors hover:bg-surface-2 hover:text-ink"
              >
                <PanelLeftClose size={17} />
              </button>
            </Tooltip>
          </div>
        )}
      </div>
    </aside>
  )
}
