import { useState } from 'react'
import {
  ArrowLeft, ArrowRight, Clock3, Pencil, Plus, Timer, Trash2, TriangleAlert, X,
} from 'lucide-react'
import { useApp } from '../context/AppContext'
import { useData } from '../context/DataContext'
import { PageContainer, PageHeader } from '../components/layout/Page'
import { Card, CardBody, Button, Badge, Label, Input, Select, Modal, EmptyState } from '../components/ui'
import { TaskRow } from '../components/app/TaskRow'
import { moduleName, EMOJI_CHOICES, COLOR_CHOICES } from '../lib/data'
import { venturesOf, rowVenture, weekShare, addTimeBlock } from '../lib/ventures'
import { eur, signedEur, todayISO, isoShort, cx, uid, clamp } from '../lib/utils'

const monthOf = (iso) => String(iso || '').slice(0, 7)

function goalPct(g) {
  if (g.type === 'percent') return Math.round(g.value)
  if (g.invert) return clamp(Math.round((g.target / g.value) * 100), 0, 100)
  return clamp(Math.round((g.value / Math.max(g.target, 1)) * 100), 0, 100)
}

// Datos por venture: balance del mes, tareas abiertas, objetivo activo
function ventureStats(settings, data, vid) {
  const mine = (rows) => rows.filter((r) => rowVenture(settings, r) === vid)
  const month = monthOf(todayISO())
  const movs = mine(data.movements)
  const balance = movs
    .filter((m) => monthOf(m.date) === month)
    .reduce((a, m) => a + Number(m.amount), 0)
  const open = mine(data.tasks).filter((t) => t.status !== 'done')
  const goal = mine(data.goals).find((g) => goalPct(g) < 100) || mine(data.goals)[0]
  return { balance, open, goal, movs }
}

// ---------- Registrar tiempo ----------
function TimeModal({ open, onClose, settings, update, toast }) {
  const [venture, setVenture] = useState('personal')
  const [mins, setMins] = useState(50)
  if (!open) return null
  const save = () => {
    update({ timeLog: addTimeBlock(settings, { venture, mins }) })
    toast({ type: 'success', title: 'Tiempo registrado', desc: `${mins} min` })
    onClose()
  }
  return (
    <Modal
      open
      onClose={onClose}
      title="Registrar tiempo"
      subtitle="Un bloque, un venture — sin cronómetros"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button variant="primary" icon={Timer} onClick={save}>Guardar</Button>
        </>
      }
    >
      <div className="space-y-4">
        <div>
          <Label>Venture</Label>
          <Select value={venture} onChange={(e) => setVenture(e.target.value)}>
            {venturesOf(settings).map((v) => (
              <option key={v.id} value={v.id}>{v.icon} {v.name}</option>
            ))}
          </Select>
        </div>
        <div>
          <Label>Duración</Label>
          <div className="flex items-center gap-2">
            {[25, 50, 90].map((m) => (
              <button
                key={m}
                onClick={() => setMins(m)}
                className={cx(
                  'rounded-full border px-3 py-1.5 text-[13px] font-medium transition-colors',
                  mins === m ? 'border-accent bg-accent/12 text-accent' : 'border-line text-muted hover:text-ink'
                )}
              >
                {m} min
              </button>
            ))}
            <Input
              type="number"
              min="5"
              step="5"
              value={mins}
              onChange={(e) => setMins(Math.max(5, Number(e.target.value)))}
              className="w-24"
            />
          </div>
        </div>
      </div>
    </Modal>
  )
}

