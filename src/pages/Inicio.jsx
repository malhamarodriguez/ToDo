import { useState } from 'react'
import {
  Plus, Receipt, PenLine, Dumbbell, ArrowRight, Check, ChevronRight,
  Wallet, TrendingUp, CalendarClock, Target, Play, Timer, X, Sparkles, Banknote, Flame, Download,
} from 'lucide-react'
import { toggleHabitLog, habitStreak, habitWeek, habitDoneOn, HABIT_COLORS } from '../lib/habits'
import { backupOverdue } from '../lib/backup'
import { BETA_FREE } from '../lib/plan'
import { uid, todayISO as tISO } from '../lib/utils'
import { useApp } from '../context/AppContext'
import { useData } from '../context/DataContext'
import { PageContainer } from '../components/layout/Page'
import { TaskRow } from '../components/app/TaskRow'
import { Card, CardHeader, CardBody, Button, Badge, ProgressBar, ProgressRing, Switch, EmptyState } from '../components/ui'
import { renderGreeting, longDate, signedEur, eur, clamp, cx, capitalize, todayISO, taskOverdue, taskToday, fmtTime } from '../lib/utils'

function goalPct(g) {
  if (g.type === 'percent') return Math.round(g.value)
  if (g.invert) return clamp(Math.round((g.target / g.value) * 100), 0, 100)
  return clamp(Math.round((g.value / Math.max(g.target, 1)) * 100), 0, 100)
}
const monthOf = (iso) => String(iso || '').slice(0, 7)

// ---------- Primeros pasos (onboarding) ----------
function Onboarding() {
  const { settings, update, navigate, setQuickAdd } = useApp()
  const { tasks, movements, goals, workouts } = useData()

  const steps = [
    { id: 'task', label: 'Crea tu primera tarea', done: tasks.length > 0, go: () => setQuickAdd(true) },
    { id: 'salary', label: 'Define tu nómina', done: Number(settings.salary) > 0, go: () => navigate('finanzas') },
    { id: 'move', label: 'Registra un ingreso o gasto', done: movements.length > 0, go: () => navigate('finanzas') },
    { id: 'goal', label: 'Márcate una meta', done: goals.length > 0, go: () => navigate('metas') },
    { id: 'workout', label: 'Apunta tu primer entreno', done: workouts.length > 0, go: () => navigate('deporte') },
  ]
  const doneCount = steps.filter((s) => s.done).length
  if (settings.hideOnboarding || doneCount === steps.length) return null

  return (
    <Card className="mb-6 overflow-hidden border-accent/25 animate-fade-up">
      <div className="h-1 bg-surface-2">
        <div
          className="h-full bg-accent transition-[width] duration-700 ease-smooth"
          style={{ width: `${(doneCount / steps.length) * 100}%` }}
        />
      </div>
      <CardBody>
        <div className="mb-3 flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-accent/12 text-accent">
              <Sparkles size={19} />
            </span>
            <div>
              <h2 className="font-display text-base font-bold text-ink">Primeros pasos</h2>
              <p className="text-[13px] text-muted">{doneCount} de {steps.length} — haz tuyo tu centro de mando</p>
            </div>
          </div>
          <button
            onClick={() => update({ hideOnboarding: true })}
            className="grid h-8 w-8 place-items-center rounded-lg text-subtle transition-colors hover:bg-surface-2 hover:text-ink"
            aria-label="Ocultar"
          >
            <X size={16} />
          </button>
        </div>
        <div className="grid gap-1.5 sm:grid-cols-2 lg:grid-cols-3">
          {steps.map((s) => (
            <button
              key={s.id}
              onClick={s.go}
              disabled={s.done}
              className={cx(
                'flex items-center gap-2.5 rounded-lg border px-3 py-2.5 text-left text-[13px] font-medium transition-all',
                s.done
                  ? 'border-transparent bg-success/[0.07] text-subtle line-through'
                  : 'border-line text-ink hover:border-accent/40 hover:bg-accent/[0.05]'
              )}
            >
              <span
                className={cx(
                  'grid h-5 w-5 shrink-0 place-items-center rounded-full border transition-colors',
                  s.done ? 'border-success bg-success text-white' : 'border-line-strong text-transparent'
                )}
              >
                <Check size={12} strokeWidth={3} />
              </span>
              {s.label}
              {!s.done && <ArrowRight size={13} className="ml-auto shrink-0 text-subtle" />}
            </button>
          ))}
        </div>
      </CardBody>
    </Card>
  )
}

