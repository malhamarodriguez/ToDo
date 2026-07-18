import { useEffect, useRef, useState } from 'react'
import {
  Moon, Sun, Monitor, Clock3, Check, ChevronUp, ChevronDown, Eye, EyeOff,
  Download, Upload, Palette, LayoutGrid, User, Sparkles, LogOut, Database,
  KeyRound, Home, Type, Search, Shapes, Zap,
  AlertTriangle, X, Plus, Wallet, ListChecks, Dumbbell, Target, NotebookPen,
  PanelLeft, Coins, Wand2,
} from 'lucide-react'
import { useApp, migrateSettings } from '../context/AppContext'
import { useAuth } from '../context/AuthContext'
import { useData, TABLES } from '../context/DataContext'
import {
  ACCENTS, PRESETS, FAMILIES, DENSITIES, ANIMS, BORDER_WIDTHS, HEADING_WEIGHTS,
  SHADOW_STYLES, BG_FX, customAccent, fgForTriplet, getPreset, resolveMode,
  resolveTokens, hslToHex, hexToHsl, contrastRatio, surpriseTheme, exportTheme,
  validateTheme,
} from '../lib/theme'
import {
  MODULES, ICON_CHOICES, EMOJI_CHOICES, PRIORITIES, prioMeta, moduleName,
  moduleIcon, moduleEmoji, HOME_WIDGETS, QUICK_ACTIONS, COLOR_CHOICES,
} from '../lib/data'
import { ICONS } from '../components/layout/icons'
import { ModuleGlyph } from '../components/layout/ModuleGlyph'
import { PageContainer, PageHeader } from '../components/layout/Page'
import { Button, Input, Label, Segmented, Switch, Select } from '../components/ui'
import { Panel, SectionHead, DndList, Grip, ConfirmButton } from '../components/ajustes/common'
import { ImportBackupModal } from '../components/ajustes/ImportBackup'
import { buildBackup, validateBackup, agoLabel } from '../lib/backup'
import { cx, renderGreeting } from '../lib/utils'

// Claves de cada sección (para "modificado" + restablecer)
const KEYS = {
  identidad: ['appName', 'appIcon', 'name', 'role', 'motto', 'greeting'],
  apariencia: ['mode', 'preset', 'accent', 'themeOverrides', 'font', 'radius', 'shadow', 'borderW', 'headingWeight', 'density', 'anim', 'bgFx', 'fontScale', 'moduleAccents'],
  navegacion: ['modules', 'moduleNames', 'moduleIcons', 'startModule', 'sidebarCollapsed', 'homeWidgets', 'quickActions', 'moduleViews'],
  modulos: ['currency', 'numberLocale', 'timeFormat', 'weekStart', 'privacy', 'financeCategories', 'doneBehavior', 'priorityNames', 'priorityColors', 'units', 'goalStyle', 'journalFont', 'journalWidth'],
}

const SECTIONS = [
  { id: 'sec-identidad', label: 'Identidad' },
  { id: 'sec-apariencia', label: 'Apariencia' },
  { id: 'sec-navegacion', label: 'Diseño y navegación' },
  { id: 'sec-modulos', label: 'Módulos' },
  { id: 'sec-poder', label: 'Poder total' },
  { id: 'sec-cuenta', label: 'Cuenta y datos' },
]

// ---------- Tarjeta de preset ----------
function PresetCard({ p, mode, active, onClick }) {
  const t = p[mode] || p.dark
  return (
    <button
      onClick={onClick}
      className={cx(
        'group relative w-full overflow-hidden rounded-xl border text-left transition-all hover:-translate-y-0.5',
        active ? 'border-accent shadow-glow' : 'border-line hover:border-line-strong'
      )}
      style={{ background: `hsl(${t.bg})` }}
    >
      <div className="p-3">
        <div
          className="rounded-md border px-2.5 py-2"
          style={{ background: `hsl(${t.surface})`, borderColor: `hsl(${t.border})`, borderRadius: Math.max(4, p.radius) }}
        >
          <div className="mb-1.5 h-1.5 w-2/3 rounded-full" style={{ background: `hsl(${t.text} / 0.85)` }} />
          <div className="mb-2 h-1.5 w-1/3 rounded-full" style={{ background: `hsl(${t.textSubtle || t.textMuted} / 0.6)` }} />
          <div className="flex items-center gap-1">
            <span className="h-3.5 w-8 rounded-sm" style={{ background: `hsl(${t.accent})`, borderRadius: Math.max(2, p.radius - 3) }} />
            {(t.viz || []).slice(1, 4).map((v, i) => (
              <span key={i} className="h-2 w-2 rounded-full" style={{ background: `hsl(${v})` }} />
            ))}
          </div>
        </div>
      </div>
      <div className="border-t px-3 py-2" style={{ borderColor: `hsl(${t.border})` }}>
        <p className="text-[13px] font-semibold leading-tight" style={{ color: `hsl(${t.text})` }}>
          {p.name}
          {active && <Check size={13} strokeWidth={3} className="ml-1.5 inline text-accent" />}
        </p>
        <p className="mt-0.5 truncate text-2xs" style={{ color: `hsl(${t.textMuted || t.textSubtle})` }}>{p.tagline}</p>
      </div>
    </button>
  )
}

// ---------- Editor de color con aviso de contraste ----------
const EDIT_TOKENS = [
  { key: 'bg', label: 'Fondo' },
  { key: 'surface', label: 'Tarjetas' },
  { key: 'surface2', label: 'Superficie secundaria' },
  { key: 'text', label: 'Texto' },
  { key: 'accent', label: 'Acento' },
]