// ---------- Editor de un venture ----------
function VentureEditor({ v, settings, update, onDone }) {
  const list = venturesOf(settings)
  const patch = (p) =>
    update({ ventures: list.map((x) => (x.id === v.id ? { ...x, ...p } : x)) })
  const removeVenture = () =>
    update({ ventures: list.filter((x) => x.id !== v.id) })
  return (
    <div className="rounded-xl border border-line bg-surface-2/40 p-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <Label>Nombre</Label>
          <Input value={v.name} onChange={(e) => patch({ name: e.target.value })} />
        </div>
        <div>
          <Label hint="% máximo de tu semana (alerta suave)">Umbral de tiempo</Label>
          <Input
            type="number"
            min="0"
            max="100"
            placeholder="sin umbral"
            value={v.maxPct ?? ''}
            onChange={(e) => patch({ maxPct: e.target.value === '' ? null : clamp(Number(e.target.value), 0, 100) })}
          />
        </div>
        <div>
          <Label>Color</Label>
          <div className="flex flex-wrap gap-1.5 pt-1">
            {COLOR_CHOICES.map((c) => (
              <button
                key={c}
                onClick={() => patch({ color: c })}
                className={cx('h-6 w-6 rounded-full transition-transform hover:scale-110', v.color === c && 'ring-2 ring-offset-2 ring-offset-surface')}
                style={{ background: `hsl(${c})`, '--tw-ring-color': `hsl(${c})` }}
              />
            ))}
          </div>
        </div>
        <div>
          <Label>Emoji</Label>
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            {EMOJI_CHOICES.slice(0, 10).map((e) => (
              <button
                key={e}
                onClick={() => patch({ icon: e })}
                className={cx('grid h-8 w-8 place-items-center rounded-lg border text-[15px]', v.icon === e ? 'border-accent bg-accent/12' : 'border-line')}
              >
                {e}
              </button>
            ))}
            <Input value={v.icon || ''} onChange={(e) => patch({ icon: e.target.value.slice(0, 4) })} className="w-16 text-center" />
          </div>
        </div>
      </div>
      <div className="mt-3 flex items-center justify-between">
        {!v.fixed ? (
          <Button variant="danger" size="sm" icon={Trash2} onClick={() => { removeVenture(); onDone() }}>
            Eliminar
          </Button>
        ) : (
          <span className="text-2xs text-subtle">"Personal" es el cajón por defecto: no se puede eliminar.</span>
        )}
        <Button variant="secondary" size="sm" onClick={onDone}>Hecho</Button>
      </div>
    </div>
  )
}

