import { useRef } from 'react'
import {
  Moon, Sun, Monitor, Check, ChevronUp, ChevronDown, Eye, EyeOff,
  Download, Upload, RotateCcw, Palette, LayoutGrid, User, Sparkles,
  LogOut, Database, KeyRound,
} from 'lucide-react'
import { useApp } from '../context/AppContext'
import { useAuth } from '../context/AuthContext'
import { ACCENTS, DIRECTIONS, customAccent } from '../lib/theme'
import { MODULES } from '../lib/data'
import { ICONS } from '../components/layout/icons'
import { PageContainer, PageHeader } from '../components/layout/Page'
import { Card, CardHeader, CardBody, Button, Input, Label, Segmented, Switch, SectionTitle } from '../components/ui'
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
  const { settings, update, toast } = useApp()
  const { user, signOut } = useAuth()
  const fileRef = useRef()

  const reconnect = () => {
    localStorage.removeItem('nucleo:sb_url')
    localStorage.removeItem('nucleo:sb_key')
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

  const exportData = () => {
    const blob = new Blob([JSON.stringify(settings, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'nucleo-backup.json'
    a.click()
    URL.revokeObjectURL(url)
    toast({ type: 'success', title: 'Copia exportada', desc: 'nucleo-backup.json' })
  }
  const importData = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const r = new FileReader()
    r.onload = () => {
      try {
        update(JSON.parse(r.result))
        toast({ type: 'success', title: 'Copia restaurada' })
      } catch {
        toast({ type: 'danger', title: 'Archivo no válido' })
      }
    }
    r.readAsText(file)
  }

  return (
    <PageContainer className="max-w-4xl">
      <PageHeader eyebrow="Configuración" title="Ajustes" subtitle="Haz de Núcleo tu espacio." />

      <div className="space-y-5">
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
          </div>
        </Panel>

        {/* Dirección visual — las dos direcciones */}
        <Panel title="Dirección visual" subtitle="Elige la personalidad de la interfaz" icon={Sparkles}>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {DIRECTIONS.map((d) => {
              const active = settings.direction === d.id
              return (
                <button
                  key={d.id}
                  onClick={() => update({ direction: d.id })}
                  className={cx(
                    'relative overflow-hidden rounded-xl border p-4 text-left transition-all',
                    active ? 'border-accent ring-2 ring-accent/20' : 'border-line hover:border-line-strong'
                  )}
                >
                  {active && (
                    <span className="absolute right-3 top-3 grid h-5 w-5 place-items-center rounded-full bg-accent text-accent-fg">
                      <Check size={13} strokeWidth={3} />
                    </span>
                  )}
                  {/* mini-preview */}
                  <div className="mb-3 flex gap-1.5">
                    {(d.id === 'eclipse'
                      ? ['222 24% 9%', '243 76% 64%', '220 15% 18%', '210 30% 98%']
                      : ['28 14% 9%', '36 92% 55%', '32 9% 19%', '40 30% 97%']
                    ).map((c, i) => (
                      <span key={i} className="h-9 flex-1 rounded-md" style={{ background: `hsl(${c})` }} />
                    ))}
                  </div>
                  <p className="font-display text-base font-bold text-ink">{d.name}</p>
                  <p className="text-2xs font-medium uppercase tracking-wide text-accent">{d.tagline}</p>
                  <p className="mt-1.5 text-[13px] leading-relaxed text-muted">{d.desc}</p>
                </button>
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
              const Icon = ICONS[meta.icon]
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
                  <span className="grid h-8 w-8 place-items-center rounded-lg bg-surface-2 text-muted">
                    <Icon size={16} />
                  </span>
                  <span className={cx('flex-1 text-sm font-medium', m.hidden ? 'text-subtle' : 'text-ink')}>
                    {meta.name}
                  </span>
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
                localStorage.removeItem('nucleo:settings')
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
