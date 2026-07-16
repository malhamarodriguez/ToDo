import { useEffect, useRef, useState } from 'react'
import {
  Moon, Sun, Monitor, Check, ChevronUp, ChevronDown, Eye, EyeOff,
  Download, Upload, RotateCcw, Palette, LayoutGrid, User, Sparkles,
  LogOut, Database, KeyRound, SlidersHorizontal, Home, Type,
} from 'lucide-react'
import { useApp } from '../context/AppContext'
import { useAuth } from '../context/AuthContext'
import { useData, TABLES } from '../context/DataContext'
import { FREE_LIMITS } from '../lib/plan'
import { ACCENTS, customAccent } from '../lib/theme'
import { MODULES, HOME_WIDGETS, QUICK_ACTIONS, ICON_CHOICES, moduleName, moduleIcon } from '../lib/data'
import { ICONS } from '../components/layout/icons'
import { PageContainer, PageHeader } from '../components/layout/Page'
import { Card, CardHeader, CardBody, Button, Input, Label, Segmented, Switch, Select, SectionTitle } from '../components/ui'
import { cx } from '../lib/utils'

function Panel({ title, subtitle, icon, children }) {
  return (
    <Card>
      <CardHeader title={title} subtitle={subtitle} icon={icon} />
      <CardBody className="pt-4">{children}</CardBody>
    </Card>
  )
}