export default function Ventures() {
  const { settings, update, toast, navigate, openTask } = useApp()
  const data = useData()
  const [detail, setDetail] = useState(null)
  const [timeOpen, setTimeOpen] = useState(false)
  const [managing, setManaging] = useState(false)
  const [editing, setEditing] = useState(null)

  const ventures = venturesOf(settings)
  const share = weekShare(settings)
  const overParts = share.parts.filter((p) => p.over)

  const addVenture = () => {
    const name = `Venture ${ventures.length + 1}`
    const v = { id: uid(), name, color: COLOR_CHOICES[ventures.length % COLOR_CHOICES.length], icon: '🚀' }
    update({ ventures: [...ventures, v] })
    setEditing(v.id)
  }

  // ---------- Detalle (nivel 2) ----------
  if (detail) {
    const v = ventures.find((x) => x.id === detail)
    if (!v) {
      setDetail(null)
      return null
    }
    const st = ventureStats(settings, data, v.id)
    const myTime = share.parts.find((p) => p.venture.id === v.id)
    return (
      <PageContainer className="max-w-3xl">
        <button onClick={() => setDetail(null)} className="mb-4 flex items-center gap-1.5 text-[13px] font-medium text-subtle hover:text-ink">
          <ArrowLeft size={14} /> {moduleName(settings, 'ventures')}
        </button>
        <div className="mb-6 flex items-center gap-3">
          <span className="grid h-12 w-12 place-items-center rounded-2xl text-2xl" style={{ background: `hsl(${v.color} / 0.15)` }}>
            {v.icon}
          </span>
          <div className="min-w-0 flex-1">
            <h1 className="font-display text-2xl text-ink">{v.name}</h1>
            <p className="text-[13px] text-muted">
              {signedEur(st.balance)} este mes · {st.open.length} tareas abiertas
              {myTime ? ` · ${myTime.pct}% de tu semana` : ''}
            </p>
          </div>
          <Button variant="ghost" size="sm" icon={Pencil} onClick={() => setEditing(editing === v.id ? null : v.id)}>
            Editar
          </Button>
        </div>

        {editing === v.id && (
          <div className="mb-5">
            <VentureEditor v={v} settings={settings} update={update} onDone={() => { setEditing(null); if (!venturesOf(settings).some((x) => x.id === v.id)) setDetail(null) }} />
          </div>
        )}

        <div className="space-y-5">
          <section>
            <p className="mb-2 font-mono text-2xs font-medium uppercase tracking-[0.12em] text-subtle">Tareas abiertas</p>
            {st.open.length ? (
              <div className="space-y-0.5 rounded-xl border border-line bg-surface p-2">
                {st.open.slice(0, 5).map((t) => <TaskRow key={t.id} task={t} />)}
                {st.open.length > 5 && (
                  <button onClick={() => navigate('negocio')} className="flex w-full items-center justify-center gap-1 py-2 text-2xs font-medium text-subtle hover:text-accent">
                    Ver todas ({st.open.length}) <ArrowRight size={11} />
                  </button>
                )}
              </div>
            ) : (
              <p className="text-[13px] text-subtle">Nada abierto. ⌘K para capturar una.</p>
            )}
          </section>

          <section>
            <p className="mb-2 font-mono text-2xs font-medium uppercase tracking-[0.12em] text-subtle">Últimos movimientos</p>
            {st.movs.length ? (
              <div className="space-y-1">
                {st.movs.slice(0, 5).map((m) => (
                  <div key={m.id} className="flex items-center gap-3 rounded-lg border border-line bg-surface px-3 py-2 text-[13px]">
                    <span className="w-12 shrink-0 font-mono text-2xs text-subtle">{isoShort(m.date)}</span>
                    <span className="min-w-0 flex-1 truncate text-ink">{m.concept}</span>
                    <span className={cx('tabular font-semibold', Number(m.amount) < 0 ? 'text-danger' : 'text-success')}>
                      {signedEur(Number(m.amount))}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[13px] text-subtle">Sin movimientos etiquetados.</p>
            )}
          </section>

          {st.goal && (
            <section>
              <p className="mb-2 font-mono text-2xs font-medium uppercase tracking-[0.12em] text-subtle">Objetivo activo</p>
              <button onClick={() => navigate('metas')} className="flex w-full items-center justify-between rounded-xl border border-line bg-surface px-4 py-3 text-left hover:border-accent/40">
                <span className="min-w-0 truncate text-sm font-medium text-ink">{st.goal.title}</span>
                <span className="shrink-0 font-semibold tabular text-accent">{goalPct(st.goal)}%</span>
              </button>
            </section>
          )}
        </div>
      </PageContainer>
    )
  }

  // ---------- Superficie ----------
  return (
    <PageContainer className="max-w-4xl">
      <PageHeader
        eyebrow="Frentes"
        title={moduleName(settings, 'ventures')}
        subtitle="Cada frente de tu vida, con sus números y su tiempo."
        actions={
          <>
            <Button variant="secondary" icon={Pencil} onClick={() => { setManaging((m) => !m); setEditing(null) }}>
              <span className="hidden sm:inline">Gestionar</span>
            </Button>
            <Button variant="primary" icon={Timer} onClick={() => setTimeOpen(true)}>
              <span className="hidden sm:inline">Registrar tiempo</span>
            </Button>
          </>
        }
      />

      {managing && (
        <div className="mb-5 space-y-2">
          {ventures.map((v) =>
            editing === v.id ? (
              <VentureEditor key={v.id} v={v} settings={settings} update={update} onDone={() => setEditing(null)} />
            ) : (
              <button
                key={v.id}
                onClick={() => setEditing(v.id)}
                className="flex w-full items-center gap-3 rounded-lg border border-line bg-surface-2/40 px-3.5 py-2.5 text-left hover:border-accent/40"
              >
                <span className="text-[15px]">{v.icon}</span>
                <span className="h-2.5 w-2.5 rounded-full" style={{ background: `hsl(${v.color})` }} />
                <span className="min-w-0 flex-1 truncate text-sm font-medium text-ink">{v.name}</span>
                {v.maxPct != null && <Badge tone="neutral">≤ {v.maxPct}%</Badge>}
                <Pencil size={13} className="text-subtle" />
              </button>
            )
          )}
          <Button variant="soft" size="sm" icon={Plus} onClick={addVenture}>Nuevo venture</Button>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {ventures.map((v) => {
          const st = ventureStats(settings, data, v.id)
          return (
            <Card key={v.id} hover className="cursor-pointer" role="button" onClick={() => setDetail(v.id)}>
              <CardBody>
                <div className="mb-3 flex items-center gap-2.5">
                  <span className="grid h-9 w-9 place-items-center rounded-xl text-lg" style={{ background: `hsl(${v.color} / 0.15)` }}>
                    {v.icon}
                  </span>
                  <p className="min-w-0 flex-1 truncate text-sm font-semibold text-ink">{v.name}</p>
                  <ArrowRight size={14} className="shrink-0 text-subtle" />
                </div>
                <div className="space-y-1.5 text-[13px]">
                  <div className="flex items-center justify-between">
                    <span className="text-subtle">Balance del mes</span>
                    <span className={cx('tabular font-semibold', st.balance >= 0 ? 'text-success' : 'text-danger')}>
                      {signedEur(st.balance)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-subtle">Tareas abiertas</span>
                    <span className="tabular font-semibold text-ink">{st.open.length}</span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="shrink-0 text-subtle">Objetivo</span>
                    <span className="min-w-0 truncate text-right font-medium text-ink">
                      {st.goal ? `${st.goal.title} · ${goalPct(st.goal)}%` : '—'}
                    </span>
                  </div>
                </div>
              </CardBody>
            </Card>
          )
        })}
      </div>

      {/* Reparto semanal de tiempo */}
      <Card className="mt-5">
        <CardBody>
          <div className="mb-3 flex items-center justify-between">
            <p className="flex items-center gap-2 text-sm font-semibold text-ink">
              <Clock3 size={15} className="text-accent" /> Tu semana, en tiempo
            </p>
            <span className="font-mono text-2xs text-subtle">
              {share.total ? `${Math.round(share.total / 60)} h registradas` : 'sin bloques aún'}
            </span>
          </div>
          {share.total ? (
            <>
              <div className="flex h-3 w-full overflow-hidden rounded-full border border-line">
                {share.parts.map((p) => (
                  <div key={p.venture.id} title={`${p.venture.name} · ${p.pct}%`} style={{ width: `${p.pct}%`, background: `hsl(${p.venture.color})` }} />
                ))}
              </div>
              <div className="mt-2.5 flex flex-wrap gap-x-4 gap-y-1">
                {share.parts.map((p) => (
                  <span key={p.venture.id} className={cx('flex items-center gap-1.5 text-2xs', p.over ? 'font-semibold text-warning' : 'text-muted')}>
                    <span className="h-1.5 w-1.5 rounded-full" style={{ background: `hsl(${p.venture.color})` }} />
                    {p.venture.name} {p.pct}%
                    {p.over && <TriangleAlert size={11} />}
                  </span>
                ))}
              </div>
              {overParts.length > 0 && (
                <p className="mt-2.5 flex items-center gap-1.5 text-2xs text-warning">
                  <TriangleAlert size={12} />
                  {overParts.map((p) => `${p.venture.name} supera tu umbral del ${p.venture.maxPct}%`).join(' · ')}
                </p>
              )}
            </>
          ) : (
            <p className="text-[13px] text-subtle">Registra tu primer bloque con el botón de arriba.</p>
          )}
        </CardBody>
      </Card>

      <TimeModal open={timeOpen} onClose={() => setTimeOpen(false)} settings={settings} update={update} toast={toast} />
    </PageContainer>
  )
}