// ---------- Hábitos personalizados ----------
function HabitsWidget() {
  const { settings, update, toast, setUpgradeOpen } = useApp()
  const { isPro } = useData()
  const [draft, setDraft] = useState('')
  const habits = settings.habits || []
  const log = settings.habitLog || {}

  const addHabit = () => {
    const name = draft.trim()
    if (!name) return
    if (!BETA_FREE && !isPro && habits.length >= 3) {
      return setUpgradeOpen('El plan Gratis incluye 3 hábitos — pasa a Pro para crear ilimitados.')
    }
    update({ habits: [...habits, { id: uid(), name, color: HABIT_COLORS[habits.length % HABIT_COLORS.length] }] })
    setDraft('')
    toast({ type: 'success', title: 'Hábito creado', desc: name })
  }
  const removeHabit = (id) => update({ habits: habits.filter((h) => h.id !== id) })
  const toggle = (id) => update({ habitLog: toggleHabitLog(log, id) })

  return (
    <Card className="animate-fade-up" style={{ animationDelay: '140ms' }}>
      <CardHeader title="Hábitos" subtitle={habits.length ? 'Constancia diaria' : 'Crea el primero'} icon={Flame} />
      <CardBody className="space-y-1 pt-2">
        {habits.map((h) => {
          const done = habitDoneOn(log, tISO(), h.id)
          const streak = habitStreak(log, h.id)
          return (
            <div key={h.id} className="group flex items-center gap-3 rounded-lg px-2 py-1.5 transition-colors hover:bg-surface-2">
              <button
                onClick={() => toggle(h.id)}
                aria-label={h.name}
                className={cx(
                  'grid h-7 w-7 shrink-0 place-items-center rounded-full border-2 transition-all duration-200',
                  done ? 'scale-100' : 'hover:scale-105'
                )}
                style={{
                  borderColor: `hsl(${h.color})`,
                  background: done ? `hsl(${h.color})` : 'transparent',
                  color: done ? 'white' : 'transparent',
                }}
              >
                <Check size={14} strokeWidth={3} />
              </button>
              <div className="min-w-0 flex-1">
                <p className={cx('truncate text-[13px] font-medium', done ? 'text-ink' : 'text-muted')}>{h.name}</p>
                <div className="mt-1 flex items-center gap-1">
                  {habitWeek(log, h.id).map((d) => (
                    <span
                      key={d.iso}
                      className="h-1.5 w-1.5 rounded-full"
                      style={{ background: d.done ? `hsl(${h.color})` : 'hsl(var(--border))' }}
                    />
                  ))}
                </div>
              </div>
              {streak > 0 && (
                <span className="flex shrink-0 items-center gap-0.5 text-2xs font-semibold tabular text-warning">
                  <Flame size={12} /> {streak}
                </span>
              )}
              <button
                onClick={() => removeHabit(h.id)}
                className="grid h-6 w-6 shrink-0 place-items-center rounded text-subtle opacity-0 transition-all hover:bg-danger/12 hover:text-danger group-hover:opacity-100"
                aria-label="Eliminar hábito"
              >
                <X size={12} />
              </button>
            </div>
          )
        })}
        <div className="flex gap-2 pt-1">
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addHabit()}
            placeholder={habits.length ? 'Nuevo hábito…' : 'Leer 20 min, meditar, alemán…'}
            className="h-9 w-full rounded-lg border border-line bg-surface-2 px-3 text-[13px] text-ink placeholder:text-subtle focus:border-accent/50 focus:outline-none"
          />
          <Button variant="soft" size="sm" icon={Plus} className="h-9 shrink-0" onClick={addHabit}>Añadir</Button>
        </div>
      </CardBody>
    </Card>
  )
}

// Aviso discreto de copia de seguridad (>30 días; posponer = 14 días)
function BackupNag() {
  const { settings, navigate } = useApp()
  const { demo, tasks, movements } = useData()
  const [snoozed, setSnoozed] = useState(() => localStorage.getItem('summa:backup-nag'))
  const hasData = tasks.length > 0 || movements.length > 0
  if (demo || !hasData || !backupOverdue(settings.lastBackupAt, snoozed)) return null
  return (
    <div className="mb-4 flex items-center gap-2 rounded-lg border border-line bg-surface-2/50 px-3 py-2 text-2xs text-muted animate-fade-in">
      <Download size={12} className="shrink-0 text-subtle" />
      <span className="min-w-0 truncate">
        {settings.lastBackupAt ? 'Hace más de 30 días de tu última copia de seguridad.' : 'Aún no tienes ninguna copia de seguridad.'}
      </span>
      <button onClick={() => navigate('ajustes')} className="shrink-0 font-semibold text-accent hover:underline">
        Exportar
      </button>
      <button
        onClick={() => {
          const now = new Date().toISOString()
          localStorage.setItem('summa:backup-nag', now)
          setSnoozed(now)
        }}
        aria-label="Posponer aviso"
        className="ml-auto shrink-0 text-subtle hover:text-ink"
      >
        <X size={12} />
      </button>
    </div>
  )
}