function ThemeEditor({ settings, update }) {
  const mode = resolveMode(settings.mode)
  const resolved = resolveTokens(settings, mode)
  const current = {
    bg: resolved.vars['--bg'],
    surface: resolved.vars['--surface'],
    surface2: resolved.vars['--surface-2'],
    text: resolved.vars['--text'],
    accent: resolved.vars['--accent'],
  }
  const over = settings.themeOverrides?.[mode] || {}

  const setToken = (key, hex) => {
    const hsl = hexToHsl(hex)
    const next = { ...over, [key]: hsl }
    if (key === 'accent') next.accentFg = fgForTriplet(hsl)
    update({ themeOverrides: { ...(settings.themeOverrides || {}), [mode]: next } })
  }
  const clear = () =>
    update({ themeOverrides: { ...(settings.themeOverrides || {}), [mode]: {} } })

  // Avisos WCAG AA (avisar, nunca prohibir)
  const warns = []
  const pair = (a, b, what) => {
    const r = contrastRatio(a, b)
    if (r < 4.5) warns.push({ what, r: r.toFixed(1) })
  }
  pair(current.text, current.bg, 'Texto sobre fondo')
  pair(current.text, current.surface, 'Texto sobre tarjetas')
  pair(resolved.vars['--accent-fg'], current.accent, 'Texto de los botones de acento')

  return (
    <>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {EDIT_TOKENS.map((t) => (
          <label
            key={t.key}
            className="flex cursor-pointer items-center justify-between gap-3 rounded-lg border border-line bg-surface-2/50 px-3.5 py-2.5"
          >
            <span className="text-sm text-ink">
              {t.label}
              {over[t.key] && <span className="ml-2 font-mono text-2xs text-accent">editado</span>}
            </span>
            <span className="flex items-center gap-2">
              <span className="font-mono text-2xs uppercase text-subtle">{hslToHex(current[t.key])}</span>
              <input
                type="color"
                value={hslToHex(current[t.key])}
                onChange={(e) => setToken(t.key, e.target.value)}
                className="h-7 w-9 cursor-pointer rounded border border-line bg-transparent p-0.5"
              />
            </span>
          </label>
        ))}
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-3">
        {Object.keys(over).length > 0 && (
          <Button variant="secondary" size="sm" icon={X} onClick={clear}>
            Quitar ediciones ({mode === 'dark' ? 'modo oscuro' : 'modo claro'})
          </Button>
        )}
        {warns.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {warns.map((w) => (
              <span
                key={w.what}
                className="inline-flex items-center gap-1.5 rounded-full border border-warning/35 bg-warning/10 px-2.5 py-1 text-2xs font-medium text-warning"
              >
                <AlertTriangle size={12} /> {w.what}: contraste {w.r}:1 (AA pide 4.5)
              </span>
            ))}
          </div>
        ) : (
          <span className="font-mono text-2xs text-success">✓ Contraste AA correcto</span>
        )}
      </div>
    </>
  )
}

// ---------- Selector de icono/emoji por módulo ----------
function GlyphPicker({ settings, modId, update, onClose }) {
  const [emoji, setEmoji] = useState('')
  const setIcon = (name) => {
    update({ moduleIcons: { ...(settings.moduleIcons || {}), [modId]: name } })
    onClose()
  }
  return (
    <div className="mt-2 rounded-xl border border-line bg-surface-2/60 p-3">
      <p className="mb-2 font-mono text-2xs uppercase tracking-wide text-subtle">Icono</p>
      <div className="flex flex-wrap gap-1.5">
        {ICON_CHOICES.map((name) => {
          const Icon = ICONS[name]
          return (
            <button
              key={name}
              onClick={() => setIcon(name)}
              className={cx(
                'grid h-8 w-8 place-items-center rounded-lg border transition-all hover:scale-110',
                moduleIcon(settings, modId) === name && !moduleEmoji(settings, modId)
                  ? 'border-accent bg-accent/12 text-accent'
                  : 'border-line bg-surface text-muted'
              )}
            >
              <Icon size={15} />
            </button>
          )
        })}
      </div>
      <p className="mb-2 mt-3 font-mono text-2xs uppercase tracking-wide text-subtle">O un emoji</p>
      <div className="flex flex-wrap items-center gap-1.5">
        {EMOJI_CHOICES.map((e) => (
          <button
            key={e}
            onClick={() => setIcon(`emoji:${e}`)}
            className={cx(
              'grid h-8 w-8 place-items-center rounded-lg border text-[15px] transition-all hover:scale-110',
              moduleEmoji(settings, modId) === e ? 'border-accent bg-accent/12' : 'border-line bg-surface'
            )}
          >
            {e}
          </button>
        ))}
        <input
          value={emoji}
          onChange={(e) => setEmoji(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && emoji.trim()) setIcon(`emoji:${emoji.trim().slice(0, 4)}`)
          }}
          placeholder="otro…"
          className="h-8 w-16 rounded-lg border border-line bg-surface px-2 text-center text-sm focus:border-accent/50 focus:outline-none"
        />
      </div>
    </div>
  )
}

