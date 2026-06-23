import {
  Plus,
  Receipt,
  PenLine,
  Dumbbell,
  ArrowRight,
  Flame,
  Check,
  ChevronRight,
  Wallet,
  TrendingUp,
  CircleDot,
} from 'lucide-react'
import { useApp } from '../context/AppContext'
import { EVENTS, GOALS, FINANCE } from '../lib/data'
import { PageContainer } from '../components/layout/Page'
import { TaskRow } from '../components/app/TaskRow'
import {
  Card,
  CardHeader,
  CardBody,
  Button,
  Badge,
  ProgressBar,
  Switch,
  Dot,
  SectionTitle,
} from '../components/ui'
import { saludo, longDate, signedEur, eur, clamp, cx, capitalize } from '../lib/utils'

function goalPct(g) {
  if (g.type === 'percent') return g.value
  if (g.invert) return clamp(Math.round((g.target / g.value) * 100), 0, 100)
  return clamp(Math.round((g.value / g.target) * 100), 0, 100)
}

const QUICK = [
  { id: 'task', label: 'Nueva tarea', icon: Plus },
  { id: 'expense', label: 'Registrar gasto', icon: Receipt },
  { id: 'journal', label: 'Anotar en diario', icon: PenLine },
  { id: 'workout', label: 'Nuevo entreno', icon: Dumbbell },
]

