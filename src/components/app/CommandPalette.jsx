import { useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import {
  Search, Plus, Moon, Sun, ArrowRight, CheckSquare, Users, StickyNote,
  CalendarDays, Target, CornerDownLeft, Receipt, Sunrise,
} from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { useData } from '../../context/DataContext'
import { MODULES, moduleName, moduleIcon, moduleEmoji } from '../../lib/data'
import { ICONS } from '../layout/icons'
import { Kbd } from '../ui'
import { cx, eur, todayISO, isoShort } from '../../lib/utils'
import { parseTask } from '../../lib/nlp'
import { COLOR_CHOICES } from '../../lib/data'
import { resolveMode } from '../../lib/theme'

const norm = (s) =>
  String(s || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')

// Búsqueda difusa: subcadena primero; si no, subsecuencia con racha.
function fuzzy(nq, s) {
  if (!nq) return 0
  const t = norm(s)
  const at = t.indexOf(nq)
  if (at !== -1) return 100 - Math.min(at, 50)
  let i = 0
  let streak = 0
  let score = 0
  for (const ch of t) {
    if (i < nq.length && ch === nq[i]) {
      i += 1
      streak += 1
      score += 1 + streak
    } else {
      streak = 0
    }
  }
  return i === nq.length ? score : null
}

export function CommandPalette() {
  const { paletteOpen, setPaletteOpen, navigate, setQuickAdd, openTask, settings, update, setReviewOpen, toast } = useApp()
  const { tasks, clients, notes, events, goals, movements, projects, add } = useData()
  const [q, setQ] = useState('')
  const [sel, setSel] = useState(0)
  const inputRef = useRef()
  const listRef = useRef()

  // Atajo global ⌘K / Ctrl+K
  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setPaletteOpen((v) => !v)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [setPaletteOpen])

  useEffect(() => {
    if (paletteOpen) {
      setQ('')
      setSel(0)
      setTimeout(() => inputRef.current?.focus(), 30)
    }
  }, [paletteOpen])

  const mode = resolveMode(settings.mode)

  const items = useMemo(() => {
    const nq = norm(q)
    const match = (s) => fuzzy(nq, s) != null
    const out = []

    // Acciones
    const actions = [
      { icon: Plus, label: 'Nueva tarea', hint: 'Acción', run: () => setQuickAdd(true) },
      { icon: CalendarDays, label: 'Revisión semanal', hint: 'Acción', run: () => setReviewOpen(true) },
      { icon: Target, label: 'Informe mensual', hint: 'Acción', run: () => navigate('informe') },
      {
        icon: mode === 'dark' ? Sun : Moon,
        label: mode === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro',
        hint: 'Acción',
        run: () => update({ mode: mode === 'dark' ? 'light' : 'dark' }),
      },
    ]
    actions.forEach((a) => match(a.label) && out.push({ ...a, group: 'Acciones' }))

    // Navegación
    const visible = settings.modules.filter((m) => !m.hidden).map((m) => m.id)
    MODULES.filter((m) => visible.includes(m.id)).forEach((m) => {
      const label = moduleName(settings, m.id)
      if (match(label) || match(m.name)) {
        const emoji = moduleEmoji(settings, m.id)
        const Icon = emoji
          ? () => <span aria-hidden style={{ fontSize: 15, lineHeight: 1 }}>{emoji}</span>
          : ICONS[moduleIcon(settings, m.id)]
        out.push({ icon: Icon, label: `Ir a ${label}`, hint: 'Navegar', group: 'Navegación', run: () => navigate(m.id) })
      }
    })
    if (match('ajustes')) {
      out.push({ icon: ICONS.Settings, label: 'Ir a Ajustes', hint: 'Navegar', group: 'Navegación', run: () => navigate('ajustes') })
    }
    if (match('hoy')) {
      out.push({ icon: Sunrise, label: 'Ir a Hoy', hint: 'Navegar', group: 'Navegación', run: () => navigate('hoy') })
    }

    // Captura rápida: crear desde aquí, sin cambiar de pantalla
    const texto = q.trim()
    if (texto) {
      const pt = parseTask(texto, projects)
      out.push({
        icon: Plus,
        label: `Crear tarea “${pt.title || texto}”`,
        hint: pt.due ? `Captura · ${isoShort(pt.due)}` : 'Captura',
        group: 'Captura rápida',
        keep: true,
        run: async () => {
          await add('tasks', {
            title: pt.title || texto,
            due: pt.due || '',
            priority: pt.priority || 'media',
            project_id: pt.projectId || null,
            status: 'todo',
            today: pt.due === todayISO(),
            subtasks: [],
            tags: [],
            position: 0,
          })
          toast({ type: 'success', title: 'Tarea creada', desc: pt.title || texto })
        },
      })
      const num = texto.match(/(-?\d+(?:[.,]\d+)?)/)
      if (num) {
        const amount = Math.abs(Number(num[1].replace(',', '.')))
        const concept = texto.replace(num[1], '').replace(/\s{2,}/g, ' ').trim() || 'Gasto'
        out.push({
          icon: Receipt,
          label: `Registrar gasto “${concept}” · −${eur(amount)}`,
          hint: 'Captura',
          group: 'Captura rápida',
          keep: true,
          run: async () => {
            await add('movements', { concept, category: '', amount: -amount, date: todayISO(), kind: 'out' })
            toast({ type: 'success', title: 'Gasto registrado', desc: `${concept} · −${eur(amount)}` })
          },
        })
      }
      out.push({
        icon: StickyNote,
        label: `Guardar nota “${texto.slice(0, 48)}${texto.length > 48 ? '…' : ''}”`,
        hint: 'Captura',
        group: 'Captura rápida',
        keep: true,
        run: async () => {
          await add('notes', { text: texto, color: COLOR_CHOICES[0] })
          toast({ type: 'success', title: 'Nota guardada' })
        },
      })
    }

    // Datos (solo si hay búsqueda, para no inundar)
    if (nq) {
      tasks.filter((t) => match(t.title)).slice(0, 5).forEach((t) =>
        out.push({ icon: CheckSquare, label: t.title, hint: t.status === 'done' ? 'Tarea · hecha' : 'Tarea', group: 'Resultados', run: () => openTask(t) })
      )
      clients.filter((c) => match(c.name)).slice(0, 3).forEach((c) =>
        out.push({ icon: Users, label: c.name, hint: 'Cliente', group: 'Resultados', run: () => navigate('finanzas') })
      )
      events.filter((e) => match(e.title)).slice(0, 3).forEach((e) =>
        out.push({ icon: CalendarDays, label: e.title, hint: `Evento · ${e.date || ''}`, group: 'Resultados', run: () => navigate('calendario') })
      )
      goals.filter((g) => match(g.title)).slice(0, 3).forEach((g) =>
        out.push({ icon: Target, label: g.title, hint: 'Meta', group: 'Resultados', run: () => navigate('metas') })
      )
      notes.filter((n) => match(n.text)).slice(0, 3).forEach((n) =>
        out.push({ icon: StickyNote, label: n.text.slice(0, 60), hint: 'Nota', group: 'Resultados', run: () => navigate('diario') })
      )
      movements.filter((m) => match(m.concept)).slice(0, 4).forEach((m) =>
        out.push({
          icon: Receipt,
          label: m.concept,
          hint: `Movimiento · ${Number(m.amount) < 0 ? '−' : '+'}${eur(Math.abs(Number(m.amount)))} · ${isoShort(m.date)}`,
          group: 'Resultados',
          run: () => navigate('finanzas'),
        })
      )
    }
    return out.slice(0, 14)
  }, [q, tasks, clients, notes, events, goals, movements, projects, settings.modules, mode]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => setSel(0), [q])

  if (!paletteOpen) return null
  const close = () => setPaletteOpen(false)
  const runItem = (it) => {
    if (it.keep) {
      it.run()
      setQ('')
      inputRef.current?.focus()
      return
    }
    close()
    it.run()
  }

  const onKeyDown = (e) => {
    if (e.key === 'Escape') return close()
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSel((s) => Math.min(s + 1, items.length - 1))
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSel((s) => Math.max(s - 1, 0))
    }
    if (e.key === 'Enter' && items[sel]) {
      e.preventDefault()
      runItem(items[sel])
    }
  }

  let lastGroup = null

  return createPortal(
    <div className="fixed inset-0 z-[55] flex items-start justify-center p-4 pt-[12vh]">
      <div className="absolute inset-0 bg-black/55 backdrop-blur-sm animate-fade-in" onClick={close} />
      <div className="relative w-full max-w-xl overflow-hidden rounded-2xl border border-line bg-surface shadow-xl animate-scale-in">
        <div className="flex items-center gap-3 border-b border-line px-4">
          <Search size={17} className="shrink-0 text-subtle" />
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Busca, salta o crea… (tarea, gasto, nota)"
            className="h-13 w-full bg-transparent py-4 text-[15px] text-ink placeholder:text-subtle focus:outline-none"
          />
          <Kbd>esc</Kbd>
        </div>

        <div ref={listRef} className="max-h-[46vh] overflow-y-auto p-2">
          {items.length === 0 && (
            <p className="px-3 py-8 text-center text-[13px] text-subtle">Sin resultados para “{q}”.</p>
          )}
          {items.map((it, i) => {
            const header = it.group !== lastGroup ? it.group : null
            lastGroup = it.group
            const Icon = it.icon
            return (
              <div key={i}>
                {header && (
                  <p className="px-3 pb-1 pt-2.5 text-2xs font-semibold uppercase tracking-[0.12em] text-subtle">
                    {header}
                  </p>
                )}
                <button
                  onMouseEnter={() => setSel(i)}
                  onClick={() => runItem(it)}
                  className={cx(
                    'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors',
                    i === sel ? 'bg-accent/12 text-ink' : 'text-muted hover:bg-surface-2'
                  )}
                >
                  <Icon size={16} className={cx('shrink-0', i === sel ? 'text-accent' : 'text-subtle')} />
                  <span className="min-w-0 flex-1 truncate text-sm font-medium text-ink">{it.label}</span>
                  <span className="shrink-0 text-2xs text-subtle">{it.hint}</span>
                  {i === sel && <CornerDownLeft size={13} className="shrink-0 text-accent" />}
                </button>
              </div>
            )
          })}
        </div>

        <div className="flex items-center gap-4 border-t border-line px-4 py-2.5 text-2xs text-subtle">
          <span className="flex items-center gap-1.5"><Kbd>↑</Kbd><Kbd>↓</Kbd> navegar</span>
          <span className="flex items-center gap-1.5"><Kbd>↵</Kbd> abrir</span>
          <span className="ml-auto hidden items-center gap-1.5 sm:flex">escribe y elige <em className="not-italic text-ink">Crear</em> — sin salir de aquí</span>
        </div>
      </div>
    </div>,
    document.body
  )
}
