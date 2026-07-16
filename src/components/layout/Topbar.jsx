import { useEffect, useState } from 'react'
import { Search, Sun, Moon, Menu, Plus, Timer, X, WifiOff, Eye, EyeOff } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { moduleName } from '../../lib/data'
import { Mark } from './Logo'
import { Button, Kbd, Tooltip } from '../ui'
import { resolveMode } from '../../lib/theme'

const MODULE_ROUTES = ['negocio', 'finanzas', 'deporte', 'metas', 'diario', 'calendario']
function titleFor(route, settings) {
  if (route === 'inicio' || !route) return 'Panel central'
  if (route === 'ajustes') return 'Ajustes'
  if (route === 'informe') return 'Informe mensual'
  if (route === 'admin') return 'Gestión'
  if (MODULE_ROUTES.includes(route)) return moduleName(settings, route)
  return 'Summa'
}

function FocusChip() {
  const { focus, stopFocus, toast } = useApp()
  const [, tick] = useState(0)
  useEffect(() => {
    if (!focus) return
    const id = setInterval(() => tick((n) => n + 1), 1000)
    return () => clearInterval(id)
  }, [focus])
  useEffect(() => {
    if (focus && focus.endsAt - Date.now() <= 0) {
      stopFocus()
      toast({ type: 'success', title: '¡Sesión de enfoque completada!', desc: focus.title })
    }
  })
  if (!focus) return null
  const left = Math.max(0, focus.endsAt - Date.now())
  const mm = String(Math.floor(left / 60000)).padStart(2, '0')
  const ss = String(Math.floor((left % 60000) / 1000)).padStart(2, '0')
  return (
    <div className="flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 py-1 pl-2.5 pr-1 text-[13px] font-semibold text-accent">
      <Timer size={14} className="animate-pulse" />
      <span className="tabular">{mm}:{ss}</span>
      <button
        onClick={stopFocus}
        className="grid h-6 w-6 place-items-center rounded-full text-accent transition-colors hover:bg-accent/15"
        aria-label="Parar enfoque"
      >
        <X size={13} />
      </button>
    </div>
  )
}

function OfflineChip() {
  const [online, setOnline] = useState(navigator.onLine)
  useEffect(() => {
    const on = () => setOnline(true)
    const off = () => setOnline(false)
    window.addEventListener('online', on)
    window.addEventListener('offline', off)
    return () => {
      window.removeEventListener('online', on)
      window.removeEventListener('offline', off)
    }
  }, [])
  if (online) return null
  return (
    <span className="flex items-center gap-1.5 rounded-full border border-warning/30 bg-warning/12 px-2.5 py-1 text-2xs font-semibold text-warning">
      <WifiOff size={12} /> Sin conexión
    </span>
  )
}

export function Topbar() {
  const { route, settings, update, setNavOpen, setQuickAdd, setPaletteOpen } = useApp()
  const mode = resolveMode(settings.mode)
  const toggleMode = () => update({ mode: mode === 'dark' ? 'light' : 'dark' })

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-line glass px-4 sm:px-6">
      <button
        onClick={() => setNavOpen(true)}
        className="grid h-10 w-10 place-items-center rounded-lg text-muted transition-colors hover:bg-surface-2 hover:text-ink lg:hidden"
      >
        <Menu size={20} />
      </button>
      <div className="lg:hidden">
        <Mark size={26} />
      </div>

      <h1 className="text-[15px] font-semibold text-ink">{titleFor(route, settings)}</h1>

      <div className="ml-auto flex items-center gap-2 sm:gap-3">
        <OfflineChip />
        <FocusChip />

        {/* Buscador → paleta de comandos */}
        <button
          onClick={() => setPaletteOpen(true)}
          className="group hidden h-10 w-64 items-center gap-2.5 rounded-lg border border-line bg-surface-2/70 px-3 text-sm text-subtle transition-all hover:border-line-strong hover:text-muted sm:flex"
        >
          <Search size={15} />
          <span className="flex-1 text-left">Buscar o ejecutar…</span>
          <span className="flex items-center gap-1">
            <Kbd>⌘</Kbd>
            <Kbd>K</Kbd>
          </span>
        </button>
        <Button
          variant="ghost"
          size="icon-sm"
          className="sm:hidden"
          icon={Search}
          onClick={() => setPaletteOpen(true)}
          aria-label="Buscar"
        />

        <Tooltip label={settings.privacy ? 'Mostrar cantidades' : 'Ocultar cantidades'}>
          <Button
            variant="ghost"
            size="icon-sm"
            icon={settings.privacy ? EyeOff : Eye}
            onClick={() => update({ privacy: !settings.privacy })}
            aria-label="Modo privacidad"
            className={settings.privacy ? 'text-accent' : undefined}
          />
        </Tooltip>
        <Tooltip label={mode === 'dark' ? 'Modo claro' : 'Modo oscuro'}>
          <Button
            variant="ghost"
            size="icon-sm"
            icon={mode === 'dark' ? Sun : Moon}
            onClick={toggleMode}
            aria-label="Cambiar tema"
          />
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
    </header>
  )
}
