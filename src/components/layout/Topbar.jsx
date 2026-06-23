import { Search, Bell, Sun, Moon, Menu, Plus } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { MODULES } from '../../lib/data'
import { Mark } from './Logo'
import { Button, Kbd, Tooltip } from '../ui'
import { resolveMode } from '../../lib/theme'

const TITLES = {
  inicio: 'Panel central',
  negocio: 'Negocio',
  finanzas: 'Finanzas',
  deporte: 'Deporte',
  metas: 'Metas',
  diario: 'Diario',
  calendario: 'Calendario',
  ajustes: 'Ajustes',
}

export function Topbar() {
  const { route, settings, update, setNavOpen, setQuickAdd } = useApp()
  const mode = resolveMode(settings.mode)
  const toggleMode = () => update({ mode: mode === 'dark' ? 'light' : 'dark' })

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-line glass px-4 sm:px-6">
      {/* Móvil: menú + marca */}
      <button
        onClick={() => setNavOpen(true)}
        className="grid h-10 w-10 place-items-center rounded-lg text-muted transition-colors hover:bg-surface-2 hover:text-ink lg:hidden"
      >
        <Menu size={20} />
      </button>
      <div className="lg:hidden">
        <Mark size={26} />
      </div>

      <h1 className="hidden text-[15px] font-semibold text-ink lg:block">
        {TITLES[route] || 'Núcleo'}
      </h1>

      {/* Búsqueda */}
      <div className="ml-auto flex flex-1 items-center justify-end gap-2 sm:ml-6 sm:justify-between">
        <label className="group relative hidden max-w-md flex-1 items-center sm:flex">
          <Search size={16} className="pointer-events-none absolute left-3 text-subtle" />
          <input
            placeholder="Buscar tareas, clientes, notas…"
            className="h-10 w-full rounded-lg border border-line bg-surface-2/70 pl-9 pr-16 text-sm text-ink placeholder:text-subtle transition-all focus:border-accent/50 focus:bg-surface focus:outline-none focus:ring-4 focus:ring-accent/10"
          />
          <span className="absolute right-2.5 hidden items-center gap-1 md:flex">
            <Kbd>⌘</Kbd>
            <Kbd>K</Kbd>
          </span>
        </label>

        <div className="flex items-center gap-1.5">
          <Button
            variant="ghost"
            size="icon-sm"
            className="sm:hidden"
            icon={Search}
            aria-label="Buscar"
          />
          <Tooltip label={mode === 'dark' ? 'Modo claro' : 'Modo oscuro'}>
            <Button
              variant="ghost"
              size="icon-sm"
              icon={mode === 'dark' ? Sun : Moon}
              onClick={toggleMode}
              aria-label="Cambiar tema"
            />
          </Tooltip>
          <Tooltip label="Notificaciones">
            <button className="relative grid h-8 w-8 place-items-center rounded-md text-muted transition-colors hover:bg-surface-2 hover:text-ink">
              <Bell size={18} />
              <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-accent ring-2 ring-surface" />
            </button>
          </Tooltip>
          <Button
            variant="primary"
            size="icon-sm"
            icon={Plus}
            className="sm:hidden"
            onClick={() => setQuickAdd(true)}
            aria-label="Nueva tarea"
          />
        </div>
      </div>
    </header>
  )
}
