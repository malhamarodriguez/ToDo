import {
  Plus, Receipt, PenLine, Dumbbell, ArrowRight, Flame, Check, ChevronRight,
  Wallet, TrendingUp, CircleDot, CalendarClock, Target,
} from 'lucide-react'
import { useApp } from '../context/AppContext'
import { useData } from '../context/DataContext'
import { PageContainer } from '../components/layout/Page'
import { TaskRow } from '../components/app/TaskRow'
import { Card, CardHeader, CardBody, Button, Badge, ProgressBar, Switch, EmptyState } from '../components/ui'
import { saludo, longDate, signedEur, eur, clamp, cx, capitalize, todayISO } from '../lib/utils'

function goalPct(g) {
  if (g.type === 'percent') return Math.round(g.value)
  if (g.invert) return clamp(Math.round((g.target / g.value) * 100), 0, 100)
  return clamp(Math.round((g.value / Math.max(g.target, 1)) * 100), 0, 100)
}
const monthOf = (iso) => String(iso || '').slice(0, 7)

export default function Inicio() {
  const { settings, navigate, setQuickAdd, toast } = useApp()
  const { tasks, events, goals, movements, holdings, workouts, add, remove } = useData()

  const todays = tasks.filter((t) => (t.today || t.overdue) && t.status !== 'done')
  const doneToday = tasks.filter((t) => t.today && t.status === 'done')
  const pending = todays.length
  const totalToday = todays.length + doneToday.length
  const focusTask = todays.find((t) => t.priority === 'alta')

  const thisMonth = monthOf(todayISO())
  const balance = movements.filter((m) => monthOf(m.date) === thisMonth).reduce((a, m) => a + Number(m.amount), 0)
  const patrimonio = holdings.reduce((a, h) => a + (h.kind === 'liability' ? -Number(h.value) : Number(h.value)), 0)

  const todayWorkout = workouts.find((w) => String(w.date).slice(0, 10) === todayISO())
  const entrenoHoy = Boolean(todayWorkout)
  const toggleEntreno = () => {
    if (todayWorkout) remove('workouts', todayWorkout.id)
    else add('workouts', { name: 'Entreno', date: todayISO(), dur: 0, exercises: [] })
  }

  const upcoming = [...events]
    .filter((e) => !e.date || e.date >= todayISO())
    .sort((a, b) => `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`))
    .slice(0, 4)
  const homeGoals = goals.slice(0, 3)

  const onQuick = (id) => {
    if (id === 'task') return setQuickAdd(true)
    if (id === 'expense') { navigate('finanzas'); toast({ type: 'success', title: 'Finanzas', desc: 'Registra tu movimiento aquí.' }) }
    if (id === 'journal') navigate('diario')
    if (id === 'workout') navigate('deporte')
  }
  const QUICK = [
    { id: 'task', label: 'Nueva tarea', icon: Plus },
    { id: 'expense', label: 'Registrar gasto', icon: Receipt },
    { id: 'journal', label: 'Anotar en diario', icon: PenLine },
    { id: 'workout', label: 'Nuevo entreno', icon: Dumbbell },
  ]

  return (
    <PageContainer>
      <div className="mb-6 animate-fade-up">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <h1 className="font-display text-3xl font-bold tracking-tight text-ink sm:text-[34px]">
            {saludo()}{settings.name ? `, ${settings.name}` : ''}.
          </h1>
          <span className="hidden text-2xl sm:inline">👋</span>
        </div>
        <p className="mt-1.5 text-sm text-muted">
          {capitalize(longDate())} ·{' '}
          <span className="text-ink">
            {pending > 0 ? <>tienes <span className="font-semibold text-accent">{pending} tareas</span> para hoy</> : 'sin tareas pendientes para hoy'}
          </span>
        </p>
        {focusTask && (
          <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-line bg-surface/60 py-1 pl-2.5 pr-3 text-[13px]">
            <span className="grid h-4 w-4 place-items-center rounded-full bg-accent/15">
              <span className="h-1.5 w-1.5 rounded-full bg-accent" />
            </span>
            <span className="text-subtle">Enfoque de hoy</span>
            <span className="max-w-[40ch] truncate font-medium text-ink">{focusTask.title}</span>
          </div>
        )}
      </div>

      <div className="mb-6 flex flex-wrap gap-2.5 animate-fade-up" style={{ animationDelay: '40ms' }}>
        {QUICK.map((q) => (
          <Button key={q.id} variant="secondary" icon={q.icon} onClick={() => onQuick(q.id)}
            className="transition-all hover:-translate-y-0.5 hover:border-accent/40 hover:text-accent">
            {q.label}
          </Button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
        <div className="lg:col-span-8">
          <Card elevated className="overflow-hidden animate-fade-up" style={{ animationDelay: '80ms' }}>
            <div className="border-b border-line px-5 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <h2 className="font-display text-lg font-bold text-ink">Tareas de hoy</h2>
                  {totalToday > 0 && <Badge tone={pending ? 'accent' : 'success'}>{pending ? `${pending} pendientes` : 'Completadas'}</Badge>}
                </div>
                <Button variant="ghost" size="sm" iconRight={ArrowRight} onClick={() => navigate('negocio')}>Ver todas</Button>
              </div>
              {totalToday > 0 && (
                <div className="mt-3 flex items-center gap-3">
                  <ProgressBar value={(doneToday.length / totalToday) * 100} size="sm" className="flex-1" />
                  <span className="text-2xs font-semibold tabular text-subtle">{doneToday.length}/{totalToday} hechas</span>
                </div>
              )}
            </div>

            <div className="p-2.5">
              {totalToday > 0 ? (
                <>
                  <div className="space-y-0.5">
                    {todays.map((t, i) => (
                      <div key={t.id} className="animate-fade-up" style={{ animationDelay: `${100 + i * 45}ms` }}>
                        <TaskRow task={t} />
                      </div>
                    ))}
                  </div>
                  {doneToday.length > 0 && (
                    <div className="mt-1 space-y-0.5 border-t border-line pt-1">
                      {doneToday.map((t) => <TaskRow key={t.id} task={t} compact />)}
                    </div>
                  )}
                </>
              ) : (
                <EmptyState
                  icon={Check}
                  title="Aún no hay tareas para hoy"
                  desc="Crea tu primera tarea y empieza a darle forma al día."
                  action={<Button variant="primary" size="sm" icon={Plus} onClick={() => setQuickAdd(true)}>Nueva tarea</Button>}
                  compact
                />
              )}
              <button onClick={() => setQuickAdd(true)}
                className="mt-1 flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-line py-2.5 text-[13px] font-medium text-muted transition-colors hover:border-accent/40 hover:bg-surface-2 hover:text-ink">
                <Plus size={16} /> Añadir tarea
              </button>
            </div>
          </Card>
        </div>

        <div className="space-y-5 lg:col-span-4">
          <Card className={cx('overflow-hidden animate-fade-up transition-colors duration-300', entrenoHoy && 'border-accent/40 bg-accent/[0.06]')} style={{ animationDelay: '120ms' }}>
            <CardBody className="flex items-center gap-4">
              <div className={cx('grid h-12 w-12 shrink-0 place-items-center rounded-xl transition-all duration-300', entrenoHoy ? 'bg-accent text-accent-fg shadow-glow' : 'bg-surface-2 text-muted')}>
                <span key={String(entrenoHoy)} className="animate-scale-in">
                  {entrenoHoy ? <Check size={22} strokeWidth={2.6} /> : <Dumbbell size={22} />}
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-ink">Entreno de hoy</p>
                <p className="mt-0.5 text-[13px] text-muted">{entrenoHoy ? 'Completado · ¡bien hecho!' : 'Aún sin marcar'}</p>
              </div>
              <Switch checked={entrenoHoy} onChange={toggleEntreno} size="lg" />
            </CardBody>
          </Card>

          <Card className="animate-fade-up" style={{ animationDelay: '160ms' }}>
            <CardHeader title="Próximos eventos" icon={CalendarClock} />
            <CardBody className="space-y-1 pt-2">
              {upcoming.length ? upcoming.map((e) => (
                <div key={e.id} className="flex items-center gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-surface-2">
                  <div className="w-12 shrink-0 text-sm font-semibold tabular text-ink">{e.time || '—'}</div>
                  <span className="h-8 w-0.5 rounded-full" style={{ background: `hsl(${e.color})` }} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-ink">{e.title}</p>
                    {e.sub && <p className="truncate text-2xs text-subtle">{e.sub}</p>}
                  </div>
                </div>
              )) : <EmptyState icon={CalendarClock} title="Sin eventos próximos" compact />}
            </CardBody>
          </Card>

          <Card className="animate-fade-up" style={{ animationDelay: '200ms' }}>
            <CardHeader title="Metas" icon={Target} action={<Button variant="ghost" size="icon-sm" icon={ChevronRight} onClick={() => navigate('metas')} />} />
            <CardBody className="space-y-4 pt-2">
              {homeGoals.length ? homeGoals.map((g) => {
                const p = goalPct(g)
                return (
                  <div key={g.id}>
                    <div className="mb-1.5 flex items-center justify-between">
                      <span className="text-[13px] font-medium text-ink">{g.title}</span>
                      <span className="text-2xs font-semibold tabular text-muted">{p}%</span>
                    </div>
                    <ProgressBar value={p} size="sm" />
                  </div>
                )
              }) : <EmptyState icon={Target} title="Define tus metas" desc="Marca el norte por áreas." compact />}
            </CardBody>
          </Card>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-x-8 gap-y-2 rounded-xl border border-line bg-surface/50 px-5 py-3.5 text-[13px] animate-fade-up" style={{ animationDelay: '240ms' }}>
        <div className="flex items-center gap-2">
          <Wallet size={15} className="text-subtle" />
          <span className="text-subtle">Balance del mes</span>
          <span className={cx('font-semibold tabular', balance >= 0 ? 'text-success' : 'text-danger')}>{signedEur(balance)}</span>
        </div>
        <div className="flex items-center gap-2">
          <TrendingUp size={15} className="text-subtle" />
          <span className="text-subtle">Patrimonio neto</span>
          <span className="font-semibold tabular text-ink">{eur(patrimonio)}</span>
        </div>
        <button onClick={() => navigate('finanzas')} className="ml-auto inline-flex items-center gap-1 text-muted transition-colors hover:text-accent">
          Ver finanzas <ArrowRight size={14} />
        </button>
      </div>
    </PageContainer>
  )
}