export default function Inicio() {
  const { settings, tasks, navigate, setQuickAdd, entrenoHoy, setEntrenoHoy, toast } = useApp()

  const todays = tasks.filter((t) => (t.today || t.overdue) && t.status !== 'done')
  const doneToday = tasks.filter((t) => t.today && t.status === 'done')
  const pending = todays.length
  const totalToday = todays.length + doneToday.length

  const onQuick = (id) => {
    if (id === 'task') return setQuickAdd(true)
    if (id === 'expense') {
      navigate('finanzas')
      toast({ type: 'success', title: 'Vamos a Finanzas', desc: 'Registra tu gasto aquí.' })
    }
    if (id === 'journal') navigate('diario')
    if (id === 'workout') navigate('deporte')
  }

  const homeGoals = GOALS.filter((g) => ['g1', 'g3', 'g6'].includes(g.id))

  return (
    <PageContainer>
      {/* Saludo */}
      <div className="mb-6 animate-fade-up">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <h1 className="font-display text-3xl font-bold tracking-tight text-ink sm:text-[34px]">
            {saludo()}, {settings.name}.
          </h1>
          <span className="hidden text-2xl sm:inline">👋</span>
        </div>
        <p className="mt-1.5 text-sm text-muted">
          {capitalize(longDate())} ·{' '}
          <span className="text-ink">
            {pending > 0 ? (
              <>
                tienes <span className="font-semibold text-accent">{pending} tareas</span> para hoy
              </>
            ) : (
              '¡todo hecho por hoy! 🎉'
            )}
          </span>
        </p>
        <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-line bg-surface/60 py-1 pl-2.5 pr-3 text-[13px]">
          <span className="grid h-4 w-4 place-items-center rounded-full bg-accent/15">
            <span className="h-1.5 w-1.5 rounded-full bg-accent" />
          </span>
          <span className="text-subtle">Enfoque de hoy</span>
          <span className="font-medium text-ink">Cerrar Alpha · activación del SaaS</span>
        </div>
      </div>

      {/* Accesos rápidos */}
      <div className="mb-6 flex flex-wrap gap-2.5 animate-fade-up" style={{ animationDelay: '40ms' }}>
        {QUICK.map((q) => (
          <Button
            key={q.id}
            variant="secondary"
            icon={q.icon}
            onClick={() => onQuick(q.id)}
            className="transition-all hover:-translate-y-0.5 hover:border-accent/40 hover:text-accent"
          >
            {q.label}
          </Button>
        ))}
      </div>

      {/* Rejilla principal */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
        {/* Tareas de hoy — protagonista */}
        <div className="lg:col-span-8">
          <Card elevated className="overflow-hidden animate-fade-up" style={{ animationDelay: '80ms' }}>
            <div className="border-b border-line px-5 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <h2 className="font-display text-lg font-bold text-ink">Tareas de hoy</h2>
                  <Badge tone={pending ? 'accent' : 'success'}>
                    {pending ? `${pending} pendientes` : 'Completadas'}
                  </Badge>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  iconRight={ArrowRight}
                  onClick={() => navigate('negocio')}
                >
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
              {todays.length > 0 ? (
                <div className="space-y-0.5">
                  {todays.map((t, i) => (
                    <div key={t.id} className="animate-fade-up" style={{ animationDelay: `${100 + i * 45}ms` }}>
                      <TaskRow task={t} />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="px-3 py-8 text-center">
                  <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-2xl bg-success/12 text-success">
                    <Check size={24} strokeWidth={2.5} />
                  </div>
                  <p className="text-sm font-semibold text-ink">Bandeja de hoy a cero</p>
                  <p className="mt-1 text-[13px] text-muted">Disfruta el momento o adelanta trabajo.</p>
                </div>
              )}

              {doneToday.length > 0 && (
                <div className="mt-1 space-y-0.5 border-t border-line pt-1">
                  {doneToday.map((t) => (
                    <TaskRow key={t.id} task={t} compact />
                  ))}
                </div>
              )}

              <button
                onClick={() => setQuickAdd(true)}
                className="mt-1 flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-line py-2.5 text-[13px] font-medium text-muted transition-colors hover:border-accent/40 hover:bg-surface-2 hover:text-ink"
              >
                <Plus size={16} /> Añadir tarea
              </button>
            </div>
          </Card>
        </div>

        {/* Rail derecho */}
        <div className="space-y-5 lg:col-span-4">
          {/* Entreno de hoy */}
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
                <p className="mt-0.5 flex items-center gap-1 text-[13px] text-muted">
                  {entrenoHoy ? (
                    'Completado · ¡bien hecho!'
                  ) : (
                    <>
                      <Flame size={13} className="text-warning" /> Racha de 12 días
                    </>
                  )}
                </p>
              </div>
              <Switch checked={entrenoHoy} onChange={() => setEntrenoHoy((v) => !v)} size="lg" />
            </CardBody>
          </Card>

          {/* Próximos eventos */}
          <Card className="animate-fade-up" style={{ animationDelay: '160ms' }}>
            <CardHeader title="Próximos eventos" icon={CircleDot} />
            <CardBody className="space-y-1 pt-2">
              {EVENTS.slice(0, 4).map((e) => (
                <div
                  key={e.id}
                  className="flex items-center gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-surface-2"
                >
                  <div className="flex w-12 shrink-0 flex-col items-center">
                    <span className="text-sm font-semibold tabular text-ink">{e.time}</span>
                  </div>
                  <span className="h-8 w-0.5 rounded-full" style={{ background: `hsl(${e.color})` }} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-ink">{e.title}</p>
                    <p className="truncate text-2xs text-subtle">{e.sub}</p>
                  </div>
                </div>
              ))}
            </CardBody>
          </Card>

          {/* Metas */}
          <Card className="animate-fade-up" style={{ animationDelay: '200ms' }}>
            <CardHeader
              title="Metas del trimestre"
              icon={CircleDot}
              action={
                <Button variant="ghost" size="icon-sm" icon={ChevronRight} onClick={() => navigate('metas')} />
              }
            />
            <CardBody className="space-y-4 pt-2">
              {homeGoals.map((g) => {
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
              })}
            </CardBody>
          </Card>
        </div>
      </div>

      {/* Franja financiera discreta */}
      <div
        className="mt-6 flex flex-wrap items-center gap-x-8 gap-y-2 rounded-xl border border-line bg-surface/50 px-5 py-3.5 text-[13px] animate-fade-up"
        style={{ animationDelay: '240ms' }}
      >
        <div className="flex items-center gap-2">
          <Wallet size={15} className="text-subtle" />
          <span className="text-subtle">Balance del mes</span>
          <span className="font-semibold tabular text-success">{signedEur(FINANCE.kpis.balanceMes)}</span>
        </div>
        <div className="flex items-center gap-2">
          <TrendingUp size={15} className="text-subtle" />
          <span className="text-subtle">Patrimonio neto</span>
          <span className="font-semibold tabular text-ink">{eur(FINANCE.kpis.patrimonio)}</span>
        </div>
        <button
          onClick={() => navigate('finanzas')}
          className="ml-auto inline-flex items-center gap-1 text-muted transition-colors hover:text-accent"
        >
          Ver finanzas <ArrowRight size={14} />
        </button>
      </div>
    </PageContainer>
  )
}