export default function Inicio() {
  const { settings, navigate, setQuickAdd, toast, focus, startFocus, setReviewOpen } = useApp()
  const { tasks, events, goals, movements, holdings, workouts, add, remove } = useData()

  const todays = tasks.filter((t) => (taskToday(t) || taskOverdue(t)) && t.status !== 'done')
  const doneToday = tasks.filter((t) => taskToday(t) && t.status === 'done')
  const pending = todays.length
  const totalToday = todays.length + doneToday.length
  const focusTask = todays.find((t) => t.priority === 'alta') || todays[0]

  const thisMonth = monthOf(todayISO())
  const balance = movements.filter((m) => monthOf(m.date) === thisMonth).reduce((a, m) => a + Number(m.amount), 0)
  const patrimonio = holdings.reduce((a, h) => a + (h.kind === 'liability' ? -Number(h.value) : Number(h.value)), 0)

  const todayWorkout = workouts.find((w) => String(w.date).slice(0, 10) === todayISO())
  const entrenoHoy = Boolean(todayWorkout)
  const toggleEntreno = () => {
    if (todayWorkout) remove('workouts', todayWorkout.id)
    else add('workouts', { name: 'Entreno', date: todayISO(), dur: 0, exercises: [] })
  }

  // Agenda de HOY (incluye eventos de varios días que pasan por hoy)
  const hoy = todayISO()
  const agenda = events
    .filter((e) => {
      const start = String(e.date || '').slice(0, 10)
      if (!start) return false
      const end = e.duration === 'dias' && e.end_date ? String(e.end_date).slice(0, 10) : start
      return start <= hoy && hoy <= end
    })
    .sort((a, b) => String(a.time || '99').localeCompare(String(b.time || '99')))
    .slice(0, 4)

  const homeGoals = goals.slice(0, 3)

  // Bloques del Inicio configurables (Ajustes → Inicio a tu medida)
  const showW = (id) => !(settings.homeWidgets || []).find((w) => w.id === id)?.hidden
  const wOrder = (id) => {
    const i = (settings.homeWidgets || []).findIndex((w) => w.id === id)
    return i === -1 ? 99 : i
  }

  const isSunday = new Date().getDay() === 0
  const quickHidden = (id) => Boolean((settings.quickActions || []).find((q) => q.id === id)?.hidden)
  const QUICK = [
    { id: 'task', label: 'Nueva tarea', icon: Plus, run: () => setQuickAdd(true) },
    { id: 'expense', label: 'Registrar gasto', icon: Receipt, run: () => navigate('finanzas') },
    { id: 'journal', label: 'Anotar en diario', icon: PenLine, run: () => navigate('diario') },
    { id: 'workout', label: 'Nuevo entreno', icon: Dumbbell, run: () => navigate('deporte') },
    { id: 'review', label: 'Revisión semanal', icon: CalendarClock, run: () => setReviewOpen(true), pulse: isSunday },
  ].filter((q) => !quickHidden(q.id))

  return (
    <PageContainer>
      {/* Saludo */}
      <div className="mb-6 animate-fade-up">
        <h1 className="font-display text-3xl tracking-tight text-ink sm:text-[34px]">
          {renderGreeting(settings.greeting, settings.name)}
        </h1>
        <p className="mt-1.5 text-sm text-muted">
          {capitalize(longDate())} ·{' '}
          <span className="text-ink">
            {pending > 0 ? (
              <>tienes <span className="font-semibold text-accent">{pending} {pending === 1 ? 'tarea' : 'tareas'}</span> para hoy</>
            ) : totalToday > 0 ? (
              '¡todo hecho por hoy! 🎉'
            ) : (
              'día despejado'
            )}
          </span>
        </p>
        {settings.motto && (
          <p className="mt-2 text-[13px] italic text-subtle">“{settings.motto}”</p>
        )}
      </div>

      <BackupNag />

      {showW('onboarding') && <Onboarding />}

      {/* Accesos rápidos */}
      {showW('quick') && (
      <div className="mb-6 flex flex-wrap gap-2.5 animate-fade-up" style={{ animationDelay: '40ms' }}>
        {QUICK.map((q) => (
          <Button
            key={q.id}
            variant="secondary"
            icon={q.icon}
            onClick={q.run}
            className={cx(
              'transition-all hover:-translate-y-0.5 hover:border-accent/40 hover:text-accent',
              q.pulse && 'border-accent/40 text-accent shadow-glow'
            )}
          >
            {q.label}
          </Button>
        ))}
      </div>
      )}

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
        <div className="space-y-5 lg:col-span-8">
          {/* Enfoque de hoy */}
          {showW('focus') && focusTask && !focus && (
            <Card className="overflow-hidden border-accent/25 bg-accent/[0.04] animate-fade-up" style={{ animationDelay: '60ms' }}>
              <CardBody className="flex items-center gap-4">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-accent/14 text-accent">
                  <Timer size={20} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-2xs font-semibold uppercase tracking-[0.12em] text-accent">Enfoque de hoy</p>
                  <p className="mt-0.5 truncate text-[15px] font-semibold text-ink">{focusTask.title}</p>
                </div>
                <Button variant="primary" size="sm" icon={Play} onClick={() => startFocus(focusTask.title, 25)}>
                  25 min
                </Button>
              </CardBody>
            </Card>
          )}

          {/* Tareas de hoy */}
          {showW('tasks') && (
          <Card elevated className="overflow-hidden animate-fade-up" style={{ animationDelay: '80ms' }}>
            <div className="border-b border-line px-5 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <h2 className="font-display text-lg font-bold text-ink">Tareas de hoy</h2>
                  {totalToday > 0 && (
                    <Badge tone={pending ? 'accent' : 'success'}>
                      {pending ? `${pending} pendientes` : 'Completadas'}
                    </Badge>
                  )}
                </div>
                <Button variant="ghost" size="sm" iconRight={ArrowRight} onClick={() => navigate('negocio')}>
                  Ver todas
                </Button>
              </div>
              {totalToday > 0 && (
                <div className="mt-3 flex items-center gap-3">
                  <ProgressBar value={(doneToday.length / totalToday) * 100} size="sm" className="flex-1" />
                  <span className="text-2xs font-semibold tabular text-subtle">
                    {doneToday.length}/{totalToday} hechas
                  </span>
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
                  {doneToday.length > 0 && settings.doneBehavior !== 'ocultar' && (
                    <div className="mt-1 space-y-0.5 border-t border-line pt-1">
                      {doneToday.map((t) => (
                        <TaskRow key={t.id} task={t} compact />
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <EmptyState
                  icon={Check}
                  title="Nada pendiente para hoy"
                  desc="Crea una tarea o disfruta del día despejado."
                  action={
                    <Button variant="primary" size="sm" icon={Plus} onClick={() => setQuickAdd(true)}>
                      Nueva tarea
                    </Button>
                  }
                  compact
                />
              )}
              <button
                onClick={() => setQuickAdd(true)}
                className="mt-1 flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-line py-2.5 text-[13px] font-medium text-muted transition-colors hover:border-accent/40 hover:bg-surface-2 hover:text-ink"
              >
                <Plus size={16} /> Añadir tarea
              </button>
            </div>
          </Card>
          )}
        </div>

        {/* Rail derecho: los bloques respetan el orden elegido en Ajustes */}
        <div className="space-y-5 lg:col-span-4">
          {[
            {
              id: 'workout',
              el: (
                <Card
                  className={cx(
                    'overflow-hidden animate-fade-up transition-colors duration-300',
                    entrenoHoy && 'border-accent/40 bg-accent/[0.06]'
                  )}
                  style={{ animationDelay: '120ms' }}
                >
                  <CardBody className="flex items-center gap-4">
                    <div
                      className={cx(
                        'grid h-12 w-12 shrink-0 place-items-center rounded-xl transition-all duration-300',
                        entrenoHoy ? 'bg-accent text-accent-fg shadow-glow' : 'bg-surface-2 text-muted'
                      )}
                    >
                      <span key={String(entrenoHoy)} className="animate-scale-in">
                        {entrenoHoy ? <Check size={22} strokeWidth={2.6} /> : <Dumbbell size={22} />}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-ink">Entreno de hoy</p>
                      <p className="mt-0.5 text-[13px] text-muted">
                        {entrenoHoy ? 'Completado · ¡bien hecho!' : 'Aún sin marcar'}
                      </p>
                    </div>
                    <Switch checked={entrenoHoy} onChange={toggleEntreno} size="lg" />
                  </CardBody>
                </Card>
              ),
            },
            { id: 'habits', el: <HabitsWidget /> },
            {
              id: 'agenda',
              el: (
                <Card className="animate-fade-up" style={{ animationDelay: '160ms' }}>
                  <CardHeader
                    title="Agenda de hoy"
                    icon={CalendarClock}
                    action={<Button variant="ghost" size="icon-sm" icon={ChevronRight} onClick={() => navigate('calendario')} />}
                  />
                  <CardBody className="space-y-1 pt-2">
                    {agenda.length ? (
                      agenda.map((e) => (
                        <div key={e.id} className="flex items-center gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-surface-2">
                          <div className="w-12 shrink-0 text-sm font-semibold tabular text-ink">{fmtTime(e.time) || '—'}</div>
                          <span className="h-8 w-0.5 rounded-full" style={{ background: `hsl(${e.color})` }} />
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium text-ink">{e.title}</p>
                            {e.sub && <p className="truncate text-2xs text-subtle">{e.sub}</p>}
                          </div>
                        </div>
                      ))
                    ) : (
                      <EmptyState icon={CalendarClock} title="Hoy sin eventos" compact />
                    )}
                  </CardBody>
                </Card>
              ),
            },
            {
              id: 'goals',
              el: (
                <Card className="animate-fade-up" style={{ animationDelay: '200ms' }}>
                  <CardHeader
                    title="Metas"
                    icon={Target}
                    action={<Button variant="ghost" size="icon-sm" icon={ChevronRight} onClick={() => navigate('metas')} />}
                  />
                  <CardBody className={cx('pt-2', settings.goalStyle === 'anillo' ? 'flex flex-wrap gap-4' : 'space-y-4')}>
                    {homeGoals.length ? (
                      homeGoals.map((g) => {
                        const p = goalPct(g)
                        if (settings.goalStyle === 'anillo') {
                          return (
                            <div key={g.id} className="flex min-w-0 flex-1 flex-col items-center gap-1.5 text-center">
                              <ProgressRing value={p} size={64} />
                              <span className="w-full truncate text-2xs font-medium text-muted">{g.title}</span>
                            </div>
                          )
                        }
                        return (
                          <div key={g.id}>
                            <div className="mb-1.5 flex items-center justify-between">
                              <span className="text-[13px] font-medium text-ink">{g.title}</span>
                              <span className={cx('font-semibold tabular', settings.goalStyle === 'numero' ? 'text-lg text-ink' : 'text-2xs text-muted')}>{p}%</span>
                            </div>
                            {settings.goalStyle !== 'numero' && <ProgressBar value={p} size="sm" />}
                          </div>
                        )
                      })
                    ) : (
                      <EmptyState icon={Target} title="Define tus metas" desc="Marca el norte por áreas." compact />
                    )}
                  </CardBody>
                </Card>
              ),
            },
          ]
            .filter((b) => showW(b.id))
            .sort((a, b) => wOrder(a.id) - wOrder(b.id))
            .map((b) => (
              <div key={b.id}>{b.el}</div>
            ))}
        </div>
      </div>

      {/* Franja financiera */}
      {showW('finance') && (
      <div
        className="mt-6 flex flex-wrap items-center gap-x-8 gap-y-2 rounded-xl border border-line bg-surface/50 px-5 py-3.5 text-[13px] animate-fade-up"
        style={{ animationDelay: '240ms' }}
      >
        <div className="flex items-center gap-2">
          <Wallet size={15} className="text-subtle" />
          <span className="text-subtle">Balance del mes</span>
          <span className={cx('font-semibold tabular', balance >= 0 ? 'text-success' : 'text-danger')}>
            {signedEur(balance)}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <TrendingUp size={15} className="text-subtle" />
          <span className="text-subtle">Patrimonio neto</span>
          <span className="font-semibold tabular text-ink">{eur(patrimonio)}</span>
        </div>
        {Number(settings.salary) > 0 && (
          <div className="hidden items-center gap-2 sm:flex">
            <Banknote size={15} className="text-subtle" />
            <span className="text-subtle">Nómina</span>
            <span className="font-semibold tabular text-ink">{eur(Number(settings.salary))}</span>
          </div>
        )}
        <button
          onClick={() => navigate('finanzas')}
          className="ml-auto inline-flex items-center gap-1 text-muted transition-colors hover:text-accent"
        >
          Ver finanzas <ArrowRight size={14} />
        </button>
      </div>
      )}
    </PageContainer>
  )
}