export default function Ajustes() {
  const { settings, update, toast, setUpgradeOpen } = useApp()
  const { user, signOut } = useAuth()
  const data = useData()
  const { isPro } = data
  const fileRef = useRef()
  const [installEvt, setInstallEvt] = useState(null)

  useEffect(() => {
    const onPrompt = (e) => {
      e.preventDefault()
      setInstallEvt(e)
    }
    window.addEventListener('beforeinstallprompt', onPrompt)
    return () => window.removeEventListener('beforeinstallprompt', onPrompt)
  }, [])

  const reconnect = () => {
    localStorage.removeItem('summa:sb_url')
    localStorage.removeItem('summa:sb_key')
    location.reload()
  }

  const setModules = (mods) => update({ modules: mods })
  const moveModule = (i, dir) => {
    const mods = [...settings.modules]
    const j = i + dir
    if (j < 0 || j >= mods.length) return
    ;[mods[i], mods[j]] = [mods[j], mods[i]]
    setModules(mods)
  }
  const toggleHidden = (id) =>
    setModules(settings.modules.map((m) => (m.id === id ? { ...m, hidden: !m.hidden } : m)))

  // Copia completa: ajustes + todos tus datos (tareas, finanzas, metas…)
  const exportData = () => {
    const payload = { exportedAt: new Date().toISOString(), settings }
    TABLES.forEach((t) => (payload[t] = data[t] || []))
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `summa-copia-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
    toast({ type: 'success', title: 'Copia completa exportada', desc: 'Incluye todos tus datos' })
  }
  const importData = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const r = new FileReader()
    r.onload = () => {
      try {
        const parsed = JSON.parse(r.result)
        update(parsed.settings || parsed)
        toast({ type: 'success', title: 'Ajustes restaurados', desc: 'Los datos viven en tu nube' })
      } catch {
        toast({ type: 'danger', title: 'Archivo no válido' })
      }
    }
    r.readAsText(file)
  }

  return (
    <PageContainer className="max-w-4xl">
      <PageHeader eyebrow="Configuración" title="Ajustes" subtitle="Haz de Summa tu espacio." />

      <div className="space-y-5">
        {/* Plan */}
        <Panel title="Tu plan" subtitle="Fase de prueba" icon={Sparkles}>
          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-success/40 bg-success/12 px-3 py-1 text-[13px] font-semibold text-success">
              ✦ Beta gratuita
            </span>
            <p className="text-[13px] text-muted">
              Summa es <strong className="text-ink">completamente gratis</strong> mientras estamos en fase de
              prueba: todas las funciones, sin límites y sin tarjeta.
            </p>
          </div>
        </Panel>

        {/* Cuenta */}
        <Panel title="Cuenta" subtitle="Tu sesión y sincronización" icon={KeyRound}>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-full bg-success/12 text-success">
                <Database size={18} />
              </span>
              <div>
                <p className="text-sm font-medium text-ink">{user?.email || 'Sesión activa'}</p>
                <p className="text-2xs text-success">Sincronizado con la nube</p>
              </div>
            </div>
            <div className="ml-auto flex gap-2.5">
              <Button variant="secondary" icon={Database} onClick={reconnect}>Cambiar conexión</Button>
              <Button variant="ghost" icon={LogOut} onClick={() => signOut()}>Cerrar sesión</Button>
            </div>
          </div>
          {installEvt && (
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-accent/25 bg-accent/[0.06] px-4 py-3">
              <div>
                <p className="text-sm font-semibold text-ink">Instala Summa como app</p>
                <p className="text-[13px] text-muted">Icono en tu pantalla de inicio, a un toque.</p>
              </div>
              <Button
                variant="primary"
                size="sm"
                onClick={async () => {
                  installEvt.prompt()
                  await installEvt.userChoice
                  setInstallEvt(null)
                }}
              >
                Instalar
              </Button>
            </div>
          )}
        </Panel>

        {/* Perfil */}
        <Panel title="Perfil" subtitle="Cómo te saluda la app" icon={User}>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label>Nombre</Label>
              <Input value={settings.name} onChange={(e) => update({ name: e.target.value })} />
            </div>
            <div>
              <Label>Rol / titular</Label>
              <Input value={settings.role} onChange={(e) => update({ role: e.target.value })} />
            </div>
            <div className="sm:col-span-2">
              <Label hint="aparece bajo el saludo del Inicio">Tu frase o mantra</Label>
              <Input placeholder="p. ej. Hecho es mejor que perfecto" value={settings.motto || ''} onChange={(e) => update({ motto: e.target.value })} />
            </div>
          </div>
        </Panel>

        {/* Preferencias */}
        <Panel title="Preferencias" subtitle="La app, a tu manera" icon={SlidersHorizontal}>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <Label hint="escala toda la interfaz">Tamaño del texto</Label>
              <Segmented
                value={settings.fontScale || 'md'}
                onChange={(fontScale) => update({ fontScale })}
                options={[
                  { value: 'sm', label: 'Compacto' },
                  { value: 'md', label: 'Normal' },
                  { value: 'lg', label: 'Grande' },
                ]}
              />
            </div>
            <div>
              <Label>Moneda</Label>
              <Select value={settings.currency || 'EUR'} onChange={(e) => update({ currency: e.target.value })}>
                {['EUR','USD','GBP','MXN','ARS','COP','CLP','PEN'].map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </Select>
            </div>
            <div>
              <Label hint="al abrir la app">Pantalla inicial</Label>
              <Select value={settings.startModule || 'inicio'} onChange={(e) => update({ startModule: e.target.value })}>
                {settings.modules.filter((m) => !m.hidden).map((m) => (
                  <option key={m.id} value={m.id}>{moduleName(settings, m.id)}</option>
                ))}
              </Select>
            </div>
            <div>
              <Label hint="oculta todas las cantidades (€)">Modo privacidad</Label>
              <div className="flex h-10 items-center justify-between rounded-lg border border-line bg-surface-2 px-3.5">
                <span className="text-sm text-ink">{settings.privacy ? 'Cantidades ocultas' : 'Cantidades visibles'}</span>
                <Switch checked={Boolean(settings.privacy)} onChange={() => update({ privacy: !settings.privacy })} />
              </div>
            </div>
          </div>
        </Panel>

        {/* Inicio a tu medida */}
        <Panel title="Inicio a tu medida" subtitle="Elige qué bloques ves en tu panel" icon={Home}>
          <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
            {HOME_WIDGETS.map((w) => {
              const conf = (settings.homeWidgets || []).find((x) => x.id === w.id)
              const visible = !conf?.hidden
              return (
                <label key={w.id} className="flex cursor-pointer items-center justify-between rounded-lg border border-line bg-surface-2/50 px-3.5 py-2.5">
                  <span className={cx('text-sm', visible ? 'text-ink' : 'text-subtle')}>{w.label}</span>
                  <Switch
                    checked={visible}
                    onChange={() => {
                      const list = HOME_WIDGETS.map((x) => {
                        const cur = (settings.homeWidgets || []).find((y) => y.id === x.id)
                        const hidden = x.id === w.id ? visible : Boolean(cur?.hidden)
                        return { id: x.id, hidden }
                      })
                      update({ homeWidgets: list })
                    }}
                  />
                </label>
              )
            })}
          </div>
          <p className="mb-2 mt-5 text-2xs font-semibold uppercase tracking-[0.12em] text-subtle">Accesos rápidos</p>
          <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
            {QUICK_ACTIONS.map((qa) => {
              const conf = (settings.quickActions || []).find((x) => x.id === qa.id)
              const visible = !conf?.hidden
              return (
                <label key={qa.id} className="flex cursor-pointer items-center justify-between rounded-lg border border-line bg-surface-2/50 px-3.5 py-2.5">
                  <span className={cx('text-sm', visible ? 'text-ink' : 'text-subtle')}>{qa.label}</span>
                  <Switch
                    checked={visible}
                    onChange={() => {
                      const list = QUICK_ACTIONS.map((x) => {
                        const cur = (settings.quickActions || []).find((y) => y.id === x.id)
                        const hidden = x.id === qa.id ? visible : Boolean(cur?.hidden)
                        return { id: x.id, hidden }
                      })
                      update({ quickActions: list })
                    }}
                  />
                </label>
              )
            })}
          </div>
        </Panel>

        {/* Tema + acento */}
        <Panel title="Tema y acento" subtitle="Modo de color y color principal" icon={Palette}>
          <Label>Modo</Label>
          <Segmented
            className="mb-5"
            value={settings.mode}
            onChange={(mode) => update({ mode })}
            options={[
              { value: 'dark', label: 'Oscuro', icon: Moon },
              { value: 'light', label: 'Claro', icon: Sun },
              { value: 'system', label: 'Sistema', icon: Monitor },
            ]}
          />

          <Label hint="Se aplica al instante en toda la app">Color de acento</Label>
          <div className="flex flex-wrap gap-2.5">
            {ACCENTS.map((a) => {
              const active = settings.accent?.hsl === a.hsl
              return (
                <button
                  key={a.id}
                  onClick={() => update({ accent: a })}
                  title={a.name}
                  className={cx(
                    'grid h-9 w-9 place-items-center rounded-full transition-transform hover:scale-110',
                    active && 'ring-2 ring-offset-2 ring-offset-surface'
                  )}
                  style={{ background: `hsl(${a.hsl})`, '--tw-ring-color': `hsl(${a.hsl})` }}
                >
                  {active && <Check size={16} strokeWidth={3} style={{ color: `hsl(${a.fg})` }} />}
                </button>
              )
            })}
          </div>

          <div className="mt-4">
            <Label hint="Tono personalizado">Personalizado</Label>
            <input
              type="range"
              min="0"
              max="360"
              defaultValue="243"
              onChange={(e) => update({ accent: customAccent(+e.target.value) })}
              className="h-2.5 w-full cursor-pointer appearance-none rounded-full"
              style={{
                background:
                  'linear-gradient(to right, hsl(0 80% 60%), hsl(60 80% 60%), hsl(120 70% 50%), hsl(180 70% 50%), hsl(240 80% 65%), hsl(300 80% 60%), hsl(360 80% 60%))',
              }}
            />
          </div>
        </Panel>

        {/* Módulos */}
        <Panel title="Módulos" subtitle="Ordena y muestra/oculta espacios" icon={LayoutGrid}>
          <div className="divide-y divide-line">
            {settings.modules.map((m, i) => {
              const meta = MODULES.find((x) => x.id === m.id)
              const Icon = ICONS[moduleIcon(settings, m.id)]
              return (
                <div key={m.id} className="flex items-center gap-3 py-2.5 first:pt-0 last:pb-0">
                  <div className="flex flex-col">
                    <button
                      onClick={() => moveModule(i, -1)}
                      disabled={i === 0}
                      className="text-subtle transition-colors hover:text-ink disabled:opacity-25"
                    >
                      <ChevronUp size={15} />
                    </button>
                    <button
                      onClick={() => moveModule(i, 1)}
                      disabled={i === settings.modules.length - 1}
                      className="text-subtle transition-colors hover:text-ink disabled:opacity-25"
                    >
                      <ChevronDown size={15} />
                    </button>
                  </div>
                  <button
                    title="Clic para cambiar el icono"
                    onClick={() => {
                      const cur = moduleIcon(settings, m.id)
                      const next = ICON_CHOICES[(ICON_CHOICES.indexOf(cur) + 1) % ICON_CHOICES.length]
                      update({ moduleIcons: { ...(settings.moduleIcons || {}), [m.id]: next } })
                    }}
                    className="grid h-8 w-8 place-items-center rounded-lg bg-surface-2 text-muted transition-all hover:scale-110 hover:text-accent"
                  >
                    <Icon size={16} />
                  </button>
                  <input
                    value={settings.moduleNames?.[m.id] ?? ''}
                    placeholder={meta.name}
                    onChange={(e) =>
                      update({ moduleNames: { ...(settings.moduleNames || {}), [m.id]: e.target.value } })
                    }
                    className={cx(
                      'h-8 flex-1 rounded-md border border-transparent bg-transparent px-2 text-sm font-medium transition-colors',
                      'hover:border-line focus:border-accent/50 focus:bg-surface focus:outline-none',
                      m.hidden ? 'text-subtle' : 'text-ink'
                    )}
                  />
                  {m.hidden ? <EyeOff size={15} className="text-subtle" /> : <Eye size={15} className="text-muted" />}
                  <Switch checked={!m.hidden} onChange={() => toggleHidden(m.id)} />
                </div>
              )
            })}
          </div>
        </Panel>

        {/* Backup */}
        <Panel title="Copia de seguridad" subtitle="Exporta o restaura tu configuración" icon={Download}>
          <div className="flex flex-wrap gap-2.5">
            <Button variant="secondary" icon={Download} onClick={exportData}>
              Exportar copia
            </Button>
            <Button variant="secondary" icon={Upload} onClick={() => fileRef.current?.click()}>
              Importar copia
            </Button>
            <input ref={fileRef} type="file" accept="application/json" hidden onChange={importData} />
            <Button
              variant="danger"
              icon={RotateCcw}
              onClick={() => {
                localStorage.removeItem('summa:settings')
                location.reload()
              }}
            >
              Restablecer
            </Button>
          </div>
        </Panel>
      </div>
    </PageContainer>
  )
}