// ---------- Página ----------
export default function Ajustes() {
  const { settings, update, toast } = useApp()
  const { user, signOut } = useAuth()
  const data = useData()
  const { restoreData } = data
  const fileRef = useRef()
  const themeFileRef = useRef()
  const [q, setQ] = useState('')
  const [installEvt, setInstallEvt] = useState(null)
  const [pickerFor, setPickerFor] = useState(null)
  const [pendingBackup, setPendingBackup] = useState(null)
  const [restoring, setRestoring] = useState(false)
  const [moreBackup, setMoreBackup] = useState(false)
  const [catDraft, setCatDraft] = useState('')

  const mode = resolveMode(settings.mode)
  const preset = getPreset(settings.preset)

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
  const visibleCount = settings.modules.filter((m) => !m.hidden).length
  const toggleHidden = (id) => {
    const target = settings.modules.find((m) => m.id === id)
    if (!target.hidden && visibleCount <= 1) {
      return toast({ type: 'warning', title: 'Al menos un módulo visible', desc: 'Muestra otro antes de ocultar este.' })
    }
    setModules(settings.modules.map((m) => (m.id === id ? { ...m, hidden: !m.hidden } : m)))
  }

  // Copia completa: ajustes + todos tus datos (tareas, finanzas, metas…)
  const exportData = () => {
    const payload = buildBackup(settings, data)
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `summa-copia-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
    update({ lastBackupAt: new Date().toISOString() })
    toast({ type: 'success', title: 'Copia completa exportada', desc: 'Ajustes + todos tus datos' })
  }
  // Import: valida, enseña la vista previa y espera confirmación.
  const importData = (e) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    const r = new FileReader()
    r.onload = () => {
      try {
        setPendingBackup(validateBackup(JSON.parse(r.result)))
      } catch (err) {
        toast({ type: 'danger', title: 'Copia no válida', desc: err.message })
      }
    }
    r.readAsText(file)
  }
  const confirmRestore = async (mode) => {
    const b = pendingBackup
    setRestoring(true)
    try {
      if (b.settings) update(migrateSettings(b.settings))
      let n = 0
      if (mode !== 'ajustes') n = await restoreData(b.tables, mode)
      setPendingBackup(null)
      toast({
        type: 'success',
        title: 'Copia restaurada',
        desc: mode === 'ajustes' ? 'Ajustes aplicados' : `${n} elementos procesados`,
      })
    } catch (err) {
      toast({ type: 'danger', title: 'No se pudo restaurar', desc: err.message })
    } finally {
      setRestoring(false)
    }
  }

  // Ordenación de widgets del Inicio (lista completa con hidden)
  const widgetList = HOME_WIDGETS.map((w) => {
    const cur = (settings.homeWidgets || []).find((x) => x.id === w.id)
    return { ...w, hidden: Boolean(cur?.hidden) }
  }).sort((a, b) => {
    const ia = (settings.homeWidgets || []).findIndex((x) => x.id === a.id)
    const ib = (settings.homeWidgets || []).findIndex((x) => x.id === b.id)
    return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib)
  })

  const searching = q.trim().length > 0

  return (
    <PageContainer className="max-w-4xl">
      <PageHeader eyebrow="Configuración" title="Ajustes" subtitle="Tu Summa, a tu medida — cada cambio se aplica al instante." />

      {/* Buscador + índice */}
      <div className="mb-5 space-y-3">
        <div className="relative">
          <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-subtle" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar un ajuste… (tema, moneda, semana, emoji…)"
            className="h-11 w-full rounded-xl border border-line bg-surface pl-10 pr-9 text-sm text-ink placeholder:text-subtle focus:border-accent/50 focus:outline-none"
          />
          {q && (
            <button onClick={() => setQ('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-subtle hover:text-ink">
              <X size={15} />
            </button>
          )}
        </div>
        {!searching && (
          <div className="flex flex-wrap gap-2">
            {SECTIONS.map((s) => (
              <button
                key={s.id}
                onClick={() => document.getElementById(s.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                className="rounded-full border border-line bg-surface px-3 py-1.5 text-[13px] font-medium text-muted transition-colors hover:border-accent/40 hover:text-accent"
              >
                {s.label}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-5">
        {/* ================= IDENTIDAD ================= */}
        {!searching && <SectionHead id="sec-identidad" title="Identidad" settings={settings} keysList={KEYS.identidad} update={update} />}

        <Panel q={q} keys="nombre app instancia logo emoji marca titulo" title="Tu app" subtitle="Ponle nombre e icono a tu Summa" icon={Sparkles}>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label hint="aparece en el menú y en el título">Nombre de la app</Label>
              <Input placeholder="Summa" value={settings.appName || ''} onChange={(e) => update({ appName: e.target.value })} />
            </div>
            <div>
              <Label hint="sustituye a la Σ del logo">Emoji del logo</Label>
              <div className="flex items-center gap-2">
                <Input
                  placeholder="Σ"
                  value={settings.appIcon || ''}
                  onChange={(e) => update({ appIcon: e.target.value.slice(0, 4) })}
                  className="w-24 text-center"
                />
                <div className="flex flex-wrap gap-1">
                  {EMOJI_CHOICES.slice(0, 8).map((e) => (
                    <button
                      key={e}
                      onClick={() => update({ appIcon: e })}
                      className="grid h-8 w-8 place-items-center rounded-lg border border-line text-[15px] hover:border-accent/40"
                    >
                      {e}
                    </button>
                  ))}
                  {settings.appIcon && (
                    <button onClick={() => update({ appIcon: '' })} className="grid h-8 w-8 place-items-center rounded-lg border border-line text-subtle hover:text-ink">
                      <X size={13} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </Panel>

        <Panel q={q} keys="perfil nombre rol mantra frase saludo variables fecha hora" title="Perfil y saludo" subtitle="Cómo te recibe la app cada día" icon={User}>
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
            <div className="sm:col-span-2">
              <Label hint="variables: {nombre} {fecha} {hora} · vacío = saludo automático">Saludo personalizado</Label>
              <Input
                placeholder="p. ej. A por ello, {nombre} — {fecha}"
                value={settings.greeting || ''}
                onChange={(e) => update({ greeting: e.target.value })}
              />
              <p className="mt-2 rounded-lg border border-line bg-surface-2/60 px-3 py-2 text-[13px] text-muted">
                Vista previa: <span className="font-semibold text-ink">{renderGreeting(settings.greeting, settings.name || 'Marco')}</span>
              </p>
            </div>
          </div>
        </Panel>

        {/* ================= APARIENCIA ================= */}
        {!searching && <SectionHead id="sec-apariencia" title="Apariencia" settings={settings} keysList={KEYS.apariencia} update={update} />}

        <Panel q={q} keys="tema preset modo oscuro claro sistema franja horaria noche papel bosque terminal contraste neon tinta amanecer ejecutivo electrico" title="Tema" subtitle="Modo de color y preset base" icon={Palette}>
          <Label>Modo</Label>
          <Segmented
            className="mb-5"
            value={settings.mode}
            onChange={(m) => update({ mode: m })}
            options={[
              { value: 'dark', label: 'Oscuro', icon: Moon },
              { value: 'light', label: 'Claro', icon: Sun },
              { value: 'system', label: 'Sistema', icon: Monitor },
              { value: 'franja', label: 'Por hora', icon: Clock3 },
            ]}
          />
          {settings.mode === 'franja' && (
            <p className="-mt-3 mb-4 text-2xs text-subtle">Claro de 07:00 a 21:00, oscuro por la noche.</p>
          )}

          <Label hint="cada preset trae colores, fuente, radios, sombras y fondo — luego afínalo a tu gusto">Preset</Label>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {PRESETS.map((p) => (
              <PresetCard
                key={p.id}
                p={p}
                mode={mode}
                active={settings.preset === p.id}
                onClick={() =>
                  update({
                    preset: p.id,
                    accent: null,
                    themeOverrides: {},
                    font: null,
                    radius: null,
                    shadow: null,
                    borderW: null,
                    bgFx: null,
                  })
                }
              />
            ))}
          </div>
        </Panel>

        <Panel q={q} keys="acento color principal modulo modulos por-modulo" title="Acento" subtitle="El color protagonista, global o por módulo" icon={Zap}>
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => update({ accent: null })}
              className={cx(
                'rounded-full border px-3 py-1.5 text-[13px] font-medium transition-colors',
                !settings.accent ? 'border-accent bg-accent/12 text-accent' : 'border-line text-muted hover:text-ink'
              )}
            >
              Del preset ({preset.name})
            </button>
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
            <Label hint="tono personalizado">Personalizado</Label>
            <input
              type="range"
              min="0"
              max="360"
              defaultValue="186"
              onChange={(e) => update({ accent: customAccent(+e.target.value) })}
              className="h-2.5 w-full cursor-pointer appearance-none rounded-full"
              style={{
                background:
                  'linear-gradient(to right, hsl(0 80% 60%), hsl(60 80% 60%), hsl(120 70% 50%), hsl(180 70% 50%), hsl(240 80% 65%), hsl(300 80% 60%), hsl(360 80% 60%))',
              }}
            />
          </div>

          <p className="mb-2 mt-5 font-mono text-2xs font-medium uppercase tracking-[0.12em] text-subtle">
            Acento por módulo <span className="normal-case tracking-normal">(opcional — p. ej. finanzas en verde)</span>
          </p>
          <div className="space-y-1.5">
            {settings.modules.filter((m) => !m.hidden).map((m) => {
              const cur = settings.moduleAccents?.[m.id]
              return (
                <div key={m.id} className="flex items-center gap-3 rounded-lg border border-line bg-surface-2/40 px-3 py-2">
                  <ModuleGlyph settings={settings} id={m.id} size={16} className="text-muted" />
                  <span className="min-w-0 flex-1 truncate text-sm text-ink">{moduleName(settings, m.id)}</span>
                  <button
                    onClick={() => {
                      const next = { ...(settings.moduleAccents || {}) }
                      delete next[m.id]
                      update({ moduleAccents: next })
                    }}
                    className={cx(
                      'rounded-full border px-2 py-0.5 font-mono text-2xs transition-colors',
                      !cur ? 'border-accent/50 text-accent' : 'border-line text-subtle hover:text-ink'
                    )}
                  >
                    global
                  </button>
                  {ACCENTS.slice(0, 8).map((a) => (
                    <button
                      key={a.id}
                      title={a.name}
                      onClick={() => update({ moduleAccents: { ...(settings.moduleAccents || {}), [m.id]: { hsl: a.hsl, fg: a.fg } } })}
                      className={cx('h-5 w-5 rounded-full transition-transform hover:scale-125', cur?.hsl === a.hsl && 'ring-2 ring-offset-1 ring-offset-surface')}
                      style={{ background: `hsl(${a.hsl})`, '--tw-ring-color': `hsl(${a.hsl})` }}
                    />
                  ))}
                </div>
              )
            })}
          </div>
        </Panel>

        <Panel q={q} keys="editor colores fondo tarjetas texto hex personalizar contraste wcag accesibilidad" title="Editor de tema" subtitle={`Ajusta los colores del modo ${mode === 'dark' ? 'oscuro' : 'claro'} actual`} icon={Palette}>
          <ThemeEditor settings={settings} update={update} />
        </Panel>

        <Panel q={q} keys="tipografia fuente letra tamaño titulares peso serif mono" title="Tipografía" subtitle="Familia, tamaño y titulares" icon={Type}>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <Label>Familia</Label>
              <Select
                value={settings.font || ''}
                onChange={(e) => update({ font: e.target.value || null })}
              >
                <option value="">Del preset ({FAMILIES.find((f) => f.id === preset.font)?.name})</option>
                {FAMILIES.map((f) => (
                  <option key={f.id} value={f.id}>{f.name} — {f.hint}</option>
                ))}
              </Select>
            </div>
            <div>
              <Label hint="escala toda la interfaz">Tamaño del texto</Label>
              <Segmented
                value={settings.fontScale || 'md'}
                onChange={(fontScale) => update({ fontScale })}
                options={[
                  { value: 'sm', label: 'S' },
                  { value: 'md', label: 'M' },
                  { value: 'lg', label: 'L' },
                  { value: 'xl', label: 'XL' },
                ]}
              />
            </div>
            <div>
              <Label>Peso de titulares</Label>
              <Segmented
                value={settings.headingWeight || 'normal'}
                onChange={(headingWeight) => update({ headingWeight })}
                options={HEADING_WEIGHTS.map((h) => ({ value: h.id, label: h.name }))}
              />
            </div>
          </div>
        </Panel>

        <Panel q={q} keys="forma radio bordes esquinas redondeado pill sombras brillo glow densidad compacta animaciones movimiento fondo halos malla puntos degradado" title="Forma y sensación" subtitle="Radios, bordes, sombras, densidad, animaciones y fondo" icon={Shapes}>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <div className="flex items-center justify-between">
                <Label>Radio de esquinas</Label>
                {settings.radius != null && (
                  <button onClick={() => update({ radius: null })} className="font-mono text-2xs text-accent hover:underline">
                    del preset ({preset.radius}px)
                  </button>
                )}
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="0"
                  max="20"
                  value={settings.radius ?? preset.radius}
                  onChange={(e) => update({ radius: +e.target.value })}
                  className="h-2.5 flex-1 cursor-pointer appearance-none rounded-full bg-surface-2"
                />
                <span className="w-12 rounded-md border border-line bg-surface-2 px-1.5 py-1 text-center font-mono text-2xs text-ink">
                  {settings.radius ?? preset.radius}px
                </span>
              </div>
            </div>
            <div>
              <Label>Grosor de bordes</Label>
              <Segmented
                value={settings.borderW || preset.borderW || 'fino'}
                onChange={(borderW) => update({ borderW })}
                options={BORDER_WIDTHS.map((b) => ({ value: b.id, label: b.name }))}
              />
            </div>
            <div>
              <Label>Sombras</Label>
              <Segmented
                value={settings.shadow || preset.shadow}
                onChange={(shadow) => update({ shadow })}
                options={SHADOW_STYLES.map((s) => ({ value: s.id, label: s.name }))}
              />
            </div>
            <div>
              <Label>Densidad</Label>
              <Segmented
                value={settings.density || 'normal'}
                onChange={(density) => update({ density })}
                options={DENSITIES.map((d) => ({ value: d.id, label: d.name }))}
              />
            </div>
            <div>
              <Label hint="respeta la reducción de movimiento del sistema">Animaciones</Label>
              <Segmented
                value={settings.anim || 'completas'}
                onChange={(anim) => update({ anim })}
                options={ANIMS.map((a) => ({ value: a.id, label: a.name }))}
              />
            </div>
            <div className="sm:col-span-2">
              <Label>Fondo de la app</Label>
              <Segmented
                value={settings.bgFx || preset.bgFx}
                onChange={(bgFx) => update({ bgFx })}
                className="w-full [&>button]:flex-1"
                options={BG_FX.map((b) => ({ value: b.id, label: b.name }))}
              />
            </div>
          </div>
        </Panel>

        {/* ================= DISEÑO Y NAVEGACIÓN ================= */}
        {!searching && <SectionHead id="sec-navegacion" title="Diseño y navegación" settings={settings} keysList={KEYS.navegacion} update={update} />}

        <Panel q={q} keys="modulos ordenar arrastrar renombrar ocultar iconos emoji espacios" title="Módulos" subtitle="Arrastra para ordenar, renombra y elige icono o emoji" icon={LayoutGrid}>
          <DndList
            items={settings.modules}
            onReorder={setModules}
            className="divide-y divide-line"
            render={(m, i) => {
              const meta = MODULES.find((x) => x.id === m.id)
              return (
                <div className="py-2.5 first:pt-0 last:pb-0">
                  <div className="flex items-center gap-2.5">
                    <Grip />
                    <div className="flex flex-col">
                      <button onClick={() => moveModule(i, -1)} disabled={i === 0} className="text-subtle transition-colors hover:text-ink disabled:opacity-25">
                        <ChevronUp size={14} />
                      </button>
                      <button onClick={() => moveModule(i, 1)} disabled={i === settings.modules.length - 1} className="text-subtle transition-colors hover:text-ink disabled:opacity-25">
                        <ChevronDown size={14} />
                      </button>
                    </div>
                    <button
                      title="Cambiar icono o emoji"
                      onClick={() => setPickerFor(pickerFor === m.id ? null : m.id)}
                      className={cx(
                        'grid h-8 w-8 place-items-center rounded-lg bg-surface-2 text-muted transition-all hover:scale-110 hover:text-accent',
                        pickerFor === m.id && 'ring-1 ring-accent'
                      )}
                    >
                      <ModuleGlyph settings={settings} id={m.id} size={16} />
                    </button>
                    <input
                      value={settings.moduleNames?.[m.id] ?? ''}
                      placeholder={meta.name}
                      onChange={(e) => update({ moduleNames: { ...(settings.moduleNames || {}), [m.id]: e.target.value } })}
                      className={cx(
                        'h-8 min-w-0 flex-1 rounded-md border border-transparent bg-transparent px-2 text-sm font-medium transition-colors',
                        'hover:border-line focus:border-accent/50 focus:bg-surface focus:outline-none',
                        m.hidden ? 'text-subtle' : 'text-ink'
                      )}
                    />
                    {m.hidden ? <EyeOff size={15} className="text-subtle" /> : <Eye size={15} className="text-muted" />}
                    <Switch checked={!m.hidden} onChange={() => toggleHidden(m.id)} />
                  </div>
                  {pickerFor === m.id && (
                    <GlyphPicker settings={settings} modId={m.id} update={update} onClose={() => setPickerFor(null)} />
                  )}
                </div>
              )
            }}
          />
        </Panel>

        <Panel q={q} keys="navegacion pantalla inicial menu lateral plegado colapsado vista kanban lista" title="Navegación" subtitle="Cómo te mueves por la app" icon={PanelLeft}>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <Label hint="al abrir la app">Pantalla inicial</Label>
              <Select value={settings.startModule || 'inicio'} onChange={(e) => update({ startModule: e.target.value })}>
                <option value="hoy">Hoy (minimalista)</option>
                {settings.modules.filter((m) => !m.hidden).map((m) => (
                  <option key={m.id} value={m.id}>{moduleName(settings, m.id)}</option>
                ))}
              </Select>
            </div>
            <div>
              <Label hint="en Negocio">Vista por defecto</Label>
              <Segmented
                value={settings.moduleViews?.negocio || 'kanban'}
                onChange={(v) => update({ moduleViews: { ...(settings.moduleViews || {}), negocio: v } })}
                options={[
                  { value: 'kanban', label: 'Kanban' },
                  { value: 'lista', label: 'Lista' },
                ]}
              />
            </div>
            <div className="sm:col-span-2">
              <Label hint="solo escritorio">Menú lateral</Label>
              <div className="flex h-10 items-center justify-between rounded-lg border border-line bg-surface-2 px-3.5">
                <span className="text-sm text-ink">{settings.sidebarCollapsed ? 'Plegado (solo iconos)' : 'Expandido'}</span>
                <Switch checked={!settings.sidebarCollapsed} onChange={() => update({ sidebarCollapsed: !settings.sidebarCollapsed })} />
              </div>
            </div>
          </div>
        </Panel>

        <Panel q={q} keys="inicio widgets bloques panel ordenar accesos rapidos" title="Inicio a tu medida" subtitle="Arrastra para ordenar los bloques; apaga los que no uses" icon={Home}>
          <DndList
            items={widgetList}
            onReorder={(arr) => update({ homeWidgets: arr.map((w) => ({ id: w.id, hidden: w.hidden })) })}
            className="grid grid-cols-1 gap-1.5 sm:grid-cols-2"
            render={(w) => (
              <div className="flex cursor-grab items-center justify-between rounded-lg border border-line bg-surface-2/50 px-3 py-2.5">
                <span className="flex min-w-0 items-center gap-2">
                  <Grip />
                  <span className={cx('truncate text-sm', w.hidden ? 'text-subtle' : 'text-ink')}>{w.label}</span>
                </span>
                <Switch
                  checked={!w.hidden}
                  onChange={() =>
                    update({
                      homeWidgets: widgetList.map((x) => ({ id: x.id, hidden: x.id === w.id ? !w.hidden : x.hidden })),
                    })
                  }
                />
              </div>
            )}
          />
          <p className="mb-2 mt-5 font-mono text-2xs font-medium uppercase tracking-[0.12em] text-subtle">Accesos rápidos</p>
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
                        return { id: x.id, hidden: x.id === qa.id ? visible : Boolean(cur?.hidden) }
                      })
                      update({ quickActions: list })
                    }}
                  />
                </label>
              )
            })}
          </div>
        </Panel>

        {/* ================= MÓDULOS ================= */}
        {!searching && <SectionHead id="sec-modulos" title="Módulos, al detalle" settings={settings} keysList={KEYS.modulos} update={update} />}

        <Panel q={q} keys="formato numeros fecha hora semana lunes domingo 12h 24h moneda divisa privacidad" title="Formatos" subtitle="Moneda, números, hora y semana" icon={Coins}>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <Label>Moneda</Label>
              <Select value={settings.currency || 'EUR'} onChange={(e) => update({ currency: e.target.value })}>
                {['EUR', 'USD', 'GBP', 'MXN', 'ARS', 'COP', 'CLP', 'PEN'].map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </Select>
            </div>
            <div>
              <Label>Formato de números</Label>
              <Segmented
                value={settings.numberLocale || 'es-ES'}
                onChange={(numberLocale) => update({ numberLocale })}
                options={[
                  { value: 'es-ES', label: '1.234,56' },
                  { value: 'en-US', label: '1,234.56' },
                ]}
              />
            </div>
            <div>
              <Label>Formato de hora</Label>
              <Segmented
                value={settings.timeFormat || '24h'}
                onChange={(timeFormat) => update({ timeFormat })}
                options={[
                  { value: '24h', label: '13:30' },
                  { value: '12h', label: '1:30 PM' },
                ]}
              />
            </div>
            <div>
              <Label hint="afecta al calendario">La semana empieza en</Label>
              <Segmented
                value={settings.weekStart || 'lunes'}
                onChange={(weekStart) => update({ weekStart })}
                options={[
                  { value: 'lunes', label: 'Lunes' },
                  { value: 'domingo', label: 'Domingo' },
                ]}
              />
            </div>
            <div className="sm:col-span-2">
              <Label hint="oculta todas las cantidades (€)">Modo privacidad</Label>
              <div className="flex h-10 items-center justify-between rounded-lg border border-line bg-surface-2 px-3.5">
                <span className="text-sm text-ink">{settings.privacy ? 'Cantidades ocultas' : 'Cantidades visibles'}</span>
                <Switch checked={Boolean(settings.privacy)} onChange={() => update({ privacy: !settings.privacy })} />
              </div>
            </div>
          </div>
        </Panel>

        <Panel q={q} keys="finanzas categorias colores gastos ingresos" title="Finanzas · categorías" subtitle="Tus categorías con color — salen como sugerencia al registrar" icon={Wallet}>
          <div className="space-y-1.5">
            {(settings.financeCategories || []).map((c, i) => (
              <div key={i} className="flex items-center gap-2.5 rounded-lg border border-line bg-surface-2/40 px-3 py-2">
                <span className="h-3 w-3 shrink-0 rounded-full" style={{ background: `hsl(${c.color})` }} />
                <span className="min-w-0 flex-1 truncate text-sm text-ink">{c.name}</span>
                <div className="flex gap-1">
                  {COLOR_CHOICES.slice(0, 6).map((col) => (
                    <button
                      key={col}
                      onClick={() => {
                        const list = [...settings.financeCategories]
                        list[i] = { ...c, color: col }
                        update({ financeCategories: list })
                      }}
                      className={cx('h-4 w-4 rounded-full transition-transform hover:scale-125', c.color === col && 'ring-1 ring-offset-1 ring-offset-surface')}
                      style={{ background: `hsl(${col})`, '--tw-ring-color': `hsl(${col})` }}
                    />
                  ))}
                </div>
                <button
                  onClick={() => update({ financeCategories: settings.financeCategories.filter((_, j) => j !== i) })}
                  className="grid h-6 w-6 place-items-center rounded text-subtle hover:bg-danger/12 hover:text-danger"
                >
                  <X size={12} />
                </button>
              </div>
            ))}
            <div className="flex gap-2 pt-1">
              <Input
                placeholder="Nueva categoría (Marketing, Casa, Software…)"
                value={catDraft}
                onChange={(e) => setCatDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && catDraft.trim()) {
                    update({
                      financeCategories: [
                        ...(settings.financeCategories || []),
                        { name: catDraft.trim(), color: COLOR_CHOICES[(settings.financeCategories || []).length % COLOR_CHOICES.length] },
                      ],
                    })
                    setCatDraft('')
                  }
                }}
              />
              <Button
                variant="soft"
                icon={Plus}
                onClick={() => {
                  if (!catDraft.trim()) return
                  update({
                    financeCategories: [
                      ...(settings.financeCategories || []),
                      { name: catDraft.trim(), color: COLOR_CHOICES[(settings.financeCategories || []).length % COLOR_CHOICES.length] },
                    ],
                  })
                  setCatDraft('')
                }}
              >
                Añadir
              </Button>
            </div>
          </div>
        </Panel>

        <Panel q={q} keys="tareas completadas tachar ocultar prioridades urgente" title="Tareas" subtitle="Completadas y prioridades a tu manera" icon={ListChecks}>
          <div className="grid grid-cols-1 gap-5">
            <div>
              <Label hint="en las listas del Inicio">Tareas completadas</Label>
              <Segmented
                value={settings.doneBehavior || 'tachar'}
                onChange={(doneBehavior) => update({ doneBehavior })}
                options={[
                  { value: 'tachar', label: 'Mostrar tachadas' },
                  { value: 'ocultar', label: 'Ocultarlas' },
                ]}
              />
            </div>
            <div>
              <Label hint="los datos no cambian; solo el nombre y el color">Prioridades</Label>
              <div className="space-y-1.5">
                {Object.values(PRIORITIES).map((p) => {
                  const meta = prioMeta(settings, p.id)
                  return (
                    <div key={p.id} className="flex items-center gap-2.5 rounded-lg border border-line bg-surface-2/40 px-3 py-2">
                      <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: `hsl(${meta.hsl})` }} />
                      <span className="w-14 font-mono text-2xs uppercase text-subtle">{p.label}</span>
                      <input
                        value={settings.priorityNames?.[p.id] ?? ''}
                        placeholder={p.label}
                        onChange={(e) => update({ priorityNames: { ...(settings.priorityNames || {}), [p.id]: e.target.value } })}
                        className="h-8 min-w-0 flex-1 rounded-md border border-transparent bg-transparent px-2 text-sm font-medium text-ink hover:border-line focus:border-accent/50 focus:bg-surface focus:outline-none"
                      />
                      <div className="flex gap-1">
                        {COLOR_CHOICES.slice(0, 6).map((col) => (
                          <button
                            key={col}
                            onClick={() => update({ priorityColors: { ...(settings.priorityColors || {}), [p.id]: col } })}
                            className={cx('h-4 w-4 rounded-full transition-transform hover:scale-125', meta.hsl === col && 'ring-1 ring-offset-1 ring-offset-surface')}
                            style={{ background: `hsl(${col})`, '--tw-ring-color': `hsl(${col})` }}
                          />
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </Panel>

        <Panel q={q} keys="deporte unidades kilos libras kilometros millas peso" title="Deporte" subtitle="Tus unidades" icon={Dumbbell}>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <Label>Peso</Label>
              <Segmented
                value={settings.units?.weight || 'kg'}
                onChange={(w) => update({ units: { ...(settings.units || {}), weight: w } })}
                options={[
                  { value: 'kg', label: 'kg' },
                  { value: 'lb', label: 'lb' },
                ]}
              />
            </div>
            <div>
              <Label>Distancia</Label>
              <Segmented
                value={settings.units?.distance || 'km'}
                onChange={(d) => update({ units: { ...(settings.units || {}), distance: d } })}
                options={[
                  { value: 'km', label: 'km' },
                  { value: 'mi', label: 'mi' },
                ]}
              />
            </div>
          </div>
        </Panel>

        <Panel q={q} keys="metas progreso barra anillo porcentaje objetivos" title="Metas" subtitle="Cómo se dibuja el progreso" icon={Target}>
          <Segmented
            value={settings.goalStyle || 'barra'}
            onChange={(goalStyle) => update({ goalStyle })}
            options={[
              { value: 'barra', label: 'Barra' },
              { value: 'anillo', label: 'Anillo' },
              { value: 'numero', label: 'Solo %' },
            ]}
          />
        </Panel>

        <Panel q={q} keys="diario lectura serif ancho columna notas" title="Diario" subtitle="Comodidad de lectura" icon={NotebookPen}>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <Label>Tipografía de las entradas</Label>
              <Segmented
                value={settings.journalFont || 'sans'}
                onChange={(journalFont) => update({ journalFont })}
                options={[
                  { value: 'sans', label: 'Normal' },
                  { value: 'serif', label: 'Serif' },
                ]}
              />
            </div>
            <div>
              <Label>Ancho de lectura</Label>
              <Segmented
                value={settings.journalWidth || 'normal'}
                onChange={(journalWidth) => update({ journalWidth })}
                options={[
                  { value: 'normal', label: 'Normal' },
                  { value: 'estrecho', label: 'Estrecho' },
                ]}
              />
            </div>
          </div>
        </Panel>

        {/* ================= PODER TOTAL ================= */}
        {!searching && <div id="sec-poder" className="pt-4 first:pt-0"><h2 className="font-mono text-2xs font-medium uppercase tracking-[0.16em] text-subtle">Poder total</h2></div>}

        <Panel q={q} keys="sorprendeme aleatorio tema magia armonia generador" title="Sorpréndeme" subtitle="Un tema nuevo con armonía de color real — nunca ruido" icon={Wand2}>
          <div className="flex flex-wrap items-center gap-3">
            <Button
              variant="primary"
              icon={Wand2}
              onClick={() => {
                const t = surpriseTheme()
                update({ themeOverrides: t.overrides, accent: null, radius: t.radius, shadow: t.shadow, bgFx: t.bgFx })
                toast({ type: 'success', title: `✨ ${t.name}`, desc: 'Pulsa otra vez si no te convence — o restablece Apariencia.' })
              }}
            >
              Generar tema sorpresa
            </Button>
            <p className="text-[13px] text-muted">
              Cada pulsación crea un tema coherente (tono base + esquema armónico) validado con contraste AA.
            </p>
          </div>
        </Panel>

        <Panel q={q} keys="exportar importar tema compartir json codigo respaldar" title="Compartir tema" subtitle="Exporta tu tema como archivo o importa uno" icon={Download}>
          <div className="flex flex-wrap gap-2.5">
            <Button
              variant="secondary"
              icon={Download}
              onClick={() => {
                const blob = new Blob([JSON.stringify(exportTheme(settings), null, 2)], { type: 'application/json' })
                const url = URL.createObjectURL(blob)
                const a = document.createElement('a')
                a.href = url
                a.download = `summa-tema-${settings.preset || 'custom'}-${new Date().toISOString().slice(0, 10)}.json`
                a.click()
                URL.revokeObjectURL(url)
                toast({ type: 'success', title: 'Tema exportado' })
              }}
            >
              Exportar tema
            </Button>
            <Button variant="secondary" icon={Upload} onClick={() => themeFileRef.current?.click()}>
              Importar tema
            </Button>
            <input
              ref={themeFileRef}
              type="file"
              accept="application/json"
              hidden
              onChange={(e) => {
                const file = e.target.files?.[0]
                e.target.value = ''
                if (!file) return
                const r = new FileReader()
                r.onload = () => {
                  try {
                    const patch = validateTheme(JSON.parse(r.result))
                    update(patch)
                    toast({ type: 'success', title: 'Tema importado', desc: 'Aplicado al instante.' })
                  } catch (err) {
                    toast({ type: 'danger', title: 'Archivo de tema no válido', desc: err.message })
                  }
                }
                r.readAsText(file)
              }}
            />
          </div>
          <p className="mt-3 text-2xs text-subtle">
            El archivo solo contiene apariencia (colores, fuente, forma). Tus datos nunca viajan en él.
          </p>
        </Panel>

        {/* ================= CUENTA Y DATOS ================= */}
        {!searching && <div id="sec-cuenta" className="pt-4 first:pt-0"><h2 className="font-mono text-2xs font-medium uppercase tracking-[0.16em] text-subtle">Cuenta y datos</h2></div>}

        <Panel q={q} keys="plan beta gratis precio" title="Tu plan" subtitle="Fase de prueba" icon={Sparkles}>
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

        <Panel q={q} keys="cuenta sesion sincronizacion nube instalar app pwa email" title="Cuenta" subtitle="Tu sesión y sincronización" icon={KeyRound}>
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

        <Panel q={q} keys="copia seguridad exportar importar restaurar backup datos restablecer" title="Copias de seguridad" subtitle="Tu red de seguridad: ajustes + todos tus datos" icon={Download}>
          <div className="flex flex-wrap items-center gap-3">
            <p className="text-sm text-muted">
              {settings.lastBackupAt ? (
                <>Última copia: <span className="font-semibold text-ink">{agoLabel(settings.lastBackupAt)}</span></>
              ) : (
                <>Aún sin copias — <span className="font-semibold text-ink">exporta la primera</span></>
              )}
            </p>
            <div className="ml-auto flex gap-2.5">
              <Button variant="primary" icon={Download} onClick={exportData}>
                Exportar
              </Button>
              <Button variant="secondary" icon={Upload} onClick={() => fileRef.current?.click()}>
                Importar
              </Button>
            </div>
            <input ref={fileRef} type="file" accept="application/json" hidden onChange={importData} />
          </div>
          <button
            onClick={() => setMoreBackup((v) => !v)}
            className="mt-4 flex items-center gap-1 text-2xs font-medium text-subtle transition-colors hover:text-ink"
          >
            <ChevronDown size={13} className={cx('transition-transform', moreBackup && 'rotate-180')} />
            Más opciones
          </button>
          {moreBackup && (
            <div className="mt-3 flex flex-wrap items-center gap-3 rounded-lg border border-line bg-surface-2/40 px-3.5 py-3">
              <ConfirmButton
                label="Restablecer TODOS los ajustes"
                variant="danger"
                size="sm"
                onConfirm={() => {
                  localStorage.removeItem('summa:settings')
                  localStorage.removeItem('summa:boot-theme')
                  location.reload()
                }}
              />
              <p className="text-2xs text-subtle">
                Solo afecta a los ajustes: tus tareas, finanzas y demás datos siguen intactos en tu nube.
              </p>
            </div>
          )}
        </Panel>
      </div>

      {pendingBackup && (
        <ImportBackupModal
          backup={pendingBackup}
          busy={restoring}
          onClose={() => setPendingBackup(null)}
          onConfirm={confirmRestore}
        />
      )}
    </PageContainer>
  )
}
